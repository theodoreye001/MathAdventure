/**
 * 五年级上册 第四单元：可能性
 * 路径: src/games/grade5/g5_u4_probability.js
 *
 * 玩法："概率转盘"
 *   Phase 1 "判断可能性": 判断事件的可能性（一定/可能/不可能）。4轮。
 *   Phase 2 "数量与可能性": 根据不同颜色球的数量判断摸到哪种颜色的可能性大小。4轮。
 *   Phase 3 "设计转盘": 根据描述判断转盘各区域的大小关系。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-u4-probability-styles';
    const NEXT_LEVEL = 'lvl_5_5_1';

    var EVENTS = [
        { text: '太阳从西边升起', answer: '不可能', emoji: '🌅' },
        { text: '明天会下雨', answer: '可能', emoji: '🌧️' },
        { text: '抛一枚硬币正面朝上', answer: '可能', emoji: '🪙' },
        { text: '鱼在陆地上走路', answer: '不可能', emoji: '🐟' },
        { text: '今天是星期一', answer: '可能', emoji: '📅' },
        { text: '人会长出翅膀飞起来', answer: '不可能', emoji: '🦅' },
        { text: '摸到红球（袋中有红球和白球）', answer: '可能', emoji: '🔴' },
        { text: '今天会出太阳', answer: '可能', emoji: '☀️' },
        { text: '石头做的球能浮在水上', answer: '不可能', emoji: '🏀' },
        { text: '抛一枚硬币反面朝上', answer: '可能', emoji: '🪙' },
        { text: '太阳每天都会升起', answer: '一定', emoji: '🌅' },
        { text: '掷骰子出现7点', answer: '不可能', emoji: '🎲' },
        { text: '从装有5个红球的袋中摸到红球', answer: '一定', emoji: '🔴' },
        { text: '从装有3个红球2个白球的袋中摸到白球', answer: '可能', emoji: '⚪' },
        { text: '从全是蓝球的袋中摸到红球', answer: '不可能', emoji: '🔵' },
        { text: '小明考了100分', answer: '可能', emoji: '💯' }
    ];

    var PROB_CHOICE_SET = ['一定', '可能', '不可能'];

    function genProbChoices(correct) {
        return H.shuffle(PROB_CHOICE_SET.slice());
    }

    /* ── Phase 1: 判断可能性 ── */
    function buildPhase1() {
        var pool = H.shuffle(EVENTS.slice());
        return pool.slice(0, 4).map(function (e) {
            return {
                text: e.emoji + ' ' + e.text,
                answer: e.answer,
                choices: genProbChoices(e.answer),
                hint: '选择"一定""可能"或"不可能"'
            };
        });
    }

    /* ── Phase 2: 数量与可能性 ── */
    function buildPhase2() {
        var qs = [];
        var colorSets = [
            { colors: ['红', '蓝'], names: ['🔴红球', '🔵蓝球'] },
            { colors: ['黄', '绿', '红'], names: ['🟡黄球', '🟢绿球', '🔴红球'] },
            { colors: ['白', '黑'], names: ['⚪白球', '⚫黑球'] },
            { colors: ['蓝', '红', '黄'], names: ['🔵蓝球', '🔴红球', '🟡黄球'] }
        ];

        for (var i = 0; i < 4; i++) {
            var cs = colorSets[i % colorSets.length];
            var counts = cs.colors.map(function () { return H.randInt(1, 8); });
            // 保证不全相同
            if (counts.every(function (c) { return c === counts[0]; })) {
                counts[0] += 2;
            }
            var maxIdx = 0;
            counts.forEach(function (c, ci) { if (c > counts[maxIdx]) maxIdx = ci; });
            var minIdx = 0;
            counts.forEach(function (c, ci) { if (c < counts[minIdx]) minIdx = ci; });

            var descParts = cs.names.map(function (n, ni) {
                return n + '×' + counts[ni];
            }).join('、');
            var maxName = cs.names[maxIdx];
            var minName = cs.names[minIdx];

            var qType = H.randInt(0, 1);
            if (qType === 0) {
                // 摸到最多的是哪种？
                qs.push({
                    text: '袋中有' + descParts + '，任意摸一个，摸到哪种颜色的可能性最大？',
                    answer: maxName,
                    choices: H.shuffle(cs.names.slice()),
                    hint: '数量最多 → 可能性最大'
                });
            } else {
                // 摸到最少的是哪种？
                qs.push({
                    text: '袋中有' + descParts + '，任意摸一个，摸到哪种颜色的可能性最小？',
                    answer: minName,
                    choices: H.shuffle(cs.names.slice()),
                    hint: '数量最少 → 可能性最小'
                });
            }
        }
        return qs;
    }

    /* ── Phase 3: 设计转盘 ── */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var colorA = H.shuffle(['🔴红', '🔵蓝', '🟢绿', '🟡黄'])[0];
            var colorB = H.shuffle(['🔴红', '🔵蓝', '🟢绿', '🟡黄'].filter(function (c) { return c !== colorA; }))[0];
            var big = H.randInt(3, 7);
            var small = H.randInt(1, big - 1);
            var total = big + small;
            var bigPct = Math.round(big / total * 100);
            var smallPct = Math.round(small / total * 100);

            var qType = H.randInt(0, 1);
            if (qType === 0) {
                qs.push({
                    text: '转盘分成两部分：' + colorA + '占' + bigPct + '%，' + colorB + '占' + smallPct + '%，指针停在哪个区域的可能性更大？',
                    answer: colorA,
                    choices: H.shuffle([colorA, colorB]),
                    hint: '面积越大，指针停在那里的可能性越大'
                });
            } else {
                qs.push({
                    text: '转盘分成两部分：' + colorA + '占' + bigPct + '%，' + colorB + '占' + smallPct + '%，指针停在哪个区域的可能性更小？',
                    answer: colorB,
                    choices: H.shuffle([colorA, colorB]),
                    hint: '面积越小，指针停在那里的可能性越小'
                });
            }
        }
        return qs;
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
                '<div class="prb-wrap">' +
                    '<div class="prb-header">' +
                        H.guideBarHTML('🎰', '概率转盘——可能性大揭秘！', 'prb-guide') +
                    '</div>' +
                    '<div class="prb-body" id="prb-body"></div>' +
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
                    H.updateGuide('判断能力满分！来看看数量与可能性！', 'prb-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：分析转盘概率！', 'prb-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('prb-body');
            var phaseLabels = { 1: '判断可能性', 2: '数量与可能性', 3: '设计转盘' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'prb-guide');

            var phaseEmoji = state.phase === 1 ? '❓' : state.phase === 2 ? '🔴' : '🎯';

            body.innerHTML =
                '<div class="prb-card">' +
                    '<div class="prb-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="prb-card-num">' + q.text + '</div>' +
                    '<div class="prb-card-hint">' + q.hint + '</div>' +
                    '<div class="prb-card-choices" id="prb-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'prb-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！概率小天才！✅', 'prb-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#prb-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#prb-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#prb-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了可能性的基本判断方法！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.prb-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fce7f3 0%,#f9a8d4 40%,#ec4899 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.prb-header{position:relative;z-index:50;}' +
            '.prb-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:prb-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes prb-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.prb-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #ec4899;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:prb-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes prb-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.prb-card-emoji{font-size:50px;}' +
            '.prb-card-num{' +
                'font-size:26px;font-weight:bold;color:#9d174d;' +
                'text-align:center;line-height:1.6;' +
                'background:#fdf2f8;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #f9a8d4;' +
            '}' +
            '.prb-card-hint{' +
                'font-size:16px;color:#db2777;font-style:italic;' +
            '}' +
            '.prb-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
