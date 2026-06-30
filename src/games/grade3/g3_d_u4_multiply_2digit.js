/**
 * 三年级下册 第四单元：两位数乘两位数
 * 路径: src/games/grade3/g3_d_u4_multiply_2digit.js
 *
 * 乘法格子阵 - 两阶段玩法：
 *   Phase 1：整十数 × 整十数（如 20 × 30）
 *   Phase 2：两位数 × 两位数（拆分法：如 12 × 13 = 12×10 + 12×3）
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u4-m2d-styles';

    /* ==================== 题目生成 ==================== */

    /** Phase 1: 整十 × 整十 */
    function genRoundTens(count) {
        var pool = [];
        for (var a = 1; a <= 9; a++) {
            for (var b = 1; b <= 9; b++) {
                pool.push({ a: a * 10, b: b * 10, answer: a * b * 100 });
            }
        }
        return H.shuffle(pool).slice(0, count);
    }

    /** Phase 2: 两位数 × 两位数（简化版，避免超大数） */
    function genTwoDigit(count) {
        var pool = [];
        var used = {};
        for (var attempts = 0; attempts < 200 && pool.length < count; attempts++) {
            var a = H.randInt(11, 25);
            var b = H.randInt(11, 25);
            var key = Math.min(a, b) + 'x' + Math.max(a, b);
            if (!used[key]) {
                used[key] = true;
                pool.push({ a: a, b: b, answer: a * b });
            }
        }
        return H.shuffle(pool).slice(0, count);
    }

    function genChoices(answer) {
        var opts = [String(answer)];
        var attempts = 0;
        while (opts.length < 4 && attempts < 20) {
            attempts++;
            var offset = H.randInt(-5, 5);
            if (offset === 0) offset = 1;
            var fake = String(answer + offset);
            if (parseInt(fake) > 0 && !opts.includes(fake)) {
                opts.push(fake);
            }
        }
        while (opts.length < 4) {
            opts.push(String(parseInt(opts[opts.length - 1]) + 10));
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
            '<div class="m2d-game">' +
                H.guideBarHTML('✖️', '乘法格子阵——挑战两位数乘法！', 'm2d-guide-text') +
                '<div id="m2d-phase1" class="m2d-phase"></div>' +
                '<div id="m2d-phase2" class="m2d-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentQ = 0;
        state.questions = genRoundTens(5);
        showP1Question();
    }

    function showP1Question() {
        if (state.currentQ >= state.questions.length) {
            startPhase2();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase1 = document.getElementById('m2d-phase1');
        phase1.style.display = '';

        // 格子阵视觉
        var aTens = q.a / 10;
        var bTens = q.b / 10;
        var gridHTML = '<div class="m2d-grid-box">' +
            '<div class="m2d-grid-title">整十数乘法</div>' +
            '<div class="m2d-grid">' +
                '<div class="m2d-grid-corner"></div>' +
                '<div class="m2d-grid-top">' + aTens + '个十</div>' +
                '<div class="m2d-grid-side">' + bTens + '个十</div>' +
                '<div class="m2d-grid-cell">' + (aTens * bTens) + '</div>' +
            '</div>' +
            '<div class="m2d-grid-explain">' +
                aTens + ' × ' + bTens + ' = ' + (aTens * bTens) + '，再添两个0 → ' + q.answer +
            '</div>' +
        '</div>';

        phase1.innerHTML =
            '<div class="m2d-content">' +
                '<div class="m2d-q-counter" id="m2d-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="m2d-problem-card">' +
                    '<div class="m2d-problem">' +
                        '<span class="m2d-num">' + q.a + '</span>' +
                        '<span class="m2d-op">×</span>' +
                        '<span class="m2d-num">' + q.b + '</span>' +
                        '<span class="m2d-eq">＝</span>' +
                        '<span class="m2d-qmark">?</span>' +
                    '</div>' +
                '</div>' +
                gridHTML +
                '<div class="m2d-choices" id="m2d-choices"></div>' +
            '</div>';

        H.renderChoices(genChoices(q.answer), 'm2d-choices', function (idx, text) {
            onP1Answer(text, q);
        });
    }

    function onP1Answer(chosen, q) {
        if (parseInt(chosen) === q.answer) {
            H.updateGuide('m2d-guide-text', '✅ 正确！' + q.a + ' × ' + q.b + ' ＝ ' + q.answer);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
            }
            state.currentQ++;
            setTimeout(showP1Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                '错了哦！先算 ' + (q.a / 10) + ' × ' + (q.b / 10) + '，再添两个0！',
                document.getElementById('m2d-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '整十乘法', chosen, String(q.answer));
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
        state.questions = genTwoDigit(4);
        document.getElementById('m2d-phase1').style.display = 'none';
        H.updateGuide('m2d-guide-text', '🔥 两位数乘两位数，试试拆分法！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('m2d-phase2');
        phase2.style.display = '';

        // 拆分提示
        var aOnes = q.a % 10;
        var aTens = q.a - aOnes;
        var bOnes = q.b % 10;
        var bTens = q.b - bOnes;

        var splitHTML = '<div class="m2d-split-card">' +
            '<div class="m2d-split-title">💡 拆分法提示</div>' +
            '<div class="m2d-split-steps">' +
                '<div class="m2d-step">' + q.a + ' × ' + bTens + ' ＝ ' + (q.a * bTens) + '</div>' +
                '<div class="m2d-step">' + q.a + ' × ' + bOnes + ' ＝ ' + (q.a * bOnes) + '</div>' +
                '<div class="m2d-step m2d-step-total">' +
                    (q.a * bTens) + ' + ' + (q.a * bOnes) + ' ＝ ' + q.answer +
                '</div>' +
            '</div>' +
        '</div>';

        phase2.innerHTML =
            '<div class="m2d-content">' +
                '<div class="m2d-q-counter" id="m2d-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="m2d-problem-card m2d-p2-card">' +
                    '<div class="m2d-problem">' +
                        '<span class="m2d-num">' + q.a + '</span>' +
                        '<span class="m2d-op">×</span>' +
                        '<span class="m2d-num">' + q.b + '</span>' +
                        '<span class="m2d-eq">＝</span>' +
                        '<span class="m2d-qmark">?</span>' +
                    '</div>' +
                '</div>' +
                splitHTML +
                '<div class="m2d-choices" id="m2d-choices"></div>' +
            '</div>';

        H.renderChoices(genChoices(q.answer), 'm2d-choices', function (idx, text) {
            onP2Answer(text, q);
        });
    }

    function onP2Answer(chosen, q) {
        if (parseInt(chosen) === q.answer) {
            H.updateGuide('m2d-guide-text', '✅ 太棒了！' + q.a + ' × ' + q.b + ' ＝ ' + q.answer);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1200);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                '答案是 ' + q.answer + '，用拆分法再试试！',
                document.getElementById('m2d-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '两位数乘法', chosen, String(q.answer));
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
            '乘法高手！整十数和两位数乘法全掌握！✖️',
            'lvl_3_d_5'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .m2d-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#fef3c7 0%,#fde68a 30%,#fecaca 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .m2d-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:16px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .m2d-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:14px;width:100%;max-width:520px;\
            }\
            .m2d-q-counter {\
                font-size:15px;font-weight:bold;color:#92400e;\
            }\
            /* ---- 算式卡片 ---- */\
            .m2d-problem-card {\
                background:white;padding:28px 36px;border-radius:24px;\
                border:3px solid #fbbf24;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
                text-align:center;\
            }\
            .m2d-problem {\
                display:flex;align-items:center;gap:12px;\
                font-size:40px;font-weight:bold;color:#1e293b;\
            }\
            .m2d-op,.m2d-eq { color:#dc2626;font-size:34px; }\
            .m2d-qmark {\
                color:#7c3aed;font-size:44px;\
                animation:m2d-pulse 1s infinite;\
            }\
            /* ---- 格子阵 ---- */\
            .m2d-grid-box {\
                background:white;padding:16px 20px;border-radius:16px;\
                border:2px solid #fde68a;width:100%;\
            }\
            .m2d-grid-title {\
                font-size:16px;font-weight:bold;color:#92400e;\
                text-align:center;margin-bottom:8px;\
            }\
            .m2d-grid {\
                display:grid;grid-template-columns:60px 60px;\
                grid-template-rows:40px 60px;gap:2px;\
                max-width:140px;margin:0 auto;\
            }\
            .m2d-grid-corner { background:#fef3c7; }\
            .m2d-grid-top {\
                background:#fef3c7;display:flex;align-items:center;\
                justify-content:center;font-weight:bold;color:#92400e;font-size:14px;\
            }\
            .m2d-grid-side {\
                background:#fef3c7;display:flex;align-items:center;\
                justify-content:center;font-weight:bold;color:#92400e;font-size:14px;\
            }\
            .m2d-grid-cell {\
                background:#fde68a;display:flex;align-items:center;\
                justify-content:center;font-weight:bold;color:#92400e;font-size:20px;\
                border-radius:4px;\
            }\
            .m2d-grid-explain {\
                font-size:13px;color:#6b7280;text-align:center;margin-top:8px;\
            }\
            /* ---- 拆分法提示 ---- */\
            .m2d-split-card {\
                background:white;padding:16px 20px;border-radius:16px;\
                border:2px solid #fca5a5;width:100%;\
            }\
            .m2d-split-title {\
                font-size:16px;font-weight:bold;color:#dc2626;\
                text-align:center;margin-bottom:8px;\
            }\
            .m2d-split-steps {\
                display:flex;flex-direction:column;gap:6px;\
            }\
            .m2d-step {\
                font-size:16px;color:#1e293b;text-align:center;\
                padding:4px 12px;background:#fef2f2;border-radius:8px;\
            }\
            .m2d-step-total {\
                background:#fee2e2;font-weight:bold;color:#dc2626;\
            }\
            .m2d-choices {\
                display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;\
            }\
            /* ---- 动画 ---- */\
            @keyframes m2d-pulse {\
                0%,100%{opacity:1;transform:scale(1)}\
                50%{opacity:0.6;transform:scale(1.12)}\
            }\
            @keyframes m2d-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .m2d-problem-card,.m2d-grid-box,.m2d-split-card {\
                animation:m2d-bounce 0.4s ease-out;\
            }\
            @media(max-width:480px){\
                .m2d-problem{font-size:30px;}\
                .m2d-qmark{font-size:36px;}\
                .m2d-choices{grid-template-columns:1fr;gap:10px;}\
                .m2d-step{font-size:14px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '两位数乘两位数', levelId: 'lvl_3_d_4' };
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
