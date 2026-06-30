/**
 * 二年级上册 第五单元：观察物体（一）
 * 路径: src/games/grade2/g2_u5_observe.js
 *
 * "透视大师" — 从不同方向观察物体
 *   Phase 1 "猜猜我在哪": 显示一个3D物体 + 4个视角小图，
 *     高亮某个方向箭头，玩家选出该方向对应的视角。4 轮。
 *   Phase 2 "找出正确视角": 给出物体和描述（如"从前面看"），
 *     玩家从 4 个选项中选出正确的视角。4 轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u5-observe-styles';

    /* ────────── 物体定义 ────────── */
    /* 每个物体定义 4 个方向的 2D 视图描述（用于选择题） */
    const OBJECTS = [
        {
            id: 'gift',
            name: '礼物盒',
            emoji: '🎁',       // 🎁
            color: '#ef4444',
            cssView: {                       // 3D box CSS
                bg: '#ef4444', top: '#f87171', side: '#dc2626'
            },
            views: {
                front:  { shape: 'square', label: '正面' },
                back:   { shape: 'square', label: '背面' },
                left:   { shape: 'rect-v', label: '左面' },
                right:  { shape: 'rect-v', label: '右面' }
            }
        },
        {
            id: 'box',
            name: '快递箱',
            emoji: '📦',        // 📦
            color: '#d97706',
            cssView: {
                bg: '#f59e0b', top: '#fbbf24', side: '#d97706'
            },
            views: {
                front:  { shape: 'rect-h', label: '正面' },
                back:   { shape: 'rect-h', label: '背面' },
                left:   { shape: 'rect-v', label: '左面' },
                right:  { shape: 'rect-v', label: '右面' }
            }
        },
        {
            id: 'ice',
            name: '冰块',
            emoji: '🧊',         // 🧊
            color: '#3b82f6',
            cssView: {
                bg: '#60a5fa', top: '#93c5fd', side: '#3b82f6'
            },
            views: {
                front:  { shape: 'square', label: '正面' },
                back:   { shape: 'square', label: '背面' },
                left:   { shape: 'square', label: '左面' },
                right:  { shape: 'square', label: '右面' }
            }
        },
        {
            id: 'book',
            name: '厚书',
            emoji: '📖',         // 📖
            color: '#059669',
            cssView: {
                bg: '#10b981', top: '#34d399', side: '#047857'
            },
            views: {
                front:  { shape: 'rect-h', label: '正面' },
                back:   { shape: 'rect-h', label: '背面' },
                left:   { shape: 'spine',  label: '左面' },
                right:  { shape: 'spine',  label: '右面' }
            }
        },
        {
            id: 'cup',
            name: '水杯',
            emoji: '☕',               // ☕
            color: '#7c3aed',
            cssView: {
                bg: '#8b5cf6', top: '#a78bfa', side: '#6d28d9'
            },
            views: {
                front:  { shape: 'cylinder', label: '正面' },
                back:   { shape: 'cylinder', label: '背面' },
                left:   { shape: 'cylinder', label: '左面' },
                right:  { shape: 'cylinder', label: '右面' }
            }
        }
    ];

    const DIRECTIONS = [
        { key: 'front', label: '前面', arrow: '⬆️' },    // ⬆️
        { key: 'back',  label: '后面', arrow: '⬇️' },    // ⬇️
        { key: 'left',  label: '左面', arrow: '⬅️' },    // ⬅️
        { key: 'right', label: '右面', arrow: '➡️' }     // ➡️
    ];

    const ROUND_COUNT = 4;

    /* ────────── 状态 ────────── */
    let state = {
        container: null,
        levelData: null,
        phase: 1,
        round: 0,
        mistakes: 0,
        isFinished: false,
        rounds: [],        // 当前轮次的题目数据
        locked: false      // 防连续点击
    };

    /* ────────── 2D 视图渲染 ────────── */

    /**
     * 根据 view shape 返回 HTML 字符串
     * @param {string} shape  视图形状类型
     * @param {string} color  主色
     * @param {number} w      宽度
     * @param {number} h      高度
     */
    function viewHTML(shape, color, w, h) {
        w = w || 80;
        h = h || 80;
        const dark = darken(color, 30);
        const light = lighten(color, 40);
        switch (shape) {
            case 'square':
                return `<div class="obs-view-shape" style="width:${w}px;height:${h}px;
                    background:${color};border:3px solid ${dark};border-radius:6px;"></div>`;
            case 'rect-h':
                return `<div class="obs-view-shape" style="width:${w + 16}px;height:${Math.round(h * 0.65)}px;
                    background:${color};border:3px solid ${dark};border-radius:6px;"></div>`;
            case 'rect-v':
                return `<div class="obs-view-shape" style="width:${Math.round(w * 0.55)}px;height:${h}px;
                    background:${color};border:3px solid ${dark};border-radius:6px;"></div>`;
            case 'spine':
                return `<div class="obs-view-shape" style="width:${Math.round(w * 0.3)}px;height:${h}px;
                    background:linear-gradient(to right,${dark},${color},${dark});
                    border:3px solid ${dark};border-radius:3px;"></div>`;
            case 'cylinder':
                return `<div class="obs-view-shape" style="width:${w}px;height:${h}px;
                    background:linear-gradient(to right,${dark},${color},${light},${color},${dark});
                    border:3px solid ${dark};border-radius:${Math.round(w / 2)}px;"></div>`;
            default:
                return `<div class="obs-view-shape" style="width:${w}px;height:${h}px;
                    background:${color};border:3px solid ${dark};border-radius:6px;"></div>`;
        }
    }

    /** 3D 物体展示（简单 CSS 立方体） */
    function css3DBox(obj) {
        const c = obj.cssView;
        return `
            <div class="obs-3d-scene">
                <div class="obs-3d-box" style="--front-color:${c.bg};--top-color:${c.top};--side-color:${c.side};">
                    <div class="obs-3d-face obs-3d-front"></div>
                    <div class="obs-3d-face obs-3d-top"></div>
                    <div class="obs-3d-face obs-3d-right"></div>
                </div>
                <div class="obs-3d-label">${obj.emoji} ${obj.name}</div>
            </div>`;
    }

    /** 圆柱形 3D 展示 */
    function css3DCylinder(obj) {
        const c = obj.cssView;
        return `
            <div class="obs-3d-scene">
                <div class="obs-3d-cylinder" style="--cyl-body:${c.bg};--cyl-top:${c.top};--cyl-side:${c.side};">
                    <div class="obs-cyl-body"></div>
                    <div class="obs-cyl-top"></div>
                </div>
                <div class="obs-3d-label">${obj.emoji} ${obj.name}</div>
            </div>`;
    }

    /** 根据物体类型选择 3D 渲染 */
    function render3D(obj) {
        if (obj.id === 'cup') return css3DCylinder(obj);
        return css3DBox(obj);
    }

    /* ────────── 颜色工具 ────────── */
    function darken(hex, amt) {
        return shiftColor(hex, -amt);
    }
    function lighten(hex, amt) {
        return shiftColor(hex, amt);
    }
    function shiftColor(hex, amt) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.max(0, Math.min(255, r + amt));
        g = Math.max(0, Math.min(255, g + amt));
        b = Math.max(0, Math.min(255, b + amt));
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    /* ────────── Phase 1: 猜猜我在哪 ────────── */

    function buildPhase1Rounds() {
        const objs = H.shuffle([...OBJECTS]).slice(0, ROUND_COUNT);
        return objs.map(obj => {
            const highlightedDir = DIRECTIONS[H.randInt(0, 3)];
            // 生成 4 个视角选项（打乱顺序）
            const viewKeys = H.shuffle(['front', 'back', 'left', 'right']);
            return {
                obj,
                highlightedDir,
                viewKeys,
                correctKey: highlightedDir.key
            };
        });
    }

    function renderPhase1Round() {
        const r = state.rounds[state.round];
        if (!r) { startPhase2(); return; }

        const total = state.rounds.length;
        const obj = r.obj;
        const dir = r.highlightedDir;

        const viewOptions = r.viewKeys.map(vk => {
            const v = obj.views[vk];
            return { key: vk, label: v.label, html: viewHTML(v.shape, obj.color, 70, 70) };
        });

        H.updateGuide(`🔭 第 ${state.round + 1}/${total} 题 - 从${dir.label}看，是哪个样子？`);

        const gameArea = document.getElementById('obs-game-area');
        gameArea.innerHTML = `
            <div class="obs-p1-layout">
                <div class="obs-p1-left">
                    ${render3D(obj)}
                    <div class="obs-arrow-highlight">
                        <span class="obs-arrow-icon">${dir.arrow}</span>
                        <span class="obs-arrow-text">从${dir.label}看</span>
                    </div>
                </div>
                <div class="obs-p1-right">
                    <div class="obs-p1-prompt">哪个是<strong>从${dir.label}看</strong>到的样子？</div>
                    <div class="obs-p1-views" id="obs-p1-views">
                        ${viewOptions.map((vo, i) => `
                            <button class="obs-view-btn" data-key="${vo.key}">
                                <div class="obs-view-box">${vo.html}</div>
                                <div class="obs-view-label">选项 ${String.fromCharCode(65 + i)}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="obs-progress">第 ${state.round + 1} / ${total} 题</div>
        `;

        // 绑定点击
        gameArea.querySelectorAll('.obs-view-btn').forEach(btn => {
            btn.onclick = () => {
                if (state.locked) return;
                const chosen = btn.dataset.key;
                handlePhase1Answer(chosen, r.correctKey, btn);
            };
        });
    }

    function handlePhase1Answer(chosen, correct, btnEl) {
        if (chosen === correct) {
            state.locked = true;
            btnEl.classList.add('obs-correct');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            setTimeout(() => {
                state.round++;
                state.locked = false;
                renderPhase1Round();
            }, 900);
        } else {
            state.mistakes++;
            btnEl.classList.add('obs-wrong');
            H.triggerError(state.container, '看错啦，再仔细想想！', btnEl);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, 'Phase1视角选择', chosen, correct);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
            setTimeout(() => btnEl.classList.remove('obs-wrong'), 600);
        }
    }

    /* ────────── Phase 2: 找出正确视角 ────────── */

    function buildPhase2Rounds() {
        const objs = H.shuffle([...OBJECTS]).slice(0, ROUND_COUNT);
        return objs.map(obj => {
            const dir = DIRECTIONS[H.randInt(0, 3)];
            // 生成 4 个视角选项（一个正确 + 3 个干扰）
            const allDirKeys = H.shuffle(['front', 'back', 'left', 'right']);
            return {
                obj,
                dir,
                correctKey: dir.key,
                optionKeys: allDirKeys
            };
        });
    }

    function renderPhase2Round() {
        const r = state.rounds[state.round];
        if (!r) { finishGame(); return; }

        const total = state.rounds.length;
        const obj = r.obj;
        const dir = r.dir;

        const options = r.optionKeys.map(vk => {
            const v = obj.views[vk];
            return { key: vk, label: v.label, html: viewHTML(v.shape, obj.color, 64, 64) };
        });

        H.updateGuide(`🔭 第 ${state.round + 1}/${total} 题 - ${obj.emoji}从${dir.label}看是什么样子？`);

        const gameArea = document.getElementById('obs-game-area');
        gameArea.innerHTML = `
            <div class="obs-p2-layout">
                <div class="obs-p2-question">
                    <div class="obs-p2-emoji">${obj.emoji}</div>
                    <div class="obs-p2-desc">
                        <strong>"${obj.name}"</strong>，<span class="obs-dir-tag">从${dir.label}看</span>，
                        是哪个样子？
                    </div>
                </div>
                <div class="obs-p2-options" id="obs-p2-options">
                    ${options.map((opt, i) => `
                        <button class="obs-p2-btn" data-key="${opt.key}">
                            <div class="obs-p2-btn-letter">${String.fromCharCode(65 + i)}</div>
                            <div class="obs-p2-btn-shape">${opt.html}</div>
                            <div class="obs-p2-btn-label">${opt.label}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="obs-progress">第 ${state.round + 1} / ${total} 题</div>
        `;

        gameArea.querySelectorAll('.obs-p2-btn').forEach(btn => {
            btn.onclick = () => {
                if (state.locked) return;
                handlePhase2Answer(btn.dataset.key, r.correctKey, btn);
            };
        });
    }

    function handlePhase2Answer(chosen, correct, btnEl) {
        if (chosen === correct) {
            state.locked = true;
            btnEl.classList.add('obs-correct');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            setTimeout(() => {
                state.round++;
                state.locked = false;
                renderPhase2Round();
            }, 900);
        } else {
            state.mistakes++;
            btnEl.classList.add('obs-wrong');
            H.triggerError(state.container, '不对哦，换个方向看看！', btnEl);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, 'Phase2视角选择', chosen, correct);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
            setTimeout(() => btnEl.classList.remove('obs-wrong'), 600);
        }
    }

    /* ────────── 阶段切换 ────────── */

    function startPhase2() {
        state.phase = 2;
        state.round = 0;
        state.rounds = buildPhase2Rounds();
        renderPhase2Round();
    }

    /* ────────── 结算 ────────── */

    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        const subtitle = state.mistakes === 0
            ? '你从每个方向都能看对，太厉害了！'
            : state.mistakes <= 2
                ? '观察力很强，继续加油！'
                : '多练习观察不同方向的样子吧！';
        H.showSettlement(state.container, state.levelData.reward || 20, state.levelData, state.mistakes, subtitle, 'lvl_2_6_1');
    }

    /* ────────── 主模块 ────────── */
    const game = {

        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;
            this.resetState();
            H.injectStyles(STYLE_ID, this.buildCSS());
            this.render();
            this.startPhase1();
        },

        resetState() {
            state.phase = 1;
            state.round = 0;
            state.mistakes = 0;
            state.isFinished = false;
            state.locked = false;
            state.rounds = [];
        },

        /* ─────────── CSS ─────────── */
        buildCSS() {
            return `
                .obs-wrap {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(160deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);
                    display:flex;flex-direction:column;align-items:center;
                }

                .obs-progress {
                    margin-top:16px;font-size:17px;color:rgba(255,255,255,0.55);
                    letter-spacing:1px;
                }

                /* ── 3D 场景 ── */
                .obs-3d-scene {
                    display:flex;flex-direction:column;align-items:center;gap:10px;
                    perspective:600px;
                }
                .obs-3d-label {
                    font-size:18px;font-weight:bold;color:#fff;
                    background:rgba(255,255,255,0.12);padding:4px 16px;
                    border-radius:12px;
                }

                /* CSS 立方体 */
                .obs-3d-box {
                    width:100px;height:100px;position:relative;
                    transform-style:preserve-3d;
                    transform:rotateX(-20deg) rotateY(-30deg);
                    animation:obs-rotate 8s ease-in-out infinite;
                }
                @keyframes obs-rotate {
                    0%,100%{transform:rotateX(-20deg) rotateY(-30deg);}
                    50%{transform:rotateX(-20deg) rotateY(30deg);}
                }
                .obs-3d-face {
                    position:absolute;width:100px;height:100px;
                    border:2px solid rgba(255,255,255,0.5);
                    backface-visibility:visible;
                }
                .obs-3d-front  { background:var(--front-color); transform:translateZ(50px); }
                .obs-3d-top    { background:var(--top-color);   transform:rotateX(90deg) translateZ(50px); }
                .obs-3d-right  { background:var(--side-color);  transform:rotateY(90deg) translateZ(50px); }

                /* CSS 圆柱 */
                .obs-3d-cylinder {
                    width:80px;height:110px;position:relative;
                    transform-style:preserve-3d;
                    transform:rotateX(-15deg);
                }
                .obs-cyl-body {
                    width:80px;height:110px;
                    background:linear-gradient(to right,var(--cyl-side),var(--cyl-body),var(--cyl-side));
                    border-radius:6px;border:2px solid rgba(255,255,255,0.4);
                }
                .obs-cyl-top {
                    position:absolute;top:-14px;left:0;width:80px;height:28px;
                    background:var(--cyl-top);border-radius:50%;
                    border:2px solid rgba(255,255,255,0.4);
                }

                /* 方向箭头高亮 */
                .obs-arrow-highlight {
                    display:flex;flex-direction:column;align-items:center;gap:4px;
                    margin-top:8px;
                    background:rgba(251,191,36,0.18);padding:8px 20px;border-radius:16px;
                    border:2px solid rgba(251,191,36,0.5);
                }
                .obs-arrow-icon { font-size:28px; }
                .obs-arrow-text { font-size:16px;font-weight:bold;color:#fbbf24; }

                /* ── Phase 1 ── */
                .obs-p1-layout {
                    flex:1;width:100%;display:flex;align-items:center;justify-content:center;
                    gap:50px;padding:80px 30px 20px;flex-wrap:wrap;
                }
                .obs-p1-left {
                    display:flex;flex-direction:column;align-items:center;gap:6px;
                }
                .obs-p1-right {
                    display:flex;flex-direction:column;align-items:center;gap:16px;
                }
                .obs-p1-prompt {
                    font-size:22px;font-weight:bold;color:#e0e7ff;
                    background:rgba(255,255,255,0.1);padding:10px 28px;
                    border-radius:16px;border:2px solid rgba(255,255,255,0.2);
                }
                .obs-p1-views {
                    display:grid;grid-template-columns:1fr 1fr;gap:14px;
                }
                .obs-view-btn {
                    display:flex;flex-direction:column;align-items:center;gap:6px;
                    padding:14px 18px;background:rgba(255,255,255,0.08);
                    border:3px solid rgba(255,255,255,0.25);border-radius:18px;
                    cursor:pointer;transition:all .2s;
                }
                .obs-view-btn:hover {
                    background:rgba(255,255,255,0.18);
                    border-color:rgba(255,255,255,0.5);
                    transform:scale(1.06);
                }
                .obs-view-box {
                    display:flex;align-items:center;justify-content:center;
                    width:80px;height:80px;background:rgba(255,255,255,0.06);
                    border-radius:12px;
                }
                .obs-view-label {
                    font-size:14px;font-weight:bold;color:rgba(255,255,255,0.7);
                }

                /* ── Phase 2 ── */
                .obs-p2-layout {
                    flex:1;width:100%;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:40px;
                    padding:80px 20px 20px;
                }
                .obs-p2-question {
                    display:flex;flex-direction:column;align-items:center;gap:14px;
                    background:rgba(255,255,255,0.08);padding:28px 40px;
                    border-radius:24px;border:2px solid rgba(255,255,255,0.15);
                    max-width:500px;text-align:center;
                }
                .obs-p2-emoji { font-size:64px; }
                .obs-p2-desc { font-size:22px;color:#e0e7ff;line-height:1.6; }
                .obs-dir-tag {
                    display:inline-block;background:rgba(251,191,36,0.25);
                    color:#fbbf24;padding:2px 12px;border-radius:8px;
                    font-weight:bold;
                }

                .obs-p2-options {
                    display:grid;grid-template-columns:1fr 1fr;gap:18px;
                    max-width:500px;width:100%;
                }
                .obs-p2-btn {
                    display:flex;flex-direction:column;align-items:center;gap:8px;
                    padding:18px 14px;background:rgba(255,255,255,0.07);
                    border:3px solid rgba(255,255,255,0.25);border-radius:20px;
                    cursor:pointer;transition:all .2s;
                }
                .obs-p2-btn:hover {
                    background:rgba(255,255,255,0.16);
                    border-color:rgba(255,255,255,0.5);
                    transform:scale(1.05);
                }
                .obs-p2-btn-letter {
                    font-size:16px;font-weight:900;color:rgba(255,255,255,0.45);
                    background:rgba(255,255,255,0.08);width:28px;height:28px;
                    border-radius:50%;display:flex;align-items:center;justify-content:center;
                }
                .obs-p2-btn-shape {
                    display:flex;align-items:center;justify-content:center;
                    width:80px;height:80px;background:rgba(255,255,255,0.05);
                    border-radius:12px;
                }
                .obs-p2-btn-label {
                    font-size:15px;font-weight:bold;color:rgba(255,255,255,0.7);
                }

                /* ── 正确/错误动画 ── */
                .obs-correct {
                    border-color:#10b981 !important;
                    background:rgba(16,185,129,0.2) !important;
                    animation:obs-pop .35s ease;
                }
                .obs-wrong {
                    border-color:#ef4444 !important;
                    background:rgba(239,68,68,0.2) !important;
                    animation:obs-shake .45s ease;
                }
                @keyframes obs-pop {
                    0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}
                }
                @keyframes obs-shake {
                    0%,100%{transform:translateX(0)}
                    20%{transform:translateX(-6px)}40%{transform:translateX(6px)}
                    60%{transform:translateX(-4px)}80%{transform:translateX(4px)}
                }
            `;
        },

        /* ─────────── 渲染 ─────────── */
        render() {
            state.container.innerHTML = `
                <div class="obs-wrap">
                    ${H.guideBarHTML('🔭', '透视大师——从不同方向观察物体！', 'gh-guide-text')}
                    <div id="obs-game-area" style="flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"></div>
                </div>
            `;
        },

        startPhase1() {
            state.phase = 1;
            state.round = 0;
            state.rounds = buildPhase1Rounds();
            renderPhase1Round();
        },

        finishGame() {
            finishGame();
        }
    };

    window.CurrentGameModule = game;
})();
