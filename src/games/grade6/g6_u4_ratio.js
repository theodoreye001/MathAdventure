/**
 * 六年级上册 第四单元：比
 * 路径: src/games/grade6/g6_u4_ratio.js
 *
 * 玩法："按比分配"
 *   Phase 1 "比的认识": 比的含义、各部分名称。4轮。
 *   Phase 2 "化简比": 求比值、化简比。4轮。
 *   Phase 3 "按比分配": 按比例分配实际问题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u4-ratio-styles';
    const NEXT_LEVEL = 'lvl_6_5_1';

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

    /* ── Phase 1: 比的认识 ── */

    function genRatioMeaningQ() {
        var a = H.randInt(2, 12);
        var b = H.randInt(2, 12);
        var g = gcd(a, b);
        var sa = a / g, sb = b / g;

        var type = H.randInt(0, 1);
        if (type === 0) {
            // 求比值
            var answer = fracStr(sa, sb);
            var text = a + ' : ' + b + ' 的比值是？';
            var choices = genMeaningChoices(sa, sb, a, b);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '比值 = 前项 ÷ 后项' };
        } else {
            // 化简比
            var simpleA = sa, simpleB = sb;
            var answer2 = simpleA + ' : ' + simpleB;
            var text2 = '把 ' + a + ' : ' + b + ' 化成最简整数比';
            var choices2 = genSimplifyChoices(simpleA, simpleB, a, b);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '化简比：前项和后项同时除以最大公因数' };
        }
    }

    function genMeaningChoices(rN, rD, origA, origB) {
        var correctStr = fracStr(rN, rD);
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake, r;
            if (type === 0) {
                // 前后颠倒
                fake = fracStr(rD, rN);
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 直接用原数
                fake = fracStr(origA, origB);
                if (fake !== correctStr) set.add(fake);
            } else {
                var offN = rN + H.randInt(-2, 2);
                if (offN > 0) {
                    r = reduce(offN, rD);
                    fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
                    if (fake !== correctStr) set.add(fake);
                }
            }
        }
        var fb = 1;
        while (set.size < 4) {
            var fbN = H.randInt(1, 10), fbD = H.randInt(2, 12);
            r = reduce(fbN, fbD);
            fake = r[1] === 1 ? '' + r[0] : r[0] + '/' + r[1];
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 30) break;
        }
        return H.shuffle(Array.from(set));
    }

    function genSimplifyChoices(sA, sB, origA, origB) {
        var correctStr = sA + ' : ' + sB;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                // 没化简（原比）
                fake = origA + ' : ' + origB;
                if (fake !== correctStr) set.add(fake);
            } else if (type === 1) {
                // 多除了
                var g2 = gcd(sA, sB);
                if (g2 > 1) {
                    fake = (sA / g2) + ' : ' + (sB / g2);
                } else {
                    fake = (sA * 2) + ' : ' + (sB * 2);
                }
                if (fake !== correctStr) set.add(fake);
            } else {
                // 颠倒
                fake = sB + ' : ' + sA;
                if (fake !== correctStr) set.add(fake);
            }
        }
        var fb = 1;
        while (set.size < 4) {
            var fbA = H.randInt(1, 8), fbB = H.randInt(1, 8);
            fake = fbA + ' : ' + fbB;
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 30) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 化简比（纯整数比） ── */

    function genSimplifyQ() {
        var types = H.randInt(0, 2);
        if (types === 0) {
            // 整数比
            var a = H.randInt(2, 20);
            var b = H.randInt(2, 20);
            var g = gcd(a, b);
            var sA = a / g, sB = b / g;
            var answer = sA + ' : ' + sB;
            var text = '化简 ' + a + ' : ' + b;
            var choices = genSimplifyChoices(sA, sB, a, b);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '找最大公因数，前后项同时除以它' };
        } else if (types === 1) {
            // 小数比
            var a2 = (H.randInt(1, 9) * 0.5);
            var b2 = (H.randInt(1, 9) * 0.5);
            if (a2 === b2) b2 = a2 + 0.5;
            // 转整数比
            var ia = Math.round(a2 * 2);
            var ib = Math.round(b2 * 2);
            var g2 = gcd(ia, ib);
            var sA2 = ia / g2, sB2 = ib / g2;
            var answer2 = sA2 + ' : ' + sB2;
            var text2 = '化简 ' + a2 + ' : ' + b2;
            var choices2 = genSimplifyChoices(sA2, sB2, ia, ib);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '先同时乘以10（或适当倍数）化为整数比，再约分' };
        } else {
            // 分数比
            var d1 = H.randInt(2, 8);
            var n1 = H.randInt(1, d1 - 1);
            var d2 = H.randInt(2, 8);
            var n2 = H.randInt(1, d2 - 1);
            // 分数比化简：n1/d1 : n2/d2 = n1*d2 : n2*d1
            var cn = n1 * d2;
            var cd = n2 * d1;
            var g3 = gcd(cn, cd);
            var sA3 = cn / g3, sB3 = cd / g3;
            var answer3 = sA3 + ' : ' + sB3;
            var text3 = '化简 ' + n1 + '/' + d1 + ' : ' + n2 + '/' + d2;
            var choices3 = genSimplifyChoices(sA3, sB3, cn, cd);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '分数比化简：前项和后项同时乘以分母的最小公倍数' };
        }
    }

    /* ── Phase 3: 按比分配 ── */

    function genDistributeQ() {
        var total = H.randInt(20, 200);
        var a = H.randInt(1, 6);
        var b = H.randInt(1, 6);
        if (a === b) b = a + 1;
        var g = gcd(a, b);
        a = a / g;
        b = b / g;
        var parts = a + b;

        // 确保整除
        while (total % parts !== 0) { total += 1; if (total > 300) break; }

        var share1 = total * a / parts;
        var share2 = total * b / parts;

        var things = ['苹果🍎', '糖果🍬', '铅笔✏️', '书本📖', '弹珠🔮', '贴纸⭐'];
        var thing = things[H.randInt(0, things.length - 1)];

        var answer = share1 + '个和' + share2 + '个';
        var text = '把' + total + '个' + thing + '按 ' + a + ' : ' + b + ' 分给甲乙两人\n甲分多少个？乙分多少个？';

        var set = new Set();
        set.add(answer);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                // 平分
                fake = (total / 2) + '个和' + (total / 2) + '个';
            } else if (type === 1) {
                // 比例反了
                fake = share2 + '个和' + share1 + '个';
            } else {
                // 多给一点
                fake = (share1 + 1) + '个和' + (share2 - 1) + '个';
            }
            if (fake !== answer && total % 2 === 0 || type !== 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            var fA = H.randInt(5, total - 5);
            var fB = total - fA;
            fake = fA + '个和' + fB + '个';
            if (fake !== answer) set.add(fake);
            fb++;
            if (fb > 30) break;
        }
        return {
            text: text,
            answer: answer,
            answerText: answer,
            choices: H.shuffle(Array.from(set)),
            hint: '先算总份数 = 前项 + 后项，再算每份的数量'
        };
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
                '<div class="rat-wrap">' +
                    '<div class="rat-header">' +
                        H.guideBarHTML('⚖️', '按比分配——比例的世界真奇妙！', 'rat-guide') +
                    '</div>' +
                    '<div class="rat-body" id="rat-body"></div>' +
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
                    H.updateGuide('比的认识没问题！挑战化简比！', 'rat-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('化简比高手！挑战按比分配！', 'rat-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('rat-body');
            var phaseLabels = { 1: '比的认识', 2: '化简比', 3: '按比分配' };
            var phaseEmojis = { 1: '📊', 2: '✂️', 3: '⚖️' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'rat-guide');

            body.innerHTML =
                '<div class="rat-card">' +
                    '<div class="rat-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="rat-card-num">' + q.text + '</div>' +
                    '<div class="rat-card-hint">' + q.hint + '</div>' +
                    '<div class="rat-card-choices" id="rat-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices, 'rat-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！比的专家！', 'rat-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#rat-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#rat-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#rat-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了比的认识、化简比和按比分配！', NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genRatioMeaningQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genSimplifyQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genDistributeQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.rat-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fef3c7 0%,#fcd34d 40%,#d97706 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.rat-header{position:relative;z-index:50;}' +
            '.rat-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:rat-fadeIn 0.4s ease;}' +
            '@keyframes rat-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.rat-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #d97706;display:flex;flex-direction:column;align-items:center;gap:18px;animation:rat-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes rat-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.rat-card-emoji{font-size:50px;}' +
            '.rat-card-num{font-size:24px;font-weight:bold;color:#92400e;text-align:center;line-height:1.8;background:#fef3c7;padding:14px 28px;border-radius:16px;border:2px solid #fcd34d;white-space:pre-line;}' +
            '.rat-card-hint{font-size:16px;color:#b45309;font-style:italic;}' +
            '.rat-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
