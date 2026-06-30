/**
 * 五年级下册 第四单元：分数的意义和性质
 * 路径: src/games/grade5/g5_d_u4_fraction_meaning.js
 *
 * 玩法："分数披萨"
 *   Phase 1 "分数分类": 判断分数是真分数、假分数还是带分数。4轮。
 *   Phase 2 "约分与通分": 约分或通分。4轮。
 *   Phase 3 "分数与小数": 分数和小数互化。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u4-fraction-meaning-styles';
    const NEXT_LEVEL = 'lvl_5_d_5';

    /* ── 工具函数 ── */

    /** 最大公约数（欧几里得） */
    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            var t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    /** 生成指定范围内的分母 */
    function randDenom(min, max) {
        var d = H.randInt(min, max);
        // 避免 1
        if (d === 1) d = 2;
        return d;
    }

    /** 披萨可视化：filled = 填充数，total = 总数 */
    function pizzaVis(filled, total) {
        var s = '';
        for (var i = 0; i < total; i++) {
            s += i < filled ? '🍕' : '⬜';
        }
        return s;
    }

    /** 分数显示（用斜杠，方便 CSS 渲染） */
    function fracDisplay(num, den) {
        return num + '⁄' + den;
    }

    /* ── Phase 1: 分数分类 ── */

    function buildPhase1() {
        var qs = [];
        var used = {};
        var attempts = 0;

        while (qs.length < 4 && attempts < 50) {
            attempts++;
            var type = H.randInt(0, 2); // 0=真, 1=假, 2=带分
            var num, den, whole, display, answer;

            if (type === 0) {
                // 真分数: 分子 < 分母
                den = randDenom(3, 12);
                num = H.randInt(1, den - 1);
                display = num + '/' + den;
                answer = '真分数';
            } else if (type === 1) {
                // 假分数: 分子 >= 分母，且不是整数
                den = randDenom(2, 10);
                num = H.randInt(den + 1, den * 2 - 1);
                // 确保不能整除
                if (num % den === 0) num++;
                if (num >= den * 2) num = den + H.randInt(1, den - 1);
                display = num + '/' + den;
                answer = '假分数';
            } else {
                // 带分数: 整数 + 真分数
                whole = H.randInt(1, 5);
                den = randDenom(2, 10);
                num = H.randInt(1, den - 1);
                display = whole + '又' + num + '/' + den;
                answer = '带分数';
            }

            if (used[display]) continue;
            used[display] = true;

            // 披萨可视化
            var pizzaNum, pizzaDen;
            if (type === 2) {
                // 带分数：显示整数部分完整披萨 + 分数部分
                pizzaNum = num;
                pizzaDen = den;
            } else {
                pizzaNum = num;
                pizzaDen = den;
            }

            var visText = 'Pizza可视化（每组' + pizzaDen + '片）：\n';
            var fullPizzas = Math.floor(pizzaNum / pizzaDen);
            var remainNum = pizzaNum % pizzaDen;
            if (type === 2) {
                fullPizzas = whole;
                remainNum = num;
            }
            for (var p = 0; p < fullPizzas; p++) {
                visText += pizzaVis(pizzaDen, pizzaDen) + ' ';
            }
            if (remainNum > 0) {
                visText += pizzaVis(remainNum, pizzaDen);
            }

            qs.push({
                text: '判断下面这个分数的类型：\n' + display,
                display: display,
                answer: answer,
                vis: visText,
                choices: H.shuffle(['真分数', '假分数', '带分数', '都不是']),
                hint: '分子<分母→真分数，分子>=分母→假分数，整数+真分数→带分数'
            });
        }

        // 保底：如果生成不够，用预设
        var presets = [
            { display: '3/5', answer: '真分数', num: 3, den: 5 },
            { display: '7/4', answer: '假分数', num: 7, den: 4 },
            { display: '2又3/8', answer: '带分数', whole: 2, num: 3, den: 8 },
            { display: '5/9', answer: '真分数', num: 5, den: 9 }
        ];
        while (qs.length < 4) {
            var p = presets[qs.length];
            qs.push({
                text: '判断下面这个分数的类型：\n' + p.display,
                display: p.display,
                answer: p.answer,
                vis: pizzaVis(p.num, p.den),
                choices: H.shuffle(['真分数', '假分数', '带分数', '都不是']),
                hint: '分子<分母→真分数，分子>=分母→假分数，整数+真分数→带分数'
            });
        }

        return qs;
    }

    /* ── Phase 2: 约分与通分 ── */

    function buildPhase2() {
        var qs = [];

        // Part A: 约分（2题）
        var reducePool = [
            { num: 6, den: 8, answer: '3/4' },
            { num: 10, den: 15, answer: '2/3' },
            { num: 12, den: 16, answer: '3/4' },
            { num: 9, den: 12, answer: '3/4' },
            { num: 8, den: 14, answer: '4/7' },
            { num: 15, den: 20, answer: '3/4' },
            { num: 14, den: 21, answer: '2/3' },
            { num: 16, den: 24, answer: '2/3' },
            { num: 18, den: 30, answer: '3/5' },
            { num: 20, den: 25, answer: '4/5' },
            { num: 12, den: 18, answer: '2/3' },
            { num: 10, den: 25, answer: '2/5' },
            { num: 15, den: 18, answer: '5/6' },
            { num: 21, den: 28, answer: '3/4' },
            { num: 24, den: 36, answer: '2/3' },
            { num: 8, den: 20, answer: '2/5' }
        ];
        var pickedReduce = H.shuffle(reducePool).slice(0, 2);
        for (var i = 0; i < pickedReduce.length; i++) {
            var r = pickedReduce[i];
            // 生成干扰项：分子分母各减1、只约一个、反过来
            var wrongChoices = [];
            // 只约分子
            var g1 = gcd(r.num, r.den);
            if (r.num / g1 !== 1) wrongChoices.push((r.num / g1) + '/' + r.den);
            // 分子分母各减1
            if (r.num > 1 && r.den > 1) wrongChoices.push((r.num - 1) + '/' + (r.den - 1));
            // 反转
            if (r.num !== r.den) wrongChoices.push(r.den + '/' + r.num);
            // 加1
            wrongChoices.push((r.num + 1) + '/' + (r.den + 1));

            // 去重、去正确答案
            var unique = {};
            unique[r.answer] = true;
            var filtered = [];
            for (var w = 0; w < wrongChoices.length; w++) {
                if (!unique[wrongChoices[w]] && wrongChoices[w] !== r.answer) {
                    unique[wrongChoices[w]] = true;
                    filtered.push(wrongChoices[w]);
                }
            }
            // 补足到3个干扰项
            var extra = ['1/2', '3/5', '4/7', '2/3', '5/6', '7/8'];
            for (var e = 0; e < extra.length && filtered.length < 3; e++) {
                if (!unique[extra[e]]) {
                    unique[extra[e]] = true;
                    filtered.push(extra[e]);
                }
            }

            qs.push({
                text: '把 ' + r.num + '/' + r.den + ' 约分成最简分数',
                answer: r.answer,
                choices: H.shuffle([r.answer].concat(filtered.slice(0, 3))),
                hint: '找出分子分母的最大公因数，然后同时除以它'
            });
        }

        // Part B: 通分 / 找等值分数（2题）
        var equivPool = [
            { num: 1, den: 3, targetDen: 6, answer: '2/6' },
            { num: 2, den: 5, targetDen: 10, answer: '4/10' },
            { num: 3, den: 4, targetDen: 12, answer: '9/12' },
            { num: 2, den: 7, targetDen: 14, answer: '4/14' },
            { num: 1, den: 6, targetDen: 12, answer: '2/12' },
            { num: 3, den: 8, targetDen: 24, answer: '9/24' },
            { num: 2, den: 3, targetDen: 9, answer: '6/9' },
            { num: 4, den: 5, targetDen: 15, answer: '12/15' },
            { num: 1, den: 4, targetDen: 12, answer: '3/12' },
            { num: 3, den: 10, targetDen: 30, answer: '9/30' },
            { num: 5, den: 6, targetDen: 18, answer: '15/18' },
            { num: 2, den: 9, targetDen: 27, answer: '6/27' }
        ];
        var pickedEquiv = H.shuffle(equivPool).slice(0, 2);
        for (var j = 0; j < pickedEquiv.length; j++) {
            var e = pickedEquiv[j];
            var mult = e.targetDen / e.den;
            // 干扰项
            var wrongEquiv = [];
            wrongEquiv.push((e.num + 1) + '/' + e.targetDen);         // 分子多1
            wrongEquiv.push((e.num * mult + 1) + '/' + e.targetDen);  // 算错
            if (e.num * mult - 1 > 0) wrongEquiv.push((e.num * mult - 1) + '/' + e.targetDen);
            wrongEquiv.push(e.num + '/' + (e.den + 1));               // 分母错
            wrongEquiv.push(e.num + '/' + e.targetDen);               // 漏乘分子

            var uE = {};
            uE[e.answer] = true;
            var fE = [];
            for (var k = 0; k < wrongEquiv.length && fE.length < 3; k++) {
                if (!uE[wrongEquiv[k]] && wrongEquiv[k] !== e.answer) {
                    uE[wrongEquiv[k]] = true;
                    fE.push(wrongEquiv[k]);
                }
            }

            qs.push({
                text: '把 ' + e.num + '/' + e.den + ' 通分成分母为 ' + e.targetDen + ' 的分数',
                answer: e.answer,
                choices: H.shuffle([e.answer].concat(fE.slice(0, 3))),
                hint: '分子分母同时乘以相同的数'
            });
        }

        return H.shuffle(qs);
    }

    /* ── Phase 3: 分数与小数 ── */

    function buildPhase3() {
        var qs = [];

        // 分数 → 小数（2题）
        var fracToDecPool = [
            { num: 1, den: 2, dec: '0.5' },
            { num: 3, den: 4, dec: '0.75' },
            { num: 1, den: 4, dec: '0.25' },
            { num: 2, den: 5, dec: '0.4' },
            { num: 3, den: 5, dec: '0.6' },
            { num: 4, den: 5, dec: '0.8' },
            { num: 1, den: 8, dec: '0.125' },
            { num: 3, den: 8, dec: '0.375' },
            { num: 5, den: 8, dec: '0.625' },
            { num: 7, den: 8, dec: '0.875' },
            { num: 1, den: 20, dec: '0.05' },
            { num: 7, den: 10, dec: '0.7' },
            { num: 9, den: 10, dec: '0.9' },
            { num: 3, den: 20, dec: '0.15' },
            { num: 5, den: 16, dec: '0.3125' },
            { num: 1, den: 5, dec: '0.2' },
            { num: 2, den: 25, dec: '0.08' },
            { num: 7, den: 20, dec: '0.35' }
        ];
        var pickedFrac = H.shuffle(fracToDecPool).slice(0, 2);
        for (var i = 0; i < pickedFrac.length; i++) {
            var f = pickedFrac[i];
            var decVal = parseFloat(f.dec);
            // 干扰项
            var wrongDec = [];
            wrongDec.push((decVal + 0.1).toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
            wrongDec.push((decVal * 10).toFixed(1).replace(/\.0$/, ''));
            wrongDec.push(f.num + '.' + f.den);  // 常见错误：直接拼接
            if (wrongDec[0] === f.dec) wrongDec[0] = (decVal + 0.05).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
            if (wrongDec[0] === f.dec) wrongDec[0] = (decVal + 0.2).toFixed(1);

            var uD = {};
            uD[f.dec] = true;
            var fD = [];
            for (var d = 0; d < wrongDec.length && fD.length < 3; d++) {
                if (!uD[wrongDec[d]] && wrongDec[d] !== f.dec) {
                    uD[wrongDec[d]] = true;
                    fD.push(wrongDec[d]);
                }
            }
            // 补足
            var extraD = ['0.3', '0.65', '0.45', '0.55', '0.22', '0.16'];
            for (var ex = 0; ex < extraD.length && fD.length < 3; ex++) {
                if (!uD[extraD[ex]]) { uD[extraD[ex]] = true; fD.push(extraD[ex]); }
            }

            qs.push({
                text: '把 ' + f.num + '/' + f.den + ' 化成小数',
                answer: f.dec,
                choices: H.shuffle([f.dec].concat(fD.slice(0, 3))),
                hint: '用分子 ÷ 分母'
            });
        }

        // 小数 → 分数（2题）
        var decToFracPool = [
            { dec: '0.5', num: 1, den: 2, display: '1/2' },
            { dec: '0.25', num: 1, den: 4, display: '1/4' },
            { dec: '0.75', num: 3, den: 4, display: '3/4' },
            { dec: '0.4', num: 2, den: 5, display: '2/5' },
            { dec: '0.6', num: 3, den: 5, display: '3/5' },
            { dec: '0.8', num: 4, den: 5, display: '4/5' },
            { dec: '0.2', num: 1, den: 5, display: '1/5' },
            { dec: '0.125', num: 1, den: 8, display: '1/8' },
            { dec: '0.375', num: 3, den: 8, display: '3/8' },
            { dec: '0.15', num: 3, den: 20, display: '3/20' },
            { dec: '0.35', num: 7, den: 20, display: '7/20' },
            { dec: '0.7', num: 7, den: 10, display: '7/10' },
            { dec: '0.9', num: 9, den: 10, display: '9/10' },
            { dec: '0.05', num: 1, den: 20, display: '1/20' }
        ];
        var pickedDec = H.shuffle(decToFracPool).slice(0, 2);
        for (var j = 0; j < pickedDec.length; j++) {
            var dc = pickedDec[j];
            var wrongFrac = [];
            // 分子就是小数部分
            var rawNum = dc.num * 100;
            if (dc.den === 4) rawNum = dc.num * 100;
            wrongFrac.push(dc.num + '/10');
            wrongFrac.push(dc.num + '/100');
            if (dc.den !== 2) wrongFrac.push(dc.num + '/2');
            wrongFrac.push((dc.num + 1) + '/' + dc.den);
            wrongFrac.push(dc.num + '/' + (dc.den + 5));
            wrongFrac.push('1/' + dc.den);
            // 不约分的形式
            var unreduced = (dc.num * 2) + '/' + (dc.den * 2);
            if (unreduced !== dc.display) wrongFrac.push(unreduced);

            var uF = {};
            uF[dc.display] = true;
            var fF = [];
            for (var k = 0; k < wrongFrac.length && fF.length < 3; k++) {
                if (!uF[wrongFrac[k]] && wrongFrac[k] !== dc.display) {
                    uF[wrongFrac[k]] = true;
                    fF.push(wrongFrac[k]);
                }
            }

            qs.push({
                text: '把 ' + dc.dec + ' 化成分数（最简形式）',
                answer: dc.display,
                choices: H.shuffle([dc.display].concat(fF.slice(0, 3))),
                hint: '小数点后面几位就是百分之几/十分之几，再约分'
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
                '<div class="fmn-wrap">' +
                    '<div class="fmn-header">' +
                        H.guideBarHTML('🍕', '分数披萨——探索分数的世界！', 'fmn-guide') +
                    '</div>' +
                    '<div class="fmn-body" id="fmn-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildPhase1();
            H.updateGuide('先来认识真分数、假分数和带分数！', 'fmn-guide');
            this.renderPhase1();
        },

        renderPhase1: function () {
            state.answered = false;
            var q = state.questions[state.qIndex];
            var body = document.getElementById('fmn-body');

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · 分数分类', 'fmn-guide');

            // 披萨可视化区域
            var visHtml = '<div class="fmn-pizza">' + (q.vis || pizzaVis(q.num || 3, q.den || 5)) + '</div>';

            body.innerHTML =
                '<div class="fmn-card">' +
                    '<div class="fmn-card-emoji">🍕</div>' +
                    '<div class="fmn-card-num">' + q.text + '</div>' +
                    visHtml +
                    '<div class="fmn-card-hint">' + q.hint + '</div>' +
                    '<div class="fmn-card-choices" id="fmn-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'fmn-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                var picked = q.choices[idx];

                if (picked === q.answer) {
                    H.updateGuide('分类正确！分数分类小达人！✅', 'fmn-guide');
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    }
                    var el = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase1();
                        } else {
                            self.startPhase2();
                        }
                    }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer,
                        document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase1();
                        } else {
                            self.startPhase2();
                        }
                    }, 2000);
                }
            });
        },

        startPhase2: function () {
            state.phase = 2;
            state.qIndex = 0;
            state.questions = buildPhase2();
            H.updateGuide('分类没问题！试试约分和通分！', 'fmn-guide');
            var self = this;
            setTimeout(function () { self.renderPhase2(); }, 1000);
        },

        renderPhase2: function () {
            state.answered = false;
            var q = state.questions[state.qIndex];
            var body = document.getElementById('fmn-body');
            var isReduce = q.text.indexOf('约分') !== -1;

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + (isReduce ? '约分' : '通分'), 'fmn-guide');

            var emoji = isReduce ? '✂️' : '🔄';

            body.innerHTML =
                '<div class="fmn-card">' +
                    '<div class="fmn-card-emoji">' + emoji + '</div>' +
                    '<div class="fmn-card-num">' + q.text + '</div>' +
                    '<div class="fmn-card-hint">' + q.hint + '</div>' +
                    '<div class="fmn-card-choices" id="fmn-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'fmn-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                var picked = q.choices[idx];

                if (picked === q.answer) {
                    H.updateGuide(isReduce ? '约分正确！分数化简高手！✅' : '通分正确！等值分数找到啦！✅', 'fmn-guide');
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    }
                    var el = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase2();
                        } else {
                            self.startPhase3();
                        }
                    }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer,
                        document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase2();
                        } else {
                            self.startPhase3();
                        }
                    }, 2000);
                }
            });
        },

        startPhase3: function () {
            state.phase = 3;
            state.qIndex = 0;
            state.questions = buildPhase3();
            H.updateGuide('约分通分都行！最后来分数小数互化！', 'fmn-guide');
            var self = this;
            setTimeout(function () { self.renderPhase3(); }, 1000);
        },

        renderPhase3: function () {
            state.answered = false;
            var q = state.questions[state.qIndex];
            var body = document.getElementById('fmn-body');
            var isFracToDec = q.text.indexOf('化成小数') !== -1;

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + (isFracToDec ? '分数→小数' : '小数→分数'), 'fmn-guide');

            var emoji = isFracToDec ? '🔢' : '📊';

            body.innerHTML =
                '<div class="fmn-card">' +
                    '<div class="fmn-card-emoji">' + emoji + '</div>' +
                    '<div class="fmn-card-num">' + q.text + '</div>' +
                    '<div class="fmn-card-hint">' + q.hint + '</div>' +
                    '<div class="fmn-card-choices" id="fmn-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'fmn-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                var picked = q.choices[idx];

                if (picked === q.answer) {
                    H.updateGuide(isFracToDec ? '互化成功！分数小数切换自如！✅' : '转换正确！小数分数都能认！✅', 'fmn-guide');
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    }
                    var el = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase3();
                        } else {
                            self.finishGame();
                        }
                    }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer,
                        document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#fmn-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () {
                        if (state.qIndex < state.questions.length) {
                            self.renderPhase3();
                        } else {
                            self.finishGame();
                        }
                    }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你完全掌握了分数的意义和性质！真分数、假分数、带分数、约分、通分、分数小数互化全都会！',
                NEXT_LEVEL
            );
        }
    };

    /* ── CSS ── */
    function buildCSS() {
        return '' +
            /* 容器 */
            '.fmn-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fcd34d 40%,#f59e0b 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.fmn-header{position:relative;z-index:50;}' +
            '.fmn-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:fmn-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes fmn-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* 卡片 */
            '.fmn-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:fmn-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes fmn-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fmn-card-emoji{font-size:50px;}' +
            '.fmn-card-num{' +
                'font-size:26px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#fffbeb;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #fcd34d;' +
                'white-space:pre-line;' +
            '}' +
            '.fmn-card-hint{' +
                'font-size:16px;color:#d97706;font-style:italic;' +
            '}' +
            '.fmn-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}' +

            /* 披萨可视化 */
            '.fmn-pizza{' +
                'font-size:28px;letter-spacing:4px;' +
                'text-align:center;line-height:1.8;' +
                'background:#fffbeb;padding:10px 16px;border-radius:12px;' +
                'border:2px dashed #fbbf24;' +
                'max-width:100%;overflow-x:auto;' +
            '}' +

            /* 披萨切片动画 */
            '.fmn-pizza span{' +
                'display:inline-block;animation:fmn-slice 0.3s ease forwards;' +
            '}' +
            '@keyframes fmn-slice{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}';
    }

    window.CurrentGameModule = game;
})();
