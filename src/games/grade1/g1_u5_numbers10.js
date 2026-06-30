/**
 * 一年级上册 第五单元：6~10的认识与加减法
 * 路径: src/games/grade1/g1_u5_numbers10.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        phase: 1, // 1: 一图四式, 2: 连加过山车
        isFinished: false,
        mistakes: 0,
        // 阶段一数据
        p1: {
            left: 6, right: 3, total: 9,
            equations: [
                { id: 'eq1', parts: [null, '+', null, '=', null], target: [6, '+', 3, '=', 9] },
                { id: 'eq2', parts: [null, '+', null, '=', null], target: [3, '+', 6, '=', 9] },
                { id: 'eq3', parts: [null, '-', null, '=', null], target: [9, '-', 6, '=', 3] },
                { id: 'eq4', parts: [null, '-', null, '=', null], target: [9, '-', 3, '=', 6] }
            ],
            solvedCount: 0
        },
        // 阶段二数据
        p2: {
            base: 3, s1: 2, s2: 4, total: 9,
            currentInput: [],
            currentStep: 0 // 0: input 3+2, 1: input +4, 2: total
        }
    };

    const CurrentGameModule = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            this.injectStyles();
            this.resetState();
            this.renderLayout();
            this.startPhase1();
        },

        resetState: function() {
            state.phase = 1;
            state.isFinished = false;
            state.mistakes = 0;
            state.p1.solvedCount = 0;
            state.p1.equations.forEach(eq => eq.parts = eq.parts.map(p => (p === '+' || p === '-' || p === '=') ? p : null));
            state.p2.currentStep = 0;
        },

        injectStyles: function () {
            const styleId = 'g1-u5-numbers10-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: white; padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 3px solid #f59e0b; font-size: 22px; font-weight: bold;
                    color: #92400e; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .scene-container {
                    flex: 1; width: 100%; position: relative;
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                }

                /* 阶段一：一图四式 */
                .flower-display {
                    display: flex; gap: 60px; padding: 30px; background: rgba(255,255,255,0.4);
                    border-radius: 30px; border: 4px dashed #fbbf24; margin-bottom: 30px;
                }
                .flower-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .flower { font-size: 45px; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.1)); }

                .equation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 80%; }
                .eq-row {
                    background: white; padding: 15px; border-radius: 20px;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    border: 3px solid #fbbf24;
                }
                .slot {
                    width: 60px; height: 60px; border: 2px dashed #d1d5db;
                    border-radius: 12px; display: flex; align-items: center;
                    justify-content: center; font-size: 32px; font-weight: bold;
                    background: #f9fafb; transition: all 0.2s;
                }
                .slot.filled { border: 2px solid #f59e0b; background: #fffbeb; color: #b45309; }
                .symbol { font-size: 32px; font-weight: bold; color: #92400e; }

                .card-dock {
                    margin-top: 30px; display: flex; gap: 15px;
                    padding: 20px; background: white; border-radius: 25px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .num-card {
                    width: 70px; height: 70px; background: #fbbf24; border-radius: 15px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 36px; font-weight: bold; color: white; cursor: grab;
                    box-shadow: 0 6px 0 #d97706; transition: 0.2s;
                }
                .num-card:hover { transform: translateY(-3px); }

                /* 阶段二：过山车 */
                .roller-coaster {
                    width: 800px; height: 200px; position: relative;
                    border-bottom: 8px solid #64748b; margin-bottom: 50px;
                }
                .track {
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 10px;
                    background: repeating-linear-gradient(90deg, #94a3b8, #94a3b8 20px, transparent 20px, transparent 40px);
                }
                .car {
                    position: absolute; bottom: 15px; left: 50px; width: 180px; height: 80px;
                    background: #f43f5e; border-radius: 15px 40px 10px 10px;
                    display: flex; align-items: center; justify-content: space-around;
                    padding: 0 10px; transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 0 #9f1239;
                }
                .passenger { font-size: 30px; }
                .station {
                    position: absolute; bottom: -40px; text-align: center; font-weight: bold; color: #475569;
                }

                .chain-eq {
                    font-size: 50px; font-weight: bold; color: #92400e;
                    background: white; padding: 20px 50px; border-radius: 30px;
                    border: 5px solid #fbbf24; display: flex; gap: 15px;
                }
                .eq-part { min-width: 40px; text-align: center; }

                /* 结算 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(255,255,255,0.98);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(10px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px; text-align: center;
                    border: 6px solid #fbbf24; box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }
                .ui-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold;
                    border: none; border-radius: 20px; cursor: pointer; transition: 0.2s;
                    margin: 10px;
                }
                .btn-gold { background: #fbbf24; color: #92400e; box-shadow: 0 6px 0 #d97706; }
                .btn-green { background: #10b981; color: white; box-shadow: 0 6px 0 #047857; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🐿️</span>
                        <span id="guide-text">一图四式大揭秘！</span>
                    </div>

                    <!-- 阶段一 -->
                    <div id="phase1" class="scene-container" style="display:flex">
                        <div class="flower-display">
                            <div class="flower-group">
                                ${Array(6).fill('<div class="flower">🌸</div>').join('')}
                            </div>
                            <div style="width:4px; background:#fbbf24; opacity:0.3"></div>
                            <div class="flower-group">
                                ${Array(3).fill('<div class="flower">🌻</div>').join('')}
                            </div>
                        </div>
                        <div class="equation-grid">
                            ${state.p1.equations.map(eq => `
                                <div class="eq-row" data-eq="${eq.id}">
                                    ${eq.parts.map((p, i) => 
                                        (p === '+' || p === '-' || p === '=') 
                                        ? `<span class="symbol">${p}</span>` 
                                        : `<div class="slot" data-idx="${i}">?</div>`
                                    ).join('')}
                                </div>
                            `).join('')}
                        </div>
                        <div class="card-dock">
                            ${[3, 6, 9].map(n => `<div class="num-card" draggable="true" data-n="${n}">${n}</div>`).join('')}
                        </div>
                    </div>

                    <!-- 阶段二 -->
                    <div id="phase2" class="scene-container">
                        <div class="roller-coaster">
                            <div class="track"></div>
                            <div class="car" id="car">
                                <div class="passenger">👦</div><div class="passenger">👧</div><div class="passenger">👶</div>
                            </div>
                            <div class="station" style="left:50px">起点(3人)</div>
                            <div class="station" style="left:350px">第一站(+2人)</div>
                            <div class="station" style="left:650px">第二站(+4人)</div>
                        </div>
                        <div class="chain-eq" id="chain-eq">
                            <div class="eq-part">3</div>
                            <div class="eq-part">+</div>
                            <div class="eq-part">2</div>
                            <div class="eq-part">+</div>
                            <div class="eq-part">4</div>
                            <div class="eq-part">=</div>
                            <div class="eq-part" id="chain-res" style="border-bottom:3px solid #fbbf24; cursor:pointer">?</div>
                        </div>
                        <div class="card-dock" id="p2-dock">
                            ${[5, 7, 9].map(n => `<div class="num-card" data-n="${n}">${n}</div>`).join('')}
                        </div>
                    </div>

                    <!-- 结算 -->
                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size:80px">🏅</div>
                            <h2 style="font-size:40px; color:#92400e; margin:15px 0;">运算大师！</h2>
                            <p style="font-size:20px; color:#475569;">你已经掌握了 6-10 的组成与连加技巧。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">获得：💰 25</div>
                            <div class="btn-row">
                                <button class="ui-btn btn-gold" id="btn-again">再玩一次</button>
                                <button class="ui-btn btn-green" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.bindEvents();
        },

        bindEvents: function () {
            // 阶段一拖拽
            state.container.querySelectorAll('.num-card').forEach(card => {
                card.ondragstart = e => e.dataTransfer.setData('num', card.dataset.n);
                card.onclick = () => { if(state.phase === 2) this.handleP2Click(parseInt(card.dataset.n)); };
            });

            state.container.querySelectorAll('.slot').forEach(slot => {
                slot.ondragover = e => e.preventDefault();
                slot.ondrop = e => this.handleP1Drop(e, slot);
            });

            document.getElementById('btn-again').onclick = () => { this.resetState(); this.renderLayout(); this.startPhase1(); };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        startPhase1: function () {
            this.updateGuide('🔊 观察花朵，填满这四个神奇的算式吧！');
        },

        handleP1Drop: function (e, slot) {
            const num = parseInt(e.dataTransfer.getData('num'));
            const eqId = slot.parentElement.dataset.eq;
            const slotIdx = parseInt(slot.dataset.idx);
            const eq = state.p1.equations.find(q => q.id === eqId);

            if (num === eq.target[slotIdx]) {
                slot.textContent = num;
                slot.classList.add('filled');
                eq.parts[slotIdx] = num;
                this.checkP1Equation(eq);
            } else {
                this.triggerError(`提示：这个数放这里不对哦，再想一想！`);
                if (window.GameManager) window.GameManager.logError(state.levelData.levelId, "一图四式填空", `算式:${eqId} 位置:${slotIdx} 错误值:${num}`);
            }
        },

        checkP1Equation: function (eq) {
            const isFull = eq.parts.every(p => p !== null);
            if (isFull) {
                eq.completed = true;
                state.p1.solvedCount++;
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                if (state.p1.solvedCount === 4) {
                    setTimeout(() => this.startPhase2(), 1000);
                }
            }
        },

        startPhase2: function () {
            state.phase = 2;
            document.getElementById('phase1').style.display = 'none';
            document.getElementById('phase2').style.display = 'flex';
            this.updateGuide('🔊 连加过山车出发了！第一站上 2 人，第二站上 4 人...');
            
            const car = document.getElementById('car');
            // 动画
            setTimeout(() => {
                car.style.left = '350px';
                this.addPassengers(2);
                this.updateGuide('🔊 第一站到了，又上来了 2 人！现在一共多少人？');
            }, 2000);
        },

        addPassengers: function(n) {
            const car = document.getElementById('car');
            for(let i=0; i<n; i++) {
                const p = document.createElement('div');
                p.className = 'passenger';
                p.textContent = Math.random() > 0.5 ? '👦' : '👧';
                p.style.opacity = '0';
                car.appendChild(p);
                setTimeout(() => p.style.opacity = '1', 500);
            }
        },

        handleP2Click: function(n) {
            if (state.p2.currentStep === 0) {
                // 3 + 2 = 5 ?
                if (n === 5) {
                    this.updateGuide('🔊 没错，3 + 2 = 5。过山车继续出发！');
                    state.p2.currentStep = 1;
                    const car = document.getElementById('car');
                    setTimeout(() => {
                        car.style.left = '650px';
                        this.addPassengers(4);
                        this.updateGuide('🔊 第二站到了，上来了 4 人！最后车上一共多少人？');
                    }, 1500);
                } else {
                    this.triggerError('不对哦，3 + 2 应该是多少呢？');
                }
            } else if (state.p2.currentStep === 1) {
                if (n === 9) {
                    document.getElementById('chain-res').textContent = 9;
                    this.updateGuide('🔊 太棒了！3 + 2 + 4 = 9。全部正确！');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 15);
                    setTimeout(() => this.finish(), 2000);
                } else {
                    this.triggerError('再数一数，5 加上新来的 4 人是多少？');
                }
            }
        },

        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#92400e"; },

        triggerError: function (m) {
            state.mistakes++;
            const gt = document.getElementById('guide-text');
            const old = gt.textContent;
            gt.textContent = "❌ " + m; gt.style.color = "#dc2626";
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            setTimeout(() => { gt.textContent = old; gt.style.color = "#92400e"; }, 2000);
        },

        finish: function () {
            state.isFinished = true;
            if (window.GameManager) {
                window.GameManager.addCoins(25);
                window.GameManager.unlockLevel('lvl_1_6_1');
            }
            document.getElementById('overlay').style.display = 'flex';
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
