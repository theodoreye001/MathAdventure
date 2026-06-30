/**
 * 二年级下册 第五单元：混合运算（运算顺序）
 * 路径: src/games/grade2/g2_d_u5_mixed_ops.js
 *
 * "运算迷宫" — 掌握先乘除后加减、括号优先
 *   Phase 1 "运算顺序": 展示含两个运算符的算式，玩家点击先算的运算符。
 *     5 题。涵盖：加×乘、减×乘、括号+加等组合。
 *   Phase 2 "计算结果": 完整两步混合算式，玩家输入最终答案。
 *     5 题。涵盖：乘/加、乘/减、含括号。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-d-u5-mix-styles';

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        step: 0,
        mistakes: 0,
        rounds: [],
        isFinished: false,
        locked: false
    };

    /* ================================================================
     *  题库生成
     * ================================================================ */

    /**
     * Phase 1 题目：给定表达式，玩家选择先算哪个运算符
     * 返回 { expr, parts, correctIdx, explanation }
     *   parts: [{ text, op? }]  -- op 标记为运算符位置
     */
    function buildPhase1Rounds() {
        const templates = [
            // 类型 A: 加 + 乘 —— 先算乘
            function () {
                var a = H.randInt(2, 6), b = H.randInt(3, 9), c = H.randInt(2, 5);
                var expr = a + ' + ' + b + ' × ' + c;
                return {
                    expr: expr,
                    parts: [
                        { text: String(a) },
                        { text: ' + ', op: '+' },
                        { text: String(b) },
                        { text: ' × ', op: '×' },
                        { text: String(c) }
                    ],
                    correctIdx: 3, // × 的位置
                    explanation: '先算乘法 ' + b + '×' + c + '=' + (b * c)
                };
            },
            // 类型 B: 乘 + 加 —— 先算乘
            function () {
                var a = H.randInt(2, 9), b = H.randInt(2, 5), c = H.randInt(1, 8);
                var expr = a + ' × ' + b + ' + ' + c;
                return {
                    expr: expr,
                    parts: [
                        { text: String(a) },
                        { text: ' × ', op: '×' },
                        { text: String(b) },
                        { text: ' + ', op: '+' },
                        { text: String(c) }
                    ],
                    correctIdx: 1,
                    explanation: '先算乘法 ' + a + '×' + b + '=' + (a * b)
                };
            },
            // 类型 C: 减 + 乘 —— 先算乘
            function () {
                var a = H.randInt(10, 20), b = H.randInt(2, 9), c = H.randInt(2, 5);
                var expr = a + ' − ' + b + ' × ' + c;
                return {
                    expr: expr,
                    parts: [
                        { text: String(a) },
                        { text: ' − ', op: '−' },
                        { text: String(b) },
                        { text: ' × ', op: '×' },
                        { text: String(c) }
                    ],
                    correctIdx: 3,
                    explanation: '先算乘法 ' + b + '×' + c + '=' + (b * c)
                };
            },
            // 类型 D: 乘 + 减 —— 先算乘
            function () {
                var a = H.randInt(2, 8), b = H.randInt(3, 9), c = H.randInt(1, 10);
                var expr = a + ' × ' + b + ' − ' + c;
                return {
                    expr: expr,
                    parts: [
                        { text: String(a) },
                        { text: ' × ', op: '×' },
                        { text: String(b) },
                        { text: ' − ', op: '−' },
                        { text: String(c) }
                    ],
                    correctIdx: 1,
                    explanation: '先算乘法 ' + a + '×' + b + '=' + (a * b)
                };
            },
            // 类型 E: (加) + 乘 —— 先算括号里的
            function () {
                var a = H.randInt(2, 8), b = H.randInt(1, 6), c = H.randInt(2, 5);
                var expr = '(' + a + ' + ' + b + ') × ' + c;
                return {
                    expr: expr,
                    parts: [
                        { text: '(' + a, op: '(' },
                        { text: ' + ', op: '+' },
                        { text: b + ')', op: ')' },
                        { text: ' × ', op: '×' },
                        { text: String(c) }
                    ],
                    correctIdx: 1, // 先算括号里的加法
                    explanation: '有括号先算括号里：' + a + '+' + b + '=' + (a + b)
                };
            },
            // 类型 F: 乘 + (减) —— 先算乘，再算括号
            function () {
                var a = H.randInt(2, 6), b = H.randInt(2, 5), c = H.randInt(1, 5), d = H.randInt(1, 3);
                // a×b − (c+d) 但二年级可能太复杂，简化为: a×b + c
                // 改用: 乘 + (加法) 嵌套简化
                var x = H.randInt(2, 8), y = H.randInt(1, 5);
                var expr = x + ' × (' + y + ' + ' + H.randInt(1, 3) + ')';
                var inner = y + H.randInt(1, 3);
                return {
                    expr: expr,
                    parts: [
                        { text: String(x) },
                        { text: ' × ', op: '×' },
                        { text: '(' + y, op: '(' },
                        { text: ' + ', op: '+' },
                        { text: (inner - y) + ')', op: ')' }
                    ],
                    correctIdx: 3, // 先算括号里的加法
                    explanation: '有括号先算括号里'
                };
            }
        ];

        var picked = H.shuffle(templates).slice(0, 5);
        return picked.map(function (fn) { return fn(); });
    }

    /**
     * Phase 2 题目：完整的两步混合运算，输入答案
     * 返回 { expr, answer, hint }
     */
    function buildPhase2Rounds() {
        var pool = [];

        // 乘 + 加
        for (var i = 0; i < 4; i++) {
            var a = H.randInt(2, 8), b = H.randInt(2, 9), c = H.randInt(1, 10);
            pool.push({
                expr: a + ' × ' + b + ' + ' + c,
                answer: a * b + c,
                hint: '先算 ' + a + '×' + b + '=' + (a * b) + '，再加 ' + c
            });
        }
        // 乘 + 减
        for (var i = 0; i < 4; i++) {
            var a = H.randInt(3, 9), b = H.randInt(2, 5), c = H.randInt(1, a * b - 1);
            pool.push({
                expr: a + ' × ' + b + ' − ' + c,
                answer: a * b - c,
                hint: '先算 ' + a + '×' + b + '=' + (a * b) + '，再减 ' + c
            });
        }
        // 加 + 乘
        for (var i = 0; i < 3; i++) {
            var a = H.randInt(1, 10), b = H.randInt(2, 6), c = H.randInt(2, 5);
            pool.push({
                expr: a + ' + ' + b + ' × ' + c,
                answer: a + b * c,
                hint: '先算 ' + b + '×' + c + '=' + (b * c) + '，再加 ' + a
            });
        }
        // 减 + 乘
        for (var i = 0; i < 3; i++) {
            var a = H.randInt(15, 30), b = H.randInt(2, 5), c = H.randInt(2, 4);
            pool.push({
                expr: a + ' − ' + b + ' × ' + c,
                answer: a - b * c,
                hint: '先算 ' + b + '×' + c + '=' + (b * c) + '，再用 ' + a + ' 减'
            });
        }
        // (加) × 数
        for (var i = 0; i < 3; i++) {
            var a = H.randInt(2, 8), b = H.randInt(1, 5), c = H.randInt(2, 5);
            pool.push({
                expr: '(' + a + ' + ' + b + ') × ' + c,
                answer: (a + b) * c,
                hint: '有括号先算：' + a + '+' + b + '=' + (a + b) + '，再乘 ' + c
            });
        }
        // (减) × 数
        for(var i = 0; i < 3; i++) {
            var a = H.randInt(10, 20), b = H.randInt(2, 8);
            if (a - b <= 0) { a = b + H.randInt(2, 5); }
            var c = H.randInt(2, 5);
            pool.push({
                expr: '(' + a + ' − ' + b + ') × ' + c,
                answer: (a - b) * c,
                hint: '有括号先算：' + a + '−' + b + '=' + (a - b) + '，再乘 ' + c
            });
        }

        // 确保答案为正整数，过滤后随机取 5 个
        pool = pool.filter(function (q) { return q.answer > 0 && q.answer <= 100; });
        return H.shuffle(pool).slice(0, 5);
    }

    /* ================================================================
     *  CSS
     * ================================================================ */
    function buildCSS() {
        return `
            /* ── 全局容器 ── */
            .mix-wrap {
                width:100%;height:100%;position:relative;overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background:linear-gradient(160deg,#eff6ff 0%,#dbeafe 40%,#bfdbfe 100%);
                display:flex;flex-direction:column;align-items:center;
            }

            /* ── 引导栏 ── */
            .mix-guide {
                position:absolute;top:16px;left:50%;transform:translateX(-50%);
                background:rgba(255,255,255,0.92);padding:10px 36px;border-radius:40px;
                box-shadow:0 4px 14px rgba(0,0,0,0.08);font-size:21px;font-weight:bold;
                color:#1e40af;z-index:50;display:flex;align-items:center;gap:12px;
                border:3px solid #3b82f6;white-space:nowrap;
            }
            .mix-guide-spr { font-size:28px;animation:mixFloat 2s infinite ease-in-out; }
            @keyframes mixFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

            /* ── 进度指示 ── */
            .mix-progress {
                position:absolute;top:72px;left:50%;transform:translateX(-50%);
                font-size:15px;color:#1e40af;font-weight:bold;z-index:50;
            }

            /* ── 阶段区域 ── */
            .mix-phase { display:none;flex-direction:column;align-items:center;width:100%;flex:1;
                justify-content:center;gap:20px; }
            .mix-phase.active { display:flex; }

            /* ── Phase 1: 运算顺序 ── */
            .mix-p1-card {
                background:#fff;border-radius:28px;padding:36px 44px;
                box-shadow:0 8px 28px rgba(0,0,0,0.08);text-align:center;
                border:4px solid #3b82f6;min-width:320px;max-width:520px;
            }
            .mix-p1-label { font-size:16px;color:#1e40af;margin-bottom:10px;font-weight:bold; }
            .mix-p1-expr {
                font-size:52px;font-weight:bold;color:#1e3a8a;letter-spacing:4px;
                margin:12px 0 28px;line-height:1.3;
            }
            .mix-p1-operators {
                display:flex;align-items:center;justify-content:center;gap:16px;
                flex-wrap:wrap;
            }
            .mix-p1-op-btn {
                padding:16px 28px;font-size:36px;font-weight:bold;border:none;
                border-radius:16px;cursor:pointer;transition:all 0.2s;
                background:#eff6ff;color:#2563eb;border:3px solid #93c5fd;
                min-width:60px;
            }
            .mix-p1-op-btn:hover {
                background:#3b82f6;color:#fff;border-color:#3b82f6;
                transform:scale(1.1);box-shadow:0 4px 14px rgba(59,130,246,0.4);
            }
            .mix-p1-op-btn.correct {
                background:#22c55e !important;color:#fff !important;border-color:#16a34a !important;
                animation:mixPop 0.3s ease-out;
            }
            .mix-p1-op-btn.wrong {
                background:#ef4444 !important;color:#fff !important;border-color:#dc2626 !important;
                animation:mixShake 0.4s ease-out;
            }
            .mix-p1-hint {
                margin-top:18px;font-size:17px;color:#6b7280;min-height:24px;
                transition:all 0.3s;
            }

            /* ── Phase 2: 计算结果 ── */
            .mix-p2-card {
                background:#fff;border-radius:28px;padding:36px 44px;
                box-shadow:0 8px 28px rgba(0,0,0,0.08);text-align:center;
                border:4px solid #8b5cf6;min-width:320px;max-width:480px;
            }
            .mix-p2-label { font-size:16px;color:#7c3aed;margin-bottom:10px;font-weight:bold; }
            .mix-p2-expr {
                font-size:46px;font-weight:bold;color:#4c1d95;letter-spacing:3px;
                margin:12px 0 24px;line-height:1.3;
            }
            .mix-p2-eq {
                font-size:40px;font-weight:bold;color:#7c3aed;
            }
            .mix-p2-input-row {
                display:flex;gap:12px;align-items:center;justify-content:center;margin-top:8px;
            }
            .mix-p2-input {
                width:130px;font-size:42px;text-align:center;padding:10px 0;
                border:3px solid #7c3aed;border-radius:14px;outline:none;
                color:#4c1d95;font-weight:bold;background:#f5f3ff;
            }
            .mix-p2-input:focus { border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,0.25); }
            .mix-p2-submit {
                padding:12px 30px;font-size:20px;font-weight:bold;border:none;
                border-radius:14px;background:#8b5cf6;color:#fff;cursor:pointer;
                transition:all 0.2s;
            }
            .mix-p2-submit:hover { background:#7c3aed;transform:scale(1.05); }
            .mix-p2-hint {
                margin-top:14px;font-size:16px;color:#6b7280;min-height:22px;
            }

            /* ── 浮标标签 ── */
            .mix-float-tag {
                position:absolute;padding:8px 20px;border-radius:20px;
                font-size:18px;font-weight:bold;z-index:60;pointer-events:none;
                animation:mixFloatUp 1.2s forwards;
            }
            @keyframes mixFloatUp { 0%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-30px)} }
            .mix-float-tag.ok { background:#dcfce7;color:#166534; }
            .mix-float-tag.nope { background:#fee2e2;color:#991b1b; }

            /* ── 阶段切换横幅 ── */
            .mix-banner {
                position:absolute;inset:0;display:none;align-items:center;justify-content:center;
                background:rgba(239,246,255,0.92);z-index:80;backdrop-filter:blur(6px);
            }
            .mix-banner.show { display:flex; }
            .mix-banner-inner {
                text-align:center;animation:mixPop 0.5s ease-out;
            }
            .mix-banner-inner h2 { font-size:42px;color:#1e40af;margin:0 0 12px; }
            .mix-banner-inner p { font-size:22px;color:#2563eb; }

            /* ── 通用动画 ── */
            @keyframes mixPop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
            @keyframes mixShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

            .mix-shake { animation:mixShake 0.4s ease-out; }
        `;
    }

    /* ================================================================
     *  渲染
     * ================================================================ */
    function renderLayout() {
        state.container.innerHTML = `
            <div class="mix-wrap">
                <!-- 阶段横幅 -->
                <div class="mix-banner" id="mix-banner">
                    <div class="mix-banner-inner" id="mix-banner-inner"></div>
                </div>

                <!-- 引导栏 -->
                <div class="mix-guide">
                    <span class="mix-guide-spr">🧩</span>
                    <span id="mix-guide-text"></span>
                </div>
                <div class="mix-progress" id="mix-progress"></div>

                <!-- Phase 1: 运算顺序 -->
                <div class="mix-phase active" id="mix-phase1">
                    <div class="mix-p1-card">
                        <div class="mix-p1-label">下面的算式，应该先算哪一步？</div>
                        <div class="mix-p1-expr" id="mix-p1-expr"></div>
                        <div class="mix-p1-operators" id="mix-p1-operators"></div>
                        <div class="mix-p1-hint" id="mix-p1-hint"></div>
                    </div>
                </div>

                <!-- Phase 2: 计算结果 -->
                <div class="mix-phase" id="mix-phase2">
                    <div class="mix-p2-card">
                        <div class="mix-p2-label">算出最终结果</div>
                        <div class="mix-p2-expr" id="mix-p2-expr"></div>
                        <div class="mix-p2-input-row">
                            <input class="mix-p2-input" id="mix-p2-input" maxlength="4" inputmode="numeric">
                            <button class="mix-p2-submit" id="mix-p2-submit">确认</button>
                        </div>
                        <div class="mix-p2-hint" id="mix-p2-hint"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ================================================================
     *  Phase 1: 运算顺序
     * ================================================================ */
    function startPhase1() {
        state.phase = 1;
        state.step = 0;
        state.rounds = buildPhase1Rounds();
        H.updateGuide('先算哪一步？点击正确的运算符！🧩', 'mix-guide-text');
        updateProgress();
        showPhase1Round();
    }

    function showPhase1Round() {
        var r = state.rounds[state.step];
        var exprEl = document.getElementById('mix-p1-expr');
        var opsEl = document.getElementById('mix-p1-operators');
        var hintEl = document.getElementById('mix-p1-hint');

        hintEl.textContent = '';

        // 渲染算式文本
        exprEl.textContent = r.expr;

        // 只渲染运算符按钮（过滤掉纯数字部分）
        var opParts = r.parts.filter(function (p) { return p.op; });
        opsEl.innerHTML = opParts.map(function (p, i) {
            return '<button class="mix-p1-op-btn" data-idx="' + i + '">' + p.text.trim() + '</button>';
        }).join('');

        // 将 opParts 的 index 映射回 parts 数组中的位置
        // correctIdx 是 parts 数组中的位置，需要找到对应的 opPart index
        var opMapping = [];
        r.parts.forEach(function (p, i) {
            if (p.op) opMapping.push(i);
        });
        var correctOpIdx = opMapping.indexOf(r.correctIdx);

        // 绑定点击事件
        opsEl.querySelectorAll('.mix-p1-op-btn').forEach(function (btn) {
            btn.onclick = function () {
                if (state.locked) return;
                var chosen = parseInt(btn.dataset.idx);
                handlePhase1Choice(chosen, correctOpIdx, r, btn, opsEl);
            };
        });
    }

    function handlePhase1Choice(chosen, correctIdx, round, btnEl, opsContainer) {
        state.locked = true;
        var allBtns = opsContainer.querySelectorAll('.mix-p1-op-btn');

        if (chosen === correctIdx) {
            btnEl.classList.add('correct');
            showFloatTag(state.container.querySelector('#mix-phase1'), '✅ 正确!', 'ok');

            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(function () {
                    state.locked = false;
                    updateProgress();
                    showPhase1Round();
                }, 800);
            } else {
                // Phase 1 完成，切换到 Phase 2
                setTimeout(showPhaseBanner, 800);
            }
        } else {
            state.mistakes++;
            btnEl.classList.add('wrong');
            showFloatTag(state.container.querySelector('#mix-phase1'), '再想想!', 'nope');

            var hintEl = document.getElementById('mix-p1-hint');
            hintEl.textContent = '💡 ' + round.explanation;

            setTimeout(function () {
                btnEl.classList.remove('wrong');
                state.locked = false;
            }, 800);
        }
    }

    /* ================================================================
     *  阶段切换横幅
     * ================================================================ */
    function showPhaseBanner() {
        var banner = document.getElementById('mix-banner');
        var inner = document.getElementById('mix-banner-inner');
        inner.innerHTML = '<h2>🔢 第二关：计算结果</h2><p>算出混合算式的最终答案！</p>';
        banner.classList.add('show');

        setTimeout(function () {
            banner.classList.remove('show');
            startPhase2();
        }, 1500);
    }

    /* ================================================================
     *  Phase 2: 计算结果
     * ================================================================ */
    function startPhase2() {
        state.phase = 2;
        state.step = 0;
        state.rounds = buildPhase2Rounds();

        document.getElementById('mix-phase1').classList.remove('active');
        document.getElementById('mix-phase2').classList.add('active');

        H.updateGuide('算出结果，输入答案！🧩', 'mix-guide-text');
        updateProgress();
        showPhase2Round();
    }

    function showPhase2Round() {
        var r = state.rounds[state.step];
        var exprEl = document.getElementById('mix-p2-expr');
        var inputEl = document.getElementById('mix-p2-input');
        var hintEl = document.getElementById('mix-p2-hint');

        exprEl.innerHTML = r.expr + ' <span class="mix-p2-eq">= ?</span>';
        hintEl.textContent = '';
        inputEl.value = '';
        inputEl.focus();

        // 重新绑定提交按钮
        var btn = document.getElementById('mix-p2-submit');
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = checkPhase2Answer;

        // Enter 键提交
        inputEl.onkeyup = function (e) {
            if (e.key === 'Enter') checkPhase2Answer();
        };
    }

    function checkPhase2Answer() {
        var r = state.rounds[state.step];
        var inputEl = document.getElementById('mix-p2-input');
        var val = inputEl.value.trim();

        if (!val) return;

        if (parseInt(val) === r.answer) {
            state.locked = true;
            showFloatTag(state.container.querySelector('#mix-phase2'), '✅ 正确!', 'ok');

            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(function () {
                    state.locked = false;
                    updateProgress();
                    showPhase2Round();
                }, 800);
            } else {
                setTimeout(finishGame, 800);
            }
        } else {
            state.mistakes++;
            showFloatTag(state.container.querySelector('#mix-phase2'), '再算算!', 'nope');

            var hintEl = document.getElementById('mix-p2-hint');
            hintEl.textContent = '💡 ' + r.hint;

            inputEl.value = '';
            inputEl.classList.add('mix-shake');
            setTimeout(function () {
                inputEl.classList.remove('mix-shake');
            }, 500);
        }
    }

    /* ================================================================
     *  结算
     * ================================================================ */
    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        var subtitle = state.mistakes === 0
            ? '运算顺序全对，太厉害了！'
            : state.mistakes <= 2
                ? '掌握得不错，继续加油！'
                : '多练习混合运算的顺序吧！';
        H.showSettlement(
            state.container,
            state.levelData.reward || 25,
            state.levelData,
            state.mistakes,
            subtitle,
            'lvl_2_d_6'
        );
    }

    /* ================================================================
     *  公共 UI
     * ================================================================ */
    function updateProgress() {
        var el = document.getElementById('mix-progress');
        if (!el) return;
        var phaseLabel = state.phase === 1 ? '运算顺序' : '计算结果';
        el.textContent = phaseLabel + '  ' + (state.step + 1) + ' / ' + state.rounds.length;
    }

    function showFloatTag(parent, text, type) {
        if (!parent) return;
        var tag = document.createElement('div');
        tag.className = 'mix-float-tag ' + type;
        tag.textContent = text;
        tag.style.left = '50%';
        tag.style.top = '50%';
        tag.style.transform = 'translate(-50%,-50%)';
        parent.appendChild(tag);
        setTimeout(function () { tag.remove(); }, 1300);
    }

    /* ================================================================
     *  主模块
     * ================================================================ */
    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25 };
            if (!state.container) return;

            state.phase = 1;
            state.step = 0;
            state.mistakes = 0;
            state.isFinished = false;
            state.locked = false;

            H.injectStyles(STYLE_ID, buildCSS());
            renderLayout();
            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
