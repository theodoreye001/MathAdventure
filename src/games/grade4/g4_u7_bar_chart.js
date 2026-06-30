/**
 * 四年级上册 第七单元：条形统计图
 * 路径: src/games/grade4/g4_u7_bar_chart.js
 *
 * 玩法："数据绘图"
 *   Phase 1 "读图": 根据条形统计图回答问题。4轮。
 *   Phase 2 "填数据": 根据数据选择正确的条形高度。4轮。
 *   Phase 3 "分析比较": 分析数据进行比较和计算。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u7-bar-chart-styles';
    const NEXT_LEVEL = 'lvl_4_8_1';

    var COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

    /** 生成条形统计图 SVG */
    function barChartSVG(labels, values, maxVal, chartTitle) {
        var barW = 40;
        var gap = 20;
        var chartH = 150;
        var chartW = labels.length * (barW + gap) + 40;
        var svgH = chartH + 50;
        var baseY = chartH + 10;

        var svg = '<svg width="' + chartW + '" height="' + svgH + '" viewBox="0 0 ' + chartW + ' ' + svgH + '">';
        svg += '<text x="' + (chartW / 2) + '" y="16" text-anchor="middle" font-size="14" font-weight="bold" fill="#374151">' + chartTitle + '</text>';

        // Y轴
        svg += '<line x1="35" y1="25" x2="35" y2="' + baseY + '" stroke="#d1d5db" stroke-width="2"/>';
        // X轴
        svg += '<line x1="35" y1="' + baseY + '" x2="' + (chartW - 5) + '" y2="' + baseY + '" stroke="#d1d5db" stroke-width="2"/>';

        // 刻度线
        for (var i = 0; i <= 4; i++) {
            var tickY = baseY - (i / 4) * chartH;
            var tickVal = Math.round((i / 4) * maxVal);
            svg += '<line x1="30" y1="' + tickY + '" x2="35" y2="' + tickY + '" stroke="#d1d5db" stroke-width="1"/>';
            svg += '<text x="28" y="' + (tickY + 4) + '" text-anchor="end" font-size="12" font-weight="bold" fill="#64748b">' + tickVal + '</text>';
            svg += '<line x1="35" y1="' + tickY + '" x2="' + (chartW - 5) + '" y2="' + tickY + '" stroke="#f3f4f6" stroke-width="1"/>';
        }

        for (var j = 0; j < labels.length; j++) {
            var x = 45 + j * (barW + gap);
            var barH = (values[j] / maxVal) * chartH;
            var y = baseY - barH;
            svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="' + COLORS[j % COLORS.length] + '" opacity="0.85"/>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">' + values[j] + '</text>';
            svg += '<text x="' + (x + barW / 2) + '" y="' + (baseY + 18) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">' + labels[j] + '</text>';
        }

        svg += '</svg>';
        return svg;
    }

    /* ── Phase 1: 读图 ── */
    function buildPhase1() {
        var qs = [];
        var datasets = [
            { labels: ['语文', '数学', '英语', '科学'], values: [85, 92, 78, 88], title: '各科成绩' },
            { labels: ['周一', '周二', '周三', '周四', '周五'], values: [12, 18, 15, 22, 20], title: '每天借书量' },
            { labels: ['苹果', '香蕉', '橘子', '葡萄'], values: [45, 30, 38, 25], title: '水果销量（千克）' },
            { labels: ['晴天', '多云', '雨天', '雪天'], values: [15, 10, 6, 2], title: '天气统计（天）' }
        ];

        datasets = H.shuffle(datasets);
        for (var i = 0; i < 4; i++) {
            var ds = datasets[i];
            var maxVal = Math.max.apply(null, ds.values) * 1.2;
            var total = ds.values.reduce(function (a, b) { return a + b; }, 0);
            var maxIdx = ds.values.indexOf(Math.max.apply(null, ds.values));
            var minIdx = ds.values.indexOf(Math.min.apply(null, ds.values));

            var questions = [
                {
                    svg: barChartSVG(ds.labels, ds.values, maxVal, ds.title),
                    text: ds.labels[maxIdx] + '的数量最多，是（    ）',
                    answer: String(ds.values[maxIdx]),
                    choices: genChartChoices(ds.values[maxIdx], ds.values)
                },
                {
                    svg: barChartSVG(ds.labels, ds.values, maxVal, ds.title),
                    text: ds.labels[minIdx] + '的数量最少，是（    ）',
                    answer: String(ds.values[minIdx]),
                    choices: genChartChoices(ds.values[minIdx], ds.values)
                },
                {
                    svg: barChartSVG(ds.labels, ds.values, maxVal, ds.title),
                    text: '所有项目总共是（    ）',
                    answer: String(total),
                    choices: genChartChoices(total, ds.values)
                },
                {
                    svg: barChartSVG(ds.labels, ds.values, maxVal, ds.title),
                    text: ds.labels[0] + '和' + ds.labels[1] + '相差（    ）',
                    answer: String(Math.abs(ds.values[0] - ds.values[1])),
                    choices: genChartChoices(Math.abs(ds.values[0] - ds.values[1]), ds.values)
                }
            ];
            qs.push(questions[i]);
        }
        return H.shuffle(qs);
    }

    function genChartChoices(correct, allVals) {
        var set = new Set();
        set.add(String(correct));
        // 优先用数据集中已有的值
        var candidates = [];
        allVals.forEach(function (v) {
            if (v !== correct) candidates.push(v);
        });
        candidates.push(correct + 5, correct - 5, correct + 10, correct + 3);
        while (set.size < 4) {
            var v = candidates[H.randInt(0, candidates.length - 1)];
            if (v > 0 && v !== correct) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 填数据 ── */
    function buildPhase2() {
        var qs = [];
        var items = [
            { labels: ['唱歌', '跳舞', '画画', '运动'], title: '兴趣班人数', hint: '唱歌15人，跳舞20人，画画10人，运动25人', qIdx: 2, answer: '10', choices: ['8', '10', '12', '15'] },
            { labels: ['红花', '黄花', '蓝花', '白花'], title: '花园花朵数', hint: '红花30朵，黄花25朵，蓝花20朵，白花15朵', qIdx: 1, answer: '25', choices: ['20', '25', '30', '35'] },
            { labels: ['1班', '2班', '3班', '4班'], title: '各班人数', hint: '1班42人，2班45人，3班38人，4班40人', qIdx: 2, answer: '38', choices: ['35', '38', '42', '45'] },
            { labels: ['鸡', '鸭', '鹅', '兔'], title: '农场动物', hint: '鸡35只，鸭28只，鹅18只，兔22只', qIdx: 0, answer: '35', choices: ['28', '30', '35', '40'] }
        ];
        items = H.shuffle(items);
        for (var i = 0; i < 4; i++) {
            var item = items[i];
            qs.push({
                text: '根据提示：' + item.hint + '。' + item.labels[item.qIdx] + '是（    ）',
                answer: item.answer,
                choices: H.shuffle(item.choices)
            });
        }
        return qs;
    }

    /* ── Phase 3: 分析比较 ── */
    function buildPhase3() {
        var qs = [];
        var items = [
            { text: '小明语文85分，数学92分，英语78分。三科平均分是多少分？', answer: '85', choices: ['83', '85', '87', '90'] },
            { text: '周一到周五的气温分别是20、22、19、25、23度，最高气温比最低高几度？', answer: '6', choices: ['4', '5', '6', '7'] },
            { text: '四个班各有42、45、38、40人，全校这四个班共多少人？', answer: '165', choices: ['155', '160', '165', '170'] },
            { text: '甲有15本课外书，乙有20本，丙有18本，三人平均有几本？', answer: '17.7', choices: ['16.7', '17', '17.7', '18'] },
            { text: '周一至周五借书量分别是12、18、15、22、20本，平均每天借多少本？', answer: '17.4', choices: ['16.4', '17', '17.4', '18'] },
            { text: '统计图中，A是45，B是38，C是52，D是41。最多比最少多多少？', answer: '14', choices: ['12', '13', '14', '15'] }
        ];
        return H.shuffle(items).slice(0, 4);
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
                '<div class="brc-wrap">' +
                    '<div class="brc-header">' +
                        H.guideBarHTML('📊', '数据绘图——学会读条形统计图！', 'brc-guide') +
                    '</div>' +
                    '<div class="brc-body" id="brc-body"></div>' +
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
                    H.updateGuide('读图没问题！来填数据！', 'brc-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('数据填得好！最后一关：分析比较！', 'brc-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('brc-body');
            var phaseLabels = { 1: '读图挑战', 2: '填数据', 3: '分析比较' };
            var phaseEmojis = { 1: '📊', 2: '📝', 3: '🧮' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'brc-guide');

            var svgHTML = q.svg ? '<div class="brc-chart">' + q.svg + '</div>' : '';

            body.innerHTML =
                '<div class="brc-card">' +
                    '<div class="brc-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    svgHTML +
                    '<div class="brc-card-text">' + q.text + '</div>' +
                    '<div class="brc-card-choices" id="brc-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'brc-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('数据分析能力真强！✅', 'brc-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#brc-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#brc-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#brc-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你学会了读条形统计图和分析数据！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.brc-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0f2fe 0%,#bae6fd 40%,#38bdf8 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.brc-header{position:relative;z-index:50;}' +
            '.brc-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:15px;gap:15px;' +
                'animation:brc-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes brc-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.brc-card{' +
                'background:white;border-radius:30px;padding:25px 30px 22px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #0ea5e9;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:brc-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:600px;width:94%;' +
            '}' +
            '@keyframes brc-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.brc-card-emoji{font-size:42px;}' +

            '.brc-chart{' +
                'overflow-x:auto;width:100%;display:flex;justify-content:center;' +
            '}' +

            '.brc-card-text{' +
                'font-size:20px;font-weight:bold;color:#0c4a6e;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.brc-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
