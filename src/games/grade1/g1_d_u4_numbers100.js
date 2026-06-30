/**
 * 一年级下册 第四单元：100以内数的认识
 * 路径: src/games/grade1/g1_d_u4_numbers100.js
 *
 * 三阶段游戏 "数字阶梯":
 *   Phase 1 "数一数"  — 看捆+散小棒，输入总数
 *   Phase 2 "读写挑战" — 闪现数字，输入读法和写法
 *   Phase 3 "比大小"  — 两个数比大小，点选 > < =
 */

(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u4-num100-styles';

    /* ────────── 状态 ────────── */
    let state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        score: 0,
        // Phase 1
        p1_target: 33,
        p1_round: 0,
        p1_totalRounds: 4,
        // Phase 2
        p2_target: 25,
        p2_round: 0,
        p2_totalRounds: 4,
        // Phase 3
        p3_a: 0,
        p3_b: 0,
        p3_round: 0,
        p3_totalRounds: 4
    };

    /* ────────── 工具 ────────── */

    /** 生成 11-99 的随机数（确保十位 1-9，个位 0-9，且不是整十或个位0以保证视觉丰富度，但偶尔也允许整十） */
    function randNum100(min, max) {
        return H.randInt(min, max);
    }

    /** 构建小棒视觉 HTML */
    function sticksHTML(num) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        let html = '<div class="n100-sticks-row">';
        // 捆 (每捆 = 10 根)
        for (let i = 0; i < tens; i++) {
            html += '<div class="n100-bundle">🔟</div>';
        }
        if (tens > 0 && ones > 0) {
            html += '<div class="n100-sticks-sep"></div>';
        }
        // 散根
        for (let i = 0; i < ones; i++) {
            html += '<div class="n100-stick">🧮</div>';
        }
        html += '</div>';
        // 标注
        if (tens > 0) {
            html += `<div class="n100-caption">${tens} 个十${ones > 0 ? ' + ' + ones + ' 个一' : ''}</div>`;
        } else {
            html += `<div class="n100-caption">${ones} 个一</div>`;
        }
        return html;
    }

    /** 生成随机不相等的一对数 */
    function randPair() {
        const a = H.randInt(11, 99);
        let b = H.randInt(11, 99);
        // 25% 概率让两数相等（增加 = 判断训练）
        if (Math.random() < 0.25) {
            b = a;
        } else {
            while (b === a) b = H.randInt(11, 99);
        }
        return { a, b };
    }

    /* ────────── 样式 ────────── */
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        H.injectStyles(STYLE_ID, `
            /* ====== 全局 ====== */
            .n100-wrapper {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', sans-serif;
                background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 50%, #ede9fe 100%);
                display: flex; flex-direction: column; align-items: center;
            }
            .n100-scene {
                flex: 1; width: 100%; position: relative;
                display: none; flex-direction: column; align-items: center; justify-content: center;
                gap: 30px; padding: 20px;
            }

            /* ====== Phase 1: 数一数 ====== */
            .n100-sticks-card {
                background: white; border-radius: 30px; padding: 35px 50px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #c084fc;
                display: flex; flex-direction: column; align-items: center; gap: 15px;
                min-width: 320px;
            }
            .n100-sticks-title {
                font-size: 24px; font-weight: bold; color: #7c3aed;
            }
            .n100-sticks-row {
                display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
                align-items: flex-end; min-height: 70px;
            }
            .n100-bundle {
                font-size: 48px; line-height: 1;
                animation: n100-popIn 0.3s ease both;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
            }
            .n100-stick {
                font-size: 36px; line-height: 1;
                animation: n100-popIn 0.3s ease both;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
            }
            .n100-sticks-sep {
                width: 3px; height: 55px; background: #d8b4fe;
                border-radius: 2px; margin: 0 8px; align-self: center;
                opacity: 0.5;
            }
            .n100-caption {
                font-size: 20px; color: #7c3aed; font-weight: 600; margin-top: 5px;
            }
            @keyframes n100-popIn {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .n100-input-group {
                display: flex; align-items: center; gap: 15px; margin-top: 10px;
            }
            .n100-input {
                width: 120px; height: 70px; border: 4px solid #c084fc; border-radius: 18px;
                text-align: center; font-size: 42px; font-weight: bold; color: #7c3aed;
                background: white; outline: none; transition: border-color 0.3s;
            }
            .n100-input:focus { border-color: #a855f7; box-shadow: 0 0 0 4px rgba(168,85,247,0.2); }
            .n100-input.shake { animation: n100-shake 0.4s ease; }
            @keyframes n100-shake {
                0%,100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                50% { transform: translateX(8px); }
                75% { transform: translateX(-5px); }
            }
            .n100-btn {
                padding: 14px 36px; font-size: 22px; font-weight: bold;
                border: none; border-radius: 18px; cursor: pointer; transition: all 0.2s;
            }
            .n100-btn:active { transform: scale(0.95); }
            .n100-btn-purple {
                background: linear-gradient(135deg, #a855f7, #7c3aed);
                color: white; box-shadow: 0 5px 0 #6d28d9;
            }
            .n100-btn-green {
                background: linear-gradient(135deg, #34d399, #10b981);
                color: white; box-shadow: 0 5px 0 #059669;
            }

            /* ====== Phase 2: 读写挑战 ====== */
            .n100-flash-card {
                background: white; border-radius: 30px; padding: 40px 60px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #f472b6;
                text-align: center; min-width: 300px;
            }
            .n100-flash-number {
                font-size: 100px; font-weight: 900; color: #ec4899;
                text-shadow: 0 4px 10px rgba(236,72,153,0.2);
                animation: n100-pulse 1s ease;
            }
            @keyframes n100-pulse {
                0% { transform: scale(0.5); opacity: 0; }
                60% { transform: scale(1.15); }
                100% { transform: scale(1); opacity: 1; }
            }
            .n100-decomp {
                display: flex; gap: 20px; justify-content: center; margin: 15px 0;
                font-size: 22px; color: #9d174d;
            }
            .n100-decomp span {
                background: #fce7f3; padding: 6px 18px; border-radius: 12px; font-weight: 600;
            }
            .n100-write-prompt {
                font-size: 24px; color: #9d174d; font-weight: 600; margin-top: 10px;
            }
            .n100-read-answer {
                display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 12px;
            }
            .n100-read-btn {
                padding: 10px 24px; font-size: 20px; font-weight: bold;
                border: 3px solid #f472b6; border-radius: 14px;
                background: white; color: #9d174d; cursor: pointer; transition: all 0.2s;
            }
            .n100-read-btn:hover { background: #fce7f3; transform: scale(1.05); }

            /* ====== Phase 3: 比大小 ====== */
            .n100-compare-board {
                display: flex; align-items: center; gap: 25px;
                background: white; padding: 35px 55px; border-radius: 30px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #fbbf24;
            }
            .n100-compare-num {
                font-size: 80px; font-weight: 900; color: #d97706;
                min-width: 100px; text-align: center;
            }
            .n100-compare-slot {
                width: 100px; height: 100px; border: 4px dashed #fbbf24; border-radius: 22px;
                display: flex; align-items: center; justify-content: center;
                font-size: 56px; font-weight: 900; color: #fbbf24;
                background: #fffbeb; transition: all 0.3s;
            }
            .n100-compare-slot.filled { border-style: solid; background: #fef3c7; }
            .n100-symbol-group {
                display: flex; gap: 20px; margin-top: 10px;
            }
            .n100-symbol-btn {
                width: 100px; height: 100px; border: none; border-radius: 22px;
                font-size: 52px; font-weight: 900; cursor: pointer;
                transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 6px 0 rgba(0,0,0,0.15);
            }
            .n100-symbol-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,0.15); }
            .n100-symbol-btn[data-s=">"] { background: #ef4444; color: white; }
            .n100-symbol-btn[data-s="<"] { background: #3b82f6; color: white; }
            .n100-symbol-btn[data-s="="] { background: #10b981; color: white; }

            /* ====== Progress ====== */
            .n100-progress {
                display: flex; gap: 10px; margin-top: 5px;
            }
            .n100-dot {
                width: 14px; height: 14px; border-radius: 50%;
                background: #d8b4fe; transition: background 0.3s;
            }
            .n100-dot.done { background: #a855f7; }
            .n100-dot.current { background: #7c3aed; transform: scale(1.3); }

            /* ====== Phase 标题 ====== */
            .n100-phase-label {
                font-size: 28px; font-weight: bold; color: #7c3aed;
                background: rgba(255,255,255,0.7); padding: 10px 30px;
                border-radius: 20px; border: 3px solid #d8b4fe;
            }

            /* ====== Hint toast ====== */
            .n100-hint {
                position: absolute; background: #ef4444; color: white;
                padding: 10px 22px; border-radius: 14px; font-weight: bold;
                z-index: 60; box-shadow: 0 4px 12px rgba(239,68,68,0.3);
                animation: n100-fadeUp 2s forwards; pointer-events: none;
            }
            @keyframes n100-fadeUp {
                0% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; }
                100% { opacity: 0; transform: translateY(-25px); }
            }
        `);
    }

    /* ────────── 引导与错误 ────────── */
    function updateGuide(text) {
        H.updateGuide(text, 'n100-guide-text');
    }

    function triggerError(msg, element) {
        state.mistakes++;
        H.triggerError(state.container, msg, element || state.container.querySelector('.n100-wrapper'));
    }

    /* ────────── Phase 1: 数一数 ────────── */
    function startPhase1() {
        state.phase = 1;
        showScene('scene-p1');
        nextP1Round();
    }

    function nextP1Round() {
        if (state.p1_round >= state.p1_totalRounds) {
            startPhase2();
            return;
        }
        state.p1_target = randNum100(11, 99);
        renderP1();
        updateGuide(`🧮 第 ${state.p1_round + 1}/${state.p1_totalRounds} 题：数一数，一共有多少根小棒？`);
    }

    function renderP1() {
        const scene = document.getElementById('scene-p1');
        const sticks = sticksHTML(state.p1_target);
        scene.innerHTML = `
            <div class="n100-phase-label">第一关 · 数一数</div>
            <div class="n100-sticks-card">
                <div class="n100-sticks-title">数一数，一共多少根？</div>
                ${sticks}
            </div>
            <div class="n100-input-group">
                <input type="number" class="n100-input" id="n100-p1-input" min="1" max="99" placeholder="?"
                    inputmode="numeric" autocomplete="off">
                <button class="n100-btn n100-btn-purple" id="n100-p1-btn">确定</button>
            </div>
            <div class="n100-progress" id="n100-p1-progress">
                ${renderDots(state.p1_totalRounds, state.p1_round)}
            </div>
        `;
        const input = document.getElementById('n100-p1-input');
        const btn = document.getElementById('n100-p1-btn');
        input.focus();
        const check = () => {
            const val = parseInt(input.value);
            if (isNaN(val)) return;
            if (val === state.p1_target) {
                state.score += 5;
                state.p1_round++;
                updateGuide('✅ 太棒了！答对了！');
                setTimeout(nextP1Round, 800);
            } else {
                showHint(input, '再数数看，仔细数哦！');
                input.value = '';
                input.focus();
            }
        };
        btn.onclick = check;
        input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
    }

    /* ────────── Phase 2: 读写挑战 ────────── */
    function startPhase2() {
        state.phase = 2;
        state.p2_round = 0;
        showScene('scene-p2');
        nextP2Round();
    }

    function nextP2Round() {
        if (state.p2_round >= state.p2_totalRounds) {
            startPhase3();
            return;
        }
        state.p2_target = randNum100(20, 99);
        renderP2();
        updateGuide(`📖 第 ${state.p2_round + 1}/${state.p2_totalRounds} 题：看清这个数，然后把它写出来！`);
    }

    function renderP2() {
        const num = state.p2_target;
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        const scene = document.getElementById('scene-p2');

        scene.innerHTML = `
            <div class="n100-phase-label">第二关 · 读写挑战</div>
            <div class="n100-flash-card">
                <div class="n100-flash-number" id="n100-flash-num">${num}</div>
                <div class="n100-decomp">
                    <span>${tens} 个十</span>
                    <span>${ones} 个一</span>
                </div>
            </div>
            <div class="n100-write-prompt">这个数怎么写？请输入数字：</div>
            <div class="n100-input-group">
                <input type="number" class="n100-input" id="n100-p2-input" min="1" max="99" placeholder="?"
                    inputmode="numeric" autocomplete="off">
                <button class="n100-btn n100-btn-purple" id="n100-p2-btn">确定</button>
            </div>
            <div class="n100-progress" id="n100-p2-progress">
                ${renderDots(state.p2_totalRounds, state.p2_round)}
            </div>
        `;

        // 2 秒后隐藏数字，要求凭记忆写
        const flashEl = document.getElementById('n100-flash-num');
        setTimeout(() => {
            flashEl.style.transition = 'opacity 0.5s';
            flashEl.style.opacity = '0';
            setTimeout(() => {
                flashEl.textContent = '?';
                flashEl.style.opacity = '1';
                updateGuide('✏️ 数字消失了！你还记得吗？快写出来！');
            }, 500);
        }, 2000);

        const input = document.getElementById('n100-p2-input');
        const btn = document.getElementById('n100-p2-btn');
        input.focus();
        const check = () => {
            const val = parseInt(input.value);
            if (isNaN(val)) return;
            if (val === state.p2_target) {
                state.score += 5;
                state.p2_round++;
                updateGuide('✅ 太棒了！答对了！');
                setTimeout(nextP2Round, 800);
            } else {
                showHint(input, `答案是 ${state.p2_target}，${tens} 个十和 ${ones} 个一哦！`);
                input.value = '';
                input.focus();
            }
        };
        btn.onclick = check;
        input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
    }

    /* ────────── Phase 3: 比大小 ────────── */
    function startPhase3() {
        state.phase = 3;
        state.p3_round = 0;
        showScene('scene-p3');
        nextP3Round();
    }

    function nextP3Round() {
        if (state.p3_round >= state.p3_totalRounds) {
            finishGame();
            return;
        }
        const pair = randPair();
        state.p3_a = pair.a;
        state.p3_b = pair.b;
        renderP3();
        updateGuide(`⚖️ 第 ${state.p3_round + 1}/${state.p3_totalRounds} 题：${state.p3_a} 和 ${state.p3_b}，哪个大？`);
    }

    function renderP3() {
        const scene = document.getElementById('scene-p3');
        scene.innerHTML = `
            <div class="n100-phase-label">第三关 · 比大小</div>
            <div class="n100-compare-board">
                <div class="n100-compare-num">${state.p3_a}</div>
                <div class="n100-compare-slot" id="n100-comp-slot">?</div>
                <div class="n100-compare-num">${state.p3_b}</div>
            </div>
            <div class="n100-symbol-group" id="n100-symbol-group">
                <button class="n100-symbol-btn" data-s=">">&gt;</button>
                <button class="n100-symbol-btn" data-s="=">=</button>
                <button class="n100-symbol-btn" data-s="<">&lt;</button>
            </div>
            <div class="n100-progress" id="n100-p3-progress">
                ${renderDots(state.p3_totalRounds, state.p3_round)}
            </div>
        `;

        document.getElementById('n100-symbol-group').addEventListener('click', (e) => {
            const btn = e.target.closest('.n100-symbol-btn');
            if (!btn) return;
            const chosen = btn.dataset.s;
            let correct;
            if (state.p3_a > state.p3_b) correct = '>';
            else if (state.p3_a < state.p3_b) correct = '<';
            else correct = '=';

            const slot = document.getElementById('n100-comp-slot');
            if (chosen === correct) {
                slot.textContent = chosen;
                slot.classList.add('filled');
                state.score += 5;
                state.p3_round++;
                updateGuide(`✅ 对了！${state.p3_a} ${correct} ${state.p3_b}`);
                // 禁用按钮
                document.getElementById('n100-symbol-group').style.pointerEvents = 'none';
                setTimeout(nextP3Round, 1000);
            } else {
                showHint(btn, '想一想，哪个数更大呢？');
            }
        });
    }

    /* ────────── 辅助渲染 ────────── */
    function showScene(id) {
        state.container.querySelectorAll('.n100-scene').forEach(s => s.style.display = 'none');
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    }

    function renderDots(total, current) {
        let html = '';
        for (let i = 0; i < total; i++) {
            const cls = i < current ? 'done' : i === current ? 'current' : '';
            html += `<div class="n100-dot ${cls}"></div>`;
        }
        return html;
    }

    function showHint(element, msg) {
        triggerError(msg, element);
    }

    /* ────────── 结算 ────────── */
    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 20,
            state.levelData,
            state.mistakes,
            '你已经认识了100以内的数！',
            'lvl_1_d_5'
        );
    }

    /* ────────── 主入口 ────────── */
    const game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            // 重置
            state.mistakes = 0;
            state.score = 0;
            state.phase = 1;
            state.p1_round = 0;
            state.p2_round = 0;
            state.p3_round = 0;

            injectStyles();

            // 渲染主体框架
            state.container.innerHTML = `
                <div class="n100-wrapper">
                    ${H.guideBarHTML('🧮', '欢迎来到数字阶梯！', 'n100-guide-text')}

                    <!-- Phase 1 -->
                    <div id="scene-p1" class="n100-scene"></div>
                    <!-- Phase 2 -->
                    <div id="scene-p2" class="n100-scene"></div>
                    <!-- Phase 3 -->
                    <div id="scene-p3" class="n100-scene"></div>
                </div>
            `;

            startPhase1();
        },

        render: function () {
            // 外部调用可刷新（简单重启）
            if (state.container && state.levelData) {
                this.init(
                    state.container.id ? '#' + state.container.id : state.container.className,
                    state.levelData
                );
            }
        },

        finishGame: function () {
            finishGame();
        }
    };

    window.CurrentGameModule = game;
})();
