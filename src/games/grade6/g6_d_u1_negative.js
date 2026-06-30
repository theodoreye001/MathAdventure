/**
 * 六年级下册 第一单元：负数
 * 路径: src/games/grade6/g6_d_u1_negative.js
 *
 * 玩法："数轴温度计"
 *   Phase 1 "负数认知" (4题): 负数的意义，正负数读写，零的归属。
 *   Phase 2 "数轴比较" (4题): 数轴上比较大小，绝对值概念。
 *   Phase 3 "生活应用" (4题): 温度、海拔、盈亏等实际场景。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-d-u1-negative-styles';
    const NEXT_LEVEL = 'lvl_6_d_2';

    /* ─────────────────── Phase 1 题库 ─────────────────── */

    var PHASE1 = [
        {
            text: '在温度计上，零下5℃用负数表示为（    ）',
            answer: '-5℃',
            choices: ['-5℃', '5℃', '0℃', '+5℃'],
            hint: '零下用负数表示，零上用正数',
            explain: '零下5℃写作 -5℃，"-"号表示零下（低于0℃）。'
        },
        {
            text: '下列哪个数是负数？',
            answer: '-3.6',
            choices: ['-3.6', '0', '2.8', '100'],
            hint: '负数前面有"-"号',
            explain: '负数是小于0的数，前面带有"-"号。-3.6 < 0，所以是负数。'
        },
        {
            text: '海拔高度-155米表示（    ）',
            answer: '低于海平面155米',
            choices: ['高于海平面155米', '低于海平面155米', '海平面', '距离155米'],
            hint: '"-"号表示"低于"',
            explain: '海拔以海平面为0米基准，正数表示高于海平面，负数表示低于海平面。'
        },
        {
            text: '关于0的说法，正确的是（    ）',
            answer: '0既不是正数也不是负数',
            choices: ['0是正数', '0是负数', '0既不是正数也不是负数', '0是最小的负数'],
            hint: '想想0在数轴上的位置',
            explain: '0是正数和负数的分界点，它本身既不是正数也不是负数。'
        }
    ];

    /* ─────────────────── Phase 2 题库 ─────────────────── */

    var PHASE2 = [
        {
            text: '在数轴上，-3 和 -7 哪个更大？',
            answer: '-3',
            choices: ['-3', '-7', '一样大', '无法比较'],
            hint: '数轴上，越靠右的数越大',
            explain: '-3 在 -7 的右边，所以 -3 > -7。负数比较大小，绝对值小的反而大。'
        },
        {
            text: '-4 和 +4 在数轴上的位置有什么关系？',
            answer: '关于0对称',
            choices: ['重合', '关于0对称', '相距2个单位', '在同一侧'],
            hint: '|-4| = |+4| = 4',
            explain: '-4 和 +4 到0的距离相等，都是4个单位，它们关于0点对称。'
        },
        {
            text: '下列排序正确的是（    ）',
            answer: '-5 < -2 < 0 < +3',
            choices: ['-5 < -2 < 0 < +3', '-5 < 0 < -2 < +3', '+3 < 0 < -2 < -5', '0 < -2 < -5 < +3'],
            hint: '数轴上从左到右越来越大',
            explain: '在数轴上从左到右：-5, -2, 0, +3，数越来越大。'
        },
        {
            text: '|-8| 等于多少？',
            answer: '8',
            choices: ['-8', '8', '0', '16'],
            hint: '绝对值是到0的距离，距离没有负数',
            explain: '绝对值表示一个数到0的距离，|-8| = 8，距离永远是非负数。'
        }
    ];

    /* ─────────────────── Phase 3 题库 ─────────────────── */

    var PHASE3 = [
        {
            text: '某天早上气温是-3℃，中午升高了8℃，中午的温度是（    ）',
            answer: '5℃',
            choices: ['5℃', '11℃', '-5℃', '8℃'],
            hint: '-3 + 8 = ?',
            explain: '-3 + 8 = 5（℃）。从零下3度上升8度，先到0℃（升3度），再升5度到5℃。'
        },
        {
            text: '小明家存入银行500元记作+500元，取出200元应记作（    ）',
            answer: '-200元',
            choices: ['200元', '-200元', '-500元', '+300元'],
            hint: '存入和取出是相反意义的量',
            explain: '存入记为正，取出就是负。取出200元记作-200元。'
        },
        {
            text: '一架飞机从海拔3000米处下降800米后，海拔为（    ）米',
            answer: '2200',
            choices: ['2200', '3800', '-5000', '4000'],
            hint: '3000 - 800 = ?',
            explain: '3000 - 800 = 2200（米）。从3000米高度下降800米，还在海平面以上。'
        },
        {
            text: '电梯从第1层上升5层到了第6层，再下降8层到了（    ）层',
            answer: '地下第2层',
            choices: ['第3层', '地下第2层', '第14层', '地下第8层'],
            hint: '6 - 8 = -2，负数表示地下',
            explain: '从第6层下降8层：6 - 8 = -2，即地下第2层。'
        }
    ];

    /* ─────────────────── 数轴渲染 ─────────────────── */

    function renderNumberLine(highlights) {
        var html = '<div class="neg-numline-wrap">';
        html += '<div class="neg-numline">';
        // 画轴线
        html += '<div class="neg-axis-line"></div>';
        // 箭头
        html += '<span class="neg-arrow-right">▶</span>';
        // 刻度 -10 到 10
        for (var i = -10; i <= 10; i++) {
            var pos = (i + 10) * (100 / 20); // 0%-100%
            var isHighlight = highlights && highlights.indexOf(i) >= 0;
            var cls = isHighlight ? 'neg-tick-highlight' : (i === 0 ? 'neg-tick-zero' : 'neg-tick');
            html += '<div class="' + cls + '" style="left:' + pos + '%">';
            html += '<div class="neg-tick-mark"></div>';
            html += '<div class="neg-tick-label">' + (i === 0 ? '0' : i) + '</div>';
            html += '</div>';
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
            /* 整体布局 */
            '.neg-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ecfeff 0%,#67e8f9 50%,#0891b2 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.neg-header{position:relative;z-index:50;}' +
            '.neg-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:neg-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes neg-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* 卡片 */
            '.neg-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #0891b2;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:neg-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes neg-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.neg-card-emoji{font-size:40px;}' +
            '.neg-card-text{' +
                'font-size:20px;font-weight:bold;color:#155e75;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.neg-card-hint{' +
                'font-size:15px;color:#0891b2;font-style:italic;' +
            '}' +
            '.neg-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;width:100%;' +
            '}' +
            '.neg-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 数轴 */
            '.neg-numline-wrap{' +
                'width:100%;overflow-x:auto;padding:10px 0;' +
                'display:flex;justify-content:center;' +
            '}' +
            '.neg-numline{' +
                'position:relative;width:420px;height:60px;' +
            '}' +
            '.neg-axis-line{' +
                'position:absolute;top:22px;left:0;right:0;' +
                'height:3px;background:#6b7280;border-radius:2px;' +
            '}' +
            '.neg-arrow-right{' +
                'position:absolute;top:14px;right:-2px;' +
                'font-size:14px;color:#6b7280;' +
            '}' +
            '.neg-tick,.neg-tick-zero,.neg-tick-highlight{' +
                'position:absolute;top:0;' +
                'transform:translateX(-50%);' +
            '}' +
            '.neg-tick-mark{' +
                'width:2px;height:12px;background:#9ca3af;margin:0 auto;' +
            '}' +
            '.neg-tick-zero .neg-tick-mark{background:#0891b2;width:3px;height:16px;}' +
            '.neg-tick-highlight .neg-tick-mark{background:#ef4444;width:3px;height:16px;}' +
            '.neg-tick-label{' +
                'font-size:11px;color:#6b7280;text-align:center;margin-top:2px;' +
            '}' +
            '.neg-tick-zero .neg-tick-label{color:#0891b2;font-weight:bold;font-size:13px;}' +
            '.neg-tick-highlight .neg-tick-label{color:#ef4444;font-weight:bold;font-size:13px;}' +

            /* 温度计 */
            '.neg-thermo{' +
                'display:flex;align-items:center;justify-content:center;' +
                'gap:12px;padding:10px 0;' +
            '}' +
            '.neg-thermo-body{' +
                'width:30px;height:120px;background:#f1f5f9;border:2px solid #cbd5e1;' +
                'border-radius:15px 15px 0 0;position:relative;overflow:hidden;' +
            '}' +
            '.neg-thermo-bulb{' +
                'width:44px;height:44px;background:#f1f5f9;border:2px solid #cbd5e1;' +
                'border-radius:50%;position:relative;margin-top:-8px;' +
            '}' +
            '.neg-thermo-fill{' +
                'position:absolute;bottom:0;left:50%;transform:translateX(-50%);' +
                'background:linear-gradient(180deg,#ef4444,#f87171);' +
                'border-radius:0 0 13px 13px;transition:height 0.8s ease;' +
            '}' +
            '.neg-thermo-zero{' +
                'position:absolute;left:100%;top:50%;margin-left:4px;' +
                'font-size:10px;color:#64748b;white-space:nowrap;' +
            '}' +

            /* 阶段标题 */
            '.neg-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#0891b2,#2563eb);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(8,145,178,0.35);' +
                'animation:neg-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            /* 进度条 */
            '.neg-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.neg-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#22d3ee,#0891b2);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            /* 答对高亮 */
            '.neg-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '负数' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1.slice();

            this.render();
            this.showPhaseTransition('🌡️ 负数认知', '从温度计和海拔开始，认识负数的世界！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="neg-wrap">' +
                    '<div class="neg-header">' +
                        H.guideBarHTML('🌡️', '数轴温度计——走进负数的世界！', 'neg-guide') +
                    '</div>' +
                    '<div class="neg-body" id="neg-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('neg-body');
            body.innerHTML =
                '<div class="neg-phase-banner">' + title + '</div>' +
                '<div style="font-size:18px;color:#155e75;text-align:center;margin-top:8px;">' +
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
                    H.updateGuide('负数认识了！来数轴上比大小！', 'neg-guide');
                    var self = this;
                    this.showPhaseTransition('📏 数轴比较', '在数轴上找到负数的位置，比较它们的大小！');
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = PHASE3.slice();
                    H.updateGuide('数轴高手！来解决生活中的负数问题！', 'neg-guide');
                    var self2 = this;
                    this.showPhaseTransition('🌍 生活应用', '温度变化、海拔高度、存取款……负数无处不在！');
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('neg-body');
            var phaseLabels = { 1: '负数认知', 2: '数轴比较', 3: '生活应用' };
            var phaseEmojis = { 1: '❄️', 2: '📏', 3: '🌍' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var pct = Math.round(totalDone / 12 * 100);

            H.updateGuide('第 ' + (totalDone + 1) + '/12 题 · ' + phaseLabels[state.phase], 'neg-guide');

            var numlineHTML = '';
            if (state.phase === 2) {
                // Phase 2 显示数轴
                var highlights = [];
                // 尝试从选项中提取数字
                q.choices.forEach(function (c) {
                    var n = parseInt(c);
                    if (!isNaN(n)) highlights.push(n);
                });
                numlineHTML = renderNumberLine(highlights.slice(0, 4));
            }

            body.innerHTML =
                '<div class="neg-card">' +
                    '<div class="neg-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    numlineHTML +
                    '<div class="neg-card-text">' + q.text + '</div>' +
                    '<div class="neg-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="neg-card-explain" id="neg-explain">📖 ' + q.explain + '</div>' +
                    '<div class="neg-card-choices" id="neg-choices"></div>' +
                '</div>' +
                '<div class="neg-progress"><div class="neg-progress-fill" style="width:' + pct + '%"></div></div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'neg-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];
                    var el = document.querySelector('#neg-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        H.updateGuide('答对了！负数小达人！✅', 'neg-guide');
                        if (el) el.classList.add('neg-correct');
                        self.updateMastery(8);
                        var explainEl = document.getElementById('neg-explain');
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
                                var correctEl = document.querySelector('#neg-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('neg-correct');
                            }
                        });
                        var explainEl2 = document.getElementById('neg-explain');
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
                window.GameManager.logError(state.levelData.levelId || 'g6_d_u1', qText, picked);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了负数的意义、数轴比较和生活应用！🌡️',
                NEXT_LEVEL
            );
        }
    };

    window.CurrentGameModule = game;
})();
