/**
 * 三年级上册 第六单元：多位数乘一位数
 * 路径: src/games/grade3/g3_u6_multiply_multi.js
 *
 * 玩法："乘法竖式挑战"
 *   Phase 1 "口算热身": 整十/整百数 × 一位数。4轮。
 *   Phase 2 "竖式计算": 2~3位数 × 一位数（有进位）。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u6-multiply-multi-styles';

    /* ── Phase 1: 整十整百口算 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var isHundred = Math.random() < 0.5;
            var base = isHundred ? H.randInt(2, 9) * 100 : H.randInt(2, 9) * 10;
            var single = H.randInt(2, 9);
            var answer = base * single;
            qs.push({
                text: base + ' × ' + single + ' = ？',
                answer: String(answer),
                choices: generateChoices(answer, isHundred)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 竖式计算 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var isThree = Math.random() < 0.4;
            var num = isThree ? H.randInt(100, 499) : H.randInt(10, 99);
            var single = H.randInt(2, 9);
            var answer = num * single;
            qs.push({
                text: num + ' × ' + single + ' = ？',
                answer: String(answer),
                choices: generateChoices(answer, false)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function generateChoices(correct, isHundred) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-3, 3);
            if (off === 0) off = 1;
            var v = correct + off * (isHundred ? 100 : 10);
            if (v <= 0) v = correct + Math.abs(off) * (isHundred ? 100 : 10);
            set.add(String(v));
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
            state.levelData = levelData || { reward: 25 };
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
                '<div class="mmm-wrap">' +
                    '<div class="mmm-header">' +
                        H.guideBarHTML('✖️', '乘法竖式挑战——练好多位数乘一位数！', 'mmm-guide') +
                    '</div>' +
                    '<div class="mmm-body" id="mmm-body"></div>' +
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
                    H.updateGuide('口算过关！挑战有进位的竖式计算！', 'mmm-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('mmm-body');
            var phaseLabel = state.phase === 1 ? '整十整百口算' : '竖式计算';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'mmm-guide');

            body.innerHTML =
                '<div class="mmm-card">' +
                    '<div class="mmm-card-emoji">' + (state.phase === 1 ? '⚡' : '📐') + '</div>' +
                    '<div class="mmm-card-text">' + q.text + '</div>' +
                    '<div class="mmm-card-choices" id="mmm-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'mmm-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('乘法算得又快又准！✅', 'mmm-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#mmm-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#mmm-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#mmm-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                state.levelData.reward || 25,
                state.levelData,
                state.mistakes,
                '你掌握了多位数乘一位数的口算和竖式计算！',
                'lvl_3_7_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.mmm-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fde68a 40%,#fbbf24 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.mmm-header{position:relative;z-index:50;}' +
            '.mmm-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:mmm-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes mmm-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.mmm-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:mmm-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes mmm-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.mmm-card-emoji{font-size:52px;}' +
            '.mmm-card-text{' +
                'font-size:28px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
            '}' +
            '.mmm-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
