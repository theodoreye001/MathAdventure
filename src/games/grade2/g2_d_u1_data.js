/**
 * 二年级下册 第一单元：数据收集整理
 * 路径: src/games/grade2/g2_d_u1_data.js
 *
 * 统计侦探 - 两阶段玩法：
 *   Phase 1：观察场景中散落的混合物品，逐一清点每种类型的数量，
 *           用"正"字记录法填入统计表（每笔 = 1，满"正" = 5）
 *   Phase 2：根据完成的统计表回答问题（最多/最少、总数、差值比较）
 */

(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g2-d-u1-data-styles';

    /* ==================== 场景池 ==================== */

    var SCENES = [
        {
            title: '花园里的花',
            sprite: '🌺',
            types: [
                { name: '红玫瑰', emoji: '🌹', color: '#ef4444' },
                { name: '郁金香', emoji: '🌷', color: '#f59e0b' },
                { name: '向日葵', emoji: '🌻', color: '#eab308' },
                { name: '桃花',   emoji: '🌸', color: '#f472b6' }
            ]
        },
        {
            title: '文具盒里的文具',
            sprite: '📝',
            types: [
                { name: '铅笔', emoji: '✏️',  color: '#f59e0b' },
                { name: '橡皮', emoji: '🧹', color: '#ec4899' },
                { name: '尺子', emoji: '📐', color: '#3b82f6' },
                { name: '蜡笔', emoji: '🧸', color: '#8b5cf6' }
            ]
        },
        {
            title: '操场上的球',
            sprite: '⚽',
            types: [
                { name: '足球',   emoji: '⚽',    color: '#10b981' },
                { name: '篮球',   emoji: '🏀', color: '#f97316' },
                { name: '乒乓球', emoji: '🏓', color: '#ef4444' },
                { name: '羽毛球', emoji: '🥍', color: '#8b5cf6' }
            ]
        },
        {
            title: '水果摊上的水果',
            sprite: '🍎',
            types: [
                { name: '苹果', emoji: '🍎', color: '#ef4444' },
                { name: '香蕉', emoji: '🍌', color: '#eab308' },
                { name: '橘子', emoji: '🍊', color: '#f97316' },
                { name: '西瓜', emoji: '🍉', color: '#10b981' }
            ]
        },
        {
            title: '天空中的动物',
            sprite: '🐦',
            types: [
                { name: '小鸟', emoji: '🐦', color: '#3b82f6' },
                { name: '蝴蝶', emoji: '🦋', color: '#a855f7' },
                { name: '蜻蜓', emoji: '🦌', color: '#10b981' },
                { name: '蜜蜂', emoji: '🐝', color: '#f59e0b' }
            ]
        },
        {
            title: '超市里的饮料',
            sprite: '🧃',
            types: [
                { name: '牛奶', emoji: '🥛', color: '#e2e8f0' },
                { name: '果汁', emoji: '🍓', color: '#f97316' },
                { name: '可乐', emoji: '🥤', color: '#ef4444' },
                { name: '茶',   emoji: '🍵', color: '#10b981' }
            ]
        }
    ];

    /* ==================== 生成一局场景数据 ==================== */

    /**
     * 为每种类型生成随机数量（2~8 个），
     * 返回打乱后的散落物品列表 + 各类型计数。
     */
    function generateScene() {
        var scene = SCENES[H.randInt(0, SCENES.length - 1)];
        var counts = {};
        var pool = [];

        scene.types.forEach(function (t, i) {
            var n = H.randInt(2, 8);
            counts[i] = n;
            for (var j = 0; j < n; j++) {
                pool.push(i);
            }
        });

        return {
            scene: scene,
            counts: counts,
            pool: H.shuffle(pool)
        };
    }

    /* ==================== "正"字工具 ==================== */

    /** 笔画序列（横、竖、横、竖、横） */
    var STROKES = ['一', '丨', '一', '丨', '一'];

    /**
     * 将数字渲染为"正"字笔画 + 余数笔画
     * @param {number} n  总数
     * @returns {{ full: string, partial: string, display: string }}
     *   full    = 完整"正"字数（如 2 个"正"）
     *   partial = 剩余笔画（0~4 笔）
     *   display = 用于在表格中显示的 HTML
     */
    function renderZheng(n) {
        var full = Math.floor(n / 5);
        var rem = n % 5;
        var result = '';
        for (var i = 0; i < full; i++) {
            result += '<span class="dta-zheng">正</span>';
        }
        if (rem > 0) {
            var partial = '';
            for (var j = 0; j < rem; j++) {
                partial += STROKES[j];
            }
            result += '<span class="dta-zheng dta-partial">' + partial + '</span>';
        }
        if (n === 0) {
            result = '<span class="dta-zheng-dash">—</span>';
        }
        return { full: full, partial: rem, display: result, total: n };
    }

    /* ==================== 问题生成 ==================== */

    function buildQuestions(counts, scene) {
        var keys = Object.keys(counts).map(Number);
        var types = scene.types;
        var maxK = keys[0], minK = keys[0];
        var total = 0;

        keys.forEach(function (k) {
            total += counts[k];
            if (counts[k] > counts[maxK]) maxK = k;
            if (counts[k] < counts[minK]) minK = k;
        });

        // 用于生成"多几个"比较题的随机类型对
        function pickTwoDifferent() {
            var a = keys[H.randInt(0, keys.length - 1)];
            var b;
            do { b = keys[H.randInt(0, keys.length - 1)]; } while (b === a);
            if (a > b) { var tmp = a; a = b; b = tmp; }
            return [a, b];
        }

        var pool = [
            {
                text: '哪种' + (scene.types[0].emoji ? '' : '') + '最多？',
                type: 'choice',
                options: types.map(function (t) { return t.emoji + ' ' + t.name; }),
                answer: types[maxK].emoji + ' ' + types[maxK].name
            },
            {
                text: '哪种最少？',
                type: 'choice',
                options: types.map(function (t) { return t.emoji + ' ' + t.name; }),
                answer: types[minK].emoji + ' ' + types[minK].name
            },
            {
                text: '一共有多少个？',
                type: 'choice',
                options: [total - 2, total - 1, total, total + 1].map(String),
                answer: String(total)
            }
        ];

        // 加 2 道差值比较题（确保差值 > 0）
        var diffAttempts = 0;
        while (pool.length < 5 && diffAttempts < 20) {
            diffAttempts++;
            var pair = pickTwoDifferent();
            var a = pair[0], b = pair[1];
            var diff = Math.abs(counts[a] - counts[b]);
            if (diff === 0) continue;

            var diffOpts = [diff - 1, diff, diff + 1, diff + 2]
                .filter(function (v) { return v >= 0; })
                .map(String);

            // 确保 4 个选项不重复
            var optSet = {};
            var cleanOpts = [];
            diffOpts.forEach(function (v) {
                if (!optSet[v]) { optSet[v] = true; cleanOpts.push(v); }
            });
            while (cleanOpts.length < 4) {
                var fake = String(diff + H.randInt(3, 8));
                if (!optSet[fake]) { optSet[fake] = true; cleanOpts.push(fake); }
            }

            pool.push({
                text: types[a].emoji + types[a].name + ' 比 ' +
                      types[b].emoji + types[b].name + ' 多几个？',
                type: 'choice',
                options: cleanOpts.slice(0, 4),
                answer: String(diff)
            });
        }

        return H.shuffle(pool).slice(0, 4);
    }

    /* ==================== 内部状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,       // 1=清点记录, 2=答题
        scene: null,
        counts: {},
        pool: [],
        sortedCounts: {}, // Phase 1 实时计数
        placedCount: 0,
        questions: [],
        currentQ: 0
    };

    /* ==================== 主模块 ==================== */

    var game = {

        /* ---------- 生命周期 ---------- */

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 20, knowledgePoint: '数据收集整理', levelId: 'lvl_2_d_2' };
            if (!state.container) return;

            injectStyles();
            this.startNewRound();
        },

        startNewRound: function () {
            var data = generateScene();
            state.scene = data.scene;
            state.counts = data.counts;
            state.pool = data.pool;
            state.mistakes = 0;
            state.phase = 1;
            state.placedCount = 0;
            state.currentQ = 0;
            state.sortedCounts = {};

            // 初始化各类型的计数为 0
            data.scene.types.forEach(function (t, i) {
                state.sortedCounts[i] = 0;
            });

            this.render();
        },

        /* ---------- 渲染入口 ---------- */

        render: function () {
            var scene = state.scene;
            state.container.innerHTML =
                '<div class="dta-game">' +
                    H.guideBarHTML(
                        scene.sprite,
                        '统计侦探出动！数一数 ' + scene.title + ' 里每种有几个，填好统计表吧！',
                        'dta-guide-text'
                    ) +
                    '<div id="dta-phase1" class="dta-phase"></div>' +
                    '<div id="dta-phase2" class="dta-phase" style="display:none;"></div>' +
                '</div>';

            this.renderPhase1();
        },

        /* ======== Phase 1：清点记录 ======== */

        renderPhase1: function () {
            state.phase = 1;
            var scene = state.scene;
            var totalItems = state.pool.length;

            // 散落物品区
            var itemsHTML = state.pool.map(function (typeIdx, i) {
                var t = scene.types[typeIdx];
                return '<span class="dta-item" data-idx="' + i + '" data-type="' + typeIdx + '">' +
                           t.emoji +
                       '</span>';
            }).join('');

            // 统计表头
            var headerRow = '<tr><th class="dta-th">类型</th>';
            scene.types.forEach(function (t, i) {
                headerRow += '<th class="dta-th" style="color:' + t.color + '">' +
                                 t.emoji + ' ' + t.name +
                             '</th>';
            });
            headerRow += '<th class="dta-th dta-th-total">合计</th></tr>';

            // "正"字行
            var zhengRow = '<tr><td class="dta-td-label">正字</td>';
            scene.types.forEach(function (t, i) {
                zhengRow += '<td class="dta-td" id="dta-zheng-' + i + '"><span class="dta-zheng-empty">—</span></td>';
            });
            zhengRow += '<td class="dta-td" id="dta-zheng-total">—</td></tr>';

            // 数字行
            var numRow = '<tr><td class="dta-td-label">数量</td>';
            scene.types.forEach(function (t, i) {
                numRow += '<td class="dta-td dta-num-cell" id="dta-num-' + i + '">0</td>';
            });
            numRow += '<td class="dta-td dta-num-cell" id="dta-num-total">0</td></tr>';

            var phase1 = document.getElementById('dta-phase1');
            phase1.style.display = '';
            phase1.innerHTML =
                '<div class="dta-content">' +
                    '<div class="dta-scene-box" id="dta-scene">' +
                        '<div class="dta-scene-title">' + scene.sprite + ' ' + scene.title + '</div>' +
                        '<div class="dta-items-area" id="dta-items-area">' + itemsHTML + '</div>' +
                        '<div class="dta-hint">点击每个物品进行清点，用"正"字记录数量</div>' +
                    '</div>' +
                    '<div class="dta-tally-wrap">' +
                        '<div class="dta-tally-title">统计表</div>' +
                        '<table class="dta-table">' +
                            '<thead>' + headerRow + '</thead>' +
                            '<tbody>' +
                                zhengRow +
                                numRow +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                '</div>';

            this.bindPhase1Clicks();
        },

        bindPhase1Clicks: function () {
            var self = this;
            var area = document.getElementById('dta-items-area');
            if (!area) return;

            area.querySelectorAll('.dta-item').forEach(function (el) {
                el.addEventListener('click', function () {
                    if (el.classList.contains('dta-counted')) return;
                    self.onItemClick(el);
                });
            });
        },

        onItemClick: function (el) {
            if (state.phase !== 1) return;
            var typeIdx = parseInt(el.dataset.type, 10);
            var idx = parseInt(el.dataset.idx, 10);

            // 标记已计数
            el.classList.add('dta-counted');

            // 更新计数
            state.sortedCounts[typeIdx]++;
            state.placedCount++;

            // 计算总计
            var total = 0;
            var keys = Object.keys(state.sortedCounts).map(Number);
            keys.forEach(function (k) { total += state.sortedCounts[k]; });

            // 更新"正"字显示
            var zhengResult = renderZheng(state.sortedCounts[typeIdx]);
            var cell = document.getElementById('dta-zheng-' + typeIdx);
            if (cell) cell.innerHTML = zhengResult.display;

            var totalZheng = renderZheng(total);
            var totalCell = document.getElementById('dta-zheng-total');
            if (totalCell) totalCell.innerHTML = totalZheng.display;

            // 更新数字
            var numCell = document.getElementById('dta-num-' + typeIdx);
            if (numCell) numCell.textContent = state.sortedCounts[typeIdx];

            var numTotal = document.getElementById('dta-num-total');
            if (numTotal) numTotal.textContent = total;

            // 动画
            el.classList.add('dta-counted');

            // 引导文本
            var scene = state.scene;
            var typeName = scene.types[typeIdx].name;
            var count = state.sortedCounts[typeIdx];
            var rem = count % 5;

            if (count % 5 === 0 && count > 0) {
                H.updateGuide(
                    'dta-guide-text',
                    '太棒了！' + scene.types[typeIdx].emoji + typeName +
                    ' 凑满一个"正"字了！（' + count + ' 个）'
                );
            } else {
                H.updateGuide(
                    'dta-guide-text',
                    scene.types[typeIdx].emoji + typeName + '：' + count + ' 个' +
                    (rem > 0 ? '（再数 ' + (5 - rem) + ' 个就凑满一个"正"了）' : '')
                );
            }

            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 3);
            }

            // 全部数完 → 进入 Phase 2
            if (state.placedCount === state.pool.length) {
                setTimeout(function () {
                    H.updateGuide('dta-guide-text', '全部数完啦！根据统计表回答问题吧！');
                }, 500);
                setTimeout(function () { game.startPhase2(); }, 1500);
            }
        },

        /* ======== Phase 2：答题 ======== */

        startPhase2: function () {
            state.phase = 2;
            document.getElementById('dta-phase1').style.display = 'none';

            state.questions = buildQuestions(state.sortedCounts, state.scene);
            state.currentQ = 0;

            var phase2 = document.getElementById('dta-phase2');
            phase2.style.display = '';

            this.renderPhase2Header();
            this.showQuestion();
        },

        renderPhase2Header: function () {
            var scene = state.scene;

            // 统计表快照（Phase 2 顶部保留只读版）
            var headerRow = '<tr><th class="dta-th">类型</th>';
            scene.types.forEach(function (t) {
                headerRow += '<th class="dta-th" style="color:' + t.color + '">' +
                                 t.emoji + ' ' + t.name +
                             '</th>';
            });
            headerRow += '<th class="dta-th dta-th-total">合计</th></tr>';

            var zhengRow = '<tr><td class="dta-td-label">正字</td>';
            var total = 0;
            scene.types.forEach(function (t, i) {
                total += state.sortedCounts[i];
                var zheng = renderZheng(state.sortedCounts[i]);
                zhengRow += '<td class="dta-td">' + zheng.display + '</td>';
            });
            zhengRow += '<td class="dta-td">' + renderZheng(total).display + '</td></tr>';

            var numRow = '<tr><td class="dta-td-label">数量</td>';
            scene.types.forEach(function (t, i) {
                numRow += '<td class="dta-td dta-num-cell">' + state.sortedCounts[i] + '</td>';
            });
            numRow += '<td class="dta-td dta-num-cell">' + total + '</td></tr>';

            var phase2 = document.getElementById('dta-phase2');
            phase2.innerHTML =
                '<div class="dta-content">' +
                    '<div class="dta-tally-wrap dta-tally-ro">' +
                        '<div class="dta-tally-title">' + scene.sprite + ' 统计结果</div>' +
                        '<table class="dta-table">' +
                            '<thead>' + headerRow + '</thead>' +
                            '<tbody>' + zhengRow + numRow + '</tbody>' +
                        '</table>' +
                    '</div>' +
                    '<div class="dta-question-area">' +
                        '<div class="dta-q-counter" id="dta-q-counter"></div>' +
                        '<div class="dta-q-text" id="dta-q-text"></div>' +
                        '<div class="dta-choices" id="dta-choices"></div>' +
                    '</div>' +
                '</div>';
        },

        showQuestion: function () {
            if (state.currentQ >= state.questions.length) {
                this.finishGame();
                return;
            }

            var q = state.questions[state.currentQ];
            var total = state.questions.length;

            H.updateGuide('dta-guide-text', '📊 根据统计表，回答问题吧！');

            var counter = document.getElementById('dta-q-counter');
            if (counter) counter.textContent = '第 ' + (state.currentQ + 1) + ' / ' + total + ' 题';

            var qText = document.getElementById('dta-q-text');
            if (qText) qText.textContent = q.text;

            H.renderChoices(q.options, 'dta-choices', function (i, text) {
                game.onAnswer(text, q);
            });
        },

        onAnswer: function (chosen, q) {
            if (state.phase !== 2) return;

            if (chosen === q.answer) {
                H.updateGuide('dta-guide-text', '✅ 答对了！' + q.text.replace('？', '') + ' —— ' + q.answer);
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
                state.currentQ++;
                setTimeout(function () { game.showQuestion(); }, 1200);
            } else {
                state.mistakes++;
                H.triggerError(
                    state.container,
                    '再想想，看看统计表里的"正"字和数字！',
                    document.querySelector('.dta-choices')
                );
                if (window.GameManager) {
                    window.GameManager.logError(
                        state.levelData.levelId,
                        '统计答题: ' + q.text,
                        chosen,
                        q.answer
                    );
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }
        },

        /* ======== 结算 ======== */

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                '你是统计侦探！"正"字记录法真好用，数据收集整理小能手！',
                'lvl_2_d_2'
            );
        }
    };

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ---- 全局容器 ---- */
            .dta-game {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: linear-gradient(150deg, #ecfdf5 0%, #d1fae5 40%, #e0f2fe 100%);
                display: flex; flex-direction: column; align-items: center;
                padding-top: 80px;
            }

            /* ---- Phase 容器 ---- */
            .dta-phase {
                width: 100%; flex: 1;
                display: flex; flex-direction: column; align-items: center;
                justify-content: flex-start; gap: 18px;
                padding: 10px 16px 20px; overflow-y: auto;
            }

            .dta-content {
                display: flex; flex-direction: column; align-items: center;
                gap: 18px; width: 100%; max-width: 560px;
            }

            /* ==================== Phase 1：场景物品区 ==================== */
            .dta-scene-box {
                background: rgba(255,255,255,0.92); padding: 18px 22px;
                border-radius: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                border: 3px solid #a7f3d0; width: 100%; text-align: center;
            }
            .dta-scene-title {
                font-size: 22px; font-weight: bold; color: #065f46;
                margin-bottom: 12px;
            }
            .dta-items-area {
                display: flex; flex-wrap: wrap; gap: 10px;
                justify-content: center; min-height: 60px;
                padding: 10px; background: #f0fdf4; border-radius: 16px;
            }
            .dta-item {
                width: 56px; height: 56px; font-size: 30px;
                display: flex; align-items: center; justify-content: center;
                background: white; border-radius: 14px;
                border: 2px solid #d1fae5; cursor: pointer;
                box-shadow: 0 3px 0 #e2e8f0;
                transition: all 0.2s;
                user-select: none;
            }
            .dta-item:hover {
                transform: translateY(-3px) scale(1.08);
                box-shadow: 0 6px 0 #d1fae5;
                border-color: #10b981;
            }
            .dta-item:active {
                transform: translateY(1px) scale(0.95);
            }
            .dta-item.dta-counted {
                opacity: 0.25; pointer-events: none;
                border-color: #d1fae5; background: #f0fdf4;
                box-shadow: none;
            }
            .dta-hint {
                font-size: 14px; color: #6b7280; margin-top: 8px;
            }

            /* ==================== 统计表 ==================== */
            .dta-tally-wrap {
                background: rgba(255,255,255,0.92); padding: 16px 20px;
                border-radius: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.05);
                border: 2px solid #c4b5fd; width: 100%;
            }
            .dta-tally-ro {
                border-color: #93c5fd;
            }
            .dta-tally-title {
                font-size: 18px; font-weight: bold; color: #5b21b6;
                text-align: center; margin-bottom: 10px;
            }
            .dta-table {
                width: 100%; border-collapse: collapse; table-layout: fixed;
            }
            .dta-th {
                padding: 8px 6px; font-size: 14px; font-weight: bold;
                border-bottom: 2px solid #e5e7eb; text-align: center;
                white-space: nowrap;
            }
            .dta-th-total {
                color: #10b981;
            }
            .dta-td {
                padding: 8px 6px; text-align: center;
                border-bottom: 1px solid #f3f4f6;
                vertical-align: middle;
            }
            .dta-td-label {
                padding: 8px 6px; font-size: 13px; font-weight: bold;
                color: #6b7280; text-align: left;
                border-bottom: 1px solid #f3f4f6;
            }
            .dta-num-cell {
                font-size: 20px; font-weight: bold; color: #1e293b;
            }

            /* "正"字渲染 */
            .dta-zheng {
                display: inline-block;
                font-size: 22px; font-weight: bold; color: #7c3aed;
                margin: 0 2px; line-height: 1.2;
                letter-spacing: 2px;
                animation: dta-zheng-pop 0.3s ease-out;
            }
            .dta-zheng.dta-partial {
                color: #f59e0b; opacity: 0.85;
            }
            .dta-zheng-dash {
                color: #d1d5db; font-size: 18px;
            }
            .dta-zheng-empty {
                color: #d1d5db; font-size: 16px;
            }

            @keyframes dta-zheng-pop {
                0%  { transform: scale(1.4); opacity: 0.5; }
                100%{ transform: scale(1);   opacity: 1; }
            }

            /* ==================== Phase 2：问答区 ==================== */
            .dta-question-area {
                display: flex; flex-direction: column; align-items: center;
                gap: 14px; width: 100%;
            }
            .dta-q-counter {
                font-size: 15px; font-weight: bold; color: #6b7280;
            }
            .dta-q-text {
                font-size: 24px; font-weight: bold; color: #1e293b;
                text-align: center; background: white; padding: 16px 28px;
                border-radius: 18px; border: 3px solid #a78bfa;
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                width: 100%; box-sizing: border-box;
            }
            .dta-choices {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 12px; width: 100%;
            }

            /* ==================== 动画 ==================== */
            @keyframes dta-bounce {
                0%  { transform: scale(0.85); opacity: 0; }
                60% { transform: scale(1.05); opacity: 1; }
                100%{ transform: scale(1); }
            }
            .dta-scene-box, .dta-tally-wrap, .dta-q-text {
                animation: dta-bounce 0.4s ease-out;
            }

            @keyframes dta-shake {
                10%, 90% { transform: translateX(-1px); }
                20%, 80% { transform: translateX(2px); }
                30%, 50%, 70%{ transform: translateX(-4px); }
                40%, 60% { transform: translateX(4px); }
            }
            .dta-shake { animation: dta-shake 0.4s ease; }

            /* ---- 响应式 ---- */
            @media (max-width: 480px) {
                .dta-items-area { gap: 7px; }
                .dta-item { width: 46px; height: 46px; font-size: 24px; }
                .dta-th, .dta-td { padding: 6px 3px; font-size: 12px; }
                .dta-zheng { font-size: 18px; }
                .dta-num-cell { font-size: 16px; }
                .dta-q-text { font-size: 20px; padding: 12px 18px; }
                .dta-choices { grid-template-columns: 1fr; gap: 10px; }
            }
        `);
    }

    /* ==================== 导出 ==================== */

    window.CurrentGameModule = game;
})();
