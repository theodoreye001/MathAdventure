/**
 * 一年级下册 第三单元：分类与整理
 * 路径: src/games/grade1/g1_d_u3_classify.js
 *
 * 统计侦探 - 两阶段玩法：
 *   Phase 1：将混合物品拖入对应的分类箱（水果 / 动物 / 图形）
 *   Phase 2：根据统计柱状图回答问题
 */

(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g1-d-u3-classify-styles';

    /* ==================== 数据定义 ==================== */

    var CATEGORIES = {
        fruit:  { id: 'fruit',  name: '水果', emoji: '🍎', color: '#ef4444', items: ['🍎', '🍊', '🍇', '🍌'] },
        animal: { id: 'animal', name: '动物', emoji: '🐶', color: '#3b82f6', items: ['🐶', '🐱', '🐰', '🐻'] },
        shape:  { id: 'shape',  name: '图形', emoji: '⬛', color: '#8b5cf6', items: ['⬛', '⬜', '🔺', '🔵'] }
    };

    /** 构建当前局的物品池（打乱顺序） */
    function buildPool() {
        var pool = [];
        ['fruit', 'animal', 'shape'].forEach(function (cat) {
            CATEGORIES[cat].items.forEach(function (emoji) {
                pool.push({ emoji: emoji, category: cat });
            });
        });
        return H.shuffle(pool);
    }

    /** 生成统计问题 */
    function buildQuestions(counts) {
        var maxKey = null, minKey = null, maxVal = -1, minVal = Infinity;
        var cats = ['fruit', 'animal', 'shape'];

        cats.forEach(function (k) {
            if (counts[k] > maxVal) { maxVal = counts[k]; maxKey = k; }
            if (counts[k] < minVal) { minVal = counts[k]; minKey = k; }
        });

        var questions = [
            {
                text: '哪一类物品最多？',
                options: cats.map(function (k) { return CATEGORIES[k].name; }),
                answer: cats.indexOf(maxKey)
            },
            {
                text: '哪一类物品最少？',
                options: cats.map(function (k) { return CATEGORIES[k].name; }),
                answer: cats.indexOf(minKey)
            },
            {
                text: '一共有多少种水果？',
                options: ['2 种', '3 种', '4 种', '5 种'],
                answer: 2
            }
        ];

        return H.shuffle(questions);
    }

    /* ==================== 内部状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        phase: 1,
        pool: [],
        sortedCounts: { fruit: 0, animal: 0, shape: 0 },
        totalSorted: 0,
        questions: [],
        currentQ: 0,
        mistakes: 0,
        isFinished: false
    };

    /* ==================== 主模块 ==================== */

    var game = {

        /* ---------- 生命周期 ---------- */

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            injectStyles();
            this.reset();
            this.render();
        },

        reset: function () {
            state.phase = 1;
            state.pool = buildPool();
            state.sortedCounts = { fruit: 0, animal: 0, shape: 0 };
            state.totalSorted = 0;
            state.questions = [];
            state.currentQ = 0;
            state.mistakes = 0;
            state.isFinished = false;
        },

        /* ---------- 渲染 ---------- */

        render: function () {
            var poolHTML = state.pool.map(function (item, i) {
                return '<div class="clf-item" draggable="true" data-idx="' + i + '" data-cat="' + item.category + '">' +
                           '<span class="clf-item-emoji">' + item.emoji + '</span>' +
                       '</div>';
            }).join('');

            var boxHTML = ['fruit', 'animal', 'shape'].map(function (key) {
                var cat = CATEGORIES[key];
                return '<div class="clf-box" data-cat="' + key + '">' +
                           '<div class="clf-box-content" id="clf-box-' + key + '"></div>' +
                           '<div class="clf-box-header" style="background:' + cat.color + '">' +
                               '<span class="clf-box-emoji">' + cat.emoji + '</span>' +
                               '<span>' + cat.name + '</span>' +
                           '</div>' +
                       '</div>';
            }).join('');

            state.container.innerHTML =
                '<div class="clf-game">' +
                    H.guideBarHTML('🔍', '统计侦探出动啦！', 'clf-guide-text') +

                    /* Phase 1 */
                    '<div id="clf-phase1" class="clf-phase1">' +
                        '<div class="clf-pool" id="clf-pool">' + poolHTML + '</div>' +
                        '<div class="clf-boxes">' + boxHTML + '</div>' +
                    '</div>' +

                    /* Phase 2 */
                    '<div id="clf-phase2" class="clf-phase2" style="display:none">' +
                        '<div class="clf-chart" id="clf-chart"></div>' +
                        '<div class="clf-question-area">' +
                            '<div class="clf-question-text" id="clf-q-text"></div>' +
                            '<div class="clf-choices" id="clf-choices"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            this.bindDragEvents();
        },

        /* ---------- Phase 1: 拖拽分类 ---------- */

        bindDragEvents: function () {
            var self = this;
            var pool = document.getElementById('clf-pool');

            // 拖拽源
            pool.querySelectorAll('.clf-item').forEach(function (el) {
                el.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', el.dataset.idx);
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(function () { el.classList.add('clf-dragging'); }, 0);
                });
                el.addEventListener('dragend', function () {
                    el.classList.remove('clf-dragging');
                });
            });

            // 放置目标
            state.container.querySelectorAll('.clf-box').forEach(function (box) {
                box.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    box.classList.add('clf-highlight');
                });
                box.addEventListener('dragleave', function () {
                    box.classList.remove('clf-highlight');
                });
                box.addEventListener('drop', function (e) {
                    e.preventDefault();
                    box.classList.remove('clf-highlight');
                    self.handleDrop(e, box);
                });
            });

            /* ---- Touch 拖拽支持（移动端） ---- */
            var touchItem = null;
            var touchClone = null;
            var touchIdx = -1;

            pool.querySelectorAll('.clf-item').forEach(function (el) {
                el.addEventListener('touchstart', function (e) {
                    e.preventDefault();
                    touchIdx = parseInt(el.dataset.idx, 10);
                    touchItem = el;
                    touchClone = el.cloneNode(true);
                    touchClone.classList.add('clf-touch-ghost');
                    document.body.appendChild(touchClone);
                    var t = e.touches[0];
                    touchClone.style.left = (t.clientX - 30) + 'px';
                    touchClone.style.top = (t.clientY - 30) + 'px';
                });
            });

            document.addEventListener('touchmove', function (e) {
                if (!touchClone) return;
                var t = e.touches[0];
                touchClone.style.left = (t.clientX - 30) + 'px';
                touchClone.style.top = (t.clientY - 30) + 'px';
                // 高亮当前覆盖的箱子
                state.container.querySelectorAll('.clf-box').forEach(function (b) {
                    var r = b.getBoundingClientRect();
                    b.classList.toggle('clf-highlight',
                        t.clientX >= r.left && t.clientX <= r.right &&
                        t.clientY >= r.top && t.clientY <= r.bottom);
                });
            }, { passive: false });

            document.addEventListener('touchend', function (e) {
                if (!touchClone || touchIdx < 0) return;
                var t = e.changedTouches[0];
                state.container.querySelectorAll('.clf-box').forEach(function (box) {
                    box.classList.remove('clf-highlight');
                    var r = box.getBoundingClientRect();
                    if (t.clientX >= r.left && t.clientX <= r.right &&
                        t.clientY >= r.top && t.clientY <= r.bottom) {
                        self.handleDropToCat(touchIdx, box.dataset.cat, touchItem);
                    }
                });
                touchClone.remove();
                touchClone = null;
                touchItem = null;
                touchIdx = -1;
            });
        },

        handleDrop: function (e, box) {
            var idx = parseInt(e.dataTransfer.getData('text/plain'), 10);
            var itemEl = document.querySelector('.clf-item[data-idx="' + idx + '"]');
            this.handleDropToCat(idx, box.dataset.cat, itemEl);
        },

        handleDropToCat: function (idx, targetCat, itemEl) {
            if (state.isFinished || state.phase !== 1) return;
            if (!itemEl || itemEl.classList.contains('clf-placed')) return;

            var itemData = state.pool[idx];

            if (itemData.category === targetCat) {
                // 正确
                itemEl.classList.add('clf-placed');
                itemEl.style.visibility = 'hidden';
                state.sortedCounts[targetCat]++;
                state.totalSorted++;

                // 在箱子里显示小图标
                var slot = document.getElementById('clf-box-' + targetCat);
                var mini = document.createElement('span');
                mini.className = 'clf-mini-item';
                mini.textContent = itemData.emoji;
                slot.appendChild(mini);

                H.updateGuide('clf-guide-text', '✅ 放对了！');
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
                }

                // 全部分完 → 进入 Phase 2
                if (state.totalSorted === state.pool.length) {
                    setTimeout(this.startPhase2.bind(this), 800);
                }
            } else {
                // 错误
                state.mistakes++;
                H.updateGuide('clf-guide-text', '❌ 这不是' + CATEGORIES[targetCat].name + '哦，再想想！');
                if (window.GameManager) {
                    window.GameManager.logError(
                        state.levelData.levelId,
                        itemData.category,
                        targetCat
                    );
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
                setTimeout(function () {
                    H.updateGuide('clf-guide-text', '🔍 继续把物品拖到正确的箱子里吧！');
                }, 1500);
            }
        },

        /* ---------- Phase 2: 读图答题 ---------- */

        startPhase2: function () {
            state.phase = 2;

            document.getElementById('clf-phase1').style.display = 'none';
            var phase2 = document.getElementById('clf-phase2');
            phase2.style.display = 'flex';

            this.renderChart();
            state.questions = buildQuestions(state.sortedCounts);
            state.currentQ = 0;
            this.showQuestion();
        },

        renderChart: function () {
            var cats = ['fruit', 'animal', 'shape'];
            var maxCount = 0;
            cats.forEach(function (k) {
                if (state.sortedCounts[k] > maxCount) maxCount = state.sortedCounts[k];
            });

            var chartHTML = '<div class="clf-chart-title">物品统计图</div><div class="clf-chart-bars">';
            cats.forEach(function (k) {
                var cat = CATEGORIES[k];
                var count = state.sortedCounts[k];
                var pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                chartHTML +=
                    '<div class="clf-chart-col">' +
                        '<div class="clf-chart-count">' + count + '</div>' +
                        '<div class="clf-chart-bar-wrap">' +
                            '<div class="clf-chart-bar" style="height:' + pct + '%;background:' + cat.color + '"></div>' +
                        '</div>' +
                        '<div class="clf-chart-label">' + cat.emoji + ' ' + cat.name + '</div>' +
                    '</div>';
            });
            chartHTML += '</div>';

            document.getElementById('clf-chart').innerHTML = chartHTML;
        },

        showQuestion: function () {
            if (state.currentQ >= state.questions.length) {
                this.finishGame();
                return;
            }

            var q = state.questions[state.currentQ];
            H.updateGuide('clf-guide-text', '📊 统计侦探：看图回答问题！');
            document.getElementById('clf-q-text').textContent = q.text;

            // 使用 H.renderChoices 但需要自定义颜色
            var choicesEl = document.getElementById('clf-choices');
            choicesEl.innerHTML = q.options.map(function (opt, i) {
                return '<button class="clf-choice-btn" data-idx="' + i + '">' + opt + '</button>';
            }).join('');

            var self = this;
            choicesEl.querySelectorAll('.clf-choice-btn').forEach(function (btn) {
                btn.addEventListener('mouseenter', function () {
                    btn.style.background = '#8b5cf6';
                    btn.style.color = 'white';
                });
                btn.addEventListener('mouseleave', function () {
                    btn.style.background = 'white';
                    btn.style.color = '#5b21b6';
                });
                btn.addEventListener('click', function () {
                    self.handleAnswer(parseInt(btn.dataset.idx, 10));
                });
            });
        },

        handleAnswer: function (idx) {
            if (state.isFinished) return;
            var q = state.questions[state.currentQ];

            if (idx === q.answer) {
                H.updateGuide('clf-guide-text', '✅ 答对了！');
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
                state.currentQ++;
                setTimeout(this.showQuestion.bind(this), 800);
            } else {
                state.mistakes++;
                H.updateGuide('clf-guide-text', '❌ 不对哦，再看看统计图！');
                if (window.GameManager) {
                    window.GameManager.logError(
                        state.levelData.levelId,
                        '统计问题',
                        q.options[idx]
                    );
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
                setTimeout(function () {
                    H.updateGuide('clf-guide-text', '📊 仔细看柱状图，哪根最高/最低？');
                }, 1500);
            }
        },

        /* ---------- 结算 ---------- */

        finishGame: function () {
            state.isFinished = true;
            H.showSettlement(
                state.container,
                state.levelData.reward || 15,
                state.levelData,
                state.mistakes,
                '你是统计小侦探！分类整理真有趣！',
                'lvl_1_d_4'
            );
        }
    };

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ---- 全局 ---- */
            .clf-game {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: linear-gradient(160deg, #fdf4ff 0%, #ede9fe 50%, #e0e7ff 100%);
                display: flex; flex-direction: column; align-items: center;
            }

            /* ---- Phase 1 ---- */
            .clf-phase1 {
                flex: 1; width: 100%; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 30px; padding: 80px 20px 20px;
            }

            /* 物品池 */
            .clf-pool {
                display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
                padding: 15px 20px; background: rgba(255,255,255,0.7);
                border-radius: 20px; border: 2px dashed #c4b5fd;
                min-height: 70px; max-width: 460px;
            }
            .clf-item {
                width: 62px; height: 62px;
                background: white; border-radius: 16px;
                display: flex; align-items: center; justify-content: center;
                cursor: grab; user-select: none;
                box-shadow: 0 4px 0 #e2e8f0;
                transition: transform 0.15s, box-shadow 0.15s;
                border: 2px solid #e9e5f5;
            }
            .clf-item:hover { transform: translateY(-3px); box-shadow: 0 7px 0 #e2e8f0; }
            .clf-item:active { cursor: grabbing; transform: scale(1.12) rotate(4deg); box-shadow: 0 2px 0 #e2e8f0; }
            .clf-item-emoji { font-size: 32px; line-height: 1; }
            .clf-item.clf-dragging { opacity: 0.4; }
            .clf-item.clf-placed { pointer-events: none; }

            /* Touch ghost */
            .clf-touch-ghost {
                position: fixed; z-index: 9999; pointer-events: none;
                width: 62px; height: 62px; opacity: 0.85; transform: scale(1.15);
                box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            }

            /* 分类箱 */
            .clf-boxes {
                display: flex; gap: 20px; justify-content: center; width: 100%;
            }
            .clf-box {
                width: 140px; min-height: 160px;
                background: rgba(255,255,255,0.5);
                border: 3px dashed #c4b5fd; border-radius: 20px;
                display: flex; flex-direction: column; justify-content: flex-end;
                align-items: center; padding-bottom: 0;
                transition: all 0.25s; position: relative; overflow: hidden;
            }
            .clf-box.clf-highlight {
                border-color: #fbbf24; background: rgba(251,191,36,0.12);
                transform: scale(1.06);
                box-shadow: 0 0 20px rgba(251,191,36,0.3);
            }
            .clf-box-header {
                width: 100%; padding: 8px 0;
                color: white; font-weight: bold; font-size: 18px;
                display: flex; align-items: center; justify-content: center; gap: 6px;
                border-radius: 0 0 17px 17px;
            }
            .clf-box-emoji { font-size: 22px; }
            .clf-box-content {
                display: flex; flex-wrap: wrap; gap: 3px; justify-content: center;
                padding: 6px 8px; min-height: 20px;
            }
            .clf-mini-item {
                font-size: 22px; animation: clf-pop 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
            }
            @keyframes clf-pop {
                0% { transform: scale(0); }
                100% { transform: scale(1); }
            }

            /* ---- Phase 2 ---- */
            .clf-phase2 {
                flex: 1; width: 100%; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 30px; padding: 80px 20px 20px;
            }

            /* 柱状图 */
            .clf-chart {
                background: white; border-radius: 24px; padding: 24px 32px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 2px solid #e9e5f5;
                min-width: 320px;
            }
            .clf-chart-title {
                font-size: 22px; font-weight: bold; color: #5b21b6;
                text-align: center; margin-bottom: 16px;
            }
            .clf-chart-bars {
                display: flex; gap: 28px; justify-content: center; align-items: flex-end;
                height: 160px; padding-bottom: 4px;
            }
            .clf-chart-col {
                display: flex; flex-direction: column; align-items: center; gap: 6px;
            }
            .clf-chart-count {
                font-size: 22px; font-weight: bold; color: #1e293b;
            }
            .clf-chart-bar-wrap {
                width: 52px; height: 120px;
                background: #f1f0f7; border-radius: 10px;
                display: flex; align-items: flex-end; overflow: hidden;
            }
            .clf-chart-bar {
                width: 100%; border-radius: 10px;
                transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                min-height: 4px;
            }
            .clf-chart-label {
                font-size: 16px; font-weight: bold; color: #64748b;
            }

            /* 问题区 */
            .clf-question-area {
                display: flex; flex-direction: column; align-items: center; gap: 16px;
                width: 100%; max-width: 420px;
            }
            .clf-question-text {
                font-size: 24px; font-weight: bold; color: #1e293b;
                text-align: center; background: white; padding: 14px 28px;
                border-radius: 16px; border: 3px solid #c4b5fd;
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }
            .clf-choices {
                display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
            }
            .clf-choice-btn {
                padding: 12px 30px; font-size: 22px; font-weight: bold;
                background: white; border: 3px solid #c4b5fd;
                border-radius: 18px; color: #5b21b6;
                cursor: pointer; transition: all 0.2s;
                box-shadow: 0 4px 0 #ddd6fe;
            }
            .clf-choice-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #ddd6fe; }
            .clf-choice-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #ddd6fe; }
        `);
    }

    /* ==================== 导出 ==================== */

    window.CurrentGameModule = game;
})();
