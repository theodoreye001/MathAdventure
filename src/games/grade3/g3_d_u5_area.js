/**
 * 三年级下册 第五单元：面积
 * 路径: src/games/grade3/g3_d_u5_area.js
 *
 * 铺砖工程师 - 两阶段玩法：
 *   Phase 1：数格子算面积（用 1cm² 单位方格铺满图形，数出面积）
 *   Phase 2：用公式 L×W 计算长方形面积
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u5-area-styles';

    /* ==================== Phase 1 图形池 ==================== */

    var SHAPES_P1 = [
        { name: '长方形A', rows: 3, cols: 4, emoji: '🟦' },
        { name: '长方形B', rows: 2, cols: 6, emoji: '🟩' },
        { name: '长方形C', rows: 4, cols: 5, emoji: '🟪' },
        { name: '正方形',   rows: 4, cols: 4, emoji: '🟧' },
        { name: '长方形D', rows: 3, cols: 5, emoji: '🟫' },
        { name: '长方形E', rows: 2, cols: 7, emoji: '🟦' }
    ];

    /* ==================== Phase 2 题目池 ==================== */

    function genFormulaQuestions(count) {
        var pool = [];
        var used = {};
        for (var i = 0; i < count; i++) {
            var l, w, key;
            var attempts = 0;
            do {
                l = H.randInt(3, 12);
                w = H.randInt(2, 9);
                key = Math.min(l, w) + 'x' + Math.max(l, w);
                attempts++;
            } while (used[key] && attempts < 50);
            used[key] = true;
            pool.push({
                length: l,
                width: w,
                answer: l * w,
                unit: 'cm²'
            });
        }
        return H.shuffle(pool);
    }

    function genAreaChoices(answer) {
        var opts = [String(answer)];
        var attempts = 0;
        while (opts.length < 4 && attempts < 20) {
            attempts++;
            var fake = String(answer + H.randInt(-6, 6));
            if (fake !== String(answer) && parseInt(fake) > 0 && !opts.includes(fake)) {
                opts.push(fake);
            }
        }
        while (opts.length < 4) {
            opts.push(String(parseInt(opts[opts.length - 1]) + 3));
        }
        return H.shuffle(opts);
    }

    /* ==================== 状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        shapes: [],
        currentShape: 0,
        questions: [],
        currentQ: 0,
        clickedCells: {},
        totalCount: 0
    };

    /* ==================== 渲染 ==================== */

    function render() {
        state.container.innerHTML =
            '<div class="are-game">' +
                H.guideBarHTML('📐', '铺砖工程师——用格子和公式算面积！', 'are-guide-text') +
                '<div id="are-phase1" class="are-phase"></div>' +
                '<div id="are-phase2" class="are-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentShape = 0;
        state.shapes = H.shuffle(SHAPES_P1.slice()).slice(0, 4);
        showP1Shape();
    }

    function showP1Shape() {
        if (state.currentShape >= state.shapes.length) {
            startPhase2();
            return;
        }
        var shape = state.shapes[state.currentShape];
        state.clickedCells = {};
        state.totalCount = shape.rows * shape.cols;

        var phase1 = document.getElementById('are-phase1');
        phase1.style.display = '';

        // 生成格子
        var gridHTML = '<div class="are-grid" style="grid-template-columns:repeat(' + shape.cols + ', 1fr);">';
        for (var r = 0; r < shape.rows; r++) {
            for (var c = 0; c < shape.cols; c++) {
                gridHTML += '<div class="are-cell" data-r="' + r + '" data-c="' + c + '">' + shape.emoji + '</div>';
            }
        }
        gridHTML += '</div>';

        phase1.innerHTML =
            '<div class="are-content">' +
                '<div class="are-q-counter">第 ' + (state.currentShape + 1) + ' / ' + state.shapes.length + ' 个图形</div>' +
                '<div class="are-shape-card">' +
                    '<div class="are-shape-title">' + shape.name + '（' + shape.rows + ' × ' + shape.cols + '）</div>' +
                    '<div class="are-shape-desc">点击每个格子铺满图形，然后数一数面积是多少！</div>' +
                    gridHTML +
                    '<div class="are-count-display">已铺：<span id="are-count">0</span> / ' + state.totalCount + ' 格</div>' +
                '</div>' +
                '<div class="are-answer-row">' +
                    '<span class="are-label">面积 ＝</span>' +
                    '<input type="number" class="are-input" id="are-input" min="1" max="200" placeholder="?">' +
                    '<span class="are-label">cm²</span>' +
                    '<button class="are-submit-btn" id="are-submit">确定</button>' +
                '</div>' +
            '</div>';

        // 绑定格子点击
        phase1.querySelectorAll('.are-cell').forEach(function (cell) {
            cell.addEventListener('click', function () {
                onCellClick(cell);
            });
        });

        // 绑定提交
        H.bindAnswerInput('are-input', 'are-submit',
            function (val) { return parseInt(val) > 0; },
            function (val) { onP1Answer(parseInt(val), shape); },
            function () { H.updateGuide('are-guide-text', '请输入正确的面积数！'); }
        );
    }

    function onCellClick(cell) {
        var r = cell.dataset.r;
        var c = cell.dataset.c;
        var key = r + '-' + c;

        if (state.clickedCells[key]) {
            cell.classList.remove('are-cell-placed');
            delete state.clickedCells[key];
        } else {
            cell.classList.add('are-cell-placed');
            state.clickedCells[key] = true;
        }

        var count = Object.keys(state.clickedCells).length;
        var countEl = document.getElementById('are-count');
        if (countEl) countEl.textContent = count;

        if (count === state.totalCount) {
            H.updateGuide('are-guide-text', '🎉 铺满了！' + state.totalCount + ' 个格子，面积是多少呢？');
        } else {
            H.updateGuide('are-guide-text', '已铺 ' + count + ' / ' + state.totalCount + ' 格，继续铺！');
        }
    }

    function onP1Answer(chosen, shape) {
        if (chosen === shape.rows * shape.cols) {
            H.updateGuide('are-guide-text', '✅ 正确！' + shape.name + ' 的面积是 ' + shape.rows * shape.cols + ' cm²');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentShape++;
            setTimeout(showP1Shape, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                '数一数铺了多少个格子！面积 = ' + shape.rows + ' × ' + shape.cols + ' = ' + (shape.rows * shape.cols),
                document.getElementById('are-submit'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数格子面积', String(chosen), String(shape.rows * shape.cols));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
            state.currentShape++;
            setTimeout(showP1Shape, 1500);
        }
    }

    /* ---- Phase 2 ---- */

    function startPhase2() {
        state.phase = 2;
        state.currentQ = 0;
        state.questions = genFormulaQuestions(4);
        document.getElementById('are-phase1').style.display = 'none';
        H.updateGuide('are-guide-text', '📐 用公式：面积 ＝ 长 × 宽');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('are-phase2');
        phase2.style.display = '';

        // 可视化长方形
        var visCols = Math.min(q.length, 10);
        var visRows = Math.min(q.width, 6);
        var scaleL = q.length > 10 ? (q.length / visCols) : 1;
        var scaleW = q.width > 6 ? (q.width / visRows) : 1;

        var visHTML = '<div class="are-rect-vis" style="grid-template-columns:repeat(' + visCols + ', 1fr);width:' + (visCols * 32) + 'px;">';
        for (var r = 0; r < visRows; r++) {
            for (var c = 0; c < visCols; c++) {
                visHTML += '<div class="are-rect-cell"></div>';
            }
        }
        visHTML += '</div>';

        phase2.innerHTML =
            '<div class="are-content">' +
                '<div class="are-q-counter" id="are-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="are-formula-card">' +
                    '<div class="are-formula-title">长方形面积公式</div>' +
                    '<div class="are-formula">面积 ＝ 长 × 宽</div>' +
                    '<div class="are-dims">长 ＝ ' + q.length + ' cm，宽 ＝ ' + q.width + ' cm</div>' +
                    visHTML +
                '</div>' +
                '<div class="are-answer-row">' +
                    '<span class="are-label">面积 ＝</span>' +
                    '<input type="number" class="are-input" id="are-input" min="1" max="500" placeholder="?">' +
                    '<span class="are-label">cm²</span>' +
                    '<button class="are-submit-btn" id="are-submit">确定</button>' +
                '</div>' +
            '</div>';

        H.bindAnswerInput('are-input', 'are-submit',
            function (val) { return parseInt(val) > 0; },
            function (val) { onP2Answer(parseInt(val), q); },
            function () { H.updateGuide('are-guide-text', '请输入面积！'); }
        );
    }

    function onP2Answer(chosen, q) {
        if (chosen === q.answer) {
            H.updateGuide('are-guide-text', '✅ 正确！' + q.length + ' × ' + q.width + ' ＝ ' + q.answer + ' cm²');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                q.length + ' × ' + q.width + ' ＝ ' + q.answer + '，再算算！',
                document.getElementById('are-submit'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '公式算面积', String(chosen), String(q.answer));
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
            '铺砖工程师！数格子和公式法算面积都难不倒你！📐',
            'lvl_3_d_6'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .are-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#e0f2fe 0%,#bae6fd 40%,#dbeafe 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .are-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:16px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .are-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:14px;width:100%;max-width:520px;\
            }\
            .are-q-counter {\
                font-size:15px;font-weight:bold;color:#1e40af;\
            }\
            /* ---- Phase 1 格子 ---- */\
            .are-shape-card {\
                background:white;padding:20px;border-radius:20px;\
                border:3px solid #93c5fd;box-shadow:0 6px 18px rgba(0,0,0,0.06);\
                width:100%;text-align:center;\
            }\
            .are-shape-title {\
                font-size:20px;font-weight:bold;color:#1e40af;margin-bottom:6px;\
            }\
            .are-shape-desc {\
                font-size:14px;color:#6b7280;margin-bottom:12px;\
            }\
            .are-grid {\
                display:grid;gap:4px;justify-content:center;\
                margin:0 auto;\
            }\
            .are-cell {\
                width:40px;height:40px;border-radius:6px;\
                border:2px dashed #93c5fd;display:flex;\
                align-items:center;justify-content:center;\
                font-size:18px;cursor:pointer;transition:all 0.15s;\
                background:#eff6ff;\
            }\
            .are-cell:hover {\
                transform:scale(1.1);border-color:#3b82f6;\
            }\
            .are-cell-placed {\
                background:#bfdbfe;border:2px solid #3b82f6;\
                animation:are-pop 0.2s ease-out;\
            }\
            .are-count-display {\
                margin-top:12px;font-size:16px;font-weight:bold;color:#1e40af;\
            }\
            /* ---- 答题行 ---- */\
            .are-answer-row {\
                display:flex;align-items:center;gap:10px;\
                background:white;padding:14px 20px;border-radius:16px;\
                border:2px solid #93c5fd;\
            }\
            .are-label {\
                font-size:18px;font-weight:bold;color:#1e40af;\
            }\
            .are-input {\
                width:80px;height:44px;border:2px solid #93c5fd;border-radius:12px;\
                text-align:center;font-size:22px;font-weight:bold;color:#1e293b;\
                outline:none;\
            }\
            .are-input:focus {\
                border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15);\
            }\
            .are-submit-btn {\
                padding:10px 24px;background:#3b82f6;color:white;border:none;\
                border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;\
                box-shadow:0 3px 0 #1d4ed8;\
            }\
            .are-submit-btn:hover { transform:translateY(-1px); }\
            .are-submit-btn:active { transform:translateY(2px);box-shadow:0 1px 0 #1d4ed8; }\
            /* ---- Phase 2 公式 ---- */\
            .are-formula-card {\
                background:white;padding:20px 24px;border-radius:20px;\
                border:3px solid #60a5fa;box-shadow:0 6px 18px rgba(0,0,0,0.06);\
                width:100%;text-align:center;\
            }\
            .are-formula-title {\
                font-size:16px;color:#6b7280;margin-bottom:6px;\
            }\
            .are-formula {\
                font-size:26px;font-weight:bold;color:#1e40af;\
                margin-bottom:8px;\
            }\
            .are-dims {\
                font-size:18px;color:#374151;margin-bottom:12px;\
            }\
            .are-rect-vis {\
                display:grid;gap:3px;justify-content:center;margin:0 auto;\
            }\
            .are-rect-cell {\
                width:28px;height:28px;background:#bfdbfe;border:1px solid #93c5fd;\
                border-radius:4px;\
            }\
            /* ---- 动画 ---- */\
            @keyframes are-pop {\
                0%{transform:scale(0.8);opacity:0.5}\
                100%{transform:scale(1);opacity:1}\
            }\
            @keyframes are-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .are-shape-card,.are-formula-card {\
                animation:are-bounce 0.4s ease-out;\
            }\
            @media(max-width:480px){\
                .are-cell{width:32px;height:32px;font-size:14px;}\
                .are-rect-cell{width:22px;height:22px;}\
                .are-formula{font-size:22px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '面积', levelId: 'lvl_3_d_5' };
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
