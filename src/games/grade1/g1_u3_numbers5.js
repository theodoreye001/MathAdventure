/**
 * 一年级上册 第三单元：1~5的认识和加减法（含0）
 * 路径: src/games/grade1/g1_u3_numbers5.js
 */

(function () {
    // 内部状态
    let state = {
        container: null,
        levelData: null,
        phase: 1, // 1: 石阵跳跃, 2: 大嘴鱼比大小, 3: 零之泉
        step: 0,
        currentProblem: null,
        isFinished: false,
        characterPos: 0,
        fishCount: 3,
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
            this.startPhase1();
        },

        resetState: function() {
            state.phase = 1;
            state.step = 0;
            state.isFinished = false;
            state.characterPos = 0;
            state.mistakes = 0;
            state.fishCount = 3;
        },

        injectStyles: function () {
            const styleId = 'g1-u3-numbers5-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .game-wrapper {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                    font-family: 'PingFang SC', sans-serif;
                    background: linear-gradient(to bottom, #f0fdf4 0%, #dcfce7 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .guide-bar {
                    margin-top: 20px; background: white; padding: 12px 40px;
                    border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 3px solid #10b981; font-size: 22px; font-weight: bold;
                    color: #065f46; display: flex; align-items: center; gap: 15px; z-index: 100;
                }

                .scene-container {
                    flex: 1; width: 100%; position: relative;
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    gap: 30px;
                }

                .equation-display {
                    font-size: 60px; font-weight: bold; color: #065f46;
                    background: rgba(255,255,255,0.7); padding: 15px 45px;
                    border-radius: 25px; border: 4px solid #bbf7d0; margin-top: 20px;
                }

                /* 阶段一：石阵 */
                .stones-area { display: flex; gap: 20px; position: relative; margin-top: 80px; padding: 20px; }
                .stone {
                    width: 110px; height: 90px; background: #94a3b8;
                    border-radius: 50% / 25%; display: flex; align-items: center;
                    justify-content: center; color: white; font-size: 36px;
                    font-weight: bold; cursor: pointer; position: relative;
                    transition: all 0.2s; box-shadow: 0 12px 0 #64748b;
                }
                .stone:hover { transform: translateY(-5px); }
                .stone.active { background: #10b981; box-shadow: 0 12px 0 #059669; }

                .sprite-char {
                    position: absolute; font-size: 70px; bottom: 100px;
                    transition: left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    transform: translateX(-50%); z-index: 50;
                }

                /* 阶段二：大嘴鱼 */
                .compare-box { display: flex; align-items: center; gap: 40px; }
                .num-circle {
                    width: 130px; height: 130px; background: white; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 70px; font-weight: bold; color: #059669;
                    border: 6px solid #bbf7d0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                }
                .drop-well {
                    width: 110px; height: 110px; border: 4px dashed #10b981;
                    border-radius: 25px; display: flex; align-items: center;
                    justify-content: center; font-size: 70px; background: rgba(255,255,255,0.4);
                }
                .symbols { display: flex; gap: 25px; }
                .symbol-tile {
                    width: 90px; height: 90px; background: white; border: 4px solid #10b981;
                    border-radius: 20px; display: flex; align-items: center;
                    justify-content: center; font-size: 50px; font-weight: bold;
                    color: #10b981; cursor: grab; box-shadow: 0 6px 0 #059669;
                    transition: transform 0.2s;
                }
                .symbol-tile:hover { transform: scale(1.1); }

                /* 鱼嘴动画 */
                .bite-anim { animation: bite 0.5s ease alternate 2; }
                @keyframes bite {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.5); }
                }

                /* 阶段三：零之泉 */
                .pond-container {
                    width: 650px; height: 350px; background: #bae6fd;
                    border: 10px solid #7dd3fc; border-radius: 180px / 90px;
                    position: relative; overflow: hidden;
                    box-shadow: inset 0 10px 30px rgba(0,0,0,0.1);
                }
                .fish-item {
                    position: absolute; font-size: 60px; cursor: pointer;
                    transition: all 1.2s ease-in; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
                }

                /* 结算 */
                .overlay {
                    position: absolute; inset: 0; background: rgba(255,255,255,0.98);
                    display: none; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 1000; backdrop-filter: blur(15px);
                }
                .result-card {
                    background: white; padding: 50px; border-radius: 40px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1); text-align: center;
                    border: 6px solid #10b981; max-width: 500px;
                }
                .btn-row { display: flex; gap: 20px; justify-content: center; margin-top: 40px; }
                .ui-btn {
                    padding: 18px 45px; font-size: 24px; font-weight: bold;
                    border: none; border-radius: 20px; cursor: pointer;
                    transition: all 0.2s; box-shadow: 0 6px 0 #047857;
                }
                .btn-green { background: #10b981; color: white; }
                .btn-gray { background: #64748b; color: white; box-shadow: 0 6px 0 #334155; }
            `;
            document.head.appendChild(style);
        },

        renderLayout: function () {
            state.container.innerHTML = `
                <div class="game-wrapper">
                    <div class="guide-bar">
                        <span>🧙</span>
                        <span id="guide-text">石阵迷宫正在开启...</span>
                    </div>

                    <div id="phase1" class="scene-container" style="display:flex">
                        <div class="equation-display" id="eq-1">? + ? = ?</div>
                        <div class="stones-area" id="stones-area">
                            <div class="sprite-char" id="char">🧙</div>
                            ${[0, 1, 2, 3, 4, 5].map(n => `<div class="stone" data-n="${n}">${n}</div>`).join('')}
                        </div>
                    </div>

                    <div id="phase2" class="scene-container">
                        <div class="compare-box">
                            <div class="num-circle" id="n-left">0</div>
                            <div class="drop-well" id="drop-well">?</div>
                            <div class="num-circle" id="n-right">0</div>
                        </div>
                        <div class="symbols">
                            <div class="symbol-tile" draggable="true" data-s="<">&lt;</div>
                            <div class="symbol-tile" draggable="true" data-s="=">=</div>
                            <div class="symbol-tile" draggable="true" data-s=">">&gt;</div>
                        </div>
                    </div>

                    <div id="phase3" class="scene-container">
                        <div class="equation-display" id="eq-3">? - ? = ?</div>
                        <div class="pond-container" id="pond"></div>
                    </div>

                    <div id="overlay" class="overlay">
                        <div class="result-card">
                            <div style="font-size: 80px;">💎</div>
                            <h2 style="font-size: 40px; color: #065f46; margin: 15px 0;">探险成功！</h2>
                            <p style="font-size: 20px; color: #475569;">你已经掌握了 5 以内的加减逻辑和 0 的意义。</p>
                            <div style="margin-top:20px; font-weight:bold; color:#fbbf24; font-size:28px;">奖励：💰 20</div>
                            <div class="btn-row">
                                <button class="ui-btn btn-green" id="btn-again">再练一次</button>
                                <button class="ui-btn btn-gray" id="btn-back">回大厅</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            state.container.querySelectorAll('.stone').forEach(s => {
                s.onclick = () => this.handleStone(parseInt(s.dataset.n));
            });

            const well = document.getElementById('drop-well');
            well.ondragover = e => e.preventDefault();
            well.ondrop = e => this.handleDrop(e);

            state.container.querySelectorAll('.symbol-tile').forEach(t => {
                t.ondragstart = e => e.dataTransfer.setData('text', t.dataset.s);
            });

            document.getElementById('btn-again').onclick = () => {
                this.resetState();
                this.renderLayout();
                this.startPhase1();
            };
            document.getElementById('btn-back').onclick = () => { window.location.href = 'index.html'; };
        },

        startPhase1: function () {
            state.phase = 1; state.step = 0;
            // 随机生成 5 以内加法
            const a = Math.floor(Math.random() * 3) + 1; // 1-3
            const b = Math.floor(Math.random() * (5 - a)) + 1;
            state.currentProblem = { a, b, res: a + b };

            document.getElementById('eq-1').textContent = `${a} + ${b} = ?`;
            this.updateGuide(`🔊 题目：${a} + ${b}。请先跳上第 [${a}] 个石墩！`);
            this.syncSprite(0);
        },

        handleStone: function (n) {
            if (state.phase !== 1) return;
            const p = state.currentProblem;

            if (state.step === 0) {
                if (n === p.a) {
                    this.syncSprite(n); state.step = 1;
                    this.updateGuide(`🔊 真棒！接着向后跳 [${p.b}] 步，看看落点是多少？`);
                } else {
                    this.triggerError(`提示：我们要先到数字 ${p.a} 集合哦！`);
                }
            } else {
                if (n === p.res) {
                    this.syncSprite(n);
                    document.getElementById('eq-1').textContent = `${p.a} + ${p.b} = ${p.res}`;
                    this.updateGuide(`🔊 太准了！最终落在了 ${p.res}。${p.a} + ${p.b} = ${p.res}`);
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                    setTimeout(() => this.startPhase2(), 1500);
                } else {
                    this.triggerError(`算一算：在 ${p.a} 的基础上再向后数 ${p.b} 步，应该是 ${p.res} 呢！`);
                }
            }
        },

        syncSprite: function (n) {
            const char = document.getElementById('char');
            const stone = state.container.querySelector(`.stone[data-n="${n}"]`);
            char.style.left = (stone.offsetLeft + stone.offsetWidth / 2) + 'px';
        },

        startPhase2: function () {
            state.phase = 2;
            document.getElementById('phase1').style.display = 'none';
            document.getElementById('phase2').style.display = 'flex';
            
            let l = Math.floor(Math.random() * 6);
            let r = Math.floor(Math.random() * 6);
            if (l === r) r = (r + 1) % 6;
            state.currentProblem = { l, r, ans: l < r ? '<' : '>' };

            document.getElementById('n-left').textContent = l;
            document.getElementById('n-right').textContent = r;
            this.updateGuide(`🔊 比大小：${l} 和 ${r}，谁更大？拖动符号试试！`);
        },

        handleDrop: function (e) {
            const s = e.dataTransfer.getData('text');
            const well = document.getElementById('drop-well');
            const p = state.currentProblem;

            if (s === p.ans) {
                well.textContent = s;
                well.classList.add('bite-anim');
                this.updateGuide(`🔊 选对啦！大嘴鱼张开嘴咬向了更大的数 ${Math.max(p.l, p.r)}。`);
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                setTimeout(() => { well.classList.remove('bite-anim'); this.startPhase3(); }, 2000);
            } else {
                this.triggerError(`提示：大嘴鱼只喜欢咬更大的那个数哦！`);
            }
        },

        startPhase3: function () {
            state.phase = 3;
            document.getElementById('phase2').style.display = 'none';
            document.getElementById('phase3').style.display = 'flex';
            
            const n = Math.floor(Math.random() * 3) + 3; // 3-5
            state.fishCount = n;
            document.getElementById('eq-3').textContent = `${n} - ? = ?`;
            this.updateGuide(`🔊 零之泉里有 ${n} 条鱼。把它们都赶走，看看最后剩下多少？`);

            const pond = document.getElementById('pond');
            pond.innerHTML = '';
            for (let i = 0; i < n; i++) {
                const f = document.createElement('div');
                f.className = 'fish-item';
                f.textContent = '🐟';
                f.style.top = (20 + Math.random() * 60) + '%';
                f.style.left = (10 + Math.random() * 80) + '%';
                f.onclick = () => {
                    if (f.classList.contains('gone')) return;
                    f.classList.add('gone');
                    f.style.left = '1000px';
                    state.fishCount--;
                    document.getElementById('eq-3').textContent = `${n} - ${n - state.fishCount} = ${state.fishCount}`;
                    if (state.fishCount === 0) {
                        this.updateGuide('🔊 泉水空了，一条鱼也没有了，这就是数字 0 的意思！');
                        if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                        setTimeout(() => this.finishGame(), 2000);
                    }
                };
                pond.appendChild(f);
            }
        },

        updateGuide: function (t) {
            const gt = document.getElementById('guide-text');
            gt.textContent = t; gt.style.color = "#065f46";
        },

        triggerError: function (m) {
            state.mistakes++;
            const gt = document.getElementById('guide-text');
            const old = gt.textContent;
            gt.textContent = "❌ " + m; gt.style.color = "#dc2626";
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, "运算/判断错误", m);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
            setTimeout(() => { gt.textContent = old; gt.style.color = "#065f46"; }, 2000);
        },

        finishGame: function () {
            state.isFinished = true;
            if (window.GameManager) {
                window.GameManager.addCoins(20);
                window.GameManager.unlockLevel('lvl_1_4_1');
            }
            document.getElementById('overlay').style.display = 'flex';
        }
    };

    window.CurrentGameModule = CurrentGameModule;
})();
