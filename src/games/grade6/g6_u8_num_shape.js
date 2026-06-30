/**
 * 六年级上册 第八单元：数与形
 * 路径: src/games/grade6/g6_u8_num_shape.js
 *
 * 玩法："数形结合"
 *   Phase 1 "正方形数": 理解平方数的概念。4轮。
 *   Phase 2 "连续奇数之和": 连续奇数求和与平方数的关系。4轮。
 *   Phase 3 "数形规律": 探索数与形的对应规律。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u8-num-shape-styles';
    const NEXT_LEVEL = null;

    /* ── Phase 1: 正方形数（平方数） ── */

    function genSquareQ() {
        var type = H.randInt(0, 2);
        if (type === 0) {
            // 求 n²
            var n = H.randInt(2, 12);
            var ans = n * n;
            var answer = '' + ans;
            var text = n + '² = ？';
            var choices = genSquareChoices(ans, n);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: n + '² = ' + n + ' × ' + n };
        } else if (type === 1) {
            // 哪个是平方数
            var squareNums = [];
            for (var i = 1; i <= 15; i++) squareNums.push(i * i);
            var nonSquare = H.randInt(2, 15);
            while (squareNums.indexOf(nonSquare) !== -1) nonSquare = H.randInt(2, 200);
            var sqPick = squareNums[H.randInt(0, squareNums.length - 1)];
            var answer2 = sqPick + '';
            var text2 = '下面哪个数是完全平方数？';
            var choices2 = H.shuffle(['' + sqPick, '' + nonSquare, '' + (nonSquare + 3), '' + (sqPick + 2)]);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '完全平方数 = 某个整数 × 自身' };
        } else {
            // 某数是几的平方
            var n2 = H.randInt(2, 12);
            var sq = n2 * n2;
            var answer3 = '' + n2;
            var text3 = sq + ' 是几的平方？\n' + sq + ' = ？²';
            var choices3 = genSquareChoices2(n2);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '找一个数，使它乘以自己等于' + sq };
        }
    }

    function genSquareChoices(correct, n) {
        var correctStr = '' + correct;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                fake = '' + (n * (n + 1));
            } else if (type === 1) {
                fake = '' + (n * 2);
            } else {
                fake = '' + (correct + H.randInt(-10, 10));
            }
            if (fake !== correctStr && parseInt(fake) > 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = '' + (fb * fb);
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 15) break;
        }
        return H.shuffle(Array.from(set));
    }

    function genSquareChoices2(correctN) {
        var correctStr = '' + correctN;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 20) {
            tries++;
            var fake = '' + (correctN + H.randInt(-3, 3));
            if (fake !== correctStr && parseInt(fake) > 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = '' + fb;
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 15) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 连续奇数之和 ── */

    function genOddSumQ() {
        var type = H.randInt(0, 2);
        if (type === 0) {
            // 1+3+5+...+(2n-1) = n²
            var n = H.randInt(2, 8);
            var oddSum = n * n;
            var start = 1;
            var end = 2 * n - 1;
            var seq = [];
            for (var i = 0; i < n; i++) seq.push(2 * i + 1);
            var answer = '' + oddSum;
            var text = seq.join(' + ') + ' = ？\n（从1开始的' + n + '个连续奇数之和）';
            var choices = genOddChoices(oddSum, n);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '从1开始的n个连续奇数之和 = n²' };
        } else if (type === 1) {
            // 求前n个奇数的和
            var n2 = H.randInt(3, 10);
            var seq2 = [];
            for (var j = 0; j < n2; j++) seq2.push(2 * j + 1);
            var sum = n2 * n2;
            var answer2 = '' + sum;
            var text2 = seq2.slice(0, Math.min(5, n2)).join(' + ') + (n2 > 5 ? ' + ...' : '') + '\n这' + n2 + '个连续奇数的和是？';
            var choices2 = genOddChoices(sum, n2);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: n2 + '个连续奇数之和 = ' + n2 + '² = ' + sum };
        } else {
            // 100以内有多少个连续奇数之和是平方数
            var n3 = H.randInt(2, 10);
            var sum3 = n3 * n3;
            var answer3 = '' + n3;
            var text3 = '1 + 3 + 5 + ... 的和等于 ' + sum3 + '\n一共加了几个奇数？';
            var choices3 = genOddChoices2(n3);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: sum3 + ' = ' + n3 + '²，所以是' + n3 + '个奇数' };
        }
    }

    function genOddChoices(correct, n) {
        var correctStr = '' + correct;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                fake = '' + (n * (n + 1) / 2); // 等差数列公式（偶数的）
            } else if (type === 1) {
                fake = '' + (correct + H.randInt(-8, 8));
            } else {
                fake = '' + (n * 2 - 1); // 只是最后一个奇数
            }
            if (fake !== correctStr && parseInt(fake) > 0) set.add(fake);
        }
        return H.shuffle(Array.from(set));
    }

    function genOddChoices2(correctN) {
        var correctStr = '' + correctN;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 20) {
            tries++;
            var fake = '' + (correctN + H.randInt(-3, 3));
            if (fake !== correctStr && parseInt(fake) > 0) set.add(fake);
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 数形规律 ── */

    function genPatternQ() {
        var type = H.randInt(0, 3);
        if (type === 0) {
            // 小棒搭三角形
            var n = H.randInt(2, 8);
            var sticks = 2 * n + 1; // 第n个三角形需要 2n+1 根
            var answer = '' + sticks;
            var text = '用小棒搭三角形：\n第1个用3根，第2个用5根，第3个用7根\n第' + n + '个三角形需要几根小棒？';
            var choices = genPatternChoices(sticks, 3, 20);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '规律：3, 5, 7, 9... 每次加2' };
        } else if (type === 1) {
            // 圆点排列
            var row = H.randInt(2, 8);
            var dots = row * row;
            var answer2 = '' + dots;
            var text2 = '正方形点阵排列：\n第一行1个点，第二行2个点...\n排成' + row + '行' + row + '列，共多少个点？';
            var choices2 = genPatternChoices(dots, 1, 100);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: 'n行n列 = n × n 个点' };
        } else if (type === 2) {
            // 从1到n的自然数之和
            var n2 = H.randInt(3, 10);
            var total = n2 * (n2 + 1) / 2;
            var answer3 = '' + total;
            var text3 = '1 + 2 + 3 + ... + ' + n2 + ' = ？';
            var choices3 = genPatternChoices(total, 5, 60);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '公式：n × (n+1) ÷ 2' };
        } else {
            // 九九乘法中数字之和的规律
            var rowN = H.randInt(2, 9);
            var products = [];
            for (var k = 1; k <= rowN; k++) products.push(rowN * k);
            var sumProd = products.reduce(function (a, b) { return a + b; }, 0);
            var answer4 = '' + sumProd;
            var text4 = '在乘法表中，第' + rowN + '行的积之和：\n' +
                products.map(function (p) { return '' + p; }).join(' + ') +
                ' = ？';
            var choices4 = genPatternChoices(sumProd, 10, 150);
            return { text: text4, answer: answer4, answerText: answer4, choices: choices4, hint: '第n行之和 = n × (1+2+...+9) = n × 45' };
        }
    }

    function genPatternChoices(correct, min, max) {
        var correctStr = '' + correct;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var fake = '' + (correct + H.randInt(-10, 10));
            if (fake !== correctStr && parseInt(fake) >= min && parseInt(fake) <= max) set.add(fake);
        }
        var fb = min;
        while (set.size < 4) {
            fake = '' + fb;
            if (fake !== correctStr && fb >= min && fb <= max) set.add(fake);
            fb += 3;
            if (fb > max + 10) break;
        }
        return H.shuffle(Array.from(set));
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
                '<div class="nsh-wrap">' +
                    '<div class="nsh-header">' +
                        H.guideBarHTML('🔢', '数形结合——数字与图形的舞蹈！', 'nsh-guide') +
                    '</div>' +
                    '<div class="nsh-body" id="nsh-body"></div>' +
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
                    H.updateGuide('平方数没问题！挑战连续奇数之和！', 'nsh-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('奇数求和高手！探索更多数形规律！', 'nsh-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('nsh-body');
            var phaseLabels = { 1: '平方数', 2: '连续奇数之和', 3: '数形规律' };
            var phaseEmojis = { 1: '🔲', 2: '➕', 3: '🧩' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'nsh-guide');

            body.innerHTML =
                '<div class="nsh-card">' +
                    '<div class="nsh-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="nsh-card-num">' + q.text + '</div>' +
                    '<div class="nsh-card-hint">' + q.hint + '</div>' +
                    '<div class="nsh-card-choices" id="nsh-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices, 'nsh-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('数形结合的奥秘被你破解了！', 'nsh-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#nsh-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#nsh-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#nsh-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了平方数、连续奇数之和和数形规律！全部通关！', NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genSquareQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genOddSumQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genPatternQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.nsh-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#faf5ff 0%,#d8b4fe 40%,#7e22ce 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.nsh-header{position:relative;z-index:50;}' +
            '.nsh-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:nsh-fadeIn 0.4s ease;}' +
            '@keyframes nsh-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.nsh-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #7e22ce;display:flex;flex-direction:column;align-items:center;gap:18px;animation:nsh-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes nsh-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.nsh-card-emoji{font-size:50px;}' +
            '.nsh-card-num{font-size:24px;font-weight:bold;color:#581c87;text-align:center;line-height:1.8;background:#faf5ff;padding:14px 28px;border-radius:16px;border:2px solid #d8b4fe;white-space:pre-line;}' +
            '.nsh-card-hint{font-size:16px;color:#6b21a8;font-style:italic;}' +
            '.nsh-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
