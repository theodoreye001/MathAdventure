/**
 * 四年级下册 第一单元：四则运算
 * 路径: src/games/grade4/g4_d_u1_four_ops.js
 *
 * 玩法："运算顺序迷宫"
 *   Phase 1 "先算什么": 判断运算顺序，选择先算的部分。4轮。
 *   Phase 2 "一步计算": 含括号的混合运算选择题。4轮。
 *   Phase 3 "两步计算": 含括号的两步混合运算，算出结果。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u1-four-ops-styles';
    const NEXT_LEVEL = 'lvl_4_d_2';

    /* ── 题目生成 ── */

    /** Phase 1: 判断运算顺序 */
    function buildPhase1() {
        var qs = [];
        var templates = [
            { expr: '24 + 16 × 3', desc: '先算 16 × 3', wrong: ['先算 24 + 16', '从左到右依次算', '先算 24 × 3'] },
            { expr: '72 ÷ 8 + 4', desc: '先算 72 ÷ 8', wrong: ['先算 8 + 4', '先算 72 + 4', '从右到左算'] },
            { expr: '100 - 36 ÷ 6', desc: '先算 36 ÷ 6', wrong: ['先算 100 - 36', '先算 100 ÷ 6', '同时算'] },
            { expr: '5 × (12 - 8)', desc: '先算 12 - 8', wrong: ['先算 5 × 12', '先算 5 × 8', '先算 5 - 8'] },
            { expr: '(15 + 25) ÷ 8', desc: '先算 15 + 25', wrong: ['先算 25 ÷ 8', '先算 15 ÷ 8', '从右到左算'] },
            { expr: '48 ÷ (2 × 4)', desc: '先算 2 × 4', wrong: ['先算 48 ÷ 2', '先算 48 × 4', '从左到右算'] },
            { expr: '30 + 70 ÷ 5', desc: '先算 70 ÷ 5', wrong: ['先算 30 + 70', '先算 30 ÷ 5', '同时算'] },
            { expr: '6 × (9 - 3)', desc: '先算 9 - 3', wrong: ['先算 6 × 9', '先算 6 × 3', '从左到右算'] },
            { expr: '120 - 8 × 10', desc: '先算 8 × 10', wrong: ['先算 120 - 8', '先算 120 × 10', '同时算'] },
            { expr: '(45 - 15) × 3', desc: '先算 45 - 15', wrong: ['先算 15 × 3', '先算 45 × 3', '从右到左算'] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                expr: t.expr,
                answer: t.desc,
                choices: H.shuffle([t.desc].concat(t.wrong)),
                hint: '按运算顺序规则，应该先算哪一步？'
            });
        }
        return qs;
    }

    /** Phase 2: 一步计算（选择正确结果） */
    function buildPhase2() {
        var qs = [];
        var problems = [];
        for (var i = 0; i < 8; i++) {
            var a, b, c, expr, ans;
            var type = H.randInt(0, 3);
            if (type === 0) {
                a = H.randInt(10, 50); b = H.randInt(2, 9); c = H.randInt(1, 20);
                expr = a + ' + ' + b + ' × ' + c;
                ans = a + b * c;
            } else if (type === 1) {
                b = H.randInt(2, 8); c = H.randInt(2, 9); a = b * c + H.randInt(1, 30);
                expr = a + ' - ' + b + ' × ' + c;
                ans = a - b * c;
            } else if (type === 2) {
                a = H.randInt(2, 9); b = H.randInt(2, 20); c = H.randInt(1, 50);
                expr = '(' + a + ' + ' + b + ') × ' + c;
                ans = (a + b) * c;
            } else {
                a = H.randInt(3, 12); b = H.randInt(2, 6); c = H.randInt(1, 10);
                expr = a + ' × ' + b + ' + ' + c;
                ans = a * b + c;
            }
            if (ans > 0 && ans < 500 && problems.indexOf(expr) === -1) {
                problems.push(expr);
                var choices = genChoices(ans);
                qs.push({ expr: expr, answer: String(ans), choices: choices, hint: '注意运算顺序，先乘除后加减' });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /** Phase 3: 两步计算 */
    function buildPhase3() {
        var qs = [];
        var used = [];
        for (var i = 0; i < 8; i++) {
            var a, b, c, expr, ans;
            var type = H.randInt(0, 3);
            if (type === 0) {
                a = H.randInt(10, 50); b = H.randInt(2, 8); c = H.randInt(2, 9);
                expr = a + ' ÷ ' + b + ' + ' + c;
                ans = a / b + c;
                if (a % b !== 0) { a = b * H.randInt(2, 10); ans = a / b + c; }
            } else if (type === 1) {
                a = H.randInt(20, 100); b = H.randInt(2, 5); c = H.randInt(10, 50);
                expr = '(' + a + ' - ' + c + ') ÷ ' + b;
                ans = (a - c) / b;
                if ((a - c) % b !== 0) { c = a - b * H.randInt(1, 10); ans = (a - c) / b; }
            } else if (type === 2) {
                a = H.randInt(10, 40); b = H.randInt(2, 6); c = H.randInt(2, 5);
                expr = '(' + a + ' + ' + b + ') × ' + c;
                ans = (a + b) * c;
            } else {
                a = H.randInt(3, 12); b = H.randInt(2, 8); c = H.randInt(1, 15);
                expr = a + ' × (' + b + ' + ' + c + ')';
                ans = a * (b + c);
            }
            if (ans > 0 && ans <= 200 && used.indexOf(expr) === -1) {
                used.push(expr);
                qs.push({ expr: expr, answer: String(ans), choices: genChoices(ans), hint: '先算括号里的，再算括号外的' });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function genChoices(ans) {
        var set = new Set();
        set.add(String(ans));
        while (set.size < 4) {
            var off = H.randInt(-10, 10);
            if (off === 0) off = H.randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
            var v = ans + off;
            if (v > 0 && v !== ans) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
    };

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30 };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = buildPhase1();

            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="fo4-wrap">' +
                    '<div class="fo4-header">' +
                        H.guideBarHTML('🌀', '运算顺序迷宫——掌握运算顺序，闯过迷宫！', 'fo4-guide') +
                    '</div>' +
                    '<div class="fo4-body" id="fo4-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('顺序判断没问题！来算一算吧！', 'fo4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('终极挑战：括号在手，算遍天下！', 'fo4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fo4-body');
            var labels = { 1: '先算什么', 2: '一步计算', 3: '两步计算' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'fo4-guide');

            var phaseEmoji = state.phase === 1 ? '🔍' : state.phase === 2 ? '🧮' : '🎯';

            body.innerHTML =
                '<div class="fo4-card">' +
                    '<div class="fo4-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="fo4-card-expr">' + q.expr + '</div>' +
                    '<div class="fo4-card-hint">' + q.hint + '</div>' +
                    '<div class="fo4-card-choices" id="fo4-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fo4-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！运算顺序小达人！✅', 'fo4-guide');
                        if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        var el = document.querySelector('#fo4-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#fo4-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#fo4-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                            }
                        });
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2000);
                    }
                }
            );
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了四则运算的运算顺序！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.fo4-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0f2fe 0%,#bae6fd 40%,#38bdf8 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.fo4-header{position:relative;z-index:50;}' +
            '.fo4-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:fo4-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes fo4-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.fo4-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #0ea5e9;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:fo4-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes fo4-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fo4-card-emoji{font-size:50px;}' +
            '.fo4-card-expr{' +
                'font-size:32px;font-weight:bold;color:#0369a1;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#e0f2fe;padding:12px 28px;border-radius:16px;border:2px solid #7dd3fc;' +
            '}' +
            '.fo4-card-hint{font-size:16px;color:#0284c7;font-style:italic;}' +
            '.fo4-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
