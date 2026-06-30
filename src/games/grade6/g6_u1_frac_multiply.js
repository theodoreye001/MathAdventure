/**
 * 六年级上册 第一单元：分数乘法
 * 路径: src/games/grade6/g6_u1_frac_multiply.js
 *
 * 玩法："分数乘法挑战"
 *   Phase 1 "分数×分数": 分数乘以分数，分子乘分子分母乘分母。4轮。
 *   Phase 2 "分数×整数": 分数乘以整数。4轮。
 *   Phase 3 "倒数概念": 判断倒数，求倒数。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u1-frac-multiply-styles';
    const NEXT_LEVEL = 'lvl_6_2_1';

    /* ── 数学工具 ── */

    function gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = b; b = a % b; a = t; }
        return a;
    }

    function reduce(n, d) {
        if (d === 0) return [n, d];
        if (n === 0) return [0, 1];
        var g = gcd(Math.abs(n), Math.abs(d));
        var rn = n / g, rd = d / g;
        if (rd < 0) { rn = -rn; rd = -rd; }
        return [rn, rd];
    }

    function fracStr(n, d) {
        var r = reduce(n, d);
        if (r[1] === 1) return '' + r[0];
        return r[0] + '/' + r[1];
    }

    /* ── Phase 1: 分数 × 分数 ── */

    function genFracxFrac() {
        var d1 = H.randInt(2, 9);
        var d2 = H.randInt(2, 9);
        var n1 = H.randInt(1, d1 - 1);
        var n2 = H.randInt(1, d2 - 1);

        var resN = n1 * n2;
        var resD = d1 * d2;
        var answer = fracStr(resN, resD);
        var text = n1 + '/' + d1 + ' × ' + n2 + '/' + d2 + ' = ?';

        var choices = genFracChoices(resN, resD, n1, d1, n2, d2);
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: choices,
            hint: '分数乘分数：分子乘分子，分母乘分母，最后约分'
        };
    }

    function genFracChoices(ansN, ansD, n1, d1, n2, d2) {
        var correctStr = fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake, r;
            if (type === 0) {
                // 忘记约分
                fake = (ansN) + '/' + (ansD);
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 分子乘分母交叉了
                var badN = n1 * d2;
                var badD = d1 * n2;
                if (badN > 0 && badD > 0) {
                    r = reduce(badN, badD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            } else if (type === 2) {
                // 分子相加而不是相乘
                var addN = n1 + n2;
                var addD = d1 + d2;
                if (addN < addD) {
                    r = reduce(addN, addD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            } else {
                // 偏移分子
                var offN = ansN + H.randInt(-3, 3);
                if (offN > 0 && offN < ansD * 2) {
                    r = reduce(offN, ansD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            }
        }
        var fb = 1;
        while (set.size < 4) {
            var fbN = H.randInt(1, 8), fbD = H.randInt(2, 12);
            r = reduce(fbN, fbD);
            fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 40) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 分数 × 整数 ── */

    function genFracxInt() {
        var d = H.randInt(2, 12);
        var n = H.randInt(1, d - 1);
        var whole = H.randInt(2, 9);

        var resN = n * whole;
        var resD = d;
        var answer = fracStr(resN, resD);
        var text = n + '/' + d + ' × ' + whole + ' = ?';

        var choices = genIntChoices(resN, resD, n, d, whole);
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: choices,
            hint: '分数乘整数：分子乘整数，分母不变，最后约分'
        };
    }

    function genIntChoices(ansN, ansD, n, d, whole) {
        var correctStr = fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake, r;
            if (type === 0) {
                // 忘记约分
                fake = n * whole + '/' + d;
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 分母也乘了整数
                fake = n + '/' + (d * whole);
                r = reduce(n, d * whole);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 2) {
                // 只加了整数
                r = reduce(n + whole, d);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else {
                var offN = ansN + H.randInt(-3, 3);
                if (offN > 0) {
                    r = reduce(offN, ansD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            }
        }
        var fb = 1;
        while (set.size < 4) {
            var fbN = H.randInt(1, 8), fbD = H.randInt(2, 12);
            r = reduce(fbN, fbD);
            fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 40) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 倒数概念 ── */

    function genReciprocal() {
        var type = H.randInt(0, 2);
        if (type === 0) {
            // 求一个数的倒数
            var d = H.randInt(2, 12);
            var n = H.randInt(1, d - 1);
            var r = reduce(n, d);
            n = r[0]; d = r[1];
            var answer = fracStr(d, n);
            var text = '求 ' + n + '/' + d + ' 的倒数';
            var choices = genRecipChoices(d, n, n, d);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '倒数：分子分母互换' };
        } else if (type === 1) {
            // 整数的倒数
            var whole = H.randInt(2, 9);
            var answer = '1/' + whole;
            var text = '求 ' + whole + ' 的倒数';
            var choices = genRecipChoices(1, whole, whole, 1);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '整数 a 的倒数是 1/a' };
        } else {
            // 哪两个数互为倒数
            var d2 = H.randInt(2, 10);
            var n2 = H.randInt(1, d2 - 1);
            var r2 = reduce(n2, d2);
            n2 = r2[0]; d2 = r2[1];
            var recip = fracStr(d2, n2);
            var text = n2 + '/' + d2 + ' × ? = 1，括号里应该填什么？';
            var answer = recip;
            var choices = genRecipChoices(d2, n2, n2, d2);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '互为倒数的两个数乘积为1' };
        }
    }

    function genRecipChoices(rN, rD, origN, origD) {
        var correctStr = fracStr(rN, rD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake, r;
            if (type === 0) {
                // 相同的数
                fake = fracStr(origN, origD);
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 负倒数
                r = reduce(-rN, rD);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else {
                // 偏移
                var offD = rD + H.randInt(-2, 2);
                if (offD > 0 && offD !== rD) {
                    r = reduce(rN, offD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            }
        }
        var fb = 1;
        while (set.size < 4) {
            var fbN = H.randInt(1, 8), fbD = H.randInt(2, 12);
            r = reduce(fbN, fbD);
            fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 40) break;
        }
        return H.shuffle(Array.from(set));
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
                '<div class="fmu-wrap">' +
                    '<div class="fmu-header">' +
                        H.guideBarHTML('✖️', '分数乘法挑战——分子分母齐上阵！', 'fmu-guide') +
                    '</div>' +
                    '<div class="fmu-body" id="fmu-body"></div>' +
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
                    H.updateGuide('分数乘分数没问题！挑战分数乘整数！', 'fmu-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('乘法高手！最后挑战倒数概念！', 'fmu-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fmu-body');
            var phaseLabels = { 1: '分数×分数', 2: '分数×整数', 3: '倒数概念' };
            var phaseEmojis = { 1: '✖️', 2: '🔢', 3: '🔄' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'fmu-guide');

            body.innerHTML =
                '<div class="fmu-card">' +
                    '<div class="fmu-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="fmu-card-num">' + q.text + '</div>' +
                    '<div class="fmu-card-hint">' + q.hint + '</div>' +
                    '<div class="fmu-card-choices" id="fmu-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fmu-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！分数乘法小能手！', 'fmu-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#fmu-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#fmu-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#fmu-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了分数乘法、分数乘整数和倒数概念！',
                NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genFracxFrac();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genFracxInt();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genReciprocal();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.fmu-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#ede9fe 0%,#c4b5fd 40%,#7c3aed 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.fmu-header{position:relative;z-index:50;}' +
            '.fmu-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:fmu-fadeIn 0.4s ease;}' +
            '@keyframes fmu-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.fmu-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #7c3aed;display:flex;flex-direction:column;align-items:center;gap:18px;animation:fmu-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes fmu-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fmu-card-emoji{font-size:50px;}' +
            '.fmu-card-num{font-size:30px;font-weight:bold;color:#4c1d95;text-align:center;line-height:1.6;font-family:"Courier New",monospace;background:#ede9fe;padding:12px 28px;border-radius:16px;border:2px solid #c4b5fd;}' +
            '.fmu-card-hint{font-size:16px;color:#6d28d9;font-style:italic;}' +
            '.fmu-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
