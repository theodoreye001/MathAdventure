/**
 * 五年级上册 第二单元：位置（数对）
 * 路径: src/games/grade5/g5_u2_position.js
 *
 * 玩法："坐标寻宝"
 *   Phase 1 "读数对": 根据数对在网格上找位置。4轮。
 *   Phase 2 "写数对": 给出位置，写出数对。4轮。
 *   Phase 3 "移动数对": 根据移动规则找出新的数对。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u2-position-styles';
    const NEXT_LEVEL = 'lvl_5_3_1';

    /** 列字母 */
    var COL_LETTERS = 'ABCDEFGHIJ';

    /** 生成随机数对 {col, row}，1-indexed */
    function randPos(maxCol, maxRow) {
        return { col: H.randInt(1, maxCol), row: H.randInt(1, maxRow) };
    }

    /** 格式化数对为字符串 */
    function fmtPair(col, row) {
        return '(' + col + ',' + row + ')';
    }

    /** 格式化为行列中文描述 */
    function fmtDesc(col, row) {
        return '第' + col + '列第' + row + '行';
    }

    /** 生成数对选择项 */
    function genPairChoices(correctCol, correctRow, maxCol, maxRow) {
        var correct = fmtPair(correctCol, correctRow);
        var set = new Set();
        set.add(correct);
        while (set.size < 4) {
            var c = H.randInt(1, maxCol);
            var r = H.randInt(1, maxRow);
            if (c !== correctCol || r !== correctRow) {
                set.add(fmtPair(c, r));
            }
        }
        return H.shuffle(Array.from(set));
    }

    /** 生成位置描述选项 */
    function genDescChoices(correctCol, correctRow) {
        var correct = fmtDesc(correctCol, correctRow);
        var set = new Set();
        set.add(correct);
        var maxC = 8, maxR = 6;
        while (set.size < 4) {
            var c = H.randInt(1, maxC);
            var r = H.randInt(1, maxR);
            var d = fmtDesc(c, r);
            if (d !== correct) set.add(d);
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 读数对 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var p = randPos(8, 6);
            qs.push({
                text: '数对 ' + fmtPair(p.col, p.row) + ' 表示的位置是？',
                answer: fmtDesc(p.col, p.row),
                choices: genDescChoices(p.col, p.row),
                hint: '数对 (列,行) 先列后行'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 写数对 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var p = randPos(8, 6);
            qs.push({
                text: fmtDesc(p.col, p.row) + ' 用数对表示为？',
                answer: fmtPair(p.col, p.row),
                choices: genPairChoices(p.col, p.row, 8, 6),
                hint: '先写列数，再写行数'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 移动数对 ── */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var p = randPos(6, 5);
            var dc = H.randInt(-3, 3);
            var dr = H.randInt(-3, 3);
            if (dc === 0 && dr === 0) dc = 1;
            var nc = p.col + dc;
            var nr = p.row + dr;
            if (nc < 1 || nc > 8 || nr < 1 || nr > 6) continue;
            var dirText = '';
            if (dr < 0) dirText += '向上' + Math.abs(dr) + '格';
            if (dr > 0) dirText += '向下' + dr + '格';
            if (dc < 0) dirText += '向左' + Math.abs(dc) + '格';
            if (dc > 0) dirText += '向右' + dc + '格';
            qs.push({
                text: '小明在 ' + fmtPair(p.col, p.row) + '，' + dirText + '，新位置是？',
                answer: fmtPair(nc, nr),
                choices: genPairChoices(nc, nr, 8, 6),
                hint: '列变化是左右，行变化是上下'
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
                '<div class="pos-wrap">' +
                    '<div class="pos-header">' +
                        H.guideBarHTML('🗺️', '坐标寻宝——用数对找位置！', 'pos-guide') +
                    '</div>' +
                    '<div class="pos-body" id="pos-body"></div>' +
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
                    H.updateGuide('读数对没问题！来写数对吧！', 'pos-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：数对移动！', 'pos-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pos-body');
            var phaseLabels = { 1: '读数对', 2: '写数对', 3: '移动数对' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'pos-guide');

            var phaseEmoji = state.phase === 1 ? '📍' : state.phase === 2 ? '✏️' : '🏃';

            body.innerHTML =
                '<div class="pos-card">' +
                    '<div class="pos-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="pos-card-num">' + q.text + '</div>' +
                    '<div class="pos-card-hint">' + q.hint + '</div>' +
                    '<div class="pos-card-choices" id="pos-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'pos-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！坐标小达人！✅', 'pos-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#pos-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#pos-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#pos-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了用数对表示位置的方法！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.pos-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#d1fae5 0%,#6ee7b7 40%,#10b981 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.pos-header{position:relative;z-index:50;}' +
            '.pos-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:pos-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes pos-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.pos-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #10b981;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:pos-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes pos-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.pos-card-emoji{font-size:50px;}' +
            '.pos-card-num{' +
                'font-size:28px;font-weight:bold;color:#065f46;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#ecfdf5;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #6ee7b7;' +
            '}' +
            '.pos-card-hint{' +
                'font-size:16px;color:#059669;font-style:italic;' +
            '}' +
            '.pos-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
