import yaml
from pathlib import Path

manifest_yaml_path = Path("tools/voice_manifest.yaml")
extracted_yaml_path = Path("tools/extracted_grades_2_6.yaml")

if not manifest_yaml_path.exists() or not extracted_yaml_path.exists():
    print("Files not found.")
    exit(1)

with open(manifest_yaml_path, "r", encoding="utf-8") as f:
    manifest = yaml.safe_load(f)

with open(extracted_yaml_path, "r", encoding="utf-8") as f:
    extracted = yaml.safe_load(f)

# Merge keys
for key, val in extracted.items():
    manifest[key] = val

with open(manifest_yaml_path, "w", encoding="utf-8") as f:
    yaml.dump(manifest, f, allow_unicode=True, sort_keys=False)

print("Successfully merged Grade 2-6 entries into tools/voice_manifest.yaml")
