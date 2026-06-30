/**
 * 游戏共享工具模块
 * 路径: src/games/common/gameHelpers.js
 *
 * 所有游戏模块通过 window.GameHelpers 访问
 * 需在 stateManager.js 之后、游戏模块之前加载
 */
window.GameHelpers = (function () {

    // ========== 工具函数 ==========

    /** 闭区间随机整数 */
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Fisher-Yates 洗牌（返回新数组） */
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** 延时 Promise */
    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // ========== 样式注入 ==========

    /**
     * 注入 <style>（同 ID 去重）
     * @param {string} styleId  唯一 ID
     * @param {string} cssText  CSS 内容
     */
    function injectStyles(styleId, cssText) {
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    /** 结算面板公共 CSS（注入一次，所有游戏共享） */
    let _settlementCssInjected = false;
    function ensureSettlementCSS() {
        if (_settlementCssInjected) return;
        _settlementCssInjected = true;
        injectStyles('gh-settlement-css', `
            .gh-settlement {
                position: absolute; inset: 0;
                background: rgba(255,255,255,0.95);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                z-index: 100; backdrop-filter: blur(10px);
            }
            .gh-result-card {
                background: white; padding: 50px; border-radius: 40px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                text-align: center; border: 6px solid #10b981;
                animation: gh-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
            }
            @keyframes gh-pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
            .gh-stars { font-size: 48px; margin: 15px 0; letter-spacing: 8px; }
            .gh-btn-group { display: flex; gap: 20px; margin-top: 40px; }
            .gh-btn {
                padding: 18px 40px; font-size: 22px; border: none;
                border-radius: 20px; cursor: pointer; font-weight: bold;
                transition: all 0.2s;
            }
            .gh-btn:hover { transform: scale(1.05); }
            .gh-btn-primary { background: #10b981; color: white; }
            .gh-btn-secondary { background: #64748b; color: white; }
            .gh-tooltip {
                position: absolute; background: #ef4444; color: white;
                padding: 10px 20px; border-radius: 15px; font-weight: bold;
                z-index: 60; box-shadow: 0 4px 10px rgba(239,68,68,0.3);
                animation: gh-fadeUp 2s forwards;
            }
            @keyframes gh-fadeUp { 0%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-20px)} }
        `);
    }

    // ========== UI 模板 ==========

    /**
     * 顶部引导栏 HTML
     * @param {string} sprite  emoji 精灵
     * @param {string} text    引导文本
     * @param {string} [id]    文本元素 ID（默认 'gh-guide-text'）
     */
    function guideBarHTML(sprite, text, id) {
        id = id || 'gh-guide-text';
        return `
            <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);
                background:rgba(255,255,255,0.9);padding:10px 40px;border-radius:40px;
                box-shadow:0 4px 15px rgba(0,0,0,0.1);font-size:22px;font-weight:bold;
                color:#065f46;z-index:50;display:flex;align-items:center;gap:15px;
                border:3px solid #10b981;">
                <span style="font-size:30px;animation:gh-float 2s infinite ease-in-out;">${sprite}</span>
                <span id="${id}">${text}</span>
            </div>
            <style>@keyframes gh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}</style>
        `;
    }

    /**
     * 更新引导文本
     * @param {string} text     新文本
     * @param {string} [id]     文本元素 ID（默认 'gh-guide-text'）
     */
    function updateGuide(text, id) {
        id = id || 'gh-guide-text';
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * 错误提示浮层
     * @param {HTMLElement} container  游戏容器
     * @param {string}      msg        提示消息
     * @param {HTMLElement}  element   触发元素（用于定位）
     */
    function triggerError(container, msg, element) {
        ensureSettlementCSS();
        const cRect = container.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const tip = document.createElement('div');
        tip.className = 'gh-tooltip';
        tip.textContent = '❌ ' + msg;
        tip.style.left = (rect.left - cRect.left + rect.width / 2 - 100) + 'px';
        tip.style.top = (rect.top - cRect.top - 50) + 'px';
        container.appendChild(tip);
        setTimeout(() => tip.remove(), 2000);
    }

    /**
     * 星级评定
     * @param {number} mistakes  错误次数
     * @returns {number} 1-3 星
     */
    function calcStars(mistakes) {
        if (mistakes === 0) return 3;
        if (mistakes <= 2) return 2;
        return 1;
    }

    /**
     * 完成关卡：奖励 + 熟练度 + 解锁下一关
     * @param {object} levelData  关卡数据
     * @param {number} mistakes   错误次数
     * @param {string} [nextId]   下一关 ID（可选，不传则不自动解锁）
     */
    function onComplete(levelData, mistakes, nextId) {
        const gm = window.GameManager;
        if (!gm) return;

        const stars = calcStars(mistakes);
        const masteryBonus = mistakes === 0 ? 15 : mistakes <= 2 ? 10 : 5;

        gm.addCoins(levelData.reward || 10);
        gm.updateMastery(levelData.knowledgePoint, masteryBonus);

        // 记录星级
        if (gm.updateRecord) {
            gm.updateRecord(levelData.levelId, stars);
        }

        if (nextId) {
            gm.unlockLevel(nextId);
        }

        return stars;
    }

    /**
     * 显示结算面板
     * @param {HTMLElement} container   游戏容器
     * @param {number}      reward      金币奖励
     * @param {object}      levelData   关卡数据
     * @param {number}      mistakes    错误次数
     * @param {string}      [subtitle]  副标题
     * @param {string}      [nextId]    下一关 ID
     */
    function showSettlement(container, reward, levelData, mistakes, subtitle, nextId) {
        ensureSettlementCSS();
        const stars = onComplete(levelData, mistakes, nextId);
        const starsStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        const titleText = stars === 3 ? '完美通关！' : stars === 2 ? '闯关成功！' : '勉强通过！';

        const overlay = document.createElement('div');
        overlay.className = 'gh-settlement';
        overlay.innerHTML = `
            <div class="gh-result-card">
                <div style="font-size:70px;">🌈</div>
                <h2 style="font-size:40px;color:#065f46;margin:15px 0;">${titleText}</h2>
                <div class="gh-stars">${starsStr}</div>
                <p style="font-size:22px;color:#64748b;">${subtitle || '你完成得很棒！'}</p>
                <div style="margin-top:25px;font-weight:bold;color:#fbbf24;font-size:28px;">
                    奖励：💰 ${reward || 10}
                </div>
                <div class="gh-btn-group">
                    <button class="gh-btn gh-btn-primary" id="gh-btn-restart">再玩一次</button>
                    <button class="gh-btn gh-btn-secondary" id="gh-btn-exit">返回地图</button>
                </div>
            </div>
        `;
        container.appendChild(overlay);

        overlay.querySelector('#gh-btn-restart').onclick = () => overlay.remove();
        overlay.querySelector('#gh-btn-exit').onclick = () => { window.location.href = 'index.html'; };

        return overlay;
    }

    /**
     * 通用选择题按钮组
     * @param {string[]}    options     选项文本数组
     * @param {string}      containerId 容器 ID
     * @param {function}    onChoose    回调 (index, text) => void
     * @param {string}      [btnClass]  按钮额外 class
     */
    function renderChoices(options, containerId, onChoose, btnClass) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = options.map((opt, i) =>
            `<button class="gh-choice-btn ${btnClass || ''}" data-idx="${i}"
                style="padding:15px 40px;background:white;border:3px solid #6366f1;
                border-radius:20px;font-size:24px;font-weight:bold;color:#4338ca;
                cursor:pointer;transition:all 0.2s;">${opt}</button>`
        ).join('');
        // 悬浮效果
        container.querySelectorAll('.gh-choice-btn').forEach(btn => {
            btn.onmouseenter = () => { btn.style.background = '#6366f1'; btn.style.color = 'white'; };
            btn.onmouseleave = () => { btn.style.background = 'white'; btn.style.color = '#4338ca'; };
            btn.onclick = () => onChoose(parseInt(btn.dataset.idx), btn.textContent);
        });
    }

    /**
     * 输入框答案检查
     * @param {string}   inputId     输入框 ID
     * @param {string}   btnId       提交按钮 ID
     * @param {function} checkFn     检查函数 (value) => boolean
     * @param {function} onSuccess   正确回调
     * @param {function} [onFail]    错误回调
     */
    function bindAnswerInput(inputId, btnId, checkFn, onSuccess, onFail) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;

        const check = () => {
            const val = input.value.trim();
            if (val === '') return;
            if (checkFn(val)) {
                onSuccess(val);
            } else {
                if (onFail) onFail(val);
                input.value = '';
                input.style.borderColor = '#f56c6c';
                input.classList.add('shake');
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.classList.remove('shake');
                }, 600);
            }
        };

        btn.onclick = check;
        input.onkeyup = (e) => { if (e.key === 'Enter') check(); };
    }

    // ========== 公开 API ==========

    return {
        // 工具函数
        randInt,
        shuffle,
        delay,

        // 样式
        injectStyles,
        ensureSettlementCSS,

        // UI 模板
        guideBarHTML,
        updateGuide,
        triggerError,
        showSettlement,
        renderChoices,
        bindAnswerInput,

        // 数据
        calcStars,
        onComplete,
    };
})();
