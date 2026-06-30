/**
 * 五年级上册 第三单元：小数除法
 * 路径: src/games/grade5/g5_u3_decimal_divide.js
 *
 * 玩法："除法迷宫"
 *   Phase 1 "小数÷整数": 计算小数除以整数。4轮。
 *   Phase 2 "整数÷小数": 计算整数除以小数。4轮。
 *   Phase 3 "实际应用": 小数除法解决生活问题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u3-decimal-divide-styles';
    const NEXT_LEVEL = 'lvl_5_4_1';

    /** 生成一个简单小数（1位小数，保证除得尽） */
    function randDividend(intPart) {
        var base = H.randInt(1, intPart || 20);
        var frac = H.randInt(1, 9);
        return parseFloat(base + '.' + frac);
    }

    /** 生成一个除数（整数或1位小数） */
    function randDivisor(type) {
        if (type === 'int') return H.randInt(2, 9);
        // type === 'dec' → 1位小数的除数
        return H.randInt(2, 9) + H.randInt(1, 9) / 10;
    }

    /** 格式化结果 */
    function fmtNum(n) {
        var s = n.toFixed(10);
        s = s.replace(/\.?0+$/, '');
        return s;
    }

    /** 生成选项 */
    function genChoices(correct) {
        var set = new Set();
        set.add(correct);
        var cNum = parseFloat(correct);
        var tries = 0;
        while (set.size < 4 && tries < 50) {
            tries++;
            var off = H.randInt(1, 15) / 10;
            if (H.randInt(0, 1) === 0) off = -off;
            var v = cNum + off;
            if (v > 0 && fmtNum(v) !== correct) set.add(fmtNum(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 小数÷整数 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var divisor = H.randInt(2, 5);
            // 保证除得尽：先算商，再构造被除数
            var 商 = H.randInt(2, 15) + H.randInt(1, 9) / 10;
            var dividend = fmtNum(商 * divisor);
            var ans = fmtNum(商);
            qs.push({
                text: dividend + ' ÷ ' + divisor + ' = ?',
                answer: ans,
                choices: genChoices(ans),
                hint: '小数÷整数：商的小数点与被除数对齐'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 整数÷小数 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var divisorDec = H.randInt(2, 9) + H.randInt(1, 9) / 10;
            var 商 = H.randInt(2, 12);
            var dividend = Math.round(商 * divisorDec * 10) / 10;
            var ans = fmtNum(商);
            qs.push({
                text: fmtNum(dividend) + ' ÷ ' + fmtNum(divisorDec) + ' = ?',
                answer: ans,
                choices: genChoices(ans),
                hint: '除数是小数：先移动小数点变成整数'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 实际应用 ── */
    function buildPhase3() {
        var templates = [
            function () {
                var dist = H.randInt(3, 9) + H.randInt(1, 9) / 10;
                var spd = H.randInt(2, 5);
                var time = fmtNum(dist / spd);
                return {
                    text: '全程' + fmtNum(dist) + '千米，每小时走' + spd + '千米，需要几小时？',
                    answer: time
                };
            },
            function () {
                var total = H.randInt(5, 20) + H.randInt(1, 9) / 10;
                var bags = H.randInt(2, 5);
                var perBag = fmtNum(total / bags);
                return {
                    text: fmtNum(total) + '千克糖平均装' + bags + '袋，每袋多少千克？',
                    answer: perBag
                };
            },
            function () {
                var money = H.randInt(10, 50);
                var price = H.randInt(2, 8) + H.randInt(1, 9) / 10;
                var count = fmtNum(money / price);
                return {
                    text: '用' + money + '元买每支' + fmtNum(price) + '元的笔，能买几支？',
                    answer: count
                };
            },
            function () {
                var area = H.randInt(10, 50) + H.randInt(1, 9) / 10;
                var width = H.randInt(2, 6) + H.randInt(1, 5) / 10;
                var len = fmtNum(area / width);
                return {
                    text: '长方形面积' + fmtNum(area) + '平方米，宽' + fmtNum(width) + '米，长多少米？',
                    answer: len
                };
            }
        ];
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var t = templates[i % templates.length]();
            qs.push({
                text: t.text,
                answer: t.answer,
                choices: genChoices(t.answer),
                hint: '用小数除法来解决'
            });
        }
        return H.shuffle(qs);
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
                '<div class="ddv-wrap">' +
                    '<div class="ddv-header">' +
                        H.guideBarHTML('🌀', '除法迷宫——小数除法大闯关！', 'ddv-guide') +
                    '</div>' +
                    '<div class="ddv-body" id="ddv-body"></div>' +
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
                    H.updateGuide('小数÷整数没问题！试试整数÷小数！', 'ddv-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最后冲刺：用除法解决问题！', 'ddv-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('ddv-body');
            var phaseLabels = { 1: '小数÷整数', 2: '整数÷小数', 3: '实际应用' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'ddv-guide');

            var phaseEmoji = state.phase === 1 ? '➗' : state.phase === 2 ? '➗' : '🛍️';

            body.innerHTML =
                '<div class="ddv-card">' +
                    '<div class="ddv-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="ddv-card-num">' + q.text + '</div>' +
                    '<div class="ddv-card-hint">' + q.hint + '</div>' +
                    '<div class="ddv-card-choices" id="ddv-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'ddv-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！除法迷宫闯关成功！✅', 'ddv-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#ddv-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#ddv-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#ddv-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了小数除法的计算方法！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.ddv-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fbbf24 40%,#f59e0b 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.ddv-header{position:relative;z-index:50;}' +
            '.ddv-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:ddv-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes ddv-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.ddv-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:ddv-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes ddv-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.ddv-card-emoji{font-size:50px;}' +
            '.ddv-card-num{' +
                'font-size:30px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#fef3c7;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #fbbf24;' +
            '}' +
            '.ddv-card-hint{' +
                'font-size:16px;color:#d97706;font-style:italic;' +
            '}' +
            '.ddv-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
