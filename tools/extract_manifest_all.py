import os
import re
from pathlib import Path
import yaml

# Path to MathAdventure
GAME_DIR = Path("d:/AI/数学闯关游戏/MathAdventure")

def clean_text(text: str) -> str:
    # Remove leading icons/emojis (like 🔊, 🔍, ⚖️, 📏, 📊, 📖, ✏️, 🧮, ⏱️, ⚡, 🧭, ➗, ✖️, 🔷, 🌀, 🔺, 🍕, 💯, ⭕, 🏷️, 🌡️, 🚪, 🔭, 🏰)
    text = re.sub(r'^[🔊🔍⚖️📏📊📖✏️🧮⏱️⚡🧭➗✖️🔷🌀🔺🍕💯⭕🏷️🌡️🚪🔭🏰🏰⏳🧙]+', '', text)
    return text.strip()

def extract_strings_from_file(file_path: Path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    file_stem = file_path.stem  # e.g., g2_u1_length
    
    # 1. Extract Guide Bar Title
    # Pattern: H.guideBarHTML('...', 'TEXT') or H.guideBarHTML("...", "TEXT") or guideBarHTML(...)
    guide_bar_matches = re.findall(r'(?:H\.)?guideBarHTML\s*\(\s*[\'"][^\'"]+[\'"]\s*,\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
    guide_bar_title = guide_bar_matches[0] if guide_bar_matches else None
    
    # 2. Extract Settlement Subtitle
    # Pattern: H.showSettlement(..., ..., ..., ..., 'SUBTITLE', ...) or showSettlement(...)
    # Let's use a regex that matches showSettlement with at least 5 arguments where 5th is a string literal.
    settlement_matches = re.findall(r'(?:H\.)?showSettlement\s*\(\s*[^,\n]+,\s*[^,\n]+,\s*[^,\n]+,\s*[^,\n]+,\s*[\'"]([^\'"]+)[\'"]\s*,', content)
    settlement_subtitle = settlement_matches[0] if settlement_matches else None
    
    # 3. Extract other static guides and errors
    # Let's find static updateGuide('TEXT') and triggerError(..., 'TEXT')
    # Reject strings with ${ } or dynamic variables
    guide_updates = re.findall(r'(?:H\.)?updateGuide\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
    error_triggers = re.findall(r'(?:H\.)?triggerError\s*\(\s*[^,]+,\s*[\'"]([^\'"]+)[\'"]\s*[,)]', content)
    
    static_guides = [clean_text(g) for g in guide_updates if "${" not in g and g.strip()]
    static_errors = [clean_text(e) for e in error_triggers if "${" not in e and e.strip()]
    
    # Keep only unique ones
    static_guides = list(dict.fromkeys(static_guides))
    static_errors = list(dict.fromkeys(static_errors))
    
    # Clean the title and subtitle
    clean_title = clean_text(guide_bar_title) if guide_bar_title else None
    clean_sub = clean_text(settlement_subtitle) if settlement_subtitle else None
    
    return {
        "file_stem": file_stem,
        "title": clean_title,
        "subtitle": clean_sub,
        "static_guides": static_guides,
        "static_errors": static_errors
    }

def main():
    grades = ["grade2", "grade3", "grade4", "grade5", "grade6"]
    
    manifest_sections = {}
    
    for grade in grades:
        grade_dir = GAME_DIR / "src/games" / grade
        if not grade_dir.exists():
            continue
        
        # We split into grade-specific sections in the manifest
        # Grade 2 -> g2, Grade 3 -> g3, etc.
        section_name = f"g{grade[-1]}"
        manifest_sections[section_name] = []
        
        # Sort files to keep them clean
        js_files = sorted(list(grade_dir.glob("*.js")), key=lambda p: p.name)
        
        for js_file in js_files:
            try:
                res = extract_strings_from_file(js_file)
                stem = res["file_stem"]
                
                # Check if we have anything to add
                entries = []
                
                # 1. Guide bar title
                if res["title"]:
                    entries.append({
                        "audio_id": f"{stem}_guide_init",
                        "text": res["title"],
                        "role": "guide"
                    })
                
                # 2. Additional static guides
                for idx, guide_text in enumerate(res["static_guides"], 1):
                    # Skip if it is identical to title
                    if guide_text == res["title"]:
                        continue
                    entries.append({
                        "audio_id": f"{stem}_guide_step{idx}",
                        "text": guide_text,
                        "role": "guide"
                    })
                
                # 3. Static errors
                for idx, error_text in enumerate(res["static_errors"], 1):
                    entries.append({
                        "audio_id": f"{stem}_error_{idx}",
                        "text": error_text,
                        "role": "guide"
                    })
                
                # 4. Settlement title
                # We can generate a default settlement title per game if showSettlement is called
                # Wait, showSettlement title is dynamic in gameHelpers.js: '完美通关！', '闯关成功！', '勉强通过！'
                # But some games pass a title, let's see. In modern modules, the title is dynamic.
                # So we only need the subtitle!
                if res["subtitle"]:
                    entries.append({
                        "audio_id": f"{stem}_settlement_subtitle",
                        "text": res["subtitle"],
                        "role": "announce"
                    })
                
                if entries:
                    manifest_sections[section_name].extend(entries)
                    
            except Exception as e:
                print(f"Error processing {js_file}: {e}")

    # Output manifest to a YAML file to inspect
    output_path = GAME_DIR / "tools/extracted_grades_2_6.yaml"
    with open(output_path, "w", encoding="utf-8") as f:
        yaml.dump(manifest_sections, f, allow_unicode=True, sort_keys=False)
        
    print(f"Successfully extracted manifest to {output_path}")

if __name__ == "__main__":
    main()
