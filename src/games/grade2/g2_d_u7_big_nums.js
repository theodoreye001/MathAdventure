/**
 * 二年级下册 第七单元：万以内数的认识
 * 路径: src/games/grade2/g2_d_u7_big_nums.js
 *
 * 三阶段游戏 "数位塔楼":
 *   Phase 1 "数位认识" — 展示一个四位数，玩家判断各位上的数字是哪一位（个/十/百/千）。3轮。
 *   Phase 2 "数的组成" — 将一个数拆分为各位的值之和，如 3421 = 3000+400+20+1。填空。3轮。
 *   Phase 3 "比大小" — 比较两个 3-4 位数的大小，用 > < = 按钮选择。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-d-u7-bignums-styles';

    /* ────────── 状态 ────────── */
    let state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        // Phase 1
        p1_num: 0,
        p1_target: '',        // 被提问的数位名称
        p1_targetIdx: 0,      // 被提问的数位索引 0=千,1=百,2=十,3=个
        p1_round: 0,
        p1_totalRounds: 3,
        // Phase 2
        p2_num: 0,
        p2_parts: [],         // [{label,value}, ...]
        p2_blanks: [],        // 玩家填写的值
        p2_currentBlank: 0,
        p2_round: 0,
        p2_totalRounds: 3,
        // Phase 3
        p3_a: 0,
        p3_b: 0,
        p3_round: 0,
        p3_totalRounds: 4
    };

    /* ────────── 工具 ────────── */

    const PLACE_NAMES = ['千', '百', '十', '个'];
    const PLACE_VALUES = [1000, 100, 10, 1];

    /** 生成一个各位不全为零的 3-4 位数 */
    function genBigNum() {
        const digits = [
            H.randInt(1, 9),  // 千位 (1-9)
            H.randInt(0, 9),  // 百位
            H.randInt(0, 9),  // 十位
            H.randInt(1, 9)   // 个位（保证至少有一位非零）
        ];
        return digits[0] * 1000 + digits[1] * 100 + digits[2] * 10 + digits[3];
    }

    /** 提取各位数字 */
    function getDigits(num) {
        return [
            Math.floor(num / 1000),
            Math.floor((num % 1000) / 100),
            Math.floor((num % 100) / 10),
            num % 10
        ];
    }

    /** 生成两个不相等的比较用数 */
    function genComparePair() {
        const a = genBigNum();
        let b = genBigNum();
        // 25% 概率相等
        if (Math.random() < 0.25) {
            b = a;
        } else {
            let attempts = 0;
            while (b === a && attempts < 20) {
                b = genBigNum();
                attempts++;
            }
        }
        return { a, b };
    }

    /* ────────── 样式 ────────── */
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        H.injectStyles(STYLE_ID, `
            /* ====== 全局 ====== */
            .bgn-wrapper {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%);
                display: flex; flex-direction: column; align-items: center;
            }
            .bgn-scene {
                flex: 1; width: 100%; position: relative;
                display: none; flex-direction: column; align-items: center; justify-content: center;
                gap: 28px; padding: 20px;
            }

            /* ====== Phase 1: 数位认识 ====== */
            .bgn-tower-card {
                background: white; border-radius: 30px; padding: 35px 50px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #818cf8;
                display: flex; flex-direction: column; align-items: center; gap: 18px;
                min-width: 320px; animation: bgn-popIn 0.4s ease both;
            }
            @keyframes bgn-popIn {
                0% { transform: scale(0.85); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .bgn-tower-title {
                font-size: 24px; font-weight: bold; color: #4338ca;
            }
            .bgn-digit-display {
                display: flex; gap: 6px; justify-content: center;
            }
            .bgn-digit-box {
                width: 80px; height: 90px; border: 3px solid #818cf8; border-radius: 16px;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: #eef2ff; cursor: pointer; transition: all 0.25s;
                user-select: none;
            }
            .bgn-digit-box:hover { transform: translateY(-4px); border-color: #4f46e5; }
            .bgn-digit-box.selected { background: #4f46e5; color: white; border-color: #4338ca; }
            .bgn-digit-box.correct { background: #10b981; color: white; border-color: #059669; }
            .bgn-digit-box.wrong { background: #ef4444; color: white; border-color: #dc2626; }
            .bgn-digit-val {
                font-size: 42px; font-weight: 900; line-height: 1;
            }
            .bgn-digit-label {
                font-size: 14px; font-weight: 600; margin-top: 2px; opacity: 0.7;
            }
            .bgn-question-text {
                font-size: 22px; color: #4338ca; font-weight: 600;
            }
            .bgn-question-text em {
                font-style: normal; color: #ef4444; font-size: 26px;
            }
            .bgn-options-row {
                display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
            }
            .bgn-opt-btn {
                padding: 14px 32px; font-size: 24px; font-weight: bold;
                border: 3px solid #818cf8; border-radius: 18px;
                background: white; color: #4338ca; cursor: pointer; transition: all 0.2s;
                min-width: 80px; text-align: center;
            }
            .bgn-opt-btn:hover { background: #e0e7ff; transform: scale(1.06); }
            .bgn-opt-btn.correct { background: #10b981; color: white; border-color: #059669; transform: scale(1.08); }
            .bgn-opt-btn.wrong { background: #ef4444; color: white; border-color: #dc2626; transform: scale(0.95); opacity: 0.7; }

            /* ====== Phase 2: 数的组成 ====== */
            .bgn-compose-card {
                background: white; border-radius: 30px; padding: 35px 50px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #f472b6;
                text-align: center; min-width: 340px; animation: bgn-popIn 0.4s ease both;
            }
            .bgn-compose-num {
                font-size: 72px; font-weight: 900; color: #ec4899;
                text-shadow: 0 4px 10px rgba(236,72,153,0.15);
            }
            .bgn-compose-eq {
                font-size: 28px; color: #9d174d; font-weight: 600;
                display: flex; align-items: center; justify-content: center;
                gap: 6px; flex-wrap: wrap; margin-top: 12px;
            }
            .bgn-compose-slot {
                display: inline-flex; align-items: center;
                min-width: 70px; height: 52px; border: 3px dashed #f472b6; border-radius: 12px;
                background: #fdf2f8; font-size: 28px; font-weight: 900; color: #ec4899;
                justify-content: center; transition: all 0.3s;
            }
            .bgn-compose-slot.filled { border-style: solid; background: #fce7f3; }
            .bgn-compose-slot.active { border-color: #db2777; box-shadow: 0 0 0 3px rgba(219,39,119,0.2); }
            .bgn-compose-slot.correct { background: #10b981; color: white; border-color: #059669; border-style: solid; }
            .bgn-compose-slot.wrong { background: #ef4444; color: white; border-color: #dc2626; border-style: solid; }
            .bgn-compose-plus {
                font-size: 28px; font-weight: bold; color: #db2777;
            }
            .bgn-compose-labels {
                display: flex; gap: 6px; justify-content: center; margin-top: 8px;
            }
            .bgn-compose-lbl {
                font-size: 14px; color: #9d174d; font-weight: 600;
                width: 70px; text-align: center;
            }
            .bgn-input-row {
                display: flex; align-items: center; gap: 12px; margin-top: 16px; justify-content: center;
            }
            .bgn-input {
                width: 120px; height: 56px; border: 3px solid #f472b6; border-radius: 14px;
                text-align: center; font-size: 32px; font-weight: bold; color: #ec4899;
                background: white; outline: none; transition: border-color 0.3s;
            }
            .bgn-input:focus { border-color: #db2777; box-shadow: 0 0 0 3px rgba(219,39,119,0.15); }
            .bgn-input.shake { animation: bgn-shake 0.4s ease; }
            @keyframes bgn-shake {
                0%,100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                50% { transform: translateX(8px); }
                75% { transform: translateX(-5px); }
            }
            .bgn-btn {
                padding: 12px 30px; font-size: 20px; font-weight: bold;
                border: none; border-radius: 16px; cursor: pointer; transition: all 0.2s;
            }
            .bgn-btn:active { transform: scale(0.95); }
            .bgn-btn-pink {
                background: linear-gradient(135deg, #ec4899, #db2777);
                color: white; box-shadow: 0 4px 0 #be185d;
            }

            /* ====== Phase 3: 比大小 ====== */
            .bgn-compare-board {
                display: flex; align-items: center; gap: 25px;
                background: white; padding: 35px 55px; border-radius: 30px;
                box-shadow: 0 12px 35px rgba(0,0,0,0.08); border: 4px solid #fbbf24;
                animation: bgn-popIn 0.4s ease both;
            }
            .bgn-compare-num {
                font-size: 72px; font-weight: 900; color: #d97706;
                min-width: 80px; text-align: center;
            }
            .bgn-compare-slot {
                width: 90px; height: 90px; border: 4px dashed #fbbf24; border-radius: 22px;
                display: flex; align-items: center; justify-content: center;
                font-size: 52px; font-weight: 900; color: #fbbf24;
                background: #fffbeb; transition: all 0.3s;
            }
            .bgn-compare-slot.filled { border-style: solid; background: #fef3c7; }
            .bgn-symbol-group {
                display: flex; gap: 20px; margin-top: 10px;
            }
            .bgn-symbol-btn {
                width: 100px; height: 100px; border: none; border-radius: 22px;
                font-size: 52px; font-weight: 900; cursor: pointer;
                transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 6px 0 rgba(0,0,0,0.15);
            }
            .bgn-symbol-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,0.15); }
            .bgn-symbol-btn[data-s=">"] { background: #ef4444; color: white; }
            .bgn-symbol-btn[data-s="<"] { background: #3b82f6; color: white; }
            .bgn-symbol-btn[data-s="="] { background: #10b981; color: white; }

            /* ====== Progress ====== */
            .bgn-progress {
                display: flex; gap: 10px; margin-top: 5px;
            }
            .bgn-dot {
                width: 14px; height: 14px; border-radius: 50%;
                background: #c7d2fe; transition: background 0.3s;
            }
            .bgn-dot.done { background: #818cf8; }
            .bgn-dot.current { background: #4f46e5; transform: scale(1.3); }

            /* ====== Phase 标题 ====== */
            .bgn-phase-label {
                font-size: 28px; font-weight: bold; color: #4338ca;
                background: rgba(255,255,255,0.7); padding: 10px 30px;
                border-radius: 20px; border: 3px solid #c7d2fe;
            }
        `);
    }

    /* ────────── 引导与错误 ────────── */
    function updateGuide(text) {
        H.updateGuide(text, 'bgn-guide-text');
    }

    function triggerError(msg, element) {
        state.mistakes++;
        H.triggerError(state.container, msg, element || state.container.querySelector('.bgn-wrapper'));
    }

    /* ────────── 辅助渲染 ────────── */
    function showScene(id) {
        state.container.querySelectorAll('.bgn-scene').forEach(s => s.style.display = 'none');
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    }

    function renderDots(total, current) {
        let html = '';
        for (let i = 0; i < total; i++) {
            const cls = i < current ? 'done' : i === current ? 'current' : '';
            html += `<div class="bgn-dot ${cls}"></div>`;
        }
        return html;
    }

    /* ────────── Phase 1: 数位认识 ────────── */
    function startPhase1() {
        state.phase = 1;
        state.p1_round = 0;
        showScene('scene-p1');
        nextP1Round();
    }

    function nextP1Round() {
        if (state.p1_round >= state.p1_totalRounds) {
            startPhase2();
            return;
        }
        state.p1_num = genBigNum();
        state.p1_targetIdx = H.randInt(0, 3);
        state.p1_target = PLACE_NAMES[state.p1_targetIdx];
        renderP1();
        updateGuide(`🏗️ 第 ${state.p1_round + 1}/${state.p1_totalRounds} 题：${state.p1_num} 的 <em>${state.p1_target}位</em> 上是几？`);
    }

    function renderP1() {
        const digits = getDigits(state.p1_num);
        const scene = document.getElementById('scene-p1');
        scene.innerHTML = `
            <div class="bgn-phase-label">第一关 · 数位认识</div>
            <div class="bgn-tower-card">
                <div class="bgn-tower-title">数位塔楼</div>
                <div class="bgn-digit-display">
                    ${digits.map((d, i) => `
                        <div class="bgn-digit-box" data-idx="${i}" style="animation-delay:${i * 0.1}s">
                            <div class="bgn-digit-val">${d}</div>
                            <div class="bgn-digit-label">${PLACE_NAMES[i]}位</div>
                        </div>
                    `).join('')}
                </div>
                <div class="bgn-question-text" id="bgn-p1-q">
                    这个数的 <em>${state.p1_target}位</em> 上是几？
                </div>
                <div class="bgn-options-row" id="bgn-p1-opts"></div>
            </div>
            <div class="bgn-progress">${renderDots(state.p1_totalRounds, state.p1_round)}</div>
        `;

        const correctVal = digits[state.p1_targetIdx];
        const opts = new Set([correctVal]);
        // 生成干扰选项（0-9范围内）
        while (opts.size < 4) {
            opts.add(H.randInt(0, 9));
        }
        const shuffled = H.shuffle([...opts].map(String));

        const optsEl = document.getElementById('bgn-p1-opts');
        optsEl.innerHTML = shuffled.map(v =>
            `<button class="bgn-opt-btn" data-v="${v}">${v}</button>`
        ).join('');

        optsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.bgn-opt-btn');
            if (!btn || btn.classList.contains('correct') || btn.classList.contains('wrong')) return;
            const chosen = parseInt(btn.dataset.v);
            if (chosen === correctVal) {
                btn.classList.add('correct');
                // 高亮对应数位框
                const boxes = scene.querySelectorAll('.bgn-digit-box');
                boxes[state.p1_targetIdx].classList.add('correct');
                // 禁用所有按钮
                optsEl.querySelectorAll('.bgn-opt-btn').forEach(b => b.style.pointerEvents = 'none');
                updateGuide(`✅ 太棒了！${state.p1_num} 的 ${state.p1_target}位 上是 ${correctVal}！`);
                state.p1_round++;
                setTimeout(nextP1Round, 1000);
            } else {
                btn.classList.add('wrong');
                triggerError(`不对哦，${state.p1_target}位 上的数字是 ${correctVal}`, btn);
                setTimeout(() => btn.classList.remove('wrong'), 500);
            }
        });
    }

    /* ────────── Phase 2: 数的组成 ────────── */
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
        state.p2_num = genBigNum();
        const digits = getDigits(state.p2_num);
        state.p2_parts = digits.map((d, i) => ({ label: PLACE_NAMES[i] + '位', value: d * PLACE_VALUES[i] }));
        // 过滤掉值为 0 的部分（只保留非零位，让学生更直观理解）
        state.p2_parts = state.p2_parts.filter(p => p.value > 0);
        state.p2_blanks = state.p2_parts.map(() => 0);
        state.p2_currentBlank = 0;
        renderP2();
        updateGuide(`🔢 第 ${state.p2_round + 1}/${state.p2_totalRounds} 题：把 ${state.p2_num} 拆开填一填！`);
    }

    function renderP2() {
        const scene = document.getElementById('scene-p2');
        const parts = state.p2_parts;

        let eqHTML = '';
        parts.forEach((p, i) => {
            const isActive = i === state.p2_currentBlank;
            const isFilled = state.p2_blanks[i] > 0;
            const slotClass = 'bgn-compose-slot' +
                (isActive ? ' active' : '') +
                (isFilled ? ' filled' : '');
            if (i > 0) eqHTML += '<span class="bgn-compose-plus">+</span>';
            eqHTML += `<span class="${slotClass}" id="bgn-slot-${i}">${isFilled ? state.p2_blanks[i] : '?'}</span>`;
        });

        let labelsHTML = '';
        parts.forEach(p => {
            labelsHTML += `<span class="bgn-compose-lbl">${p.label}</span>`;
        });

        scene.innerHTML = `
            <div class="bgn-phase-label">第二关 · 数的组成</div>
            <div class="bgn-compose-card">
                <div style="font-size:18px;color:#9d174d;font-weight:600;margin-bottom:4px;">
                    把这个数拆开
                </div>
                <div class="bgn-compose-num">${state.p2_num}</div>
                <div class="bgn-compose-eq">${eqHTML}</div>
                <div class="bgn-compose-labels">${labelsHTML}</div>
                ${state.p2_currentBlank < parts.length ? `
                <div class="bgn-input-row">
                    <input type="number" class="bgn-input" id="bgn-p2-input" placeholder="?"
                        inputmode="numeric" autocomplete="off">
                    <button class="bgn-btn bgn-btn-pink" id="bgn-p2-btn">确定</button>
                </div>
                <div style="font-size:16px;color:#9d174d;margin-top:6px;">
                    ${parts[state.p2_currentBlank].label}上的数字是 ${Math.floor(parts[state.p2_currentBlank].value / PLACE_VALUES[state.p2_currentBlank])}，
                    表示 <em>${state.p2_num}</em> 中的几个？
                </div>
                ` : `
                <div style="margin-top:16px;font-size:22px;font-weight:bold;color:#10b981;">
                    🎉 拆完了！
                </div>
                `}
            </div>
            <div class="bgn-progress">${renderDots(state.p2_totalRounds, state.p2_round)}</div>
        `;

        if (state.p2_currentBlank < parts.length) {
            const input = document.getElementById('bgn-p2-input');
            const btn = document.getElementById('bgn-p2-btn');
            if (input) input.focus();

            const check = () => {
                const val = parseInt(input.value);
                if (isNaN(val)) return;
                const correct = parts[state.p2_currentBlank].value;
                const slot = document.getElementById('bgn-slot-' + state.p2_currentBlank);

                if (val === correct) {
                    slot.textContent = val;
                    slot.classList.add('filled');
                    slot.classList.remove('active');
                    slot.classList.add('correct');
                    input.disabled = true;
                    btn.disabled = true;
                    updateGuide(`✅ 对了！${parts[state.p2_currentBlank].label}上的 ${Math.floor(correct / PLACE_VALUES[state.p2_currentBlank])} 表示 ${correct}！`);
                    state.p2_currentBlank++;
                    setTimeout(() => renderP2(), 900);
                } else {
                    slot.classList.add('wrong');
                    triggerError(`想一想，${Math.floor(correct / PLACE_VALUES[state.p2_currentBlank])} 个 ${PLACE_VALUES[state.p2_currentBlank] < 10 ? PLACE_VALUES[state.p2_currentBlank] : parts[state.p2_currentBlank].label} 是多少？`, input);
                    input.classList.add('shake');
                    setTimeout(() => {
                        input.classList.remove('shake');
                        slot.classList.remove('wrong');
                    }, 600);
                    input.value = '';
                    input.focus();
                }
            };
            btn.onclick = check;
            input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
        } else {
            // 这轮完成
            state.p2_round++;
            setTimeout(nextP2Round, 1200);
        }
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
        const pair = genComparePair();
        state.p3_a = pair.a;
        state.p3_b = pair.b;
        renderP3();
        updateGuide(`⚖️ 第 ${state.p3_round + 1}/${state.p3_totalRounds} 题：${state.p3_a} 和 ${state.p3_b}，哪个大？`);
    }

    function renderP3() {
        const scene = document.getElementById('scene-p3');
        scene.innerHTML = `
            <div class="bgn-phase-label">第三关 · 比大小</div>
            <div class="bgn-compare-board">
                <div class="bgn-compare-num">${state.p3_a}</div>
                <div class="bgn-compare-slot" id="bgn-comp-slot">?</div>
                <div class="bgn-compare-num">${state.p3_b}</div>
            </div>
            <div class="bgn-symbol-group" id="bgn-symbol-group">
                <button class="bgn-symbol-btn" data-s=">">&gt;</button>
                <button class="bgn-symbol-btn" data-s="=">=</button>
                <button class="bgn-symbol-btn" data-s="<">&lt;</button>
            </div>
            <div class="bgn-progress">${renderDots(state.p3_totalRounds, state.p3_round)}</div>
        `;

        document.getElementById('bgn-symbol-group').addEventListener('click', (e) => {
            const btn = e.target.closest('.bgn-symbol-btn');
            if (!btn) return;
            const chosen = btn.dataset.s;
            let correct;
            if (state.p3_a > state.p3_b) correct = '>';
            else if (state.p3_a < state.p3_b) correct = '<';
            else correct = '=';

            const slot = document.getElementById('bgn-comp-slot');
            if (chosen === correct) {
                slot.textContent = chosen;
                slot.classList.add('filled');
                updateGuide(`✅ 对了！${state.p3_a} ${correct} ${state.p3_b}`);
                document.getElementById('bgn-symbol-group').style.pointerEvents = 'none';
                state.p3_round++;
                setTimeout(nextP3Round, 1000);
            } else {
                triggerError('想一想，哪个数更大呢？', btn);
            }
        });
    }

    /* ────────── 结算 ────────── */
    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 20,
            state.levelData,
            state.mistakes,
            '你已经认识了万以内的数！',
            'lvl_2_d_8'
        );
    }

    /* ────────── 主入口 ────────── */
    const game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            // 重置状态
            state.mistakes = 0;
            state.phase = 1;
            state.p1_round = 0;
            state.p2_round = 0;
            state.p3_round = 0;

            injectStyles();

            state.container.innerHTML = `
                <div class="bgn-wrapper">
                    ${H.guideBarHTML('🏗️', '欢迎来到数位塔楼！', 'bgn-guide-text')}
                    <div id="scene-p1" class="bgn-scene"></div>
                    <div id="scene-p2" class="bgn-scene"></div>
                    <div id="scene-p3" class="bgn-scene"></div>
                </div>
            `;

            startPhase1();
        },

        render: function () {
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
