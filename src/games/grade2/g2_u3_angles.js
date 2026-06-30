/**
 * 二年级上册 第三单元：角的初步认识
 * 路径: src/games/grade2/g2_u3_angles.js
 *
 * 两阶段游戏 "角之猎人":
 *   Phase 1 "认识角" — 识别角的组成部分（顶点、边）
 *   Phase 2 "角的分类" — 将角分类为锐角/直角/钝角
 */

(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u3-angles-styles';

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        phase1Step: 0,       // 0=问顶点, 1=问边1, 2=问边2
        phase2Index: 0,       // 当前第几题（共6题）
        questions: [],        // phase2 题目数组
        finished: false
    };

    /* ========== Phase 2 题目生成 ========== */

    /**
     * 生成 phase2 的 6 道题：随机混合锐角、直角、钝角
     * 每题包含 angleDeg 和 answer
     */
    function generateQuestions() {
        const pool = [];
        // 2 道锐角
        for (let i = 0; i < 2; i++) {
            pool.push({ angleDeg: H.randInt(20, 75), answer: '锐角' });
        }
        // 2 道直角
        pool.push({ angleDeg: 90, answer: '直角' });
        pool.push({ angleDeg: 90, answer: '直角' });
        // 2 道钝角
        for (let i = 0; i < 2; i++) {
            pool.push({ angleDeg: H.randInt(100, 165), answer: '钝角' });
        }
        return H.shuffle(pool);
    }

    /* ========== SVG 角绘制 ========== */

    /**
     * 绘制一个角的 SVG
     * @param {number} deg   角度
     * @param {number} size  画布尺寸
     * @param {boolean} showLabels 是否显示顶点/边标注
     * @returns {string} SVG 字符串
     */
    function drawAngleSVG(deg, size, showLabels) {
        size = size || 220;
        const cx = size / 2, cy = size / 2 + 20;
        const armLen = size * 0.38;

        // 固定边水平向右，旋转边按角度
        const rad = (Math.PI / 180) * deg;
        const ex1 = cx + armLen;
        const ey1 = cy;
        const ex2 = cx + armLen * Math.cos(rad);
        const ey2 = cy - armLen * Math.sin(rad);

        // 画角弧（小扇形弧线）
        const arcR = 30;
        const arcEndX = cx + arcR * Math.cos(rad);
        const arcEndY = cy - arcR * Math.sin(rad);
        const largeArc = deg > 180 ? 1 : 0;
        const arcPath = `M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`;

        let labels = '';
        if (showLabels) {
            labels = `
                <!-- 顶点标记 -->
                <circle cx="${cx}" cy="${cy}" r="6" fill="#ef4444" class="ang-hotspot" data-part="vertex" style="cursor:pointer"/>
                <text x="${cx}" y="${cy + 24}" text-anchor="middle" fill="#ef4444" font-size="15" font-weight="bold">顶点</text>

                <!-- 边1标记（水平边） -->
                <line x1="${cx + armLen * 0.55}" y1="${cy}" x2="${cx + armLen * 0.55}" y2="${cy - 10}"
                    stroke="#3b82f6" stroke-width="8" stroke-linecap="round" class="ang-hotspot" data-part="side" style="cursor:pointer"/>
                <text x="${cx + armLen * 0.55}" y="${cy + 22}" text-anchor="middle" fill="#3b82f6" font-size="15" font-weight="bold">边</text>

                <!-- 边2标记（旋转边） -->
                <line x1="${cx + armLen * 0.4 * Math.cos(rad)}" y1="${cy - armLen * 0.4 * Math.sin(rad)}"
                    x2="${cx + armLen * 0.55 * Math.cos(rad)}" y2="${cy - armLen * 0.55 * Math.sin(rad)}"
                    stroke="#3b82f6" stroke-width="8" stroke-linecap="round" class="ang-hotspot" data-part="side" style="cursor:pointer"/>
                <text x="${cx + armLen * 0.62 * Math.cos(rad)}" y="${cy - armLen * 0.62 * Math.sin(rad)}"
                    text-anchor="middle" fill="#3b82f6" font-size="15" font-weight="bold">边</text>
            `;
        }

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <!-- 边 -->
                <line x1="${cx}" y1="${cy}" x2="${ex1}" y2="${ey1}"
                    stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <line x1="${cx}" y1="${cy}" x2="${ex2}" y2="${ey2}"
                    stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <!-- 弧 -->
                <path d="${arcPath}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
                ${labels}
            </svg>
        `;
    }

    /**
     * 绘制直角标记（小方块）
     */
    function rightAngleMarkSVG(size) {
        size = size || 220;
        const cx = size / 2, cy = size / 2 + 20;
        const armLen = size * 0.38;
        const sq = 18;
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <line x1="${cx}" y1="${cy}" x2="${cx + armLen}" y2="${cy}" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - armLen}" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                <rect x="${cx}" y="${cy - sq}" width="${sq}" height="${sq}" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
                <text x="${cx + armLen / 2}" y="${cy + 22}" text-anchor="middle" fill="#64748b" font-size="13" font-weight="bold">90°</text>
            </svg>
        `;
    }

    /* ========== 模块主体 ========== */

    const game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 20 };
            if (!state.container) return;

            this.injectStyles();
            this.resetState();
            this.render();
        },

        resetState: function () {
            state.phase = 1;
            state.mistakes = 0;
            state.phase1Step = 0;
            state.phase2Index = 0;
            state.questions = generateQuestions();
            state.finished = false;
        },

        /* ---------- 样式 ---------- */

        injectStyles: function () {
            if (document.getElementById(STYLE_ID)) return;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = `
                .ang-game {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                    background: linear-gradient(160deg, #fef9ef 0%, #fdf2e9 100%);
                    display: flex; flex-direction: column; align-items: center;
                    color: #1e293b;
                }

                /* 顶部引导栏 */
                .ang-guide {
                    margin-top: 16px; background: rgba(255,255,255,0.95); padding: 12px 36px;
                    border-radius: 30px; box-shadow: 0 4px 14px rgba(0,0,0,0.08);
                    border: 3px solid #f59e0b; font-size: 21px; font-weight: bold;
                    color: #92400e; display: flex; align-items: center; gap: 14px; z-index: 50;
                    position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
                    white-space: nowrap;
                }
                .ang-guide-spr { font-size: 28px; animation: angFloat 2s infinite ease-in-out; }
                @keyframes angFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

                /* 进度指示 */
                .ang-progress {
                    display: flex; gap: 8px; margin-top: 18px;
                }
                .ang-dot {
                    width: 14px; height: 14px; border-radius: 50%;
                    background: #e2e8f0; border: 2px solid #cbd5e1; transition: all 0.3s;
                }
                .ang-dot.done { background: #10b981; border-color: #10b981; }
                .ang-dot.active { background: #f59e0b; border-color: #f59e0b; transform: scale(1.2); }

                /* 场景 */
                .ang-scene {
                    flex: 1; width: 100%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; padding: 80px 20px 20px;
                }

                /* Phase 1: 角图 */
                .ang-angle-wrap {
                    position: relative; margin-bottom: 20px;
                }
                .ang-angle-wrap svg { display: block; }

                .ang-hotspot { transition: all 0.2s; }
                .ang-hotspot:hover { filter: brightness(1.3); transform-origin: center; }

                .ang-prompt {
                    font-size: 26px; font-weight: bold; color: #1e293b;
                    background: white; padding: 14px 30px; border-radius: 20px;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                    border: 3px solid #f59e0b; text-align: center; margin-top: 12px;
                }

                /* Phase 2: 角分类 */
                .ang-p2-area {
                    display: flex; flex-direction: column; align-items: center; gap: 18px;
                    width: 100%;
                }
                .ang-angle-display {
                    background: white; border-radius: 24px; padding: 10px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 3px solid #e2e8f0;
                    display: flex; align-items: center; justify-content: center;
                }
                .ang-ref-box {
                    display: flex; align-items: center; gap: 10px;
                    background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 14px;
                    padding: 8px 18px; font-size: 16px; color: #92400e; font-weight: bold;
                }
                .ang-choices {
                    display: flex; gap: 18px; flex-wrap: wrap; justify-content: center;
                }
                .ang-choice-btn {
                    padding: 16px 44px; font-size: 24px; font-weight: bold;
                    border: 3px solid #6366f1; border-radius: 20px;
                    background: white; color: #4338ca; cursor: pointer;
                    transition: all 0.2s; user-select: none;
                }
                .ang-choice-btn:hover {
                    background: #6366f1; color: white; transform: scale(1.06);
                }
                .ang-choice-btn:active { transform: scale(0.96); }
                .ang-choice-btn.ang-correct {
                    background: #10b981; color: white; border-color: #10b981;
                    animation: angPop 0.35s ease-out;
                }
                .ang-choice-btn.ang-wrong {
                    background: #ef4444; color: white; border-color: #ef4444;
                    animation: angShake 0.45s ease-out;
                }
                @keyframes angPop {
                    0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)}
                }
                @keyframes angShake {
                    0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
                    40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
                }

                .ang-q-counter {
                    font-size: 18px; color: #64748b; font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        },

        /* ---------- 渲染入口 ---------- */

        render: function () {
            if (!state.container) return;
            if (state.phase === 1) {
                this.renderPhase1();
            } else {
                this.renderPhase2();
            }
        },

        /* ========== Phase 1: 认识角 ========== */

        renderPhase1: function () {
            const parts = ['vertex', 'side', 'side'];
            const labels = ['顶点', '边', '边'];
            const stepLabels = [
                '请指出角的「顶点」在哪里？点击红色圆点！',
                '请指出角的一条「边」！点击蓝色线段！',
                '再指出另一条「边」！'
            ];

            state.container.innerHTML = `
                <div class="ang-game">
                    ${H.guideBarHTML('📐', '角之猎人 — 第一关：认识角')}

                    <div class="ang-scene">
                        <div class="ang-angle-wrap" id="ang-angle-wrap">
                            ${drawAngleSVG(60, 220, true)}
                        </div>
                        <div class="ang-prompt" id="ang-prompt">${stepLabels[0]}</div>
                    </div>
                </div>
            `;

            this.bindPhase1Events(parts, labels, stepLabels);
        },

        bindPhase1Events: function (parts, labels, stepLabels) {
            const wrap = state.container.querySelector('#ang-angle-wrap');
            const prompt = state.container.querySelector('#ang-prompt');
            const self = this;

            wrap.addEventListener('click', function (e) {
                const target = e.target.closest('.ang-hotspot');
                if (!target) return;

                const part = target.dataset.part;
                const expected = parts[state.phase1Step];

                if (part === expected) {
                    // 正确
                    H.updateGuide(
                        state.phase1Step < 2
                            ? `对啦！这是角的「${labels[state.phase1Step]}」！`
                            : '太棒了！你已经认识了角的顶点和边！',
                        'gh-guide-text'
                    );
                    target.style.fill = '#10b981';
                    target.style.stroke = '#10b981';
                    state.phase1Step++;

                    if (state.phase1Step < parts.length) {
                        prompt.textContent = stepLabels[state.phase1Step];
                    } else {
                        // Phase 1 全部完成，进入 Phase 2
                        prompt.textContent = '认识角完成！马上进入分类挑战！';
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                        }
                        setTimeout(function () {
                            state.phase = 2;
                            state.phase2Index = 0;
                            self.renderPhase2();
                        }, 1200);
                    }
                } else {
                    // 错误
                    state.mistakes++;
                    H.triggerError(state.container, `不是「${labels[state.phase1Step]}」哦，再找找看！`, target);
                    if (window.GameManager) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                }
            });
        },

        /* ========== Phase 2: 角的分类 ========== */

        renderPhase2: function () {
            if (state.phase2Index >= state.questions.length) {
                this.finishGame();
                return;
            }

            const q = state.questions[state.phase2Index];
            const total = state.questions.length;

            state.container.innerHTML = `
                <div class="ang-game">
                    ${H.guideBarHTML('📐', '角之猎人 — 角的分类')}

                    <div class="ang-scene">
                        <div class="ang-p2-area">
                            <!-- 进度点 -->
                            <div class="ang-progress" id="ang-progress">
                                ${Array.from({length: total}, (_, i) => {
                                    let cls = 'ang-dot';
                                    if (i < state.phase2Index) cls += ' done';
                                    else if (i === state.phase2Index) cls += ' active';
                                    return `<div class="${cls}"></div>`;
                                }).join('')}
                            </div>

                            <div class="ang-q-counter" id="ang-q-counter">第 ${state.phase2Index + 1} / ${total} 题</div>

                            <!-- 角展示 -->
                            <div class="ang-angle-display" id="ang-display">
                                ${q.angleDeg === 90
                                    ? rightAngleMarkSVG(220)
                                    : drawAngleSVG(q.angleDeg, 220, false)
                                }
                            </div>

                            <!-- 参考直角 -->
                            <div class="ang-ref-box">
                                <span>参考：</span>
                                ${rightAngleMarkSVG(60)}
                                <span>这是直角（□）</span>
                            </div>

                            <!-- 选项 -->
                            <div class="ang-choices" id="ang-choices"></div>
                        </div>
                    </div>
                </div>
            `;

            this.bindPhase2Choices(q);
        },

        bindPhase2Choices: function (q) {
            const self = this;
            const options = H.shuffle(['锐角', '直角', '钝角']);

            H.renderChoices(options, 'ang-choices', function (idx, text) {
                const btns = state.container.querySelectorAll('.ang-choice-btn');
                btns.forEach(function (b) { b.style.pointerEvents = 'none'; });

                if (text === q.answer) {
                    // 正确
                    btns[idx].classList.add('ang-correct');
                    H.updateGuide(
                        state.phase2Index < state.questions.length - 1
                            ? `答对了！这是「${q.answer}」！`
                            : '最后一题也答对了！太厉害了！',
                        'gh-guide-text'
                    );
                    if (window.GameManager) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                    }
                    setTimeout(function () {
                        state.phase2Index++;
                        self.renderPhase2();
                    }, 900);
                } else {
                    // 错误
                    btns[idx].classList.add('ang-wrong');
                    state.mistakes++;
                    H.triggerError(state.container, `这是「${q.answer}」哦，不是「${text}」！`, btns[idx]);
                    if (window.GameManager) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    // 1.2s 后显示正确答案并继续
                    setTimeout(function () {
                        btns.forEach(function (b) {
                            if (b.textContent === q.answer) b.classList.add('ang-correct');
                        });
                        setTimeout(function () {
                            state.phase2Index++;
                            self.renderPhase2();
                        }, 700);
                    }, 1000);
                }
            });
        },

        /* ========== 结算 ========== */

        finishGame: function () {
            if (state.finished) return;
            state.finished = true;
            H.showSettlement(
                state.container,
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                '角之猎人闯关完成！你已经学会了角的分类！',
                'lvl_2_4_1'
            );
        }
    };

    window.CurrentGameModule = game;
})();
