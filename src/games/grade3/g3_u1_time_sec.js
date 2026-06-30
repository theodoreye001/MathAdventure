/**
 * 三年级上册 第一单元：时分秒（秒的认识与时间计算）
 * 路径: src/games/grade3/g3_u1_time_sec.js
 *
 * 玩法："秒针竞速"
 *   Phase 1 "单位换算": 分与秒的互化，1分=60秒。4轮选择题。
 *   Phase 2 "时间计算": 计算经过时间，如"8:05出发，8:30到达，用了多少分钟？" 4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u1-time-sec-styles';

    /* ── Phase 1: 单位换算题目 ── */
    function buildConvertQuestions() {
        var qs = [
            { text: '3 分 = ？秒', answer: '180', choices: ['180', '160', '200', '150'] },
            { text: '120 秒 = ？分', answer: '2', choices: ['2', '3', '1', '4'] },
            { text: '5 分 = ？秒', answer: '300', choices: ['300', '350', '250', '260'] },
            { text: '240 秒 = ？分', answer: '4', choices: ['4', '5', '3', '6'] },
            { text: '1 分 30 秒 = ？秒', answer: '90', choices: ['90', '80', '70', '100'] },
            { text: '300 秒 = ？分', answer: '5', choices: ['5', '4', '6', '3'] }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 时间计算题目 ── */
    function buildCalcQuestions() {
        var qs = [
            { text: '小明 8:05 出发，8:30 到达学校，路上用了多少分钟？', answer: '25', choices: ['25', '35', '20', '30'] },
            { text: '一节课 40 分钟，9:00 开始上课，几点下课？', answer: '9时40分', choices: ['9时40分', '9时30分', '10时00分', '9时50分'] },
            { text: '小红 7:20 开始读书，读了 35 分钟，几点结束？', answer: '7时55分', choices: ['7时55分', '8时00分', '7时50分', '7时45分'] },
            { text: '电影 14:30 开始，放映了 90 分钟，几点结束？', answer: '16时00分', choices: ['16时00分', '15时30分', '16时30分', '15时00分'] },
            { text: '跑一圈用了 1 分 45 秒，是多少秒？', answer: '105', choices: ['105', '95', '115', '75'] },
            { text: '上午 8:00 到 8:45，经过了多少分钟？', answer: '45', choices: ['45', '35', '55', '40'] }
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

    /* ── 主模块 ── */
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
            state.questions = buildConvertQuestions();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="tms-wrap">' +
                    '<div class="tms-header">' +
                        H.guideBarHTML('⏱️', '秒针竞速——学会秒和分的换算！', 'tms-guide') +
                    '</div>' +
                    '<div class="tms-body" id="tms-body"></div>' +
                '</div>';
        },

        /* ============================================================
         *  Phase 1 — 单位换算（4 题）
         * ============================================================ */
        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildConvertQuestions();
            this.nextQuestion();
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildCalcQuestions();
                    H.updateGuide('太棒了！现在来算算经过的时间吧！', 'tms-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('tms-body');
            var phaseLabel = state.phase === 1 ? '单位换算' : '时间计算';
            var total = state.phase === 1 ? 4 : 4;

            H.updateGuide('第 ' + (state.qIndex + 1) + '/' + total + ' 题 · ' + phaseLabel, 'tms-guide');

            body.innerHTML =
                '<div class="tms-card">' +
                    '<div class="tms-card-emoji">' + (state.phase === 1 ? '⏱️' : '🕐') + '</div>' +
                    '<div class="tms-card-text">' + q.text + '</div>' +
                    '<div class="tms-card-choices" id="tms-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'tms-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！✅', 'tms-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#tms-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '不对哦，正确答案是 ' + q.answer,
                            document.querySelector('#tms-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#tms-choices .gh-choice-btn[data-idx="' + ci + '"]');
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

        /* ============================================================
         *  结算
         * ============================================================ */
        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 25,
                state.levelData,
                state.mistakes,
                '你学会了分和秒的换算，还能算出经过的时间！',
                'lvl_3_2_1'
            );
        }
    };

    /* ============================================================
     *  CSS
     * ============================================================ */
    function buildCSS() {
        return '' +
            '.tms-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fde68a 40%,#fbbf24 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.tms-header{position:relative;z-index:50;}' +
            '.tms-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:tms-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes tms-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.tms-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:tms-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes tms-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.tms-card-emoji{font-size:52px;}' +
            '.tms-card-text{' +
                'font-size:24px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.tms-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    /* 挂载到全局 */
    window.CurrentGameModule = game;
})();
