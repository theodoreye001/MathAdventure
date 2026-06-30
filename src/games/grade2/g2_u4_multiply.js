/**
 * 二年级上册：表内乘法（一）- 乘法阵列模型
 * 模块路径：src/games/grade2/g2_multiply.js
 */

(function() {
    const gameModule = {
        container: null,
        levelData: null,
        targetA: 0,
        targetB: 0,
        grid: [], // 6x6 grid, 0=empty, 1=tree
        gridSize: 6,
        isLocked: false,
        
        // 初始化
        init: function(containerSelector, levelData) {
            this.container = document.querySelector(containerSelector);
            this.levelData = levelData || { reward: 10 };
            this.resetGameState();
            this.injectStyles();
            this.render();
        },

        // 重置游戏状态
        resetGameState: function() {
            // 乘数范围 2~6
            this.targetA = Math.floor(Math.random() * 5) + 2;
            this.targetB = Math.floor(Math.random() * 5) + 2;
            this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
            this.isLocked = false;
        },

        // 注入专属样式
        injectStyles: function() {
            if (document.getElementById('g2-multiply-styles')) return;
            const style = document.createElement('style');
            style.id = 'g2-multiply-styles';
            style.textContent = `
                .orchard-game {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                    background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
                    border-radius: 20px;
                    color: #2d3436;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .orchard-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .orchard-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .orchard-target {
                    background: #fff;
                    padding: 10px 20px;
                    border-radius: 50px;
                    font-size: 20px;
                    color: #67c23a;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border: 2px solid #67c23a;
                }
                .orchard-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 10px;
                    background: #8d6e63;
                    padding: 15px;
                    border-radius: 12px;
                    box-shadow: inset 0 4px 10px rgba(0,0,0,0.2);
                    margin-bottom: 20px;
                }
                .plot {
                    width: 60px;
                    height: 60px;
                    background: #a1887f;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    user-select: none;
                    border-bottom: 4px solid #6d4c41;
                }
                .plot:hover:not(.locked) {
                    transform: scale(1.05);
                    background: #bcaaa4;
                }
                .plot.active {
                    background: #81c784;
                    border-bottom: 4px solid #388e3c;
                    animation: grow 0.3s ease-out;
                }
                .plot.locked {
                    cursor: default;
                }
                @keyframes grow {
                    0% { transform: scale(0); }
                    70% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .orchard-controls {
                    display: flex;
                    gap: 15px;
                }
                .orchard-btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-reset {
                    background: #909399;
                    color: white;
                }
                .btn-reset:hover { background: #82848a; }
                
                /* 答题框 */
                .answer-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .answer-card {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    animation: slideUp 0.4s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .answer-input {
                    font-size: 28px;
                    width: 100px;
                    text-align: center;
                    padding: 10px;
                    border: 3px solid #67c23a;
                    border-radius: 12px;
                    margin: 20px 0;
                    outline: none;
                }
                .btn-submit {
                    background: #67c23a;
                    color: white;
                    width: 100%;
                    font-size: 18px;
                }
                
                .shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                    transform: translate3d(0, 0, 0);
                    border-color: #f56c6c !important;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                
                /* 结算面板 */
                .result-panel {
                    position: fixed;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    text-align: center;
                    z-index: 1100;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                    min-width: 300px;
                }
                .result-title { font-size: 32px; color: #f1c40f; margin-bottom: 10px; }
                .reward-text { font-size: 20px; color: #2ecc71; margin-bottom: 30px; }
            `;
            document.head.appendChild(style);
        },

        // 销毁清理
        destroy: function() {
            if (this.container) this.container.innerHTML = '';
            const style = document.getElementById('g2-multiply-styles');
            if (style) style.remove();
        },

        // 渲染页面
        render: function() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="orchard-game">
                    <div class="orchard-header">
                        <div class="orchard-title">🍎 倍数果园</div>
                        <div class="orchard-target">
                            目标：种出 <strong>${this.targetA} × ${this.targetB}</strong> 的果树阵列
                        </div>
                    </div>
                    
                    <div class="orchard-grid" id="grid">
                        ${this.generateGridHTML()}
                    </div>
                    
                    <div class="orchard-controls">
                        <button class="orchard-btn btn-reset" id="reset-btn">清空网格</button>
                    </div>
                </div>
                <div id="modal-container"></div>
            `;

            this.bindEvents();
        },

        generateGridHTML: function() {
            let html = '';
            for (let r = 0; r < this.gridSize; r++) {
                for (let c = 0; c < this.gridSize; c++) {
                    const isActive = this.grid[r][c] === 1;
                    html += `
                        <div class="plot ${isActive ? 'active' : ''} ${this.isLocked ? 'locked' : ''}" 
                             data-r="${r}" data-c="${c}">
                             ${isActive ? '🌳' : ''}
                        </div>
                    `;
                }
            }
            return html;
        },

        bindEvents: function() {
            const gridEl = this.container.querySelector('#grid');
            gridEl.onclick = (e) => {
                if (this.isLocked) return;
                const plot = e.target.closest('.plot');
                if (!plot) return;
                
                const r = parseInt(plot.dataset.r);
                const c = parseInt(plot.dataset.c);
                
                this.togglePlot(r, c);
            };

            this.container.querySelector('#reset-btn').onclick = () => {
                if (this.isLocked) return;
                this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
                this.updateGridUI();
            };
        },

        togglePlot: function(r, c) {
            this.grid[r][c] = this.grid[r][c] === 1 ? 0 : 1;
            this.updateGridUI();
            this.checkArray();
        },

        updateGridUI: function() {
            const plots = this.container.querySelectorAll('.plot');
            plots.forEach(plot => {
                const r = parseInt(plot.dataset.r);
                const c = parseInt(plot.dataset.c);
                const isActive = this.grid[r][c] === 1;
                
                plot.classList.toggle('active', isActive);
                plot.classList.toggle('locked', this.isLocked);
                plot.innerHTML = isActive ? '🌳' : '';
            });
        },

        // 检测阵列算法
        checkArray: function() {
            const trees = [];
            for (let r = 0; r < this.gridSize; r++) {
                for (let c = 0; c < this.gridSize; c++) {
                    if (this.grid[r][c] === 1) trees.push({r, c});
                }
            }

            if (trees.length === 0) return;

            // 1. 检查总数是否正确
            const targetCount = this.targetA * this.targetB;
            if (trees.length !== targetCount) return;

            // 2. 获取包围盒
            let minR = 6, maxR = -1, minC = 6, maxC = -1;
            trees.forEach(t => {
                minR = Math.min(minR, t.r);
                maxR = Math.max(maxR, t.r);
                minC = Math.min(minC, t.c);
                maxC = Math.max(maxC, t.c);
            });

            const rows = maxR - minR + 1;
            const cols = maxC - minC + 1;

            // 3. 检查包围盒内是否全满（保证是矩形）
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    if (this.grid[r][c] !== 1) return;
                }
            }

            // 4. 检查行列数是否匹配 (支持交换律)
            const matchNormal = (rows === this.targetA && cols === this.targetB);
            const matchSwapped = (rows === this.targetB && cols === this.targetA);

            if (matchNormal || matchSwapped) {
                this.handleSuccessArray();
            }
        },

        handleSuccessArray: function() {
            this.isLocked = true;
            this.updateGridUI();
            
            setTimeout(() => {
                this.showAnswerInput();
            }, 500);
        },

        showAnswerInput: function() {
            const modal = document.createElement('div');
            modal.className = 'answer-overlay';
            modal.innerHTML = `
                <div class="answer-card">
                    <h2>太棒了！阵列完成</h2>
                    <p>那么，请问：<strong>${this.targetA} × ${this.targetB} = ?</strong></p>
                    <input type="number" class="answer-input" id="answer-field" autofocus>
                    <br>
                    <button class="orchard-btn btn-submit" id="submit-answer">提交答案</button>
                </div>
            `;
            this.container.querySelector('#modal-container').appendChild(modal);

            const input = modal.querySelector('#answer-field');
            const submitBtn = modal.querySelector('#submit-answer');

            const checkResult = () => {
                const val = parseInt(input.value);
                const correctAnswer = this.targetA * this.targetB;
                const questionStr = `${this.targetA} × ${this.targetB} = ?`;

                if (val === correctAnswer) {
                    // 【数据埋点】正确时上报熟练度
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(this.levelData.knowledgePoint, 10);
                    }
                    
                    modal.remove();
                    this.showFinalResult();
                } else {
                    // 【数据埋点】错误时记录错题并扣除熟练度
                    if (window.GameManager) {
                        if (window.GameManager.logError) {
                            window.GameManager.logError(this.levelData.levelId, questionStr, val || 0, correctAnswer);
                        }
                        if (window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(this.levelData.knowledgePoint, -5);
                        }
                    }

                    // 界面反馈：清空输入并提示
                    input.value = '';
                    input.style.borderColor = '#f56c6c';
                    input.placeholder = "再试一次";
                    
                    let tip = modal.querySelector('.answer-tip');
                    if (!tip) {
                        tip = document.createElement('p');
                        tip.className = 'answer-tip';
                        tip.style.color = '#e67e22';
                        tip.style.fontSize = '15px';
                        tip.style.marginTop = '10px';
                        tip.style.fontWeight = 'bold';
                        modal.querySelector('.answer-card').insertBefore(tip, submitBtn);
                    }
                    tip.textContent = "哎呀，数数看果园里一共有多少棵树？再试一次吧！";

                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 500);
                }
            };

            submitBtn.onclick = checkResult;
            input.onkeyup = (e) => { if (e.key === 'Enter') checkResult(); };
        },

        showFinalResult: function() {
            // 【数据埋点】结算奖励
            if (window.GameManager && window.GameManager.addCoins) {
                window.GameManager.addCoins(this.levelData.reward);
            }
            if (window.GameManager && window.GameManager.unlockLevel) {
                window.GameManager.unlockLevel('lvl_2_5_1');
            }

            const modal = document.createElement('div');
            modal.className = 'answer-overlay';
            modal.innerHTML = `
                <div class="result-panel">
                    <div class="result-title">🌟 闯关成功！</div>
                    <div class="reward-text">获得奖励：${this.levelData.reward} 金币</div>
                    <div class="orchard-controls">
                        <button class="orchard-btn" style="background:#409eff;color:white;" id="btn-next-level">下一关</button>
                        <button class="orchard-btn" style="background:#67c23a;color:white;" id="btn-next">再种一丛</button>
                        <button class="orchard-btn btn-reset" id="btn-home">返回大厅</button>
                    </div>
                </div>
            `;
            this.container.querySelector('#modal-container').appendChild(modal);

            modal.querySelector('#btn-next-level').onclick = () => {
                location.href = 'game.html?id=lvl_2_5_1';
            };

            modal.querySelector('#btn-next').onclick = () => {
                modal.remove();
                this.resetGameState();
                this.render();
            };

            modal.querySelector('#btn-home').onclick = () => {
                location.href = 'index.html';
            };
        }
    };

    // 挂载到全局
    window.CurrentGameModule = gameModule;
})();
