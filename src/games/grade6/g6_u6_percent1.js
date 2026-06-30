/**
 * 六年级上册 第六单元：百分数（一）
 * 路径: src/games/grade6/g6_u6_percent1.js
 *
 * 玩法："百分比换算"
 *   Phase 1 "百分数的意义": 理解百分数含义。4轮。
 *   Phase 2 "互化": 百分数与小数、分数互化。4轮。
 *   Phase 3 "求百分率": 求一个数是另一个数的百分之几。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u6-percent1-styles';
    const NEXT_LEVEL = 'lvl_6_7_1';

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

    function round2(n) { return Math.round(n * 100) / 100; }

    /* ── Phase 1: 百分数的意义 ── */

    function genMeaningQ() {
        var type = H.randInt(0, 2);
        if (type === 0) {
            // 百分数表示什么
            var concepts = [
                { q: '百分数表示一个数是另一个数的百分之几，\n它也叫做？', a: '百分率或百分比', w: ['小数', '比值', '分数'] },
                { q: '下面哪个是百分数？', a: '35%', w: ['35', '35/100', '0.35'] },
                { q: '35%表示的意义是？', a: '每100份中有35份', w: ['35个100', '35除以100', '35乘以100'] },
                { q: '百分数的分母一定是？', a: '100', w: ['10', '1000', '不确定'] },
                { q: '125%化成小数是？', a: '1.25', w: ['12.5', '0.125', '125'] }
            ];
            var pick = concepts[H.randInt(0, concepts.length - 1)];
            var allChoices = H.shuffle([pick.a].concat(pick.w));
            return { text: pick.q, answer: pick.a, answerText: pick.a, choices: allChoices, hint: '百分数是一种特殊的分数，分母是100' };
        } else if (type === 1) {
            // 生活中的百分数
            var lifeQ = [
                { q: '考试及格线是60分，表示及格人数占\n总人数的百分之几？', a: '60%', w: ['40%', '0.6%', '6%'] },
                { q: '果汁含量30%，如果果汁有250ml\n那么果汁实际有多少ml？', a: '75ml', w: ['30ml', '250ml', '280ml'] },
                { q: '命中率80%表示什么意思？', a: '每100次有80次命中', w: ['命中80次', '命中80%', '80%的机会'] }
            ];
            var pick2 = lifeQ[H.randInt(0, lifeQ.length - 1)];
            var allChoices2 = H.shuffle([pick2.a].concat(pick2.w));
            return { text: pick2.q, answer: pick2.a, answerText: pick2.a, choices: allChoices2, hint: '百分数在日常生活中应用很广' };
        } else {
            // 比较大小
            var a1 = H.randInt(10, 90);
            var a2 = round2(a1 / 10);
            var answer3 = a1 + '% > ' + a2 + '%';
            var text3 = '比较大小：' + a1 + '% 和 ' + (a1 * 10) + '%';
            var correct3 = a1 + '% < ' + (a1 * 10) + '%';
            var choices3 = H.shuffle([
                a1 + '% < ' + (a1 * 10) + '%',
                a1 + '% > ' + (a1 * 10) + '%',
                a1 + '% = ' + (a1 * 10) + '%',
                '无法比较'
            ]);
            return { text: text3, answer: correct3, answerText: correct3, choices: choices3, hint: '百分数比较：看百分号前面的数字' };
        }
    }

    /* ── Phase 2: 互化 ── */

    function genConvertQ() {
        var type = H.randInt(0, 3);
        if (type === 0) {
            // 百分数 → 小数
            var pctVal = H.randInt(1, 200);
            var decVal = round2(pctVal / 100);
            var answer = '' + decVal;
            var text = pctVal + '% = ？（小数）';
            var choices = genConvertChoices(answer, pctVal, 'pct2dec');
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '百分数化小数：去掉百分号，小数点左移两位' };
        } else if (type === 1) {
            // 小数 → 百分数
            var decVal2 = round2(H.randInt(1, 200) / 100);
            var pctVal2 = decVal2 * 100;
            var answer2 = pctVal2 + '%';
            var text2 = decVal2 + ' = ？（百分数）';
            var choices2 = genConvertChoices(answer2, decVal2, 'dec2pct');
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '小数化百分数：小数点右移两位，加上百分号' };
        } else if (type === 2) {
            // 百分数 → 分数
            var pctVal3 = H.randInt(5, 150);
            var num = pctVal3;
            var den = 100;
            var r = reduce(num, den);
            var answer3 = r[0] + '/' + r[1];
            var text3 = pctVal3 + '% = ？（最简分数）';
            var choices3 = genFracConvertChoices(r[0], r[1], num, den);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '百分数化分数：写成分母为100的分数再约分' };
        } else {
            // 分数 → 百分数
            var d = H.randInt(2, 20);
            var n = H.randInt(1, d);
            while (100 % d !== 0) { d++; if (d > 25) { d = 4; break; } }
            n = H.randInt(1, d);
            var pctVal4 = Math.round(n / d * 100);
            var answer4 = pctVal4 + '%';
            var text4 = n + '/' + d + ' = ？（百分数）';
            var choices4 = genFracToPctChoices(pctVal4, n, d);
            return { text: text4, answer: answer4, answerText: answer4, choices: choices4, hint: '分数化百分数：先化成分母为100的分数，再写成百分数' };
        }
    }

    function genConvertChoices(correct, val, mode) {
        var set = new Set();
        set.add(correct);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var fake;
            if (mode === 'pct2dec') {
                // 忘了移小数点
                var wrong = round2(val / 10);
                fake = '' + wrong;
            } else {
                // 忘了加百分号，或移错
                fake = (val * 10) + '%';
            }
            if (fake !== correct && fake !== '0' && fake !== '0%') set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = '' + round2(H.randInt(1, 200) / (mode === 'pct2dec' ? 100 : 1));
            if (fake !== correct) set.add(fake);
            fb++;
            if (fb > 20) break;
        }
        return H.shuffle(Array.from(set));
    }

    function genFracConvertChoices(rN, rD, origN, origD) {
        var correctStr = rN + '/' + rD;
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                fake = origN + '/' + origD;
            } else if (type === 1) {
                fake = (rN + 1) + '/' + rD;
            } else {
                fake = rN + '/' + (rD + H.randInt(1, 5));
            }
            if (fake !== correctStr) set.add(fake);
        }
        return H.shuffle(Array.from(set));
    }

    function genFracToPctChoices(correctPct, n, d) {
        var correctStr = correctPct + '%';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                fake = (correctPct / 10) + '%';
            } else if (type === 1) {
                fake = (correctPct * 10) + '%';
            } else {
                fake = (correctPct + H.randInt(-5, 5)) + '%';
            }
            if (fake !== correctStr && fake !== '0%') set.add(fake);
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 求百分率 ── */

    function genRateQ() {
        var items = [
            { context: '全班有40人，其中男生24人', question: '男生占全班的百分之几？', part: 24, total: 40 },
            { context: '一批货物共200箱，运走了75箱', question: '运走了百分之几？', part: 75, total: 200 },
            { context: '果园有苹果树150棵，梨树50棵', question: '梨树占总棵数的百分之几？', part: 50, total: 200 },
            { context: '一次考试，30人及格，5人不及格', question: '及格率是百分之几？', part: 30, total: 35 },
            { context: '工厂计划生产500件产品，实际生产了450件', question: '完成计划的百分之几？', part: 450, total: 500 },
            { context: '一个书包原价80元，现价64元', question: '现价是原价的百分之几？', part: 64, total: 80 }
        ];
        var pick = items[H.randInt(0, items.length - 1)];
        var pctVal = Math.round(pick.part / pick.total * 100);
        var answer = pctVal + '%';
        var text = pick.context + '\n' + pick.question;

        var set = new Set();
        set.add(answer);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake;
            if (type === 0) {
                // 用part直接当百分数
                fake = pick.part + '%';
            } else if (type === 1) {
                // 反过来
                fake = Math.round(pick.total / pick.part * 100) + '%';
            } else if (type === 2) {
                // 百分号前偏移
                fake = (pctVal + H.randInt(-10, 10)) + '%';
            } else {
                // 漏了四舍五入
                fake = round2(pick.part / pick.total * 100) + '%';
            }
            if (fake !== answer && fake !== '0%') set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = H.randInt(10, 99) + '%';
            if (fake !== answer) set.add(fake);
            fb++;
            if (fb > 20) break;
        }
        return {
            text: text, answer: answer, answerText: answer,
            choices: H.shuffle(Array.from(set)),
            hint: '百分率 = 部分 ÷ 总数 × 100%'
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
                '<div class="pc1-wrap">' +
                    '<div class="pc1-header">' +
                        H.guideBarHTML('💯', '百分比换算——百分数的魔法！', 'pc1-guide') +
                    '</div>' +
                    '<div class="pc1-body" id="pc1-body"></div>' +
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
                    H.updateGuide('百分数意义掌握啦！挑战互化！', 'pc1-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('互化高手！挑战求百分率！', 'pc1-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pc1-body');
            var phaseLabels = { 1: '百分数的意义', 2: '百分数互化', 3: '求百分率' };
            var phaseEmojis = { 1: '💯', 2: '🔄', 3: '📊' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'pc1-guide');

            body.innerHTML =
                '<div class="pc1-card">' +
                    '<div class="pc1-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="pc1-card-num">' + q.text + '</div>' +
                    '<div class="pc1-card-hint">' + q.hint + '</div>' +
                    '<div class="pc1-card-choices" id="pc1-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices, 'pc1-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('百分数达人！换算得又快又准！', 'pc1-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#pc1-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#pc1-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#pc1-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了百分数的意义、互化和求百分率！', NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genMeaningQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genConvertQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genRateQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.pc1-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fee2e2 0%,#fca5a5 40%,#dc2626 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.pc1-header{position:relative;z-index:50;}' +
            '.pc1-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:pc1-fadeIn 0.4s ease;}' +
            '@keyframes pc1-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.pc1-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #dc2626;display:flex;flex-direction:column;align-items:center;gap:18px;animation:pc1-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes pc1-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.pc1-card-emoji{font-size:50px;}' +
            '.pc1-card-num{font-size:22px;font-weight:bold;color:#991b1b;text-align:center;line-height:1.8;background:#fee2e2;padding:14px 28px;border-radius:16px;border:2px solid #fca5a5;white-space:pre-line;}' +
            '.pc1-card-hint{font-size:16px;color:#b91c1c;font-style:italic;}' +
            '.pc1-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
