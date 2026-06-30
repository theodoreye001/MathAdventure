/**
 * 三年级上册 第二单元：万以内的加法和减法（一）
 * 路径: src/games/grade3/g3_u2_addsub_large.js
 *
 * 玩法："口算闪电战"
 *   Phase 1 "两位数加减": 两位数加减两位数口算。4题。
 *   Phase 2 "几百几十加减": 几百几十 ± 几百几十。4题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u2-addsub-large-styles';

    /* ── Phase 1: 两位数加减 ── */
    function buildPhase1() {
        var qs = [];
        var ops = ['+', '-'];
        for (var i = 0; i < 8; i++) {
            var op = ops[i % 2];
            var a, b;
            if (op === '+') {
                a = H.randInt(20, 85);
                b = H.randInt(10, 99 - a);
                if (a + b > 99) b = 99 - a;
                if (b < 10) b = 10;
            } else {
                a = H.randInt(30, 95);
                b = H.randInt(10, a - 5);
            }
            var answer = op === '+' ? a + b : a - b;
            qs.push({
                text: a + ' ' + op + ' ' + b + ' = ？',
                answer: String(answer)
            });
        }
        /* 为每题生成4个选项 */
        qs.forEach(function (q) {
            q.choices = generateChoices(parseInt(q.answer));
        });
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 几百几十加减 ── */
    function buildPhase2() {
        var qs = [];
        var ops = ['+', '-'];
        for (var i = 0; i < 8; i++) {
            var op = ops[i % 2];
            var a, b;
            if (op === '+') {
                a = H.randInt(2, 7) * 100 + H.randInt(1, 8) * 10;
                b = H.randInt(1, 5) * 100 + H.randInt(1, 8) * 10;
                if (a + b > 990) b = 900 - a;
                if (b < 100) b = 100;
            } else {
                a = H.randInt(3, 9) * 100 + H.randInt(1, 8) * 10;
                b = H.randInt(1, Math.floor(a / 100) - 1) * 100 + H.randInt(1, 8) * 10;
                if (b >= a) b = a - 100;
                if (b < 100) b = 100;
            }
            var answer = op === '+' ? a + b : a - b;
            qs.push({
                text: a + ' ' + op + ' ' + b + ' = ？',
                answer: String(answer)
            });
        }
        qs.forEach(function (q) {
            q.choices = generateChoices(parseInt(q.answer));
        });
        return H.shuffle(qs).slice(0, 4);
    }

    /* 生成4个选项（含正确答案） */
    function generateChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-3, 3);
            if (off === 0) off = H.randInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
            var v = correct + off * 10;
            if (v < 0) v = correct + Math.abs(off) * 10;
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

    /* ── 主模块 ── */
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
                '<div class="asl-wrap">' +
                    '<div class="asl-header">' +
                        H.guideBarHTML('⚡', '口算闪电战——练好加减法口算！', 'asl-guide') +
                    '</div>' +
                    '<div class="asl-body" id="asl-body"></div>' +
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
                    H.updateGuide('两位数口算过关！挑战几百几十的加减！', 'asl-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('asl-body');
            var phaseLabel = state.phase === 1 ? '两位数加减' : '几百几十加减';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'asl-guide');

            body.innerHTML =
                '<div class="asl-card">' +
                    '<div class="asl-card-emoji">' + (state.phase === 1 ? '⚡' : '🔢') + '</div>' +
                    '<div class="asl-card-text">' + q.text + '</div>' +
                    '<div class="asl-card-choices" id="asl-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'asl-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('算得又快又对！✅', 'asl-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#asl-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '不对哦，正确答案是 ' + q.answer,
                            document.querySelector('#asl-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#asl-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了两位数和几百几十的加减口算！',
                'lvl_3_3_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.asl-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#dbeafe 0%,#bfdbfe 40%,#93c5fd 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.asl-header{position:relative;z-index:50;}' +
            '.asl-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:asl-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes asl-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.asl-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #3b82f6;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:asl-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes asl-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.asl-card-emoji{font-size:52px;}' +
            '.asl-card-text{' +
                'font-size:28px;font-weight:bold;color:#1e40af;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
            '}' +
            '.asl-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
