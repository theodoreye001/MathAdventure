/**
 * 二年级上册 第二单元：100以内的加法和减法（二）- 笔算城堡
 * 路径: src/games/grade2/g2_u2_written_calc.js
 *
 * 玩法：笔算城堡
 *   Phase 1「竖式填空」: 5 题, 展示竖式加减法, 缺少某一位数字, 玩家填入
 *   Phase 2「连加连减」: 4 题, 三步混合运算, 玩家输入最终答案
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u2-wcalc-styles';

    /* ==================== 数据生成 ==================== */

    /** Phase 1: 生成竖式填空题 */
    function generateP1Problems() {
        const pool = [];
        // 加法竖式
        for (let attempt = 0; attempt < 200 && pool.length < 12; attempt++) {
            const a = H.randInt(11, 89);
            const b = H.randInt(11, 99 - a);
            const ans = a + b;
            // 随机挖一个数位：a的十位、a的个位、b的十位、b的个位、结果的十位、结果的个位
            const slots = [];
            const aTens = Math.floor(a / 10), aOnes = a % 10;
            const bTens = Math.floor(b / 10), bOnes = b % 10;
            const rTens = Math.floor(ans / 10), rOnes = ans % 10;
            // 个位挖空（结果个位或加数个位）
            slots.push({ digit: aOnes, label: `${a} 的个位`, display: aTens + '_' + aOnes, numA: a, numB: b, ans: ans });
            slots.push({ digit: bOnes, label: `${b} 的个位`, display: bTens + '_' + bOnes, numA: a, numB: b, ans: ans });
            slots.push({ digit: rOnes, label: '结果的个位', display: rTens + '_' + rOnes, numA: a, numB: b, ans: ans });
            // 十位挖空（排除十位为0的情况）
            if (aTens > 0) slots.push({ digit: aTens, label: `${a} 的十位`, display: aTens + '_' + aOnes, numA: a, numB: b, ans: ans });
            if (bTens > 0) slots.push({ digit: bTens, label: `${b} 的十位`, display: bTens + '_' + bOnes, numA: a, numB: b, ans: ans });
            if (rTens > 0) slots.push({ digit: rTens, label: '结果的十位', display: rTens + '_' + rOnes, numA: a, numB: b, ans: ans });
            if (slots.length > 0) pool.push({ type: 'add', a, b, ans, slot: H.shuffle(slots)[0] });
        }
        // 减法竖式
        for (let attempt = 0; attempt < 200 && pool.length < 24; attempt++) {
            const a = H.randInt(22, 99);
            const b = H.randInt(11, a - 1);
            const ans = a - b;
            const aTens = Math.floor(a / 10), aOnes = a % 10;
            const bTens = Math.floor(b / 10), bOnes = b % 10;
            const rTens = Math.floor(ans / 10), rOnes = ans % 10;
            const slots = [];
            if (aOnes > 0) slots.push({ digit: aOnes, label: `${a} 的个位`, numA: a, numB: b, ans: ans, op: '-' });
            if (bOnes > 0) slots.push({ digit: bOnes, label: `${b} 的个位`, numA: a, numB: b, ans: ans, op: '-' });
            slots.push({ digit: rOnes, label: '结果的个位', numA: a, numB: b, ans: ans, op: '-' });
            if (aTens > 0) slots.push({ digit: aTens, label: `${a} 的十位`, numA: a, numB: b, ans: ans, op: '-' });
            if (bTens > 0) slots.push({ digit: bTens, label: `${b} 的十位`, numA: a, numB: b, ans: ans, op: '-' });
            if (rTens > 0) slots.push({ digit: rTens, label: '结果的十位', numA: a, numB: b, ans: ans, op: '-' });
            if (slots.length > 0) pool.push({ type: 'sub', a, b, ans, slot: H.shuffle(slots)[0] });
        }
        return H.shuffle(pool).slice(0, 5);
    }

    /** Phase 2: 生成连加连减/加减混合题 (a op1 b op2 c = ?) */
    function generateP2Problems() {
        const problems = [];
        const used = new Set();
        const generators = [
            // 连加: a + b + c
            function () {
                const a = H.randInt(12, 45);
                const b = H.randInt(5, 30);
                if (a + b > 90) return null;
                const c = H.randInt(3, 99 - a - b);
                if (c <= 0) return null;
                const ans = a + b + c;
                if (ans > 100 || ans <= 0) return null;
                return { a, b, c, op1: '+', op2: '+', ans, label: '连加' };
            },
            // 连减: a - b - c
            function () {
                const a = H.randInt(50, 99);
                const b = H.randInt(10, a - 15);
                const mid = a - b;
                if (mid <= 10) return null;
                const c = H.randInt(3, mid - 1);
                const ans = mid - c;
                if (ans <= 0) return null;
                return { a, b, c, op1: '-', op2: '-', ans, label: '连减' };
            },
            // 加减混合: a + b - c
            function () {
                const a = H.randInt(15, 60);
                const b = H.randInt(10, 30);
                if (a + b > 99) return null;
                const mid = a + b;
                const c = H.randInt(5, mid - 5);
                const ans = mid - c;
                if (ans <= 0 || ans > 100) return null;
                return { a, b, c, op1: '+', op2: '-', ans, label: '加减混合' };
            },
            // 减加混合: a - b + c
            function () {
                const a = H.randInt(40, 90);
                const b = H.randInt(10, a - 10);
                const mid = a - b;
                const c = H.randInt(3, 99 - mid);
                const ans = mid + c;
                if (ans <= 0 || ans > 100) return null;
                return { a, b, c, op1: '-', op2: '+', ans, label: '减加混合' };
            }
        ];
        // 各类型至少1题
        const order = H.shuffle([0, 1, 2, 3]);
        for (const idx of order) {
            for (let t = 0; t < 15; t++) {
                const p = generators[idx]();
                if (p && !used.has(`${p.a}${p.op1}${p.b}${p.op2}${p.c}`)) {
                    used.add(`${p.a}${p.op1}${p.b}${p.op2}${p.c}`);
                    problems.push(p);
                    break;
                }
            }
        }
        // 补齐到 4 题
        while (problems.length < 4) {
            const idx = H.randInt(0, 3);
            for (let t = 0; t < 20; t++) {
                const p = generators[idx]();
                const key = `${p.a}${p.op1}${p.b}${p.op2}${p.c}`;
                if (p && !used.has(key)) {
                    used.add(key);
                    problems.push(p);
                    break;
                }
            }
            break; // 安全阀
        }
        return problems;
    }

    /* ==================== 状态 ==================== */

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        p1Problems: [],
        p1Index: 0,
        p2Problems: [],
        p2Index: 0,
        totalRounds: 0,
        currentRound: 0
    };

    /* ==================== 游戏模块 ==================== */

    const game = {

        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;
            this.resetState();
            H.injectStyles(STYLE_ID, this.buildCSS());
            this.render();
            this.startPhase1();
        },

        resetState() {
            state.phase = 1;
            state.mistakes = 0;
            state.p1Index = 0;
            state.p2Index = 0;
            state.currentRound = 0;
            state.p1Problems = generateP1Problems();
            state.p2Problems = generateP2Problems();
            state.totalRounds = state.p1Problems.length + state.p2Problems.length;
        },

        /* ─────────── CSS ─────────── */
        buildCSS() {
            return `
                .wcl-wrap {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(160deg,#ede9fe 0%,#c4b5fd 40%,#8b5cf6 100%);
                    display:flex;flex-direction:column;align-items:center;
                }

                /* 进度条 */
                .wcl-progress-bar{
                    position:absolute;top:76px;left:50%;transform:translateX(-50%);
                    width:60%;max-width:400px;height:14px;background:rgba(255,255,255,0.5);
                    border-radius:10px;z-index:40;overflow:hidden;
                    border:2px solid #8b5cf6;
                }
                .wcl-progress-fill{
                    height:100%;background:linear-gradient(90deg,#34d399,#10b981);
                    border-radius:10px;transition:width 0.5s ease;
                }
                .wcl-progress-label{
                    position:absolute;top:93px;left:50%;transform:translateX(-50%);
                    font-size:13px;color:#4c1d95;font-weight:bold;z-index:40;
                }

                /* Phase 容器 */
                .wcl-phase{
                    flex:1;width:100%;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:20px;padding:20px;
                }
                .wcl-phase.hidden{display:none;}

                /* 题目卡片 */
                .wcl-card{
                    background:white;border-radius:28px;padding:30px 36px;
                    box-shadow:0 12px 36px rgba(0,0,0,0.12);text-align:center;
                    border:4px solid #8b5cf6;max-width:520px;width:92%;
                }
                .wcl-qnum{
                    font-size:16px;color:#6b7280;font-weight:bold;margin-bottom:8px;
                }

                /* ═══ Phase1: 竖式区域 ═══ */
                .wcl-columnar{
                    display:inline-flex;flex-direction:column;align-items:flex-end;
                    gap:0;margin:16px auto;font-family:'Courier New',monospace;
                }
                .wcl-col-row{
                    display:flex;align-items:center;gap:0;
                }
                .wcl-col-digit{
                    width:52px;height:60px;display:flex;align-items:center;justify-content:center;
                    font-size:36px;font-weight:bold;color:#1e293b;
                    border:3px solid #e2e8f0;border-radius:10px;
                    background:#f8fafc;margin:2px;
                }
                .wcl-col-digit.wcl-missing{
                    background:#fef3c7;border-color:#f59e0b;color:#f59e0b;
                    animation:wcl-pulse 1.2s infinite;
                }
                .wcl-col-op{
                    width:52px;height:60px;display:flex;align-items:center;justify-content:center;
                    font-size:32px;font-weight:bold;color:#8b5cf6;
                    margin:2px;
                }
                .wcl-col-line{
                    width:100%;height:4px;background:#1e293b;border-radius:2px;margin:4px 0;
                }
                .wcl-col-equals{
                    width:52px;height:60px;display:flex;align-items:center;justify-content:center;
                    font-size:32px;font-weight:bold;color:#6b7280;margin:2px;
                }
                .wcl-col-blank{
                    width:52px;height:60px;margin:2px;
                }

                @keyframes wcl-pulse{
                    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.4);}
                    50%{box-shadow:0 0 0 10px rgba(245,158,11,0);}
                }

                .wcl-hint{
                    font-size:17px;color:#6d28d9;font-weight:bold;margin:12px 0 4px;
                }

                /* 输入行 */
                .wcl-input-row{
                    display:flex;align-items:center;justify-content:center;gap:12px;
                    margin-top:12px;
                }
                .wcl-ans-input{
                    width:80px;height:52px;text-align:center;font-size:28px;font-weight:bold;
                    border:3px solid #8b5cf6;border-radius:14px;outline:none;
                    color:#1e293b;background:#faf5ff;transition:border-color 0.2s;
                }
                .wcl-ans-input:focus{border-color:#6d28d9;}
                .wcl-ans-input.wcl-shake{
                    animation:wcl-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                    border-color:#ef4444;
                }
                @keyframes wcl-shake{
                    10%,90%{transform:translateX(-1px);}
                    20%,80%{transform:translateX(2px);}
                    30%,50%,70%{transform:translateX(-4px);}
                    40%,60%{transform:translateX(4px);}
                }
                .wcl-submit-btn{
                    padding:10px 28px;font-size:18px;font-weight:bold;
                    background:#8b5cf6;color:white;border:none;border-radius:14px;
                    cursor:pointer;transition:all 0.2s;
                }
                .wcl-submit-btn:hover{background:#6d28d9;transform:scale(1.05);}

                /* ═══ Phase2: 连加连减 ═══ */
                .wcl-expr{
                    font-size:38px;font-weight:bold;color:#1e293b;margin:14px 0;
                    letter-spacing:2px;word-break:break-all;
                }
                .wcl-expr .wcl-op{color:#8b5cf6;margin:0 6px;}
                .wcl-expr .wcl-eq{color:#6b7280;margin:0 6px;}

                .wcl-step-hint{
                    font-size:15px;color:#6b7280;margin:6px 0 14px;
                    background:#f5f3ff;padding:8px 16px;border-radius:12px;
                    display:inline-block;
                }

                /* 已完成步骤高亮 */
                .wcl-step-done{color:#10b981;text-decoration:line-through;opacity:0.6;}

                /* 通用成功/失败反馈色 */
                .wcl-correct-flash{
                    animation:wcl-pop 0.3s ease;
                }
                @keyframes wcl-pop{
                    0%{transform:scale(1);}
                    50%{transform:scale(1.06);}
                    100%{transform:scale(1);}
                }
            `;
        },

        /* ─────────── 渲染主框架 ─────────── */
        render() {
            state.container.innerHTML = `
                <div class="wcl-wrap">
                    ${H.guideBarHTML('\u{1F3F0}', '欢迎来到笔算城堡！', 'gh-guide-text')}

                    <div class="wcl-progress-bar">
                        <div class="wcl-progress-fill" id="wcl-prog-fill" style="width:0%"></div>
                    </div>
                    <div class="wcl-progress-label" id="wcl-prog-label">第 0 / ${state.totalRounds} 题</div>

                    <!-- Phase 1 -->
                    <div id="wcl-phase1" class="wcl-phase">
                        <div class="wcl-card" id="wcl-p1-card"></div>
                    </div>

                    <!-- Phase 2 -->
                    <div id="wcl-phase2" class="wcl-phase hidden">
                        <div class="wcl-card" id="wcl-p2-card"></div>
                    </div>
                </div>
            `;
        },

        /* ─────────── 进度条 ─────────── */
        updateProgress() {
            const pct = Math.round((state.currentRound / state.totalRounds) * 100);
            const fill = document.getElementById('wcl-prog-fill');
            const label = document.getElementById('wcl-prog-label');
            if (fill) fill.style.width = pct + '%';
            if (label) label.textContent = `第 ${state.currentRound + 1} / ${state.totalRounds} 题`;
        },

        /* ═══════════════ Phase 1: 竖式填空 ═══════════════ */

        startPhase1() {
            state.phase = 1;
            H.updateGuide('第一关：竖式填空！找出缺少的数字！');
            this.renderP1Question();
        },

        renderP1Question() {
            const idx = state.p1Index;
            if (idx >= state.p1Problems.length) {
                this.startPhase2();
                return;
            }
            const p = state.p1Problems[idx];
            const card = document.getElementById('wcl-p1-card');
            const isAdd = p.type === 'add';
            const opSymbol = isAdd ? '+' : '-';
            const { a, b, ans, slot } = p;

            // 构建竖式 HTML
            const aStr = String(a).padStart(2, ' ');
            const bStr = String(b).padStart(2, ' ');
            const rStr = String(ans).padStart(2, ' ');

            // 判断挖空位置
            const missingFrom = slot.op === '-' ? 'sub' : p.type;
            // slot.label 包含线索: "XX 的个位" / "XX 的十位" / "结果的个位"

            const aTens = Math.floor(a / 10), aOnes = a % 10;
            const bTens = Math.floor(b / 10), bOnes = b % 10;
            const rTens = Math.floor(ans / 10), rOnes = ans % 10;

            // 根据挖空位置渲染
            const colHTML = this.buildColumnarHTML(
                aTens, aOnes, bTens, bOnes, rTens, rOnes,
                opSymbol, slot, p
            );

            card.innerHTML = `
                <div class="wcl-qnum">第 ${idx + 1} / ${state.p1Problems.length} 题</div>
                ${colHTML}
                <div class="wcl-hint">请输入 ${slot.label}：</div>
                <div class="wcl-input-row">
                    <input type="number" class="wcl-ans-input" id="wcl-p1-input" min="0" max="9" maxlength="1" autofocus>
                    <button class="wcl-submit-btn" id="wcl-p1-submit">确定</button>
                </div>
            `;

            this.updateProgress();

            const input = document.getElementById('wcl-p1-input');
            const submitBtn = document.getElementById('wcl-p1-submit');

            const check = () => {
                const val = parseInt(input.value, 10);
                if (isNaN(val)) return;
                if (val === slot.digit) {
                    // 正确
                    input.style.borderColor = '#10b981';
                    input.disabled = true;
                    submitBtn.disabled = true;
                    // 填入正确数字（去掉动画）
                    const missingEl = card.querySelector('.wcl-col-digit.wcl-missing');
                    if (missingEl) {
                        missingEl.textContent = slot.digit;
                        missingEl.classList.remove('wcl-missing');
                        missingEl.style.background = '#d1fae5';
                        missingEl.style.borderColor = '#10b981';
                        missingEl.style.color = '#065f46';
                        missingEl.style.animation = 'none';
                    }
                    state.currentRound++;
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                    setTimeout(() => {
                        state.p1Index++;
                        this.renderP1Question();
                    }, 900);
                } else {
                    // 错误
                    state.mistakes++;
                    input.classList.add('wcl-shake');
                    input.style.borderColor = '#ef4444';
                    if (window.GameManager) {
                        window.GameManager.logError(state.levelData.levelId,
                            `竖式填空: ${a} ${opSymbol} ${b} = ${ans}, ${slot.label}`, val, slot.digit);
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
                    }
                    setTimeout(() => {
                        input.classList.remove('wcl-shake');
                        input.value = '';
                        input.style.borderColor = '#8b5cf6';
                    }, 600);
                }
            };

            submitBtn.onclick = check;
            input.onkeyup = (e) => { if (e.key === 'Enter') check(); };
            // 自动聚焦
            setTimeout(() => input.focus(), 100);
        },

        /** 构建竖式 HTML */
        buildColumnarHTML(aT, aO, bT, bO, rT, rO, op, slot, p) {
            // 确定哪个位置是 missing
            const isMissingA_T = (slot.label === `${p.a} 的十位`);
            const isMissingA_O = (slot.label === `${p.a} 的个位`);
            const isMissingB_T = (slot.label === `${p.b} 的十位`);
            const isMissingB_O = (slot.label === `${p.b} 的个位`);
            const isMissingR_T = (slot.label === '结果的十位');
            const isMissingR_O = (slot.label === '结果的个位');

            function digitCell(val, isMissing) {
                if (isMissing) return `<div class="wcl-col-digit wcl-missing">?</div>`;
                return `<div class="wcl-col-digit">${val}</div>`;
            }

            // 第一行: _ a1 a0
            const rowA = `
                <div class="wcl-col-row">
                    <div class="wcl-col-blank"></div>
                    ${digitCell(aT, isMissingA_T)}
                    ${digitCell(aO, isMissingA_O)}
                </div>`;

            // 第二行: op _ b1 b0
            const rowB = `
                <div class="wcl-col-row">
                    <div class="wcl-col-op">${op}</div>
                    ${digitCell(bT, isMissingB_T)}
                    ${digitCell(bO, isMissingB_O)}
                </div>`;

            // 横线
            const lineHTML = `<div class="wcl-col-line"></div>`;

            // 结果行: = r1 r0 (对齐为: blank + rTens + rOnes)
            const rowR = `
                <div class="wcl-col-row">
                    <div class="wcl-col-equals">=</div>
                    ${digitCell(rT, isMissingR_T)}
                    ${digitCell(rO, isMissingR_O)}
                </div>`;

            return `
                <div class="wcl-columnar">
                    ${rowA}
                    ${rowB}
                    ${lineHTML}
                    ${rowR}
                </div>
            `;
        },

        /* ═══════════════ Phase 2: 连加连减 ═══════════════ */

        startPhase2() {
            state.phase = 2;
            document.getElementById('wcl-phase1').classList.add('hidden');
            document.getElementById('wcl-phase2').classList.remove('hidden');
            H.updateGuide('第二关：连加连减！算出最终答案！');
            this.renderP2Question();
        },

        renderP2Question() {
            const idx = state.p2Index;
            if (idx >= state.p2Problems.length) {
                this.finishGame();
                return;
            }
            const p = state.p2Problems[idx];
            const card = document.getElementById('wcl-p2-card');

            card.innerHTML = `
                <div class="wcl-qnum">第 ${state.currentRound + 1} / ${state.totalRounds} 题</div>
                <div class="wcl-expr">
                    ${p.a}
                    <span class="wcl-op">${p.op1}</span>${p.b}
                    <span class="wcl-op">${p.op2}</span>${p.c}
                    <span class="wcl-eq">=</span> ?
                </div>
                <div class="wcl-step-hint">
                    提示：先算 ${p.a} ${p.op1} ${p.b}，再 ${p.op2} ${p.c}
                </div>
                <div class="wcl-input-row">
                    <input type="number" class="wcl-ans-input" id="wcl-p2-input" min="0" max="100" autofocus>
                    <button class="wcl-submit-btn" id="wcl-p2-submit">确定</button>
                </div>
            `;

            this.updateProgress();

            const input = document.getElementById('wcl-p2-input');
            const submitBtn = document.getElementById('wcl-p2-submit');

            const check = () => {
                const val = parseInt(input.value, 10);
                if (isNaN(val)) return;
                if (val === p.ans) {
                    // 正确
                    input.style.borderColor = '#10b981';
                    input.disabled = true;
                    submitBtn.disabled = true;
                    card.classList.add('wcl-correct-flash');
                    // 显示完整结果
                    const exprEl = card.querySelector('.wcl-expr');
                    if (exprEl) {
                        exprEl.innerHTML = `
                            ${p.a}
                            <span class="wcl-op">${p.op1}</span>${p.b}
                            <span class="wcl-op">${p.op2}</span>${p.c}
                            <span class="wcl-eq">=</span>
                            <span style="color:#10b981;">${p.ans}</span>
                        `;
                    }
                    state.currentRound++;
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 12);
                    setTimeout(() => {
                        card.classList.remove('wcl-correct-flash');
                        state.p2Index++;
                        this.renderP2Question();
                    }, 1000);
                } else {
                    // 错误
                    state.mistakes++;
                    input.classList.add('wcl-shake');
                    input.style.borderColor = '#ef4444';
                    if (window.GameManager) {
                        window.GameManager.logError(state.levelData.levelId,
                            `连加连减: ${p.a}${p.op1}${p.b}${p.op2}${p.c}=${p.ans}`, val, p.ans);
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    setTimeout(() => {
                        input.classList.remove('wcl-shake');
                        input.value = '';
                        input.style.borderColor = '#8b5cf6';
                    }, 600);
                }
            };

            submitBtn.onclick = check;
            input.onkeyup = (e) => { if (e.key === 'Enter') check(); };
            setTimeout(() => input.focus(), 100);
        },

        /* ─────────── 结算 ─────────── */
        finishGame() {
            const subtitle = state.mistakes === 0
                ? '全部正确，笔算城堡完美通关！'
                : state.mistakes <= 3
                    ? '表现不错，笔算越来越熟练了！'
                    : '多练习几次，笔算会越来越快的！';
            H.showSettlement(state.container, state.levelData.reward || 25, state.levelData, state.mistakes, subtitle, 'lvl_2_3_1');
        }
    };

    window.CurrentGameModule = game;
})();
