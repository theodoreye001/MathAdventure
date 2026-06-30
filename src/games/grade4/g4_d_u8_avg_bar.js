/**
 * 四年级下册 第八单元：平均数与条形统计图
 * 路径: src/games/grade4/g4_d_u8_avg_bar.js
 *
 * 玩法："数据分析大师"
 *   Phase 1 "求平均数": 计算几个数的平均数。4轮。
 *   Phase 2 "读懂条形图": 根据复式条形统计图回答问题。4轮。
 *   Phase 3 "综合分析": 综合运用平均数和统计图知识。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u8-avg-bar-styles';
    const NEXT_LEVEL = 'lvl_4_d_9';

    function genChoices(ans) {
        var set = new Set();
        set.add(String(ans));
        while (set.size < 4) {
            var off = H.randInt(-5, 5);
            if (off === 0) off = H.randInt(1, 3);
            var v = ans + off;
            if (v > 0) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** Phase 1: 求平均数 */
    function buildPhase1() {
        var qs = [];
        var used = [];
        for (var i = 0; i < 6; i++) {
            var n = H.randInt(3, 5);
            var nums = [];
            var sum = 0;
            for (var j = 0; j < n; j++) {
                var v = H.randInt(5, 30);
                nums.push(v);
                sum += v;
            }
            var avg = sum / n;
            if (avg !== Math.floor(avg)) continue;
            var key = nums.sort().join(',');
            if (used.indexOf(key) !== -1) continue;
            used.push(key);
            qs.push({
                text: nums.join('、') + ' 的平均数是？',
                answer: String(avg),
                choices: genChoices(avg),
                hint: '平均数 = 总数 ÷ 个数'
            });
            if (qs.length >= 4) break;
        }
        while (qs.length < 4) {
            var a = H.randInt(10, 30);
            var b = H.randInt(10, 30);
            var c = H.randInt(10, 30);
            var s = a + b + c;
            if (s % 3 === 0) {
                qs.push({
                    text: a + '、' + b + '、' + c + ' 的平均数是？',
                    answer: String(s / 3),
                    choices: genChoices(s / 3),
                    hint: '总数=' + s + '，个数=3'
                });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /** Phase 2: 复式条形统计图 */
    function buildPhase2() {
        var qs = [];
        // 生成一个班级男女投篮数据
        var boysScores = [H.randInt(5, 15), H.randInt(5, 15), H.randInt(5, 15), H.randInt(5, 15)];
        var girlsScores = [H.randInt(5, 15), H.randInt(5, 15), H.randInt(5, 15), H.randInt(5, 15)];
        var labels = ['一月', '二月', '三月', '四月'];

        // Q1: 某月男生投了几个
        var m1 = H.randInt(0, 3);
        qs.push({
            text: '📊 男生一月~四月投篮：[' + boysScores.join(', ') + ']<br>女生一月~四月投篮：[' + girlsScores.join(', ') + ']<br><b>' + labels[m1] + '男生投了几个？</b>',
            answer: String(boysScores[m1]),
            choices: genChoices(boysScores[m1]),
            hint: '找到对应的月份和男生柱子'
        });

        // Q2: 某月女生投了几个
        var m2 = H.randInt(0, 3);
        qs.push({
            text: '📊 男生一月~四月投篮：[' + boysScores.join(', ') + ']<br>女生一月~四月投篮：[' + girlsScores.join(', ') + ']<br><b>' + labels[m2] + '女生投了几个？</b>',
            answer: String(girlsScores[m2]),
            choices: genChoices(girlsScores[m2]),
            hint: '找到对应的月份和女生柱子'
        });

        // Q3: 男生平均
        var bAvg = Math.round(boysScores.reduce(function (a, b) { return a + b; }, 0) / 4);
        if (bAvg !== Math.round(bAvg)) bAvg = Math.round(bAvg);
        qs.push({
            text: '📊 男生一月~四月投篮：[' + boysScores.join(', ') + ']<br><b>男生四个月平均每月投几个？</b>',
            answer: String(bAvg),
            choices: genChoices(bAvg),
            hint: '把4个月的数加起来再除以4'
        });

        // Q4: 女生平均
        var gAvg = Math.round(girlsScores.reduce(function (a, b) { return a + b; }, 0) / 4);
        qs.push({
            text: '📊 女生一月~四月投篮：[' + girlsScores.join(', ') + ']<br><b>女生四个月平均每月投几个？</b>',
            answer: String(gAvg),
            choices: genChoices(gAvg),
            hint: '总数 ÷ 月数'
        });

        return qs;
    }

    /** Phase 3: 综合分析 */
    function buildPhase3() {
        var qs = [];

        // 找最大值和最小值
        var data = [H.randInt(10, 30), H.randInt(10, 30), H.randInt(10, 30)];
        var days = ['周一', '周二', '周三'];
        qs.push({
            text: '小明三天跳绳成绩：' + days[0] + ' ' + data[0] + '个，' + days[1] + ' ' + data[1] + '个，' + days[2] + ' ' + data[2] + '个。<br><b>跳最多的是哪天？</b>',
            answer: days[data.indexOf(Math.max.apply(null, data))],
            choices: H.shuffle(days),
            hint: '比较三个数的大小'
        });

        // 平均数概念
        var scores = [H.randInt(80, 100), H.randInt(80, 100), H.randInt(80, 100)];
        var avg2 = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / 3);
        qs.push({
            text: '三次测验成绩：' + scores.join('、') + '分。<br><b>平均分约是？</b>',
            answer: String(avg2),
            choices: genChoices(avg2),
            hint: '总数 ÷ 次数'
        });

        // 补充数据使平均达到目标
        var partial = [H.randInt(8, 15), H.randInt(8, 15)];
        var target = H.randInt(10, 20);
        var need = target * 3 - partial[0] - partial[1];
        if (need > 0 && need < 40) {
            qs.push({
                text: '小红前两次分别投了 ' + partial[0] + ' 个和 ' + partial[1] + ' 个，要使三次平均 ' + target + ' 个，第三次要投几个？',
                answer: String(need),
                choices: genChoices(need),
                hint: '平均' + target + '个 × 3次 = 总数，减去前两次'
            });
        }

        // 多几个
        var a3 = H.randInt(5, 20);
        var b3 = H.randInt(5, 20);
        var diff = Math.abs(a3 - b3);
        var who = a3 > b3 ? '小明' : '小红';
        qs.push({
            text: '小明吃了 ' + a3 + ' 个饺子，小红吃了 ' + b3 + ' 个饺子。' + who + '多吃了几个？',
            answer: String(diff),
            choices: genChoices(diff),
            hint: '用大数减小数'
        });

        // 填空使平均数满足条件
        var avg3 = H.randInt(10, 25);
        var known = [H.randInt(avg3 - 5, avg3 + 5), H.randInt(avg3 - 5, avg3 + 5)];
        var third3 = avg3 * 3 - known[0] - known[1];
        if (third3 > 0 && third3 < 60) {
            qs.push({
                text: '三人的平均成绩是 ' + avg3 + ' 分，前两人分别是 ' + known[0] + ' 和 ' + known[1] + ' 分，第三人是？',
                answer: String(third3),
                choices: genChoices(third3),
                hint: '平均数 × 3 = 总分'
            });
        }

        return H.shuffle(qs).slice(0, 4);
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
            state.mistakes = 0; state.phase = 1; state.qIndex = 0; state.answered = false;
            state.questions = buildPhase1();
            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="avg-wrap">' +
                    '<div class="avg-header">' +
                        H.guideBarHTML('📊', '数据分析大师——用数据说话！', 'avg-guide') +
                    '</div>' +
                    '<div class="avg-body" id="avg-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('平均数没问题！来读读统计图！', 'avg-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('统计图也难不倒你！综合分析挑战！', 'avg-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('avg-body');
            var labels = { 1: '求平均数', 2: '条形统计图', 3: '综合分析' };
            var emojis = { 1: '🧮', 2: '📈', 3: '🔍' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'avg-guide');

            body.innerHTML =
                '<div class="avg-card">' +
                    '<div class="avg-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="avg-card-text">' + q.text + '</div>' +
                    '<div class="avg-card-hint">' + q.hint + '</div>' +
                    '<div class="avg-card-choices" id="avg-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'avg-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('数据分析高手！✅', 'avg-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#avg-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#avg-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#avg-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你能分析数据、计算平均数了！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.avg-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#f0fdf4 0%,#bbf7d0 40%,#22c55e 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.avg-header{position:relative;z-index:50;}' +
            '.avg-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:avg-fadeIn 0.4s ease;}' +
            '@keyframes avg-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.avg-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #22c55e;display:flex;flex-direction:column;align-items:center;gap:18px;animation:avg-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:580px;width:94%;}' +
            '@keyframes avg-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.avg-card-emoji{font-size:50px;}' +
            '.avg-card-text{font-size:22px;font-weight:bold;color:#15803d;text-align:center;line-height:1.8;background:#f0fdf4;padding:14px 28px;border-radius:16px;border:2px solid #86efac;}' +
            '.avg-card-hint{font-size:16px;color:#16a34a;font-style:italic;}' +
            '.avg-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
