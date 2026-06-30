/**
 * 三年级上册 第五单元：倍的认识
 * 路径: src/games/grade3/g3_u5_multiply_times.js
 *
 * 玩法："倍数对战"
 *   Phase 1 "几倍": "A是B的几倍" 选择题。4轮。
 *   Phase 2 "几倍是多少": "A的B倍是多少" 选择题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u5-multiply-times-styles';

    /* ── Phase 1: 求倍数 ── */
    function buildPhase1() {
        var qs = [];
        var pairs = [
            [12, 3], [20, 4], [18, 6], [24, 8], [15, 5],
            [32, 8], [36, 9], [21, 7], [45, 9], [28, 7],
            [40, 8], [54, 9], [16, 4], [27, 3], [35, 5]
        ];
        var shuffled = H.shuffle(pairs);
        for (var i = 0; i < 6; i++) {
            var a = shuffled[i][0];
            var b = shuffled[i][1];
            qs.push({
                text: a + ' 是 ' + b + ' 的几倍？',
                answer: String(a / b),
                choices: generateChoices(a / b, 1, 12)
            });
        }
        return qs.slice(0, 4);
    }

    /* ── Phase 2: 求几倍是多少 ── */
    function buildPhase2() {
        var qs = [];
        var data = [
            [5, 3], [4, 7], [6, 8], [3, 9], [7, 6],
            [8, 5], [9, 4], [2, 8], [6, 7], [3, 6]
        ];
        var shuffled = H.shuffle(data);
        for (var i = 0; i < 6; i++) {
            var base = shuffled[i][0];
            var times = shuffled[i][1];
            var answer = base * times;
            qs.push({
                text: base + ' 的 ' + times + ' 倍是多少？',
                answer: String(answer),
                choices: generateChoices(answer, answer - 10, answer + 10)
            });
        }
        return qs.slice(0, 4);
    }

    function generateChoices(correct, min, max) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var v = H.randInt(Math.max(1, min), max);
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
                '<div class="mlt-wrap">' +
                    '<div class="mlt-header">' +
                        H.guideBarHTML('✖️', '倍数对战——理解"倍"的概念！', 'mlt-guide') +
                    '</div>' +
                    '<div class="mlt-body" id="mlt-body"></div>' +
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
                    H.updateGuide('你会求倍数了！现在来算"几倍是多少"！', 'mlt-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('mlt-body');
            var phaseLabel = state.phase === 1 ? '求倍数' : '求几倍';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'mlt-guide');

            /* 用emoji直观展示倍数关系 */
            var emoji = '🟣';
            body.innerHTML =
                '<div class="mlt-card">' +
                    '<div class="mlt-card-emoji">' + (state.phase === 1 ? '🔍' : '✨') + '</div>' +
                    '<div class="mlt-card-text">' + q.text + '</div>' +
                    '<div class="mlt-card-choices" id="mlt-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'mlt-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！你理解了倍数关系！✅', 'mlt-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#mlt-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#mlt-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#mlt-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你理解了"几倍"和"几倍是多少"的概念！',
                'lvl_3_6_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.mlt-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0e7ff 0%,#c7d2fe 40%,#a5b4fc 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.mlt-header{position:relative;z-index:50;}' +
            '.mlt-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:mlt-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes mlt-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.mlt-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #6366f1;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:mlt-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes mlt-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.mlt-card-emoji{font-size:52px;}' +
            '.mlt-card-text{' +
                'font-size:24px;font-weight:bold;color:#3730a3;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.mlt-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
