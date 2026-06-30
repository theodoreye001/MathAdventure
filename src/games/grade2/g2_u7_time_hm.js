/**
 * 二年级上册 第七单元：认识时间（时与分）
 * 路径: src/games/grade2/g2_u7_time_hm.js
 *
 * 玩法："时间旅行"
 *   Phase 1 "读时间": 显示 CSS 钟面（含时针、分针），玩家输入 "X时Y分" 格式时间。4轮。
 *   Phase 2 "时间推算": 时间推算选择题，如"现在是2:30，过了30分钟是几时几分？" 4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u7-time-styles';

    /* ── Phase 1: 读时间数据 ── */
    const READ_TIMES = [
        { h: 3,  m: 15, label: '3时15分' },
        { h: 7,  m: 30, label: '7时30分' },
        { h: 10, m: 45, label: '10时45分' },
        { h: 12, m: 0,  label: '12时' }
    ];

    /* ── Phase 2: 时间推算题目 ── */
    function buildTimeCalcQuestions() {
        var qs = [
            {
                text: '现在是 2:30，过了 30 分钟是几时几分？',
                answer: '3时0分',
                choices: ['3时0分', '2时60分', '3时30分', '2时30分']
            },
            {
                text: '现在是 5:15，过了 45 分钟是几时几分？',
                answer: '6时0分',
                choices: ['6时0分', '5时60分', '6时15分', '5时45分']
            },
            {
                text: '现在是 9:00，过了 1 小时是几时几分？',
                answer: '10时0分',
                choices: ['10时0分', '9时1分', '10时10分', '8时0分']
            },
            {
                text: '现在是 11:20，过了 40 分钟是几时几分？',
                answer: '12时0分',
                choices: ['12时0分', '11时60分', '12时20分', '11时40分']
            }
        ];
        return H.shuffle(qs);
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,       // 1 = 读时间, 2 = 时间推算
        qIndex: 0,      // 当前轮次（从 0 开始）
        readTimes: [],   // Phase 1 题目序列（洗牌后）
        calcQuestions: [],// Phase 2 题目序列
        answered: false  // 防连点
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
            state.readTimes = H.shuffle([...READ_TIMES]);
            state.calcQuestions = buildTimeCalcQuestions();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="tim-wrap">' +
                    '<div class="tim-header">' +
                        H.guideBarHTML('⏰', '时间旅行——学会认识时间！', 'tim-guide') +
                    '</div>' +
                    '<div class="tim-body" id="tim-body"></div>' +
                '</div>';
        },

        /* ============================================================
         *  Phase 1 — 读时间（4 轮）
         * ============================================================ */
        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            this.nextReadQuestion();
        },

        nextReadQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.readTimes.length) {
                /* 进入 Phase 2 */
                state.phase = 2;
                state.qIndex = 0;
                H.updateGuide('你认识了钟面！现在来算算时间吧！', 'tim-guide');
                var self = this;
                setTimeout(function () { self.startPhase2(); }, 1200);
                return;
            }

            var t = state.readTimes[state.qIndex];
            var body = document.getElementById('tim-body');

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题：钟面上是几时几分？', 'tim-guide');

            body.innerHTML =
                '<div class="tim-read-card">' +
                    '<div class="tim-clock-wrap">' +
                        renderClockFace(t.h, t.m) +
                    '</div>' +
                    '<div class="tim-input-row">' +
                        '<input type="number" class="tim-input tim-input-h" id="tim-input-h" min="1" max="12" placeholder="时">' +
                        '<span class="tim-input-label">时</span>' +
                        '<input type="number" class="tim-input tim-input-m" id="tim-input-m" min="0" max="59" placeholder="分">' +
                        '<span class="tim-input-label">分</span>' +
                    '</div>' +
                    '<button class="tim-btn tim-btn-submit" id="tim-submit">确定</button>' +
                '</div>';

            var self = this;
            var inputH = document.getElementById('tim-input-h');
            var inputM = document.getElementById('tim-input-m');
            var btn = document.getElementById('tim-submit');

            /* 自动跳转：时输入完跳到分 */
            inputH.addEventListener('input', function () {
                if (inputH.value.length >= 2 || parseInt(inputH.value) >= 10) {
                    inputM.focus();
                }
            });

            var check = function () {
                if (state.answered) return;
                var hVal = parseInt(inputH.value);
                var mVal = parseInt(inputM.value);

                if (isNaN(hVal) || isNaN(mVal)) {
                    H.triggerError(state.container, '请输入时和分的数字！', btn);
                    return;
                }

                state.answered = true;

                if (hVal === t.h && mVal === t.m) {
                    /* 正确 */
                    H.updateGuide('答对了！钟面上显示的是 ' + t.label + '！', 'tim-guide');
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    }
                    btn.style.background = '#10b981';
                    btn.textContent = '✓ 正确';
                    inputH.style.borderColor = '#10b981';
                    inputM.style.borderColor = '#10b981';
                    state.qIndex++;
                    setTimeout(function () { self.nextReadQuestion(); }, 1200);
                } else {
                    /* 错误 */
                    state.mistakes++;
                    H.triggerError(state.container, '不对哦，正确答案是 ' + t.label, btn);
                    if (window.GameManager && window.GameManager.updateMastery) {
                        window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    }
                    btn.style.background = '#ef4444';
                    btn.textContent = '✗ 再试';
                    inputH.style.borderColor = '#ef4444';
                    inputM.style.borderColor = '#ef4444';
                    setTimeout(function () {
                        state.answered = false;
                        inputH.value = '';
                        inputM.value = '';
                        btn.style.background = '';
                        btn.textContent = '确定';
                        inputH.style.borderColor = '';
                        inputM.style.borderColor = '';
                        inputH.focus();
                    }, 1500);
                }
            };

            btn.onclick = check;
            inputM.onkeyup = function (e) { if (e.key === 'Enter') check(); };
            inputH.onkeyup = function (e) { if (e.key === 'Enter') inputM.focus(); };
            inputH.focus();
        },

        /* ============================================================
         *  Phase 2 — 时间推算（4 题）
         * ============================================================ */
        startPhase2: function () {
            this.nextCalcQuestion();
        },

        nextCalcQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.calcQuestions.length) {
                this.finishGame();
                return;
            }

            var q = state.calcQuestions[state.qIndex];
            var body = document.getElementById('tim-body');

            H.updateGuide('时间推算 第 ' + (state.qIndex + 1) + '/4 题', 'tim-guide');

            body.innerHTML =
                '<div class="tim-calc-card">' +
                    '<div class="tim-calc-emoji">🕐</div>' +
                    '<div class="tim-calc-text">' + q.text + '</div>' +
                    '<div class="tim-calc-choices" id="tim-calc-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'tim-calc-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('太棒了！答案是 ' + q.answer + '！', 'tim-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#tim-calc-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextCalcQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '再想想！正确答案是 ' + q.answer,
                            document.querySelector('#tim-calc-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        /* 高亮正确答案 */
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#tim-calc-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) {
                                    el2.style.background = '#10b981';
                                    el2.style.borderColor = '#10b981';
                                    el2.style.color = 'white';
                                }
                            }
                        });
                        state.qIndex++;
                        setTimeout(function () { self.nextCalcQuestion(); }, 2000);
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
                '你学会了看钟面、读时间和推算时间！',
                'lvl_2_8_1'
            );
        }
    };

    /* ============================================================
     *  钟面渲染（纯 CSS）
     * ============================================================ */
    function renderClockFace(hours, minutes) {
        /* 数字位置 */
        var numbers = '';
        for (var i = 1; i <= 12; i++) {
            var angle = i * 30; // 每个小时 30 度
            var rad = (angle - 90) * Math.PI / 180;
            var nx = 120 + 90 * Math.cos(rad);
            var ny = 120 + 90 * Math.sin(rad);
            numbers += '<div class="tim-clock-num" style="left:' + nx + 'px;top:' + ny + 'px;">' + i + '</div>';
        }

        /* 刻度线 */
        var ticks = '';
        for (var j = 0; j < 60; j++) {
            var tAngle = j * 6;
            var isHour = j % 5 === 0;
            ticks += '<div class="tim-clock-tick' + (isHour ? ' tim-clock-tick--hour' : '') +
                '" style="transform:rotate(' + tAngle + 'deg);"></div>';
        }

        /* 时针角度：每小时 30 度，每分钟 0.5 度 */
        var hourAngle = (hours % 12) * 30 + minutes * 0.5;
        /* 分针角度：每分钟 6 度 */
        var minuteAngle = minutes * 6;

        return '<div class="tim-clock">' +
            '<div class="tim-clock-face">' +
                ticks +
                numbers +
                '<div class="tim-clock-center"></div>' +
                '<div class="tim-clock-hand tim-clock-hand--hour" style="transform:rotate(' + hourAngle + 'deg);"></div>' +
                '<div class="tim-clock-hand tim-clock-hand--minute" style="transform:rotate(' + minuteAngle + 'deg);"></div>' +
            '</div>' +
        '</div>';
    }

    /* ============================================================
     *  CSS
     * ============================================================ */
    function buildCSS() {
        return '' +
            /* 整体布局 */
            '.tim-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#e0e7ff 50%,#dbeafe 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.tim-header{position:relative;z-index:50;}' +
            '.tim-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:tim-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes tim-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* ── 钟面 ── */
            '.tim-clock-wrap{display:flex;justify-content:center;margin:10px 0;}' +
            '.tim-clock{position:relative;width:240px;height:240px;}' +
            '.tim-clock-face{' +
                'width:240px;height:240px;border-radius:50%;' +
                'background:radial-gradient(circle at 40% 35%,#ffffff 0%,#f8fafc 60%,#e2e8f0 100%);' +
                'border:6px solid #6366f1;' +
                'box-shadow:0 8px 24px rgba(99,102,241,0.25), inset 0 2px 8px rgba(0,0,0,0.05);' +
                'position:relative;' +
            '}' +
            /* 刻度线 */
            '.tim-clock-tick{' +
                'position:absolute;width:2px;height:8px;' +
                'background:#94a3b8;' +
                'left:50%;top:6px;margin-left:-1px;' +
                'transform-origin:center 114px;' +
            '}' +
            '.tim-clock-tick--hour{width:3px;height:14px;background:#475569;margin-left:-1.5px;}' +
            /* 数字 */
            '.tim-clock-num{' +
                'position:absolute;font-size:20px;font-weight:bold;color:#334155;' +
                'width:30px;height:30px;text-align:center;line-height:30px;' +
                'margin-left:-15px;margin-top:-15px;' +
            '}' +
            /* 中心圆点 */
            '.tim-clock-center{' +
                'position:absolute;width:12px;height:12px;border-radius:50%;' +
                'background:#6366f1;top:50%;left:50%;margin:-6px 0 0 -6px;z-index:10;' +
            '}' +
            /* 指针 */
            '.tim-clock-hand{' +
                'position:absolute;bottom:50%;left:50%;transform-origin:bottom center;' +
                'border-radius:4px;z-index:5;' +
            '}' +
            '.tim-clock-hand--hour{' +
                'width:6px;height:65px;margin-left:-3px;' +
                'background:linear-gradient(180deg,#4338ca,#6366f1);' +
                'border-radius:3px 3px 2px 2px;' +
            '}' +
            '.tim-clock-hand--minute{' +
                'width:4px;height:85px;margin-left:-2px;' +
                'background:linear-gradient(180deg,#1e1b4b,#4f46e5);' +
                'border-radius:2px 2px 1px 1px;' +
            '}' +

            /* ── 读时间卡片 ── */
            '.tim-read-card{' +
                'background:white;border-radius:30px;padding:30px 40px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #818cf8;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:tim-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:400px;width:90%;' +
            '}' +
            '@keyframes tim-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            /* 输入行 */
            '.tim-input-row{' +
                'display:flex;align-items:center;gap:8px;' +
                'font-size:24px;font-weight:bold;color:#4338ca;' +
            '}' +
            '.tim-input{' +
                'width:70px;height:48px;text-align:center;' +
                'font-size:24px;font-weight:bold;' +
                'border:3px solid #a5b4fc;border-radius:12px;' +
                'outline:none;color:#312e81;background:#f5f3ff;' +
                'transition:border-color 0.2s;' +
            '}' +
            '.tim-input:focus{border-color:#6366f1;background:white;}' +
            '.tim-input-label{color:#6366f1;}' +

            /* 确定按钮 */
            '.tim-btn{' +
                'padding:12px 40px;border:none;border-radius:16px;' +
                'font-size:20px;font-weight:bold;cursor:pointer;' +
                'transition:all 0.2s;' +
            '}' +
            '.tim-btn:hover{transform:scale(1.05);}' +
            '.tim-btn-submit{' +
                'background:linear-gradient(135deg,#818cf8,#6366f1);color:white;' +
                'box-shadow:0 4px 12px rgba(99,102,241,0.3);' +
            '}' +

            /* ── 时间推算卡片 ── */
            '.tim-calc-card{' +
                'background:white;border-radius:30px;padding:30px 30px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #a78bfa;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:tim-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:480px;width:92%;' +
            '}' +
            '.tim-calc-emoji{font-size:48px;}' +
            '.tim-calc-text{' +
                'font-size:22px;font-weight:bold;color:#5b21b6;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.tim-calc-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';

            /* 注: H.renderChoices 已内置按钮样式，这里用 class 覆盖色系 */
    }

    /* 挂载到全局 */
    window.CurrentGameModule = game;
})();
