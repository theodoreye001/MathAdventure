/**
 * 一年级上册 第七单元：认识钟表
 * 路径: src/games/grade1/g1_u7_clock.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        isFinished: false,
        tasks: [
            { h: 7, m: 0, text: '7 时了，该起床了！' },
            { h: 3, m: 30, text: '3 时半，快来吃午点吧！' },
            { h: 10, m: 0, text: '10 时整，该去做早操啦！' },
            { h: 8, m: 30, text: '8 时半，准备上床睡觉咯！' }
        ],
        currentTaskIndex: 0,
        currentH: 0, // 0-360 deg
        currentM: 0, // 0-360 deg
        isDragging: false,
        activeHand: null,
        mistakes: 0
    };

    const CurrentGameModule = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            this.injectStyles();
            this.resetState();
            this.renderLayout();
            this.startTask();
        },

        resetState: function() {
            state.currentTaskIndex = 0;
            state.isFinished = false;
            state.mistakes = 0;
            state.currentH = 0;
            state.currentM = 0;
        },

        injectStyles: function () {
            const styleId = 'g1-u7-clock-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(to bottom, #7dd3fc 0%, #e0f2fe 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: white; padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 3px solid #0369a1; font-size: 22px; font-weight: bold;
                    color: #0c4a6e; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .clock-tower {
                    flex: 1; width: 100%; position: relative;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 30px;
                }

                /* 钟楼视觉 */
                .tower-bg {
                    width: 450px; height: 550px; background: #94a3b8;
                    border: 8px solid #475569; border-radius: 40px 40px 10px 10px;
                    position: relative; display: flex; align-items: center; justify-content: center;
                }
                .tower-roof {
                    position: absolute; top: -100px; left: -25px;
                    border-left: 250px solid transparent; border-right: 250px solid transparent;
                    border-bottom: 100px solid #ef4444;
                }

                /* 钟面 */
                .clock-face {
                    width: 320px; height: 320px; background: white;
                    border: 12px solid #334155; border-radius: 50%;
                    position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
                }
                .clock-dot {
                    position: absolute; top: 50%; left: 50%; width: 20px; height: 20px;
                    background: #1e293b; border-radius: 50%; transform: translate(-50%, -50%); z-index: 50;
                }
                .clock-num {
                    position: absolute; width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: bold; color: #1e293b;
                }

                /* 指针 */
                .hand {
                    position: absolute; bottom: 50%; left: 50%;
                    transform-origin: bottom center; border-radius: 10px;
                    cursor: grab; transition: transform 0.1s;
                }
                .hand:active { cursor: grabbing; }
                .hour-hand { width: 12px; height: 90px; background: #1e293b; z-index: 30; }
                .minute-hand { width: 8px; height: 130px; background: #ef4444; z-index: 40; }

                .bird-mascot {
                    position: absolute; top: 20px; right: 20px; font-size: 60px;
                    animation: birdFloat 3s infinite ease-in-out;
                }
                @keyframes birdFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

                .check-btn {
                    padding: 15px 50px; font-size: 24px; font-weight: bold;
                    background: #0ea5e9; color: white; border: none; border-radius: 20px;
                    box-shadow: 0 6px 0 #0284c7; cursor: pointer; transition: 0.2s;
                }
                .check-btn:hover { transform: translateY(-3px); }
                .check-btn:active { transform: translateY(3px); box-shadow: 0 0 0 #0284c7; }

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
                .btn-row { display: flex; gap: 20px; margin-top: 30px; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🐦</span>
                        <span id="guide-text">时间小鸟的钟楼</span>
                    </div>

                    <div class="clock-tower">
                        <div class="tower-bg">
                            <div class="tower-roof"></div>
                            <div class="bird-mascot">🐦</div>
                            <div class="clock-face" id="clock-face">
                                <div class="clock-dot"></div>
                                ${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
                                    const ang = i * 30;
                                    const rad = (ang - 90) * (Math.PI / 180);
                                    const x = 160 + 120 * Math.cos(rad) - 20;
                                    const y = 160 + 120 * Math.sin(rad) - 20;
                                    return `<div class="clock-num" style="left:${x}px; top:${y}px">${n}</div>`;
                                }).join('')}
                                <div class="hand hour-hand" id="hour-hand"></div>
                                <div class="hand minute-hand" id="minute-hand"></div>
                            </div>
                        </div>
                        <button class="check-btn" id="btn-check">检查时间</button>
                    </div>

                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size:80px">⏰</div>
                            <h2 style="font-size:40px; color:#0c4a6e; margin:15px 0;">时间守护者！</h2>
                            <p style="font-size:20px; color:#475569;">你已经学会了看整时和半时。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">奖励：💰 30</div>
                            <div class="btn-row">
                                <button class="check-btn" id="btn-again">再练一次</button>
                                <button class="check-btn" style="background:#10b981; box-shadow:0 6px 0 #059669" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.bindEvents();
        },

        bindEvents: function () {
            const face = document.getElementById('clock-face');
            const hHand = document.getElementById('hour-hand');
            const mHand = document.getElementById('minute-hand');

            const handleMove = (e) => {
                if (!state.isDragging) return;
                const rect = face.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                const rad = Math.atan2(clientY - centerY, clientX - centerX);
                let deg = rad * (180 / Math.PI) + 90;
                if (deg < 0) deg += 360;

                // 吸附到 30 度(整时/半时)
                const snap = 6; // 分针吸附到每 6 度(每分钟)
                deg = Math.round(deg / snap) * snap;

                if (state.activeHand === 'minute') {
                    state.currentM = deg;
                    mHand.style.transform = `rotate(${deg}deg)`;
                    // 联动：分针动，时针按比例动
                    // 时针角度 = (分针度数 / 12) + (基础时针度数)
                    // 简化：我们允许直接拨动分针，但最终校验看角度
                } else {
                    state.currentH = deg;
                    hHand.style.transform = `rotate(${deg}deg)`;
                }
            };

            const handleUp = () => { state.isDragging = false; state.activeHand = null; };

            mHand.onmousedown = (e) => { e.stopPropagation(); state.isDragging = true; state.activeHand = 'minute'; };
            hHand.onmousedown = (e) => { e.stopPropagation(); state.isDragging = true; state.activeHand = 'hour'; };
            mHand.ontouchstart = (e) => { e.stopPropagation(); state.isDragging = true; state.activeHand = 'minute'; };
            hHand.ontouchstart = (e) => { e.stopPropagation(); state.isDragging = true; state.activeHand = 'hour'; };

            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleUp);

            document.getElementById('btn-check').onclick = () => this.verify();
            document.getElementById('btn-again').onclick = () => { this.resetState(); this.renderLayout(); this.startTask(); };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        startTask: function () {
            const task = state.tasks[state.currentTaskIndex];
            this.updateGuide(`🔊 小鸟喊道：“${task.text}”`);
            // 随机初始化指针
            state.currentH = Math.floor(Math.random() * 12) * 30;
            state.currentM = Math.floor(Math.random() * 12) * 30;
            document.getElementById('hour-hand').style.transform = `rotate(${state.currentH}deg)`;
            document.getElementById('minute-hand').style.transform = `rotate(${state.currentM}deg)`;
        },

        verify: function () {
            const task = state.tasks[state.currentTaskIndex];
            // 预期角度
            const targetM = (task.m / 60) * 360;
            const targetH = (task.h % 12) * 30 + (task.m / 60) * 30;

            const diffM = Math.abs(state.currentM - targetM);
            const diffH = Math.abs(state.currentH - targetH);

            // 允许 10 度以内的误差
            if (diffM < 10 && diffH < 15) {
                this.updateGuide('✅ 拨对啦！你真准时！');
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                state.currentTaskIndex++;
                if (state.currentTaskIndex >= state.tasks.length) {
                    setTimeout(() => this.finish(), 1500);
                } else {
                    setTimeout(() => this.startTask(), 1500);
                }
            } else {
                this.triggerError(task.m === 0 ? `提示：整时，分针应该指向 12 哦！` : `提示：半时，分针指向 6，时针在两个数中间！`);
                if (window.GameManager) window.GameManager.logError(state.levelData.levelId, "认读钟表错误", `目标:${task.h}:${task.m} 当前:${state.currentH/30}:${state.currentM/6}`);
            }
        },

        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#0c4a6e"; },

        triggerError: function (m) {
            state.mistakes++;
            const gt = document.getElementById('guide-text');
            const old = gt.textContent;
            gt.textContent = "❌ " + m; gt.style.color = "#dc2626";
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            setTimeout(() => { gt.textContent = old; gt.style.color = "#0c4a6e"; }, 2000);
        },

        finish: function () {
            state.isFinished = true;
            if (window.GameManager) {
                window.GameManager.addCoins(30);
                window.GameManager.unlockLevel('lvl_1_8_1');
            }
            document.getElementById('overlay').style.display = 'flex';
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
