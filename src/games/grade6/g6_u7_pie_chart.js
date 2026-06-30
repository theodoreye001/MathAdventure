/**
 * 六年级上册 第七单元：扇形统计图
 * 路径: src/games/grade6/g6_u7_pie_chart.js
 *
 * 玩法："饼图解读"
 *   Phase 1 "读懂扇形图": 从扇形图中读取信息。4轮。
 *   Phase 2 "计算占比": 根据数据计算扇形图各项百分比。4轮。
 *   Phase 3 "选择统计图": 选择合适的统计图类型。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u7-pie-chart-styles';
    const NEXT_LEVEL = 'lvl_6_8_1';

    /* ── 数学工具 ── */
    function round2(n) { return Math.round(n * 100) / 100; }

    /* ── 数据生成 ── */

    function genPieData() {
        var categories = [
            ['语文📚', '数学📐', '英语📖', '体育⚽'],
            ['苹果🍎', '香蕉🍌', '橘子🍊', '葡萄🍇'],
            ['步行🚶', '骑车🚲', '坐车🚌', '其他🏃'],
            ['篮球🏀', '足球⚽', '游泳🏊', '跑步🏃'],
            ['红❤️', '蓝💙', '绿💚', '黄💛']
        ];
        var catSet = categories[H.randInt(0, categories.length - 1)];
        var vals = [];
        var total = H.randInt(40, 100);
        var remaining = total;
        for (var i = 0; i < 3; i++) {
            var v = H.randInt(1, remaining - (3 - i));
            vals.push(v);
            remaining -= v;
        }
        vals.push(remaining);

        var items = [];
        for (var j = 0; j < 4; j++) {
            items.push({
                name: catSet[j],
                value: vals[j],
                percent: Math.round(vals[j] / total * 100)
            });
        }

        return { items: items, total: total };
    }

    /* ── Phase 1: 读懂扇形图 ── */

    function genReadQ() {
        var data = genPieData();
        var type = H.randInt(0, 2);
        if (type === 0) {
            // 哪项最多
            var maxItem = data.items.reduce(function (a, b) { return a.value > b.value ? a : b; });
            var minItem = data.items.reduce(function (a, b) { return a.value < b.value ? a : b; });
            var answer = maxItem.name;
            var text = data.items.map(function (it) { return it.name + ':' + it.value + '人'; }).join('，') +
                '\n\n哪个项目的人数最多？';
            var choices = H.shuffle(data.items.map(function (it) { return it.name; }));
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '比较各项的数值大小' };
        } else if (type === 1) {
            // 某项占比
            var pickItem = data.items[H.randInt(0, data.items.length - 1)];
            var answer2 = pickItem.percent + '%';
            var text2 = '总人数' + data.total + '人，' + pickItem.name + '有' + pickItem.value + '人\n' + pickItem.name + '占百分之几？';
            var choices2 = genPercentChoices(pickItem.percent);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '百分比 = 部分 ÷ 总数 × 100%' };
        } else {
            // 某项具体人数
            var pickItem2 = data.items[H.randInt(0, data.items.length - 1)];
            var answer3 = '' + pickItem2.value + '人';
            var text3 = '总人数' + data.total + '人，' + pickItem2.name + '占' + pickItem2.percent + '%\n' + pickItem2.name + '有多少人？';
            var choices3 = genCountChoices(pickItem2.value, data.total);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '人数 = 总数 × 百分比' };
        }
    }

    function genPercentChoices(correctPct) {
        var correctStr = correctPct + '%';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var fake = (correctPct + H.randInt(-15, 15)) + '%';
            if (fake !== correctStr && parseInt(fake) > 0 && parseInt(fake) <= 100) set.add(fake);
        }
        var fb = 5;
        while (set.size < 4) {
            fake = fb + '%';
            if (fake !== correctStr) set.add(fake);
            fb += 10;
            if (fb > 100) break;
        }
        return H.shuffle(Array.from(set));
    }

    function genCountChoices(correctVal, total) {
        var correctStr = correctVal + '人';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var fake = (correctVal + H.randInt(-10, 10)) + '人';
            if (fake !== correctStr && parseInt(fake) > 0 && parseInt(fake) <= total) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = fb + '人';
            if (fake !== correctStr && fb <= total) set.add(fake);
            fb += 5;
            if (fb > total) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 计算占比 ── */

    function genCalcQ() {
        var items = ['篮球🏀', '足球⚽', '乒乓球🏓', '羽毛球🏸', '游泳🏊'];
        var pick = H.shuffle(items).slice(0, 3);
        var vals = [];
        var remaining = H.randInt(50, 200);
        for (var i = 0; i < 2; i++) {
            var v = H.randInt(5, Math.floor(remaining * 0.6));
            vals.push(v);
            remaining -= v;
        }
        vals.push(remaining);

        var text = pick.map(function (name, i) { return name + ':' + vals[i] + '人'; }).join('，') + '\n\n';
        var total = vals[0] + vals[1] + vals[2];

        var targetIdx = H.randInt(0, 2);
        var targetPct = Math.round(vals[targetIdx] / total * 100);

        text += pick[targetIdx] + '占百分之几？';
        var answer = targetPct + '%';

        var set = new Set();
        set.add(answer);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var fake = (targetPct + H.randInt(-20, 20)) + '%';
            if (fake !== answer && parseInt(fake) > 0 && parseInt(fake) <= 100) set.add(fake);
        }
        var fb = 5;
        while (set.size < 4) {
            fake = fb + '%';
            if (fake !== answer) set.add(fake);
            fb += 15;
            if (fb > 100) break;
        }

        return {
            text: text, answer: answer, answerText: answer,
            choices: H.shuffle(Array.from(set)),
            hint: '百分比 = 该项人数 ÷ 总人数 × 100%'
        };
    }

    /* ── Phase 3: 选择统计图 ── */

    function genChartTypeQ() {
        var scenarios = [
            {
                q: '要表示各学科考试成绩的平均分\n应该选用哪种统计图？',
                a: '条形统计图',
                w: ['扇形统计图', '折线统计图', '统计表'],
                hint: '比较各项数据的多少用条形图'
            },
            {
                q: '要表示一周内气温的变化趋势\n应该选用哪种统计图？',
                a: '折线统计图',
                w: ['条形统计图', '扇形统计图', '统计表'],
                hint: '看趋势变化用折线图'
            },
            {
                q: '要表示各种课外活动人数占\n总人数的百分比，应该选用？',
                a: '扇形统计图',
                w: ['条形统计图', '折线统计图', '统计表'],
                hint: '看各部分占总体的比例用扇形图'
            },
            {
                q: '要比较五个班级的平均分高低\n应该选用哪种统计图？',
                a: '条形统计图',
                w: ['扇形统计图', '折线统计图', '统计表'],
                hint: '比较各项数据大小用条形图'
            },
            {
                q: '要展示某同学从一年级到六年级\n体重的变化情况，应该选用？',
                a: '折线统计图',
                w: ['条形统计图', '扇形统计图', '统计表'],
                hint: '展示变化趋势用折线图'
            },
            {
                q: '要表示班级同学最喜欢各种水果的\n人数分布，应该选用？',
                a: '扇形统计图',
                w: ['条形统计图', '折线统计图', '统计表'],
                hint: '展示各部分占比用扇形图'
            },
            {
                q: '扇形统计图用整个圆表示？',
                a: '总数(100%)',
                w: ['最大值', '最小值', '平均数'],
                hint: '整个圆表示总数，即100%'
            },
            {
                q: '在扇形统计图中，每个扇形\n表示什么？',
                a: '各部分占总体的百分比',
                w: ['各部分的具体数值', '各部分之间的差值', '各部分的变化趋势'],
                hint: '扇形大小反映占比'
            }
        ];
        var pick = scenarios[H.randInt(0, scenarios.length - 1)];
        var allChoices = H.shuffle([pick.a].concat(pick.w));
        return { text: pick.q, answer: pick.a, answerText: pick.a, choices: allChoices, hint: pick.hint };
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null, levelData: null, mistakes: 0,
        phase: 0, qIndex: 0, questions: [], answered: false
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
                '<div class="pch-wrap">' +
                    '<div class="pch-header">' +
                        H.guideBarHTML('🥧', '饼图解读——数据会说话！', 'pch-guide') +
                    '</div>' +
                    '<div class="pch-body" id="pch-body"></div>' +
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
                    H.updateGuide('读图没问题！挑战计算占比！', 'pch-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('计算高手！挑战选择统计图！', 'pch-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pch-body');
            var phaseLabels = { 1: '读懂扇形图', 2: '计算占比', 3: '选择统计图' };
            var phaseEmojis = { 1: '🥧', 2: '🔢', 3: '📊' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'pch-guide');

            body.innerHTML =
                '<div class="pch-card">' +
                    '<div class="pch-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="pch-card-num">' + q.text + '</div>' +
                    '<div class="pch-card-hint">' + q.hint + '</div>' +
                    '<div class="pch-card-choices" id="pch-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices, 'pch-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('数据分析小能手！', 'pch-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#pch-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#pch-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#pch-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
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
                state.container, state.levelData.reward || 30,
                state.levelData, state.mistakes,
                '你掌握了扇形统计图的阅读、计算和选择！', NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genReadQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genCalcQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genChartTypeQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.pch-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#f0fdf4 0%,#86efac 40%,#15803d 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.pch-header{position:relative;z-index:50;}' +
            '.pch-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:pch-fadeIn 0.4s ease;}' +
            '@keyframes pch-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.pch-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #15803d;display:flex;flex-direction:column;align-items:center;gap:18px;animation:pch-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes pch-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.pch-card-emoji{font-size:50px;}' +
            '.pch-card-num{font-size:22px;font-weight:bold;color:#14532d;text-align:center;line-height:1.8;background:#f0fdf4;padding:14px 28px;border-radius:16px;border:2px solid #86efac;white-space:pre-line;}' +
            '.pch-card-hint{font-size:16px;color:#166534;font-style:italic;}' +
            '.pch-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
