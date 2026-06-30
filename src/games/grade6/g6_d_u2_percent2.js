/**
 * 六年级下册 第二单元：百分数（二）
 * 路径: src/games/grade6/g6_d_u2_percent2.js
 *
 * 玩法："折扣王国"
 *   Phase 1 "折扣与成数" (4题): 折扣（几折）的含义，成数与百分数互化。
 *   Phase 2 "税率与利率" (4题): 税率计算、利息计算、本金利率关系。
 *   Phase 3 "综合应用" (4题): 购物打折、纳税、存款等综合实际问题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-d-u2-percent2-styles';
    const NEXT_LEVEL = 'lvl_6_d_3';

    /* ─────────────────── Phase 1: 折扣与成数 ─────────────────── */

    var PHASE1 = [
        {
            text: '一件衣服原价200元，打八折后售价是（    ）元',
            answer: '160',
            choices: ['160', '180', '20', '80'],
            hint: '八折 = 原价 × 80% = 原价 × 0.8',
            explain: '八折就是原价的80%。200 × 80% = 200 × 0.8 = 160（元）。'
        },
        {
            text: '一件商品售价是原价的65%，也就是打了（    ）',
            answer: '六五折',
            choices: ['六五折', '六折', '三五折', '六十五折'],
            hint: '65% = 0.65 = 6.5折 = 六五折',
            explain: '65%换算成折扣：65% → 0.65 → 六五折。十分之几就是几折。'
        },
        {
            text: '三成五表示（    ）',
            answer: '35%',
            choices: ['35%', '3.5%', '350%', '0.35%'],
            hint: '一成 = 10%，三成五 = 3.5 × 10%',
            explain: '"成"是十分数的说法。一成 = 1/10 = 10%，三成五 = 3.5/10 = 35%。'
        },
        {
            text: '一本书打七五折后卖22.5元，这本书原价是（    ）元',
            answer: '30',
            choices: ['30', '16.875', '22.5', '25'],
            hint: '原价 × 75% = 22.5，所以原价 = 22.5 ÷ 0.75',
            explain: '七五折 = 75%。原价 = 22.5 ÷ 75% = 22.5 ÷ 0.75 = 30（元）。'
        }
    ];

    /* ─────────────────── Phase 2: 税率与利率 ─────────────────── */

    var PHASE2 = [
        {
            text: '妈妈月工资5000元，按5%缴纳个人所得税，应缴税（    ）元',
            answer: '250',
            choices: ['250', '500', '2500', '50'],
            hint: '应缴税 = 工资 × 税率 = 5000 × 5%',
            explain: '应缴税 = 5000 × 5% = 5000 × 0.05 = 250（元）。'
        },
        {
            text: '把2000元存入银行，年利率3%，一年后利息是（    ）元',
            answer: '60',
            choices: ['60', '30', '600', '2060'],
            hint: '利息 = 本金 × 年利率 × 时间',
            explain: '利息 = 本金 × 利率 × 时间 = 2000 × 3% × 1 = 2000 × 0.03 = 60（元）。'
        },
        {
            text: '某商场本月营业额200万元，按5%缴纳营业税，应缴（    ）万元',
            answer: '10',
            choices: ['10', '50', '100', '40'],
            hint: '营业额 × 税率 = 应缴税',
            explain: '营业税 = 200 × 5% = 200 × 0.05 = 10（万元）。'
        },
        {
            text: '小红存了1000元，年利率2.5%，存两年，到期利息是（    ）元',
            answer: '50',
            choices: ['50', '25', '1050', '200'],
            hint: '利息 = 本金 × 年利率 × 年数',
            explain: '利息 = 1000 × 2.5% × 2 = 1000 × 0.025 × 2 = 50（元）。'
        }
    ];

    /* ─────────────────── Phase 3: 综合应用 ─────────────────── */

    var PHASE3 = [
        {
            text: '一台电脑原价4500元，打八五折后又降价200元，最终售价（    ）元',
            answer: '3625',
            choices: ['3625', '3825', '4300', '3725'],
            hint: '先算打折价：4500 × 85%，再减200',
            explain: '4500 × 85% = 3825，再减200 = 3625（元）。先打折再减价。'
        },
        {
            text: '张叔叔买彩票中了1万元，按20%缴税后实得（    ）元',
            answer: '8000',
            choices: ['8000', '2000', '9800', '10000'],
            hint: '实得 = 奖金 - 税款 = 10000 - 10000 × 20%',
            explain: '税款 = 10000 × 20% = 2000元，实得 = 10000 - 2000 = 8000（元）。'
        },
        {
            text: '王阿姨将5000元存三年定期，年利率3.5%，到期后她一共能取回（    ）元',
            answer: '5525',
            choices: ['5525', '525', '5025', '5500'],
            hint: '取回 = 本金 + 利息 = 5000 + 5000 × 3.5% × 3',
            explain: '利息 = 5000 × 3.5% × 3 = 525元。本息合计 = 5000 + 525 = 5525（元）。'
        },
        {
            text: '一件商品先涨价10%，再打九折出售，最终价格和原价相比（    ）',
            answer: '便宜了1%',
            choices: ['便宜了1%', '贵了1%', '不变', '便宜了10%'],
            hint: '设原价为1，涨价后 = 1 × 110%，再打九折 = 110% × 90% = ?',
            explain: '设原价100元。涨价10% → 110元，打九折 → 110 × 90% = 99元。99 < 100，便宜了1%。'
        }
    ];

    /* ─────────────────── 折扣可视化 ─────────────────── */

    function renderDiscountTag(discount, price) {
        return '' +
            '<div class="pc2-tag-wrap">' +
                '<div class="pc2-tag">' +
                    '<div class="pc2-tag-price">¥' + price + '</div>' +
                    '<div class="pc2-tag-discount">' + discount + '</div>' +
                '</div>' +
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
            '.pc2-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fbbf24 50%,#d97706 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.pc2-header{position:relative;z-index:50;}' +
            '.pc2-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:pc2-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes pc2-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.pc2-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #d97706;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:pc2-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes pc2-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.pc2-card-emoji{font-size:40px;}' +
            '.pc2-card-text{' +
                'font-size:20px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.pc2-card-hint{' +
                'font-size:15px;color:#d97706;font-style:italic;' +
            '}' +
            '.pc2-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;width:100%;' +
            '}' +
            '.pc2-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 折扣标签 */
            '.pc2-tag-wrap{display:flex;justify-content:center;padding:6px 0;}' +
            '.pc2-tag{' +
                'background:linear-gradient(135deg,#ef4444,#dc2626);' +
                'color:white;padding:12px 24px;border-radius:12px;' +
                'text-align:center;box-shadow:0 4px 12px rgba(220,38,38,0.3);' +
                'transform:rotate(-3deg);' +
            '}' +
            '.pc2-tag-price{font-size:20px;font-weight:bold;text-decoration:line-through;opacity:0.7;}' +
            '.pc2-tag-discount{font-size:28px;font-weight:bold;margin-top:4px;}' +

            /* 阶段标题 */
            '.pc2-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#d97706,#ea580c);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(217,119,6,0.35);' +
                'animation:pc2-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            '.pc2-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.pc2-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#fbbf24,#d97706);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            '.pc2-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '百分数（二）' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1.slice();

            this.render();
            this.showPhaseTransition('🏷️ 折扣与成数', '打折的秘密，从"几折"开始！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="pc2-wrap">' +
                    '<div class="pc2-header">' +
                        H.guideBarHTML('🏷️', '折扣王国——百分数的妙用！', 'pc2-guide') +
                    '</div>' +
                    '<div class="pc2-body" id="pc2-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('pc2-body');
            body.innerHTML =
                '<div class="pc2-phase-banner">' + title + '</div>' +
                '<div style="font-size:18px;color:#92400e;text-align:center;margin-top:8px;">' +
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
                    H.updateGuide('折扣高手！来学习税率与利率！', 'pc2-guide');
                    this.showPhaseTransition('💰 税率与利率', '国家税收和银行利息，都是百分数的应用！');
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = PHASE3.slice();
                    H.updateGuide('税率利率全掌握！最终综合挑战！', 'pc2-guide');
                    this.showPhaseTransition('🛒 综合应用', '购物打折、缴税、存款——百分数无处不在！');
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pc2-body');
            var phaseLabels = { 1: '折扣与成数', 2: '税率与利率', 3: '综合应用' };
            var phaseEmojis = { 1: '🏷️', 2: '💰', 3: '🛒' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var pct = Math.round(totalDone / 12 * 100);

            H.updateGuide('第 ' + (totalDone + 1) + '/12 题 · ' + phaseLabels[state.phase], 'pc2-guide');

            body.innerHTML =
                '<div class="pc2-card">' +
                    '<div class="pc2-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="pc2-card-text">' + q.text + '</div>' +
                    '<div class="pc2-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="pc2-card-explain" id="pc2-explain">📖 ' + q.explain + '</div>' +
                    '<div class="pc2-card-choices" id="pc2-choices"></div>' +
                '</div>' +
                '<div class="pc2-progress"><div class="pc2-progress-fill" style="width:' + pct + '%"></div></div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'pc2-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];
                    var el = document.querySelector('#pc2-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        H.updateGuide('答对了！折扣王国的小达人！✅', 'pc2-guide');
                        if (el) el.classList.add('pc2-correct');
                        self.updateMastery(8);
                        var explainEl = document.getElementById('pc2-explain');
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
                                var correctEl = document.querySelector('#pc2-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('pc2-correct');
                            }
                        });
                        var explainEl2 = document.getElementById('pc2-explain');
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
                window.GameManager.logError(state.levelData.levelId || 'g6_d_u2', qText, picked);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了折扣、税率和利率的百分数应用！🏷️',
                NEXT_LEVEL
            );
        }
    };

    window.CurrentGameModule = game;
})();
