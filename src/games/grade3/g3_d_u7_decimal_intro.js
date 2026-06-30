/**
 * 三年级下册 第七单元：小数的初步认识
 * 路径: src/games/grade3/g3_d_u7_decimal_intro.js
 *
 * 小数超市 - 两阶段玩法：
 *   Phase 1：读价格——将"几元几角几分"转为小数表示
 *   Phase 2：小数加减法——超市购物计算总价/找零
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u7-dcm-styles';

    /* ==================== 商品池 ==================== */

    var PRODUCTS = [
        { name: '铅笔',   emoji: '✏️',  baseYuan: 1, baseJiao: 0 },
        { name: '橡皮',   emoji: '🧽',  baseYuan: 0, baseJiao: 5 },
        { name: '尺子',   emoji: '📐',  baseYuan: 2, baseJiao: 5 },
        { name: '笔记本', emoji: '📒',  baseYuan: 3, baseJiao: 0 },
        { name: '彩色笔', emoji: '🖍️',  baseYuan: 6, baseJiao: 8 },
        { name: '文具盒', emoji: '📦',  baseYuan: 12, baseJiao: 5 },
        { name: '橡皮泥', emoji: '🎨',  baseYuan: 4, baseJiao: 5 },
        { name: '剪刀',   emoji: '✂️',  baseYuan: 5, baseJiao: 0 },
        { name: '胶水',   emoji: '🧴',  baseYuan: 2, baseJiao: 0 },
        { name: '书包',   emoji: '🎒',  baseYuan: 35, baseJiao: 0 }
    ];

    /* ==================== 工具函数 ==================== */

    function makePrice(yuan, jiao, fen) {
        yuan = yuan || 0;
        jiao = jiao || 0;
        fen = fen || 0;
        var total = yuan * 100 + jiao * 10 + fen;
        return {
            yuan: yuan,
            jiao: jiao,
            fen: fen,
            total: total,
            str: (yuan + jiao / 10 + fen / 100).toFixed(2),
            display: yuan + '元' + (jiao > 0 || fen > 0 ? jiao + '角' : '') + (fen > 0 ? fen + '分' : '')
        };
    }

    function priceFromProduct(p) {
        var jiao = p.baseJiao + H.randInt(0, 9);
        var fen = H.randInt(0, 9);
        var yuan = p.baseYuan + Math.floor(jiao / 10);
        jiao = jiao % 10;
        return makePrice(yuan, jiao, fen);
    }

    function formatPrice(yuan, jiao, fen) {
        return yuan + '.' + String(jiao) + String(fen);
    }

    /* ==================== Phase 1: 价格转小数 ==================== */

    function genPriceReadQuestions(count) {
        var pool = [];
        var prods = H.shuffle(PRODUCTS.slice()).slice(0, count);

        prods.forEach(function (p) {
            var price = priceFromProduct(p);
            pool.push({
                product: p,
                price: price,
                text: p.emoji + ' ' + p.name + '的价格是 ' + price.display + '，用小数表示为？',
                answer: price.str,
                type: 'read'
            });
        });

        return pool;
    }

    /* ==================== Phase 2: 购物计算 ==================== */

    function genShoppingQuestions(count) {
        var pool = [];

        for (var i = 0; i < count; i++) {
            var p1 = PRODUCTS[H.randInt(0, PRODUCTS.length - 1)];
            var p2;
            do {
                p2 = PRODUCTS[H.randInt(0, PRODUCTS.length - 1)];
            } while (p2.name === p1.name);

            var price1 = priceFromProduct(p1);
            var price2 = priceFromProduct(p2);

            var totalFen = price1.total + price2.total;
            var totalYuan = Math.floor(totalFen / 100);
            var totalJiao = Math.floor((totalFen % 100) / 10);
            var totalFenRem = totalFen % 10;
            var totalStr = formatPrice(totalYuan, totalJiao, totalFenRem);

            if (H.randInt(0, 1) === 0) {
                // 加法：买两件
                pool.push({
                    text: '🛒 买一个 ' + p1.emoji + p1.name + '（' + price1.str + '元）和一个 ' + p2.emoji + p2.name + '（' + price2.str + '元），一共多少钱？',
                    answer: totalStr,
                    type: 'add'
                });
            } else {
                // 减法：付钱找零
                var paid = Math.ceil(parseFloat(totalStr));
                var changeFen = paid * 100 - totalFen;
                var changeYuan = Math.floor(changeFen / 100);
                var changeJiao = Math.floor((changeFen % 100) / 10);
                var changeFenRem = changeFen % 10;
                var changeStr = formatPrice(changeYuan, changeJiao, changeFenRem);

                pool.push({
                    text: '🛒 买一个 ' + p1.emoji + p1.name + '（' + price1.str + '元），付了 ' + paid + ' 元，找回多少钱？',
                    answer: changeStr,
                    type: 'sub'
                });
            }
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
        currentQ: 0
    };

    /* ==================== 渲染 ==================== */

    function render() {
        state.container.innerHTML =
            '<div class="dcm-game">' +
                H.guideBarHTML('🛒', '小数超市——认识小数，学会元角分！', 'dcm-guide-text') +
                '<div id="dcm-phase1" class="dcm-phase"></div>' +
                '<div id="dcm-phase2" class="dcm-phase" style="display:none;"></div>' +
            '</div>';
    }

    /* ---- Phase 1 ---- */

    function startPhase1() {
        state.phase = 1;
        state.currentQ = 0;
        state.questions = genPriceReadQuestions(5);
        showP1Question();
    }

    function showP1Question() {
        if (state.currentQ >= state.questions.length) {
            startPhase2();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase1 = document.getElementById('dcm-phase1');
        phase1.style.display = '';

        // 商品展示卡
        phase1.innerHTML =
            '<div class="dcm-content">' +
                '<div class="dcm-q-counter" id="dcm-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="dcm-product-card">' +
                    '<div class="dcm-product-emoji">' + q.product.emoji + '</div>' +
                    '<div class="dcm-product-name">' + q.product.name + '</div>' +
                    '<div class="dcm-price-tag">' + q.price.display + '</div>' +
                    '<div class="dcm-price-hint">' + q.price.yuan + '元 = ' + q.price.yuan + '.00元，' +
                    q.price.jiao + '角 = 0.' + q.price.jiao + '0元，' +
                    q.price.fen + '分 = 0.0' + q.price.fen + '元</div>' +
                '</div>' +
                '<div class="dcm-q-text">' + q.text + '</div>' +
                '<div class="dcm-input-row">' +
                    '<span class="dcm-unit">¥</span>' +
                    '<input type="text" class="dcm-input" id="dcm-input" placeholder="0.00" maxlength="6">' +
                    '<button class="dcm-submit-btn" id="dcm-submit">确定</button>' +
                '</div>' +
                '<div class="dcm-hint" id="dcm-hint">💡 元.角分，如 3元5角 = 3.50</div>' +
            '</div>';

        H.bindAnswerInput('dcm-input', 'dcm-submit',
            function (val) { return /^\d+\.\d{1,2}$/.test(val) || /^\d+$/.test(val); },
            function (val) { onP1Answer(val, q); },
            function () {
                var hint = document.getElementById('dcm-hint');
                if (hint) hint.textContent = '⚠️ 请输入小数，如 3.50';
            }
        );
    }

    function onP1Answer(chosen, q) {
        // normalize: ensure .00 format
        var normalized = chosen;
        if (!normalized.includes('.')) normalized += '.00';
        else if (normalized.split('.')[1].length === 1) normalized += '0';

        if (normalized === q.answer) {
            H.updateGuide('dcm-guide-text', '✅ 正确！' + q.price.display + ' = ' + q.answer + '元');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP1Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                q.price.display + ' = ' + q.answer + ' 元',
                document.getElementById('dcm-submit'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '价格转小数', chosen, q.answer);
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
        state.questions = genShoppingQuestions(4);
        document.getElementById('dcm-phase1').style.display = 'none';
        H.updateGuide('dcm-guide-text', '🛒 小超市开张啦！算算购物总价！');
        showP2Question();
    }

    function showP2Question() {
        if (state.currentQ >= state.questions.length) {
            finishGame();
            return;
        }
        var q = state.questions[state.currentQ];
        var phase2 = document.getElementById('dcm-phase2');
        phase2.style.display = '';

        phase2.innerHTML =
            '<div class="dcm-content">' +
                '<div class="dcm-q-counter" id="dcm-q-counter">第 ' + (state.currentQ + 1) + ' / ' + state.questions.length + ' 题</div>' +
                '<div class="dcm-shopping-card">' +
                    '<div class="dcm-shopping-title">🛒 购物计算</div>' +
                    '<div class="dcm-q-text">' + q.text + '</div>' +
                '</div>' +
                '<div class="dcm-input-row">' +
                    '<span class="dcm-unit">¥</span>' +
                    '<input type="text" class="dcm-input" id="dcm-input" placeholder="0.00" maxlength="6">' +
                    '<button class="dcm-submit-btn" id="dcm-submit">确定</button>' +
                '</div>' +
            '</div>';

        H.bindAnswerInput('dcm-input', 'dcm-submit',
            function (val) { return /^\d+\.\d{1,2}$/.test(val) || /^\d+$/.test(val); },
            function (val) { onP2Answer(val, q); },
            function () {}
        );
    }

    function onP2Answer(chosen, q) {
        var normalized = chosen;
        if (!normalized.includes('.')) normalized += '.00';
        else if (normalized.split('.')[1].length === 1) normalized += '0';

        if (normalized === q.answer) {
            H.updateGuide('dcm-guide-text', '✅ 答对了！答案是 ' + q.answer + ' 元');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.currentQ++;
            setTimeout(showP2Question, 1000);
        } else {
            state.mistakes++;
            H.triggerError(state.container,
                '答案是 ' + q.answer + ' 元',
                document.getElementById('dcm-submit'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '购物计算', chosen, q.answer);
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
            '小数超市收银员！元角分和小数加减都会了！🛒',
            'lvl_3_d_8'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, '\
            .dcm-game {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(150deg,#fef3c7 0%,#fde68a 30%,#d1fae5 100%);\
                display:flex;flex-direction:column;align-items:center;\
                padding-top:80px;\
            }\
            .dcm-phase {\
                width:100%;flex:1;display:flex;flex-direction:column;\
                align-items:center;justify-content:flex-start;\
                gap:16px;padding:10px 16px 20px;overflow-y:auto;\
            }\
            .dcm-content {\
                display:flex;flex-direction:column;align-items:center;\
                gap:14px;width:100%;max-width:520px;\
            }\
            .dcm-q-counter {\
                font-size:15px;font-weight:bold;color:#92400e;\
            }\
            .dcm-q-text {\
                font-size:18px;font-weight:bold;color:#1e293b;\
                text-align:center;line-height:1.6;\
            }\
            /* ---- 商品卡片 ---- */\
            .dcm-product-card {\
                background:white;padding:20px 28px;border-radius:20px;\
                border:3px solid #fbbf24;box-shadow:0 6px 18px rgba(0,0,0,0.06);\
                text-align:center;width:100%;\
            }\
            .dcm-product-emoji { font-size:48px; }\
            .dcm-product-name {\
                font-size:20px;font-weight:bold;color:#92400e;margin:4px 0;\
            }\
            .dcm-price-tag {\
                display:inline-block;background:#fef3c7;border:2px solid #fbbf24;\
                padding:6px 20px;border-radius:12px;font-size:22px;\
                font-weight:bold;color:#92400e;margin:6px 0;\
            }\
            .dcm-price-hint {\
                font-size:13px;color:#9ca3af;margin-top:4px;\
            }\
            /* ---- 购物卡片 ---- */\
            .dcm-shopping-card {\
                background:white;padding:20px 24px;border-radius:20px;\
                border:3px solid #10b981;box-shadow:0 6px 18px rgba(0,0,0,0.06);\
                width:100%;\
            }\
            .dcm-shopping-title {\
                font-size:20px;font-weight:bold;color:#065f46;\
                text-align:center;margin-bottom:8px;\
            }\
            /* ---- 输入行 ---- */\
            .dcm-input-row {\
                display:flex;align-items:center;gap:8px;\
                background:white;padding:12px 18px;border-radius:16px;\
                border:2px solid #fbbf24;\
            }\
            .dcm-unit {\
                font-size:22px;font-weight:bold;color:#92400e;\
            }\
            .dcm-input {\
                width:100px;height:44px;border:2px solid #fbbf24;border-radius:12px;\
                text-align:center;font-size:22px;font-weight:bold;color:#1e293b;\
                outline:none;\
            }\
            .dcm-input:focus {\
                border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.15);\
            }\
            .dcm-submit-btn {\
                padding:10px 24px;background:#f59e0b;color:white;border:none;\
                border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;\
                box-shadow:0 3px 0 #d97706;\
            }\
            .dcm-submit-btn:hover { transform:translateY(-1px); }\
            .dcm-submit-btn:active { transform:translateY(2px);box-shadow:0 1px 0 #d97706; }\
            .dcm-hint {\
                font-size:14px;color:#9ca3af;text-align:center;\
            }\
            /* ---- 动画 ---- */\
            @keyframes dcm-bounce {\
                0%{transform:scale(0.85);opacity:0}\
                60%{transform:scale(1.05);opacity:1}\
                100%{transform:scale(1)}\
            }\
            .dcm-product-card,.dcm-shopping-card {\
                animation:dcm-bounce 0.4s ease-out;\
            }\
            @media(max-width:480px){\
                .dcm-q-text{font-size:16px;}\
                .dcm-input{width:80px;font-size:18px;}\
                .dcm-input-row{flex-wrap:wrap;justify-content:center;}\
            }\
        ');
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 25, knowledgePoint: '小数的初步认识', levelId: 'lvl_3_d_7' };
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
