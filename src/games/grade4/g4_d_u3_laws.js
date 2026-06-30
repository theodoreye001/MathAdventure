/**
 * 四年级下册 第三单元：运算定律
 * 路径: src/games/grade4/g4_d_u3_laws.js
 *
 * 玩法："简便计算快攻"
 *   Phase 1 "交换律与结合律": 选择正确的简便方法。4轮。
 *   Phase 2 "乘法分配律": 识别和应用分配律。4轮。
 *   Phase 3 "综合快攻": 综合运用运算定律速算。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u3-laws-styles';
    const NEXT_LEVEL = 'lvl_4_d_4';

    function genChoices(ans) {
        var set = new Set();
        set.add(String(ans));
        while (set.size < 4) {
            var off = H.randInt(-8, 8);
            if (off === 0) off = H.randInt(1, 5);
            var v = ans + off;
            if (v > 0 && v < 500) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** Phase 1: 交换律与结合律 */
    function buildPhase1() {
        var qs = [];
        var templates = [
            { expr: '25 × 17 × 4', method: '25 × 4 × 17', result: '100 × 17 = 1700', law: '乘法交换律', ans: '1700', desc: '交换 25 和 17 的位置，先算 25×4=100' },
            { expr: '78 × 99 + 78', method: '78 × (99 + 1)', result: '78 × 100 = 7800', law: '乘法分配律', ans: '7800', desc: '把 78 看成 78×1，提取公因数 78' },
            { expr: '125 × 32', method: '125 × 8 × 4', result: '1000 × 4 = 4000', law: '乘法结合律', ans: '4000', desc: '把 32 拆成 8×4，先算 125×8=1000' },
            { expr: '47 + 89 + 53', method: '(47 + 53) + 89', result: '100 + 89 = 189', law: '加法交换律和结合律', ans: '189', desc: '交换位置，先算 47+53=100' },
            { expr: '25 × 44', method: '25 × (40 + 4)', result: '1000 + 100 = 1100', law: '乘法分配律', ans: '1100', desc: '把 44 拆成 40+4，分别乘 25' },
            { expr: '36 + 64 + 28', method: '(36 + 64) + 28', result: '100 + 28 = 128', law: '加法结合律', ans: '128', desc: '先算 36+64=100' },
            { expr: '125 × 24', method: '125 × 8 × 3', result: '1000 × 3 = 3000', law: '乘法结合律', ans: '3000', desc: '把 24 拆成 8×3' },
            { expr: '99 × 56', method: '(100-1) × 56', result: '5600 - 56 = 5544', law: '乘法分配律', ans: '5544', desc: '把 99 看成 100-1' }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                expr: t.expr,
                answer: t.result,
                law: t.law,
                desc: t.desc,
                choices: H.shuffle([t.result, genOneWrong(t), genOneWrong2(t), genOneWrong3(t)]),
                hint: '哪种方法最简便？'
            });
        }
        return qs;
    }

    function genOneWrong(t) { return String(parseInt(t.ans) + H.randInt(1, 20)); }
    function genOneWrong2(t) { return String(parseInt(t.ans) - H.randInt(1, 20)); }
    function genOneWrong3(t) {
        var fake = parseInt(t.ans) + H.randInt(-50, 50);
        if (fake <= 0) fake = parseInt(t.ans) + 100;
        return String(fake);
    }

    /** Phase 2: 乘法分配律 */
    function buildPhase2() {
        var qs = [];
        var problems = [];
        for (var i = 0; i < 8; i++) {
            var a = H.randInt(5, 20);
            var b = H.randInt(2, 8);
            var c = H.randInt(10, 30);
            var expr = a + ' × (' + b + ' + ' + c + ')';
            var expanded = a + ' × ' + b + ' + ' + a + ' × ' + c;
            var result = a * (b + c);
            if (problems.indexOf(expr) === -1) {
                problems.push(expr);
                var wrongA = String(a * b + c);
                var wrongB = String(a + b * c);
                var wrongC = String((a + b) * c);
                qs.push({
                    expr: expr + ' = ' + expanded,
                    answer: String(result),
                    choices: H.shuffle([String(result), wrongA, wrongB, wrongC]),
                    hint: '用乘法分配律：a×(b+c) = a×b + a×c'
                });
            }
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /** Phase 3: 综合快攻 */
    function buildPhase3() {
        var qs = [];
        var templates = [
            { expr: '38 × 29 + 38', answer: '1140', desc: '38 × (29 + 1)' },
            { expr: '102 × 45', answer: '4590', desc: '(100 + 2) × 45' },
            { expr: '25 × 32 × 125', answer: '100000', desc: '(25 × 4) × (8 × 125)' },
            { expr: '99 × 37 + 37', answer: '3700', desc: '(99 + 1) × 37' },
            { expr: '64 × 125', answer: '8000', desc: '8 × 125 × 8' },
            { expr: '45 × 101', answer: '4545', desc: '45 × (100 + 1)' },
            { expr: '72 × 25', answer: '1800', desc: '18 × 4 × 25' },
            { expr: '35 × 18 + 35 × 82', answer: '3500', desc: '35 × (18 + 82)' }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                expr: t.expr,
                answer: t.answer,
                desc: t.desc,
                choices: genChoices(parseInt(t.answer)),
                hint: '用运算定律简便计算'
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
                '<div class="law-wrap">' +
                    '<div class="law-header">' +
                        H.guideBarHTML('⚡', '简便计算快攻——用运算定律快速计算！', 'law-guide') +
                    '</div>' +
                    '<div class="law-body" id="law-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('交换律结合律没问题！来试试分配律！', 'law-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('分配律也掌握了！终极快攻开始！', 'law-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('law-body');
            var labels = { 1: '交换律与结合律', 2: '乘法分配律', 3: '综合快攻' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'law-guide');
            var emojis = { 1: '🔀', 2: '📐', 3: '🏃' };

            body.innerHTML =
                '<div class="law-card">' +
                    '<div class="law-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="law-card-expr">' + q.expr + '</div>' +
                    '<div class="law-card-desc">' + (q.desc || q.law || '') + '</div>' +
                    '<div class="law-card-hint">' + q.hint + '</div>' +
                    '<div class="law-card-choices" id="law-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'law-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('太棒了！运算定律运用自如！✅', 'law-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#law-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#law-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#law-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你熟练掌握了运算定律！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.law-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fef9c3 0%,#fde68a 40%,#f59e0b 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.law-header{position:relative;z-index:50;}' +
            '.law-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:law-fadeIn 0.4s ease;}' +
            '@keyframes law-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.law-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #f59e0b;display:flex;flex-direction:column;align-items:center;gap:18px;animation:law-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes law-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.law-card-emoji{font-size:50px;}' +
            '.law-card-expr{font-size:28px;font-weight:bold;color:#b45309;text-align:center;line-height:1.6;font-family:"Courier New",monospace;background:#fef9c3;padding:12px 28px;border-radius:16px;border:2px solid #fcd34d;}' +
            '.law-card-desc{font-size:16px;color:#92400e;font-weight:bold;background:#fffbeb;padding:8px 16px;border-radius:10px;}' +
            '.law-card-hint{font-size:16px;color:#d97706;font-style:italic;}' +
            '.law-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
