/**
 * 二年级下册 第八单元：克和千克（重量单位）
 * 路径: src/games/grade2/g2_d_u8_weight.js
 *
 * 游戏："称重小能手"
 *   Phase 1 "认识单位"：判断物品该用克还是千克，以及 1 千克 = 1000 克等基础换算。5 题。
 *   Phase 2 "重量计算"：重量加减换算与比较选择题。5 题。
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g2-d-u8-weight-styles';

    /* ==================== Phase 1 题库 ==================== */

    function buildPhase1Questions() {
        var pool = [
            { q: '一个鸡蛋约 50（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '一个苹果约 200（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '一袋盐重 500（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '一个西瓜约 5（  ）', answer: '千克', opts: ['克', '千克'] },
            { q: '一袋大米重 10（  ）', answer: '千克', opts: ['克', '千克'] },
            { q: '一辆自行车约 15（  ）', answer: '千克', opts: ['克', '千克'] },
            { q: '一块橡皮约 10（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '一个小学生约 30（  ）', answer: '千克', opts: ['克', '千克'] },
            { q: '一枚硬币约 6（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '一只猫约 4（  ）', answer: '千克', opts: ['克', '千克'] },
            { q: '一支铅笔约 5（  ）', answer: '克', opts: ['克', '千克'] },
            { q: '1 千克 =（  ）克', answer: '1000', opts: ['100', '500', '1000', '10000'] },
            { q: '5000 克 =（  ）千克', answer: '5', opts: ['5', '50', '500', '5000'] },
            { q: '3 千克 =（  ）克', answer: '3000', opts: ['30', '300', '3000', '30000'] },
            { q: '2000 克 =（  ）千克', answer: '2', opts: ['2', '20', '200', '2000'] }
        ];
        return H.shuffle(pool).slice(0, 5);
    }

    /* ==================== Phase 2 题库 ==================== */

    function buildPhase2Questions() {
        var pool = [
            { q: '2 千克 + 3 千克 =（  ）千克', answer: '5', opts: ['4', '5', '6', '8'] },
            { q: '8 千克 - 3 千克 =（  ）千克', answer: '5', opts: ['3', '5', '11', '4'] },
            { q: '1 千克 + 500 克 =（  ）克', answer: '1500', opts: ['1050', '1500', '5100', '2500'] },
            { q: '2000 克 - 500 克 =（  ）克', answer: '1500', opts: ['1500', '2500', '150', '1000'] },
            { q: '4 千克 =（  ）克', answer: '4000', opts: ['40', '400', '4000', '40000'] },
            { q: '3500 克 =（  ）千克', answer: '3.5', opts: ['3', '3.5', '35', '350'] },
            { q: '一个西瓜 3 千克，等于（  ）克', answer: '3000', opts: ['300', '3000', '30', '30000'] },
            { q: '下面哪个最重？', type: 'compare', answer: '5 千克', opts: ['500 克', '2 千克', '5 千克', '3000 克'] },
            { q: '下面哪个最轻？', type: 'compare', answer: '800 克', opts: ['1 千克', '800 克', '2000 克', '3 千克'] },
            { q: '7 千克 + 3 千克 =（  ）千克', answer: '10', opts: ['8', '9', '10', '11'] },
            { q: '6000 克 + 4 千克 =（  ）千克', answer: '10', opts: ['10', '64', '1000', '24'] },
            { q: '小明体重 25 千克，小红比他轻 3 千克，小红重（  ）千克', answer: '22', opts: ['22', '23', '28', '25'] }
        ];
        return H.shuffle(pool).slice(0, 5);
    }

    /* ==================== 游戏状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,       // 1=认识单位, 2=重量计算
        qIndex: 0,
        phase1Qs: [],
        phase2Qs: [],
        answered: false
    };

    /* ==================== 主模块 ==================== */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || {
                reward: 25,
                knowledgePoint: '克和千克',
                levelId: 'lvl_2_d_9'
            };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.phase1Qs = buildPhase1Questions();
            state.phase2Qs = buildPhase2Questions();

            this.render();
        },

        /* ---------- 渲染入口 ---------- */

        render: function () {
            state.container.innerHTML =
                '<div class="wgt-game">' +
                    H.guideBarHTML('⚖️', '称重小能手——学会克和千克！', 'wgt-guide') +
                    '<div class="wgt-body" id="wgt-body"></div>' +
                '</div>';
            this.showPhase1Question();
        },

        /* ============================================================
         *  Phase 1 — 认识单位（5 题）
         * ============================================================ */

        showPhase1Question: function () {
            state.answered = false;

            if (state.qIndex >= state.phase1Qs.length) {
                /* 进入 Phase 2 */
                state.phase = 2;
                state.qIndex = 0;
                H.updateGuide('你认识了克和千克！现在来算算重量吧！', 'wgt-guide');
                var self = this;
                setTimeout(function () { self.showPhase2Question(); }, 1200);
                return;
            }

            var q = state.phase1Qs[state.qIndex];
            var body = document.getElementById('wgt-body');

            H.updateGuide('认识单位 (' + (state.qIndex + 1) + '/5)：选出正确答案！', 'wgt-guide');

            body.innerHTML =
                '<div class="wgt-card">' +
                    '<div class="wgt-phase-label">⚖️ 认识单位</div>' +
                    '<div class="wgt-q-text">' + q.q + '</div>' +
                    '<div class="wgt-choices" id="wgt-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                H.shuffle(q.opts),
                'wgt-choices',
                function (idx, text) {
                    self.onPhase1Answer(text, q);
                }
            );
        },

        onPhase1Answer: function (chosen, q) {
            if (state.answered) return;
            state.answered = true;

            if (chosen === q.answer) {
                H.updateGuide('答对了！' + q.q.replace('（  ）', '【' + q.answer + '】'), 'wgt-guide');
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
                var correctEl = document.querySelector('#wgt-choices .gh-choice-btn');
                if (correctEl) {
                    document.querySelectorAll('#wgt-choices .gh-choice-btn').forEach(function (btn) {
                        if (btn.textContent === q.answer) {
                            btn.style.background = '#10b981';
                            btn.style.borderColor = '#10b981';
                            btn.style.color = 'white';
                        }
                    });
                }
                state.qIndex++;
                setTimeout(function () { game.showPhase1Question(); }, 1200);
            } else {
                state.mistakes++;
                H.triggerError(state.container, '再想想，答案仔细看看哦！',
                    document.getElementById('wgt-choices'));
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId,
                        '认识单位: ' + q.q, chosen, q.answer);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
                /* 高亮正确答案 */
                document.querySelectorAll('#wgt-choices .gh-choice-btn').forEach(function (btn) {
                    if (btn.textContent === q.answer) {
                        btn.style.background = '#10b981';
                        btn.style.borderColor = '#10b981';
                        btn.style.color = 'white';
                    }
                });
                state.qIndex++;
                setTimeout(function () { game.showPhase1Question(); }, 2000);
            }
        },

        /* ============================================================
         *  Phase 2 — 重量计算（5 题）
         * ============================================================ */

        showPhase2Question: function () {
            state.answered = false;

            if (state.qIndex >= state.phase2Qs.length) {
                this.finishGame();
                return;
            }

            var q = state.phase2Qs[state.qIndex];
            var body = document.getElementById('wgt-body');
            var icon = q.type === 'compare' ? '🔍' : '🧮';

            H.updateGuide('重量计算 (' + (state.qIndex + 1) + '/5)：选出正确答案！', 'wgt-guide');

            body.innerHTML =
                '<div class="wgt-card">' +
                    '<div class="wgt-phase-label">🧮 重量计算</div>' +
                    '<div class="wgt-q-text">' + q.q + '</div>' +
                    '<div class="wgt-choices" id="wgt-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                H.shuffle(q.opts),
                'wgt-choices',
                function (idx, text) {
                    self.onPhase2Answer(text, q);
                }
            );
        },

        onPhase2Answer: function (chosen, q) {
            if (state.answered) return;
            state.answered = true;

            if (chosen === q.answer) {
                H.updateGuide('太棒了！答案是 ' + q.answer + '！', 'wgt-guide');
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
                document.querySelectorAll('#wgt-choices .gh-choice-btn').forEach(function (btn) {
                    if (btn.textContent === q.answer) {
                        btn.style.background = '#10b981';
                        btn.style.borderColor = '#10b981';
                        btn.style.color = 'white';
                    }
                });
                state.qIndex++;
                setTimeout(function () { game.showPhase2Question(); }, 1200);
            } else {
                state.mistakes++;
                H.triggerError(state.container, '再想想！正确答案是 ' + q.answer,
                    document.getElementById('wgt-choices'));
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId,
                        '重量计算: ' + q.q, chosen, q.answer);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
                /* 高亮正确答案 */
                document.querySelectorAll('#wgt-choices .gh-choice-btn').forEach(function (btn) {
                    if (btn.textContent === q.answer) {
                        btn.style.background = '#10b981';
                        btn.style.borderColor = '#10b981';
                        btn.style.color = 'white';
                    }
                });
                state.qIndex++;
                setTimeout(function () { game.showPhase2Question(); }, 2000);
            }
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
                '你学会了区分克和千克，还能在它们之间换算！称重小能手就是你！',
                'lvl_2_d_9'
            );
        }
    };

    /* ============================================================
     *  CSS 样式
     * ============================================================ */

    function buildCSS() {
        return '' +
            /* 整体布局 */
            '.wgt-game{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(160deg,#fef3c7 0%,#fde68a 30%,#fff7ed 70%,#ffedd5 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.wgt-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:wgt-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes wgt-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* ── 卡片 ── */
            '.wgt-card{' +
                'background:white;border-radius:30px;padding:30px 35px;' +
                'box-shadow:0 10px 35px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                'animation:wgt-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:500px;width:92%;' +
            '}' +
            '@keyframes wgt-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            /* 阶段标签 */
            '.wgt-phase-label{' +
                'font-size:16px;font-weight:bold;color:#b45309;' +
                'background:#fef3c7;padding:6px 18px;border-radius:20px;' +
                'letter-spacing:1px;' +
            '}' +

            /* 题目文字 */
            '.wgt-q-text{' +
                'font-size:26px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;min-height:50px;' +
                'display:flex;align-items:center;justify-content:center;' +
            '}' +

            /* 选项区 */
            '.wgt-choices{' +
                'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;' +
                'width:100%;max-width:420px;' +
            '}' +

            /* ---- 动画 ---- */
            '@keyframes wgt-bounce{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}' +

            /* ---- 响应式 ---- */
            '@media(max-width:480px){' +
                '.wgt-card{padding:22px 18px;border-radius:24px;}' +
                '.wgt-q-text{font-size:21px;}' +
                '.wgt-choices{gap:10px;}' +
            '}';
    }

    /* ==================== 导出 ==================== */

    window.CurrentGameModule = game;
})();
