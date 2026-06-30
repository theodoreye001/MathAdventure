/**
 * 一年级上册 第一单元：准备课（数一数与比多少）
 * 路径: src/games/grade1/g1_u1_counting.js
 *
 * 使用 GameHelpers 模板重写
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-u1-counting-styles';

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        currentCount: 1,
        connections: [],
        mistakes: 0,
        selectedNode: null,
        items: [
            { id: 1, emoji: '☀️', name: '太阳', count: 1 },
            { id: 2, emoji: '🦋', name: '蝴蝶', count: 2 },
            { id: 3, emoji: '🌸', name: '小花', count: 3 },
            { id: 4, emoji: '☁️', name: '白云', count: 4 },
            { id: 5, emoji: '🐇', name: '兔子', count: 5 },
            { id: 6, emoji: '🍎', name: '苹果', count: 6 },
            { id: 7, emoji: '🍄', name: '蘑菇', count: 7 },
            { id: 8, emoji: '🐦', name: '小鸟', count: 8 },
            { id: 9, emoji: '💎', name: '宝石', count: 9 },
            { id: 10, emoji: '⭐', name: '星星', count: 10 }
        ]
    };

    const game = {
        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            H.injectStyles(STYLE_ID, `
                .c1-wrapper { width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(180deg,#d1fae5 0%,#ecfdf5 100%);user-select:none; }
                .c1-gem-slots { position:absolute;top:100px;width:100%;display:flex;
                    justify-content:center;gap:10px;z-index:40; }
                .c1-gem-slot { width:50px;height:60px;background:rgba(0,0,0,0.05);
                    border:2px solid rgba(16,185,129,0.2);border-radius:12px;
                    display:flex;align-items:center;justify-content:center;
                    color:#9ca3af;font-weight:bold;font-size:24px;
                    transition:all 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
                .c1-gem-slot.active { background:#10b981;box-shadow:0 0 15px rgba(16,185,129,0.5);
                    transform:translateY(-5px) scale(1.1);border-color:#fff;color:#fff; }
                .c1-items { position:absolute;inset:160px 20px 20px 20px;display:flex;
                    flex-wrap:wrap;justify-content:space-around;align-content:space-around;gap:20px; }
                .c1-item-group { position:relative;cursor:pointer;
                    transition:all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
                    display:flex;flex-wrap:wrap;width:140px;min-height:100px;gap:5px;
                    padding:15px;border-radius:20px;background:rgba(255,255,255,0.4);
                    border:2px solid transparent;align-items:center;justify-content:center; }
                .c1-item-group:hover { transform:scale(1.05);background:rgba(255,255,255,0.6);border-color:#10b981; }
                .c1-item-group.correct { pointer-events:none;background:#10b981;border-color:#fff;
                    box-shadow:0 0 20px rgba(16,185,129,0.4);animation:c1-celebrate 0.8s ease-out forwards; }
                @keyframes c1-celebrate { 0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)} }
                .c1-emoji { font-size:28px; }
                .c1-bridge { position:absolute;inset:100px 40px 40px 40px;display:none;
                    flex-direction:column;align-items:center;gap:30px; }
                .c1-bridge-visual { width:90%;max-width:700px;height:350px;background:#fdf2f8;
                    border:8px solid #f9a8d4;border-radius:60px;position:relative;
                    display:flex;justify-content:space-between;padding:50px 80px;
                    box-shadow:0 10px 30px rgba(249,168,212,0.3); }
                .c1-side { display:flex;flex-direction:column;justify-content:space-around;height:100%; }
                .c1-node { width:60px;height:60px;background:white;border-radius:50%;
                    display:flex;align-items:center;justify-content:center;font-size:36px;
                    cursor:pointer;border:3px solid #f9a8d4;
                    transition:transform 0.2s,border-color 0.2s;position:relative;z-index:10; }
                .c1-node:hover { transform:scale(1.1); }
                .c1-node.active { border-color:#fbbf24;background:#fffbeb; }
                .c1-node.connected { background:#fdf2f8;border-color:#f9a8d4;pointer-events:none; }
                .c1-line-container { position:absolute;inset:0;pointer-events:none;z-index:5; }
                .c1-line { position:absolute;height:4px;background:#f472b6;
                    transform-origin:left center;border-radius:2px;transition:width 0.3s; }
                .c1-question { display:none;gap:30px;margin-top:20px;animation:c1-slideUp 0.5s ease; }
                @keyframes c1-slideUp { from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1} }
                .c1-opt-btn { padding:15px 40px;background:white;border:3px solid #f9a8d4;
                    border-radius:20px;font-size:24px;font-weight:bold;color:#be185d;
                    cursor:pointer;transition:all 0.2s; }
                .c1-opt-btn:hover { background:#be185d;color:white;transform:scale(1.05); }
            `);

            state.phase = 1;
            state.currentCount = 1;
            state.connections = [];
            state.mistakes = 0;
            state.selectedNode = null;

            this.render();
            this.startPhase1();
        },

        render() {
            state.container.innerHTML = `
                <div class="c1-wrapper">
                    ${H.guideBarHTML('🧙', '我们要先找 1 哦！')}
                    <div id="c1-counting-phase">
                        <div class="c1-gem-slots">
                            ${Array.from({ length: 10 }, (_, i) =>
                                `<div class="c1-gem-slot" id="c1-slot-${i + 1}">${i + 1}</div>`
                            ).join('')}
                        </div>
                        <div class="c1-items" id="c1-items-layer"></div>
                    </div>
                    <div id="c1-bridge-phase" class="c1-bridge">
                        <div class="c1-bridge-visual">
                            <div class="c1-side" id="c1-left-side"></div>
                            <div class="c1-line-container" id="c1-lines"></div>
                            <div class="c1-side" id="c1-right-side"></div>
                        </div>
                        <div class="c1-question" id="c1-question">
                            <button class="c1-opt-btn" id="c1-opt-left">左边多</button>
                            <button class="c1-opt-btn" id="c1-opt-right">右边多</button>
                        </div>
                    </div>
                </div>
            `;
        },

        startPhase1() {
            const layer = document.getElementById('c1-items-layer');
            layer.innerHTML = '';
            const shuffled = H.shuffle(state.items);

            shuffled.forEach(item => {
                const group = document.createElement('div');
                group.className = 'c1-item-group';
                group.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg) scale(${0.9 + Math.random() * 0.2})`;
                for (let i = 0; i < item.count; i++) {
                    const span = document.createElement('span');
                    span.className = 'c1-emoji';
                    span.textContent = item.emoji;
                    group.appendChild(span);
                }
                group.onclick = () => this.handleItemClick(item, group);
                layer.appendChild(group);
            });

            H.updateGuide('欢迎来到数字谷！先找出 1 个物品的小组哦！');
        },

        handleItemClick(item, element) {
            if (state.phase !== 1) return;
            if (item.count === state.currentCount) {
                element.classList.add('correct');
                document.getElementById(`c1-slot-${state.currentCount}`).classList.add('active');
                state.currentCount++;
                if (state.currentCount > 10) {
                    H.updateGuide('太棒了！10 个数字槽都填满啦！接下来去友谊桥看看吧。');
                    setTimeout(() => this.startPhase2(), 1500);
                } else {
                    H.updateGuide(`真准！接下来找出 ${state.currentCount} 个物品的小组。`);
                }
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 2);
                }
            } else {
                state.mistakes++;
                H.triggerError(state.container, `我们要先找 ${state.currentCount} 哦！`, element);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '数序点击', item.count, state.currentCount);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }
        },

        startPhase2() {
            state.phase = 2;
            document.getElementById('c1-counting-phase').style.display = 'none';
            document.getElementById('c1-bridge-phase').style.display = 'flex';
            H.updateGuide('来到友谊桥啦！把左边的兔子和右边的兔子连线配对吧！');

            const leftSide = document.getElementById('c1-left-side');
            const rightSide = document.getElementById('c1-right-side');
            leftSide.innerHTML = '';
            rightSide.innerHTML = '';

            for (let i = 0; i < 5; i++) {
                const node = this.createNode(`c1-left-${i}`, 'left');
                leftSide.appendChild(node);
            }
            for (let i = 0; i < 3; i++) {
                const node = this.createNode(`c1-right-${i}`, 'right');
                rightSide.appendChild(node);
            }
        },

        createNode(id, side) {
            const node = document.createElement('div');
            node.className = 'c1-node';
            node.id = id;
            node.textContent = '🐇';
            node.dataset.side = side;
            node.onclick = () => this.handleNodeClick(node);
            return node;
        },

        handleNodeClick(node) {
            if (node.classList.contains('connected')) return;
            if (!state.selectedNode) {
                state.selectedNode = node;
                node.classList.add('active');
            } else {
                if (state.selectedNode === node) {
                    node.classList.remove('active');
                    state.selectedNode = null;
                    return;
                }
                if (state.selectedNode.dataset.side !== node.dataset.side) {
                    this.drawLine(state.selectedNode, node);
                    state.selectedNode.classList.remove('active');
                    state.selectedNode.classList.add('connected');
                    node.classList.add('connected');
                    state.selectedNode = null;
                    state.connections.push(1);
                    if (state.connections.length === 3) this.showCompareQuestion();
                } else {
                    state.selectedNode.classList.remove('active');
                    state.selectedNode = node;
                    node.classList.add('active');
                }
            }
        },

        drawLine(nodeA, nodeB) {
            const container = document.getElementById('c1-lines');
            const cRect = container.getBoundingClientRect();
            const rA = nodeA.getBoundingClientRect();
            const rB = nodeB.getBoundingClientRect();
            const x1 = rA.left + rA.width / 2 - cRect.left;
            const y1 = rA.top + rA.height / 2 - cRect.top;
            const x2 = rB.left + rB.width / 2 - cRect.left;
            const y2 = rB.top + rB.height / 2 - cRect.top;
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

            const line = document.createElement('div');
            line.className = 'c1-line';
            line.style.left = x1 + 'px';
            line.style.top = y1 + 'px';
            line.style.width = '0px';
            line.style.transform = `rotate(${angle}deg)`;
            container.appendChild(line);
            setTimeout(() => { line.style.width = length + 'px'; }, 50);
        },

        showCompareQuestion() {
            H.updateGuide('看！有的连上了，有的没连上。哪边多呢？');
            document.getElementById('c1-question').style.display = 'flex';
            document.getElementById('c1-opt-left').onclick = () => {
                H.updateGuide('完全正确！左边多出 2 只没对手，5 只比 3 只多！');
                setTimeout(() => this.finishGame(), 2000);
            };
            document.getElementById('c1-opt-right').onclick = (e) => {
                state.mistakes++;
                H.triggerError(state.container, '再看看哪边还有兔子没连上线？', e.target);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '比多少判定', '右边多', '左边多');
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            };
        },

        finishGame() {
            H.showSettlement(
                state.container,
                state.levelData.reward || 10,
                state.levelData,
                state.mistakes,
                '你对 1~10 的数序和多少关系非常熟悉！',
                'lvl_1_2_1'
            );
        }
    };

    window.CurrentGameModule = game;
})();
