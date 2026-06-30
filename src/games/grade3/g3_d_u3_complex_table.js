/**
 * 三年级下册 第三单元：复式统计表
 * 路径: src/games/grade3/g3_d_u3_complex_table.js
 *
 * 数据分析师 - 两阶段玩法：
 *   Phase 1：观察复式统计表，填写缺失数据
 *   Phase 2：根据统计表回答比较、计算问题
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u3-ctable-styles';

    /* ==================== 数据集 ==================== */

    var DATASETS = [
        {
            title: '🏆 各班运动会奖牌统计',
            categories: ['金牌', '银牌', '铜牌'],
            groups: ['三(1)班', '三(2)班', '三(3)班'],
            colors: ['#f59e0b', '#9ca3af', '#cd7f32'],
            generate: function () {
                var data = [];
                for (var g = 0; g < 3; g++) {
                    var row = [];
                    for (var c = 0; c < 3; c++) {
                        row.push(H.randInt(2, 15));
                    }
                    data.push(row);
                }
                return data;
            }
        },
        {
            title: '🌤️ 一周天气记录',
            categories: ['晴天', '多云', '雨天'],
            groups: ['星期一', '星期二', '星期三', '星期四', '星期五'],
            colors: ['#f59e0b', '#94a3b8', '#3b82f6'],
            generate: function () {
                var data = [];
                for (var g = 0; g < 5; g++) {
                    var row = [];
                    for (var c = 0; c < 3; c++) {
                        row.push(H.randInt(1, 8));
                    }
                    data.push(row);
                }
                return data;
            }
        },
        {
            title: '📚 图书馆借阅统计',
            categories: ['童话', '科普', '漫画'],
            groups: ['一年级', '二年级', '三年级'],
            colors: ['#ec4899', '#10b981', '#8b5cf6'],
            generate: function () {
                var data = [];
                for (var g = 0; g < 3; g++) {
                    var row = [];
                    for (var c = 0; c < 3; c++) {
                        row.push(H.randInt(5, 25));
                    }
                    data.push(row);
                }
                return data;
            }
        },
        {
            title: '🎨 兴趣小组人数',
            categories: ['绘画', '音乐', '体育'],
            groups: ['男生', '女生'],
            colors: ['#3b82f6', '#f472b6', '#10b981'],
            generate: function () {
                var data = [];
                for (var g = 0; g < 2; g++) {
                    var row = [];
                    for (var c = 0; c < 3; c++) {
                        row.push(H.randInt(8, 30));
                    }
                    data.push(row);
                }
                return data;
            }
        }
    ];

    /* ==================== 问题生成 ==================== */

    function buildQuestions(dataset, data) {
        var questions = [];
        var groups = dataset.groups;
        var cats = dataset.categories;

        // 题型1：某班某类别最多的是哪个班
        var catIdx = H.randInt(0, cats.length - 1);
        var maxG = 0;
        for (var g = 1; g < groups.length; g++) {
            if (data[g][catIdx] > data[maxG][catIdx]) maxG = g;
        }
        questions.push({
            text: '📊 ' + cats[catIdx] + '最多的是哪个班？',
            options: groups.slice(),
            answer: groups[maxG]
        });

        // 题型2：某班各类别总数
        var gIdx = H.randInt(0, groups.length - 1);
        var total = 0;
        for (var c = 0; c < cats.length; c++) {
            total += data[gIdx][c];
        }
        questions.push({
            text: '📊 ' + groups[gIdx] + '一共获得了多少个？',
            options: genNumChoices(total),
            answer: String(total)
        });

        // 题型3：差值比较
        if (groups.length >= 2) {
            var g1 = 0, g2 = 1;
            if (groups.length > 2) {
                g2 = H.randInt(1, groups.length - 1);
            }
            var catI = H.randInt(0, cats.length - 1);
            var diff = Math.abs(data[g1][catI] - data[g2][catI]);
            questions.push({
                text: '📊 ' + groups[g1] + '比' + groups[g2] + '的' + cats[catI] + '多几个？',
                options: genNumChoices(diff),
                answer: String(diff)
            });
        }

        // 题型4：最多/最少
        var allMax = 0, allMin = 0, allMaxG = 0, allMinG = 0;
        for (var gi = 0; gi < groups.length; gi++) {
            var rowTotal = 0;
            for (var ci = 0; ci < cats.length; ci++) {
                rowTotal += data[gi][ci];
            }
            if (gi === 0 || rowTotal > allMax) { allMax = rowTotal; allMaxG = gi; }
            if (gi === 0 || rowTotal < allMin) { allMin = rowTotal; allMinG = gi; }
        }
        questions.push({
            text: '📊 哪个班的总数最多？',
            options: groups.slice(),
            answer: groups[allMaxG]
        });

        return H.shuffle(questions);
    }

    function genNumChoices(answer) {
        var opts = [String(answer)];
        var attempts = 0;
        while (opts.length < 4 && attempts < 20) {
            attempts++;
            var fake = String(answer + H.randInt(-4, 5));
            if (fake !== String(answer) && parseInt(fake) >= 0 && !opts.includes(fake)) {
                opts.push(fake);
            }
        }
        while (opts.length < 4) {
            opts.push(String(parseInt(opts[opts.length - 1]) + 2));
        }
        return H.shuffle(opts);
    }

    /* ==================== 状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        dataset: null,
        data: null,
        maskedData: null, // Phase 1 用
        maskedCells: [],  // 被遮住的单元格 [{g, c, val}]
        questions: [],
        currentQ: 0,
        filledCount: 0
    };

    /* ==================== 渲染 ==================== */

    function render() {
        state.container.innerHTML =
            '<div class="ctb-game">' +
                H.guideBarHTML('📊', '数据分析师——看懂复式统计表！', 'ctb-guide-text') +
                '<div id="ctb-phase1" class="ctb-phase"></div>' +
                '<div id="ctb-phase2" class="ctb-phase" style="display:none;"></div>' +
            '</div>';
    }

    function renderTable(data, editable, masked) {
        var ds = state.dataset;
        var html = '<table class="ctb-table"><thead><tr>' +
            '<th class="ctb-th ctb-th-corner"></th>';
        ds.categories.forEach(function (cat, ci) {
            html += '<th class="ctb-th" style="color:' + ds.colors[ci] + '">' + cat + '</th>';
        });
        html += '<th class="ctb-th ctb-th-total">合计</th></tr></thead><tbody>';

        ds.groups.forEach(function (grp, gi) {
            html += '<tr><td class="ctb-td-label">' + grp + '</td>';
            var rowTotal = 0;
            ds.categories.forEach(function (cat, ci) {
                rowTotal += data[gi][ci];
                if (masked && masked[gi][ci] === null) {
                    html += '<td class="ctb-td ctb-masked" id="ctb-mask-' + gi + '-' + ci + '">' +
                        '<input type="number" class="ctb-mask-input" data-g="' + gi + '" data-c="' + ci + '" min="0" max="99" placeholder="?">' +
                    '</td>';
                } else {
                    html += '<td class="ctb-td ctb-num">' + data[gi][ci] + '</td>';
                }
            });
            html += '<td class="ctb-td ctb-num ctb-total">' + rowTotal + '</td></tr>';
        });

        // 汇总行
        html += '<tr class="ctb-row-total"><td class="ctb-td-label">合计</td>';
        var grandTotal = 0;
        ds.categories.forEach(function (cat, ci) {
            var colTotal = 0;
            ds.groups.forEach(function (grp, gi) { colTotal += data[gi][ci]; });
            grandTotal += colTotal;
            html += '<td class="ctb-td ctb-num ctb-total">' + colTotal + '</td>';
        });
        html += '<td class="ctb-td ctb-num ctb-grand-total">' + grandTotal + '</td></tr>';
        html += '</tbody></table>';
        return html;
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.dataset = DATASETS[H.randInt(0, DATASETS.length - 1)];
        state.data = state.dataset.generate();

        // 随机遮住 3~5 个格子
        state.maskedData = state.data.map(function (row) { return row.slice(); });
        state.maskedCells = [];
        var numMask = H.randInt(3, Math.min(5, state.dataset.groups.length * state.dataset.categories.length - 1));
        var attempts = 0;
        while (state.maskedCells.length < numMask && attempts < 30) {
            attempts++;
            var gi = H.randInt(0, state.dataset.groups.length - 1);
            var ci = H.randInt(0, state.dataset.categories.length - 1);
            var already = state.maskedCells.some(function (m) { return m.g === gi && m.c === ci; });
            if (!already) {
                state.maskedData[gi][ci] = null;
                state.maskedCells.push({ g: gi, c: ci, val: state.data[gi][ci] });
            }
        }

        state.filledCount = 0;
        renderP1();
    }

    function renderP1() {
        var phase1 = document.getElementById('ctb-phase1');
        phase1.style.display = '';

        phase1.innerHTML =
            '<div class="ctb-content">' +
                '<div class="ctb-title">' + state.dataset.title + '</div>' +
                '<div class="ctb-instruction">📝 填入被遮住的数字（根据合计推算）</div>' +
                renderTable(state.data, false, state.maskedData) +
                '<div class="ctb-progress" id="ctb-progress">已填 0 / ' + state.maskedCells.length + '</div>' +
            '</div>';

        // 绑定输入
        phase1.querySelectorAll('.ctb-mask-input').forEach(function (input) {
            input.addEventListener('keyup', function (e) {
                if (e.key === 'Enter') checkMaskInput(input);
            });
            input.addEventListener('blur', function () {
                if (input.value.trim() !== '') checkMaskInput(input);
            });
        });
    }

    function checkMaskInput(input) {
        var g = parseInt(input.dataset.g);
        var c = parseInt(input.dataset.c);
        var val = parseInt(input.value.trim());
        var correct = state.data[g][c];

        if (isNaN(val)) return;

        if (val === correct) {
            // 正确！显示数字
            input.parentElement.innerHTML = '<span class="ctb-td ctb-num ctb-revealed">' + correct + '</span>';
            state.filledCount++;
            H.updateGuide('ctb-guide-text', '✅ 正确！' + state.dataset.groups[g] + '的' + state.dataset.categories[c] + '是 ' + correct);
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
            }
            var prog = document.getElementById('ctb-progress');
            if (prog) prog.textContent = '已填 ' + state.filledCount + ' / ' + state.maskedCells.length;

            if (state.filledCount >= state.maskedCells.length) {
                H.updateGuide('ctb-guide-text', '🎉 全部填完了！看看统计表回答问题吧！');
                setTimeout(startPhase2, 1200);
            }
        } else {
            state.mistakes++;
            input.value = '';
            input.style.borderColor = '#ef4444';
            input.style.animation = 'ctb-shake 0.4s';
            setTimeout(function () {
                input.style.borderColor = '#c4b5fd';
                input.style.animation = '';
            }, 500);
            H.updateGuide('ctb-guide-text', '❌ 不对哦，再算算！看看行列合计。');
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '填表-' + state.dataset.groups[g] + state.dataset.categories[c], String(val), String(correct));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
        }
    }

    /* ---- Phase 2 ---- */

    function startPhase2() {
        state.phase = 2;
        state.currentQ = 0;
        state.questions = buildQuestions(state.dataset, state.data);
        document.getElementById('ctb-phase1').style.display = 'none';

        H.updateGuide('ctb-guide-text', '📊 根据统计表回答问题！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('ctb-phase2');
        phase2.style.display = '';

        // 显示完整表格（只读）
        phase2.innerHTML =
            '<div class="ctb-content">' +
                '<div class="ctb-title">' + state.dataset.title + '</div>' +
                '<div class="ctb-table-readonly">' + renderTable(state.data, false, null) + '</div>' +
                '<div class="ctb-q-counter" id="ctb-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="ctb-q-text">' + q.text + '</div>' +
                '<div class="ctb-choices" id="ctb-choices"></div>' +
            '</div>';

        H.renderChoices(q.options, 'ctb-choices', function (idx, text) {
            onP2Answer(text, q);
        });
    }

    function onP2Answer(chosen, q) {
        if (chosen === q.answer) {
            H.updateGuide('ctb-guide-text', '✅ 答对了！');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container, '再看看表格，答案是 ' + q.answer + '！',
                document.getElementById('ctb-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '统计表问题', chosen, q.answer);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
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
            '你是数据分析师！复式统计表看得又快又准！📊',
            'lvl_3_d_4'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .ctb-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#ecfdf5 0%,#d1fae5 40%,#e0f2fe 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .ctb-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:16px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .ctb-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:14px;width:100%;max-width:560px;\
            }\
            .ctb-title {\
                font-size:22px;font-weight:bold;color:#065f46;\
            }\
            .ctb-instruction {\
                font-size:16px;color:#6b7280;\
            }\
            .ctb-q-counter {\
                font-size:15px;font-weight:bold;color:#065f46;\
            }\
            .ctb-q-text {\
                font-size:22px;font-weight:bold;color:#1e293b;\
                text-align:center;background:white;padding:16px 24px;\
                border-radius:18px;border:3px solid #10b981;\
                box-shadow:0 4px 12px rgba(0,0,0,0.06);width:100%;\
                box-sizing:border-box;\
            }\
            .ctb-choices {\
                display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;\
            }\
            /* ---- 表格 ---- */\
            .ctb-table {\
                width:100%;border-collapse:collapse;background:white;\
                border-radius:16px;overflow:hidden;\
                box-shadow:0 6px 18px rgba(0,0,0,0.06);\
            }\
            .ctb-th {\
                padding:10px 8px;font-size:14px;font-weight:bold;\
                border-bottom:2px solid #e5e7eb;text-align:center;\
                background:#f0fdf4;\
            }\
            .ctb-th-corner { background:#f0fdf4; }\
            .ctb-th-total { color:#10b981; }\
            .ctb-td {\
                padding:10px 8px;text-align:center;\
                border-bottom:1px solid #f3f4f6;font-size:16px;\
            }\
            .ctb-td-label {\
                padding:10px 8px;font-weight:bold;color:#374151;\
                text-align:left;border-bottom:1px solid #f3f4f6;\
                white-space:nowrap;\
            }\
            .ctb-num { font-weight:bold;color:#1e293b; }\
            .ctb-total { color:#065f46; }\
            .ctb-grand-total { color:#7c3aed;font-size:18px; }\
            .ctb-row-total td { background:#f0fdf4;border-top:2px solid #10b981; }\
            .ctb-table-readonly {\
                max-height:220px;overflow-y:auto;border-radius:16px;\
            }\
            /* ---- 遮挡格 ---- */\
            .ctb-masked { position:relative; }\
            .ctb-mask-input {\
                width:56px;height:36px;border:2px dashed #c4b5fd;\
                border-radius:8px;text-align:center;font-size:16px;\
                font-weight:bold;color:#7c3aed;outline:none;\
                background:#faf5ff;\
            }\
            .ctb-mask-input:focus {\
                border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,0.15);\
            }\
            .ctb-revealed {\
                color:#10b981;font-weight:bold;\
                animation:ctb-pop 0.3s ease-out;\
            }\
            .ctb-progress {\
                font-size:15px;font-weight:bold;color:#065f46;\
                background:rgba(255,255,255,0.7);padding:4px 18px;\
                border-radius:20px;\
            }\
            @keyframes ctb-pop {\
                0%{transform:scale(1.3);opacity:0.5}\
                100%{transform:scale(1);opacity:1}\
            }\
            @keyframes ctb-shake {\
                10%,90%{transform:translateX(-1px)}\
                20%,80%{transform:translateX(2px)}\
                30%,50%,70%{transform:translateX(-4px)}\
                40%,60%{transform:translateX(4px)}\
            }\
            @keyframes ctb-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .ctb-table,.ctb-q-text { animation:ctb-bounce 0.4s ease-out; }\
            @media(max-width:480px){\
                .ctb-th,.ctb-td{padding:7px 4px;font-size:13px;}\
                .ctb-q-text{font-size:18px;padding:12px 16px;}\
                .ctb-choices{grid-template-columns:1fr;gap:10px;}\
                .ctb-mask-input{width:44px;height:30px;font-size:14px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '复式统计表', levelId: 'lvl_3_d_3' };
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
