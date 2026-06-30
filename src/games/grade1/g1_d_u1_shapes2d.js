/**
 * 一年级下册 第一单元：认识图形（二）- 2D平面图形
 * 路径: src/games/grade1/g1_d_u1_shapes2d.js
 *
 * 玩法：图形寻宝
 *   Phase 1: 把各种物品拖放到正确的图形分类框（5 类）
 *   Phase 2: 快速问答——看图形选出正确名称
 */

(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u1-shapes2d-styles';

    /* ── 图形数据 ── */
    const CATEGORIES = [
        { key: 'rectangle',  label: '长方形', color: '#3b82f6' },
        { key: 'square',     label: '正方形', color: '#10b981' },
        { key: 'parallelogram', label: '平行四边形', color: '#8b5cf6' },
        { key: 'triangle',   label: '三角形', color: '#f59e0b' },
        { key: 'circle',     label: '圆',     color: '#ef4444' }
    ];

    /** 每个分类对应 2 个待拖放物品 */
    const ITEMS = [
        { id: 'i1',  shape: 'rectangle',     emoji: '🚪', name: '门' },
        { id: 'i2',  shape: 'rectangle',     emoji: '📱', name: '手机' },
        { id: 'i3',  shape: 'square',        emoji: '🟩', name: '绿方块' },
        { id: 'i4',  shape: 'square',        emoji: '🧩', name: '拼图' },
        { id: 'i5',  shape: 'parallelogram', emoji: '🪁', name: '风筝' },
        { id: 'i6',  shape: 'parallelogram', emoji: '📏', name: '斜尺' },
        { id: 'i7',  shape: 'triangle',      emoji: '🔺', name: '红三角' },
        { id: 'i8',  shape: 'triangle',      emoji: '🍕', name: '披萨' },
        { id: 'i9',  shape: 'circle',        emoji: '🕐', name: '钟' },
        { id: 'i10', shape: 'circle',        emoji: '🏀', name: '篮球' }
    ];

    /** Phase 2 题库：展示一个 CSS 图形 + 选项 */
    const QUIZZES = [
        { type: 'rectangle',  desc: '四条边，对边相等，四个直角', choices: ['长方形','正方形','平行四边形','圆'] },
        { type: 'square',     desc: '四条边都一样长，四个直角', choices: ['正方形','长方形','三角形','圆'] },
        { type: 'parallelogram', desc: '四条边，对边平行且相等，没有直角', choices: ['平行四边形','长方形','正方形','三角形'] },
        { type: 'triangle',   desc: '三条边，三个角', choices: ['三角形','长方形','圆','正方形'] },
        { type: 'circle',     desc: '没有角，到处圆圆的', choices: ['圆','三角形','正方形','平行四边形'] },
        { type: 'rectangle',  desc: '它长长的，上下两条边一样长', choices: ['长方形','正方形','平行四边形','三角形'] },
        { type: 'square',     desc: '它方方正正，四条边一样长', choices: ['正方形','长方形','圆','三角形'] },
        { type: 'triangle',   desc: '它像一座小山，有三条边', choices: ['三角形','圆','正方形','平行四边形'] }
    ];

    /* ── 游戏状态 ── */
    let state = {
        container: null,
        levelData: null,
        phase: 1,
        classifiedCount: 0,
        totalToClassify: ITEMS.length,
        quizIndex: 0,
        quizOrder: [],
        mistakes: 0,
        isFinished: false
    };

    /* ── CSS 图形渲染 ── */
    function shapeVisual(type, size) {
        size = size || 80;
        const h = size / 2;
        switch (type) {
            case 'rectangle':
                return `<div style="width:${size}px;height:${size * 0.6}px;background:#60a5fa;border:3px solid #2563eb;border-radius:6px;"></div>`;
            case 'square':
                return `<div style="width:${size}px;height:${size}px;background:#34d399;border:3px solid #059669;border-radius:6px;"></div>`;
            case 'parallelogram':
                return `<div style="width:${size}px;height:${size * 0.6}px;background:#a78bfa;border:3px solid #7c3aed;
                    transform:skewX(-12deg);border-radius:4px;"></div>`;
            case 'triangle':
                return `<div style="width:0;height:0;border-left:${h}px solid transparent;border-right:${h}px solid transparent;
                    border-bottom:${size}px solid #fbbf24;filter:drop-shadow(0 2px 2px rgba(0,0,0,.15));"></div>`;
            case 'circle':
                return `<div style="width:${size}px;height:${size}px;background:#f87171;border:3px solid #dc2626;
                    border-radius:50%;box-shadow:inset -4px -4px 8px rgba(0,0,0,.15);"></div>`;
            default:
                return '';
        }
    }

    /** 小图形缩略（Phase 1 箱子内） */
    function miniShape(type) {
        return shapeVisual(type, 32);
    }

    /* ── 主模块 ── */
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
            state.classifiedCount = 0;
            state.quizIndex = 0;
            state.mistakes = 0;
            state.isFinished = false;
            state.quizOrder = H.shuffle([...Array(QUIZZES.length).keys()]);
        },

        /* ─────────── CSS ─────────── */
        buildCSS() {
            const cats = CATEGORIES.map(c => `.s2d-box[data-s="${c.key}"]{border-color:${c.color};}`).join('\n');
            return `
                .s2d-wrap {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(160deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
                    display:flex;flex-direction:column;align-items:center;
                }

                /* 引导栏复用 guide-bar 样式，但用 s2d- 前缀 */
                .s2d-guide {
                    margin-top:16px;background:rgba(255,255,255,0.92);padding:10px 36px;
                    border-radius:30px;box-shadow:0 4px 15px rgba(0,0,0,0.25);
                    border:3px solid #fbbf24;font-size:21px;font-weight:bold;
                    color:#1e293b;display:flex;align-items:center;gap:12px;z-index:50;
                }
                .s2d-guide span.s2d-sprite{font-size:30px;animation:s2d-float 2s infinite ease-in-out;}
                @keyframes s2d-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

                /* ── Phase 1 ── */
                .s2d-phase1{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:10px 16px;}
                .s2d-phase1.hidden,.s2d-phase2.hidden{display:none;}

                .s2d-pool{
                    display:flex;flex-wrap:wrap;gap:12px;justify-content:center;
                    padding:18px;background:rgba(255,255,255,0.06);border-radius:22px;
                    width:90%;max-width:700px;border:2px solid rgba(255,255,255,0.1);
                }
                .s2d-item{
                    width:82px;height:82px;background:#fff;border-radius:18px;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    font-size:38px;cursor:grab;box-shadow:0 6px 0 #cbd5e1;
                    transition:transform .18s,box-shadow .18s;user-select:none;
                    position:relative;
                }
                .s2d-item .s2d-item-name{font-size:11px;color:#475569;margin-top:2px;font-weight:600;}
                .s2d-item:active{cursor:grabbing;transform:scale(1.12) rotate(4deg);box-shadow:0 10px 0 #94a3b8;}
                .s2d-item.s2d-dragging{opacity:.4;}

                .s2d-boxes{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;width:90%;max-width:750px;}
                .s2d-box{
                    width:130px;min-height:160px;background:rgba(255,255,255,0.06);
                    border:3px dashed #64748b;border-radius:20px;
                    display:flex;flex-direction:column;align-items:center;
                    justify-content:flex-end;padding-bottom:10px;position:relative;
                    transition:all .25s;
                }
                .s2d-box.s2d-hl{background:rgba(255,255,255,0.14);transform:scale(1.06);filter:brightness(1.2);}
                .s2d-box-label{
                    color:#fff;padding:4px 14px;border-radius:10px;font-size:16px;font-weight:bold;
                    margin-bottom:4px;
                }
                ${cats}
                .s2d-box[data-s="rectangle"] .s2d-box-label{background:#3b82f6;}
                .s2d-box[data-s="square"] .s2d-box-label{background:#10b981;}
                .s2d-box[data-s="parallelogram"] .s2d-box-label{background:#8b5cf6;}
                .s2d-box[data-s="triangle"] .s2d-box-label{background:#f59e0b;}
                .s2d-box[data-s="circle"] .s2d-box-label{background:#ef4444;}

                .s2d-box-content{
                    position:absolute;top:8px;left:6px;right:6px;
                    display:flex;flex-wrap:wrap;gap:4px;justify-content:center;
                    align-content:flex-start;pointer-events:none;
                }
                .s2d-box-content .s2d-mini{pointer-events:none;}

                /* ── Phase 2 ── */
                .s2d-phase2{
                    flex:1;width:100%;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:36px;
                }

                .s2d-quiz-card{
                    background:#fff;border-radius:28px;padding:36px 44px;
                    box-shadow:0 16px 40px rgba(0,0,0,0.35);text-align:center;
                    border:4px solid #fbbf24;max-width:500px;width:88%;
                }
                .s2d-quiz-card h3{margin:0 0 6px 0;font-size:26px;color:#1e293b;}
                .s2d-quiz-card .s2d-quiz-desc{font-size:20px;color:#64748b;margin:8px 0 18px;}
                .s2d-quiz-shape{display:flex;justify-content:center;margin:16px 0;}

                .s2d-choices{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;}
                .s2d-choice{
                    padding:14px 32px;font-size:22px;font-weight:bold;color:#4338ca;
                    background:#fff;border:3px solid #6366f1;border-radius:18px;
                    cursor:pointer;transition:all .18s;
                }
                .s2d-choice:hover{background:#6366f1;color:#fff;transform:scale(1.06);}

                .s2d-quiz-progress{font-size:18px;color:rgba(255,255,255,0.7);margin-top:8px;}
            `;
        },

        /* ─────────── 渲染 ─────────── */
        render() {
            const shuffledItems = H.shuffle([...ITEMS]);
            state.totalToClassify = shuffledItems.length;

            state.container.innerHTML = `
                <div class="s2d-wrap">
                    ${H.guideBarHTML('🔍', '图形寻宝——把物品拖进正确的图形框！', 'gh-guide-text')}

                    <!-- Phase 1: 分类 -->
                    <div id="s2d-phase1" class="s2d-phase1">
                        <div class="s2d-pool" id="s2d-pool">
                            ${shuffledItems.map(it =>
                                `<div class="s2d-item" draggable="true" id="${it.id}" data-s="${it.shape}">
                                    ${it.emoji}<span class="s2d-item-name">${it.name}</span>
                                </div>`
                            ).join('')}
                        </div>
                        <div class="s2d-boxes" id="s2d-boxes">
                            ${CATEGORIES.map(c =>
                                `<div class="s2d-box" data-s="${c.key}">
                                    <div class="s2d-box-content"></div>
                                    <div class="s2d-box-label">${c.label}</div>
                                </div>`
                            ).join('')}
                        </div>
                    </div>

                    <!-- Phase 2: 问答 -->
                    <div id="s2d-phase2" class="s2d-phase2 s2d-phase2 hidden">
                        <div class="s2d-quiz-card">
                            <h3 id="s2d-quiz-title">这是什么图形？</h3>
                            <p class="s2d-quiz-desc" id="s2d-quiz-desc"></p>
                            <div class="s2d-quiz-shape" id="s2d-quiz-shape"></div>
                            <div class="s2d-choices" id="s2d-choices"></div>
                        </div>
                        <div class="s2d-quiz-progress" id="s2d-quiz-progress"></div>
                    </div>
                </div>
            `;

            this.bindDragEvents();
        },

        /* ─────────── Phase 1 逻辑 ─────────── */
        startPhase1() {
            H.updateGuide('🔍 拖动物品放入正确的位置，把下面的物品拖到正确的图形框里吧！');
        },

        bindDragEvents() {
            /* 拖拽物品 */
            state.container.querySelectorAll('.s2d-item').forEach(item => {
                item.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => item.classList.add('s2d-dragging'), 0);
                });
                item.addEventListener('dragend', () => item.classList.remove('s2d-dragging'));

                /* 移动端 touch 拖拽 */
                this._addTouchDrag(item);
            });

            /* 箱子 */
            state.container.querySelectorAll('.s2d-box').forEach(box => {
                box.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; box.classList.add('s2d-hl'); });
                box.addEventListener('dragleave', () => box.classList.remove('s2d-hl'));
                box.addEventListener('drop', e => this.handleDrop(e, box));
            });
        },

        /** 移动端 touch 事件模拟拖拽 */
        _addTouchDrag(item) {
            let clone = null, startX = 0, startY = 0, curX = 0, curY = 0;
            const onStart = (e) => {
                const t = e.touches[0];
                startX = t.clientX; startY = t.clientY;
                clone = item.cloneNode(true);
                clone.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;opacity:0.85;transform:scale(1.1);';
                document.body.appendChild(clone);
                item.classList.add('s2d-dragging');
            };
            const onMove = (e) => {
                if (!clone) return;
                e.preventDefault();
                const t = e.touches[0];
                curX = t.clientX; curY = t.clientY;
                clone.style.left = (curX - 41) + 'px';
                clone.style.top = (curY - 41) + 'px';
                /* 高亮目标箱 */
                state.container.querySelectorAll('.s2d-box').forEach(b => {
                    const r = b.getBoundingClientRect();
                    b.classList.toggle('s2d-hl', curX >= r.left && curX <= r.right && curY >= r.top && curY <= r.bottom);
                });
            };
            const onEnd = () => {
                if (!clone) return;
                clone.remove(); clone = null;
                item.classList.remove('s2d-dragging');
                /* 找到目标箱 */
                state.container.querySelectorAll('.s2d-box').forEach(b => {
                    b.classList.remove('s2d-hl');
                    const r = b.getBoundingClientRect();
                    if (curX >= r.left && curX <= r.right && curY >= r.top && curY <= r.bottom) {
                        this._handleDropById(item.id, b);
                    }
                });
            };
            item.addEventListener('touchstart', onStart, { passive: true });
            item.addEventListener('touchmove', onMove, { passive: false });
            item.addEventListener('touchend', onEnd, { passive: true });
        },

        handleDrop(e, box) {
            e.preventDefault();
            box.classList.remove('s2d-hl');
            const id = e.dataTransfer.getData('text/plain');
            this._handleDropById(id, box);
        },

        _handleDropById(itemId, box) {
            const item = document.getElementById(itemId);
            if (!item || item.style.visibility === 'hidden') return;

            if (item.dataset.s === box.dataset.s) {
                /* 正确 */
                const mini = document.createElement('div');
                mini.className = 's2d-mini';
                mini.innerHTML = miniShape(item.dataset.s);
                box.querySelector('.s2d-box-content').appendChild(mini);
                item.style.visibility = 'hidden';
                state.classifiedCount++;

                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);

                if (state.classifiedCount >= state.totalToClassify) {
                    H.updateGuide('太棒了！全都分对了！接下来考考你~');
                    setTimeout(() => this.startPhase2(), 1000);
                }
            } else {
                /* 错误 */
                const correctName = CATEGORIES.find(c => c.key === item.dataset.s).label;
                H.triggerError(state.container, `这是"${correctName}"，看看它的样子！`, item);
                state.mistakes++;
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '2D分类错误',
                        `物品:${item.textContent.trim()} 期望:${item.dataset.s} 实际:${box.dataset.s}`);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
                }
            }
        },

        /* ─────────── Phase 2 逻辑 ─────────── */
        startPhase2() {
            state.phase = 2;
            state.quizIndex = 0;
            document.getElementById('s2d-phase1').classList.add('hidden');
            document.getElementById('s2d-phase2').classList.remove('hidden');
            H.updateGuide('考考你：这个图形叫什么名字？');
            this.renderQuiz();
        },

        renderQuiz() {
            const idx = state.quizIndex;
            if (idx >= state.quizOrder.length) {
                this.finishGame();
                return;
            }
            const q = QUIZZES[state.quizOrder[idx]];
            const shapeBox = document.getElementById('s2d-quiz-shape');
            shapeBox.innerHTML = shapeVisual(q.type, 90);

            const descEl = document.getElementById('s2d-quiz-desc');
            descEl.textContent = q.desc;

            const progressEl = document.getElementById('s2d-quiz-progress');
            progressEl.textContent = `第 ${idx + 1} / ${state.quizOrder.length} 题`;

            const choicesEl = document.getElementById('s2d-choices');
            choicesEl.innerHTML = '';
            H.renderChoices(H.shuffle(q.choices), 's2d-choices', (ci, text) => {
                this.handleQuizAnswer(q.type, text, choicesEl);
            });
        },

        handleQuizAnswer(correctType, chosenText, choicesEl) {
            const correctLabel = CATEGORIES.find(c => c.key === correctType).label;
            if (chosenText === correctLabel) {
                /* 正确 */
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                state.quizIndex++;
                this.renderQuiz();
            } else {
                /* 错误 */
                state.mistakes++;
                H.triggerError(state.container, `不对哦，这是"${correctLabel}"！`, choicesEl);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '2D问答错误',
                        `正确:${correctType}(${correctLabel}) 选择了:${chosenText}`);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
                }
                state.quizIndex++;
                setTimeout(() => this.renderQuiz(), 1200);
            }
        },

        /* ─────────── 结算 ─────────── */
        finishGame() {
            if (state.isFinished) return;
            state.isFinished = true;
            const subtitle = state.mistakes === 0
                ? '你认识了所有的平面图形！'
                : state.mistakes <= 2
                    ? '你掌握了大部分平面图形！'
                    : '继续加油，多认识这些图形吧！';
            H.showSettlement(state.container, state.levelData.reward || 15, state.levelData, state.mistakes, subtitle, 'lvl_1_d_2');
        }
    };

    window.CurrentGameModule = game;
})();
