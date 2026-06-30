/**
 * 一年级下册 第五单元：认识人民币（元、角、分）
 * 路径: src/games/grade1/g1_d_u5_money.js
 *
 * 玩法：购物小达人
 *   Phase 1 "认识钱币": 出示钱币图片/符号，玩家从 3 个选项中选出对应面值
 *   Phase 2 "购物找零": 展示商品及价格，玩家计算总价或找零，四选一
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u5-money-styles';

    /* ── 钱币数据 ── */
    const DENOMINATIONS = [
        { value: 0.01, label: '1分',   display: '1分',   type: 'fen' },
        { value: 0.02, label: '2分',   display: '2分',   type: 'fen' },
        { value: 0.05, label: '5分',   display: '5分',   type: 'fen' },
        { value: 0.1,  label: '1角',   display: '1角',   type: 'jiao' },
        { value: 0.5,  label: '5角',   display: '5角',   type: 'jiao' },
        { value: 1,    label: '1元',   display: '1元',   type: 'yuan' },
        { value: 5,    label: '5元',   display: '5元',   type: 'yuan' },
        { value: 10,   label: '10元',  display: '10元',  type: 'yuan' },
        { value: 20,   label: '20元',  display: '20元',  type: 'yuan' },
        { value: 50,   label: '50元',  display: '50元',  type: 'yuan' },
        { value: 100,  label: '100元', display: '100元', type: 'yuan' }
    ];

    /* ── 商品数据 ── */
    const SHOP_ITEMS = [
        { name: '铅笔',   emoji: '✏️', price: 0.5,  priceText: '5角' },
        { name: '橡皮',   emoji: '🧹', price: 1,    priceText: '1元' },
        { name: '尺子',   emoji: '📏', price: 1.5,  priceText: '1元5角' },
        { name: '笔记本', emoji: '📕', price: 3,    priceText: '3元' },
        { name: '彩色笔', emoji: '🖍️', price: 5,    priceText: '5元' },
        { name: '书包',   emoji: '🎒', price: 25,   priceText: '25元' },
        { name: '文具盒', emoji: '📦', price: 8,    priceText: '8元' },
        { name: '故事书', emoji: '📖', price: 12,   priceText: '12元' },
        { name: '玩具车', emoji: '🚗', price: 15,   priceText: '15元' },
        { name: '棒棒糖', emoji: '🍭', price: 0.5,  priceText: '5角' },
        { name: '饼干',   emoji: '🍪', price: 2,    priceText: '2元' },
        { name: '小风扇', emoji: '🌀', price: 10,   priceText: '10元' }
    ];

    /* ── 金额格式化 ── */
    function formatMoney(val) {
        if (val >= 1) return val + '元';
        if (val >= 0.1) {
            var jiao = val * 10;
            if (jiao === Math.floor(jiao)) return jiao + '角';
            return jiao + '角';
        }
        var fen = val * 100;
        return fen + '分';
    }

    /** 生成面值的错误选项（3选1，含正确答案） */
    function makeDenomChoices(correct) {
        var pool = DENOMINATIONS.filter(function (d) { return d.value !== correct.value; });
        pool = H.shuffle(pool);
        var wrongs = pool.slice(0, 2);
        return H.shuffle([correct, ...wrongs]).map(function (d) {
            return { label: d.display, value: d.value };
        });
    }

    /** 生成购物题的 4 个选项（含正确答案） */
    function makeShoppingChoices(correctVal) {
        var opts = [correctVal];
        /* 生成 3 个干扰项，尽量在正确值附近 */
        var offsets = [-3, -1, 1, 2, -2, 3, 5, -5];
        offsets = H.shuffle(offsets);
        for (var i = 0; i < offsets.length && opts.length < 4; i++) {
            var candidate = correctVal + offsets[i];
            if (candidate > 0 && opts.indexOf(candidate) === -1 && candidate !== correctVal) {
                opts.push(candidate);
            }
        }
        /* 兜底：如果选项不够就用确定值 */
        if (opts.length < 4) {
            var extra = [0.5, 1, 2, 3, 5, 8, 10, 15, 20, 50];
            for (var j = 0; j < extra.length && opts.length < 4; j++) {
                if (opts.indexOf(extra[j]) === -1) opts.push(extra[j]);
            }
        }
        return H.shuffle(opts.map(function (v) { return formatMoney(v); }));
    }

    /* ── 生成购物场景 ── */
    function generateShoppingScenarios() {
        var scenarios = [];
        var pool = H.shuffle([...SHOP_ITEMS]);

        /* 场景 1: 单件商品，刚好付款 */
        var it1 = pool[0];
        scenarios.push({
            type: 'exact',
            text: '买一支' + it1.name + '，需要多少钱？',
            emoji: it1.emoji,
            itemName: it1.name,
            answer: it1.price,
            answerText: it1.priceText,
            hint: '想一想，' + it1.name + '的标价是多少？'
        });

        /* 场景 2: 两件商品，求总价 */
        var it2a = pool[1];
        var it2b = pool[2];
        var total = Math.round((it2a.price + it2b.price) * 10) / 10;
        scenarios.push({
            type: 'total',
            text: '买一个' + it2a.name + '和一个' + it2b.name + '，一共多少钱？',
            emoji: it2a.emoji + ' ' + it2b.emoji,
            itemName: it2a.name + ' + ' + it2b.name,
            answer: total,
            answerText: formatMoney(total),
            hint: '先把两个价格加起来算一算！'
        });

        /* 场景 3: 单件商品，付 10 元找零 */
        var it3 = pool[3];
        while (it3.price >= 10) { it3 = pool[pool.indexOf(it3) + 1] || pool[3]; }
        var change10 = Math.round((10 - it3.price) * 10) / 10;
        scenarios.push({
            type: 'change10',
            text: '买一个' + it3.name + '，付了 10 元，应找回多少钱？',
            emoji: it3.emoji,
            itemName: it3.name,
            answer: change10,
            answerText: formatMoney(change10),
            paid: 10,
            itemPrice: it3.price,
            hint: '用 10 元减去' + it3.name + '的价钱。'
        });

        /* 场景 4: 换算问题 */
        var convQuestions = [
            { text: '1元等于多少角？',   answer: 10,  answerText: '10角' },
            { text: '5角等于多少分？',   answer: 50,  answerText: '50分' },
            { text: '2元等于多少角？',   answer: 20,  answerText: '20角' },
            { text: '10角等于多少元？',  answer: 1,   answerText: '1元' },
            { text: '30分等于多少角？',  answer: 3,   answerText: '3角' },
            { text: '100分等于多少元？', answer: 1,   answerText: '1元' }
        ];
        var conv = H.shuffle(convQuestions)[0];
        scenarios.push({
            type: 'convert',
            text: conv.text,
            emoji: '💱',
            itemName: '换算',
            answer: conv.answer,
            answerText: conv.answerText,
            hint: '1元 = 10角，1角 = 10分，记住这两个关系！'
        });

        return scenarios;
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,          // 1 = 认识钱币, 2 = 购物找零
        qIndex: 0,         // 当前题目序号
        denomRound: 0,     // 已完成的认钱轮数（目标 6）
        shoppingScenarios: [],
        answered: false     // 防止连点
    };

    /* ── 主模块 ── */
    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            H.injectStyles(STYLE_ID, this.buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.denomRound = 0;
            state.answered = false;
            state.shoppingScenarios = generateShoppingScenarios();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="mny-wrap">' +
                    '<div class="mny-header">' +
                        H.guideBarHTML('💰', '认识人民币，成为购物小达人！', 'mny-guide') +
                    '</div>' +
                    '<div class="mny-body" id="mny-body"></div>' +
                '</div>';
        },

        /* ============================================================
         *  Phase 1 — 认识钱币（6 轮）
         * ============================================================ */
        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.denomRound = 0;
            this.nextDenomQuestion();
        },

        nextDenomQuestion: function () {
            state.answered = false;
            state.denomRound++;

            if (state.denomRound > 6) {
                /* 进入 Phase 2 */
                state.phase = 2;
                state.qIndex = 0;
                H.updateGuide('你认识了这么多钱币！现在去商店试试吧！', 'mny-guide');
                var self = this;
                setTimeout(function () { self.startPhase2(); }, 1200);
                return;
            }

            var denom = H.shuffle([...DENOMINATIONS])[0];
            var choices = makeDenomChoices(denom);
            var body = document.getElementById('mny-body');

            H.updateGuide('第 ' + state.denomRound + '/6 题：这是多少钱？', 'mny-guide');

            body.innerHTML =
                '<div class="mny-denom-card">' +
                    '<div class="mny-coin-display">' + this.renderCoinVisual(denom) + '</div>' +
                    '<div class="mny-question-text">这张钱的面值是多少？</div>' +
                    '<div class="mny-choices" id="mny-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                choices.map(function (c) { return c.label; }),
                'mny-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = choices[idx];
                    if (picked.value === denom.value) {
                        H.updateGuide('答对啦！' + denom.display + ' = ' + denom.display + ' ～', 'mny-guide');
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
                        }
                        var el = document.querySelector('#mny-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        setTimeout(function () { self.nextDenomQuestion(); }, 1000);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '再想想，' + denom.display + '是这个面额哦！',
                            document.querySelector('#mny-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        /* 短暂闪烁正确选项提示 */
                        setTimeout(function () { state.answered = false; }, 1200);
                    }
                }
            );
        },

        /* 渲染钱币可视化 */
        renderCoinVisual: function (denom) {
            if (denom.type === 'fen') {
                return '<div class="mny-coin mny-coin--fen">' +
                    '<div class="mny-coin-inner">' + denom.display + '</div></div>';
            }
            if (denom.type === 'jiao') {
                return '<div class="mny-coin mny-coin--jiao">' +
                    '<div class="mny-coin-inner">' + denom.display + '</div></div>';
            }
            /* 纸币 */
            return '<div class="mny-bill">' +
                '<div class="mny-bill-inner">' +
                    '<span class="mny-bill-emoji">💴</span>' +
                    '<span class="mny-bill-value">' + denom.display + '</span>' +
                '</div></div>';
        },

        /* ============================================================
         *  Phase 2 — 购物找零（4 题）
         * ============================================================ */
        startPhase2: function () {
            this.nextShoppingQuestion();
        },

        nextShoppingQuestion: function () {
            state.answered = false;
            state.qIndex++;

            if (state.qIndex > state.shoppingScenarios.length) {
                this.finishGame();
                return;
            }

            var sc = state.shoppingScenarios[state.qIndex - 1];
            var body = document.getElementById('mny-body');
            H.updateGuide('购物第 ' + state.qIndex + '/' + state.shoppingScenarios.length + ' 题', 'mny-guide');

            /* 题目视觉 */
            var visualHTML = '';
            if (sc.type === 'total') {
                var parts = sc.itemName.split(' + ');
                visualHTML =
                    '<div class="mny-shop-items">' +
                        '<div class="mny-shop-item"><span class="mny-shop-emoji">' + sc.emoji.split(' ')[0] + '</span><span>' + parts[0] + '</span></div>' +
                        '<div class="mny-shop-plus">+</div>' +
                        '<div class="mny-shop-item"><span class="mny-shop-emoji">' + sc.emoji.split(' ')[1] + '</span><span>' + (parts[1] || '') + '</span></div>' +
                    '</div>';
            } else if (sc.type === 'change10') {
                visualHTML =
                    '<div class="mny-shop-items">' +
                        '<div class="mny-shop-item"><span class="mny-shop-emoji">' + sc.emoji + '</span><span>' + sc.itemName + '</span></div>' +
                        '<div class="mny-shop-price-tag">' + formatMoney(sc.itemPrice) + '</div>' +
                        '<div class="mny-shop-paid">付 10 元 💴</div>' +
                    '</div>';
            } else {
                visualHTML =
                    '<div class="mny-shop-items">' +
                        '<div class="mny-shop-item"><span class="mny-shop-emoji">' + sc.emoji + '</span><span>' + sc.itemName + '</span></div>' +
                    '</div>';
            }

            body.innerHTML =
                '<div class="mny-shop-card">' +
                    '<div class="mny-question-text">' + sc.text + '</div>' +
                    visualHTML +
                    '<div class="mny-choices" id="mny-choices"></div>' +
                    '<div class="mny-hint-bar" id="mny-hint">' +
                        '<button class="mny-hint-btn" id="mny-hint-btn">💡 提示</button>' +
                        '<div class="mny-hint-text" id="mny-hint-text"></div>' +
                    '</div>' +
                '</div>';

            /* 提示按钮 */
            document.getElementById('mny-hint-btn').onclick = function () {
                var ht = document.getElementById('mny-hint-text');
                ht.textContent = sc.hint;
                ht.style.display = 'block';
            };

            var choices = makeShoppingChoices(sc.answer);
            var self = this;

            H.renderChoices(
                choices,
                'mny-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = choices[idx];
                    if (picked === sc.answerText) {
                        H.updateGuide('太棒了！' + sc.answerText + '，完全正确！🎉', 'mny-guide');
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#mny-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        setTimeout(function () { self.nextShoppingQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container,
                            '不对哦，正确答案是 ' + sc.answerText + '。' + sc.hint,
                            document.querySelector('#mny-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        /* 高亮正确答案 */
                        choices.forEach(function (c, ci) {
                            if (c === sc.answerText) {
                                var el2 = document.querySelector('#mny-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) {
                                    el2.style.background = '#10b981';
                                    el2.style.borderColor = '#10b981';
                                    el2.style.color = 'white';
                                }
                            }
                        });
                        setTimeout(function () { self.nextShoppingQuestion(); }, 2000);
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
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                '你已经认识了人民币，学会了简单购物！',
                'lvl_1_d_6'
            );
        },

        /* ============================================================
         *  CSS
         * ============================================================ */
        buildCSS: function () {
            return '' +
                /* 整体布局 */
                '.mny-wrap{' +
                    'width:100%;height:100%;position:relative;overflow:hidden;' +
                    'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                    'background:linear-gradient(180deg,#fef3c7 0%,#fff7ed 50%,#fef9c3 100%);' +
                    'display:flex;flex-direction:column;user-select:none;' +
                '}' +
                '.mny-header{position:relative;z-index:50;}' +
                '.mny-body{' +
                    'flex:1;display:flex;flex-direction:column;align-items:center;' +
                    'justify-content:center;padding:20px;gap:20px;' +
                    'animation:mny-fadeIn 0.4s ease;' +
                '}' +
                '@keyframes mny-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

                /* 认识钱币卡片 */
                '.mny-denom-card{' +
                    'background:white;border-radius:30px;padding:30px 40px;' +
                    'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                    'border:3px solid #fbbf24;' +
                    'display:flex;flex-direction:column;align-items:center;gap:20px;' +
                    'animation:mny-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                    'max-width:420px;width:90%;' +
                '}' +
                '@keyframes mny-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

                /* 硬币 */
                '.mny-coin-display{margin:10px 0;}' +
                '.mny-coin{' +
                    'width:120px;height:120px;border-radius:50%;display:flex;' +
                    'align-items:center;justify-content:center;' +
                    'box-shadow:0 6px 0 rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.4);' +
                    'border:4px solid rgba(255,255,255,0.3);' +
                    'position:relative;' +
                '}' +
                '.mny-coin::after{content:"";position:absolute;inset:8px;border-radius:50%;' +
                    'border:2px dashed rgba(255,255,255,0.4);pointer-events:none;}' +
                '.mny-coin--fen{' +
                    'background:radial-gradient(circle at 35% 35%,#a3a3a3,#737373);' +
                    'border-color:rgba(255,255,255,0.2);' +
                '}' +
                '.mny-coin--jiao{' +
                    'background:radial-gradient(circle at 35% 35%,#fbbf24,#d97706);' +
                '}' +
                '.mny-coin-inner{' +
                    'font-size:28px;font-weight:bold;color:white;' +
                    'text-shadow:0 2px 4px rgba(0,0,0,0.3);z-index:2;' +
                '}' +

                /* 纸币 */
                '.mny-bill{' +
                    'width:200px;height:100px;border-radius:12px;' +
                    'background:linear-gradient(135deg,#ecfdf5 0%,#a7f3d0 100%);' +
                    'border:3px solid #6ee7b7;box-shadow:0 4px 12px rgba(0,0,0,0.1);' +
                    'display:flex;align-items:center;justify-content:center;' +
                    'position:relative;overflow:hidden;' +
                '}' +
                '.mny-bill::before{content:"";position:absolute;inset:0;' +
                    'background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.3) 8px,rgba(255,255,255,0.3) 16px);' +
                    'pointer-events:none;opacity:0.5;}' +
                '.mny-bill-inner{display:flex;flex-direction:column;align-items:center;gap:4px;z-index:2;}' +
                '.mny-bill-emoji{font-size:28px;}' +
                '.mny-bill-value{font-size:22px;font-weight:bold;color:#065f46;}' +

                /* 题目文字 */
                '.mny-question-text{' +
                    'font-size:22px;font-weight:bold;color:#92400e;' +
                    'text-align:center;line-height:1.5;' +
                '}' +

                /* 选项容器 */
                '.mny-choices{' +
                    'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                    'width:100%;max-width:400px;' +
                '}' +

                /* 购物卡片 */
                '.mny-shop-card{' +
                    'background:white;border-radius:30px;padding:30px 30px 25px;' +
                    'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                    'border:3px solid #f59e0b;' +
                    'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                    'animation:mny-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                    'max-width:480px;width:92%;' +
                '}' +

                /* 购物物品展示 */
                '.mny-shop-items{' +
                    'display:flex;align-items:center;gap:16px;' +
                    'background:#fffbeb;border-radius:20px;padding:16px 24px;' +
                    'border:2px solid #fde68a;flex-wrap:wrap;justify-content:center;' +
                '}' +
                '.mny-shop-item{' +
                    'display:flex;flex-direction:column;align-items:center;gap:4px;' +
                '}' +
                '.mny-shop-emoji{font-size:42px;line-height:1;}' +
                '.mny-shop-item>span:last-child{font-size:14px;color:#92400e;font-weight:bold;}' +
                '.mny-shop-plus{font-size:28px;font-weight:bold;color:#d97706;}' +
                '.mny-shop-price-tag{' +
                    'background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;' +
                    'padding:4px 14px;font-size:18px;font-weight:bold;color:#92400e;' +
                '}' +
                '.mny-shop-paid{' +
                    'background:#ecfdf5;border:2px solid #10b981;border-radius:12px;' +
                    'padding:4px 14px;font-size:18px;font-weight:bold;color:#065f46;' +
                '}' +

                /* 提示 */
                '.mny-hint-bar{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
                '.mny-hint-btn{' +
                    'padding:6px 18px;border:2px solid #f59e0b;border-radius:20px;' +
                    'background:#fffbeb;color:#92400e;font-size:15px;font-weight:bold;' +
                    'cursor:pointer;transition:all 0.2s;' +
                '}' +
                '.mny-hint-btn:hover{background:#f59e0b;color:white;}' +
                '.mny-hint-text{' +
                    'display:none;font-size:14px;color:#b45309;text-align:center;' +
                    'max-width:320px;line-height:1.4;' +
                '}';
        }
    };

    window.CurrentGameModule = game;
})();
