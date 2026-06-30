/**
 * MathAdventure 语音播放引擎 (双引擎架构)
 * 路径: src/core/voicePlayer.js
 *
 * 功能:
 * 1. 优先播放预录制的精品音效/语音 (.mp3 或 .wav)
 * 2. 预录制音频不存在或播放失败时，使用 Web Speech API (SpeechSynthesis) 进行兜底播报
 * 3. 完美处理动态文本 (含有数学表达式) 的实时合成
 * 4. 支持全局静音/开启控制，状态持久化到 localStorage
 */
window.VoicePlayer = (function () {
    let manifest = {};
    let isInitialized = false;
    let currentAudio = null;
    let currentUtterance = null;
    let enabled = true;

    // 从 localStorage 读取状态
    try {
        const stored = localStorage.getItem('math_adventure_voice_enabled');
        if (stored !== null) {
            enabled = stored === 'true';
        } else {
            enabled = true; // 默认开启
        }
    } catch (e) {
        console.warn("[VoicePlayer] 无法读取 localStorage", e);
    }

    /** 初始化：加载音频映射表 */
    async function init() {
        if (isInitialized) return;
        try {
            const response = await fetch('./assets/sounds/voice/manifest.json');
            if (response.ok) {
                manifest = await response.json();
                const keyCount = manifest.keys ? Object.keys(manifest.keys).length : 0;
                console.log("[VoicePlayer] 语音清单加载成功，共有", keyCount, "条配音");
            } else {
                console.warn("[VoicePlayer] 未能加载语音清单，将全部采用 Web Speech API 实时合成");
            }
        } catch (e) {
            console.warn("[VoicePlayer] 加载语音清单异常，将全部采用 Web Speech API 实时合成", e);
        }
        isInitialized = true;
        updateUI();
    }

    /** 停止所有正在播报的语音 */
    function stop() {
        // 停止 HTML Audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        // 停止 Web Speech API
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        currentUtterance = null;
    }

    /** 播放预录制好的音频 */
    function playAudio(audioPath) {
        return new Promise((resolve) => {
            stop();
            if (!enabled) {
                resolve();
                return;
            }

            const audioUrl = `./assets/sounds/voice/${audioPath}`;
            const audio = new Audio(audioUrl);
            currentAudio = audio;

            audio.onended = () => {
                if (currentAudio === audio) currentAudio = null;
                resolve();
            };

            audio.onerror = (e) => {
                console.warn(`[VoicePlayer] 播放录音失败: ${audioUrl}, 将尝试文字合成兜底`, e);
                if (currentAudio === audio) currentAudio = null;
                resolve(false); // 返回 false 表示播放失败，以便外层进行兜底
            };

            audio.play().catch(err => {
                console.warn("[VoicePlayer] 播放被拦截，需要用户点击页面激活", err);
                resolve(false);
            });
        });
    }

    /** 使用浏览器 SpeechSynthesis 合成播报文字 */
    function speakText(text) {
        return new Promise((resolve) => {
            stop();
            if (!enabled || !text) {
                resolve();
                return;
            }

            if (!window.speechSynthesis) {
                console.warn("[VoicePlayer] 浏览器不支持 SpeechSynthesis");
                resolve();
                return;
            }

            // 清理一些不利于朗读的符号，比如 💰, ❌, ✅，但保留 + - = ? 等数学符号并转化为朗读友好的词语
            let speechText = text
                .replace(/💰/g, '金币')
                .replace(/❌/g, '')
                .replace(/✅/g, '')
                .replace(/÷/g, '除以')
                .replace(/×/g, '乘以')
                .replace(/\+/g, '加')
                .replace(/-/g, '减')
                .replace(/=/g, '等于')
                .replace(/\?/g, '是多少')
                .replace(/💎/g, '宝石')
                .replace(/⭐/g, '颗星');

            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.85;  // 稍微慢一点，契合小学生的理解节奏
            utterance.pitch = 1.15; // 稍微高一点，语调更活泼

            // 尽可能选择中文女声
            const voices = window.speechSynthesis.getVoices();
            const zhVoice = voices.find(v => v.lang.includes('ZH') || v.lang.includes('zh')) 
                         || voices.find(v => v.name.includes('Google') && v.lang.startsWith('zh'));
            if (zhVoice) {
                utterance.voice = zhVoice;
            }

            currentUtterance = utterance;

            utterance.onend = () => {
                if (currentUtterance === utterance) currentUtterance = null;
                resolve();
            };

            utterance.onerror = (e) => {
                console.warn("[VoicePlayer] 语音合成出错", e);
                if (currentUtterance === utterance) currentUtterance = null;
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    }

    /**
     * 智能语音接口：优先播放预录制，不存在则进行实时合成
     * @param {string} keyOrText  可以是清单里的 audio_id，也可以是普通的需要朗读的文本
     */
    async function play(keyOrText) {
        if (!isInitialized) {
            await init();
        }

        if (!enabled) return;

        let audioPath = null;
        if (manifest.keys && manifest.keys[keyOrText]) {
            audioPath = manifest.keys[keyOrText];
        } else {
            // 清理可能的前缀（如 "🔊 ", "🔍 " 等）后再进行匹配
            const cleanText = typeof keyOrText === 'string' 
                ? keyOrText.replace(/^[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}🧙🔍💰❌✅✨⏱⚡📏📐✖➗🔘🧭🛒⏰👗📊📈🏆🌈]\s*/u, '').replace(/^🔊\s*/, '').trim()
                : keyOrText;
            
            if (manifest.texts && manifest.texts[cleanText]) {
                audioPath = manifest.texts[cleanText];
            }
        }

        // 1. 如果找到了对应的预录制音频路径，尝试播放它
        if (audioPath) {
            const success = await playAudio(audioPath);
            if (success !== false) {
                return; // 播放录音成功，直接返回
            }
            // 如果返回 false，说明录音文件丢失或加载错误，走下方的兜底
        }

        // 2. 没有对应录音，或者录音播放失败，直接把 keyOrText 作为文字合成播报
        await speakText(keyOrText);
    }

    /** 切换语音开关状态 */
    function toggle() {
        enabled = !enabled;
        try {
            localStorage.setItem('math_adventure_voice_enabled', enabled);
        } catch (e) {}
        
        if (!enabled) {
            stop();
        }
        updateUI();
        console.log("[VoicePlayer] 语音状态切换为:", enabled ? "开启" : "关闭");
        return enabled;
    }

    /** 更新 UI 开关状态（如果页面中有开关按钮） */
    function updateUI() {
        const btn = document.getElementById('voice-toggle-btn');
        if (btn) {
            btn.innerHTML = enabled ? `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                语音开
            ` : `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
                语音关
            `;
            btn.style.borderColor = enabled ? 'var(--secondary-color)' : '#cbd5e1';
            btn.style.color = enabled ? 'var(--secondary-color)' : '#64748b';
            btn.style.background = enabled ? '#eff6ff' : '#f8fafc';
        }
    }

    // 默认在页面加载完后自动初始化一次
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            init().then(() => {
                const btn = document.getElementById('voice-toggle-btn');
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        toggle();
                    };
                }
            });
            // 在 Chrome 里因为安全策略，SpeechSynthesis.getVoices() 首次获取可能为空，需要监听改变事件
            if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => {};
            }
        });
    }

    return {
        init,
        play,
        speak: speakText,
        stop,
        toggle,
        isEnabled: () => enabled,
        updateUI
    };
})();
