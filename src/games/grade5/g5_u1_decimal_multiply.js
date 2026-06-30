/**
 * 五年级上册 第一单元：小数乘法
 * 路径: src/games/grade5/g5_u1_decimal_multiply.js
 *
 * 玩法："小数点定位挑战"
 *   Phase 1 "小数×整数": 计算小数乘以整数，定位小数点。4轮。
 *   Phase 2 "小数×小数": 计算小数乘以小数，定位小数点。4轮。
 *   Phase 3 "实际应用": 小数乘法解决生活问题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u1-decimal-multiply-styles';
    const NEXT_LEVEL = 'lvl_5_2_1';

    /** 生成小数（保留1位小数） */
    function randDec1() {
        return Math.round((H.randInt(11, 99) + H.randInt(1, 9)) * 10) / 100;
    }

    /** 生成小数（保留2位小数） */
    function randDec2() {
        return Math.round((H.randInt(101, 999) + H.randInt(1, 9)) * 10) / 1000;
    }

    /** 格式化结果，去掉末尾多余的零 */
    function fmtNum(n) {
        var s = n.toFixed(10);
        s = s.replace(/\.?0+$/, '');
        return s;
    }

    /** 计算小数位数 */
    function decPlaces(s) {
        var idx = s.indexOf('.');
        return idx === -1 ? 0 : s.length - idx - 1;
    }

    /** 生成选项 */
    function genChoices(correct) {
        var set = new Set();
        set.add(correct);
        var cNum = parseFloat(correct);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var off = (H.randInt(1, 9)) / 10;
            if (H.randInt(0, 1) === 0) off = -off;
            var v = cNum + off;
            if (v > 0 && fmtNum(v) !== correct) set.add(fmtNum(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 小数×整数 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var a = randDec1();
            var b = H.randInt(2, 9);
            var ans = fmtNum(a * b);
            qs.push({
                text: fmtNum(a) + ' × ' + b + ' = ?',
                answer: ans,
                choices: genChoices(ans),
                hint: '小数×整数：先按整数算，再点小数点'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 小数×小数 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var a = randDec1();
            var b = randDec1();
            var ans = fmtNum(a * b);
            qs.push({
                text: fmtNum(a) + ' × ' + fmtNum(b) + ' = ?',
                answer: ans,
                choices: genChoices(ans),
                hint: '数一数两个因数共有几位小数'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 实际应用 ── */
    function buildPhase3() {
        var templates = [
            function () {
                var price = fmtNum(H.randInt(2, 8) + H.randInt(1, 9) / 10);
                var qty = H.randInt(3, 9);
                return {
                    text: '每千克苹果' + price + '元，买' + qty + '千克需要多少钱？',
                    answer: fmtNum(parseFloat(price) * qty)
                };
            },
            function () {
                var spd = fmtNum(H.randInt(3, 8) + H.randInt(1, 9) / 10);
                var t = H.randInt(2, 6);
                return {
                    text: '小明每小时走' + spd + '千米，走了' + t + '小时，共走多少千米？',
                    answer: fmtNum(parseFloat(spd) * t)
                };
            },
            function () {
                var w = fmtNum(H.randInt(1, 4) + H.randInt(1, 9) / 10);
                var n = H.randInt(8, 20);
                return {
                    text: '每本练习本' + w + '元，买' + n + '本需要多少钱？',
                    answer: fmtNum(parseFloat(w) * n)
                };
            },
            function () {
                var l = fmtNum(H.randInt(2, 6) + H.randInt(1, 9) / 10);
                var w2 = fmtNum(H.randInt(1, 4) + H.randInt(1, 9) / 10);
                return {
                    text: '长方形长' + l + '米，宽' + w2 + '米，面积是多少平方米？',
                    answer: fmtNum(parseFloat(l) * parseFloat(w2))
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
                hint: '用小数乘法来解决'
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
                '<div class="dmu-wrap">' +
                    '<div class="dmu-header">' +
                        H.guideBarHTML('🔢', '小数点定位挑战——小数乘法大冒险！', 'dmu-guide') +
                    '</div>' +
                    '<div class="dmu-body" id="dmu-body"></div>' +
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
                    H.updateGuide('太棒了！升级到小数×小数！', 'dmu-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最后冲刺：用小数乘法解决问题！', 'dmu-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('dmu-body');
            var phaseLabels = { 1: '小数×整数', 2: '小数×小数', 3: '实际应用' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'dmu-guide');

            var phaseEmoji = state.phase === 1 ? '✖️' : state.phase === 2 ? '✖️' : '🛒';

            body.innerHTML =
                '<div class="dmu-card">' +
                    '<div class="dmu-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="dmu-card-num">' + q.text + '</div>' +
                    '<div class="dmu-card-hint">' + q.hint + '</div>' +
                    '<div class="dmu-card-choices" id="dmu-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'dmu-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！小数点定位高手！✅', 'dmu-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#dmu-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#dmu-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#dmu-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了小数乘法的计算方法和小数点定位！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.dmu-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#dbeafe 0%,#93c5fd 40%,#3b82f6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.dmu-header{position:relative;z-index:50;}' +
            '.dmu-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:dmu-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes dmu-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.dmu-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #3b82f6;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:dmu-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes dmu-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.dmu-card-emoji{font-size:50px;}' +
            '.dmu-card-num{' +
                'font-size:30px;font-weight:bold;color:#1e40af;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#eff6ff;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #93c5fd;' +
            '}' +
            '.dmu-card-hint{' +
                'font-size:16px;color:#2563eb;font-style:italic;' +
            '}' +
            '.dmu-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
