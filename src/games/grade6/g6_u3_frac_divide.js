/**
 * 六年级上册 第三单元：分数除法
 * 路径: src/games/grade6/g6_u3_frac_divide.js
 *
 * 玩法："倒数翻转"
 *   Phase 1 "分数÷整数": 分数除以整数。4轮。
 *   Phase 2 "分数÷分数": 除以一个分数等于乘以它的倒数。4轮。
 *   Phase 3 "混合运算": 分数乘除混合。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u3-frac-divide-styles';
    const NEXT_LEVEL = 'lvl_6_4_1';

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

    /* ── Phase 1: 分数 ÷ 整数 ── */

    function genFracDivInt() {
        var d = H.randInt(2, 10);
        var n = H.randInt(1, d - 1);
        // 选择能整除的整数
        var divisors = [];
        for (var i = 2; i <= 9; i++) {
            if (d % i === 0 || n % i === 0 || true) divisors.push(i);
        }
        var whole = divisors[H.randInt(0, divisors.length - 1)];

        // n/d ÷ whole = n/(d*whole)
        var resN = n;
        var resD = d * whole;
        var answer = fracStr(resN, resD);
        var text = n + '/' + d + ' ÷ ' + whole + ' = ?';

        var choices = genDivChoices(resN, resD, n, d, whole);
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: choices,
            hint: '分数除以整数：乘以这个整数的倒数'
        };
    }

    function genDivChoices(ansN, ansD, n, d, whole) {
        var correctStr = fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake, r;
            if (type === 0) {
                // 直接除分子
                r = reduce(n / (n % whole === 0 ? whole : 1), d);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr && n % whole === 0) set.add(fake);
            } else if (type === 1) {
                // 乘以整数（忘了取倒数）
                r = reduce(n * whole, d);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 2) {
                // 忘记约分
                fake = n + '/' + (d * whole);
                if (fake !== correctStr) set.add(fake);
            } else {
                var offN = ansN + H.randInt(-2, 2);
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

    /* ── Phase 2: 分数 ÷ 分数 ── */

    function genFracDivFrac() {
        var d1 = H.randInt(2, 9);
        var n1 = H.randInt(1, d1 - 1);
        var d2 = H.randInt(2, 9);
        var n2 = H.randInt(1, d2 - 1);

        // n1/d1 ÷ n2/d2 = n1*d2 / (d1*n2)
        var resN = n1 * d2;
        var resD = d1 * n2;
        var answer = fracStr(resN, resD);
        var text = n1 + '/' + d1 + ' ÷ ' + n2 + '/' + d2 + ' = ?';

        var choices = genFracDivChoices(resN, resD, n1, d1, n2, d2);
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: choices,
            hint: '分数除法：除以一个分数等于乘以它的倒数'
        };
    }

    function genFracDivChoices(ansN, ansD, n1, d1, n2, d2) {
        var correctStr = fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake, r;
            if (type === 0) {
                // 没翻转，直接乘
                r = reduce(n1 * n2, d1 * d2);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 只翻转了被除数
                r = reduce(d1 * n2, n1 * d2);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 2) {
                // 分子分母直接相除
                r = reduce(n1, n2);
                var r2 = reduce(d1, d2);
                fake = fracStr(r[0] * r2[1], r[1] * r2[0]);
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

    /* ── Phase 3: 混合运算 ── */

    function genMixedOps() {
        var isMulFirst = Math.random() > 0.5;

        var d1 = H.randInt(2, 8);
        var n1 = H.randInt(1, d1 - 1);
        var d2 = H.randInt(2, 8);
        var n2 = H.randInt(1, d2 - 1);
        var d3 = H.randInt(2, 8);
        var n3 = H.randInt(1, d3 - 1);

        var resN, resD, text, answer;

        if (isMulFirst) {
            // (a/b × c/d) ÷ e/f
            resN = n1 * n2 * d3;
            resD = d1 * d2 * n3;
            text = n1 + '/' + d1 + ' × ' + n2 + '/' + d2 + ' ÷ ' + n3 + '/' + d3 + ' = ?';
        } else {
            // (a/b ÷ c/d) × e/f
            resN = n1 * d2 * n3;
            resD = d1 * n2 * d3;
            text = n1 + '/' + d1 + ' ÷ ' + n2 + '/' + d2 + ' × ' + n3 + '/' + d3 + ' = ?';
        }

        answer = fracStr(resN, resD);

        var choices = genMixedChoices(resN, resD, n1, d1, n2, d2, n3, d3, isMulFirst);
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: choices,
            hint: '从左到右依次计算，注意乘除法的转换'
        };
    }

    function genMixedChoices(ansN, ansD, n1, d1, n2, d2, n3, d3, isMulFirst) {
        var correctStr = fracStr(ansN, ansD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake, r;
            if (type === 0) {
                // 除法忘记翻转
                if (isMulFirst) {
                    r = reduce(n1 * n2 * n3, d1 * d2 * d3);
                } else {
                    r = reduce(n1 * n2 * n3, d1 * d2 * d3);
                }
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 顺序搞反
                r = reduce(ansD, ansN);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else if (type === 2) {
                // 全部当加法
                r = reduce(n1 * d2 * d3 + n2 * d3 + n3, d1 * d2 * d3);
                fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                if (fake !== correctStr) set.add(fake);
            } else {
                var offN = ansN + H.randInt(-5, 5);
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
                '<div class="fdv-wrap">' +
                    '<div class="fdv-header">' +
                        H.guideBarHTML('🔄', '倒数翻转——除法变乘法！', 'fdv-guide') +
                    '</div>' +
                    '<div class="fdv-body" id="fdv-body"></div>' +
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
                    H.updateGuide('分数÷整数轻松搞定！挑战分数÷分数！', 'fdv-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('除法高手！最后挑战混合运算！', 'fdv-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fdv-body');
            var phaseLabels = { 1: '分数÷整数', 2: '分数÷分数', 3: '混合运算' };
            var phaseEmojis = { 1: '➗', 2: '🔄', 3: '🧮' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'fdv-guide');

            body.innerHTML =
                '<div class="fdv-card">' +
                    '<div class="fdv-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="fdv-card-num">' + q.text + '</div>' +
                    '<div class="fdv-card-hint">' + q.hint + '</div>' +
                    '<div class="fdv-card-choices" id="fdv-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fdv-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('太棒了！倒数翻转玩得溜！', 'fdv-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#fdv-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#fdv-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#fdv-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了分数除法的倒数翻转和混合运算！',
                NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genFracDivInt(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genFracDivFrac(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genMixedOps(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.fdv-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fce7f3 0%,#f9a8d4 40%,#db2777 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.fdv-header{position:relative;z-index:50;}' +
            '.fdv-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:fdv-fadeIn 0.4s ease;}' +
            '@keyframes fdv-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.fdv-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #db2777;display:flex;flex-direction:column;align-items:center;gap:18px;animation:fdv-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes fdv-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fdv-card-emoji{font-size:50px;}' +
            '.fdv-card-num{font-size:30px;font-weight:bold;color:#831843;text-align:center;line-height:1.6;font-family:"Courier New",monospace;background:#fce7f3;padding:12px 28px;border-radius:16px;border:2px solid #f9a8d4;}' +
            '.fdv-card-hint{font-size:16px;color:#be185d;font-style:italic;}' +
            '.fdv-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
