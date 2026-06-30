/**
 * 六年级下册 第五单元：数学广角——鸽巢问题
 * 路径: src/games/grade6/g6_d_u5_pigeonhole.js
 *
 * 玩法："抽屉原理"
 *   Phase 1 "理解原理" (4题): 鸽巢原理的基本概念，n+1个物体放入n个抽屉。
 *   Phase 2 "最不利原则" (4题): 至少保证有几个同色/同类的推理。
 *   Phase 3 "综合应用" (4题): 实际生活中的鸽巢原理问题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-d-u5-pigeonhole-styles';
    const NEXT_LEVEL = null;

    /* ─────────────────── Phase 1: 理解原理 ─────────────────── */

    var PHASE1 = [
        {
            text: '把4个苹果放进3个抽屉，至少有一个抽屉里放了（    ）个或更多苹果',
            answer: '2',
            choices: ['1', '2', '3', '4'],
            hint: '4 ÷ 3 = 1...1，至少有1个抽屉放了 1+1=2 个',
            explain: '4个苹果放3个抽屉，平均每个放1个还剩1个，那1个必须放某个抽屉，所以至少有1个抽屉放了2个。'
        },
        {
            text: '鸽巢原理的核心思想是（    ）',
            answer: '物品比抽屉多时，必有抽屉放了多个物品',
            choices: [
                '物品比抽屉多时，必有抽屉放了多个物品',
                '抽屉比物品多时，有的抽屉是空的',
                '所有抽屉放同样多的物品',
                '抽屉数量等于物品数量时最合理'
            ],
            hint: '想想 n+1 个物品放 n 个抽屉的情况',
            explain: '当物品数 > 抽屉数时（如 n+1 个物品放 n 个抽屉），至少有一个抽屉放了2个或更多物品。这就是鸽巢原理（抽屉原理）。'
        },
        {
            text: '把5只鸽子放进4个鸽巢，至少有一个鸽巢里有（    ）只鸽子',
            answer: '2只或更多',
            choices: ['1只', '2只或更多', '3只或更多', '5只'],
            hint: '5 ÷ 4 = 1...1，至少一个巢有 1+1=2 只',
            explain: '5 ÷ 4 = 1余1，平均分后还有1只多出来，所以至少有1个鸽巢放了2只或更多。'
        },
        {
            text: '把3个球放入5个盒子，能保证某个盒子里有2个球吗？',
            answer: '不能',
            choices: ['能', '不能', '看情况', '需要更多信息'],
            hint: '3个球 < 5个盒子，每盒最多放1个也放不满',
            explain: '3 < 5，完全可以每个盒子放0个或1个，不需要某个盒子放2个。只有物品数 > 盒子数时才能保证。'
        }
    ];

    /* ─────────────────── Phase 2: 最不利原则 ─────────────────── */

    var PHASE2 = [
        {
            text: '袋子里有红、黄、蓝三种颜色的球，至少摸出（    ）个球，才能保证有2个同色',
            answer: '4',
            choices: ['3', '4', '5', '6'],
            hint: '最不利情况：每种颜色各摸1个，再摸1个必定重复',
            explain: '3种颜色，最不利情况：先摸到红、黄、蓝各1个（共3个），第4个必定和前面某一个同色。答案 = 3+1 = 4。'
        },
        {
            text: '一个班有25名同学，至少有（    ）名同学在同一个月出生',
            answer: '3',
            choices: ['2', '3', '4', '5'],
            hint: '12个月，25 ÷ 12 = 2...1，至少有一个月有 2+1=3 人',
            explain: '12个月份是"抽屉"，25人分12个月：25÷12 = 2余1，至少有一个月有 2+1=3 人。'
        },
        {
            text: '有红、黄、蓝、绿四种颜色的旗子各若干面，至少取出（    ）面旗子才能保证有2面同色',
            answer: '5',
            choices: ['4', '5', '8', '2'],
            hint: '4种颜色，最不利每种各取1个，再多取1个',
            explain: '4种颜色，最不利情况每种各取1面（共4面），第5面必定和某一面同色。答案 = 4+1 = 5。'
        },
        {
            text: '366个人中，至少有（    ）人的生日在同一天',
            answer: '2',
            choices: ['1', '2', '3', '366'],
            hint: '一年最多366天（闰年），366人分366天',
            explain: '闰年有366天，366人分366天，最平均也至少有1人/天。但实际上至少有2人生日同一天，因为366人分365天（平年）或366天，答案至少是2人。'
        }
    ];

    /* ─────────────────── Phase 3: 综合应用 ─────────────────── */

    var PHASE3 = [
        {
            text: '从扑克牌（52张，不含大小王）中至少抽（    ）张，才能保证有3张同花色',
            answer: '9',
            choices: ['7', '8', '9', '10'],
            hint: '4种花色，最不利情况：每种花色先各抽2张（8张），再多抽1张',
            explain: '4种花色各抽2张 = 8张，第9张必定使某花色达到3张。8+1 = 9。'
        },
        {
            text: '一副扑克牌（52张）至少抽（    ）张才能保证有2张牌点数相同（A-K共13种）',
            answer: '14',
            choices: ['13', '14', '15', '26'],
            hint: '13种点数，最不利：每种各抽1张（13张），再多1张',
            explain: '13种点数（A到K），最不利每种抽1张 = 13张，第14张必定和某张点数相同。13+1 = 14。'
        },
        {
            text: '一个抽屉里有白袜子6只、黑袜子4只、灰袜子2只，闭眼至少摸（    ）只才能保证有一双同色',
            answer: '4',
            choices: ['3', '4', '7', '12'],
            hint: '3种颜色，最不利：每种各摸1只，再摸1只必定配对',
            explain: '3种颜色，最不利情况每种摸1只（共3只），第4只必定和前面某只同色。3+1 = 4。'
        },
        {
            text: '有红球8个、黄球5个、蓝球3个、绿球1个（共17个），至少摸出（    ）个才能保证有4个同色',
            answer: '11',
            choices: ['9', '10', '11', '13'],
            hint: '最不利：红球取3个、黄球取3个、蓝球取3个、绿球取1个 = 10个，再取1个',
            explain: '最不利情况：每种颜色都只取3个（绿球只有1个取1个）= 3+3+3+1 = 10个，再多取1个必定使某颜色达到4个。10+1 = 11。'
        }
    ];

    /* ─────────────────── 抽屉可视化 ─────────────────── */

    function renderDrawers(items, drawers, distribution) {
        var html = '<div class="pgh-drawer-wrap">';
        html += '<div class="pgh-drawer-row">';
        for (var d = 0; d < drawers; d++) {
            html += '<div class="pgh-drawer">';
            html += '<div class="pgh-drawer-label">抽屉' + (d + 1) + '</div>';
            html += '<div class="pgh-drawer-box">';
            var count = distribution ? distribution[d] : 0;
            for (var i = 0; i < count; i++) {
                html += '<span class="pgh-item">🍎</span>';
            }
            html += '</div></div>';
        }
        html += '</div></div>';
        return html;
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
            '.pgh-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#f59e0b 50%,#b45309 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.pgh-header{position:relative;z-index:50;}' +
            '.pgh-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:pgh-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes pgh-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.pgh-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #d97706;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:pgh-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes pgh-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.pgh-card-emoji{font-size:40px;}' +
            '.pgh-card-text{' +
                'font-size:20px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.pgh-card-hint{' +
                'font-size:15px;color:#d97706;font-style:italic;' +
            '}' +
            '.pgh-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;width:100%;' +
            '}' +
            '.pgh-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 抽屉可视化 */
            '.pgh-drawer-wrap{display:flex;justify-content:center;padding:8px 0;}' +
            '.pgh-drawer-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}' +
            '.pgh-drawer{' +
                'text-align:center;min-width:60px;' +
            '}' +
            '.pgh-drawer-label{' +
                'font-size:12px;color:#92400e;font-weight:bold;margin-bottom:4px;' +
            '}' +
            '.pgh-drawer-box{' +
                'min-width:50px;min-height:50px;border:3px dashed #d97706;' +
                'border-radius:0 0 10px 10px;background:#fef3c7;' +
                'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;' +
                'padding:4px;gap:2px;' +
            '}' +
            '.pgh-item{font-size:20px;line-height:1;}' +

            /* 公式提示 */
            '.pgh-formula{' +
                'background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;' +
                'padding:10px 18px;font-size:15px;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
            '}' +

            '.pgh-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#d97706,#ea580c);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(217,119,6,0.35);' +
                'animation:pgh-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            '.pgh-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.pgh-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#fbbf24,#d97706);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            '.pgh-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '鸽巢问题' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1.slice();

            this.render();
            this.showPhaseTransition('🐦 理解原理', '鸽巢原理——物品比抽屉多，一定有抽屉放多个！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="pgh-wrap">' +
                    '<div class="pgh-header">' +
                        H.guideBarHTML('🐦', '抽屉原理——鸽巢问题大挑战！', 'pgh-guide') +
                    '</div>' +
                    '<div class="pgh-body" id="pgh-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('pgh-body');
            body.innerHTML =
                '<div class="pgh-phase-banner">' + title + '</div>' +
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
                    H.updateGuide('原理理解了！来挑战最不利原则！', 'pgh-guide');
                    this.showPhaseTransition('🤔 最不利原则', '"至少保证"——从最坏情况出发思考！');
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = PHASE3.slice();
                    H.updateGuide('最不利原则掌握！最终综合挑战！', 'pgh-guide');
                    this.showPhaseTransition('🏆 综合应用', '扑克牌、袜子、球……生活中的鸽巢原理！');
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('pgh-body');
            var phaseLabels = { 1: '理解原理', 2: '最不利原则', 3: '综合应用' };
            var phaseEmojis = { 1: '🐦', 2: '🤔', 3: '🏆' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var pct = Math.round(totalDone / 12 * 100);

            H.updateGuide('第 ' + (totalDone + 1) + '/12 题 · ' + phaseLabels[state.phase], 'pgh-guide');

            var drawerHTML = '';
            if (state.phase === 1 && state.qIndex === 0) {
                drawerHTML = renderDrawers(4, 3, [2, 1, 1]);
            } else if (state.phase === 1 && state.qIndex === 2) {
                drawerHTML = renderDrawers(5, 4, [2, 1, 1, 1]);
            }

            var formulaHTML = '';
            if (state.phase === 1) {
                formulaHTML = '<div class="pgh-formula">🐦 n+1个物品放入n个抽屉 → 至少有一个抽屉放了 ≥2 个物品</div>';
            } else if (state.phase === 2) {
                formulaHTML = '<div class="pgh-formula">🤔 最不利原则：考虑最坏情况，再多取1个</div>';
            } else {
                formulaHTML = '<div class="pgh-formula">🏆 "至少保证" = 最不利情况 + 1</div>';
            }

            body.innerHTML =
                '<div class="pgh-card">' +
                    '<div class="pgh-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    drawerHTML +
                    formulaHTML +
                    '<div class="pgh-card-text">' + q.text + '</div>' +
                    '<div class="pgh-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="pgh-card-explain" id="pgh-explain">📖 ' + q.explain + '</div>' +
                    '<div class="pgh-card-choices" id="pgh-choices"></div>' +
                '</div>' +
                '<div class="pgh-progress"><div class="pgh-progress-fill" style="width:' + pct + '%"></div></div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'pgh-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];
                    var el = document.querySelector('#pgh-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        H.updateGuide('答对了！鸽巢原理小达人！✅', 'pgh-guide');
                        if (el) el.classList.add('pgh-correct');
                        self.updateMastery(8);
                        var explainEl = document.getElementById('pgh-explain');
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
                                var correctEl = document.querySelector('#pgh-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('pgh-correct');
                            }
                        });
                        var explainEl2 = document.getElementById('pgh-explain');
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
                window.GameManager.logError(state.levelData.levelId || 'g6_d_u5', qText, picked);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了鸽巢原理和最不利原则！🐦',
                NEXT_LEVEL
            );
        }
    };

    window.CurrentGameModule = game;
})();
