/**
 * 游戏模块：分数初步认识 (Grade 3)
 * 核心目标：理解“几分之一”，强调“平均分”的概念
 */
(function () {
    const GAME_ID = 'g3_fraction';
    let container = null;
    let levelData = null;
    let targetFraction = 4; // 默认 1/4
    let currentSlices = 2;
    let isSplit = false;
    let selectedSlices = new Set();
    let pizzaGroup = null;
    let previewGroup = null;

    const styles = `
        #fraction-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 30px;
            width: 100%;
            height: 100%;
            padding: 40px 20px;
            box-sizing: border-box;
            background: radial-gradient(circle at center, #fff9f0 0%, #ffe8cc 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #5d4037;
            position: relative;
            overflow: hidden;
        }

        .game-header {
            text-align: center;
            z-index: 10;
        }

        .npc-box {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 8px 32px rgba(139, 69, 19, 0.1);
            border: 2px solid #ffcc80;
            margin-bottom: 20px;
            animation: slideDown 0.5s ease-out;
        }

        .npc-avatar {
            width: 60px;
            height: 60px;
            background: #ff9800;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            color: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .npc-message {
            font-size: 1.2rem;
            font-weight: bold;
            color: #4e342e;
        }

        .target-display {
            font-size: 2rem;
            color: #d84315;
            background: #fff;
            padding: 10px 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            display: inline-block;
            margin-top: 10px;
        }

        .target-display b {
            font-size: 2.5rem;
            text-decoration: underline;
        }

        .pizza-stage {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-height: 350px;
            position: relative;
        }

        #pizza-svg {
            width: 400px;
            height: 400px;
            filter: drop-shadow(0 15px 35px rgba(0,0,0,0.15));
            transition: transform 0.3s ease;
        }

        .pizza-slice {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            stroke: #fff;
            stroke-width: 2;
        }

        .pizza-slice:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }

        .pizza-slice.selected {
            fill: #ff7043 !important;
            transform: scale(1.08) translateY(-5px);
            filter: drop-shadow(0 5px 15px rgba(255, 112, 67, 0.4));
        }

        .preview-line {
            stroke: #d84315;
            stroke-width: 2;
            stroke-dasharray: 8, 4;
            pointer-events: none;
            opacity: 0.6;
        }

        .controls {
            width: 100%;
            max-width: 500px;
            background: rgba(255, 255, 255, 0.95);
            padding: 20px 25px;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 10;
            border: 2px solid #fff;
            margin-bottom: 20px;
        }

        .slider-container {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .slider-label {
            font-weight: bold;
            min-width: 80px;
        }

        input[type=range] {
            flex: 1;
            accent-color: #ff9800;
            cursor: pointer;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .game-btn {
            padding: 12px 35px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .btn-primary {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 124, 0, 0.3);
        }

        .btn-success {
            background: linear-gradient(135deg, #4caf50, #388e3c);
            color: white;
        }

        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .result-card {
            background: white;
            padding: 40px;
            border-radius: 30px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transform: scale(0.8);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .modal-overlay.active .result-card {
            transform: scale(1);
        }

        .result-title {
            font-size: 2.5rem;
            color: #4caf50;
            margin-bottom: 10px;
        }

        .result-formula {
            font-size: 1.8rem;
            margin: 20px 0;
            padding: 15px;
            background: #f1f8e9;
            border-radius: 15px;
            color: #2e7d32;
        }

        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .shake {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;

    function init(containerSelector, data) {
        container = document.querySelector(containerSelector);
        levelData = data;
        
        injectStyles();
        setupGameUI();
        newRound();
    }

    function injectStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'fraction-game-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    function setupGameUI() {
        container.innerHTML = `
            <div id="fraction-game">
                <div class="game-header">
                    <div class="npc-box">
                        <div class="npc-avatar">🍕</div>
                        <div class="npc-message" id="npc-text">我是分数分裂者！让我们来切披萨吧！</div>
                    </div>
                    <div class="target-display">
                        请切出披萨的：<span id="target-fraction-text">1/4</span>
                    </div>
                </div>

                <div class="pizza-stage">
                    <svg id="pizza-svg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="#fdd835" stroke="#fbc02d" stroke-width="4" />
                        <!-- 这里的馅料只是装饰 -->
                        <circle cx="100" cy="100" r="75" fill="#ffeb3b" opacity="0.5" />
                        <g id="pizza-slices"></g>
                        <g id="preview-lines"></g>
                    </svg>
                </div>

                <div class="controls">
                    <div class="slider-container" id="slider-box">
                        <span class="slider-label">平均分成：</span>
                        <input type="range" id="split-slider" min="2" max="8" value="2">
                        <span id="slider-val" style="font-size: 1.5rem; font-weight: bold; width: 30px;">2</span>
                    </div>
                    <div class="btn-group">
                        <button class="game-btn btn-primary" id="split-btn">第一步：确认切分</button>
                        <button class="game-btn btn-success" id="confirm-btn" style="display:none">第二步：提交作品</button>
                    </div>
                </div>

                <div class="modal-overlay" id="result-modal">
                    <div class="result-card">
                        <div class="result-title" id="result-title">太棒了！</div>
                        <div class="result-formula" id="result-formula">1 ÷ 4 = 1/4</div>
                        <div style="margin-bottom: 25px; color: #666;">你获得了 🪙 <span id="reward-val">0</span> 金币</div>
                        <div class="btn-group">
                            <button class="game-btn btn-primary" id="next-btn">再切一次</button>
                            <button class="game-btn btn-success" id="hall-btn">领取奖励返回</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const slider = document.getElementById('split-slider');
        const sliderVal = document.getElementById('slider-val');
        const splitBtn = document.getElementById('split-btn');
        const confirmBtn = document.getElementById('confirm-btn');
        const nextBtn = document.getElementById('next-btn');
        const hallBtn = document.getElementById('hall-btn');

        pizzaGroup = document.getElementById('pizza-slices');
        previewGroup = document.getElementById('preview-lines');

        slider.addEventListener('input', (e) => {
            currentSlices = parseInt(e.target.value);
            sliderVal.innerText = currentSlices;
            updatePreview();
        });

        splitBtn.addEventListener('click', () => {
            performSplit();
        });

        confirmBtn.addEventListener('click', () => {
            checkAnswer();
        });

        nextBtn.addEventListener('click', () => {
            newRound();
        });

        hallBtn.addEventListener('click', () => {
            finishGame();
        });
    }

    function newRound() {
        targetFraction = Math.floor(Math.random() * 7) + 2; // 2 to 8
        document.getElementById('target-fraction-text').innerText = `1/${targetFraction}`;
        document.getElementById('npc-text').innerText = `嘿！请帮我切出这块披萨的 1/${targetFraction}。`;
        
        isSplit = false;
        selectedSlices.clear();
        pizzaGroup.innerHTML = '';
        document.getElementById('result-modal').classList.remove('active');
        document.getElementById('slider-box').style.display = 'flex';
        document.getElementById('split-btn').style.display = 'block';
        document.getElementById('confirm-btn').style.display = 'none';
        
        currentSlices = 2;
        document.getElementById('split-slider').value = 2;
        document.getElementById('slider-val').innerText = 2;
        
        updatePreview();
    }

    function updatePreview() {
        if (isSplit) return;
        previewGroup.innerHTML = '';
        const centerX = 100;
        const centerY = 100;
        const radius = 90;

        for (let i = 0; i < currentSlices; i++) {
            const angle = (i * 360) / currentSlices;
            const radians = (angle - 90) * (Math.PI / 180);
            const x = centerX + radius * Math.cos(radians);
            const y = centerY + radius * Math.sin(radians);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
            line.setAttribute("class", "preview-line");
            previewGroup.appendChild(line);
        }
    }

    function performSplit() {
        isSplit = true;
        previewGroup.innerHTML = '';
        pizzaGroup.innerHTML = '';
        
        const centerX = 100;
        const centerY = 100;
        const radius = 90;

        for (let i = 0; i < currentSlices; i++) {
            const startAngle = (i * 360) / currentSlices;
            const endAngle = ((i + 1) * 360) / currentSlices;
            
            const slice = createSlicePath(centerX, centerY, radius, startAngle, endAngle, i);
            pizzaGroup.appendChild(slice);
        }

        document.getElementById('slider-box').style.display = 'none';
        document.getElementById('split-btn').style.display = 'none';
        document.getElementById('confirm-btn').style.display = 'block';
        document.getElementById('npc-text').innerText = "切好了！现在点选其中的 1 份吧！";
    }

    function createSlicePath(x, y, r, startAngle, endAngle, index) {
        const start = polarToCartesian(x, y, r, endAngle - 90);
        const end = polarToCartesian(x, y, r, startAngle - 90);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        const d = [
            "M", x, y,
            "L", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "pizza-slice");
        path.setAttribute("fill", "#ffca28");
        path.style.transformOrigin = "100px 100px";
        
        path.addEventListener('click', () => {
            if (selectedSlices.has(index)) {
                selectedSlices.delete(index);
                path.classList.remove('selected');
            } else {
                // 对于“几分之一”，通常只需要选一个
                // 如果已经选了别的，可以清除，也可以允许选多个（用于进阶）
                // 这里按要求：只要分子为1，所以我们保持简单
                selectedSlices.add(index);
                path.classList.add('selected');
            }
        });

        return path;
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function checkAnswer() {
        const npcText = document.getElementById('npc-text');
        const pizzaSvg = document.getElementById('pizza-svg');

        // 验证逻辑
        if (currentSlices !== targetFraction) {
            npcText.innerText = `哎呀，分母是 ${targetFraction}，就要平均分成 ${targetFraction} 份哦！`;
            pizzaSvg.classList.add('shake');
            setTimeout(() => pizzaSvg.classList.remove('shake'), 500);
            return;
        }

        if (selectedSlices.size === 0) {
            npcText.innerText = "你还没有点选任何一份呢！快点一份。";
            return;
        }

        if (selectedSlices.size !== 1) {
            npcText.innerText = "我们要找的是“几分之一”，也就是这么多份里的“1”份哦！";
            return;
        }

        // 成功过关
        showSuccess();
    }

    function showSuccess() {
        const modal = document.getElementById('result-modal');
        const rewardText = document.getElementById('reward-val');
        const formulaText = document.getElementById('result-formula');
        
        const reward = levelData.reward || 20;
        rewardText.innerText = reward;
        formulaText.innerText = `1 ÷ ${targetFraction} = 1/${targetFraction}`;
        
        modal.classList.add('active');
        
        // 播放个简单的成功音效或者动效
        if (window.GameManager && window.GameManager.playSound) {
            window.GameManager.playSound('success');
        }
    }

    function finishGame() {
        // 调用结算接口
        if (window.GameManager && window.GameManager.addCoins) {
            window.GameManager.addCoins(levelData.reward);
        }
        
        // 清理并返回
        cleanup();
        
        // 假设 GameManager 有返回大厅的方法
        if (window.GameManager && window.GameManager.backToHall) {
            window.GameManager.backToHall();
        } else {
            // 后备方案：刷新或跳转
            window.location.href = 'index.html';
        }
    }

    function cleanup() {
        const style = document.getElementById('fraction-game-styles');
        if (style) style.remove();
        if (container) container.innerHTML = '';
    }

    // 暴露接口
    window.CurrentGameModule = {
        init: init,
        destroy: cleanup
    };
})();
