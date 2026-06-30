/**
 * 三年级上册 第七单元：长方形和正方形的周长
 * 路径: src/games/grade3/g3_u7_perimeter.js
 *
 * 玩法："周长建筑师"
 *   Phase 1 "长方形周长": 给出长和宽，计算周长。附 CSS 长方形示意。4轮。
 *   Phase 2 "正方形周长": 给出边长，计算周长。附 CSS 正方形示意。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u7-perimeter-styles';

    /* ── Phase 1: 长方形周长 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var len = H.randInt(3, 12);
            var wid = H.randInt(2, len - 1);
            var perimeter = (len + wid) * 2;
            qs.push({
                shape: 'rect',
                len: len,
                wid: wid,
                text: '长方形：长 ' + len + ' 厘米，宽 ' + wid + ' 厘米，周长 = ？厘米',
                answer: String(perimeter),
                choices: generateChoices(perimeter)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 正方形周长 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var side = H.randInt(3, 15);
            var perimeter = side * 4;
            qs.push({
                shape: 'square',
                side: side,
                text: '正方形：边长 ' + side + ' 厘米，周长 = ？厘米',
                answer: String(perimeter),
                choices: generateChoices(perimeter)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function generateChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-4, 4);
            if (off === 0) off = 2;
            var v = correct + off;
            if (v > 0) set.add(String(v));
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
            state.levelData = levelData || { reward: 25 };
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
                '<div class="prm-wrap">' +
                    '<div class="prm-header">' +
                        H.guideBarHTML('🏗️', '周长建筑师——学会计算图形周长！', 'prm-guide') +
                    '</div>' +
                    '<div class="prm-body" id="prm-body"></div>' +
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
                    H.updateGuide('长方形周长没问题！来算正方形的！', 'prm-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('prm-body');
            var phaseLabel = state.phase === 1 ? '长方形周长' : '正方形周长';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'prm-guide');

            var shapeHTML = '';
            if (q.shape === 'rect') {
                var rw = Math.min(q.len * 28, 220);
                var rh = Math.min(q.wid * 28, 160);
                shapeHTML =
                    '<div class="prm-shape-wrap">' +
                        '<div class="prm-rect" style="width:' + rw + 'px;height:' + rh + 'px;">' +
                            '<span class="prm-label prm-label-top">' + q.len + ' cm</span>' +
                            '<span class="prm-label prm-label-side">' + q.wid + ' cm</span>' +
                        '</div>' +
                    '</div>';
            } else {
                var sq = Math.min(q.side * 28, 180);
                shapeHTML =
                    '<div class="prm-shape-wrap">' +
                        '<div class="prm-square" style="width:' + sq + 'px;height:' + sq + 'px;">' +
                            '<span class="prm-label prm-label-top">' + q.side + ' cm</span>' +
                            '<span class="prm-label prm-label-side">' + q.side + ' cm</span>' +
                        '</div>' +
                    '</div>';
            }

            body.innerHTML =
                '<div class="prm-card">' +
                    '<div class="prm-card-emoji">' + (q.shape === 'rect' ? '📏' : '📐') + '</div>' +
                    shapeHTML +
                    '<div class="prm-card-text">' + q.text + '</div>' +
                    '<div class="prm-card-choices" id="prm-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'prm-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('周长算对了！你真棒！✅', 'prm-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#prm-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案是 ' + q.answer + ' 厘米',
                            document.querySelector('#prm-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#prm-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                state.levelData.reward || 25,
                state.levelData,
                state.mistakes,
                '你学会了长方形和正方形周长的计算！',
                'lvl_3_8_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.prm-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ccfbf1 0%,#99f6e4 40%,#5eead4 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.prm-header{position:relative;z-index:50;}' +
            '.prm-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:prm-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes prm-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.prm-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #14b8a6;' +
                'display:flex;flex-direction:column;align-items:center;gap:16px;' +
                'animation:prm-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes prm-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.prm-card-emoji{font-size:44px;}' +

            /* 图形展示 */
            '.prm-shape-wrap{display:flex;justify-content:center;margin:5px 0;}' +
            '.prm-rect{' +
                'border:4px solid #0d9488;background:rgba(20,184,166,0.1);' +
                'border-radius:6px;position:relative;' +
                'box-shadow:0 4px 12px rgba(13,148,136,0.15);' +
                'transition:all 0.3s;' +
            '}' +
            '.prm-square{' +
                'border:4px solid #0d9488;background:rgba(20,184,166,0.1);' +
                'border-radius:6px;position:relative;' +
                'box-shadow:0 4px 12px rgba(13,148,136,0.15);' +
            '}' +
            '.prm-label{' +
                'position:absolute;font-size:14px;font-weight:bold;color:#0d9488;' +
                'background:rgba(255,255,255,0.9);padding:2px 8px;border-radius:8px;' +
            '}' +
            '.prm-label-top{top:-12px;left:50%;transform:translateX(-50%);}' +
            '.prm-label-side{right:-40px;top:50%;transform:translateY(-50%);}' +

            '.prm-card-text{' +
                'font-size:20px;font-weight:bold;color:#134e4a;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.prm-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
