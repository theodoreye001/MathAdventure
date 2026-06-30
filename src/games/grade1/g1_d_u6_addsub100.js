/**
 * 一年级下册 第六单元：100以内的加法和减法（一）
 * 路径: src/games/grade1/g1_d_u6_addsub100.js
 *
 * 玩法：口算大冒险
 *   Phase 1「整十数加减」: 5 题, 展示整十数积木块, 选择正确答案
 *   Phase 2「两位数加减」: 8 题, 混合两位数 +/- 一位数/整十数, 四选一
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u6-add100-styles';

    /* ==================== 数据 ==================== */

    /** Phase 1: 整十数加减题库 (a, b, answer, op) */
    function generateP1Problems() {
        const pool = [];
        const tens = [10, 20, 30, 40, 50, 60, 70, 80];
        // 加法: a + b <= 100
        for (const a of tens) {
            for (const b of tens) {
                if (a + b <= 100 && a + b > 0) {
                    pool.push({ a: a, b: b, answer: a + b, op: '+' });
                }
            }
        }
        // 减法: a - b >= 0, a > b
        for (const a of tens) {
            for (const b of tens) {
                if (a - b >= 0 && a > b) {
                    pool.push({ a: a, b: b, answer: a - b, op: '-' });
                }
            }
        }
        return H.shuffle(pool).slice(0, 5);
    }

    /** Phase 2: 两位数加减混合题库 */
    function generateP2Problems() {
        const problems = [];
        const types = [
            // 两位数 + 一位数（不进位）
            function () {
                const tens = H.randInt(2, 8);
                const ones = H.randInt(1, 9);
                const num = tens * 10 + ones;
                const add = H.randInt(1, 9 - ones); // 不进位: ones + add <= 9
                return { a: num, b: add, answer: num + add, op: '+', label: '两位数加一位数' };
            },
            // 两位数 + 一位数（进位）
            function () {
                const tens = H.randInt(2, 8);
                const ones = H.randInt(0, 8);
                const num = tens * 10 + ones;
                const add = H.randInt(10 - ones, Math.min(9, 99 - num));
                return { a: num, b: add, answer: num + add, op: '+', label: '两位数加一位数(进位)' };
            },
            // 两位数 + 整十数
            function () {
                const tens = H.randInt(1, 7);
                const ones = H.randInt(0, 9);
                const num = tens * 10 + ones;
                const add = H.randInt(1, 9 - tens) * 10; // 不超 100
                if (num + add > 100 || add === 0) return null;
                return { a: num, b: add, answer: num + add, op: '+', label: '两位数加整十数' };
            },
            // 两位数 - 一位数
            function () {
                const tens = H.randInt(2, 9);
                const ones = H.randInt(1, 9);
                const num = tens * 10 + ones;
                const sub = H.randInt(1, ones); // 个位够减, 不退位
                return { a: num, b: sub, answer: num - sub, op: '-', label: '两位数减一位数' };
            },
            // 两位数 - 整十数
            function () {
                const tens = H.randInt(3, 9);
                const ones = H.randInt(0, 9);
                const num = tens * 10 + ones;
                const sub = H.randInt(1, tens - 1) * 10;
                return { a: num, b: sub, answer: num - sub, op: '-', label: '两位数减整十数' };
            }
        ];

        // 从 5 种类型中各出至少 1 题, 共 8 题
        const used = new Set();
        const indices = H.shuffle([0, 1, 2, 3, 4]);
        for (let i = 0; i < 5; i++) {
            const idx = indices[i];
            let p = null, attempts = 0;
            while (attempts < 10) {
                p = types[idx]();
                if (p && !used.has(p.a + p.op + p.b)) break;
                p = null;
                attempts++;
            }
            if (p) {
                used.add(p.a + p.op + p.b);
                problems.push(p);
            }
        }
        // 补齐到 8 题
        while (problems.length < 8) {
            const idx = H.randInt(0, 4);
            let p = null, attempts = 0;
            while (attempts < 10) {
                p = types[idx]();
                if (p && !used.has(p.a + p.op + p.b)) break;
                p = null;
                attempts++;
            }
            if (p) {
                used.add(p.a + p.op + p.b);
                problems.push(p);
            }
        }
        return problems;
    }

    /** 生成 3 个干扰答案 (保证正数且不重复) */
    function wrongChoices(correct) {
        const set = new Set([correct]);
        const pool = [];
        for (const d of [-3, -2, -1, 1, 2, 3]) {
            const v = correct + d;
            if (v > 0 && v <= 100) pool.push(v);
        }
        const shuffled = H.shuffle(pool);
        for (const v of shuffled) {
            set.add(v);
            if (set.size >= 4) break;
        }
        // 不够 4 个时再扩大范围
        let extra = 4;
        while (set.size < 4) {
            const v = correct + extra;
            if (v > 0 && v <= 100) set.add(v);
            extra++;
        }
        return H.shuffle([...set].map(String));
    }

    /** 积木渲染: 将数字拆成十位积木组 + 个位散块 */
    function renderBlocks(num) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        let html = '<div class="a100-blocks">';
        if (tens > 0) {
            html += '<div class="a100-tens-row">';
            for (let i = 0; i < tens; i++) {
                html += '<div class="a100-tens-group">';
                for (let j = 0; j < 10; j++) {
                    html += '<div class="a100-brick"></div>';
                }
                html += '</div>';
            }
            html += '</div>';
        }
        if (ones > 0) {
            html += '<div class="a100-ones-row">';
            for (let i = 0; i < ones; i++) {
                html += '<div class="a100-brick a100-brick-ones"></div>';
            }
            html += '</div>';
        }
        if (tens === 0 && ones === 0) {
            html += '<div class="a100-empty-text">0</div>';
        }
        html += '</div>';
        return html;
    }

    /* ==================== 状态 ==================== */

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        round: 0,       // 当前题目索引(跨阶段)
        totalRounds: 0,  // 总题数
        p1Problems: [],
        p2Problems: [],
        p2Index: 0
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
            state.round = 0;
            state.p2Index = 0;
            state.p1Problems = generateP1Problems();
            state.p2Problems = generateP2Problems();
            state.totalRounds = state.p1Problems.length + state.p2Problems.length;
        },

        /* ─────────── CSS ─────────── */
        buildCSS() {
            return `
                .a100-wrap {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(160deg,#fef9c3 0%,#fde68a 40%,#fbbf24 100%);
                    display:flex;flex-direction:column;align-items:center;
                }

                /* 进度条 */
                .a100-progress-bar{
                    position:absolute;top:76px;left:50%;transform:translateX(-50%);
                    width:60%;max-width:400px;height:14px;background:rgba(255,255,255,0.5);
                    border-radius:10px;z-index:40;overflow:hidden;
                    border:2px solid #f59e0b;
                }
                .a100-progress-fill{
                    height:100%;background:linear-gradient(90deg,#34d399,#10b981);
                    border-radius:10px;transition:width 0.5s ease;
                }
                .a100-progress-label{
                    position:absolute;top:93px;left:50%;transform:translateX(-50%);
                    font-size:13px;color:#92400e;font-weight:bold;z-index:40;
                }

                /* Phase 容器 */
                .a100-phase{
                    flex:1;width:100%;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:24px;padding:20px;
                }
                .a100-phase.hidden{display:none;}

                /* 题目卡片 */
                .a100-question-card{
                    background:white;border-radius:28px;padding:30px 40px;
                    box-shadow:0 12px 36px rgba(0,0,0,0.12);text-align:center;
                    border:4px solid #f59e0b;max-width:560px;width:90%;
                }
                .a100-expr{
                    font-size:48px;font-weight:bold;color:#92400e;
                    margin:10px 0 18px;letter-spacing:4px;
                }
                .a100-expr .a100-op{color:#f59e0b;margin:0 8px;}
                .a100-expr .a100-eq{color:#6b7280;margin:0 8px;}

                /* 积木区域 */
                .a100-blocks-area{
                    display:flex;gap:30px;align-items:flex-end;justify-content:center;
                    margin:16px 0;min-height:100px;
                }
                .a100-block-label{
                    font-size:16px;color:#6b7280;font-weight:bold;margin-bottom:6px;
                }
                .a100-block-col{display:flex;flex-direction:column;align-items:center;}
                .a100-blocks{display:flex;flex-direction:column;gap:4px;align-items:center;}
                .a100-tens-row{display:flex;gap:8px;}
                .a100-ones-row{display:flex;gap:4px;margin-top:4px;}
                .a100-tens-group{
                    display:grid;grid-template-columns:repeat(5,1fr);gap:3px;
                    padding:4px;background:rgba(251,191,36,0.15);border-radius:6px;
                    border:2px solid #fbbf24;
                }
                .a100-brick{
                    width:14px;height:14px;background:linear-gradient(135deg,#f97316,#ea580c);
                    border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.2);
                }
                .a100-brick-ones{
                    background:linear-gradient(135deg,#60a5fa,#2563eb);
                    border-radius:50%;width:12px;height:12px;
                }
                .a100-empty-text{font-size:20px;color:#9ca3af;}

                .a100-op-symbol{
                    font-size:36px;font-weight:bold;color:#f59e0b;
                    align-self:center;margin-bottom:10px;
                }

                /* 选项区域 */
                .a100-choices{
                    display:flex;flex-wrap:wrap;gap:14px;justify-content:center;
                    margin-top:10px;
                }
                .a100-choice-btn{
                    padding:14px 36px;font-size:26px;font-weight:bold;
                    background:white;border:3px solid #6366f1;border-radius:18px;
                    color:#4338ca;cursor:pointer;transition:all 0.2s;
                    min-width:80px;text-align:center;
                }
                .a100-choice-btn:hover{
                    background:#6366f1;color:white;transform:scale(1.08);
                }
                .a100-choice-btn.a100-correct{
                    background:#10b981;color:white;border-color:#059669;
                    transform:scale(1.08);
                }
                .a100-choice-btn.a100-wrong{
                    background:#ef4444;color:white;border-color:#dc2626;
                    transform:scale(0.95);opacity:0.7;
                }
            `;
        },

        /* ─────────── 渲染 ─────────── */
        render() {
            state.container.innerHTML = `
                <div class="a100-wrap">
                    ${H.guideBarHTML('\u{1F3AF}', '口算大冒险开始啦！', 'gh-guide-text')}

                    <div class="a100-progress-bar">
                        <div class="a100-progress-fill" id="a100-prog-fill" style="width:0%"></div>
                    </div>
                    <div class="a100-progress-label" id="a100-prog-label">第 0 / ${state.totalRounds} 题</div>

                    <!-- Phase 1: 整十数加减 -->
                    <div id="a100-phase1" class="a100-phase">
                        <div class="a100-question-card" id="a100-p1-card"></div>
                    </div>

                    <!-- Phase 2: 两位数加减 -->
                    <div id="a100-phase2" class="a100-phase hidden">
                        <div class="a100-question-card" id="a100-p2-card"></div>
                    </div>
                </div>
            `;
        },

        /* ─────────── Phase 1: 整十数加减 ─────────── */
        startPhase1() {
            state.phase = 1;
            H.updateGuide('第一关：整十数加减！看看积木块，选答案吧！');
            this.renderP1Question();
        },

        renderP1Question() {
            const idx = state.round;
            if (idx >= state.p1Problems.length) {
                this.startPhase2();
                return;
            }
            const p = state.p1Problems[idx];
            const card = document.getElementById('a100-p1-card');

            // 积木视觉: 只显示十位积木(因为都是整十数)
            const aBlocks = renderBlocks(p.a);
            const bBlocks = renderBlocks(p.b);

            card.innerHTML = `
                <div style="font-size:18px;color:#6b7280;font-weight:bold;margin-bottom:4px;">
                    第 ${idx + 1} / ${state.p1Problems.length} 题
                </div>
                <div class="a100-expr">
                    ${p.a} <span class="a100-op">${p.op}</span> ${p.b} <span class="a100-eq">=</span> ?
                </div>
                <div class="a100-blocks-area">
                    <div class="a100-block-col">
                        <div class="a100-block-label">${p.a}</div>
                        ${aBlocks}
                    </div>
                    <div class="a100-op-symbol">${p.op}</div>
                    <div class="a100-block-col">
                        <div class="a100-block-label">${p.b}</div>
                        ${bBlocks}
                    </div>
                </div>
                <div class="a100-choices" id="a100-choices"></div>
            `;

            this.updateProgress();
            const choices = wrongChoices(p.answer);
            H.renderChoices(choices, 'a100-choices', (ci, text) => {
                this.handleP1Answer(parseInt(text), p.answer, card);
            });
        },

        handleP1Answer(chosen, correct, cardEl) {
            const buttons = cardEl.querySelectorAll('.a100-choice-btn');
            if (chosen === correct) {
                // 高亮正确
                buttons.forEach(b => {
                    if (parseInt(b.textContent) === correct) b.classList.add('a100-correct');
                    b.style.pointerEvents = 'none';
                });
                state.round++;
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                setTimeout(() => this.renderP1Question(), 700);
            } else {
                state.mistakes++;
                buttons.forEach(b => {
                    if (parseInt(b.textContent) === chosen) b.classList.add('a100-wrong');
                    if (parseInt(b.textContent) === correct) b.classList.add('a100-correct');
                    b.style.pointerEvents = 'none';
                });
                H.triggerError(state.container, `不对哦，${correct - chosen > 0 ? '再大一点' : '再小一点'}！答案是 ${correct}`, cardEl);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '整十数加减错误',
                        `正确:${correct} 选了:${chosen}`);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
                }
                state.round++;
                setTimeout(() => this.renderP1Question(), 1400);
            }
        },

        /* ─────────── Phase 2: 两位数加减 ─────────── */
        startPhase2() {
            state.phase = 2;
            document.getElementById('a100-phase1').classList.add('hidden');
            document.getElementById('a100-phase2').classList.remove('hidden');
            H.updateGuide('第二关：挑战两位数加减！加油！');
            this.renderP2Question();
        },

        renderP2Question() {
            const idx = state.p2Index;
            if (idx >= state.p2Problems.length) {
                this.finishGame();
                return;
            }
            const p = state.p2Problems[idx];
            const card = document.getElementById('a100-p2-card');

            // 两位数积木视觉
            const aBlocks = renderBlocks(p.a);
            let bVisual = '';
            if (p.b >= 10) {
                bVisual = renderBlocks(p.b);
            } else {
                // 一位数: 显示散块
                bVisual = '<div class="a100-blocks"><div class="a100-ones-row">';
                for (let i = 0; i < p.b; i++) {
                    bVisual += '<div class="a100-brick a100-brick-ones"></div>';
                }
                bVisual += '</div></div>';
            }

            card.innerHTML = `
                <div style="font-size:18px;color:#6b7280;font-weight:bold;margin-bottom:4px;">
                    第 ${state.round + 1} / ${state.totalRounds} 题
                </div>
                <div class="a100-expr">
                    ${p.a} <span class="a100-op">${p.op}</span> ${p.b} <span class="a100-eq">=</span> ?
                </div>
                <div class="a100-blocks-area">
                    <div class="a100-block-col">
                        <div class="a100-block-label">${p.a}</div>
                        ${aBlocks}
                    </div>
                    <div class="a100-op-symbol">${p.op}</div>
                    <div class="a100-block-col">
                        <div class="a100-block-label">${p.b}</div>
                        ${bVisual}
                    </div>
                </div>
                <div class="a100-choices" id="a100-choices"></div>
            `;

            this.updateProgress();
            const choices = wrongChoices(p.answer);
            H.renderChoices(choices, 'a100-choices', (ci, text) => {
                this.handleP2Answer(parseInt(text), p.answer, card);
            });
        },

        handleP2Answer(chosen, correct, cardEl) {
            const buttons = cardEl.querySelectorAll('.a100-choice-btn');
            if (chosen === correct) {
                buttons.forEach(b => {
                    if (parseInt(b.textContent) === correct) b.classList.add('a100-correct');
                    b.style.pointerEvents = 'none';
                });
                state.round++;
                state.p2Index++;
                if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                setTimeout(() => this.renderP2Question(), 700);
            } else {
                state.mistakes++;
                buttons.forEach(b => {
                    if (parseInt(b.textContent) === chosen) b.classList.add('a100-wrong');
                    if (parseInt(b.textContent) === correct) b.classList.add('a100-correct');
                    b.style.pointerEvents = 'none';
                });
                H.triggerError(state.container, `再想想！答案是 ${correct}`, cardEl);
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '两位数加减错误',
                        `正确:${correct} 选了:${chosen}`);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
                }
                state.round++;
                state.p2Index++;
                setTimeout(() => this.renderP2Question(), 1400);
            }
        },

        /* ─────────── 进度 ─────────── */
        updateProgress() {
            const pct = Math.round((state.round / state.totalRounds) * 100);
            const fill = document.getElementById('a100-prog-fill');
            const label = document.getElementById('a100-prog-label');
            if (fill) fill.style.width = pct + '%';
            if (label) label.textContent = `第 ${state.round + 1} / ${state.totalRounds} 题`;
        },

        /* ─────────── 结算 ─────────── */
        finishGame() {
            const subtitle = state.mistakes === 0
                ? '全部正确，口算大冒险完美通关！'
                : state.mistakes <= 3
                    ? '表现不错，继续练习会更快！'
                    : '多练几遍，速度和准确率都会提升的！';
            H.showSettlement(state.container, state.levelData.reward || 25, state.levelData, state.mistakes, subtitle, 'lvl_1_d_7');
        }
    };

    window.CurrentGameModule = game;
})();
