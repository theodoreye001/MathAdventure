/**
 * 四年级下册 第四单元：小数的意义和性质
 * 路径: src/games/grade4/g4_d_u4_decimal_meaning.js
 *
 * 玩法："小数点跳跃"
 *   Phase 1 "小数读写与意义": 选择小数的正确读法和组成。4轮。
 *   Phase 2 "小数比较大小": 比较两个小数的大小。4轮。
 *   Phase 3 "小数点移动": 小数点移动引起的变化。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u4-decimal-meaning-styles';
    const NEXT_LEVEL = 'lvl_4_d_5';

    function randDec(min, max, decimals) {
        var factor = Math.pow(10, decimals);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    /** Phase 1: 小数读写与意义 */
    function buildPhase1() {
        var qs = [];
        var templates = [
            { num: '3.5', read: '三点五', desc: '3个一和5个0.1组成', wrong1: '三点十五', wrong2: '三又五分之一', wrong3: '三点零五' },
            { num: '0.72', read: '零点七二', desc: '7个0.1和2个0.01组成', wrong1: '零点七十二', wrong2: '七十二个0.1', wrong3: '零点二七' },
            { num: '12.08', read: '十二点零八', desc: '12个一和8个0.01组成', wrong1: '十二点八十', wrong2: '一百二十点零八', wrong3: '十二点八' },
            { num: '5.60', read: '五点六零', desc: '5个一、6个0.1和0个0.01', wrong1: '五点六', wrong2: '五十六个0.1', wrong3: '五点零六' },
            { num: '0.009', read: '零点零零九', desc: '9个0.001组成', wrong1: '零点零九', wrong2: '九个百分之一', wrong3: '零点九' },
            { num: '4.3', read: '四点三', desc: '4个一和3个0.1组成', wrong1: '四十三', wrong2: '四点十三', wrong3: '四十点三' },
            { num: '100.5', read: '一百点五', desc: '100个一和5个0.1组成', wrong1: '一百零点五', wrong2: '一百五十', wrong3: '一点零零五' },
            { num: '0.45', read: '零点四五', desc: '4个0.1和5个0.01组成', wrong1: '零点四十五', wrong2: '四十五个0.1', wrong3: '零点五四' }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: '小数 ' + t.num + ' 的正确读法是？',
                answer: t.read,
                choices: H.shuffle([t.read, t.wrong1, t.wrong2, t.wrong3]),
                hint: '小数部分要逐位读出'
            });
        }
        return qs;
    }

    /** Phase 2: 小数比较大小 */
    function buildPhase2() {
        var qs = [];
        var used = [];
        for (var i = 0; i < 6; i++) {
            var a = randDec(0.1, 99.99, 2);
            var b = randDec(0.1, 99.99, 2);
            if (a === b) b = a + 0.1;
            var key = Math.min(a, b) + '_' + Math.max(a, b);
            if (used.indexOf(key) !== -1) continue;
            used.push(key);
            var correct = a > b ? a + ' > ' + b : a + ' < ' + b;
            var wrong1 = a > b ? a + ' < ' + b : a + ' > ' + b;
            var wrong2 = a + ' = ' + b;
            var wrong3 = '无法比较';
            qs.push({
                text: '比较：' + a + ' 和 ' + b,
                answer: correct,
                choices: H.shuffle([correct, wrong1, wrong2, wrong3]),
                hint: '先比较整数部分，再逐位比较小数部分'
            });
            if (qs.length >= 4) break;
        }
        while (qs.length < 4) {
            var a2 = randDec(1, 50, 1);
            var b2 = a2 + H.randInt(1, 5) * 0.1;
            b2 = Math.round(b2 * 10) / 10;
            var correct2 = a2 + ' < ' + b2;
            qs.push({
                text: '比较：' + a2 + ' 和 ' + b2,
                answer: correct2,
                choices: H.shuffle([correct2, a2 + ' > ' + b2, a2 + ' = ' + b2, '无法比较']),
                hint: '整数部分相同时，看十分位'
            });
        }
        return qs;
    }

    /** Phase 3: 小数点移动 */
    function buildPhase3() {
        var qs = [];
        var templates = [
            { expr: '0.036 × 10', answer: '0.36', desc: '小数点向右移动一位' },
            { expr: '0.036 × 100', answer: '3.6', desc: '小数点向右移动两位' },
            { expr: '3.6 ÷ 10', answer: '0.36', desc: '小数点向左移动一位' },
            { expr: '360 ÷ 100', answer: '3.6', desc: '小数点向左移动两位' },
            { expr: '2.5 × 1000', answer: '2500', desc: '小数点向右移动三位' },
            { expr: '2500 ÷ 1000', answer: '2.5', desc: '小数点向左移动三位' },
            { expr: '0.78 × 10', answer: '7.8', desc: '小数点向右移动一位' },
            { expr: '7.8 ÷ 10', answer: '0.78', desc: '小数点向左移动一位' }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            var wrongChoices = [];
            if (t.desc.indexOf('右') !== -1) {
                wrongChoices = [String(parseFloat(t.answer) * 10), String(parseFloat(t.answer) / 10), String(parseFloat(t.answer) * 100)];
            } else {
                wrongChoices = [String(parseFloat(t.answer) * 10), String(parseFloat(t.answer) * 100), String(parseFloat(t.answer) / 10)];
            }
            qs.push({
                text: t.expr + ' = ?',
                answer: t.answer,
                choices: H.shuffle([t.answer].concat(wrongChoices)),
                hint: t.desc
            });
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
            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = buildPhase1();
            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="dcm4-wrap">' +
                    '<div class="dcm4-header">' +
                        H.guideBarHTML('🔢', '小数点跳跃——探索小数的奥秘！', 'dcm4-guide') +
                    '</div>' +
                    '<div class="dcm4-body" id="dcm4-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('读写没问题！比比谁大谁小！', 'dcm4-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('大小比较也行！看小数点怎么跳舞！', 'dcm4-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('dcm4-body');
            var labels = { 1: '小数读写', 2: '小数比较', 3: '小数点移动' };
            var emojis = { 1: '📝', 2: '⚖️', 3: '🦘' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'dcm4-guide');

            body.innerHTML =
                '<div class="dcm4-card">' +
                    '<div class="dcm4-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="dcm4-card-text">' + q.text + '</div>' +
                    '<div class="dcm4-card-hint">' + q.hint + '</div>' +
                    '<div class="dcm4-card-choices" id="dcm4-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'dcm4-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('回答正确！小数高手！✅', 'dcm4-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#dcm4-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#dcm4-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#dcm4-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你完全掌握了小数的意义和性质！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.dcm4-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#ecfdf5 0%,#a7f3d0 40%,#10b981 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.dcm4-header{position:relative;z-index:50;}' +
            '.dcm4-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:dcm4-fadeIn 0.4s ease;}' +
            '@keyframes dcm4-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.dcm4-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #10b981;display:flex;flex-direction:column;align-items:center;gap:18px;animation:dcm4-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes dcm4-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.dcm4-card-emoji{font-size:50px;}' +
            '.dcm4-card-text{font-size:28px;font-weight:bold;color:#047857;text-align:center;line-height:1.6;font-family:"Courier New",monospace;background:#ecfdf5;padding:12px 28px;border-radius:16px;border:2px solid #6ee7b7;}' +
            '.dcm4-card-hint{font-size:16px;color:#059669;font-style:italic;}' +
            '.dcm4-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
