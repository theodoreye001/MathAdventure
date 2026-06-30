/**
 * 四年级上册 第八单元：优化策略
 * 路径: src/games/grade4/g4_u8_optimization.js
 *
 * 玩法："时间优化师"
 *   Phase 1 "泡茶问题": 经典统筹优化。4轮。
 *   Phase 2 "烙饼问题": 烙饼最优策略。4轮。
 *   Phase 3 "综合优化": 搬运、排队等优化。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u8-optimization-styles';
    const NEXT_LEVEL = null; // 最后一关

    /* ── Phase 1: 泡茶问题 ── */
    function buildPhase1() {
        var qs = [
            {
                text: '小明要泡茶：洗水壶1分钟，烧水8分钟，洗茶杯2分钟，拿茶叶1分钟，沏茶1分钟。最少需要（    ）分钟。',
                answer: '11',
                hint: '烧水时可以同时洗茶杯和拿茶叶',
                choices: ['10', '11', '12', '13']
            },
            {
                text: '妈妈做饭：洗米2分钟，煮饭20分钟（用电饭锅），切菜5分钟，炒菜8分钟。煮饭时可以切菜和炒菜。最少需要（    ）分钟。',
                answer: '22',
                hint: '先洗米煮饭，煮饭期间做其他事',
                choices: ['20', '22', '25', '35']
            },
            {
                text: '起床后要做的事：穿衣3分钟，洗脸2分钟，煮鸡蛋10分钟，整理书包5分钟。煮鸡蛋时可以做别的。最少需要（    ）分钟。',
                answer: '13',
                hint: '先煮鸡蛋，在煮的时候穿衣、洗脸、整理书包',
                choices: ['12', '13', '15', '20']
            },
            {
                text: '小红放学回家：淘米2分钟，煮饭15分钟，做菜10分钟，炒菜6分钟。煮饭时做菜，炒菜前要先做菜。最少需要（    ）分钟。',
                answer: '23',
                hint: '淘米→煮饭（同时做菜）→炒菜',
                choices: ['20', '23', '25', '33']
            },
            {
                text: '烧开水需要10分钟，洗茶壶3分钟，洗杯子2分钟，准备茶叶1分钟。烧水时可以做其他三件事。最少需要（    ）分钟。',
                answer: '10',
                hint: '三件事可以同时在烧水时做完',
                choices: ['8', '10', '12', '16']
            },
            {
                text: '爸爸要做：拖地15分钟，擦桌子8分钟，洗衣机洗衣服30分钟（自动），晾衣服5分钟。洗衣机工作时可以拖地和擦桌子。最少需要（    ）分钟。',
                answer: '35',
                hint: '先开洗衣机，同时拖地和擦桌子',
                choices: ['30', '35', '38', '58']
            }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 烙饼问题 ── */
    function buildPhase2() {
        var qs = [
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要3分钟。烙2张饼最少要（    ）分钟。',
                answer: '6',
                hint: '2张饼同时烙，两面各3分钟',
                choices: ['6', '9', '12', '15']
            },
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要3分钟。烙3张饼最少要（    ）分钟。',
                answer: '9',
                hint: '交替烙：正1正2→反1正3→反2反3',
                choices: ['9', '12', '15', '18']
            },
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要3分钟。烙4张饼最少要（    ）分钟。',
                answer: '12',
                hint: '分两批，每批2张',
                choices: ['12', '15', '18', '24']
            },
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要3分钟。烙5张饼最少要（    ）分钟。',
                answer: '15',
                hint: '先烙2张(6分钟)，再烙3张(9分钟)',
                choices: ['15', '18', '20', '30']
            },
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要5分钟。烙3张饼最少要（    ）分钟。',
                answer: '15',
                hint: '交替烙3张，三面各5分钟',
                choices: ['10', '15', '20', '30']
            },
            {
                text: '用平底锅烙饼，一次最多烙2张，每面要4分钟。烙6张饼最少要（    ）分钟。',
                answer: '12',
                hint: '6张可以分3批，每批2张共8分钟？不，用交替法更省',
                choices: ['12', '16', '24', '48']
            }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 综合优化 ── */
    function buildPhase3() {
        var qs = [
            {
                text: '甲到乙要走6分钟，乙到丙要走4分钟。小明从甲经过乙到丙，最少需要（    ）分钟。',
                answer: '10',
                hint: '只能按顺序走',
                choices: ['6', '8', '10', '14']
            },
            {
                text: '有5个学生要过河，每次只能过2人，需要一个会划船的人带回。最少要渡（    ）次（含去和回）。',
                answer: '9',
                hint: '每次过2人，1人划回来',
                choices: ['5', '7', '9', '11']
            },
            {
                text: '烤一个面包要2分钟（两面各1分钟），烤箱一次放4片。烤6片面包最少要（    ）分钟。',
                answer: '3',
                hint: '分两批，每批4片',
                choices: ['2', '3', '4', '6']
            },
            {
                text: '3个人各拿一把钥匙开门，但钥匙都拿错了。最少试（    ）次保证能配对。',
                answer: '3',
                hint: '第一个人最多试2次，第二个人试1次',
                choices: ['2', '3', '4', '6']
            },
            {
                text: '小明骑车去商店要5分钟，买文具3分钟，回家5分钟。最少需要（    ）分钟。',
                answer: '13',
                hint: '三个步骤无法合并',
                choices: ['10', '13', '15', '18']
            },
            {
                text: '煎一条鱼要6分钟（两面各3分钟），锅一次最多煎2条。煎3条鱼最少要（    ）分钟。',
                answer: '9',
                hint: '交替煎法',
                choices: ['6', '9', '12', '18']
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
            state.levelData = levelData || { reward: 35 };
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
                '<div class="opt-wrap">' +
                    '<div class="opt-header">' +
                        H.guideBarHTML('⏱️', '时间优化师——学会合理安排时间！', 'opt-guide') +
                    '</div>' +
                    '<div class="opt-body" id="opt-body"></div>' +
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
                    H.updateGuide('泡茶优化学会了！挑战烙饼问题！', 'opt-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('烙饼大师！最后一关：综合优化！', 'opt-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('opt-body');
            var phaseLabels = { 1: '泡茶问题', 2: '烙饼问题', 3: '综合优化' };
            var phaseEmojis = { 1: '🍵', 2: '🫓', 3: '🧩' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'opt-guide');

            body.innerHTML =
                '<div class="opt-card">' +
                    '<div class="opt-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="opt-card-text">' + q.text + '</div>' +
                    '<div class="opt-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="opt-card-choices" id="opt-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'opt-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('优化策略用得好！时间管理小达人！✅', 'opt-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#opt-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer + '分钟',
                            document.querySelector('#opt-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#opt-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                state.levelData.reward || 35,
                state.levelData,
                state.mistakes,
                '你掌握了统筹优化策略，成为时间优化师！🎉',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.opt-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fce4ec 0%,#f8bbd0 40%,#f06292 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.opt-header{position:relative;z-index:50;}' +
            '.opt-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:opt-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes opt-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.opt-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #e91e63;' +
                'display:flex;flex-direction:column;align-items:center;gap:16px;' +
                'animation:opt-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:580px;width:92%;' +
            '}' +
            '@keyframes opt-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.opt-card-emoji{font-size:48px;}' +
            '.opt-card-text{' +
                'font-size:20px;font-weight:bold;color:#880e4f;' +
                'text-align:center;line-height:1.7;' +
            '}' +
            '.opt-card-hint{' +
                'font-size:14px;color:#c2185b;font-style:italic;' +
                'background:#fce4ec;padding:6px 16px;border-radius:12px;' +
            '}' +
            '.opt-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
