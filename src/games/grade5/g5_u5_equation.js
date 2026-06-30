/**
 * 五年级上册 第五单元：简易方程
 * 路径: src/games/grade5/g5_u5_equation.js
 *
 * 玩法："方程天平"
 *   Phase 1 "用字母表示数": 理解字母可以表示数。4轮。
 *   Phase 2 "方程的意义": 判断哪些是方程。4轮。
 *   Phase 3 "解方程": 解简单的一步方程。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u5-equation-styles';
    const NEXT_LEVEL = 'lvl_5_6_1';

    /* ── Phase 1: 用字母表示数 ── */
    function buildPhase1() {
        var qs = [];
        var templates = [
            function () {
                var n = H.randInt(2, 15);
                var val = H.randInt(3, 20);
                return {
                    text: '如果 a = ' + val + '，那么 a + ' + n + ' = ?',
                    answer: String(val + n),
                    choices: genNumChoices(val + n),
                    hint: '把a换成' + val + '再计算'
                };
            },
            function () {
                var n = H.randInt(2, 9);
                var val = H.randInt(3, 12);
                return {
                    text: '如果 x = ' + val + '，那么 x × ' + n + ' = ?',
                    answer: String(val * n),
                    choices: genNumChoices(val * n),
                    hint: '把x换成' + val + '再计算'
                };
            },
            function () {
                var val = H.randInt(5, 20);
                return {
                    text: '如果 n = ' + val + '，那么 n - ' + (val - H.randInt(1, val - 1)) + ' = ?',
                    answer: String(H.randInt(1, val)),
                    choices: null,
                    hint: '把n换成具体数字'
                };
            },
            function () {
                var val = H.randInt(3, 10);
                var prod = val * val;
                return {
                    text: '如果 a = ' + val + '，那么 a × a = ?',
                    answer: String(prod),
                    choices: genNumChoices(prod),
                    hint: 'a × a 就是 a 的平方'
                };
            },
            function () {
                var n = H.randInt(5, 20);
                var val = H.randInt(3, 15);
                return {
                    text: '如果 x = ' + val + '，那么 3x + ' + n + ' = ?',
                    answer: String(3 * val + n),
                    choices: genNumChoices(3 * val + n),
                    hint: '3x 表示 3 乘以 x'
                };
            },
            function () {
                var val = H.randInt(5, 15);
                var b = H.randInt(1, val - 1);
                return {
                    text: '如果 m = ' + val + '，那么 m - ' + b + ' = ?',
                    answer: String(val - b),
                    choices: genNumChoices(val - b),
                    hint: '把m换成' + val + '再减'
                };
            }
        ];

        var chosen = H.shuffle(templates).slice(0, 4);
        chosen.forEach(function (fn) {
            var q = fn();
            // 重新生成choices确保不为null
            if (!q.choices) q.choices = genNumChoices(parseInt(q.answer));
            qs.push(q);
        });
        return qs;
    }

    function genNumChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var off = H.randInt(1, 10);
            if (H.randInt(0, 1) === 0) off = -off;
            var v = correct + off;
            if (v >= 0) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 方程的意义 ── */
    function buildPhase2() {
        var allItems = [
            { text: '3 + x = 10', isEquation: true },
            { text: '2 × 5 = 10', isEquation: false },
            { text: 'x - 7 = 3', isEquation: true },
            { text: 'a + b', isEquation: false },
            { text: '4y = 20', isEquation: true },
            { text: '12 ÷ 3', isEquation: false },
            { text: 'x + 8 = 15', isEquation: true },
            { text: '5 × 6 = 30', isEquation: false },
            { text: 'n - 2 = 5', isEquation: true },
            { text: 'm + 1', isEquation: false },
            { text: '7a = 42', isEquation: true },
            { text: '9 + 3', isEquation: false }
        ];

        var pool = H.shuffle(allItems);
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var item = pool[i];
            qs.push({
                text: '下面哪个是方程？\n' + item.text,
                answer: item.isEquation ? '是方程' : '不是方程',
                choices: H.shuffle(['是方程', '不是方程']),
                hint: '方程必须含有未知数，且是等式'
            });
        }

        // 重新构建：每题给出多个表达式，选出方程
        var qs2 = [];
        var used = new Set();
        for (var i = 0; i < 4; i++) {
            var eqItems = H.shuffle(allItems.filter(function (it) { return it.isEquation; }));
            var nonEqItems = H.shuffle(allItems.filter(function (it) { return !it.isEquation; }));
            var correctItem = eqItems[i % eqItems.length];
            var decoy1 = nonEqItems[i % nonEqItems.length];
            var decoy2 = nonEqItems[(i + 1) % nonEqItems.length];

            qs2.push({
                text: '下面哪个是方程？',
                displayItems: [correctItem.text, decoy1.text, decoy2.text],
                answer: correctItem.text,
                choices: H.shuffle([correctItem.text, decoy1.text, decoy2.text]),
                hint: '方程 = 有未知数的等式（含有=号且有字母）'
            });
        }
        return qs2;
    }

    /* ── Phase 3: 解方程 ── */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var type = H.randInt(0, 3);
            var x, a, b, eqText, ans;
            switch (type) {
                case 0: // x + b = c
                    b = H.randInt(3, 25);
                    x = H.randInt(1, 20);
                    a = x + b;
                    eqText = 'x + ' + b + ' = ' + a;
                    ans = String(x);
                    break;
                case 1: // x - b = c
                    b = H.randInt(2, 15);
                    x = H.randInt(b + 1, 30);
                    a = x - b;
                    eqText = 'x - ' + b + ' = ' + a;
                    ans = String(x);
                    break;
                case 2: // ax = b
                    a = H.randInt(2, 9);
                    x = H.randInt(2, 12);
                    b = a * x;
                    eqText = a + 'x = ' + b;
                    ans = String(x);
                    break;
                case 3: // x ÷ a = b
                    a = H.randInt(2, 6);
                    b = H.randInt(2, 10);
                    x = a * b;
                    eqText = 'x ÷ ' + a + ' = ' + b;
                    ans = String(x);
                    break;
            }
            qs.push({
                text: '解方程：' + eqText + '，x = ?',
                answer: ans,
                choices: genNumChoices(parseInt(ans)),
                hint: '用天平平衡的原理来思考'
            });
        }
        return H.shuffle(qs).slice(0, 4);
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
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="eqn-wrap">' +
                    '<div class="eqn-header">' +
                        H.guideBarHTML('⚖️', '方程天平——用字母表示数！', 'eqn-guide') +
                    '</div>' +
                    '<div class="eqn-body" id="eqn-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildPhase1();
            this.nextQuestion();
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('字母表示数没问题！来认识方程！', 'eqn-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：解方程！', 'eqn-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('eqn-body');
            var phaseLabels = { 1: '用字母表示数', 2: '方程的意义', 3: '解方程' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'eqn-guide');

            var phaseEmoji = state.phase === 1 ? '🔤' : state.phase === 2 ? '⚖️' : '🧩';

            body.innerHTML =
                '<div class="eqn-card">' +
                    '<div class="eqn-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="eqn-card-num">' + q.text + '</div>' +
                    '<div class="eqn-card-hint">' + q.hint + '</div>' +
                    '<div class="eqn-card-choices" id="eqn-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'eqn-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！方程小达人！✅', 'eqn-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#eqn-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#eqn-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#eqn-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) {
                                    el2.style.background = '#10b981';
                                    el2.style.borderColor = '#10b981';
                                    el2.style.color = 'white';
                                }
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
                '你掌握了用字母表示数和解方程！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.eqn-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0e7ff 0%,#a5b4fc 40%,#6366f1 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.eqn-header{position:relative;z-index:50;}' +
            '.eqn-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:eqn-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes eqn-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.eqn-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #6366f1;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:eqn-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes eqn-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.eqn-card-emoji{font-size:50px;}' +
            '.eqn-card-num{' +
                'font-size:28px;font-weight:bold;color:#3730a3;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#eef2ff;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #a5b4fc;' +
            '}' +
            '.eqn-card-hint{' +
                'font-size:16px;color:#4f46e5;font-style:italic;' +
            '}' +
            '.eqn-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
