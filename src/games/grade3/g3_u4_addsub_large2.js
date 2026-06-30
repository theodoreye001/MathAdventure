/**
 * 三年级上册 第四单元：万以内的加法和减法（二）笔算
 * 路径: src/games/grade3/g3_u4_addsub_large2.js
 *
 * 玩法："竖式闯关"
 *   Phase 1 "填空补全": 三位数加减竖式中缺少某一位数字，选择正确数字填入。4轮。
 *   Phase 2 "完整笔算": 给出三位数加减法竖式题目，选择正确结果。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u4-addsub-large2-styles';

    /* ── Phase 1: 竖式填空 ── */
    function buildPhase1() {
        var qs = [];
        /* 加法竖式填空 */
        for (var i = 0; i < 4; i++) {
            var a = H.randInt(100, 499);
            var b = H.randInt(100, 999 - a);
            var sum = a + b;
            var aStr = String(a);
            var bStr = String(b);
            var sStr = String(sum);
            /* 随机隐藏某一位 */
            var pos = H.randInt(0, 2); // 0=百位,1=十位,2=个位
            var hidden = pos === 0 ? aStr[0] : pos === 1 ? aStr[1] : aStr[2];
            var displayA = aStr.split('');
            displayA[pos] = '?';
            qs.push({
                type: 'add',
                a: displayA.join(''),
                b: bStr,
                answer: hidden,
                hint: '加数 a 的' + ['百', '十', '个'][pos] + '位是多少？',
                choices: generateDigitChoices(parseInt(hidden))
            });
        }
        /* 减法竖式填空 */
        for (var j = 0; j < 4; j++) {
            var c = H.randInt(300, 899);
            var d = H.randInt(100, c - 10);
            var diff = c - d;
            var cStr = String(c);
            var dStr = String(d);
            var diffStr = String(diff);
            var pos2 = H.randInt(0, 2);
            var hidden2 = pos2 === 0 ? cStr[0] : pos2 === 1 ? cStr[1] : cStr[2];
            var displayC = cStr.split('');
            displayC[pos2] = '?';
            qs.push({
                type: 'sub',
                a: displayC.join(''),
                b: dStr,
                answer: hidden2,
                hint: '被减数的' + ['百', '十', '个'][pos2] + '位是多少？',
                choices: generateDigitChoices(parseInt(hidden2))
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 完整笔算 ── */
    function buildPhase2() {
        var qs = [];
        var ops = ['+', '-'];
        for (var i = 0; i < 8; i++) {
            var op = ops[i % 2];
            var a, b, answer;
            if (op === '+') {
                a = H.randInt(100, 699);
                b = H.randInt(100, 999 - a);
                answer = a + b;
            } else {
                a = H.randInt(300, 999);
                b = H.randInt(100, a - 1);
                answer = a - b;
            }
            qs.push({
                text: a + ' ' + op + ' ' + b + ' = ？',
                answer: String(answer),
                choices: generateChoices(answer)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function generateDigitChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var v = H.randInt(0, 9);
            set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    function generateChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-3, 3);
            if (off === 0) off = 1;
            set.add(String(correct + off));
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
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="as2-wrap">' +
                    '<div class="as2-header">' +
                        H.guideBarHTML('✏️', '竖式闯关——学会列竖式计算！', 'as2-guide') +
                    '</div>' +
                    '<div class="as2-body" id="as2-body"></div>' +
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
                    H.updateGuide('填空没问题！现在来完整计算吧！', 'as2-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var body = document.getElementById('as2-body');

            if (state.phase === 1) {
                this.renderFillBlank();
            } else {
                this.renderFullCalc();
            }
        },

        /* Phase 1: 竖式填空 */
        renderFillBlank: function () {
            var q = state.questions[state.qIndex];
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · 填空补全', 'as2-guide');

            var opSymbol = q.type === 'add' ? '+' : '-';
            var body = document.getElementById('as2-body');

            body.innerHTML =
                '<div class="as2-card">' +
                    '<div class="as2-card-emoji">📝</div>' +
                    '<div class="as2-card-hint">' + q.hint + '</div>' +
                    '<div class="as2-vertical">' +
                        '<div class="as2-vrow"><span class="as2-vop">' + opSymbol + '</span><span class="as2-vnum">' + q.a + '</span></div>' +
                        '<div class="as2-vrow"><span class="as2-vop"></span><span class="as2-vnum">' + q.b + '</span></div>' +
                        '<div class="as2-vline"></div>' +
                    '</div>' +
                    '<div class="as2-card-choices" id="as2-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'as2-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('太棒了！填对了！✅', 'as2-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案是 ' + q.answer,
                            document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + ci + '"]');
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

        /* Phase 2: 完整计算 */
        renderFullCalc: function () {
            var q = state.questions[state.qIndex];
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · 完整笔算', 'as2-guide');

            var body = document.getElementById('as2-body');

            body.innerHTML =
                '<div class="as2-card">' +
                    '<div class="as2-card-emoji">🧮</div>' +
                    '<div class="as2-card-text">' + q.text + '</div>' +
                    '<div class="as2-card-choices" id="as2-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'as2-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('计算正确！你的竖式很棒！✅', 'as2-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案是 ' + q.answer,
                            document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#as2-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了三位数加减法的竖式计算！',
                'lvl_3_5_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.as2-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fce7f3 0%,#fbcfe8 40%,#f9a8d4 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.as2-header{position:relative;z-index:50;}' +
            '.as2-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:as2-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes as2-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.as2-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #ec4899;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:as2-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes as2-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.as2-card-emoji{font-size:48px;}' +
            '.as2-card-hint{font-size:18px;color:#9d174d;font-weight:bold;}' +
            '.as2-card-text{' +
                'font-size:26px;font-weight:bold;color:#9d174d;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
            '}' +

            /* 竖式样式 */
            '.as2-vertical{' +
                'background:#fdf2f8;border:2px solid #f9a8d4;border-radius:16px;' +
                'padding:16px 24px;display:flex;flex-direction:column;align-items:flex-end;gap:4px;' +
                'font-family:"Courier New",monospace;font-size:28px;font-weight:bold;color:#9d174d;' +
            '}' +
            '.as2-vrow{display:flex;align-items:center;gap:8px;}' +
            '.as2-vop{width:24px;text-align:center;}' +
            '.as2-vnum{letter-spacing:4px;min-width:100px;text-align:right;}' +
            '.as2-vline{width:100%;height:3px;background:#9d174d;border-radius:2px;margin-top:4px;}' +

            '.as2-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
