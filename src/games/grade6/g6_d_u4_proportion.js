/**
 * 六年级下册 第四单元：比例
 * 路径: src/games/grade6/g6_d_u4_proportion.js
 *
 * 玩法："比例尺绘图"
 *   Phase 1 "比例认知" (4题): 比例的意义、基本性质、解比例。
 *   Phase 2 "正反比例" (4题): 判断正反比例关系。
 *   Phase 3 "比例尺应用" (4题): 比例尺计算、图上距离与实际距离换算。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-d-u4-proportion-styles';
    const NEXT_LEVEL = 'lvl_6_d_5';

    /* ─────────────────── Phase 1: 比例认知 ─────────────────── */

    var PHASE1 = [
        {
            text: '下面哪个是比例？',
            answer: '3:4 = 6:8',
            choices: ['3:4 = 6:8', '2+3 = 5', '6×3 = 18', '10-4 = 6'],
            hint: '比例是表示两个比相等的式子',
            explain: '比例是两个比相等的式子。3:4 = 6:8，因为3/4 = 6/8 = 0.75。'
        },
        {
            text: '比例 2:5 = 8:20 中，外项之积是（    ）',
            answer: '40',
            choices: ['40', '16', '25', '10'],
            hint: '外项 = 第一项和第四项，内项 = 第二项和第三项',
            explain: '外项是2和20，内项是5和8。外项之积 = 2×20 = 40。内项之积 = 5×8 = 40。它们相等！'
        },
        {
            text: '如果 x:6 = 3:4，那么 x =（    ）',
            answer: '4.5',
            choices: ['4.5', '8', '72', '2'],
            hint: '利用内项积=外项积：4x = 6×3',
            explain: '内项积 = 外项积 → 4x = 18 → x = 18÷4 = 4.5。'
        },
        {
            text: '比例的基本性质是（    ）',
            answer: '内项积等于外项积',
            choices: ['内项积等于外项积', '前项等于后项', '内项等于外项', '两个比相等'],
            hint: '这是比例最重要的性质',
            explain: '在比例 a:b = c:d 中，ad = bc，即外项积 = 内项积。这是解比例的依据。'
        }
    ];

    /* ─────────────────── Phase 2: 正反比例 ─────────────────── */

    var PHASE2 = [
        {
            text: '圆的面积和半径之间（    ）比例',
            answer: '不成',
            choices: ['成正', '成反', '不成', '无法判断'],
            hint: '面积 = πr²，面积÷半径 = πr，比值不是固定值',
            explain: 'S = πr²，S/r = πr（不是常数），所以不成正比例。S×r = πr³（也不是常数），也不成反比例。'
        },
        {
            text: '速度一定时，路程和时间成（    ）比例',
            answer: '正',
            choices: ['正', '反', '不成', '有时正有时反'],
            hint: '路程÷时间 = 速度（定值），比值固定',
            explain: '路程÷时间 = 速度（一定），比值固定，所以路程和时间成正比例。'
        },
        {
            text: '总价一定时，单价和数量成（    ）比例',
            answer: '反',
            choices: ['正', '反', '不成', '无法判断'],
            hint: '单价 × 数量 = 总价（定值），乘积固定',
            explain: '单价×数量 = 总价（一定），乘积固定，所以单价和数量成反比例。'
        },
        {
            text: '下列成正比例关系的是（    ）',
            answer: '正方形边长和周长',
            choices: ['正方形边长和周长', '正方形边长和面积', '被减数和减数', '速度和时间'],
            hint: '周长÷边长 = 4（一定），比值固定',
            explain: '周长 = 4×边长，周长÷边长 = 4（定值），比值固定，成正比例。'
        }
    ];

    /* ─────────────────── Phase 3: 比例尺应用 ─────────────────── */

    var PHASE3 = [
        {
            text: '比例尺1:5000表示图上1厘米代表实际（    ）厘米',
            answer: '5000',
            choices: ['5000', '500', '50', '5'],
            hint: '比例尺 = 图上距离 : 实际距离',
            explain: '1:5000 表示图上1cm对应实际5000cm（即50米）。'
        },
        {
            text: '在比例尺1:2000000的地图上，图上3厘米代表实际距离（    ）千米',
            answer: '60',
            choices: ['60', '6', '600', '0.6'],
            hint: '实际距离 = 图上距离 × 2000000 = 6000000厘米 = ?千米',
            explain: '实际距离 = 3 × 2000000 = 6000000cm = 60000m = 60km。'
        },
        {
            text: '甲乙两地实际距离120千米，画在比例尺1:3000000的地图上，图上距离是（    ）厘米',
            answer: '4',
            choices: ['4', '36', '0.4', '40'],
            hint: '图上距离 = 实际距离 ÷ 比例尺分母',
            explain: '120km = 12000000cm。图上距离 = 12000000 ÷ 3000000 = 4（cm）。'
        },
        {
            text: '一幅地图的比例尺是0 50 100 150千米，它是（    ）比例尺',
            answer: '线段比例尺',
            choices: ['线段比例尺', '数值比例尺', '文字比例尺', '面积比例尺'],
            hint: '用线段表示的比例尺叫线段比例尺',
            explain: '用一段一段的线段并在上面标注实际距离的，叫做线段比例尺。这段线段比例尺相当于1:5000000。'
        }
    ];

    /* ─────────────────── 比例尺可视化 ─────────────────── */

    function renderScaleBar() {
        return '' +
            '<div class="prp-scalebar-wrap">' +
                '<svg width="300" height="50" viewBox="0 0 300 50">' +
                    '<rect x="10" y="20" width="60" height="12" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>' +
                    '<rect x="70" y="20" width="60" height="12" fill="#93c5fd" stroke="#1d4ed8" stroke-width="1"/>' +
                    '<rect x="130" y="20" width="60" height="12" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>' +
                    '<rect x="190" y="20" width="60" height="12" fill="#93c5fd" stroke="#1d4ed8" stroke-width="1"/>' +
                    '<text x="10" y="44" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e40af">0</text>' +
                    '<text x="70" y="44" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e40af">50km</text>' +
                    '<text x="130" y="44" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e40af">100km</text>' +
                    '<text x="190" y="44" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e40af">150km</text>' +
                    '<text x="250" y="44" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e40af">200km</text>' +
                '</svg>' +
            '</div>';
    }

    /* ─────────────────── 游戏状态 ─────────────────── */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
    };

    /* ─────────────────── CSS ─────────────────── */

    function buildCSS() {
        return '' +
            '.prp-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#dbeafe 0%,#60a5fa 50%,#2563eb 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.prp-header{position:relative;z-index:50;}' +
            '.prp-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:prp-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes prp-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.prp-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #2563eb;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:prp-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes prp-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.prp-card-emoji{font-size:40px;}' +
            '.prp-card-text{' +
                'font-size:20px;font-weight:bold;color:#1e3a5f;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.prp-card-hint{' +
                'font-size:15px;color:#2563eb;font-style:italic;' +
            '}' +
            '.prp-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;width:100%;' +
            '}' +
            '.prp-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 比例尺 */
            '.prp-scalebar-wrap{display:flex;justify-content:center;padding:6px 0;}' +

            /* 公式提示 */
            '.prp-formula{' +
                'background:#eff6ff;border:2px solid #93c5fd;border-radius:12px;' +
                'padding:10px 18px;font-size:15px;color:#1e40af;' +
                'text-align:center;line-height:1.6;' +
            '}' +

            '.prp-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#2563eb,#3b82f6);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(37,99,235,0.35);' +
                'animation:prp-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            '.prp-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.prp-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#60a5fa,#2563eb);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            '.prp-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '比例' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1.slice();

            this.render();
            this.showPhaseTransition('📐 比例认知', '比例是什么？从基本性质开始学起！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="prp-wrap">' +
                    '<div class="prp-header">' +
                        H.guideBarHTML('🗺️', '比例尺绘图——比例的应用！', 'prp-guide') +
                    '</div>' +
                    '<div class="prp-body" id="prp-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('prp-body');
            body.innerHTML =
                '<div class="prp-phase-banner">' + title + '</div>' +
                '<div style="font-size:18px;color:#1e3a5f;text-align:center;margin-top:8px;">' +
                    subtitle + '</div>';
            setTimeout(function () { self.nextQuestion(); }, 1800);
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = PHASE2.slice();
                    H.updateGuide('比例基本功扎实！来判断正反比例！', 'prp-guide');
                    this.showPhaseTransition('📊 正反比例', '判断两个量之间成什么比例关系！');
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = PHASE3.slice();
                    H.updateGuide('正反比例全掌握！来用比例尺画图！', 'prp-guide');
                    this.showPhaseTransition('🗺️ 比例尺应用', '地图上的距离和实际距离，用比例尺来换算！');
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('prp-body');
            var phaseLabels = { 1: '比例认知', 2: '正反比例', 3: '比例尺应用' };
            var phaseEmojis = { 1: '📐', 2: '📊', 3: '🗺️' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var pct = Math.round(totalDone / 12 * 100);

            H.updateGuide('第 ' + (totalDone + 1) + '/12 题 · ' + phaseLabels[state.phase], 'prp-guide');

            var extraHTML = '';
            if (state.phase === 3) {
                extraHTML = renderScaleBar();
            }

            var formulaHTML = '';
            if (state.phase === 1) {
                formulaHTML = '<div class="prp-formula">📐 比例基本性质：外项积 = 内项积 → a×d = b×c</div>';
            } else if (state.phase === 2) {
                formulaHTML = '<div class="prp-formula">📊 正比例：y/x = k（定值）| 反比例：x×y = k（定值）</div>';
            } else if (state.phase === 3) {
                formulaHTML = '<div class="prp-formula">🗺️ 比例尺 = 图上距离 : 实际距离</div>';
            }

            body.innerHTML =
                '<div class="prp-card">' +
                    '<div class="prp-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    extraHTML +
                    formulaHTML +
                    '<div class="prp-card-text">' + q.text + '</div>' +
                    '<div class="prp-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="prp-card-explain" id="prp-explain">📖 ' + q.explain + '</div>' +
                    '<div class="prp-card-choices" id="prp-choices"></div>' +
                '</div>' +
                '<div class="prp-progress"><div class="prp-progress-fill" style="width:' + pct + '%"></div></div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'prp-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];
                    var el = document.querySelector('#prp-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        H.updateGuide('答对了！比例尺小专家！✅', 'prp-guide');
                        if (el) el.classList.add('prp-correct');
                        self.updateMastery(8);
                        var explainEl = document.getElementById('prp-explain');
                        if (explainEl) explainEl.style.display = 'block';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1800);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, el);
                        self.updateMastery(-5);
                        self.logError(q.text, picked);
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var correctEl = document.querySelector('#prp-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('prp-correct');
                            }
                        });
                        var explainEl2 = document.getElementById('prp-explain');
                        if (explainEl2) explainEl2.style.display = 'block';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2400);
                    }
                }
            );
        },

        updateMastery: function (delta) {
            if (window.GameManager && window.GameManager.updateMastery) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, delta);
            }
        },

        logError: function (qText, picked) {
            if (window.GameManager && window.GameManager.logError) {
                window.GameManager.logError(state.levelData.levelId || 'g6_d_u4', qText, picked);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了比例、正反比例和比例尺的应用！🗺️',
                NEXT_LEVEL
            );
        }
    };

    window.CurrentGameModule = game;
})();
