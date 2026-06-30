/**
 * 三年级下册 第一单元：位置与方向（一）
 * 路径: src/games/grade3/g3_d_u1_direction.js
 *
 * 方向寻路 - 两阶段玩法：
 *   Phase 1：根据指南针判断方向（东、南、西、北、东南、东北、西南、西北）
 *   Phase 2：根据路线描述选择正确的行走方向
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u1-direction-styles';

    /* ==================== 方向数据 ==================== */

    var DIRECTIONS = [
        { name: '东', emoji: '☀️', angle: 90,  short: 'E',  color: '#f59e0b' },
        { name: '南', emoji: '🌊', angle: 180, short: 'S',  color: '#3b82f6' },
        { name: '西', emoji: '🌙', angle: 270, short: 'W',  color: '#8b5cf6' },
        { name: '北', emoji: '❄️', angle: 0,   short: 'N',  color: '#ef4444' },
        { name: '东南', emoji: '🌸', angle: 135, short: 'SE', color: '#f472b6' },
        { name: '东北', emoji: '🌺', angle: 45,  short: 'NE', color: '#eab308' },
        { name: '西南', emoji: '🍂', angle: 225, short: 'SW', color: '#a855f7' },
        { name: '西北', emoji: '❄️', angle: 315, short: 'NW', color: '#10b981' }
    ];

    /* ==================== Phase 1: 指南针辨方向 ==================== */

    function genCompassQuestions(count) {
        var pool = [];
        for (var i = 0; i < DIRECTIONS.length; i++) {
            pool.push({
                text: '指南针的红色指针指向 ' + DIRECTIONS[i].name + ' 方，请问红色箭头指的是哪个方向？',
                target: DIRECTIONS[i],
                type: 'identify'
            });
        }
        // 再生成一些随机题目
        for (var j = 0; j < 8; j++) {
            var d = DIRECTIONS[H.randInt(0, 3)]; // 四个基本方向
            var others = DIRECTIONS.filter(function (x) { return x.name !== d.name; });
            pool.push({
                text: d.emoji + ' ' + d.name + ' 方在地图的哪一边？',
                target: d,
                type: 'identify'
            });
        }
        return H.shuffle(pool).slice(0, count);
    }

    function renderCompass(target) {
        var needleAngle = target.angle;
        return '<div class="dir-compass-box">' +
            '<div class="dir-compass">' +
                '<div class="dir-compass-ring"></div>' +
                '<div class="dir-compass-label dir-cn">北</div>' +
                '<div class="dir-compass-label dir-cs">南</div>' +
                '<div class="dir-compass-label dir-ce">东</div>' +
                '<div class="dir-compass-label dir-cw">西</div>' +
                '<div class="dir-compass-label dir-cne">东北</div>' +
                '<div class="dir-compass-label dir-cse">东南</div>' +
                '<div class="dir-compass-label dir-cnw">西北</div>' +
                '<div class="dir-compass-label dir-csw">西南</div>' +
                '<div class="dir-needle" style="transform:rotate(' + needleAngle + 'deg)"></div>' +
                '<div class="dir-compass-center"></div>' +
            '</div>' +
        '</div>';
    }

    function genDirectionChoices(target) {
        var options = [target.name];
        var pool = DIRECTIONS.filter(function (d) { return d.name !== target.name; });
        pool = H.shuffle(pool);
        for (var i = 0; i < 3 && i < pool.length; i++) {
            options.push(pool[i].name);
        }
        return H.shuffle(options);
    }

    /* ==================== Phase 2: 路线描述 ==================== */

    var LOCATIONS = [
        { name: '学校', emoji: '🏫' },
        { name: '公园', emoji: '🌳' },
        { name: '超市', emoji: '🛒' },
        { name: '图书馆', emoji: '📚' },
        { name: '医院', emoji: '🏥' },
        { name: '邮局', emoji: '📮' },
        { name: '动物园', emoji: '🦁' },
        { name: '游乐场', emoji: '🎠' },
        { name: '家', emoji: '🏠' },
        { name: '火车站', emoji: '🚉' }
    ];

    function genRouteQuestions(count) {
        var pool = [];
        var usedLocs = [];

        for (var i = 0; i < count; i++) {
            // pick start and end
            var start, end;
            do {
                start = LOCATIONS[H.randInt(0, LOCATIONS.length - 1)];
                end = LOCATIONS[H.randInt(0, LOCATIONS.length - 1)];
            } while (start.name === end.name);

            // pick a direction
            var dir = DIRECTIONS[H.randInt(0, 3)]; // basic directions for simplicity
            // find opposite direction for "from" perspective
            var oppIdx = (DIRECTIONS.indexOf(dir) + 2) % 4;
            var fromDir = DIRECTIONS[oppIdx];

            pool.push({
                text: '从 ' + start.emoji + start.name + ' 出发，向' + dir.name + '走，到' + end.emoji + end.name + '。请问应该往哪个方向走？',
                answer: dir.name,
                context: start.emoji + '→' + end.emoji
            });
        }
        return H.shuffle(pool);
    }

    function genRouteChoices(answer) {
        var opts = [answer];
        var candidates = ['东', '南', '西', '北'];
        var pool = candidates.filter(function (c) { return c !== answer; });
        pool = H.shuffle(pool);
        for (var i = 0; i < 3; i++) {
            opts.push(pool[i % pool.length]);
        }
        return H.shuffle(opts);
    }

    /* ==================== Phase 2: 八方向行走 ==================== */

    function genEightDirQuestions(count) {
        var pool = [];
        var scenes = [
            '小明站在十字路口',
            '小红在操场中央',
            '小刚在花园里',
            '小丽在广场上',
            '小华在操场上'
        ];
        var landmarks = [
            { dir: '东北', emoji: '🏫', name: '学校' },
            { dir: '东南', emoji: '🏪', name: '商店' },
            { dir: '西南', emoji: '🌳', name: '公园' },
            { dir: '西北', emoji: '🏠', name: '家' },
            { dir: '东', emoji: '🏦', name: '银行' },
            { dir: '南', emoji: '⛪', name: '教堂' },
            { dir: '西', emoji: '🏛️', name: '博物馆' },
            { dir: '北', emoji: '🎡', name: '游乐场' }
        ];

        for (var i = 0; i < count; i++) {
            var scene = scenes[H.randInt(0, scenes.length - 1)];
            var lm = landmarks[H.randInt(0, landmarks.length - 1)];
            pool.push({
                text: scene + '，' + lm.emoji + lm.name + '在他的' + lm.dir + '方。' + lm.name + '在哪个方向？',
                answer: lm.dir
            });
        }
        return H.shuffle(pool);
    }

    /* ==================== 状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,
        questions: [],
        currentQ: 0,
        totalPerPhase: 4
    };

    /* ==================== 渲染 ==================== */

    function render() {
        state.container.innerHTML =
            '<div class="dir-game">' +
                H.guideBarHTML('🧭', '方向寻路——认识八个方向，当个方向小达人！', 'dir-guide-text') +
                '<div id="dir-phase1" class="dir-phase"></div>' +
                '<div id="dir-phase2" class="dir-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentQ = 0;
        state.questions = genCompassQuestions(state.totalPerPhase);
        showP1Question();
    }

    function showP1Question() {
        if (state.currentQ >= state.questions.length) {
            startPhase2();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase1 = document.getElementById('dir-phase1');
        phase1.style.display = '';
        phase1.innerHTML =
            '<div class="dir-content">' +
                '<div class="dir-q-counter" id="dir-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                renderCompass(q.target) +
                '<div class="dir-q-text">' + q.text + '</div>' +
                '<div class="dir-choices" id="dir-choices"></div>' +
            '</div>';

        H.renderChoices(genDirectionChoices(q.target), 'dir-choices', function (idx, text) {
            onP1Answer(text, q);
        });
    }

    function onP1Answer(chosen, q) {
        if (chosen === q.target.name) {
            H.updateGuide('dir-guide-text', '✅ 太棒了！你认出了 ' + q.target.name + ' 方向！');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
            }
            state.currentQ++;
            setTimeout(showP1Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container, '再看看指南针，红色指针指向的是 ' + q.target.name + ' 哦！',
                document.getElementById('dir-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '指南针辨方向', chosen, q.target.name);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
        }
    }

    /* ---- Phase 2 ---- */

    function startPhase2() {
        state.phase = 2;
        state.currentQ = 0;
        document.getElementById('dir-phase1').style.display = 'none';

        // combine route + eight-direction questions
        var routeQs = genRouteQuestions(2);
        var eightQs = genEightDirQuestions(2);
        state.questions = routeQs.concat(eightQs);

        H.updateGuide('dir-guide-text', '🗺️ 根据路线描述，选择正确的方向！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('dir-phase2');
        phase2.style.display = '';

        phase2.innerHTML =
            '<div class="dir-content">' +
                '<div class="dir-q-counter" id="dir-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="dir-route-card">' +
                    '<div class="dir-route-icon">🗺️</div>' +
                    '<div class="dir-q-text">' + q.text + '</div>' +
                '</div>' +
                '<div class="dir-choices" id="dir-choices"></div>' +
            '</div>';

        H.renderChoices(genRouteChoices(q.answer), 'dir-choices', function (idx, text) {
            onP2Answer(text, q);
        });
    }

    function onP2Answer(chosen, q) {
        if (chosen === q.answer) {
            H.updateGuide('dir-guide-text', '✅ 正确！' + q.answer + ' 方向！');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container, '不对哦，正确答案是 ' + q.answer + '！',
                document.getElementById('dir-choices'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '路线方向', chosen, q.answer);
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
            state.levelData.reward || 20,
            state.levelData,
            state.mistakes,
            '你是方向小达人！上北下南左西右东，八个方向全掌握！🧭',
            'lvl_3_d_2'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .dir-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#fef3c7 0%,#fde68a 40%,#e0f2fe 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .dir-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:18px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .dir-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:18px;width:100%;max-width:520px;\
            }\
            .dir-q-counter {\
                font-size:15px;font-weight:bold;color:#92400e;\
            }\
            .dir-q-text {\
                font-size:22px;font-weight:bold;color:#1e293b;\
                text-align:center;background:white;padding:16px 24px;\
                border-radius:18px;border:3px solid #fbbf24;\
                box-shadow:0 4px 12px rgba(0,0,0,0.06);width:100%;\
                box-sizing:border-box;\
            }\
            .dir-choices {\
                display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;\
            }\
            /* ---- 指南针 ---- */\
            .dir-compass-box {\
                background:white;padding:24px;border-radius:24px;\
                border:3px solid #fbbf24;box-shadow:0 8px 24px rgba(0,0,0,0.08);\
            }\
            .dir-compass {\
                width:180px;height:180px;border-radius:50%;\
                background:linear-gradient(135deg,#fefce8,#fef3c7);\
                position:relative;border:4px solid #d97706;\
            }\
            .dir-compass-ring {\
                position:absolute;inset:8px;border-radius:50%;\
                border:2px dashed #fbbf24;\
            }\
            .dir-compass-label {\
                position:absolute;font-size:12px;font-weight:bold;\
                color:#92400e;\
            }\
            .dir-cn{top:4px;left:50%;transform:translateX(-50%);}\
            .dir-cs{bottom:4px;left:50%;transform:translateX(-50%);}\
            .dir-ce{right:4px;top:50%;transform:translateY(-50%);}\
            .dir-cw{left:4px;top:50%;transform:translateY(-50%);}\
            .dir-cne{top:18px;right:18px;font-size:10px;color:#b45309;}\
            .dir-cse{bottom:18px;right:18px;font-size:10px;color:#b45309;}\
            .dir-cnw{top:18px;left:18px;font-size:10px;color:#b45309;}\
            .dir-csw{bottom:18px;left:18px;font-size:10px;color:#b45309;}\
            .dir-needle {\
                position:absolute;top:50%;left:50%;width:4px;height:70px;\
                background:linear-gradient(to top,#ef4444 50%,#e5e7eb 50%);\
                transform-origin:bottom center;\
                margin-left:-2px;margin-top:-70px;\
                border-radius:2px;z-index:2;\
                animation:dir-spin 0.8s ease-out;\
            }\
            .dir-compass-center {\
                position:absolute;top:50%;left:50%;width:12px;height:12px;\
                background:#d97706;border-radius:50%;transform:translate(-50%,-50%);\
                z-index:3;\
            }\
            @keyframes dir-spin {\
                0%{transform:rotate(0deg)}\
            }\
            /* ---- Phase 2 路线卡片 ---- */\
            .dir-route-card {\
                background:white;padding:20px 24px;border-radius:20px;\
                border:3px solid #93c5fd;box-shadow:0 6px 18px rgba(0,0,0,0.06);\
                width:100%;text-align:center;\
            }\
            .dir-route-icon {\
                font-size:40px;margin-bottom:10px;\
            }\
            /* ---- 动画 ---- */\
            @keyframes dir-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .dir-compass-box,.dir-route-card {\
                animation:dir-bounce 0.4s ease-out;\
            }\
            /* ---- 响应式 ---- */\
            @media(max-width:480px){\
                .dir-compass{width:140px;height:140px;}\
                .dir-needle{height:54px;margin-top:-54px;}\
                .dir-q-text{font-size:18px;padding:12px 16px;}\
                .dir-choices{grid-template-columns:1fr;gap:10px;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 20, knowledgePoint: '位置与方向（一）', levelId: 'lvl_3_d_1' };
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
