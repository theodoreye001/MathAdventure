/**
 * 四年级上册 第四单元：三位数乘两位数
 * 路径: src/games/grade4/g4_u4_multiply_3x2.js
 *
 * 玩法："竖式挑战"
 *   Phase 1 "口算热身": 整百数 × 整十数。4轮。
 *   Phase 2 "竖式计算": 三位数 × 两位数（含进位）。4轮。
 *   Phase 3 "实际应用": 乘法应用题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u4-multiply-3x2-styles';
    const NEXT_LEVEL = 'lvl_4_5_1';

    /* ── Phase 1: 口算热身 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var a = H.randInt(1, 9) * 100;
            var b = H.randInt(1, 9) * 10;
            var answer = a * b;
            qs.push({
                text: a + ' × ' + b + ' = ？',
                answer: String(answer),
                choices: genChoices(answer, 500)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 竖式计算 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var a = H.randInt(100, 499);
            var b = H.randInt(11, 29);
            // 避免太整齐的数
            if (a % 100 === 0) a += H.randInt(23, 67);
            var answer = a * b;
            qs.push({
                text: a + ' × ' + b + ' = ？',
                answer: String(answer),
                choices: genChoices(answer, 100)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function genChoices(correct, spread) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-5, 5) * spread;
            if (off === 0) off = spread;
            var v = correct + off;
            if (v > 0 && v !== correct) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 实际应用 ── */
    function buildPhase3() {
        var qs = [
            function () {
                var price = H.randInt(12, 25);
                var num = H.randInt(15, 30);
                return {
                    text: '一本书 ' + price + ' 元，买 ' + num + ' 本需要多少元？',
                    answer: String(price * num),
                    choices: genChoices(price * num, 50)
                };
            },
            function () {
                var speed = H.randInt(80, 120);
                var time = H.randInt(12, 24);
                return {
                    text: '火车每小时行 ' + speed + ' 千米，' + time + ' 小时行多少千米？',
                    answer: String(speed * time),
                    choices: genChoices(speed * time, 100)
                };
            },
            function () {
                var rows = H.randInt(15, 25);
                var cols = H.randInt(12, 20);
                return {
                    text: '一个电影院有 ' + rows + ' 排座位，每排 ' + cols + ' 个，共多少个座位？',
                    answer: String(rows * cols),
                    choices: genChoices(rows * cols, 50)
                };
            },
            function () {
                var trees = H.randInt(18, 30);
                var fruits = H.randInt(100, 200);
                return {
                    text: '果园有 ' + trees + ' 棵苹果树，平均每棵产 ' + fruits + ' 千克，共产多少千克？',
                    answer: String(trees * fruits),
                    choices: genChoices(trees * fruits, 200)
                };
            },
            function () {
                var pages = H.randInt(120, 200);
                var days = H.randInt(11, 19);
                return {
                    text: '小明每天读 ' + pages + ' 页书，' + days + ' 天读多少页？',
                    answer: String(pages * days),
                    choices: genChoices(pages * days, 100)
                };
            },
            function () {
                var classNum = H.randInt(20, 30);
                var studentNum = H.randInt(40, 55);
                return {
                    text: '学校有 ' + classNum + ' 个班，每班 ' + studentNum + ' 人，共多少人？',
                    answer: String(classNum * studentNum),
                    choices: genChoices(classNum * studentNum, 50)
                };
            }
        ];
        return H.shuffle(qs).slice(0, 4).map(function (fn) { return fn(); });
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
                '<div class="m32-wrap">' +
                    '<div class="m32-header">' +
                        H.guideBarHTML('✖️', '竖式挑战——三位数乘两位数！', 'm32-guide') +
                    '</div>' +
                    '<div class="m32-body" id="m32-body"></div>' +
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
                    H.updateGuide('口算热身完成！进入竖式计算！', 'm32-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('竖式算得棒！来解决应用题！', 'm32-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('m32-body');
            var phaseLabels = { 1: '口算热身', 2: '竖式计算', 3: '实际应用' };
            var phaseEmojis = { 1: '⚡', 2: '📐', 3: '📝' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'm32-guide');

            body.innerHTML =
                '<div class="m32-card">' +
                    '<div class="m32-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="m32-card-text">' + q.text + '</div>' +
                    '<div class="m32-card-choices" id="m32-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'm32-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('算对了！乘法高手！✅', 'm32-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#m32-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#m32-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#m32-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了三位数乘两位数的竖式计算！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.m32-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#dbeafe 0%,#93c5fd 40%,#3b82f6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.m32-header{position:relative;z-index:50;}' +
            '.m32-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:m32-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes m32-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.m32-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #3b82f6;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:m32-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:540px;width:92%;' +
            '}' +
            '@keyframes m32-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.m32-card-emoji{font-size:50px;}' +
            '.m32-card-text{' +
                'font-size:24px;font-weight:bold;color:#1e40af;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
            '}' +
            '.m32-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
