/**
 * 五年级下册 第三单元：观察物体（三）
 * 路径: src/games/grade5/g5_d_u1_observe3.js
 *
 * 玩法："三视图还原"
 *   Phase 1 "正视图还原": 给出正面/侧面/上面视图，选择正确的立体图形。4轮。
 *   Phase 2 "俯视图还原": 给出三个视图，选择正确的立体图形描述。4轮。
 *   Phase 3 "综合还原": 给出三视图，选择正确的立体图形。4轮。
 */
(function () {
    'use strict';
    var H = window.GameHelpers;
    var STYLE_ID = 'g5-d-u1-observe3-styles';
    var NEXT_LEVEL = 'lvl_5_d_2';

    /* ── 字符方阵转字符串（用于判重） ── */
    function gridToStr(grid) {
        return grid.map(function (r) { return r.join(''); }).join('\n');
    }

    /* ── 视图网格转 HTML ── */
    function viewToHTML(grid) {
        return '<div class="ob3-grid">' +
            grid.map(function (row) {
                return '<div class="ob3-row">' +
                    row.map(function (cell) {
                        return '<span class="ob3-cell ' +
                            (cell === '■' ? 'ob3-fill' : 'ob3-empty') + '">' +
                            cell + '</span>';
                    }).join('') + '</div>';
            }).join('') + '</div>';
    }

    /* ── 生成干扰视图 ── */
    function genWrongView(correct) {
        var wrong = correct.map(function (r) { return r.slice(); });
        var changed = false;
        for (var i = 0; i < wrong.length; i++) {
            for (var j = 0; j < wrong[i].length; j++) {
                if (Math.random() < 0.35) {
                    wrong[i][j] = wrong[i][j] === '■' ? '□' : '■';
                    changed = true;
                }
            }
        }
        if (!changed && wrong.length > 0 && wrong[0].length > 0) {
            wrong[0][0] = wrong[0][0] === '■' ? '□' : '■';
        }
        return wrong;
    }

    /* ── 生成4个选项（含1个正确 + 3个干扰） ── */
    function genChoicesForView(correct) {
        var set = [correct];
        while (set.length < 4) {
            var w = genWrongView(correct);
            var wStr = gridToStr(w);
            var dup = false;
            for (var k = 0; k < set.length; k++) {
                if (gridToStr(set[k]) === wStr) { dup = true; break; }
            }
            if (!dup && gridToStr(correct) !== wStr) {
                set.push(w);
            }
        }
        return H.shuffle(set);
    }

    /* ─────────────────────────────────────────────
     * 题库：立体图形定义
     * heights: 俯视布局（二维数组，数字=层数，0=空）
     * front / side / top: 用 ■ □ 表示的视图网格
     * desc: 人类可读描述
     * count: 小正方体总数
     * ───────────────────────────────────────────── */
    var SHAPES = [
        // ── 简单一层 ──
        {
            id: 's1',
            desc: '底层横排3个小正方体',
            count: 3,
            heights: [[1, 1, 1]],
            front: [['■', '■', '■']],
            side: [['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's2',
            desc: '底层横排2个小正方体',
            count: 2,
            heights: [[1, 1]],
            front: [['■', '■']],
            side: [['■']],
            top: [['■', '■']]
        },
        {
            id: 's3',
            desc: '底层竖排2个小正方体',
            count: 2,
            heights: [[1], [1]],
            front: [['■']],
            side: [['■', '■']],
            top: [['■'], ['■']]
        },
        {
            id: 's4',
            desc: '底层2×2，共4个小正方体',
            count: 4,
            heights: [[1, 1], [1, 1]],
            front: [['■', '■'], ['■', '■']],
            side: [['■', '■'], ['■', '■']],
            top: [['■', '■'], ['■', '■']]
        },
        {
            id: 's5',
            desc: '底层3个，左边两列各叠1层，共5个',
            count: 5,
            heights: [[2, 2, 1]],
            front: [['■', '■', '■'], ['■', '■', '□']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's6',
            desc: '底层3个，右边叠1层，共4个',
            count: 4,
            heights: [[1, 1, 2]],
            front: [['■', '■', '■'], ['□', '□', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's7',
            desc: '竖叠3层，共3个',
            count: 3,
            heights: [[3]],
            front: [['■'], ['■'], ['■']],
            side: [['■'], ['■'], ['■']],
            top: [['■']]
        },
        {
            id: 's8',
            desc: '底层3个，中间叠1层，共4个',
            count: 4,
            heights: [[1, 2, 1]],
            front: [['□', '■', '□'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's9',
            desc: '底层3个，左右各叠1层，共5个',
            count: 5,
            heights: [[2, 1, 2]],
            front: [['■', '□', '■'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's10',
            desc: '底层3个，中间叠2层，共5个',
            count: 5,
            heights: [[1, 3, 1]],
            front: [['□', '■', '□'], ['□', '■', '□'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        // ── 两排组合 ──
        {
            id: 's11',
            desc: 'L形底层（前排3个+后排左边1个），共4个',
            count: 4,
            heights: [[1, 1, 1], [1, 0, 0]],
            front: [['■', '■', '■'], ['■', '□', '□']],
            side: [['■', '■'], ['■', '□'], ['■', '□']],
            top: [['■', '■', '■'], ['■', '□', '□']]
        },
        {
            id: 's12',
            desc: '底层2×2，右上方叠1层，共5个',
            count: 5,
            heights: [[1, 2], [1, 1]],
            front: [['■', '■'], ['□', '■']],
            side: [['■', '■'], ['□', '■']],
            top: [['■', '■'], ['■', '■']]
        },
        {
            id: 's13',
            desc: '底层2×2，左下角叠1层，共5个',
            count: 5,
            heights: [[2, 1], [1, 1]],
            front: [['■', '■'], ['■', '□']],
            side: [['■', '■'], ['■', '□']],
            top: [['■', '■'], ['■', '■']]
        },
        {
            id: 's14',
            desc: '底层3个，左边叠2层，共5个',
            count: 5,
            heights: [[3, 1, 1]],
            front: [['□', '■', '■'], ['□', '■', '■'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's15',
            desc: '前排3个，后排中间1个，共4个',
            count: 4,
            heights: [[1, 1, 1], [0, 1, 0]],
            front: [['■', '■', '■'], ['□', '■', '□']],
            side: [['■', '■'], ['■', '□'], ['■', '■']],
            top: [['■', '■', '■'], ['□', '■', '□']]
        },
        {
            id: 's16',
            desc: '前排3个，后排右边1个，叠2层，共5个',
            count: 5,
            heights: [[1, 1, 1], [0, 0, 2]],
            front: [['■', '■', '■'], ['□', '□', '■']],
            side: [['■', '■'], ['■', '□'], ['■', '■']],
            top: [['■', '■', '■'], ['□', '□', '■']]
        },
        {
            id: 's17',
            desc: '底层T形（前排3个+后排中间1个），共4个',
            count: 4,
            heights: [[1, 1, 1], [0, 1, 0]],
            front: [['■', '■', '■'], ['□', '■', '□']],
            side: [['■', '■'], ['■', '□'], ['■', '■']],
            top: [['■', '■', '■'], ['□', '■', '□']]
        },
        {
            id: 's18',
            desc: '底层3个，中间叠3层，共5个',
            count: 5,
            heights: [[1, 3, 1]],
            front: [['□', '■', '□'], ['□', '■', '□'], ['□', '■', '□'], ['■', '■', '■']],
            side: [['■'], ['■'], ['■']],
            top: [['■', '■', '■']]
        },
        {
            id: 's19',
            desc: '2×2底层，四个角各不同高度，共6个',
            count: 6,
            heights: [[2, 1], [1, 2]],
            front: [['■', '□'], ['■', '■'], ['■', '■']],
            side: [['■', '■'], ['□', '■'], ['■', '■']],
            top: [['■', '■'], ['■', '■']]
        },
        {
            id: 's20',
            desc: '前排3个，后排右边1个，共4个',
            count: 4,
            heights: [[1, 1, 1], [0, 0, 1]],
            front: [['■', '■', '■'], ['□', '□', '■']],
            side: [['■', '■'], ['■', '□'], ['■', '■']],
            top: [['■', '■', '■'], ['□', '□', '■']]
        }
    ];

    /* ── 阶段构建：从题库中选题生成选择题 ── */
    function buildPhaseQuestions(poolSize) {
        var qs = [];
        var picked = H.shuffle(SHAPES.slice()).slice(0, poolSize);
        for (var i = 0; i < picked.length; i++) {
            var shape = picked[i];
            // 生成4个立体图形描述选项
            var descSet = [shape.desc];
            while (descSet.length < 4) {
                var fake = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                if (fake.id !== shape.id && descSet.indexOf(fake.desc) === -1) {
                    descSet.push(fake.desc);
                }
            }
            descSet = H.shuffle(descSet);
            var answerIdx = descSet.indexOf(shape.desc);
            qs.push({
                shape: shape,
                descChoices: descSet,
                answerIdx: answerIdx
            });
        }
        return qs;
    }

    /* ── Phase 1：给三个视图，选正确立体图形（选项用视图网格） ── */
    function buildPhase1() {
        var qs = [];
        var picked = H.shuffle(SHAPES.slice()).slice(0, 6);
        for (var i = 0; i < picked.length; i++) {
            var shape = picked[i];
            // 给三个视图，要求选择正确的立体描述
            var correctDesc = shape.desc;
            var descSet = [correctDesc];
            while (descSet.length < 4) {
                var fake = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                if (fake.id !== shape.id && descSet.indexOf(fake.desc) === -1) {
                    descSet.push(fake.desc);
                }
            }
            descSet = H.shuffle(descSet);
            qs.push({
                shape: shape,
                descChoices: descSet,
                answerIdx: descSet.indexOf(correctDesc)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2：给三个视图，选择正确的俯视图网格 ── */
    function buildPhase2() {
        var qs = [];
        var picked = H.shuffle(SHAPES.slice()).slice(0, 6);
        for (var i = 0; i < picked.length; i++) {
            var shape = picked[i];
            var correctTop = shape.top;
            var choices = genChoicesForView(correctTop);
            qs.push({
                shape: shape,
                topChoices: choices,
                answerIdx: choices.findIndex(function (c) {
                    return gridToStr(c) === gridToStr(correctTop);
                })
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3：给三个视图，选择正确的正面视图网格 ── */
    function buildPhase3() {
        var qs = [];
        var picked = H.shuffle(SHAPES.slice()).slice(0, 6);
        for (var i = 0; i < picked.length; i++) {
            var shape = picked[i];
            var correctFront = shape.front;
            var choices = genChoicesForView(correctFront);
            qs.push({
                shape: shape,
                frontChoices: choices,
                answerIdx: choices.findIndex(function (c) {
                    return gridToStr(c) === gridToStr(correctFront);
                })
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

    /* ── 游戏主逻辑 ── */
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
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="ob3-wrap">' +
                    '<div class="ob3-header">' +
                        H.guideBarHTML('🔮', '三视图还原——从平面视图还原立体图形！', 'ob3-guide') +
                    '</div>' +
                    '<div class="ob3-body" id="ob3-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;

            /* 阶段切换 */
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('正视图还原完成！试试俯视图还原！', 'ob3-guide');
                    setTimeout(function () { game.renderPhaseHeader('俯视图还原', '📐'); }, 800);
                    setTimeout(function () { game.nextQuestion(); }, 2000);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('俯视图也过关了！最终综合挑战！', 'ob3-guide');
                    setTimeout(function () { game.renderPhaseHeader('综合还原', '🧩'); }, 800);
                    setTimeout(function () { game.nextQuestion(); }, 2000);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('ob3-body');
            H.updateGuide(
                '第 ' + (state.qIndex + 1) + '/4 题 · ' + this.getPhaseName(),
                'ob3-guide'
            );

            var html = '';
            if (state.phase === 1) {
                html = this.renderPhase1(q);
            } else if (state.phase === 2) {
                html = this.renderPhase2(q);
            } else {
                html = this.renderPhase3(q);
            }
            body.innerHTML = html;

            // 添加淡入动画
            var card = body.querySelector('.ob3-card');
            if (card) {
                card.style.animation = 'ob3-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';
            }

            this.bindChoices(q);
        },

        getPhaseName: function () {
            if (state.phase === 1) return '正视图还原';
            if (state.phase === 2) return '俯视图还原';
            return '综合还原';
        },

        renderPhaseHeader: function (title, emoji) {
            var body = document.getElementById('ob3-body');
            if (!body) return;
            body.innerHTML =
                '<div class="ob3-phase-banner">' +
                    '<div class="ob3-phase-emoji">' + emoji + '</div>' +
                    '<div class="ob3-phase-title">Phase ' + state.phase + '：' + title + '</div>' +
                    '<div class="ob3-phase-sub">准备好挑战更难的题目了吗？</div>' +
                '</div>';
        },

        /* ── Phase 1 渲染：三视图 → 选文字描述 ── */
        renderPhase1: function (q) {
            var shape = q.shape;
            var choicesHTML = '';
            for (var i = 0; i < q.descChoices.length; i++) {
                choicesHTML +=
                    '<div class="ob3-desc-card" data-idx="' + i + '">' +
                        '<div class="ob3-choice-letter">' + String.fromCharCode(65 + i) + '</div>' +
                        '<div class="ob3-desc-text">' + q.descChoices[i] + '</div>' +
                    '</div>';
            }

            return '<div class="ob3-card">' +
                '<div class="ob3-card-phase-tag">Phase 1 · 正视图还原</div>' +
                '<div class="ob3-card-emoji">🔮</div>' +
                '<div class="ob3-card-question">这个立体图形用了 <b>' + shape.count + '</b> 个小正方体，长什么样？</div>' +
                '<div class="ob3-views-row">' +
                    '<div class="ob3-view-box">' +
                        '<div class="ob3-view-label">正面 👀</div>' +
                        viewToHTML(shape.front) +
                    '</div>' +
                    '<div class="ob3-view-box">' +
                        '<div class="ob3-view-label">侧面 🪞</div>' +
                        viewToHTML(shape.side) +
                    '</div>' +
                    '<div class="ob3-view-box">' +
                        '<div class="ob3-view-label">上面 📐</div>' +
                        viewToHTML(shape.top) +
                    '</div>' +
                '</div>' +
                '<div class="ob3-card-hint">💡 根据三个视图想象立体图形的样子</div>' +
                '<div class="ob3-choices-wrap" id="ob3-choices">' + choicesHTML + '</div>' +
            '</div>';
        },

        /* ── Phase 2 渲染：正/侧视图 → 选正确俯视图 ── */
        renderPhase2: function (q) {
            var shape = q.shape;
            var choicesHTML = '';
            for (var i = 0; i < q.topChoices.length; i++) {
                choicesHTML +=
                    '<div class="ob3-view-choice" data-idx="' + i + '">' +
                        '<div class="ob3-choice-letter">' + String.fromCharCode(65 + i) + '</div>' +
                        viewToHTML(q.topChoices[i]) +
                    '</div>';
            }

            return '<div class="ob3-card">' +
                '<div class="ob3-card-phase-tag">Phase 2 · 俯视图还原</div>' +
                '<div class="ob3-card-emoji">📐</div>' +
                '<div class="ob3-card-desc">' + shape.desc + ' (' + shape.count + '个)</div>' +
                '<div class="ob3-card-question">哪个是<b>俯视图</b>？</div>' +
                '<div class="ob3-hint-views">' +
                    '<div class="ob3-view-box ob3-view-small">' +
                        '<div class="ob3-view-label">正面</div>' +
                        viewToHTML(shape.front) +
                    '</div>' +
                    '<div class="ob3-view-box ob3-view-small">' +
                        '<div class="ob3-view-label">侧面</div>' +
                        viewToHTML(shape.side) +
                    '</div>' +
                '</div>' +
                '<div class="ob3-card-hint">💡 从上面往下看，哪些位置有方块？</div>' +
                '<div class="ob3-choices-wrap" id="ob3-choices">' + choicesHTML + '</div>' +
            '</div>';
        },

        /* ── Phase 3 渲染：正/俯视图 → 选正确正面视图 ── */
        renderPhase3: function (q) {
            var shape = q.shape;
            var choicesHTML = '';
            for (var i = 0; i < q.frontChoices.length; i++) {
                choicesHTML +=
                    '<div class="ob3-view-choice" data-idx="' + i + '">' +
                        '<div class="ob3-choice-letter">' + String.fromCharCode(65 + i) + '</div>' +
                        viewToHTML(q.frontChoices[i]) +
                    '</div>';
            }

            return '<div class="ob3-card">' +
                '<div class="ob3-card-phase-tag">Phase 3 · 综合还原</div>' +
                '<div class="ob3-card-emoji">🧩</div>' +
                '<div class="ob3-card-desc">' + shape.desc + ' (' + shape.count + '个)</div>' +
                '<div class="ob3-card-question">哪个是<b>正面视图</b>？</div>' +
                '<div class="ob3-hint-views">' +
                    '<div class="ob3-view-box ob3-view-small">' +
                        '<div class="ob3-view-label">侧面</div>' +
                        viewToHTML(shape.side) +
                    '</div>' +
                    '<div class="ob3-view-box ob3-view-small">' +
                        '<div class="ob3-view-label">俯视</div>' +
                        viewToHTML(shape.top) +
                    '</div>' +
                '</div>' +
                '<div class="ob3-card-hint">💡 从前面看，每列最高有几层？</div>' +
                '<div class="ob3-choices-wrap" id="ob3-choices">' + choicesHTML + '</div>' +
            '</div>';
        },

        /* ── 绑定选择事件 ── */
        bindChoices: function (q) {
            var self = this;
            var cards = document.querySelectorAll('#ob3-choices .ob3-desc-card, #ob3-choices .ob3-view-choice');
            cards.forEach(function (card) {
                card.onclick = function () {
                    if (state.answered) return;
                    state.answered = true;
                    var idx = parseInt(card.dataset.idx);

                    if (idx === q.answerIdx) {
                        card.classList.add('ob3-correct');
                        H.updateGuide('太棒了！空间想象力真强！✅', 'ob3-guide');
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        card.classList.add('ob3-wrong');
                        H.triggerError(state.container, '没关系，仔细想想三视图的关系！', card);
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        // 高亮正确答案
                        cards[q.answerIdx].classList.add('ob3-correct');
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2200);
                    }
                };

                card.onmouseenter = function () {
                    if (!state.answered && !card.classList.contains('ob3-correct') && !card.classList.contains('ob3-wrong')) {
                        card.style.transform = 'scale(1.06)';
                        card.style.boxShadow = '0 6px 20px rgba(99,102,241,0.15)';
                    }
                };
                card.onmouseleave = function () {
                    if (!card.classList.contains('ob3-correct') && !card.classList.contains('ob3-wrong')) {
                        card.style.transform = '';
                        card.style.boxShadow = '';
                    }
                };
            });
        },

        /* ── 结算 ── */
        finishGame: function () {
            if (window.GameManager) {
                window.GameManager.addCoins(state.levelData.reward || 30);
                window.GameManager.unlockLevel(NEXT_LEVEL);
            }
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了从三视图还原立体图形的能力！',
                NEXT_LEVEL
            );
        }
    };

    /* ── CSS 样式 ── */
    function buildCSS() {
        return '' +
            /* 基础布局 */
            '.ob3-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(160deg,#eef2ff 0%,#c7d2fe 40%,#818cf8 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.ob3-header{position:relative;z-index:50;}' +
            '.ob3-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:16px;gap:12px;' +
                'animation:ob3-fadeIn 0.4s ease;' +
                'overflow-y:auto;' +
            '}' +
            '@keyframes ob3-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '@keyframes ob3-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            /* 主卡片 */
            '.ob3-card{' +
                'background:white;border-radius:28px;padding:24px 30px 22px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #818cf8;' +
                'display:flex;flex-direction:column;align-items:center;gap:12px;' +
                'max-width:660px;width:96%;' +
            '}' +
            '.ob3-card-phase-tag{' +
                'background:linear-gradient(135deg,#6366f1,#8b5cf6);' +
                'color:white;padding:4px 16px;border-radius:20px;' +
                'font-size:13px;font-weight:bold;letter-spacing:1px;' +
            '}' +
            '.ob3-card-emoji{font-size:42px;}' +
            '.ob3-card-desc{font-size:17px;color:#4338ca;line-height:1.6;text-align:center;}' +
            '.ob3-card-question{font-size:21px;font-weight:bold;color:#4f46e5;text-align:center;}' +
            '.ob3-card-hint{font-size:13px;color:#7c3aed;font-style:italic;}' +

            /* 阶段过渡横幅 */
            '.ob3-phase-banner{' +
                'background:white;border-radius:24px;padding:40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.1);' +
                'display:flex;flex-direction:column;align-items:center;gap:12px;' +
                'animation:ob3-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:480px;width:90%;' +
            '}' +
            '.ob3-phase-emoji{font-size:56px;}' +
            '.ob3-phase-title{font-size:26px;font-weight:bold;color:#4f46e5;}' +
            '.ob3-phase-sub{font-size:15px;color:#6366f1;}' +

            /* 视图展示区 */
            '.ob3-views-row{' +
                'display:flex;gap:18px;justify-content:center;flex-wrap:wrap;' +
                'width:100%;' +
            '}' +
            '.ob3-view-box{' +
                'background:#f5f3ff;border:2px solid #c4b5fd;border-radius:14px;' +
                'padding:10px 14px;display:flex;flex-direction:column;align-items:center;gap:6px;' +
            '}' +
            '.ob3-view-label{font-size:13px;font-weight:bold;color:#6d28d9;}' +
            '.ob3-view-small{padding:8px 10px;}' +

            /* 视图网格 */
            '.ob3-grid{display:flex;flex-direction:column;gap:2px;}' +
            '.ob3-row{display:flex;gap:2px;justify-content:center;}' +
            '.ob3-cell{' +
                'width:22px;height:22px;display:flex;align-items:center;justify-content:center;' +
                'font-size:13px;border-radius:4px;' +
            '}' +
            '.ob3-fill{background:#6366f1;color:white;font-weight:bold;}' +
            '.ob3-empty{background:#f3f4f6;color:#d1d5db;}' +

            /* 提示视图区（Phase 2/3） */
            '.ob3-hint-views{' +
                'display:flex;gap:14px;justify-content:center;' +
            '}' +

            /* 选择区 */
            '.ob3-choices-wrap{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:620px;' +
            '}' +

            /* 文字描述卡片（Phase 1） */
            '.ob3-desc-card{' +
                'background:white;border:3px solid #d1d5db;border-radius:16px;' +
                'padding:12px 18px;cursor:pointer;transition:all 0.25s;' +
                'display:flex;align-items:center;gap:10px;' +
                'min-width:200px;flex:1 1 45%;max-width:300px;' +
            '}' +
            '.ob3-desc-card:hover{border-color:#818cf8;background:#f5f3ff;}' +

            /* 视图选择卡片（Phase 2/3） */
            '.ob3-view-choice{' +
                'background:white;border:3px solid #d1d5db;border-radius:16px;' +
                'padding:10px 14px;cursor:pointer;transition:all 0.25s;' +
                'display:flex;flex-direction:column;align-items:center;gap:6px;' +
                'min-width:90px;' +
            '}' +
            '.ob3-view-choice:hover{border-color:#818cf8;background:#f5f3ff;}' +

            /* 选项字母 */
            '.ob3-choice-letter{' +
                'font-size:16px;font-weight:bold;color:#4f46e5;' +
                'width:28px;height:28px;display:flex;align-items:center;justify-content:center;' +
                'background:#eef2ff;border-radius:50%;flex-shrink:0;' +
            '}' +

            /* 描述文字 */
            '.ob3-desc-text{font-size:15px;color:#374151;line-height:1.5;flex:1;}' +

            /* 正确/错误状态 */
            '.ob3-correct{' +
                'border-color:#10b981 !important;background:#d1fae5 !important;' +
                'transform:scale(1.04);' +
                'box-shadow:0 0 15px rgba(16,185,129,0.3);' +
            '}' +
            '.ob3-correct .ob3-choice-letter{background:#10b981;color:white;}' +
            '.ob3-wrong{' +
                'border-color:#ef4444 !important;background:#fee2e2 !important;' +
                'transform:scale(0.96);' +
                'box-shadow:0 0 15px rgba(239,68,68,0.3);' +
            '}' +
            '.ob3-wrong .ob3-choice-letter{background:#ef4444;color:white;}' +

            /* 响应式 */
            '@media(max-width:480px){' +
                '.ob3-card{padding:18px 16px 16px;border-radius:22px;}' +
                '.ob3-card-question{font-size:18px;}' +
                '.ob3-views-row{gap:10px;}' +
                '.ob3-view-box{padding:8px 10px;}' +
                '.ob3-cell{width:18px;height:18px;font-size:11px;}' +
                '.ob3-desc-card{min-width:160px;padding:10px 14px;}' +
                '.ob3-desc-text{font-size:14px;}' +
                '.ob3-choices-wrap{gap:8px;}' +
                '.ob3-phase-title{font-size:22px;}' +
            '}';
    }

    window.CurrentGameModule = game;
})();
