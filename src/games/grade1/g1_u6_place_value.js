/**
 * 一年级上册 第六单元：11~20各数的认识（数位初探）
 * 路径: src/games/grade1/g1_u6_place_value.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        phase: 1, // 1: 打包珍珠, 2: 填数位, 3: 比大小
        selectedPearls: [],
        totalPearls: 12,
        isFinished: false,
        mistakes: 0,
        compareProblem: { a: 15, b: 12 }
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
            state.selectedPearls = [];
            state.isFinished = false;
            state.mistakes = 0;
        },

        injectStyles: function () {
            const styleId = 'g1-u6-place-value-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: white; padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 3px solid #0ea5e9; font-size: 22px; font-weight: bold;
                    color: #0369a1; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .scene-container {
                    flex: 1; width: 100%; position: relative;
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    gap: 40px;
                }

                /* 阶段一：珍珠打包 */
                .pearl-pool {
                    width: 80%; display: flex; flex-wrap: wrap; gap: 20px;
                    justify-content: center; padding: 30px;
                    background: rgba(255,255,255,0.4); border-radius: 30px;
                    border: 4px dashed #7dd3fc;
                }
                .pearl {
                    width: 60px; height: 60px; background: radial-gradient(circle at 30% 30%, #fff, #e2e8f0);
                    border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    cursor: pointer; transition: all 0.2s; position: relative;
                    display: flex; align-items: center; justify-content: center;
                }
                .pearl.selected { border: 4px solid #0ea5e9; transform: scale(1.1); background: #bae6fd; }
                .pearl.bundled { animation: bundleMove 1s forwards; pointer-events: none; }

                @keyframes bundleMove {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.5); opacity: 0.5; }
                    100% { transform: scale(0); opacity: 0; }
                }

                /* 数位容器 */
                .place-value-boxes { display: flex; gap: 40px; }
                .pv-box {
                    width: 200px; height: 280px; background: white;
                    border: 4px solid #0ea5e9; border-radius: 20px;
                    display: flex; flex-direction: column; align-items: center;
                    position: relative; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .pv-label {
                    background: #0ea5e9; color: white; width: 100%; text-align: center;
                    padding: 8px 0; font-weight: bold; font-size: 20px;
                }
                .pv-content { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
                .necklace { font-size: 80px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); }

                .input-row { display: flex; gap: 40px; margin-top: 20px; }
                .pv-input {
                    width: 80px; height: 80px; border: 4px solid #0ea5e9; border-radius: 15px;
                    text-align: center; font-size: 48px; font-weight: bold; color: #0369a1;
                    background: white; outline: none;
                }

                /* 阶段三：比大小 */
                .compare-board {
                    display: flex; align-items: center; gap: 30px;
                    background: white; padding: 30px 60px; border-radius: 30px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1); border: 4px solid #0ea5e9;
                }
                .num-big { font-size: 80px; font-weight: bold; color: #0369a1; }
                .symbol-slot { width: 100px; height: 100px; border: 4px dashed #0ea5e9; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 60px; }

                .number-line {
                    width: 80%; height: 60px; background: #cbd5e1; border-radius: 30px;
                    position: relative; margin-top: 50px;
                }
                .line-marker {
                    position: absolute; top: -10px; width: 4px; height: 80px; background: #64748b;
                }
                .line-label { position: absolute; bottom: -30px; transform: translateX(-50%); font-weight: bold; }
                .dot-a { position: absolute; top: 15px; width: 30px; height: 30px; background: #ef4444; border-radius: 50%; border: 3px solid white; transition: all 1s; }
                .dot-b { position: absolute; top: 15px; width: 30px; height: 30px; background: #3b82f6; border-radius: 50%; border: 3px solid white; transition: all 1s; }

                /* 结算 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(255,255,255,0.98);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(10px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px; text-align: center;
                    border: 6px solid #0ea5e9;
                }
                .ui-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold;
                    border: none; border-radius: 20px; cursor: pointer; transition: 0.2s;
                    margin: 10px;
                }
                .btn-blue { background: #0ea5e9; color: white; box-shadow: 0 6px 0 #0284c7; }
                .btn-green { background: #10b981; color: white; box-shadow: 0 6px 0 #047857; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🏰</span>
                        <span id="guide-text">欢迎来到数位城堡！</span>
                    </div>

                    <!-- 阶段一：珍珠打包 -->
                    <div id="phase1" class="scene-container" style="display:flex">
                        <div class="pearl-pool" id="pearl-pool">
                            ${Array(12).fill(0).map((_, i) => `<div class="pearl" data-id="${i}"></div>`).join('')}
                        </div>
                        <button class="ui-btn btn-blue" id="btn-bundle" style="visibility:hidden">打包珍珠 (0/10)</button>
                    </div>

                    <!-- 阶段二：填数位 -->
                    <div id="phase2" class="scene-container">
                        <div class="place-value-boxes">
                            <div class="pv-box">
                                <div class="pv-label">十位</div>
                                <div class="pv-content" id="tens-box"></div>
                            </div>
                            <div class="pv-box">
                                <div class="pv-label">个位</div>
                                <div class="pv-content" id="ones-box"></div>
                            </div>
                        </div>
                        <div class="input-row">
                            <input type="text" class="pv-input" id="in-tens" maxlength="1" placeholder="?">
                            <input type="text" class="pv-input" id="in-ones" maxlength="1" placeholder="?">
                        </div>
                        <button class="ui-btn btn-blue" id="btn-check-pv">确定答案</button>
                    </div>

                    <!-- 阶段三：比大小 -->
                    <div id="phase3" class="scene-container">
                        <div class="compare-board">
                            <div class="num-big">15</div>
                            <div class="symbol-slot" id="comp-slot">?</div>
                            <div class="num-big">12</div>
                        </div>
                        <div class="input-row">
                            <button class="ui-btn btn-blue symbol-btn" data-s=">">&gt;</button>
                            <button class="ui-btn btn-blue symbol-btn" data-s="=">=</button>
                            <button class="ui-btn btn-blue symbol-btn" data-s="<">&lt;</button>
                        </div>
                        <div class="number-line">
                            <div class="dot-a" id="dot-15" style="left:0"></div>
                            <div class="dot-b" id="dot-12" style="left:0"></div>
                            ${[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => `
                                <div class="line-marker" style="left:${(n-10)*10}%">
                                    <div class="line-label">${n}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 结算 -->
                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size:80px">👑</div>
                            <h2 style="font-size:40px; color:#0369a1; margin:15px 0;">数位勇士！</h2>
                            <p style="font-size:20px; color:#475569;">你已经掌握了 11-20 数位的秘密。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">奖励：💰 30</div>
                            <div class="btn-row">
                                <button class="ui-btn btn-blue" id="btn-again">再玩一次</button>
                                <button class="ui-btn btn-green" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.bindEvents();
        },

        bindEvents: function () {
            // 阶段一：珍珠点击
            state.container.querySelectorAll('.pearl').forEach(p => {
                p.onclick = () => {
                    if (state.phase !== 1) return;
                    const id = p.dataset.id;
                    if (state.selectedPearls.includes(id)) {
                        state.selectedPearls = state.selectedPearls.filter(i => i !== id);
                        p.classList.remove('selected');
                    } else if (state.selectedPearls.length < 10) {
                        state.selectedPearls.push(id);
                        p.classList.add('selected');
                    }
                    this.updateBundleBtn();
                };
            });

            document.getElementById('btn-bundle').onclick = () => this.handleBundle();
            document.getElementById('btn-check-pv').onclick = () => this.checkPlaceValue();
            
            state.container.querySelectorAll('.symbol-btn').forEach(btn => {
                btn.onclick = () => this.handleCompare(btn.dataset.s);
            });

            document.getElementById('btn-again').onclick = () => { this.resetState(); this.renderLayout(); this.startPhase1(); };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        startPhase1: function () {
            this.updateGuide('🔊 10个珠子可以捆成一串。请圈出 [10] 颗珍珠打包吧！');
        },

        updateBundleBtn: function () {
            const btn = document.getElementById('btn-bundle');
            btn.style.visibility = state.selectedPearls.length > 0 ? 'visible' : 'hidden';
            btn.textContent = `打包珍珠 (${state.selectedPearls.length}/10)`;
            if (state.selectedPearls.length === 10) {
                btn.style.background = '#10b981';
                btn.style.boxShadow = '0 6px 0 #059669';
            } else {
                btn.style.background = '#0ea5e9';
                btn.style.boxShadow = '0 6px 0 #0284c7';
            }
        },

        handleBundle: function () {
            if (state.selectedPearls.length !== 10) {
                this.triggerError('提示：要刚好圈中 10 颗才能打包成项链哦！');
                return;
            }

            // 动画
            state.selectedPearls.forEach(id => {
                const p = state.container.querySelector(`.pearl[data-id="${id}"]`);
                p.classList.add('bundled');
            });

            this.updateGuide('🔊 10个一变成了1个十！珍珠打包成功。');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            
            setTimeout(() => this.startPhase2(), 1200);
        },

        startPhase2: function () {
            state.phase = 2;
            document.getElementById('phase1').style.display = 'none';
            document.getElementById('phase2').style.display = 'flex';
            
            // 填充内容
            document.getElementById('tens-box').innerHTML = '<div class="necklace">📿</div>';
            document.getElementById('ones-box').innerHTML = `
                <div style="display:flex; gap:10px">
                    <div class="pearl"></div><div class="pearl"></div>
                </div>
            `;
            this.updateGuide('🔊 瞧！1个十和2个一，合起来是多少？请在下方填入数位。');
        },

        checkPlaceValue: function () {
            const t = document.getElementById('in-tens').value;
            const o = document.getElementById('in-ones').value;

            if (t === '1' && o === '2') {
                this.updateGuide('🔊 正确！十位是 1，个位是 2，合起来就是 12。');
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                setTimeout(() => this.startPhase3(), 2000);
            } else {
                this.triggerError('数一数：这里有几串项链，几个散珍珠？');
                if (window.GameManager) window.GameManager.logError(state.levelData.levelId, "数位读取错误", `填入:十位${t} 个位${o}`);
            }
        },

        startPhase3: function () {
            state.phase = 3;
            document.getElementById('phase2').style.display = 'none';
            document.getElementById('phase3').style.display = 'flex';
            this.updateGuide('🔊 15 和 12 谁更大？先比十位，十位相同再比个位！');
            
            // 动画
            setTimeout(() => {
                document.getElementById('dot-15').style.left = '50%';
                document.getElementById('dot-12').style.left = '20%';
            }, 500);
        },

        handleCompare: function (s) {
            const slot = document.getElementById('comp-slot');
            if (s === '>') {
                slot.textContent = s;
                slot.style.color = '#10b981';
                this.updateGuide('🔊 没错！15 在 12 的右边，所以 15 > 12。');
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                setTimeout(() => this.finish(), 2000);
            } else {
                this.triggerError('提示：5 比 2 大，所以 15 应该大于 12 哦！');
            }
        },

        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#0369a1"; },

        triggerError: function (m) {
            state.mistakes++;
            const gt = document.getElementById('guide-text');
            const old = gt.textContent;
            gt.textContent = "❌ " + m; gt.style.color = "#dc2626";
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            setTimeout(() => { gt.textContent = old; gt.style.color = "#0369a1"; }, 2000);
        },

        finish: function () {
            state.isFinished = true;
            if (window.GameManager) {
                window.GameManager.addCoins(30);
                window.GameManager.unlockLevel('lvl_1_7_1');
            }
            document.getElementById('overlay').style.display = 'flex';
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
