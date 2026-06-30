/**
 * 四年级下册 第六单元：小数的加法和减法
 * 路径: src/games/grade4/g4_d_u6_decimal_addsub.js
 *
 * 玩法："小数超市购物"
 *   Phase 1 "认识价格": 读小数价格并比较。4轮。
 *   Phase 2 "单件购物": 小数加法和减法（一位小数）。4轮。
 *   Phase 3 "购物清单": 两步小数计算（多位小数）。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u6-decimal-addsub-styles';
    const NEXT_LEVEL = 'lvl_4_d_7';

    function randPrice(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 10) / 10;
    }

    function fmt(n) { return n.toFixed(1); }

    function genPriceChoices(ans) {
        var set = new Set();
        set.add(fmt(ans));
        while (set.size < 4) {
            var off = (H.randInt(-15, 15)) / 10;
            if (off === 0) off = 0.5;
            var v = Math.round((ans + off) * 10) / 10;
            if (v > 0 && v !== ans) set.add(fmt(v));
        }
        return H.shuffle(Array.from(set));
    }

    var ITEMS = [
        { name: '铅笔', emoji: '✏️', price: 2.5 },
        { name: '橡皮', emoji: '📎', price: 1.8 },
        { name: '尺子', emoji: '📏', price: 3.5 },
        { name: '笔记本', emoji: '📒', price: 5.6 },
        { name: '钢笔', emoji: '🖊️', price: 8.8 },
        { name: '彩色笔', emoji: '🖍️', price: 12.5 },
        { name: '文具盒', emoji: '📦', price: 15.8 },
        { name: '书包', emoji: '🎒', price: 45.5 }
    ];

    /** Phase 1: 读价格、比较价格 */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var a = H.randInt(0, ITEMS.length - 1);
            var b = H.randInt(0, ITEMS.length - 1);
            while (b === a) b = H.randInt(0, ITEMS.length - 1);
            var itemA = ITEMS[a], itemB = ITEMS[b];
            var correct = itemA.price > itemB.price ?
                (itemA.emoji + itemA.name + ' 更贵') :
                (itemB.emoji + itemB.name + ' 更贵');
            var wrong1 = itemA.price > itemB.price ?
                (itemB.emoji + itemB.name + ' 更贵') :
                (itemA.emoji + itemA.name + ' 更贵');
            qs.push({
                text: itemA.emoji + itemA.name + ' ' + fmt(itemA.price) + '元 vs ' + itemB.emoji + itemB.name + ' ' + fmt(itemB.price) + '元',
                answer: correct,
                choices: H.shuffle([correct, wrong1, '价格一样', '无法比较']),
                hint: '比较小数大小：先比整数部分'
            });
        }
        return qs;
    }

    /** Phase 2: 单步加减 */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var isAdd = Math.random() > 0.4;
            var a = randPrice(2, 30);
            var result;
            if (isAdd) {
                var b = randPrice(1, 20);
                result = Math.round((a + b) * 10) / 10;
                qs.push({
                    text: '买' + fmt(a) + '元的商品，再买' + fmt(b) + '元的商品，一共多少钱？',
                    answer: fmt(result),
                    choices: genPriceChoices(result),
                    hint: '把两个小数相加'
                });
            } else {
                var paid = randPrice(10, 50);
                var cost = randPrice(2, paid - 1);
                result = Math.round((paid - cost) * 10) / 10;
                qs.push({
                    text: '付了' + fmt(paid) + '元，买了一个' + fmt(cost) + '元的商品，应找回多少钱？',
                    answer: fmt(result),
                    choices: genPriceChoices(result),
                    hint: '用付款金额减去商品价格'
                });
            }
        }
        return qs;
    }

    /** Phase 3: 两步计算 */
    function buildPhase3() {
        var qs = [];
        for (var i = 0; i < 4; i++) {
            var type = H.randInt(0, 1);
            if (type === 0) {
                // 买三件东西
                var a = randPrice(2, 15);
                var b = randPrice(2, 15);
                var c = randPrice(2, 15);
                var total = Math.round((a + b + c) * 100) / 100;
                var totalStr = total.toFixed(2);
                var set = new Set();
                set.add(totalStr);
                while (set.size < 4) {
                    var off = (H.randInt(-20, 20)) / 10;
                    if (off === 0) off = 1;
                    var v = Math.round((total + off) * 100) / 100;
                    if (v > 0) set.add(v.toFixed(2));
                }
                qs.push({
                    text: fmt(a) + '元 + ' + fmt(b) + '元 + ' + fmt(c) + '元 = ?',
                    answer: totalStr,
                    choices: H.shuffle(Array.from(set)),
                    hint: '依次相加，注意小数点对齐'
                });
            } else {
                // 找零两步
                var paid2 = randPrice(20, 100);
                var item1 = randPrice(3, 20);
                var item2 = randPrice(3, 20);
                var total2 = Math.round((item1 + item2) * 10) / 10;
                var change = Math.round((paid2 - total2) * 10) / 10;
                var set2 = new Set();
                set2.add(fmt(change));
                while (set2.size < 4) {
                    var off2 = (H.randInt(-10, 10)) / 10;
                    if (off2 === 0) off2 = 0.5;
                    var v2 = Math.round((change + off2) * 10) / 10;
                    if (v2 >= 0) set2.add(fmt(v2));
                }
                qs.push({
                    text: '付' + fmt(paid2) + '元，买' + fmt(item1) + '元和' + fmt(item2) + '元的商品，找回？',
                    answer: fmt(change),
                    choices: H.shuffle(Array.from(set2)),
                    hint: '先算总价，再用付款减总价'
                });
            }
        }
        return qs;
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null, levelData: null, mistakes: 0,
        phase: 0, qIndex: 0, questions: [], answered: false
    };

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30 };
            if (!state.container) return;
            H.injectStyles(STYLE_ID, buildCSS());
            state.mistakes = 0; state.phase = 1; state.qIndex = 0; state.answered = false;
            state.questions = buildPhase1();
            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="das-wrap">' +
                    '<div class="das-header">' +
                        H.guideBarHTML('🛒', '小数超市购物——用小数算算账！', 'das-guide') +
                    '</div>' +
                    '<div class="das-body" id="das-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('比价高手！来算算购物账单！', 'das-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('单件没问题！挑战多件购物！', 'das-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('das-body');
            var labels = { 1: '认识价格', 2: '单件购物', 3: '购物清单' };
            var emojis = { 1: '💰', 2: '🧾', 3: '📋' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'das-guide');

            body.innerHTML =
                '<div class="das-card">' +
                    '<div class="das-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="das-card-text">' + q.text + '</div>' +
                    '<div class="das-card-hint">' + q.hint + '</div>' +
                    '<div class="das-card-choices" id="das-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'das-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('账算对了！超市小会计！✅', 'das-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#das-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#das-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#das-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你能熟练进行小数加减运算了！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.das-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#ede9fe 0%,#c4b5fd 40%,#8b5cf6 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.das-header{position:relative;z-index:50;}' +
            '.das-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:das-fadeIn 0.4s ease;}' +
            '@keyframes das-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.das-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #8b5cf6;display:flex;flex-direction:column;align-items:center;gap:18px;animation:das-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes das-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.das-card-emoji{font-size:50px;}' +
            '.das-card-text{font-size:26px;font-weight:bold;color:#5b21b6;text-align:center;line-height:1.6;font-family:"Courier New",monospace;background:#f5f3ff;padding:14px 28px;border-radius:16px;border:2px solid #c4b5fd;}' +
            '.das-card-hint{font-size:16px;color:#7c3aed;font-style:italic;}' +
            '.das-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
