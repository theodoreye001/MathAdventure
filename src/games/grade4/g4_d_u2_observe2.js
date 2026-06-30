/**
 * 四年级下册 第二单元：观察物体（二）
 * 路径: src/games/grade4/g4_d_u2_observe2.js
 *
 * 玩法："三视图解谜"
 *   Phase 1 "从前面看": 给出立体图形描述，选择正确的正面视图。4轮。
 *   Phase 2 "从侧面看": 选择正确的侧面视图。4轮。
 *   Phase 3 "从上面看": 选择正确的上面视图。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u2-observe2-styles';
    const NEXT_LEVEL = 'lvl_4_d_3';

    /* ── 用字符方阵画视图 ── */
    function gridToStr(grid) {
        return grid.map(function (row) { return row.join(''); }).join('\n');
    }

    /* ── 题库：每个问题描述一个立体结构（俯视布局 + 各位置高度） ── */
    var SHAPES = [
        {
            desc: '用4个小正方体：底层横排3个，右边上方叠1个',
            heights: [[1, 1, 2]],
            front: [['■', '■', '■'], ['□', '□', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            desc: '用5个小正方体：底层横排3个，左和中各上方叠1个',
            heights: [[2, 2, 1]],
            front: [['■', '■', '■'], ['■', '■', '□']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            desc: '用4个小正方体：底层横排2个，左边上方叠1个，右边上方叠1个',
            heights: [[2, 2]],
            front: [['■', '■'], ['■', '■']],
            side: [['■'], ['■']],
            top: [['■', '■']]
        },
        {
            desc: '用3个小正方体：底层横排3个',
            heights: [[1, 1, 1]],
            front: [['■', '■', '■']],
            side: [['■']],
            top: [['■', '■', '■']]
        },
        {
            desc: '用4个小正方体：底层2×2，右上方叠1个',
            heights: [[1, 2], [1, 1]],
            front: [['■', '■'], ['□', '■']],
            side: [['■', '■'], ['□', '■']],
            top: [['■', '■'], ['■', '■']]
        },
        {
            desc: '用5个小正方体：底层3个横排，中间上方叠2个',
            heights: [[1, 3, 1]],
            front: [['□', '■', '□'], ['□', '■', '□'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            desc: '用6个小正方体：底层L形（左列2个+底行3个），左下角上方叠1个',
            heights: [[2, 1, 1], [1, 0, 0]],
            front: [['■', '■', '■'], ['■', '□', '□']],
            side: [['■', '■'], ['■', '□'], ['■', '□']],
            top: [['■', '■', '■'], ['■', '□', '□']]
        },
        {
            desc: '用3个小正方体：竖着叠3层',
            heights: [[3]],
            front: [['■'], ['■'], ['■']],
            side: [['■'], ['■'], ['■']],
            top: [['■']]
        },
        {
            desc: '用4个小正方体：底层横排3个，中间上方叠1个',
            heights: [[1, 2, 1]],
            front: [['□', '■', '□'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            desc: '用5个小正方体：底层3个横排，左边和右边各上方叠1个',
            heights: [[2, 1, 2]],
            front: [['■', '□', '■'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        }
    ];

    /** 生成干扰视图（改变某些格子） */
    function genWrongView(correct) {
        var wrong = correct.map(function (r) { return r.slice(); });
        var changed = false;
        for (var i = 0; i < wrong.length; i++) {
            for (var j = 0; j < wrong[i].length; j++) {
                if (Math.random() < 0.3) {
                    wrong[i][j] = wrong[i][j] === '■' ? '□' : '■';
                    changed = true;
                }
            }
        }
        if (!changed && wrong.length > 0) {
            wrong[0][0] = wrong[0][0] === '■' ? '□' : '■';
        }
        return wrong;
    }

    function viewToHTML(grid) {
        return '<div class="ob2-grid">' +
            grid.map(function (row) {
                return '<div class="ob2-row">' +
                    row.map(function (cell) {
                        return '<span class="ob2-cell ' + (cell === '■' ? 'ob2-fill' : 'ob2-empty') + '">' + cell + '</span>';
                    }).join('') + '</div>';
            }).join('') + '</div>';
    }

    function genChoicesForView(correct) {
        var set = [correct];
        while (set.length < 4) {
            var w = genWrongView(correct);
            var wStr = gridToStr(w);
            var dup = false;
            for (var k = 0; k < set.length; k++) {
                if (gridToStr(set[k]) === wStr) { dup = true; break; }
            }
            if (!dup && gridToStr(correct) !== wStr) set.push(w);
        }
        return H.shuffle(set);
    }

    function buildPhase(viewType) {
        var qs = [];
        var picked = H.shuffle(SHAPES).slice(0, 6);
        for (var i = 0; i < picked.length; i++) {
            var shape = picked[i];
            var correctGrid = shape[viewType];
            var choices = genChoicesForView(correctGrid);
            qs.push({
                desc: shape.desc,
                answerIdx: choices.findIndex(function (c) { return gridToStr(c) === gridToStr(correctGrid); }),
                choices: choices,
                viewLabel: viewType === 'front' ? '正面' : viewType === 'side' ? '侧面（右）' : '上面',
                hint: '从' + (viewType === 'front' ? '前面' : viewType === 'side' ? '右面' : '上面') + '看，哪些位置有方块？'
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
            state.questions = buildPhase('front');

            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="ob2-wrap">' +
                    '<div class="ob2-header">' +
                        H.guideBarHTML('🧊', '三视图解谜——从不同角度观察立体图形！', 'ob2-guide') +
                    '</div>' +
                    '<div class="ob2-body" id="ob2-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase('side');
                    H.updateGuide('正面没问题！看看侧面长什么样！', 'ob2-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase('top');
                    H.updateGuide('侧面也过关了！最后试试俯视图！', 'ob2-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('ob2-body');
            var viewEmoji = state.phase === 1 ? '👀' : state.phase === 2 ? '🪞' : '🔝';
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + q.viewLabel + '视图', 'ob2-guide');

            var choicesHTML = '';
            for (var i = 0; i < q.choices.length; i++) {
                choicesHTML += '<div class="ob2-choice-card" data-idx="' + i + '">' +
                    '<div class="ob2-choice-label">' + String.fromCharCode(65 + i) + '</div>' +
                    viewToHTML(q.choices[i]) +
                '</div>';
            }

            body.innerHTML =
                '<div class="ob2-card">' +
                    '<div class="ob2-card-emoji">' + viewEmoji + '</div>' +
                    '<div class="ob2-card-desc">' + q.desc + '</div>' +
                    '<div class="ob2-card-question">哪个是<b>' + q.viewLabel + '</b>看到的形状？</div>' +
                    '<div class="ob2-card-hint">' + q.hint + '</div>' +
                    '<div class="ob2-choices-wrap" id="ob2-choices">' + choicesHTML + '</div>' +
                '</div>';

            var self = this;
            var cards = document.querySelectorAll('#ob2-choices .ob2-choice-card');
            cards.forEach(function (card) {
                card.onclick = function () {
                    if (state.answered) return;
                    state.answered = true;
                    var idx = parseInt(card.dataset.idx);

                    if (idx === q.answerIdx) {
                        H.updateGuide('观察准确！三视图高手！✅', 'ob2-guide');
                        if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        card.style.background = '#10b981';
                        card.style.borderColor = '#10b981';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '选错了，注意观察每个位置！', card);
                        if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        cards[q.answerIdx].style.background = '#10b981';
                        cards[q.answerIdx].style.borderColor = '#10b981';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2000);
                    }
                };
                card.onmouseenter = function () {
                    if (!state.answered) card.style.transform = 'scale(1.08)';
                };
                card.onmouseleave = function () {
                    card.style.transform = '';
                };
            });
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你能从不同角度观察物体了！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.ob2-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fdf2f8 0%,#fbcfe8 40%,#f472b6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.ob2-header{position:relative;z-index:50;}' +
            '.ob2-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:16px;' +
                'animation:ob2-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes ob2-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.ob2-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #ec4899;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:ob2-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes ob2-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.ob2-card-emoji{font-size:46px;}' +
            '.ob2-card-desc{font-size:18px;color:#9d174d;line-height:1.6;text-align:center;}' +
            '.ob2-card-question{font-size:22px;font-weight:bold;color:#be185d;text-align:center;}' +
            '.ob2-card-hint{font-size:14px;color:#db2777;font-style:italic;}' +
            '.ob2-choices-wrap{' +
                'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;' +
                'width:100%;max-width:580px;' +
            '}' +
            '.ob2-choice-card{' +
                'background:white;border:3px solid #d1d5db;border-radius:16px;' +
                'padding:12px 16px;cursor:pointer;transition:all 0.2s;' +
                'display:flex;flex-direction:column;align-items:center;gap:6px;' +
                'min-width:110px;' +
            '}' +
            '.ob2-choice-card:hover{border-color:#ec4899;transform:scale(1.05);}' +
            '.ob2-choice-label{font-size:16px;font-weight:bold;color:#9d174d;}' +
            '.ob2-grid{display:flex;flex-direction:column;gap:2px;}' +
            '.ob2-row{display:flex;gap:2px;justify-content:center;}' +
            '.ob2-cell{width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px;}' +
            '.ob2-fill{background:#ec4899;color:white;border-radius:4px;font-weight:bold;}' +
            '.ob2-empty{background:#f3f4f6;color:#d1d5db;border-radius:4px;}' +
            '}';
    }

    window.CurrentGameModule = game;
})();
