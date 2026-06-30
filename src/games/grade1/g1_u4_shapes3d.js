/**
 * 一年级上册 第四单元：认识图形
 * 路径: src/games/grade1/g1_u4_shapes3d.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        phase: 1, // 1: 分类任务, 2: 盲摸挑战
        totalToClassify: 8,
        classifiedCount: 0,
        isFinished: false,
        mistakes: 0,
        items: [
            { id: 'i1', shape: 'cube', emoji: '🎲' },
            { id: 'i2', shape: 'cuboid', emoji: '📦' },
            { id: 'i3', shape: 'cylinder', emoji: '🥤' },
            { id: 'i4', shape: 'sphere', emoji: '⚽' },
            { id: 'i5', shape: 'cube', emoji: '🧊' },
            { id: 'i6', shape: 'cuboid', emoji: '📖' },
            { id: 'i7', shape: 'cylinder', emoji: '🧻' },
            { id: 'i8', shape: 'sphere', emoji: '🏀' }
        ],
        challenges: [
            { desc: '它到处平平的、方方的，每个面都一样大。', answer: 'cube' },
            { desc: '它长长的、方方的，有 6 个平平的面。', answer: 'cuboid' },
            { desc: '它直直的，上下两个圆圆的面一样大，横着能滚动。', answer: 'cylinder' },
            { desc: '它圆圆的，没有平平的面，可以到处滚动。', answer: 'sphere' }
        ],
        currentChallengeIndex: 0
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

        resetState: function () {
            state.phase = 1;
            state.classifiedCount = 0;
            state.currentChallengeIndex = 0;
            state.isFinished = false;
            state.mistakes = 0;
            
            // 随机打乱物品顺序
            state.items.sort(() => Math.random() - 0.5);
            // 随机打乱挑战顺序
            state.challenges.sort(() => Math.random() - 0.5);
        },

        injectStyles: function () {
            const styleId = 'g1-u4-shapes3d-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: rgba(255,255,255,0.95); padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    border: 3px solid #64748b; font-size: 22px; font-weight: bold;
                    color: #1e293b; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .scene-container {
                    flex: 1; width: 100%; position: relative;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }

                /* 分类池 */
                .items-pool {
                    display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;
                    padding: 20px; background: rgba(255,255,255,0.05);
                    border-radius: 25px; width: 85%; margin-bottom: 30px;
                    border: 2px solid rgba(255,255,255,0.1);
                }
                .shape-item {
                    width: 80px; height: 80px; background: white; border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 45px; cursor: grab; box-shadow: 0 8px 0 #cbd5e1;
                    transition: transform 0.2s;
                }
                .shape-item:active { cursor: grabbing; transform: scale(1.1) rotate(5deg); }

                /* 箱子区域 */
                .boxes-area { display: flex; gap: 20px; justify-content: center; width: 100%; }
                .shape-box {
                    width: 170px; height: 200px; background: rgba(255,255,255,0.08);
                    border: 3px dashed #64748b; border-radius: 20px;
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: flex-end; padding-bottom: 15px; position: relative;
                    transition: all 0.3s;
                }
                .shape-box.highlight { background: rgba(255,255,255,0.15); border-color: #fbbf24; transform: scale(1.05); }
                .box-label {
                    background: #334155; color: white; padding: 6px 20px;
                    border-radius: 12px; font-size: 20px; font-weight: bold;
                }
                .box-content {
                    position: absolute; inset: 10px; display: flex; flex-wrap: wrap;
                    gap: 5px; justify-content: center; align-content: flex-start; pointer-events: none;
                }

                /* 盲摸挑战 */
                .challenge-box { display: none; flex-direction: column; align-items: center; gap: 50px; }
                .desc-bubble {
                    background: white; padding: 25px 45px; border-radius: 25px;
                    font-size: 26px; font-weight: bold; color: #1e293b;
                    max-width: 650px; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                    border: 4px solid #3b82f6;
                }
                .options-grid { display: flex; gap: 50px; perspective: 1000px; }

                .geom { cursor: pointer; transition: transform 0.3s; }
                .geom:hover { transform: scale(1.1); }

                /* 3D Visuals */
                .cube-visual {
                    width: 100px; height: 100px; position: relative; transform-style: preserve-3d;
                    transform: rotateX(-20deg) rotateY(30deg);
                }
                .cube-visual div { position: absolute; width: 100px; height: 100px; border: 2px solid #fff; }
                .c-f { background: #3b82f6; transform: translateZ(50px); }
                .c-t { background: #60a5fa; transform: rotateX(90deg) translateZ(50px); }
                .c-r { background: #2563eb; transform: rotateY(90deg) translateZ(50px); }

                .cuboid-visual {
                    width: 140px; height: 80px; position: relative; transform-style: preserve-3d;
                    transform: rotateX(-20deg) rotateY(30deg);
                }
                .cuboid-visual div { position: absolute; border: 2px solid #fff; }
                .cd-f { width: 140px; height: 80px; background: #10b981; transform: translateZ(40px); }
                .cd-t { width: 140px; height: 80px; background: #34d399; transform: rotateX(90deg) translateZ(40px); }
                .cd-r { width: 80px; height: 80px; background: #059669; transform: rotateY(90deg) translateZ(100px); }

                .cyl-visual { width: 80px; height: 120px; position: relative; transform-style: preserve-3d; transform: rotateX(-15deg); }
                .cyl-b { width: 80px; height: 120px; background: linear-gradient(to right, #f59e0b, #fbbf24, #d97706); border-radius: 5px; border: 2px solid #fff; }
                .cyl-t { position: absolute; top: -20px; left: 0; width: 80px; height: 40px; background: #fcd34d; border-radius: 50%; border: 2px solid #fff; }

                .sphere-visual { width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f87171, #991b1b); box-shadow: inset -10px -10px 20px rgba(0,0,0,0.5); }

                /* 结算 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(15, 23, 42, 0.95);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(10px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px; text-align: center;
                    border: 6px solid #fbbf24; box-shadow: 0 30px 60px rgba(0,0,0,0.3);
                }
                .btn-row { display: flex; gap: 20px; justify-content: center; margin-top: 30px; }
                .ui-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold;
                    border: none; border-radius: 20px; cursor: pointer; transition: 0.2s;
                }
                .btn-gold { background: #fbbf24; color: #1e293b; box-shadow: 0 6px 0 #d97706; }
                .btn-green { background: #10b981; color: white; box-shadow: 0 6px 0 #047857; }
                .btn-gray { background: #64748b; color: white; box-shadow: 0 6px 0 #475569; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🐢</span>
                        <span id="guide-text">图形龟的山洞仓库</span>
                    </div>

                    <div id="phase1" class="scene-container">
                        <div class="items-pool">
                            ${state.items.map(i => `<div class="shape-item" draggable="true" id="${i.id}" data-s="${i.shape}">${i.emoji}</div>`).join('')}
                        </div>
                        <div class="boxes-area">
                            <div class="shape-box" data-s="cuboid"><div class="box-content"></div><div class="box-label">长方体</div></div>
                            <div class="shape-box" data-s="cube"><div class="box-content"></div><div class="box-label">正方体</div></div>
                            <div class="shape-box" data-s="cylinder"><div class="box-content"></div><div class="box-label">圆柱</div></div>
                            <div class="shape-box" data-s="sphere"><div class="box-content"></div><div class="box-label">球</div></div>
                        </div>
                    </div>

                    <div id="phase2" class="scene-container challenge-box">
                        <div class="desc-bubble" id="challenge-desc">...</div>
                        <div class="options-grid">
                            <div class="geom cube-visual" data-ans="cube"><div class="c-f"></div><div class="c-t"></div><div class="c-r"></div></div>
                            <div class="geom cuboid-visual" data-ans="cuboid"><div class="cd-f"></div><div class="cd-t"></div><div class="cd-r"></div></div>
                            <div class="geom cyl-visual" data-ans="cylinder"><div class="cyl-t"></div><div class="cyl-b"></div></div>
                            <div class="geom sphere-visual" data-ans="sphere"></div>
                        </div>
                    </div>

                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size: 80px;">🐢</div>
                            <h2 style="font-size: 36px; color: #1e293b; margin: 15px 0;">形状探险完成！</h2>
                            <p style="font-size: 20px; color: #64748b;">你已经掌握了各种立体图形的特征。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">奖励：💰 25</div>
                            <div class="btn-row">
                                <button class="ui-btn btn-green" id="btn-next">下一关</button>
                                <button class="ui-btn btn-gold" id="btn-again">再练一次</button>
                                <button class="ui-btn btn-gray" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.bindEvents();
        },

        bindEvents: function () {
            state.container.querySelectorAll('.shape-item').forEach(i => {
                i.ondragstart = e => e.dataTransfer.setData('id', i.id);
            });
            state.container.querySelectorAll('.shape-box').forEach(b => {
                b.ondragover = e => { e.preventDefault(); b.classList.add('highlight'); };
                b.ondragleave = () => b.classList.remove('highlight');
                b.ondrop = e => this.handleDrop(e, b);
            });
            state.container.querySelectorAll('.geom').forEach(g => {
                g.onclick = () => this.handleChallenge(g.dataset.ans);
            });
            document.getElementById('btn-next').onclick = () => { window.location.href = 'game.html?id=lvl_1_5_1'; };
            document.getElementById('btn-again').onclick = () => { this.resetState(); this.renderLayout(); this.startPhase1(); };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        startPhase1: function () {
            this.updateGuide('🔊 拖动物品放入正确的位置，把物品拖入对应的形状框内吧！');
        },

        handleDrop: function (e, b) {
            e.preventDefault(); b.classList.remove('highlight');
            const id = e.dataTransfer.getData('id');
            const item = document.getElementById(id);
            if (item.dataset.s === b.dataset.s) {
                const clone = item.cloneNode(true);
                clone.style.width = '35px'; clone.style.height = '35px'; clone.style.fontSize = '24px'; clone.style.boxShadow = 'none';
                b.querySelector('.box-content').appendChild(clone);
                item.style.visibility = 'hidden';
                state.classifiedCount++;
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                if (state.classifiedCount === state.totalToClassify) setTimeout(() => this.startPhase2(), 800);
            } else {
                this.triggerError(`那是${this.getName(item.dataset.s)}哦，不能放进${this.getName(b.dataset.s)}框！`);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, "分类错误", `物品:${item.textContent} 目标:${b.dataset.s}`);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }
        },

        startPhase2: function () {
            state.phase = 2;
            document.getElementById('phase1').style.display = 'none';
            document.getElementById('phase2').style.display = 'flex';
            this.updateChallenge();
        },

        updateChallenge: function () {
            const c = state.challenges[state.currentChallengeIndex];
            document.getElementById('challenge-desc').textContent = c.desc;
            this.updateGuide('🔊 盲摸挑战：根据描述点选出正确的图形！');
        },

        handleChallenge: function (ans) {
            if (state.phase !== 2) return;
            if (ans === state.challenges[state.currentChallengeIndex].answer) {
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                state.currentChallengeIndex++;
                if (state.currentChallengeIndex >= state.challenges.length) {
                    if (window.GameManager) {
                        window.GameManager.addCoins(25);
                        window.GameManager.unlockLevel('lvl_1_5_1');
                    }
                    document.getElementById('overlay').style.display = 'flex';
                } else {
                    this.updateChallenge();
                }
            } else {
                this.triggerError('不对哦，再仔细听听图形龟的描述！');
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
        },

        getName: s => ({ cube: '正方体', cuboid: '长方体', cylinder: '圆柱', sphere: '球' }[s]),
        updateGuide: t => { const gt = document.getElementById('guide-text'); gt.textContent = t; gt.style.color = "#1e293b"; },
        triggerError: function (m) {
            const gt = document.getElementById('guide-text');
            const old = gt.textContent; gt.textContent = "❌ " + m; gt.style.color = "#ef4444";
            setTimeout(() => { gt.textContent = old; gt.style.color = "#1e293b"; }, 2000);
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
