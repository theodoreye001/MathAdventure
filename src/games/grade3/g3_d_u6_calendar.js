/**
 * 三年级下册 第六单元：年、月、日
 * 路径: src/games/grade3/g3_d_u6_calendar.js
 *
 * 日历解谜 - 两阶段玩法：
 *   Phase 1：各月天数、闰年判断
 *   Phase 2：24小时制与12小时制转换
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u6-calendar-styles';

    /* ==================== 月份数据 ==================== */

    var MONTHS = [
        { name: '一月', days: 31, emoji: '🎄' },
        { name: '二月', days: 28, emoji: '💕' },
        { name: '三月', days: 31, emoji: '🌸' },
        { name: '四月', days: 30, emoji: '🌧️' },
        { name: '五月', days: 31, emoji: '🌺' },
        { name: '六月', days: 30, emoji: '☀️' },
        { name: '七月', days: 31, emoji: '🏖️' },
        { name: '八月', days: 31, emoji: '🍉' },
        { name: '九月', days: 30, emoji: '🍂' },
        { name: '十月', days: 31, emoji: '🇨🇳' },
        { name: '十一月', days: 30, emoji: '🍁' },
        { name: '十二月', days: 31, emoji: '⛄' }
    ];

    /* ==================== Phase 1: 月份天数 ==================== */

    function genMonthQuestions(count) {
        var pool = [];

        // 月份天数题
        var m1 = H.randInt(0, 11);
        pool.push({
            text: MONTHS[m1].emoji + ' ' + MONTHS[m1].name + '有多少天？',
            options: genMonthChoices(MONTHS[m1].days),
            answer: String(MONTHS[m1].days)
        });

        var m2;
        do { m2 = H.randInt(0, 11); } while (MONTHS[m2].days === MONTHS[m1].days);
        pool.push({
            text: MONTHS[m2].emoji + ' ' + MONTHS[m2].name + '有多少天？',
            options: genMonthChoices(MONTHS[m2].days),
            answer: String(MONTHS[m2].days)
        });

        // 31天的月份
        pool.push({
            text: '📅 哪些月份有31天？',
            type: 'choice',
            options: ['一月、三月、五月、七月、八月、十月、十二月',
                      '一月、四月、六月、八月、十月、十二月',
                      '二月、四月、六月、九月、十一月',
                      '一月、三月、五月、七月、九月、十一月'],
            answer: '一月、三月、五月、七月、八月、十月、十二月'
        });

        // 闰年
        pool.push({
            text: '📅 2024年是闰年还是平年？',
            options: ['闰年', '平年'],
            answer: '闰年'
        });

        pool.push({
            text: '📅 闰年的二月有多少天？',
            options: ['28天', '29天', '30天', '31天'],
            answer: '29天'
        });

        // 一年天数
        pool.push({
            text: '📅 一年有多少天？',
            options: ['364天', '365天', '366天', '370天'],
            answer: '365天'
        });

        // 半年
        pool.push({
            text: '📅 从一月到六月一共大约有多少天？',
            options: ['约150天', '约180天', '约200天', '约220天'],
            answer: '约180天'
        });

        return H.shuffle(pool).slice(0, count);
    }

    function genMonthChoices(answer) {
        var opts = [String(answer) + '天'];
        var pool = [28, 29, 30, 31].filter(function (d) { return d !== answer; });
        pool = H.shuffle(pool);
        for (var i = 0; i < 3; i++) {
            opts.push(String(pool[i % pool.length]) + '天');
        }
        return H.shuffle(opts);
    }

    /* ==================== Phase 2: 24小时制转换 ==================== */

    function genTimeQuestions(count) {
        var pool = [];

        // 24小时制 → 12小时制
        var h = H.randInt(1, 11);
        pool.push({
            text: '⏰ ' + h + ':00 用12小时制怎么表示？',
            options: ['上午 ' + h + ':00', '下午 ' + h + ':00', '中午 ' + h + ':00', '晚上 ' + h + ':00'],
            answer: '上午 ' + h + ':00'
        });

        h = H.randInt(13, 17);
        pool.push({
            text: '⏰ ' + h + ':00 用12小时制怎么表示？',
            options: ['上午 ' + (h - 12) + ':00', '下午 ' + (h - 12) + ':00', '凌晨 ' + (h - 12) + ':00', '上午 ' + h + ':00'],
            answer: '下午 ' + (h - 12) + ':00'
        });

        h = H.randInt(20, 23);
        pool.push({
            text: '⏰ ' + h + ':00 用12小时制怎么表示？',
            options: ['下午 ' + (h - 12) + ':00', '晚上 ' + (h - 12) + ':00', '凌晨 ' + (h - 12) + ':00', '上午 ' + (h - 12) + ':00'],
            answer: '晚上 ' + (h - 12) + ':00'
        });

        // 12小时制 → 24小时制
        h = H.randInt(1, 11);
        pool.push({
            text: '⏰ 下午 ' + h + ':00 用24小时制怎么表示？',
            options: [h + ':00', (h + 12) + ':00', (h + 10) + ':00', (h + 6) + ':00'],
            answer: (h + 12) + ':00'
        });

        h = H.randInt(1, 5);
        pool.push({
            text: '⏰ 凌晨 ' + h + ':30 用24小时制怎么表示？',
            options: [h + ':30', (h + 12) + ':30', (h + 24) + ':30', (h + 6) + ':30'],
            answer: h + ':30'
        });

        // 时间间隔
        pool.push({
            text: '⏰ 从 8:00 到 11:00 经过了几个小时？',
            options: ['2小时', '3小时', '4小时', '5小时'],
            answer: '3小时'
        });

        pool.push({
            text: '⏰ 一天有多少个小时？',
            options: ['12小时', '24小时', '36小时', '48小时'],
            answer: '24小时'
        });

        return H.shuffle(pool).slice(0, count);
    }

    /* ==================== 状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        questions: [],
        currentQ: 0
    };

    /* ==================== 渲染 ==================== */

    function render() {
        state.container.innerHTML =
            '<div class="cal-game">' +
                H.guideBarHTML('📅', '日历解谜——年月日小达人！', 'cal-guide-text') +
                '<div id="cal-phase1" class="cal-phase"></div>' +
                '<div id="cal-phase2" class="cal-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentQ = 0;
        state.questions = genMonthQuestions(5);
        showP1Question();
    }

    function showP1Question() {
        if (state.currentQ >= state.questions.length) {
            startPhase2();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase1 = document.getElementById('cal-phase1');
        phase1.style.display = '';

        phase1.innerHTML =
            '<div class="cal-content">' +
                '<div class="cal-q-counter" id="cal-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="cal-calendar-card">' +
                    '<div class="cal-calendar-icon">📅</div>' +
                    '<div class="cal-q-text">' + q.text + '</div>' +
                '</div>' +
                '<div class="cal-choices" id="cal-choices"></div>' +
            '</div>';

        H.renderChoices(q.options, 'cal-choices', function (idx, text) {
            onAnswer(text, q, 'cal-choices');
        });
    }

    /* ---- Phase 2 ---- */

    function startPhase2() {
        state.phase = 2;
        state.currentQ = 0;
        state.questions = genTimeQuestions(4);
        document.getElementById('cal-phase1').style.display = 'none';
        H.updateGuide('cal-guide-text', '⏰ 掌握24小时制和时间转换！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('cal-phase2');
        phase2.style.display = '';

        phase2.innerHTML =
            '<div class="cal-content">' +
                '<div class="cal-q-counter" id="cal-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="cal-clock-card">' +
                    '<div class="cal-clock-icon">🕐</div>' +
                    '<div class="cal-q-text">' + q.text + '</div>' +
                '</div>' +
                '<div class="cal-choices" id="cal-choices"></div>' +
            '</div>';

        H.renderChoices(q.options, 'cal-choices', function (idx, text) {
            onAnswer(text, q, 'cal-choices');
        });
    }

    function onAnswer(chosen, q, choiceId) {
        if (chosen === q.answer) {
            H.updateGuide('cal-guide-text', '✅ 正确！' + q.answer);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            var fn = state.phase === 1 ? showP1Question : showP2Question;
            setTimeout(fn, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container, '正确答案是：' + q.answer,
                document.getElementById(choiceId));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '日历题', chosen, q.answer);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
            state.currentQ++;
            var fn2 = state.phase === 1 ? showP1Question : showP2Question;
            setTimeout(fn2, 1500);
        }
    }

    /* ==================== 结算 ==================== */

    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 25,
            state.levelData,
            state.mistakes,
            '日历小达人！年月日和24小时制全明白！📅',
            'lvl_3_d_7'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .cal-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#fef3c7 0%,#fde68a 30%,#fecdd3 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .cal-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:18px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .cal-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:16px;width:100%;max-width:520px;\
            }\
            .cal-q-counter {\
                font-size:15px;font-weight:bold;color:#92400e;\
            }\
            .cal-q-text {\
                font-size:22px;font-weight:bold;color:#1e293b;\
                text-align:center;line-height:1.5;\
            }\
            .cal-choices {\
                display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;\
            }\
            /* ---- 日历卡片 ---- */\
            .cal-calendar-card {\
                background:white;padding:24px 28px;border-radius:24px;\
                border:3px solid #fbbf24;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
                text-align:center;width:100%;\
            }\
            .cal-calendar-icon {\
                font-size:48px;margin-bottom:10px;\
            }\
            /* ---- 时钟卡片 ---- */\
            .cal-clock-card {\
                background:white;padding:24px 28px;border-radius:24px;\
                border:3px solid #f472b6;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
                text-align:center;width:100%;\
            }\
            .cal-clock-icon {\
                font-size:48px;margin-bottom:10px;\
            }\
            /* ---- 动画 ---- */\
            @keyframes cal-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .cal-calendar-card,.cal-clock-card {\
                animation:cal-bounce 0.4s ease-out;\
            }\
            @media(max-width:480px){\
                .cal-q-text{font-size:18px;}\
                .cal-choices{grid-template-columns:1fr;gap:10px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '年、月、日', levelId: 'lvl_3_d_6' };
            if (!state.container) return;

            state.mistakes = 0;
            state.phase = 1;
            state.currentQ = 0;

            injectStyles();
            render();
            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
