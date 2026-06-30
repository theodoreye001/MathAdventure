/**
 * 四年级下册 第五单元：三角形
 * 路径: src/games/grade4/g4_d_u5_triangle.js
 *
 * 玩法："三角形分类"
 *   Phase 1 "按角分类": 判断三角形类型（锐角/直角/钝角）。4轮。
 *   Phase 2 "按边分类": 判断三角形类型（等腰/等边/一般）。4轮。
 *   Phase 3 "三角形内角和": 利用内角和=180度计算未知角。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u5-triangle-styles';
    const NEXT_LEVEL = 'lvl_4_d_6';

    function genAngleChoices(ans) {
        var set = new Set();
        set.add(String(ans));
        while (set.size < 4) {
            var off = H.randInt(-30, 30);
            if (off === 0) off = 15;
            var v = ans + off;
            if (v > 0 && v < 180 && v !== ans) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** Phase 1: 按角分类 */
    function buildPhase1() {
        var qs = [];
        var templates = [
            { angles: '30°、60°、90°', type: '直角三角形', wrong: ['锐角三角形', '钝角三角形', '等边三角形'] },
            { angles: '45°、45°、90°', type: '直角三角形', wrong: ['锐角三角形', '钝角三角形', '等腰三角形'] },
            { angles: '60°、60°、60°', type: '锐角三角形', wrong: ['直角三角形', '钝角三角形', '等腰三角形'] },
            { angles: '20°、30°、130°', type: '钝角三角形', wrong: ['锐角三角形', '直角三角形', '等腰三角形'] },
            { angles: '70°、55°、55°', type: '锐角三角形', wrong: ['直角三角形', '钝角三角形', '等边三角形'] },
            { angles: '15°、45°、120°', type: '钝角三角形', wrong: ['锐角三角形', '直角三角形', '等腰三角形'] },
            { angles: '80°、50°、50°', type: '锐角三角形', wrong: ['直角三角形', '钝角三角形', '等腰三角形'] },
            { angles: '10°、80°、90°', type: '直角三角形', wrong: ['锐角三角形', '钝角三角形', '等腰三角形'] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: '三个角分别是 ' + t.angles + ' 的三角形是？',
                answer: t.type,
                choices: H.shuffle([t.type].concat(t.wrong)),
                hint: '最大角<90°是锐角，=90°是直角，>90°是钝角'
            });
        }
        return qs;
    }

    /** Phase 2: 按边分类 */
    function buildPhase2() {
        var qs = [];
        var templates = [
            { sides: '5cm、5cm、5cm', type: '等边三角形', wrong: ['等腰三角形', '一般三角形', '直角三角形'] },
            { sides: '6cm、6cm、4cm', type: '等腰三角形', wrong: ['等边三角形', '一般三角形', '钝角三角形'] },
            { sides: '3cm、4cm、5cm', type: '一般三角形', wrong: ['等腰三角形', '等边三角形', '直角三角形'] },
            { sides: '7cm、7cm、7cm', type: '等边三角形', wrong: ['等腰三角形', '一般三角形', '锐角三角形'] },
            { sides: '8cm、8cm、3cm', type: '等腰三角形', wrong: ['等边三角形', '一般三角形', '钝角三角形'] },
            { sides: '4cm、5cm、6cm', type: '一般三角形', wrong: ['等腰三角形', '等边三角形', '锐角三角形'] },
            { sides: '10cm、10cm、10cm', type: '等边三角形', wrong: ['等腰三角形', '一般三角形', '锐角三角形'] },
            { sides: '5cm、5cm、8cm', type: '等腰三角形', wrong: ['等边三角形', '一般三角形', '钝角三角形'] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: '三条边分别是 ' + t.sides + ' 的三角形是？',
                answer: t.type,
                choices: H.shuffle([t.type].concat(t.wrong)),
                hint: '三条边相等是等边，两条边相等是等腰'
            });
        }
        return qs;
    }

    /** Phase 3: 三角形内角和 */
    function buildPhase3() {
        var qs = [];
        var templates = [
            { a: 60, b: 80, c: null, answer: 40, hint: '三角形三个内角之和=180°' },
            { a: 90, b: 35, c: null, answer: 55, hint: '180° - 90° - 35° = ?' },
            { a: 45, b: 45, c: null, answer: 90, hint: '180° - 45° - 45° = ?' },
            { a: 70, b: 60, c: null, answer: 50, hint: '180° - 70° - 60° = ?' },
            { a: 120, b: 25, c: null, answer: 35, hint: '180° - 120° - 25° = ?' },
            { a: 50, b: 50, c: null, answer: 80, hint: '180° - 50° - 50° = ?' },
            { a: 30, b: 60, c: null, answer: 90, hint: '180° - 30° - 60° = ?' },
            { a: 75, b: 65, c: null, answer: 40, hint: '180° - 75° - 65° = ?' }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: '三角形的两个角分别是 ' + t.a + '° 和 ' + t.b + '°，第三个角是多少度？',
                answer: String(t.answer),
                choices: genAngleChoices(t.answer),
                hint: t.hint
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
            state.mistakes = 0; state.phase = 1; state.qIndex = 0; state.answered = false;
            state.questions = buildPhase1();
            this.render();
            this.nextQuestion();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="trg-wrap">' +
                    '<div class="trg-header">' +
                        H.guideBarHTML('🔺', '三角形分类——认识三角形的种类！', 'trg-guide') +
                    '</div>' +
                    '<div class="trg-body" id="trg-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('按角分类没问题！来按边分类！', 'trg-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('按边也行！最后算算内角和！', 'trg-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('trg-body');
            var labels = { 1: '按角分类', 2: '按边分类', 3: '内角和计算' };
            var emojis = { 1: '📐', 2: '📏', 3: '🔍' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'trg-guide');

            body.innerHTML =
                '<div class="trg-card">' +
                    '<div class="trg-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="trg-card-text">' + q.text + '</div>' +
                    '<div class="trg-card-hint">' + q.hint + '</div>' +
                    '<div class="trg-card-choices" id="trg-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'trg-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('三角形小专家！✅', 'trg-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#trg-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#trg-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#trg-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你掌握了三角形的分类和内角和！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.trg-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fef2f2 0%,#fecaca 40%,#f87171 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.trg-header{position:relative;z-index:50;}' +
            '.trg-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:trg-fadeIn 0.4s ease;}' +
            '@keyframes trg-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.trg-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #f87171;display:flex;flex-direction:column;align-items:center;gap:18px;animation:trg-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes trg-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.trg-card-emoji{font-size:50px;}' +
            '.trg-card-text{font-size:24px;font-weight:bold;color:#b91c1c;text-align:center;line-height:1.6;background:#fef2f2;padding:12px 24px;border-radius:16px;border:2px solid #fca5a5;}' +
            '.trg-card-hint{font-size:16px;color:#dc2626;font-style:italic;}' +
            '.trg-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
