/**
 * 五年级上册 第六单元：多边形的面积
 * 路径: src/games/grade5/g5_u6_polygon_area.js
 *
 * 玩法："面积工程师"
 *   Phase 1 "平行四边形面积": 已知底和高求面积。4轮。
 *   Phase 2 "三角形与梯形面积": 求三角形和梯形面积。4轮。
 *   Phase 3 "组合图形面积": 求由简单图形组合成的复杂图形面积。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u6-polygon-area-styles';
    const NEXT_LEVEL = 'lvl_5_7_1';

    /** 格式化数字，去掉末尾零 */
    function fmtAns(n) {
        var s = n.toFixed(10);
        s = s.replace(/\.?0+$/, '');
        return s;
    }

    /** 生成面积选项 */
    function genAreaChoices(correct) {
        var cNum = parseFloat(correct);
        var set = new Set();
        set.add(correct);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var off = H.randInt(1, 10);
            if (H.randInt(0, 1) === 0) off = -off;
            var v = cNum + off;
            if (v > 0 && fmtAns(v) !== correct) set.add(fmtAns(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 平行四边形面积 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var base = H.randInt(3, 15);
            var h = H.randInt(2, 12);
            var area = base * h;
            qs.push({
                text: '平行四边形底 = ' + base + 'cm，高 = ' + h + 'cm，面积 = ?',
                answer: fmtAns(area) + ' cm²',
                choices: genAreaChoices(fmtAns(area) + ' cm²'),
                hint: '平行四边形面积 = 底 × 高'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 三角形与梯形面积 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 8; i++) {
            var isTriangle = H.randInt(0, 1) === 0;
            if (isTriangle) {
                var base = H.randInt(3, 16);
                var h = H.randInt(2, 12);
                var area = base * h / 2;
                qs.push({
                    text: '🔺三角形：底 = ' + base + 'cm，高 = ' + h + 'cm，面积 = ?',
                    answer: fmtAns(area) + ' cm²',
                    choices: genAreaChoices(fmtAns(area) + ' cm²'),
                    hint: '三角形面积 = 底 × 高 ÷ 2'
                });
            } else {
                var top = H.randInt(2, 8);
                var bottom = H.randInt(top + 1, 16);
                var h2 = H.randInt(2, 10);
                var area2 = (top + bottom) * h2 / 2;
                qs.push({
                    text: '🔻梯形：上底 = ' + top + 'cm，下底 = ' + bottom + 'cm，高 = ' + h2 + 'cm，面积 = ?',
                    answer: fmtAns(area2) + ' cm²',
                    choices: genAreaChoices(fmtAns(area2) + ' cm²'),
                    hint: '梯形面积 = (上底 + 下底) × 高 ÷ 2'
                });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 组合图形面积 ── */
    function buildPhase3() {
        var qs = [];

        // 组合1：长方形 + 三角形
        for (var i = 0; i < 2; i++) {
            var rw = H.randInt(4, 10);
            var rh = H.randInt(3, 8);
            var tb = H.randInt(3, rw);
            var th = H.randInt(2, 6);
            var area = rw * rh + tb * th / 2;
            qs.push({
                text: '房屋形状：长方形(' + rw + '×' + rh + ') + 三角形(底' + tb + '，高' + th + ')，总面积 = ?',
                answer: fmtAns(area) + ' cm²',
                choices: genAreaChoices(fmtAns(area) + ' cm²'),
                hint: '分别算出两部分面积再相加'
            });
        }

        // 组合2：大平行四边形 - 小三角形
        for (var i = 0; i < 2; i++) {
            var pb = H.randInt(8, 16);
            var ph = H.randInt(5, 10);
            var tb2 = H.randInt(3, pb - 2);
            var th2 = H.randInt(2, ph - 1);
            var area2 = pb * ph - tb2 * th2 / 2;
            qs.push({
                text: '挖去形状：平行四边形(' + pb + '×' + ph + ') 减去 三角形(底' + tb2 + '，高' + th2 + ')，面积 = ?',
                answer: fmtAns(area2) + ' cm²',
                choices: genAreaChoices(fmtAns(area2) + ' cm²'),
                hint: '大图形面积 - 小图形面积'
            });
        }

        return H.shuffle(qs).slice(0, 4);
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
                '<div class="pga-wrap">' +
                    '<div class="pga-header">' +
                        H.guideBarHTML('📐', '面积工程师——多边形面积大挑战！', 'pga-guide') +
                    '</div>' +
                    '<div class="pga-body" id="pga-body"></div>' +
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
                    H.updateGuide('平行四边形面积掌握！来算三角形和梯形！', 'pga-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：组合图形面积！', 'pga-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pga-body');
            var phaseLabels = { 1: '平行四边形', 2: '三角形与梯形', 3: '组合图形' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'pga-guide');

            var phaseEmoji = state.phase === 1 ? '▱' : state.phase === 2 ? '🔺' : '🏗️';

            body.innerHTML =
                '<div class="pga-card">' +
                    '<div class="pga-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="pga-card-num">' + q.text + '</div>' +
                    '<div class="pga-card-hint">' + q.hint + '</div>' +
                    '<div class="pga-card-choices" id="pga-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'pga-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！面积工程师太厉害了！✅', 'pga-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#pga-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#pga-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#pga-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了多边形面积的计算方法！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.pga-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ccfbf1 0%,#5eead4 40%,#14b8a6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.pga-header{position:relative;z-index:50;}' +
            '.pga-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:pga-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes pga-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.pga-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #14b8a6;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:pga-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes pga-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.pga-card-emoji{font-size:50px;}' +
            '.pga-card-num{' +
                'font-size:24px;font-weight:bold;color:#134e4a;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#f0fdfa;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #5eead4;' +
            '}' +
            '.pga-card-hint{' +
                'font-size:16px;color:#0d9488;font-style:italic;' +
            '}' +
            '.pga-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
