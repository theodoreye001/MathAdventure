/**
 * 四年级上册 第二单元：公顷和平方千米
 * 路径: src/games/grade4/g4_u2_area_units.js
 *
 * 玩法："土地面积换算"
 *   Phase 1 "单位认识": 选择合适的面积单位。4轮。
 *   Phase 2 "单位换算": 在m²、公顷、km²之间换算。4轮。
 *   Phase 3 "综合应用": 结合实际场景判断面积。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u2-area-units-styles';
    const NEXT_LEVEL = 'lvl_4_3_1';

    /* ── 面积单位换算关系 ── */
    // 1公顷 = 10000平方米, 1平方千米 = 100公顷 = 1000000平方米

    /* ── Phase 1: 选择合适单位 ── */
    function buildPhase1() {
        var items = [
            { text: '教室地面的面积', answer: '平方米', choices: ['平方千米', '公顷', '平方米', '千米'] },
            { text: '学校操场的面积', answer: '公顷', choices: ['平方千米', '公顷', '平方米', '平方厘米'] },
            { text: '一个城市的面积', answer: '平方千米', choices: ['平方千米', '公顷', '平方米', '厘米'] },
            { text: '天安门广场的面积', answer: '公顷', choices: ['平方千米', '公顷', '平方米', '平方分米'] },
            { text: '一张书桌的面积', answer: '平方米', choices: ['平方千米', '公顷', '平方米', '平方厘米'] },
            { text: '一个省的面积', answer: '平方千米', choices: ['平方千米', '公顷', '平方米', '分米'] },
            { text: '一栋教学楼的占地面积', answer: '平方米', choices: ['平方千米', '公顷', '平方米', '千米'] },
            { text: '一个公园的面积', answer: '公顷', choices: ['平方千米', '公顷', '平方米', '平方分米'] }
        ];
        return H.shuffle(items).slice(0, 4);
    }

    /* ── Phase 2: 单位换算 ── */
    function buildPhase2() {
        var qs = [];
        var templates = [
            // 公顷 → 平方米
            function () {
                var v = H.randInt(1, 9);
                return { text: v + ' 公顷 = （    ）平方米', answer: String(v * 10000), hint: '1公顷 = 10000平方米' };
            },
            // 平方千米 → 公顷
            function () {
                var v = H.randInt(1, 9);
                return { text: v + ' 平方千米 = （    ）公顷', answer: String(v * 100), hint: '1平方千米 = 100公顷' };
            },
            // 平方千米 → 平方米
            function () {
                var v = H.randInt(1, 5);
                return { text: v + ' 平方千米 = （    ）平方米', answer: String(v * 1000000), hint: '1平方千米 = 1000000平方米' };
            },
            // 平方米 → 公顷
            function () {
                var v = H.randInt(1, 9) * 10000;
                return { text: v + ' 平方米 = （    ）公顷', answer: String(v / 10000), hint: '10000平方米 = 1公顷' };
            },
            // 公顷 → 平方千米
            function () {
                var v = H.randInt(1, 9) * 100;
                return { text: v + ' 公顷 = （    ）平方千米', answer: String(v / 100), hint: '100公顷 = 1平方千米' };
            }
        ];

        for (var i = 0; i < 8; i++) {
            var t = templates[H.randInt(0, templates.length - 1)]();
            qs.push({
                text: t.text,
                answer: t.answer,
                hint: t.hint,
                choices: genConvertChoices(parseInt(t.answer))
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function genConvertChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var multipliers = [0.5, 1.5, 2, 0.1, 10];
            var m = multipliers[H.randInt(0, multipliers.length - 1)];
            var v = Math.round(correct * m);
            if (v > 0 && v !== correct) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 综合应用 ── */
    function buildPhase3() {
        var qs = [
            {
                text: '一个长方形菜地长200米，宽100米，面积是多少公顷？',
                answer: '2',
                choices: ['0.2', '2', '20', '200'],
                hint: '先算平方米，再换算公顷'
            },
            {
                text: '一块正方形草地边长是100米，它的面积是多少公顷？',
                answer: '1',
                choices: ['1', '10', '0.1', '100'],
                hint: '100×100=10000平方米'
            },
            {
                text: '3公顷等于多少平方米？',
                answer: '30000',
                choices: ['3000', '30000', '300000', '300'],
                hint: '1公顷=10000平方米'
            },
            {
                text: '一个长方形广场长500米，宽200米，面积是多少平方千米？',
                answer: '0.1',
                choices: ['0.1', '1', '10', '100'],
                hint: '先算平方米，再除以1000000'
            },
            {
                text: '50000平方米等于多少公顷？',
                answer: '5',
                choices: ['5', '50', '0.5', '500'],
                hint: '除以10000'
            },
            {
                text: '2平方千米等于多少公顷？',
                answer: '200',
                choices: ['20', '200', '2000', '2'],
                hint: '1平方千米=100公顷'
            }
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
                '<div class="aun-wrap">' +
                    '<div class="aun-header">' +
                        H.guideBarHTML('🌍', '土地面积换算——掌握公顷和平方千米！', 'aun-guide') +
                    '</div>' +
                    '<div class="aun-body" id="aun-body"></div>' +
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
                    H.updateGuide('单位选对了！来练换算！', 'aun-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('换算熟练了！挑战综合应用！', 'aun-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('aun-body');
            var phaseLabels = { 1: '单位认识', 2: '单位换算', 3: '综合应用' };
            var phaseEmojis = { 1: '🏷️', 2: '🔄', 3: '🧩' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'aun-guide');

            body.innerHTML =
                '<div class="aun-card">' +
                    '<div class="aun-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="aun-card-text">' + q.text + '</div>' +
                    (q.hint ? '<div class="aun-card-hint">💡 ' + q.hint + '</div>' : '') +
                    '<div class="aun-card-choices" id="aun-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'aun-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('换算正确！面积单位小达人！✅', 'aun-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#aun-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#aun-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#aun-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了公顷和平方千米的换算！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.aun-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#d1fae5 0%,#a7f3d0 40%,#34d399 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.aun-header{position:relative;z-index:50;}' +
            '.aun-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:aun-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes aun-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.aun-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #10b981;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:aun-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes aun-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.aun-card-emoji{font-size:50px;}' +
            '.aun-card-text{' +
                'font-size:22px;font-weight:bold;color:#065f46;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.aun-card-hint{' +
                'font-size:15px;color:#059669;font-style:italic;' +
                'background:#ecfdf5;padding:6px 16px;border-radius:12px;' +
            '}' +
            '.aun-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
