/**
 * 五年级下册 第五单元：图形的运动（三）——旋转
 * 路径: src/games/grade5/g5_d_u5_rotation.js
 *
 * 玩法："旋转画图"
 *   Phase 1 "旋转基础": 根据旋转前后的图形描述，判断旋转中心/方向/角度。4题。
 *   Phase 2 "旋转判断": 在网格中识别旋转后的图形。4题。
 *   Phase 3 "旋转应用": 生活中的旋转问题（钟表、风车、旋转对称）。4题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u5-rotation-styles';
    const NEXT_LEVEL = 'lvl_5_d_6';

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       网格形状数据（预定义，避免运行时计算出错）
       每个形状用 5x5 网格表示
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    /** 将二维数组转为字符串（用于去重比较） */
    function gridKey(grid) {
        return grid.map(function (r) { return r.join(''); }).join('|');
    }

    /** 将网格数组渲染为 HTML */
    function gridToHTML(grid, cellCls) {
        var cls = cellCls || 'rot-cell';
        return '<div class="rot-grid">' +
            grid.map(function (row) {
                return '<div class="rot-row">' +
                    row.map(function (cell) {
                        var extra = cell === '■' ? ' rot-fill' : ' rot-empty';
                        return '<span class="' + cls + extra + '">' + cell + '</span>';
                    }).join('') + '</div>';
            }).join('') + '</div>';
    }

    /** 5x5 空网格 */
    function emptyGrid() {
        var g = [];
        for (var r = 0; r < 5; r++) {
            g[r] = [];
            for (var c = 0; c < 5; c++) g[r][c] = '□';
        }
        return g;
    }

    /** 深拷贝网格 */
    function cloneGrid(g) {
        return g.map(function (r) { return r.slice(); });
    }

    /** 手工定义旋转：以 (2,2) 为中心顺时针旋转 90°/180°/270°
     *  输入为 5x5 网格中填了 ■ 的坐标列表 [{r,c}, ...]
     *  返回旋转后的坐标列表
     */
    function rotateCells(cells, angle, cr, cc) {
        var times = angle / 90;
        var result = cells.map(function (p) { return { r: p.r, c: p.c }; });
        for (var t = 0; t < times; t++) {
            var next = [];
            for (var i = 0; i < result.length; i++) {
                var dr = result[i].r - cr;
                var dc = result[i].c - cc;
                // 顺时针 90°: (r,c) -> (-c, r) 即新r = cr + dc, 新c = cc - dr
                next.push({ r: cr + dc, c: cc - dr });
            }
            result = next;
        }
        return result;
    }

    /** 从坐标列表构建网格 */
    function cellsToGrid(cells, size) {
        var g = emptyGrid();
        for (var i = 0; i < cells.length; i++) {
            var r = cells[i].r, c = cells[i].c;
            if (r >= 0 && r < (size || 5) && c >= 0 && c < (size || 5)) {
                g[r][c] = '■';
            }
        }
        return g;
    }

    /* ── 预定义形状 ── */
    var SHAPES = [
        {
            name: 'L形',
            cells: [{ r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }]
        },
        {
            name: 'T形',
            cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 2 }, { r: 3, c: 2 }]
        },
        {
            name: '箭头形',
            cells: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }]
        },
        {
            name: 'Z形',
            cells: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }]
        },
        {
            name: '台阶形',
            cells: [{ r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 3 }]
        },
        {
            name: '十字形',
            cells: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }]
        }
    ];

    var CENTER_R = 2, CENTER_C = 2;

    /** 预计算所有形状的各角度旋转网格 */
    var SHAPE_ROTATIONS = SHAPES.map(function (shape) {
        var original = cellsToGrid(shape.cells);
        var r90 = cellsToGrid(rotateCells(shape.cells, 90, CENTER_R, CENTER_C));
        var r180 = cellsToGrid(rotateCells(shape.cells, 180, CENTER_R, CENTER_C));
        var r270 = cellsToGrid(rotateCells(shape.cells, 270, CENTER_R, CENTER_C));
        return {
            name: shape.name,
            original: original,
            r90: r90,
            r180: r180,
            r270: r270,
            cells: shape.cells
        };
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Phase 1: 旋转基础（文字选择题）
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function buildPhase1() {
        var qs = [];
        var directions = [
            { label: '顺时针旋转90°', angle: 90, dir: '顺时针', hint: '顺时针就是时钟指针走的方向' },
            { label: '顺时针旋转180°', angle: 180, dir: '顺时针', hint: '180°就是转了半圈' },
            { label: '逆时针旋转90°', angle: 270, dir: '逆时针', hint: '逆时针旋转90°等价于顺时针旋转270°' },
            { label: '顺时针旋转270°', angle: 270, dir: '顺时针', hint: '270°就是转了四分之三圈' }
        ];

        // 题型A：给描述选旋转要素
        for (var i = 0; i < 3; i++) {
            var d = directions[i];
            qs.push({
                type: 'identify',
                text: '一个图形绕中心点' + d.label + '后得到新图形。',
                question: '这次旋转的旋转中心、方向和角度分别是什么？',
                answer: '绕中心点、' + d.dir + '、' + d.angle + '°',
                choices: [
                    '绕中心点、' + d.dir + '、' + d.angle + '°',
                    '绕中心点、' + (d.dir === '顺时针' ? '逆时针' : '顺时针') + '、' + d.angle + '°',
                    '绕顶点、' + d.dir + '、' + (d.angle === 90 ? 180 : 90) + '°',
                    '绕中心点、' + d.dir + '、' + (d.angle === 180 ? 270 : 180) + '°'
                ],
                hint: d.hint,
                emoji: '🔄'
            });
        }

        // 题型B：旋转的性质
        var properties = [
            {
                text: '关于旋转，以下哪个说法是正确的？',
                answer: '旋转前后图形的形状和大小不变',
                choices: [
                    '旋转前后图形的形状和大小不变',
                    '旋转后图形一定变大',
                    '旋转只能顺时针进行',
                    '旋转角度只能是90°'
                ],
                hint: '旋转是全等变换，不改变形状和大小',
                emoji: '💡'
            },
            {
                text: '把一个图形绕点O顺时针旋转90°，再绕点O顺时针旋转90°，相当于什么？',
                answer: '绕点O顺时针旋转180°',
                choices: [
                    '绕点O顺时针旋转180°',
                    '绕点O逆时针旋转180°',
                    '图形回到了原来的位置',
                    '图形绕点O旋转了270°'
                ],
                hint: '两次90°顺时针 = 一次180°',
                emoji: '🔁'
            }
        ];
        qs = qs.concat(properties);

        return H.shuffle(qs).slice(0, 4);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Phase 2: 旋转判断（图形网格选择）
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function buildPhase2() {
        var qs = [];
        var picked = H.shuffle(SHAPE_ROTATIONS).slice(0, 4);

        for (var i = 0; i < picked.length; i++) {
            var sr = picked[i];
            var angles = H.shuffle([90, 180, 270]);
            var angle = angles[0];
            var correctGrid = angle === 90 ? sr.r90 : angle === 180 ? sr.r180 : sr.r270;

            // 构造4个选项（含正确答案）
            var allGrids = [sr.r90, sr.r180, sr.r270];
            // 加入原始图形作为干扰项
            var options = [correctGrid, sr.original];
            // 从另外两个角度中补充至4个
            for (var j = 0; j < allGrids.length && options.length < 4; j++) {
                if (gridKey(allGrids[j]) !== gridKey(correctGrid) && gridKey(allGrids[j]) !== gridKey(sr.original)) {
                    options.push(allGrids[j]);
                }
            }
            // 不够4个就加一个变换版
            if (options.length < 4) {
                var extra = cloneGrid(correctGrid);
                // 翻转一下作为干扰
                extra = extra.reverse();
                if (gridKey(extra) !== gridKey(correctGrid)) {
                    options.push(extra);
                }
            }
            // 仍不够4个
            if (options.length < 4) {
                var extra2 = emptyGrid();
                extra2[1][1] = '■'; extra2[2][2] = '■'; extra2[3][3] = '■';
                options.push(extra2);
            }

            options = H.shuffle(options).slice(0, 4);

            qs.push({
                original: sr.original,
                angle: angle,
                answerIdx: options.findIndex(function (g) { return gridKey(g) === gridKey(correctGrid); }),
                choices: options,
                shapeName: sr.name,
                hint: angle === 90 ? '顺时针转90°，每行变每列' : angle === 180 ? '转180°就是上下左右全翻' : '顺时针转270°等于逆时针转90°',
                emoji: '🎯'
            });
        }
        return qs;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       Phase 3: 旋转应用（生活应用题）
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function buildPhase3() {
        var all = [
            {
                text: '钟表上，分针从12走到3，绕表盘中心旋转了多少度？',
                answer: '90°',
                choices: ['45°', '90°', '180°', '360°'],
                hint: '钟面12格，每格30°，走3格就是90°',
                emoji: '🕐'
            },
            {
                text: '钟表上，时针从3走到9，绕表盘中心旋转了多少度？',
                answer: '180°',
                choices: ['90°', '120°', '180°', '270°'],
                hint: '从3到9走了6格，每格30°，6×30=180°',
                emoji: '⏰'
            },
            {
                text: '一个风车有4片叶片，每片叶片绕中心旋转多少度后能与下一片重合？',
                answer: '90°',
                choices: ['45°', '90°', '120°', '180°'],
                hint: '4片均匀分布，360°÷4=90°',
                emoji: '🌀'
            },
            {
                text: '一个等边三角形绕中心旋转多少度后能与自身重合？',
                answer: '120°',
                choices: ['60°', '90°', '120°', '360°'],
                hint: '等边三角形有3条对称轴，360°÷3=120°',
                emoji: '🔺'
            },
            {
                text: '汽车方向盘向右打半圈，方向盘旋转了多少度？',
                answer: '180°',
                choices: ['90°', '180°', '270°', '360°'],
                hint: '半圈就是180°',
                emoji: '🚗'
            },
            {
                text: '一个正五角星绕中心旋转多少度后能与自身重合？',
                answer: '72°',
                choices: ['36°', '72°', '144°', '180°'],
                hint: '五角星有5个角，360°÷5=72°',
                emoji: '⭐'
            },
            {
                text: '风车有3片叶片，每片叶片绕中心旋转多少度后能与下一片重合？',
                answer: '120°',
                choices: ['60°', '90°', '120°', '180°'],
                hint: '3片均匀分布，360°÷3=120°',
                emoji: '🌿'
            },
            {
                text: '钟表上，分针从6走到12，绕表盘中心旋转了多少度？',
                answer: '180°',
                choices: ['90°', '180°', '270°', '360°'],
                hint: '从6到12走了6格，每格30°，6×30=180°',
                emoji: '🕙'
            }
        ];
        return H.shuffle(all).slice(0, 4);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       游戏状态
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
    };

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       游戏主体
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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
                '<div class="rot-wrap">' +
                    '<div class="rot-header">' +
                        H.guideBarHTML('🌀', '旋转画图——绕点旋转图形！', 'rot-guide') +
                    '</div>' +
                    '<div class="rot-body" id="rot-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;

            // 阶段转换
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('旋转基础掌握得好！来识别旋转后的图形！', 'rot-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最后挑战：生活中的旋转！', 'rot-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('rot-body');
            var phaseLabels = { 1: '旋转基础', 2: '旋转判断', 3: '旋转应用' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'rot-guide');

            if (state.phase === 2) {
                this.renderPhase2Question(q, body);
            } else {
                this.renderTextQuestion(q, body);
            }
        },

        /** Phase 1 & 3 的文字选择题 */
        renderTextQuestion: function (q, body) {
            var choicesHTML = q.choices.map(function (c, i) {
                return '<button class="rot-choice-btn" data-idx="' + i + '">' + c + '</button>';
            }).join('');

            body.innerHTML =
                '<div class="rot-card">' +
                    '<div class="rot-card-emoji">' + q.emoji + '</div>' +
                    '<div class="rot-card-text">' + q.text + '</div>' +
                    (q.question ? '<div class="rot-card-question">' + q.question + '</div>' : '') +
                    '<div class="rot-card-hint">' + q.hint + '</div>' +
                    '<div class="rot-choices-wrap" id="rot-choices">' + choicesHTML + '</div>' +
                '</div>';

            var self = this;
            var buttons = body.querySelectorAll('.rot-choice-btn');
            buttons.forEach(function (btn) {
                btn.onclick = function () {
                    if (state.answered) return;
                    state.answered = true;
                    var idx = parseInt(btn.dataset.idx);

                    if (q.choices[idx] === q.answer) {
                        H.updateGuide('答对了！旋转高手！✅', 'rot-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        btn.classList.add('rot-correct');
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, btn);
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        // 高亮正确答案
                        buttons.forEach(function (b) {
                            if (q.choices[parseInt(b.dataset.idx)] === q.answer) {
                                b.classList.add('rot-correct');
                            }
                        });
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2000);
                    }
                };
            });
        },

        /** Phase 2 的网格选择题 */
        renderPhase2Question: function (q, body) {
            var origHTML = gridToHTML(q.original);
            var choicesHTML = q.choices.map(function (grid, i) {
                return '<div class="rot-grid-choice" data-idx="' + i + '">' +
                    '<div class="rot-grid-choice-label">' + String.fromCharCode(65 + i) + '</div>' +
                    gridToHTML(grid, 'rot-cell-sm') +
                '</div>';
            }).join('');

            body.innerHTML =
                '<div class="rot-card rot-card-wide">' +
                    '<div class="rot-card-emoji">' + q.emoji + '</div>' +
                    '<div class="rot-card-text">把下面的<b>' + q.shapeName + '</b>顺时针旋转 <b>' + q.angle + '°</b>，结果是哪个？</div>' +
                    '<div class="rot-original-label">原始图形</div>' +
                    origHTML +
                    '<div class="rot-arrow">⬇️ 旋转 ' + q.angle + '° ⬇️</div>' +
                    '<div class="rot-card-hint">' + q.hint + '</div>' +
                    '<div class="rot-grid-choices" id="rot-choices">' + choicesHTML + '</div>' +
                '</div>';

            var self = this;
            var cards = body.querySelectorAll('.rot-grid-choice');
            cards.forEach(function (card) {
                card.onclick = function () {
                    if (state.answered) return;
                    state.answered = true;
                    var idx = parseInt(card.dataset.idx);

                    if (idx === q.answerIdx) {
                        H.updateGuide('旋转判断准确！图形大师！✅', 'rot-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        card.classList.add('rot-grid-correct');
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '选错了，看看旋转后的位置！', card);
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        cards[q.answerIdx].classList.add('rot-grid-correct');
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2000);
                    }
                };
                card.onmouseenter = function () {
                    if (!state.answered) card.classList.add('rot-grid-hover');
                };
                card.onmouseleave = function () {
                    card.classList.remove('rot-grid-hover');
                };
            });
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了旋转的三要素和图形旋转！',
                NEXT_LEVEL
            );
        }
    };

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       CSS 样式
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function buildCSS() {
        return '' +
            /* 整体容器 */
            '.rot-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#c4b5fd 40%,#8b5cf6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.rot-header{position:relative;z-index:50;}' +
            '.rot-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:16px;' +
                'animation:rot-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes rot-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* 卡片 */
            '.rot-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #8b5cf6;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:rot-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:94%;' +
            '}' +
            '.rot-card-wide{max-width:640px;}' +
            '@keyframes rot-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.rot-card-emoji{font-size:46px;}' +
            '.rot-card-text{font-size:18px;color:#5b21b6;line-height:1.6;text-align:center;}' +
            '.rot-card-question{font-size:22px;font-weight:bold;color:#7c3aed;text-align:center;}' +
            '.rot-card-hint{font-size:14px;color:#8b5cf6;font-style:italic;}' +

            /* 文字选项 */
            '.rot-choices-wrap{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:500px;' +
            '}' +
            '.rot-choice-btn{' +
                'padding:14px 28px;background:white;border:3px solid #c4b5fd;' +
                'border-radius:16px;font-size:18px;font-weight:bold;color:#6d28d9;' +
                'cursor:pointer;transition:all 0.2s;' +
            '}' +
            '.rot-choice-btn:hover{' +
                'background:#8b5cf6;color:white;border-color:#8b5cf6;transform:scale(1.05);' +
            '}' +
            '.rot-choice-btn.rot-correct{' +
                'background:#10b981;border-color:#10b981;color:white;' +
            '}' +

            /* 网格 */
            '.rot-grid{display:flex;flex-direction:column;gap:2px;}' +
            '.rot-row{display:flex;gap:2px;justify-content:center;}' +
            '.rot-cell{' +
                'width:26px;height:26px;display:flex;align-items:center;justify-content:center;' +
                'font-size:16px;border-radius:4px;' +
            '}' +
            '.rot-cell-sm{' +
                'width:20px;height:20px;display:flex;align-items:center;justify-content:center;' +
                'font-size:12px;border-radius:3px;' +
            '}' +
            '.rot-fill{background:#8b5cf6;color:white;font-weight:bold;}' +
            '.rot-empty{background:#f3f4f6;color:#d1d5db;}' +

            /* Phase 2 网格选项 */
            '.rot-original-label{' +
                'font-size:14px;color:#7c3aed;font-weight:bold;margin-top:4px;' +
            '}' +
            '.rot-arrow{' +
                'font-size:16px;color:#8b5cf6;font-weight:bold;margin:4px 0;' +
            '}' +
            '.rot-grid-choices{' +
                'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;' +
                'width:100%;max-width:600px;margin-top:8px;' +
            '}' +
            '.rot-grid-choice{' +
                'background:white;border:3px solid #d1d5db;border-radius:16px;' +
                'padding:10px 14px;cursor:pointer;transition:all 0.2s;' +
                'display:flex;flex-direction:column;align-items:center;gap:6px;' +
            '}' +
            '.rot-grid-choice:hover,.rot-grid-hover{' +
                'border-color:#8b5cf6;transform:scale(1.06);' +
            '}' +
            '.rot-grid-choice-label{' +
                'font-size:16px;font-weight:bold;color:#6d28d9;' +
            '}' +
            '.rot-grid-correct{' +
                'border-color:#10b981;background:#d1fae5;' +
            '}' +
            '';
    }

    window.CurrentGameModule = game;
})();
