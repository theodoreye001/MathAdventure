/**
 * 五年级下册 第六单元：分数的加法和减法
 * 路径: src/games/grade5/g5_d_u6_fraction_addsub.js
 *
 * 玩法："异分母挑战"
 *   Phase 1 "同分母加减": 分母相同的分数加法和减法。4轮。
 *   Phase 2 "异分母加减": 分母不同的分数加法和减法（先通分）。4轮。
 *   Phase 3 "带分数加减": 带分数的加法和减法。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u6-fraction-addsub-styles';
    const NEXT_LEVEL = 'lvl_5_d_7';

    /* ── 数学工具函数 ── */

    /** 最大公约数 */
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

    /** 最小公倍数 */
    function lcm(a, b) {
        return Math.abs(a * b) / gcd(a, b);
    }

    /** 约分到最简形式，返回 [num, den] */
    function reduce(n, d) {
        if (d === 0) return [n, d];
        if (n === 0) return [0, 1];
        var g = gcd(Math.abs(n), Math.abs(d));
        var rn = n / g;
        var rd = d / g;
        if (rd < 0) { rn = -rn; rd = -rd; }
        return [rn, rd];
    }

    /** 假分数转带分数 [whole, num, den]（已是真分数时 whole=0） */
    function toMixed(n, d) {
        var r = reduce(n, d);
        n = r[0]; d = r[1];
        if (d === 0) return [0, 0, 1];
        var neg = n < 0;
        if (neg) n = -n;
        var whole = Math.floor(n / d);
        var rem = n % d;
        if (rem === 0) return neg ? [-whole, 0, 1] : [whole, 0, 1];
        var result = neg ? [-whole, rem, d] : [whole, rem, d];
        return result;
    }

    /** 格式化分数为字符串 */
    function fracStr(n, d) {
        var r = reduce(n, d);
        n = r[0]; d = r[1];
        return n + '/' + d;
    }

    /** 格式化带分数为字符串 */
    function mixedStr(whole, num, den) {
        if (num === 0) return '' + whole;
        var prefix = whole === 0 ? '' : whole + ' ';
        return prefix + num + '/' + den;
    }

    /** 判断是否为真分数（|n| < d） */
    function isProper(n, d) {
        return Math.abs(n) < d;
    }

    /* ── Phase 1: 同分母加减 ── */

    function genSameDenomQuestion() {
        var d = H.randInt(3, 12);
        var isAdd = Math.random() >= 0.4;
        var n1 = H.randInt(1, d - 1);
        var n2 = H.randInt(1, d - 1);

        if (isAdd) {
            // 加法: n1/d + n2/d
            var sumN = n1 + n2;
            var r = reduce(sumN, d);
            var ansNum = r[0], ansDen = r[1];

            var answer, answerText;
            if (ansDen === 1) {
                answer = '' + ansNum;
                answerText = answer;
            } else {
                answer = fracStr(ansNum, ansDen);
                answerText = answer;
            }

            var opStr = n1 + '/' + d + ' + ' + n2 + '/' + d;

            // 生成干扰项
            var choices = genSameDenomChoices(ansNum, ansDen, d, n1, n2, true);
            return {
                text: opStr + ' = ?',
                answer: answer,
                answerText: answerText,
                choices: choices,
                hint: '同分母分数相加：分母不变，分子相加'
            };
        } else {
            // 减法: 大的减小的
            if (n2 > n1) { var tmp = n1; n1 = n2; n2 = tmp; }
            if (n1 === n2) { n1 = Math.min(n1 + 1, d - 1); }

            var diffN = n1 - n2;
            var r2 = reduce(diffN, d);
            var ansNum2 = r2[0], ansDen2 = r2[1];

            var answer2;
            if (ansDen2 === 1) {
                answer2 = '' + ansNum2;
            } else {
                answer2 = fracStr(ansNum2, ansDen2);
            }

            var opStr2 = n1 + '/' + d + ' - ' + n2 + '/' + d;
            var choices2 = genSameDenomChoices(ansNum2, ansDen2, d, n1, n2, false);
            return {
                text: opStr2 + ' = ?',
                answer: answer2,
                answerText: answer2,
                choices: choices2,
                hint: '同分母分数相减：分母不变，分子相减'
            };
        }
    }

    /** 生成同分母题目选项 */
    function genSameDenomChoices(ansN, ansD, d, n1, n2, isAdd) {
        var correctStr = (ansD === 1) ? ('' + ansN) : (ansN + '/' + ansD);
        var set = new Set();
        set.add(correctStr);

        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var type = H.randInt(0, 3);
            var fakeN, fakeD, fake, r;

            if (type === 0) {
                // 忘记约分：使用原始分母 d（如果约分后分母变了才有意义）
                fakeN = (isAdd ? n1 + n2 : n1 - n2);
                fakeD = d;
                if (fakeD !== ansD && fakeN > 0) {
                    r = reduce(fakeN, fakeD);
                    // 只有当未约分形式和约分后不同时才加入
                    fake = r[0] + '/' + r[1];
                    if (fake !== correctStr && fakeN + '/' + fakeD !== fake) {
                        set.add(fakeN + '/' + fakeD);
                    }
                }
            } else if (type === 1) {
                // 分子相加但分母也乘了2（错误理解"通分"）
                fakeN = isAdd ? (n1 + n2) : Math.abs(n1 - n2);
                fakeD = d * 2;
                if (fakeN > 0 && fakeN < fakeD) {
                    r = reduce(fakeN, fakeD);
                    fake = r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            } else if (type === 2) {
                // 随便偏移分子
                fakeN = ansN + H.randInt(-3, 3);
                fakeD = ansD;
                if (fakeN > 0 && fakeN < (isAdd ? d * 2 : d) && fakeN !== ansN) {
                    fake = fakeN + '/' + fakeD;
                    if (fake !== correctStr) set.add(fake);
                }
            } else {
                // 分子相加分母也加了
                fakeN = isAdd ? (n1 + n2) : Math.abs(n1 - n2);
                fakeD = d + H.randInt(1, 3);
                if (fakeN > 0 && fakeN < fakeD) {
                    r = reduce(fakeN, fakeD);
                    fake = r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            }
        }

        // 补充保证 4 个选项
        var fallback = 1;
        while (set.size < 4) {
            var fbN = H.randInt(1, d - 1);
            r = reduce(fbN, d);
            fake = r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
            fallback++;
            if (fallback > 50) break;
        }

        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 异分母加减 ── */

    function genDiffDenomQuestion() {
        var isAdd = Math.random() >= 0.4;

        // 选取两个不同的分母
        var denoms = [3, 4, 5, 6, 8, 9, 10, 12];
        var d1 = denoms[H.randInt(0, denoms.length - 1)];
        var d2 = denoms[H.randInt(0, denoms.length - 1)];
        var tries = 0;
        while (d2 === d1 && tries < 20) {
            d2 = denoms[H.randInt(0, denoms.length - 1)];
            tries++;
        }
        if (d2 === d1) d2 = d1 + 1; // fallback

        var lcd = lcm(d1, d2);
        // 限制结果分子不要太离谱
        var maxNum1 = Math.min(d1 - 1, Math.floor(30 * d1 / lcd));
        var maxNum2 = Math.min(d2 - 1, Math.floor(30 * d2 / lcd));
        if (maxNum1 < 1) maxNum1 = 1;
        if (maxNum2 < 1) maxNum2 = 1;

        var n1 = H.randInt(1, maxNum1);
        var n2 = H.randInt(1, maxNum2);

        if (isAdd) {
            var newN1 = n1 * (lcd / d1);
            var newN2 = n2 * (lcd / d2);
            var sumN = newN1 + newN2;
            var r = reduce(sumN, lcd);
            var ansN = r[0], ansD = r[1];
            var answer = ansD === 1 ? ('' + ansN) : fracStr(ansN, ansD);

            var opStr = n1 + '/' + d1 + ' + ' + n2 + '/' + d2;
            var choices = genDiffDenomChoices(ansN, ansD, n1, d1, n2, d2, lcd, true);

            return {
                text: opStr + ' = ?',
                answer: answer,
                answerText: answer,
                choices: choices,
                hint: '先找最小公倍数通分，再相加'
            };
        } else {
            // 确保结果为非负
            var scaled1 = n1 * (lcd / d1);
            var scaled2 = n2 * (lcd / d2);
            if (scaled2 > scaled1) { var tmp = n1; n1 = n2; n2 = tmp; var tmpd = d1; d1 = d2; d2 = tmpd; }
            scaled1 = n1 * (lcd / d1);
            scaled2 = n2 * (lcd / d2);

            var diffN = scaled1 - scaled2;
            var r2 = reduce(diffN, lcd);
            var ansN2 = r2[0], ansD2 = r2[1];
            var answer2 = ansD2 === 1 ? ('' + ansN2) : fracStr(ansN2, ansD2);

            var opStr2 = n1 + '/' + d1 + ' - ' + n2 + '/' + d2;
            var choices2 = genDiffDenomChoices(ansN2, ansD2, n1, d1, n2, d2, lcd, false);

            return {
                text: opStr2 + ' = ?',
                answer: answer2,
                answerText: answer2,
                choices: choices2,
                hint: '先找最小公倍数通分，再相减'
            };
        }
    }

    /** 生成异分母题目选项 */
    function genDiffDenomChoices(ansN, ansD, n1, d1, n2, d2, lcd, isAdd) {
        var correctStr = ansD === 1 ? ('' + ansN) : fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);

        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 4);
            var fakeN, fakeD, fake, r;

            if (type === 0) {
                // 用错误的公倍数（例如 d1*d2 而非 lcm）
                var wrongLCD = d1 * d2;
                var wN1 = n1 * (wrongLCD / d1);
                var wN2 = n2 * (wrongLCD / d2);
                fakeN = isAdd ? (wN1 + wN2) : Math.abs(wN1 - wN2);
                fakeD = wrongLCD;
                r = reduce(fakeN, fakeD);
                fake = r[1] === 1 ? ('' + r[0]) : r[0] + '/' + r[1];
                set.add(fake);
            } else if (type === 1) {
                // 忘记约分，用 lcd 做分母
                fakeN = isAdd ? (n1 * (lcd / d1) + n2 * (lcd / d2))
                    : Math.abs(n1 * (lcd / d1) - n2 * (lcd / d2));
                fakeD = lcd;
                if (fakeN !== ansN || fakeD !== ansD) {
                    fake = fakeN + '/' + fakeD;
                    set.add(fake);
                }
            } else if (type === 2) {
                // 直接加分子加减分母
                fakeN = isAdd ? (n1 + n2) : Math.abs(n1 - n2);
                fakeD = d1 + d2;
                if (fakeN > 0 && fakeN < fakeD) {
                    r = reduce(fakeN, fakeD);
                    fake = r[0] + '/' + r[1];
                    set.add(fake);
                }
            } else if (type === 3) {
                // 只通分了一个
                var partialN1 = n1 * (lcd / d1);
                fakeN = isAdd ? (partialN1 + n2) : Math.abs(partialN1 - n2);
                fakeD = lcd;
                if (fakeN > 0) {
                    r = reduce(fakeN, fakeD);
                    fake = r[1] === 1 ? ('' + r[0]) : r[0] + '/' + r[1];
                    set.add(fake);
                }
            } else {
                // 偏移答案
                fakeN = ansN + H.randInt(-3, 3);
                fakeD = ansD;
                if (fakeN > 0 && fakeN < fakeD * 2) {
                    r = reduce(fakeN, fakeD);
                    fake = r[1] === 1 ? ('' + r[0]) : r[0] + '/' + r[1];
                    set.add(fake);
                }
            }
        }

        // 兜底
        var fbTries = 0;
        while (set.size < 4 && fbTries < 30) {
            fbTries++;
            var fbD = H.randInt(2, 15);
            var fbN = H.randInt(1, fbD - 1);
            r = reduce(fbN, fbD);
            fake = r[1] === 1 ? ('' + r[0]) : r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
        }

        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 带分数加减 ── */

    function genMixedQuestion() {
        var isAdd = Math.random() >= 0.4;

        var denoms = [3, 4, 5, 6, 8];
        var d1 = denoms[H.randInt(0, denoms.length - 1)];
        var d2 = denoms[H.randInt(0, denoms.length - 1)];
        var tries = 0;
        while (d2 === d1 && tries < 20) {
            d2 = denoms[H.randInt(0, denoms.length - 1)];
            tries++;
        }
        if (d2 === d1) d2 = d1 + 1;

        var w1 = H.randInt(1, 4);
        var w2 = H.randInt(1, 3);
        var f1 = H.randInt(1, d1 - 1);
        var f2 = H.randInt(1, d2 - 1);

        // 转成假分数来计算
        var impN1 = w1 * d1 + f1;
        var impN2 = w2 * d2 + f2;
        var lcd = lcm(d1, d2);

        if (isAdd) {
            var sN1 = impN1 * (lcd / d1);
            var sN2 = impN2 * (lcd / d2);
            var sumN = sN1 + sN2;
            var mixed = toMixed(sumN, lcd);
            var answer = mixedStr(mixed[0], mixed[1], mixed[2]);

            var opStr = mixedStr(w1, f1, d1) + ' + ' + mixedStr(w2, f2, d2);
            var choices = genMixedChoices(mixed, lcd, w1, f1, d1, w2, f2, d2, true);

            return {
                text: opStr + ' = ?',
                answer: answer,
                answerText: answer,
                choices: choices,
                hint: '先化成假分数通分再加，最后化成带分数'
            };
        } else {
            // 减法：确保被减数较大
            if (impN2 > impN1) {
                var tmpW = w1; w1 = w2; w2 = tmpW;
                var tmpF = f1; f1 = f2; f2 = tmpF;
                var tmpI = impN1; impN1 = impN2; impN2 = tmpI;
                var tmpD = d1; d1 = d2; d2 = tmpD;
            }
            if (impN1 === impN2) {
                // 避免结果为 0
                impN1 = impN2 + d1;
                w1 = Math.floor(impN1 / d1);
                f1 = impN1 % d1;
                if (f1 === 0) { w1--; f1 = d1; impN1 = w1 * d1 + f1; }
            }

            var sN1b = impN1 * (lcd / d1);
            var sN2b = impN2 * (lcd / d2);
            var diffN = sN1b - sN2b;
            var mixed2 = toMixed(diffN, lcd);
            var answer2 = mixedStr(mixed2[0], mixed2[1], mixed2[2]);

            var opStr2 = mixedStr(w1, f1, d1) + ' - ' + mixedStr(w2, f2, d2);
            var choices2 = genMixedChoices(mixed2, lcd, w1, f1, d1, w2, f2, d2, false);

            return {
                text: opStr2 + ' = ?',
                answer: answer2,
                answerText: answer2,
                choices: choices2,
                hint: '先化成假分数通分再减，最后化成带分数'
            };
        }
    }

    /** 生成带分数选项 */
    function genMixedChoices(correct, lcd, w1, f1, d1, w2, f2, d2, isAdd) {
        var answer = mixedStr(correct[0], correct[1], correct[2]);
        var set = new Set();
        set.add(answer);

        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 4);
            var fake, r;

            if (type === 0) {
                // 整数部分加错了（+1 或 -1）
                var fw = correct[0] + H.randInt(-1, 1);
                if (fw < 0) fw = 0;
                fake = mixedStr(fw, correct[1], correct[2]);
                if (fake !== answer) set.add(fake);
            } else if (type === 1) {
                // 分数部分用错分母（用 d1+d2 做分母）
                var wrongDen = d1 + d2;
                var wrongNum = correct[1] * (wrongDen / correct[2]);
                r = reduce(wrongNum, wrongDen);
                fake = mixedStr(correct[0], r[0], r[1]);
                if (fake !== answer) set.add(fake);
            } else if (type === 2) {
                // 忘记进位/借位
                var impTotal = isAdd ? (w1 + w2) : Math.abs(w1 - w2);
                var fracN = isAdd ? (f1 * (lcd / d1) + f2 * (lcd / d2))
                    : Math.abs(f1 * (lcd / d1) - f2 * (lcd / d2));
                r = reduce(fracN, lcd);
                fake = mixedStr(impTotal, r[0], r[1]);
                if (fake !== answer) set.add(fake);
            } else if (type === 3) {
                // 直接把分子加一起
                var badNum = (w1 * d1 + f1) + (w2 * d2 + f2);
                var badDen = d1 + d2;
                var bM = toMixed(badNum, badDen);
                fake = mixedStr(bM[0], bM[1], bM[2]);
                if (fake !== answer) set.add(fake);
            } else {
                // 随机偏移整数部分
                var rw = correct[0] + H.randInt(-2, 2);
                if (rw < 0) rw = 0;
                var rn = H.randInt(1, Math.max(correct[2] - 1, 1));
                r = reduce(rn, correct[2]);
                fake = mixedStr(rw, r[0], r[1]);
                if (fake !== answer) set.add(fake);
            }
        }

        // 补充兜底选项
        var fbTries = 0;
        while (set.size < 4 && fbTries < 30) {
            fbTries++;
            var fbW = H.randInt(1, 5);
            var fbDen = denoms_for_fb[H.randInt(0, denoms_for_fb.length - 1)];
            var fbF = H.randInt(1, fbDen - 1);
            r = reduce(fbF, fbDen);
            fake = mixedStr(fbW, r[0], r[1]);
            if (fake !== answer) set.add(fake);
        }

        return H.shuffle(Array.from(set));
    }

    var denoms_for_fb = [3, 4, 5, 6, 8];

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
                '<div class="fas-wrap">' +
                    '<div class="fas-header">' +
                        H.guideBarHTML('🍕', '异分母挑战——分数加减大冒险！', 'fas-guide') +
                    '</div>' +
                    '<div class="fas-body" id="fas-body"></div>' +
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
                    H.updateGuide('同分母小菜一碟！挑战异分母！', 'fas-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('通分高手！最后挑战带分数！', 'fas-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fas-body');
            var phaseLabels = { 1: '同分母加减', 2: '异分母加减', 3: '带分数加减' };
            var phaseEmojis = { 1: '🍕', 2: '🧮', 3: '📐' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'fas-guide');

            body.innerHTML =
                '<div class="fas-card">' +
                    '<div class="fas-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="fas-card-num">' + q.text + '</div>' +
                    '<div class="fas-card-hint">' + q.hint + '</div>' +
                    '<div class="fas-card-choices" id="fas-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fas-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！分数运算高手！✅', 'fas-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#fas-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#fas-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#fas-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了同分母、异分母和带分数的加减法！',
                NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = [];
        var seen = {};
        var maxTries = 50;
        var tries = 0;
        while (qs.length < 4 && tries < maxTries) {
            tries++;
            var q = genSameDenomQuestion();
            if (!seen[q.text]) {
                seen[q.text] = true;
                qs.push(q);
            }
        }
        return qs;
    }

    function buildPhase2() {
        var qs = [];
        var seen = {};
        var maxTries = 50;
        var tries = 0;
        while (qs.length < 4 && tries < maxTries) {
            tries++;
            var q = genDiffDenomQuestion();
            if (!seen[q.text]) {
                seen[q.text] = true;
                qs.push(q);
            }
        }
        return qs;
    }

    function buildPhase3() {
        var qs = [];
        var seen = {};
        var maxTries = 50;
        var tries = 0;
        while (qs.length < 4 && tries < maxTries) {
            tries++;
            var q = genMixedQuestion();
            if (!seen[q.text]) {
                seen[q.text] = true;
                qs.push(q);
            }
        }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.fas-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fcd34d 40%,#f59e0b 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.fas-header{position:relative;z-index:50;}' +
            '.fas-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:fas-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes fas-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.fas-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:fas-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes fas-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fas-card-emoji{font-size:50px;}' +
            '.fas-card-num{' +
                'font-size:30px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#fef3c7;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #fcd34d;' +
            '}' +
            '.fas-card-hint{' +
                'font-size:16px;color:#d97706;font-style:italic;' +
            '}' +
            '.fas-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
