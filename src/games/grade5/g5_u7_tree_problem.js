/**
 * 五年级上册 第七单元：植树问题
 * 路径: src/games/grade5/g5_u7_tree_problem.js
 *
 * 玩法："植树策略"
 *   Phase 1 "两端都种": 非封闭路线，两端都种树。4轮。
 *   Phase 2 "一端种/两端不种": 非封闭路线的变体。4轮。
 *   Phase 3 "封闭路线": 在圆形/方形等封闭路线上植树。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u7-tree-problem-styles';
    const NEXT_LEVEL = null;

    /** 生成植树问题选项 */
    function genTreeChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var off = H.randInt(1, 5);
            if (H.randInt(0, 1) === 0) off = -off;
            var v = correct + off;
            if (v >= 1) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 两端都种 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var gap = H.randInt(2, 10); // 间隔米数
            var totalDist = gap * H.randInt(3, 10); // 总距离（保证整除）
            var trees = totalDist / gap + 1; // 两端都种: 棵数 = 段数 + 1
            qs.push({
                text: '一条路长' + totalDist + '米，每隔' + gap + '米种一棵树（两端都种），需要多少棵树？',
                answer: String(trees),
                choices: genTreeChoices(trees),
                hint: '两端都种：棵数 = 总长 ÷ 间隔 + 1'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 一端种 / 两端不种 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var gap = H.randInt(2, 8);
            var segments = H.randInt(3, 10);
            var totalDist = gap * segments;
            var isOneEnd = H.randInt(0, 1) === 0;

            if (isOneEnd) {
                // 一端种：棵数 = 段数
                var trees = segments;
                qs.push({
                    text: '一条路长' + totalDist + '米，每隔' + gap + '米种一棵树（只有一端种），需要多少棵树？',
                    answer: String(trees),
                    choices: genTreeChoices(trees),
                    hint: '只一端种：棵数 = 总长 ÷ 间隔'
                });
            } else {
                // 两端都不种：棵数 = 段数 - 1
                var trees2 = segments - 1;
                if (trees2 < 1) trees2 = 1;
                qs.push({
                    text: '一条路长' + totalDist + '米，每隔' + gap + '米种一棵树（两端都不种），需要多少棵树？',
                    answer: String(trees2),
                    choices: genTreeChoices(trees2),
                    hint: '两端不种：棵数 = 总长 ÷ 间隔 - 1'
                });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 封闭路线 ── */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var isRound = H.randInt(0, 1) === 0;
            var gap = H.randInt(2, 8);
            var trees, shapeText;

            if (isRound) {
                // 圆形：棵数 = 周长 ÷ 间隔
                var circumference = gap * H.randInt(4, 12);
                trees = circumference / gap;
                shapeText = '在周长' + circumference + '米的圆形花坛周围';
            } else {
                // 正方形：棵数 = 周长 ÷ 间隔
                var side = gap * H.randInt(2, 6);
                var perimeter = side * 4;
                trees = perimeter / gap;
                shapeText = '在边长' + side + '米的正方形广场四周';
            }

            qs.push({
                text: shapeText + '，每隔' + gap + '米种一棵树，需要多少棵树？',
                answer: String(trees),
                choices: genTreeChoices(trees),
                hint: '封闭路线：棵数 = 周长 ÷ 间隔'
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
                '<div class="tre-wrap">' +
                    '<div class="tre-header">' +
                        H.guideBarHTML('🌳', '植树策略——聪明的植树规划师！', 'tre-guide') +
                    '</div>' +
                    '<div class="tre-body" id="tre-body"></div>' +
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
                    H.updateGuide('两端都种没问题！来试试只种一端！', 'tre-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：封闭路线植树！', 'tre-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('tre-body');
            var phaseLabels = { 1: '两端都种', 2: '一端种/两端不种', 3: '封闭路线' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'tre-guide');

            var phaseEmoji = state.phase === 1 ? '🌱' : state.phase === 2 ? '🌿' : '🏞️';

            body.innerHTML =
                '<div class="tre-card">' +
                    '<div class="tre-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="tre-card-num">' + q.text + '</div>' +
                    '<div class="tre-card-hint">' + q.hint + '</div>' +
                    '<div class="tre-card-choices" id="tre-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'tre-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！植树小策略师！✅', 'tre-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#tre-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#tre-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#tre-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了各种植树问题的解题策略！太棒了！🎉',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.tre-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#d9f99d 0%,#84cc16 40%,#65a30d 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.tre-header{position:relative;z-index:50;}' +
            '.tre-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:tre-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes tre-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.tre-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #65a30d;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:tre-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes tre-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.tre-card-emoji{font-size:50px;}' +
            '.tre-card-num{' +
                'font-size:26px;font-weight:bold;color:#3f6212;' +
                'text-align:center;line-height:1.6;' +
                'background:#f7fee7;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #bef264;' +
            '}' +
            '.tre-card-hint{' +
                'font-size:16px;color:#4d7c0f;font-style:italic;' +
            '}' +
            '.tre-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
