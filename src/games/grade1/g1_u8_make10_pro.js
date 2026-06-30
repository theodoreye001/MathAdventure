/**
 * 一年级上册 第八单元：20以内的进位加法（凑十法正式版）
 * 路径: src/games/grade1/g1_u8_make10_pro.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        numA: 0,
        numB: 0,
        needed: 0,
        movedCount: 0,
        isFinished: false,
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
            this.generateLevel();
        },

        resetState: function() {
            state.isFinished = false;
            state.movedCount = 0;
            state.mistakes = 0;
        },

        injectStyles: function () {
            const styleId = 'g1-u8-make10-pro-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: rgba(255,255,255,0.9); padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    border: 3px solid #818cf8; font-size: 22px; font-weight: bold;
                    color: #1e1b4b; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .lab-scene {
                    flex: 1; width: 100%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 40px;
                }

                .boxes-container { display: flex; gap: 50px; }
                .cauldron {
                    width: 280px; height: 320px; background: rgba(255,255,255,0.05);
                    border: 4px dashed rgba(255,255,255,0.2); border-radius: 30px;
                    display: flex; flex-wrap: wrap; align-content: flex-start;
                    padding: 25px; gap: 12px; position: relative; transition: all 0.3s;
                }
                .cauldron.highlight { border-color: #fbbf24; background: rgba(251,191,36,0.1); }
                .cauldron.full { border-color: #10b981; background: rgba(16,185,129,0.1); animation: pulseGlow 2s infinite; }

                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.2); }
                    50% { box-shadow: 0 0 40px rgba(16,185,129,0.5); }
                }

                .box-label {
                    position: absolute; bottom: -45px; width: 100%; text-align: center;
                    color: #94a3b8; font-size: 20px; font-weight: bold;
                }

                .magic-orb {
                    width: 42px; height: 42px; border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #f87171, #b91c1c);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3); cursor: grab;
                }
                .magic-orb.blue { background: radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8); }
                .magic-orb.gold { background: radial-gradient(circle at 30% 30%, #fbbf24, #b45309); box-shadow: 0 0 15px #fbbf24; }

                .equation-board {
                    background: rgba(255,255,255,0.1); padding: 25px 60px;
                    border-radius: 50px; border: 2px solid rgba(255,255,255,0.2);
                    display: flex; align-items: center; gap: 20px; font-size: 40px; font-weight: bold;
                    color: white; backdrop-filter: blur(5px);
                }
                .eq-part { transition: all 0.5s; }
                .eq-highlight { color: #fbbf24; transform: scale(1.1); }
                .eq-result { color: #10b981; }

                /* 结算 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(2, 6, 23, 0.95);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(10px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px; text-align: center;
                    border: 6px solid #fbbf24;
                }
                .ui-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold;
                    border: none; border-radius: 20px; cursor: pointer; transition: 0.2s;
                }
                .btn-gold { background: #fbbf24; color: #1e1b4b; box-shadow: 0 6px 0 #d97706; }
                .btn-green { background: #10b981; color: white; box-shadow: 0 6px 0 #047857; }
                .btn-row { display: flex; gap: 20px; margin-top: 30px; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🧙</span>
                        <span id="guide-text">神奇的凑十法实验室</span>
                    </div>

                    <div class="lab-scene">
                        <div class="boxes-container">
                            <div class="cauldron" id="cauldron-left">
                                <div class="box-label">十位实验室 (已满: <span id="count-left">0</span>)</div>
                            </div>
                            <div class="cauldron" id="cauldron-right">
                                <div class="box-label">个位实验室</div>
                            </div>
                        </div>

                        <div class="equation-board" id="eq-board">
                            <!-- 动态填充 -->
                        </div>
                    </div>

                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size: 80px;">🏆</div>
                            <h2 style="font-size: 40px; color: #1e1b4b; margin: 15px 0;">凑十法大师！</h2>
                            <p style="font-size: 20px; color: #64748b;">你已经完美攻克了 20 以内的进位加法。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">获得：💰 40</div>
                            <div class="btn-row">
                                <button class="ui-btn btn-gold" id="btn-again">再练一题</button>
                                <button class="ui-btn btn-green" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const left = document.getElementById('cauldron-left');
            left.ondragover = e => { e.preventDefault(); left.classList.add('highlight'); };
            left.ondragleave = () => left.classList.remove('highlight');
            left.ondrop = e => this.handleDrop(e);

            document.getElementById('btn-again').onclick = () => this.generateLevel();
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        generateLevel: function () {
            state.isFinished = false;
            state.movedCount = 0;
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('cauldron-left').classList.remove('full');

            // 算式生成：9+?, 8+?, 7+?, 6+?
            state.numA = Math.floor(Math.random() * 4) + 6; // 6-9
            const minB = 11 - state.numA;
            state.numB = Math.floor(Math.random() * (10 - minB)) + minB;
            state.needed = 10 - state.numA;

            const left = document.getElementById('cauldron-left');
            const right = document.getElementById('cauldron-right');
            left.querySelectorAll('.magic-orb').forEach(o => o.remove());
            right.querySelectorAll('.magic-orb').forEach(o => o.remove());

            // 填充左边
            for (let i = 0; i < state.numA; i++) {
                const o = document.createElement('div');
                o.className = 'magic-orb';
                left.appendChild(o);
            }
            // 填充右边
            for (let i = 0; i < state.numB; i++) {
                const o = document.createElement('div');
                o.className = 'magic-orb blue';
                o.draggable = true;
                o.id = 'orb-' + i;
                o.ondragstart = e => e.dataTransfer.setData('id', o.id);
                right.appendChild(o);
            }

            this.updateUI();
            this.updateGuide(`🔊 题目：${state.numA} + ${state.numB}。快把右边的球拖过来凑满 10 个！`);
        },

        handleDrop: function (e) {
            if (state.isFinished) return;
            const left = document.getElementById('cauldron-left');
            left.classList.remove('highlight');
            
            const id = e.dataTransfer.getData('id');
            const orb = document.getElementById(id);
            if (orb && orb.parentElement.id === 'cauldron-right') {
                left.appendChild(orb);
                orb.draggable = false;
                state.movedCount++;
                this.updateUI();

                if (state.numA + state.movedCount === 10) {
                    this.triggerSuccess();
                }
            }
        },

        updateUI: function () {
            document.getElementById('count-left').textContent = state.numA + state.movedCount;
            const board = document.getElementById('eq-board');
            const remaining = state.numB - state.movedCount;

            if (state.numA + state.movedCount < 10) {
                board.innerHTML = `
                    <span class="eq-part">${state.numA}</span>
                    <span>+</span>
                    <span class="eq-part">${state.numB}</span>
                    <span>= ?</span>
                `;
            } else {
                board.innerHTML = `
                    <span class="eq-part">${state.numA} + ${state.numB}</span>
                    <span>=</span>
                    <span class="eq-highlight">10</span>
                    <span>+</span>
                    <span class="eq-part">${remaining}</span>
                    <span>=</span>
                    <span class="eq-result">${10 + remaining}</span>
                `;
            }
        },

        triggerSuccess: function () {
            state.isFinished = true;
            const left = document.getElementById('cauldron-left');
            left.classList.add('full');
            left.querySelectorAll('.magic-orb').forEach(o => o.classList.add('gold'));

            this.updateGuide(`✅ 凑十成功！现在变成了 10 + ${state.numB - state.needed} = ${state.numA + state.numB}`);
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 20);

            setTimeout(() => {
                if (window.GameManager) window.GameManager.addCoins(40);
                if (window.GameManager) window.GameManager.unlockLevel('lvl_1_d_1');
                document.getElementById('overlay').style.display = 'flex';
            }, 1500);
        },

        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#1e1b4b"; },

        triggerError: function (m) {
            state.mistakes++;
            const gt = document.getElementById('guide-text');
            const old = gt.textContent;
            gt.textContent = "❌ " + m; gt.style.color = "#ef4444";
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            setTimeout(() => { gt.textContent = old; gt.style.color = "#1e1b4b"; }, 2000);
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
