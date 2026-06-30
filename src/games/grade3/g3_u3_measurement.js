/**
 * 三年级上册 第三单元：测量（毫米、分米、千米、吨）
 * 路径: src/games/grade3/g3_u3_measurement.js
 *
 * 玩法："单位换算转盘"
 *   Phase 1 "长度单位": mm/cm/dm/m/km 之间的换算。4轮。
 *   Phase 2 "质量单位": g/kg/吨 之间的换算。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u3-measurement-styles';

    /* ── Phase 1: 长度单位换算 ── */
    function buildLengthQuestions() {
        var qs = [
            { text: '3 厘米 = ？毫米', answer: '30', choices: ['30', '3', '300', '0.3'] },
            { text: '50 毫米 = ？厘米', answer: '5', choices: ['5', '50', '500', '0.5'] },
            { text: '2 分米 = ？厘米', answer: '20', choices: ['20', '2', '200', '2000'] },
            { text: '40 厘米 = ？分米', answer: '4', choices: ['4', '40', '400', '0.4'] },
            { text: '1 千米 = ？米', answer: '1000', choices: ['1000', '100', '10000', '10'] },
            { text: '6 米 = ？分米', answer: '60', choices: ['60', '6', '600', '6000'] },
            { text: '300 厘米 = ？米', answer: '3', choices: ['3', '30', '300', '0.3'] },
            { text: '7000 米 = ？千米', answer: '7', choices: ['7', '70', '700', '70000'] }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 质量单位换算 ── */
    function buildWeightQuestions() {
        var qs = [
            { text: '1 千克 = ？克', answer: '1000', choices: ['1000', '100', '10000', '10'] },
            { text: '3000 克 = ？千克', answer: '3', choices: ['3', '30', '300', '3000'] },
            { text: '2 吨 = ？千克', answer: '2000', choices: ['2000', '200', '20000', '20'] },
            { text: '5000 千克 = ？吨', answer: '5', choices: ['5', '50', '500', '5000'] },
            { text: '4 吨 = ？千克', answer: '4000', choices: ['4000', '400', '40000', '40'] },
            { text: '8000 克 = ？千克', answer: '8', choices: ['8', '80', '800', '8000'] },
            { text: '1 吨 = ？克', answer: '1000000', choices: ['1000000', '100000', '10000', '10000000'] },
            { text: '6000 千克 = ？吨', answer: '6', choices: ['6', '60', '600', '6000'] }
        ];
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
            state.levelData = levelData || { reward: 25 };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = buildLengthQuestions();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="mea-wrap">' +
                    '<div class="mea-header">' +
                        H.guideBarHTML('📏', '单位换算转盘——掌握长度和质量单位！', 'mea-guide') +
                    '</div>' +
                    '<div class="mea-body" id="mea-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildLengthQuestions();
            this.nextQuestion();
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildWeightQuestions();
                    H.updateGuide('长度单位没问题！来挑战质量单位！', 'mea-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('mea-body');
            var phaseLabel = state.phase === 1 ? '📏 长度单位' : '⚖️ 质量单位';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'mea-guide');

            body.innerHTML =
                '<div class="mea-card">' +
                    '<div class="mea-card-emoji">' + (state.phase === 1 ? '📐' : '⚖️') + '</div>' +
                    '<div class="mea-card-text">' + q.text + '</div>' +
                    '<div class="mea-card-choices" id="mea-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'mea-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('正确！你对单位换算很熟练！✅', 'mea-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#mea-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案是 ' + q.answer,
                            document.querySelector('#mea-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#mea-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你学会了毫米、厘米、分米、米、千米和吨、千克、克的换算！',
                'lvl_3_4_1'
            );
        }
    };

    function buildCSS() {
        return '' +
            '.mea-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#d1fae5 0%,#a7f3d0 40%,#6ee7b7 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.mea-header{position:relative;z-index:50;}' +
            '.mea-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:mea-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes mea-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.mea-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #10b981;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:mea-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes mea-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.mea-card-emoji{font-size:52px;}' +
            '.mea-card-text{' +
                'font-size:24px;font-weight:bold;color:#065f46;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.mea-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
