/**
 * 四年级上册 第六单元：除数是两位数的除法
 * 路径: src/games/grade4/g4_u6_divide_2digit.js
 *
 * 玩法："试商闯关"
 *   Phase 1 "口算热身": 简单的除法口算。4轮。
 *   Phase 2 "试商练习": 三位数除以两位数（含试商）。4轮。
 *   Phase 3 "验算与余数": 带余数除法与验算。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u6-divide-2digit-styles';
    const NEXT_LEVEL = 'lvl_4_7_1';

    /* ── Phase 1: 口算热身 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var b = H.randInt(2, 9);
            var q = H.randInt(2, 12);
            var a = b * q;
            qs.push({
                text: a + ' ÷ ' + b + ' = ？',
                answer: String(q),
                choices: genChoices(q, 1, 20)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 试商练习 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var divisor = H.randInt(12, 30);
            var quotient = H.randInt(5, 25);
            var dividend = divisor * quotient;
            if (dividend > 9999) dividend = divisor * H.randInt(5, 15);
            qs.push({
                text: dividend + ' ÷ ' + divisor + ' = ？',
                answer: String(quotient),
                choices: genChoices(quotient, 1, 40)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 带余数除法 ── */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var divisor = H.randInt(11, 29);
            var quotient = H.randInt(3, 20);
            var remainder = H.randInt(1, divisor - 1);
            var dividend = divisor * quotient + remainder;
            if (dividend > 9999) {
                divisor = H.randInt(15, 25);
                quotient = H.randInt(3, 15);
                remainder = H.randInt(1, divisor - 1);
                dividend = divisor * quotient + remainder;
            }
            qs.push({
                text: dividend + ' ÷ ' + divisor + ' = ？·····' + remainder + '，商是（    ）',
                answer: String(quotient),
                choices: genChoices(quotient, 1, 30)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function genChoices(correct, minOff, maxOff) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-3, 3);
            if (off === 0) off = 1;
            var v = correct + off;
            if (v >= minOff && v !== correct) set.add(String(v));
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
                '<div class="d2d-wrap">' +
                    '<div class="d2d-header">' +
                        H.guideBarHTML('➗', '试商闯关——除数是两位数的除法！', 'd2d-guide') +
                    '</div>' +
                    '<div class="d2d-body" id="d2d-body"></div>' +
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
                    H.updateGuide('口算过关！进入试商练习！', 'd2d-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('试商越来越准了！来练带余除法！', 'd2d-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('d2d-body');
            var phaseLabels = { 1: '口算热身', 2: '试商练习', 3: '带余除法' };
            var phaseEmojis = { 1: '⚡', 2: '📐', 3: '🔍' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'd2d-guide');

            body.innerHTML =
                '<div class="d2d-card">' +
                    '<div class="d2d-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="d2d-card-text">' + q.text + '</div>' +
                    '<div class="d2d-card-choices" id="d2d-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'd2d-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('商找对了！试商高手！✅', 'd2d-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#d2d-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#d2d-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#d2d-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了除数是两位数的除法！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.d2d-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef9c3 0%,#fef08a 40%,#eab308 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.d2d-header{position:relative;z-index:50;}' +
            '.d2d-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:d2d-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes d2d-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.d2d-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #eab308;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:d2d-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:540px;width:92%;' +
            '}' +
            '@keyframes d2d-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.d2d-card-emoji{font-size:50px;}' +
            '.d2d-card-text{' +
                'font-size:24px;font-weight:bold;color:#854d0e;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
            '}' +
            '.d2d-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
