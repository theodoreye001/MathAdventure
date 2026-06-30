/**
 * 三年级下册 第二单元：除数是一位数的除法
 * 路径: src/games/grade3/g3_d_u2_divide_one.js
 *
 * 除法闯关 - 两阶段玩法：
 *   Phase 1：两位数 ÷ 一位数（5道口算题）
 *   Phase 2：三位数 ÷ 一位数（4道竖式计算 + 余数判断）
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u2-div-one-styles';

    /* ==================== 题目生成 ==================== */

    /** 两位数 ÷ 一位数，结果整除 */
    function genTwoDigitDiv(count) {
        var pool = [];
        for (var divisor = 2; divisor <= 9; divisor++) {
            for (var quotient = 2; quotient <= 9; quotient++) {
                var dividend = divisor * quotient;
                if (dividend >= 10 && dividend <= 99) {
                    pool.push({ dividend: dividend, divisor: divisor, quotient: quotient, remainder: 0 });
                }
            }
        }
        return H.shuffle(pool).slice(0, count);
    }

    /** 三位数 ÷ 一位数，结果可能有余数 */
    function genThreeDigitDiv(count) {
        var pool = [];
        for (var divisor = 2; divisor <= 9; divisor++) {
            for (var i = 0; i < 30; i++) {
                var quotient = H.randInt(10, 99);
                var remainder = H.randInt(0, divisor - 1);
                var dividend = divisor * quotient + remainder;
                if (dividend >= 100 && dividend <= 999) {
                    pool.push({ dividend: dividend, divisor: divisor, quotient: quotient, remainder: remainder });
                }
            }
        }
        return H.shuffle(pool).slice(0, count);
    }

    /** 为一道题生成选择题选项 */
    function genChoices(answer, isRemainder) {
        var opts = [String(answer)];
        var attempts = 0;
        while (opts.length < 4 && attempts < 20) {
            attempts++;
            var fake;
            if (isRemainder) {
                fake = String(H.randInt(0, 9));
            } else {
                fake = String(answer + H.randInt(-3, 3));
            }
            if (fake !== String(answer) && fake.length > 0 && parseInt(fake) >= 0 && !opts.includes(fake)) {
                opts.push(fake);
            }
        }
        while (opts.length < 4) {
            opts.push(String(parseInt(opts[opts.length - 1]) + 1));
        }
        return H.shuffle(opts);
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
            '<div class="do1-game">' +
                H.guideBarHTML('➗', '除法闯关——挑战一位数除法！', 'do1-guide-text') +
                '<div id="do1-phase1" class="do1-phase"></div>' +
                '<div id="do1-phase2" class="do1-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentQ = 0;
        state.questions = genTwoDigitDiv(5);
        showP1Question();
    }

    function showP1Question() {
        if (state.currentQ >= state.questions.length) {
            startPhase2();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase1 = document.getElementById('do1-phase1');
        phase1.style.display = '';

        var display = '<div class="do1-content">' +
            '<div class="do1-q-counter" id="do1-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
            '<div class="do1-problem-card">' +
                '<div class="do1-problem">' +
                    '<span class="do1-dividend">' + q.dividend + '</span>' +
                    '<span class="do1-op">÷</span>' +
                    '<span class="do1-divisor">' + q.divisor + '</span>' +
                    '<span class="do1-eq">＝</span>' +
                    '<span class="do1-qmark">?</span>' +
                '</div>' +
            '</div>' +
            '<div class="do1-hint">💡 提示：想一想 ' + q.divisor + ' × ? = ' + q.dividend + '</div>' +
            '<div class="do1-choices" id="do1-choices"></div>' +
        '</div>';

        phase1.innerHTML = display;
        H.renderChoices(genChoices(q.quotient, false), 'do1-choices', function (idx, text) {
            onP1Answer(text, q);
        });
    }

    function onP1Answer(chosen, q) {
        if (parseInt(chosen) === q.quotient) {
            H.updateGuide('do1-guide-text', '✅ 正确！' + q.dividend + ' ÷ ' + q.divisor + ' ＝ ' + q.quotient);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
            }
            state.currentQ++;
            setTimeout(showP1Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                '错了哦！' + q.divisor + ' × ' + q.quotient + ' ＝ ' + q.dividend,
                document.getElementById('do1-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '两位数除法', chosen, String(q.quotient));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
            state.currentQ++;
            setTimeout(showP1Question, 1500);
        }
    }

    /* ---- Phase 2 ---- */

    function startPhase2() {
        state.phase = 2;
        state.currentQ = 0;
        state.questions = genThreeDigitDiv(4);
        document.getElementById('do1-phase1').style.display = 'none';
        H.updateGuide('do1-guide-text', '🔥 三位数除法来啦！仔细计算哦！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('do1-phase2');
        phase2.style.display = '';

        // 竖式风格展示
        var longDivHTML =
            '<div class="do1-longdiv">' +
                '<div class="do1-longdiv-row do1-ld-quotient">' +
                    '<span class="do1-ld-label">商</span>' +
                    '<span class="do1-ld-val" id="do1-q-ans">?</span>' +
                '</div>' +
                '<div class="do1-longdiv-line"></div>' +
                '<div class="do1-longdiv-row">' +
                    '<span class="do1-ld-divisor">' + q.divisor + '</span>' +
                    '<span class="do1-ld-border">) </span>' +
                    '<span class="do1-ld-dividend">' + q.dividend + '</span>' +
                '</div>' +
            '</div>';

        var sub = '';
        if (q.remainder > 0) {
            sub = '<div class="do1-sub-hint">余数：' + q.remainder + '</div>';
        }

        phase2.innerHTML =
            '<div class="do1-content">' +
                '<div class="do1-q-counter" id="do1-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="do1-p2-card">' +
                    longDivHTML +
                    '<div class="do1-p2-question">计算 ' + q.dividend + ' ÷ ' + q.divisor + ' ＝ ？</div>' +
                    sub +
                '</div>' +
                '<div class="do1-choices" id="do1-choices"></div>' +
            '</div>';

        H.renderChoices(genChoices(q.quotient, false), 'do1-choices', function (idx, text) {
            onP2Answer(text, q);
        });
    }

    function onP2Answer(chosen, q) {
        if (parseInt(chosen) === q.quotient) {
            var msg = '✅ 正确！' + q.dividend + ' ÷ ' + q.divisor + ' ＝ ' + q.quotient;
            if (q.remainder > 0) {
                msg += ' …… 余 ' + q.remainder;
            }
            H.updateGuide('do1-guide-text', msg);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1200);
        } else {
            state.mistakes++;
            var correctMsg = q.quotient + (q.remainder > 0 ? ' 余 ' + q.remainder : '');
            H.triggerError(state.container,
                '答案是 ' + q.quotient + (q.remainder > 0 ? ' 余 ' + q.remainder : '') + '，再算算！',
                document.getElementById('do1-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '三位数除法', chosen, String(q.quotient));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1500);
        }
    }

    /* ==================== 结算 ==================== */

    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 25,
            state.levelData,
            state.mistakes,
            '除法小能手！两位数和三位数除法都难不倒你！➗',
            'lvl_3_d_3'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .do1-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#ede9fe 0%,#ddd6fe 40%,#e0f2fe 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .do1-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:18px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .do1-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:18px;width:100%;max-width:520px;\
            }\
            .do1-q-counter {\
                font-size:15px;font-weight:bold;color:#5b21b6;\
            }\
            /* ---- 算式卡片 ---- */\
            .do1-problem-card {\
                background:white;padding:30px 40px;border-radius:24px;\
                border:3px solid #c4b5fd;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
                text-align:center;\
            }\
            .do1-problem {\
                display:flex;align-items:center;gap:14px;\
                font-size:42px;font-weight:bold;color:#1e293b;\
            }\
            .do1-op,.do1-eq {\
                color:#7c3aed;font-size:36px;\
            }\
            .do1-qmark {\
                color:#f59e0b;font-size:48px;\
                animation:do1-pulse 1s infinite;\
            }\
            .do1-hint {\
                font-size:16px;color:#6b7280;text-align:center;\
            }\
            .do1-choices {\
                display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;\
            }\
            /* ---- Phase 2 竖式 ---- */\
            .do1-p2-card {\
                background:white;padding:24px 32px;border-radius:24px;\
                border:3px solid #a78bfa;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
                text-align:center;width:100%;\
            }\
            .do1-longdiv {\
                display:inline-block;text-align:left;margin:0 auto 16px;\
            }\
            .do1-longdiv-row {\
                display:flex;align-items:center;gap:4px;padding:4px 0;\
            }\
            .do1-ld-label {\
                font-size:14px;color:#7c3aed;font-weight:bold;width:36px;\
            }\
            .do1-ld-val {\
                font-size:28px;font-weight:bold;color:#ef4444;\
                border-bottom:3px solid #1e293b;min-width:40px;text-align:center;\
            }\
            .do1-longdiv-line {\
                height:3px;background:#1e293b;margin:2px 0 2px 40px;\
            }\
            .do1-ld-divisor {\
                font-size:24px;font-weight:bold;color:#1e293b;\
            }\
            .do1-ld-border {\
                font-size:24px;color:#1e293b;\
            }\
            .do1-ld-dividend {\
                font-size:28px;font-weight:bold;color:#1e293b;\
            }\
            .do1-p2-question {\
                font-size:22px;font-weight:bold;color:#5b21b6;margin-top:8px;\
            }\
            .do1-sub-hint {\
                font-size:16px;color:#9ca3af;margin-top:6px;\
            }\
            /* ---- 动画 ---- */\
            @keyframes do1-pulse {\
                0%,100%{opacity:1;transform:scale(1)}\
                50%{opacity:0.6;transform:scale(1.15)}\
            }\
            @keyframes do1-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .do1-problem-card,.do1-p2-card {\
                animation:do1-bounce 0.4s ease-out;\
            }\
            @media(max-width:480px){\
                .do1-problem{font-size:32px;}\
                .do1-qmark{font-size:38px;}\
                .do1-choices{grid-template-columns:1fr;gap:10px;}\
                .do1-ld-dividend{font-size:22px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '除数是一位数的除法', levelId: 'lvl_3_d_2' };
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
