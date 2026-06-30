/**
 * 一年级上册 第二单元：位置（上下前后与左右）
 * 路径: src/games/grade1/g1_u2_position.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        phase: 1, // 1: 上下前后, 2: 左右辨别
        currentTask: null,
        consecutiveCorrect: 0,
        isFinished: false,
        mistakes: 0,
        // 方位定义
        positions: {
            up: { id: 'up', name: '上', style: 'bottom: 220px; left: 50%; z-index: 30;' },
            down: { id: 'down', name: '下', style: 'bottom: 20px; left: 50%; z-index: 30;' },
            front: { id: 'front', name: '前', style: 'bottom: 100px; left: 45%; z-index: 40; transform: translateX(-50%) scale(1.2);' },
            back: { id: 'back', name: '后', style: 'bottom: 110px; left: 55%; z-index: 10; opacity: 0.7; clip-path: inset(0 0 0 30%);' }
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
            this.nextTask();
        },

        resetState: function() {
            state.phase = 1;
            state.consecutiveCorrect = 0;
            state.isFinished = false;
            state.mistakes = 0;
        },

        injectStyles: function () {
            const styleId = 'g1-u2-position-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(to bottom, #bae6fd 0%, #f0f9ff 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: white; padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 3px solid #3b82f6; font-size: 24px; font-weight: bold;
                    color: #1e3a8a; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .scene-container {
                    flex: 1; width: 100%; position: relative;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }

                /* 树屋渲染 */
                .treehouse-stage { width: 500px; height: 450px; position: relative; }
                .tree-trunk {
                    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
                    width: 80px; height: 350px; background: #5d4037; border-radius: 10px 10px 0 0; z-index: 15;
                }
                .tree-leaves {
                    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                    width: 400px; height: 300px; background: #166534; border-radius: 50% 50% 40% 40%;
                    z-index: 5; box-shadow: inset 0 -20px 40px rgba(0,0,0,0.2);
                }
                .mini-house {
                    position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
                    width: 160px; height: 140px; background: #a1887f; border: 4px solid #5d4037;
                    border-radius: 5px; z-index: 20;
                }
                .house-roof {
                    position: absolute; top: -70px; left: -20px;
                    border-left: 100px solid transparent; border-right: 100px solid transparent;
                    border-bottom: 70px solid #ef4444; z-index: 21;
                }
                .house-door {
                    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
                    width: 50px; height: 80px; background: #4e342e; border-radius: 5px 5px 0 0;
                }

                .squirrel {
                    position: absolute; font-size: 60px; transform: translateX(-50%);
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* 左右辨别 UI */
                .lr-ui { display: none; width: 100%; height: 100%; position: relative; }
                .character-back {
                    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 150px; transition: transform 0.5s;
                }
                .hand-ref {
                    position: absolute; bottom: 40px; width: 120px; height: 120px;
                    background: white; border: 4px solid #e2e8f0; border-radius: 20px;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-weight: bold; color: #64748b; transition: 0.3s;
                }
                .hand-ref.left { left: 40px; }
                .hand-ref.right { right: 40px; }
                .hand-ref.glow {
                    border-color: #fbbf24; background: #fffbeb; color: #b45309;
                    box-shadow: 0 0 20px #fbbf24; transform: scale(1.1);
                }

                /* 按钮 */
                .btn-row { margin-bottom: 40px; display: flex; gap: 20px; z-index: 100; }
                .action-btn {
                    padding: 15px 40px; font-size: 26px; font-weight: bold;
                    background: white; border: 4px solid #3b82f6; border-radius: 20px;
                    color: #1d4ed8; cursor: pointer; transition: all 0.2s;
                    box-shadow: 0 6px 0 #2563eb;
                }
                .action-btn:hover { transform: translateY(-3px); box-shadow: 0 9px 0 #2563eb; }
                .action-btn:active { transform: translateY(3px); box-shadow: 0 0 0 #2563eb; }

                /* 结算面板 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(255,255,255,0.98);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(10px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px; text-align: center;
                    border: 6px solid #10b981; box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }
                .settlement-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold; margin: 10px;
                    border: none; border-radius: 20px; cursor: pointer; transition: 0.2s;
                }
                .btn-blue { background: #3b82f6; color: white; box-shadow: 0 6px 0 #1d4ed8; }
                .btn-green { background: #10b981; color: white; box-shadow: 0 6px 0 #047857; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🧙</span>
                        <span id="guide-text">小算精在哪里呢？</span>
                    </div>

                    <div id="phase1" class="scene-container">
                        <div class="treehouse-stage">
                            <div class="tree-leaves"></div>
                            <div class="tree-trunk"></div>
                            <div class="mini-house">
                                <div class="house-roof"></div>
                                <div class="house-door"></div>
                            </div>
                            <div id="squirrel" class="squirrel">🐿️</div>
                        </div>
                        <div class="btn-row">
                            <button class="action-btn" data-v="up">上</button>
                            <button class="action-btn" data-v="down">下</button>
                            <button class="action-btn" data-v="front">前</button>
                            <button class="action-btn" data-v="back">后</button>
                        </div>
                    </div>

                    <div id="phase2" class="scene-container lr-ui">
                        <div class="character-back" id="hero">🧙</div>
                        <div class="hand-ref left" id="hand-l">
                            <span style="font-size:50px">👋</span>
                            <span>左手</span>
                        </div>
                        <div class="hand-ref right" id="hand-r">
                            <span style="font-size:50px">👋</span>
                            <span>右手</span>
                        </div>
                        <div class="btn-row" style="position:absolute; bottom:40px;">
                            <button class="action-btn" data-v="left">向左转</button>
                            <button class="action-btn" data-v="right">向右转</button>
                        </div>
                    </div>

                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size:80px">🐿️</div>
                            <h2 style="font-size:40px; color:#1e3a8a">位置探险完成！</h2>
                            <p style="font-size:22px; color:#64748b">你已经掌握了上下前后和左右！</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">奖励：💰 15</div>
                            <div class="btn-row" style="margin-top:30px">
                                <button class="settlement-btn btn-blue" id="btn-again">再练一次</button>
                                <button class="settlement-btn btn-green" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            state.container.querySelectorAll('.action-btn').forEach(b => {
                b.onclick = () => this.handleAction(b.dataset.v);
            });
            document.getElementById('btn-again').onclick = () => { this.resetState(); this.renderLayout(); this.nextTask(); };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        nextTask: function () {
            if (state.phase === 1) {
                const keys = Object.keys(state.positions);
                state.currentTask = state.positions[keys[Math.floor(Math.random() * keys.length)]];
                document.getElementById('squirrel').style.cssText = state.currentTask.style;
                this.updateGuide(`🔊 小算精在树屋的哪一面？`);
            } else {
                const side = Math.random() > 0.5 ? 'left' : 'right';
                state.currentTask = { id: side, name: side === 'left' ? '左' : '右' };
                this.updateGuide(`🔊 指令：请点击 [向${state.currentTask.name}转]`);
                document.getElementById('hand-l').classList.toggle('glow', side === 'left');
                document.getElementById('hand-r').classList.toggle('glow', side === 'right');
            }
        },

        handleAction: function (v) {
            if (state.isFinished) return;
            if (v === state.currentTask.id) {
                state.consecutiveCorrect++;
                this.showFeedback(true);
                if (state.phase === 1 && state.consecutiveCorrect >= 3) {
                    setTimeout(() => {
                        state.phase = 2; state.consecutiveCorrect = 0;
                        document.getElementById('phase1').style.display = 'none';
                        document.getElementById('phase2').style.display = 'block';
                        this.nextTask();
                    }, 1000);
                } else if (state.phase === 2 && state.consecutiveCorrect >= 5) {
                    setTimeout(() => this.finish(), 1000);
                } else {
                    setTimeout(() => this.nextTask(), 1000);
                }
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            } else {
                state.consecutiveCorrect = 0;
                this.showFeedback(false);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, state.currentTask.id, v);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
                setTimeout(() => this.nextTask(), 1000);
            }
        },

        showFeedback: function (isCorrect) {
            const gt = document.getElementById('guide-text');
            gt.textContent = isCorrect ? "✅ 太棒了！" : "❌ 找错啦，再试试！";
            gt.style.color = isCorrect ? "#10b981" : "#ef4444";
            if (state.phase === 2 && isCorrect) {
                const h = document.getElementById('hero');
                h.style.transform = `translate(-50%, -50%) rotate(${state.currentTask.id === 'left' ? -30 : 30}deg)`;
                setTimeout(() => h.style.transform = 'translate(-50%, -50%) rotate(0deg)', 500);
            }
        },

        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#1e3a8a"; },

        finish: function () {
            state.isFinished = true;
            if (window.GameManager) {
                window.GameManager.addCoins(15);
                window.GameManager.unlockLevel('lvl_1_3_1');
            }
            document.getElementById('overlay').style.display = 'flex';
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
