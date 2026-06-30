/**
 * 六年级上册 第五单元：圆
 * 路径: src/games/grade6/g6_u5_circle.js
 *
 * 玩法："圆的探险"
 *   Phase 1 "圆的基本概念": 圆心、半径、直径。4轮。
 *   Phase 2 "周长计算": C=πd=2πr。4轮。
 *   Phase 3 "面积计算": S=πr²，环形面积。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u5-circle-styles';
    const NEXT_LEVEL = 'lvl_6_6_1';
    var PI = Math.PI;

    /* ── 数学工具 ── */

    function round2(n) { return Math.round(n * 100) / 100; }

    /* ── Phase 1: 圆的基本概念 ── */

    function genConceptQ() {
        var type = H.randInt(0, 3);
        if (type === 0) {
            // 半径和直径关系
            var r = H.randInt(2, 15);
            var d = r * 2;
            var qType = H.randInt(0, 1);
            if (qType === 0) {
                var answer = '' + d;
                var text = '圆的半径是 ' + r + ' cm，直径是多少？';
                var choices = genNumChoices(d, 2, 40);
                return { text: text, answer: answer, answerText: answer, choices: choices, hint: '直径 = 半径 × 2' };
            } else {
                var answer2 = '' + r;
                var text2 = '圆的直径是 ' + d + ' cm，半径是多少？';
                var choices2 = genNumChoices(r, 1, 20);
                return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '半径 = 直径 ÷ 2' };
            }
        } else if (type === 1) {
            // 概念判断
            var concepts = [
                { q: '圆的中心点叫做？', a: '圆心', w: ['半径', '直径', '周长'] },
                { q: '从圆心到圆上任意一点的线段叫做？', a: '半径', w: ['直径', '圆心', '弦'] },
                { q: '通过圆心并且两端都在圆上的线段叫做？', a: '直径', w: ['半径', '弦', '圆心'] },
                { q: '圆的直径是半径的几倍？', a: '2倍', w: ['1倍', '3倍', '4倍'] },
                { q: '同一个圆里，所有半径都？', a: '相等', w: ['不等', '一半', '两倍'] },
                { q: '圆的周长与直径的比值叫做？', a: '圆周率(π)', w: ['半径', '面积', '圆心距'] }
            ];
            var pick = concepts[H.randInt(0, concepts.length - 1)];
            var allChoices = H.shuffle([pick.a].concat(pick.w));
            return { text: pick.q, answer: pick.a, answerText: pick.a, choices: allChoices, hint: '回忆圆的基本概念' };
        } else if (type === 2) {
            // 圆的对称性
            var symConcepts = [
                { q: '圆是轴对称图形吗？', a: '是', w: ['不是', '不确定', '有时是'] },
                { q: '圆有几条对称轴？', a: '无数条', w: ['1条', '2条', '4条'] },
                { q: '圆的对称轴一定经过？', a: '圆心', w: ['半径中点', '圆上', '圆外'] }
            ];
            var pick2 = symConcepts[H.randInt(0, symConcepts.length - 1)];
            var allChoices2 = H.shuffle([pick2.a].concat(pick2.w));
            return { text: pick2.q, answer: pick2.a, answerText: pick2.a, choices: allChoices2, hint: '圆是非常对称的图形' };
        } else {
            // 半径相等判断
            var rA = H.randInt(3, 10);
            var rB = rA;
            var isSame = Math.random() > 0.3;
            if (!isSame) rB = rA + H.randInt(1, 3);
            var answer3 = isSame ? '相等' : '不相等';
            var text3 = '圆A的半径是' + rA + 'cm，圆B的半径是' + rB + 'cm，\n它们的直径相等吗？';
            var choices3 = H.shuffle(['相等', '不相等', '无法确定', '差2倍']);
            return { text: text3, answer: answer3, answerText: answer3, choices: choices3, hint: '直径=半径×2，半径相等则直径相等' };
        }
    }

    /* ── Phase 2: 周长计算 ── */

    function genCircumQ() {
        var type = H.randInt(0, 1);
        if (type === 0) {
            // 已知直径求周长
            var d = H.randInt(2, 20);
            var c = round2(PI * d);
            var answer = c + ' cm';
            var text = '一个圆的直径是 ' + d + ' cm\n周长是多少？（π取3.14）';
            var choices = genCircChoices(c, d, true);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '周长 C = π × d = 3.14 × d' };
        } else {
            // 已知半径求周长
            var r = H.randInt(1, 15);
            var c2 = round2(2 * PI * r);
            var answer2 = c2 + ' cm';
            var text2 = '一个圆的半径是 ' + r + ' cm\n周长是多少？（π取3.14）';
            var choices2 = genCircChoices(c2, r, false);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '周长 C = 2 × π × r = 2 × 3.14 × r' };
        }
    }

    function genCircChoices(correct, val, isDiameter) {
        var correctStr = correct + ' cm';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake;
            if (type === 0) {
                // 用半径代替直径或反之
                fake = (isDiameter ? round2(2 * PI * val) : round2(PI * val)) + ' cm';
            } else if (type === 1) {
                // 用了π²
                fake = round2(PI * PI * val) + ' cm';
            } else if (type === 2) {
                // 加了2
                fake = round2(correct + 2) + ' cm';
            } else {
                fake = round2(correct + H.randInt(-5, 5)) + ' cm';
            }
            if (fake !== correctStr && parseFloat(fake) > 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = round2(H.randInt(10, 100)) + ' cm';
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 20) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 面积计算 ── */

    function genAreaQ() {
        var type = H.randInt(0, 1);
        if (type === 0) {
            // 已知半径求面积
            var r = H.randInt(1, 15);
            var area = round2(PI * r * r);
            var answer = area + ' cm²';
            var text = '一个圆的半径是 ' + r + ' cm\n面积是多少？（π取3.14）';
            var choices = genAreaChoices(area, r);
            return { text: text, answer: answer, answerText: answer, choices: choices, hint: '面积 S = π × r² = 3.14 × r × r' };
        } else {
            // 环形面积
            var rOut = H.randInt(5, 15);
            var rIn = H.randInt(1, rOut - 1);
            var ringArea = round2(PI * (rOut * rOut - rIn * rIn));
            var answer2 = ringArea + ' cm²';
            var text2 = '一个圆环，外圆半径 ' + rOut + ' cm，内圆半径 ' + rIn + ' cm\n圆环面积是多少？（π取3.14）';
            var choices2 = genRingChoices(ringArea, rOut, rIn);
            return { text: text2, answer: answer2, answerText: answer2, choices: choices2, hint: '环形面积 = π × (R² - r²)' };
        }
    }

    function genAreaChoices(correct, r) {
        var correctStr = correct + ' cm²';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake;
            if (type === 0) {
                // 当成周长公式
                fake = round2(2 * PI * r) + ' cm²';
            } else if (type === 1) {
                // 忘了平方
                fake = round2(PI * r) + ' cm²';
            } else if (type === 2) {
                // r²当成了r
                fake = round2(PI * r * r * 2) + ' cm²';
            } else {
                fake = round2(correct + H.randInt(-10, 10)) + ' cm²';
            }
            if (fake !== correctStr && parseFloat(fake) > 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = round2(H.randInt(5, 200)) + ' cm²';
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 20) break;
        }
        return H.shuffle(Array.from(set));
    }

    function genRingChoices(correct, rOut, rIn) {
        var correctStr = correct + ' cm²';
        var set = new Set();
        set.add(correctStr);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 3);
            var fake;
            if (type === 0) {
                // 用R-r的平方
                fake = round2(PI * (rOut - rIn) * (rOut - rIn)) + ' cm²';
            } else if (type === 1) {
                // 两个圆面积相加
                fake = round2(PI * (rOut * rOut + rIn * rIn)) + ' cm²';
            } else if (type === 2) {
                // 只算外圆
                fake = round2(PI * rOut * rOut) + ' cm²';
            } else {
                fake = round2(correct + H.randInt(-15, 15)) + ' cm²';
            }
            if (fake !== correctStr && parseFloat(fake) > 0) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            fake = round2(H.randInt(10, 300)) + ' cm²';
            if (fake !== correctStr) set.add(fake);
            fb++;
            if (fb > 20) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── 通用数字选项 ── */

    function genNumChoices(correct, min, max) {
        var set = new Set();
        set.add('' + correct);
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var fake = correct + H.randInt(-3, 3);
            if (fake >= min && fake <= max && fake !== correct) set.add('' + fake);
        }
        var fb = min;
        while (set.size < 4) {
            if (fb !== correct && fb >= min && fb <= max) set.add('' + fb);
            fb++;
            if (fb > max + 5) break;
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
                '<div class="crc-wrap">' +
                    '<div class="crc-header">' +
                        H.guideBarHTML('⭕', '圆的探险——圆的世界真奇妙！', 'crc-guide') +
                    '</div>' +
                    '<div class="crc-body" id="crc-body"></div>' +
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
                    H.updateGuide('圆的基本概念没问题！挑战周长计算！', 'crc-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('周长计算棒棒哒！挑战面积计算！', 'crc-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('crc-body');
            var phaseLabels = { 1: '基本概念', 2: '周长计算', 3: '面积计算' };
            var phaseEmojis = { 1: '🔵', 2: '📏', 3: '📐' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'crc-guide');

            body.innerHTML =
                '<div class="crc-card">' +
                    '<div class="crc-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="crc-card-num">' + q.text + '</div>' +
                    '<div class="crc-card-hint">' + q.hint + '</div>' +
                    '<div class="crc-card-choices" id="crc-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices, 'crc-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('太棒了！圆的探索者！', 'crc-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#crc-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#crc-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#crc-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了圆的概念、周长和面积计算！', NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genConceptQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genCircumQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }
    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) { tries++; var q = genAreaQ(); if (!seen[q.text]) { seen[q.text] = true; qs.push(q); } }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.crc-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#dcfce7 0%,#86efac 40%,#16a34a 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.crc-header{position:relative;z-index:50;}' +
            '.crc-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:crc-fadeIn 0.4s ease;}' +
            '@keyframes crc-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.crc-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #16a34a;display:flex;flex-direction:column;align-items:center;gap:18px;animation:crc-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes crc-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.crc-card-emoji{font-size:50px;}' +
            '.crc-card-num{font-size:24px;font-weight:bold;color:#14532d;text-align:center;line-height:1.8;background:#dcfce7;padding:14px 28px;border-radius:16px;border:2px solid #86efac;white-space:pre-line;}' +
            '.crc-card-hint{font-size:16px;color:#15803d;font-style:italic;}' +
            '.crc-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
