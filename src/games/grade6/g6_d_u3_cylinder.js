/**
 * 六年级下册 第三单元：圆柱与圆锥
 * 路径: src/games/grade6/g6_d_u3_cylinder.js
 *
 * 玩法："立体体积挑战"
 *   Phase 1 "圆柱计算" (4题): 圆柱侧面积、表面积、体积。
 *   Phase 2 "圆锥体积" (4题): 圆锥体积公式(1/3πr²h)，与圆柱关系。
 *   Phase 3 "综合应用" (4题): 实际问题中圆柱圆锥的综合计算。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-d-u3-cylinder-styles';
    const NEXT_LEVEL = 'lvl_6_d_4';
    var PI = Math.PI;

    /** 格式化圆的计算结果（保留两位小数或整数） */
    function fmt(v) {
        if (Math.abs(v - Math.round(v)) < 0.01) return '' + Math.round(v);
        return v.toFixed(2);
    }

    /* ─────────────────── Phase 1: 圆柱计算 ─────────────────── */

    var PHASE1 = [
        {
            text: '一个圆柱的底面半径是3厘米，高是10厘米，侧面积是（    ）平方厘米',
            answer: fmt(2 * PI * 3 * 10),
            choices: (function () {
                var correct = 2 * PI * 3 * 10;
                return H.shuffle([
                    fmt(correct), fmt(2 * PI * 3 * 3), fmt(PI * 3 * 3 * 10), fmt(2 * PI * 10 * 10)
                ]);
            })(),
            hint: '侧面积 = 底面周长 × 高 = 2πrh',
            explain: '侧面积 = 2πrh = 2 × π × 3 × 10 = 60π ≈ ' + fmt(2 * PI * 3 * 10) + '（cm²）。'
        },
        {
            text: '一个圆柱底面半径2分米，高5分米，体积是（    ）立方分米',
            answer: fmt(PI * 2 * 2 * 5),
            choices: H.shuffle([
                fmt(PI * 2 * 2 * 5), fmt(2 * PI * 2 * 5), fmt(PI * 2 * 5), fmt(PI * 4 * 4 * 5)
            ]),
            hint: '体积 = πr²h',
            explain: '体积 = πr²h = π × 2² × 5 = 20π ≈ ' + fmt(PI * 2 * 2 * 5) + '（dm³）。'
        },
        {
            text: '圆柱的底面直径是6厘米，高是8厘米，它的表面积约为（    ）平方厘米',
            answer: fmt(2 * PI * 3 * 3 + 2 * PI * 3 * 8),
            choices: H.shuffle([
                fmt(2 * PI * 3 * 3 + 2 * PI * 3 * 8),
                fmt(2 * PI * 3 * 8),
                fmt(PI * 3 * 3 * 8),
                fmt(2 * PI * 3 * 3 + PI * 3 * 3 * 8)
            ]),
            hint: '表面积 = 2个底面积 + 侧面积 = 2πr² + 2πrh',
            explain: 'r = 6÷2 = 3。表面积 = 2πr² + 2πrh = 2π×9 + 2π×3×8 = 18π + 48π = 66π ≈ ' + fmt(2 * PI * 3 * 3 + 2 * PI * 3 * 8) + '（cm²）。'
        },
        {
            text: '把一个圆柱形木头截成3段，表面积增加了24平方厘米，这根木头的底面积是（    ）平方厘米',
            answer: '6',
            choices: ['6', '8', '12', '24'],
            hint: '截成3段需要截2刀，每刀增加2个底面，共增加4个底面',
            explain: '截2刀增加4个底面。24 ÷ 4 = 6（cm²）。'
        }
    ];

    /* ─────────────────── Phase 2: 圆锥体积 ─────────────────── */

    var PHASE2 = [
        {
            text: '一个圆锥的底面积是15平方厘米，高是6厘米，体积是（    ）立方厘米',
            answer: '30',
            choices: ['30', '90', '45', '15'],
            hint: '圆锥体积 = 1/3 × 底面积 × 高',
            explain: 'V = 1/3 × S × h = 1/3 × 15 × 6 = 30（cm³）。'
        },
        {
            text: '等底等高的圆柱和圆锥，圆锥体积是圆柱体积的（    ）',
            answer: '1/3',
            choices: ['1/3', '1/2', '2/3', '3倍'],
            hint: '圆锥体积公式里有1/3',
            explain: '等底等高时，V圆锥 = 1/3 × πr²h = 1/3 × V圆柱。圆锥体积是圆柱的三分之一。'
        },
        {
            text: '一个圆柱的体积是45立方厘米，等底等高的圆锥体积是（    ）立方厘米',
            answer: '15',
            choices: ['15', '45', '90', '30'],
            hint: '等底等高的圆锥 = 圆柱 × 1/3',
            explain: '等底等高，圆锥体积 = 45 × 1/3 = 15（cm³）。'
        },
        {
            text: '一个圆锥底面半径3厘米，高7厘米，体积约为（    ）立方厘米',
            answer: fmt(PI * 3 * 3 * 7 / 3),
            choices: H.shuffle([
                fmt(PI * 3 * 3 * 7 / 3),
                fmt(PI * 3 * 3 * 7),
                fmt(2 * PI * 3 * 7),
                fmt(PI * 3 * 7)
            ]),
            hint: 'V = 1/3 × π × r² × h',
            explain: 'V = 1/3 × π × 9 × 7 = 21π ≈ ' + fmt(PI * 3 * 3 * 7 / 3) + '（cm³）。'
        }
    ];

    /* ─────────────────── Phase 3: 综合应用 ─────────────────── */

    var PHASE3 = [
        {
            text: '一个圆柱形水桶（无盖），底面直径40厘米，高50厘米，做这个水桶至少需要（    ）平方厘米铁皮',
            answer: fmt(PI * 20 * 20 + 2 * PI * 20 * 50),
            choices: H.shuffle([
                fmt(PI * 20 * 20 + 2 * PI * 20 * 50),
                fmt(2 * PI * 20 * 20 + 2 * PI * 20 * 50),
                fmt(2 * PI * 20 * 50),
                fmt(PI * 20 * 20 + PI * 20 * 50)
            ]),
            hint: '无盖水桶 = 1个底面积 + 侧面积',
            explain: 'r = 20。面积 = πr² + 2πrh = 400π + 2000π = 2400π ≈ ' + fmt(PI * 20 * 20 + 2 * PI * 20 * 50) + '（cm²）。'
        },
        {
            text: '一个圆锥形沙堆，底面周长12.56米，高1.5米，沙堆的体积约是（    ）立方米',
            answer: fmt(PI * 2 * 2 * 1.5 / 3),
            choices: H.shuffle([
                fmt(PI * 2 * 2 * 1.5 / 3),
                fmt(PI * 2 * 2 * 1.5),
                fmt(PI * 4 * 4 * 1.5 / 3),
                fmt(PI * 2 * 2 * 1.5 / 2)
            ]),
            hint: '先由周长求半径：r = C ÷ (2π)，再算体积',
            explain: 'r = 12.56 ÷ (2π) ≈ 2m。V = 1/3 × π × 4 × 1.5 = 2π ≈ ' + fmt(PI * 2 * 2 * 1.5 / 3) + '（m³）。'
        },
        {
            text: '把一块橡皮泥先捏成圆柱，再捏成等底等高的圆锥，体积（    ）',
            answer: '不变',
            choices: ['变大', '变小', '不变', '无法确定'],
            hint: '橡皮泥的体积不会因形状改变而改变',
            explain: '橡皮泥体积是固定的，不管捏成什么形状，体积不变。改变的只是形状，不是体积。'
        },
        {
            text: '一个圆柱形铁块熔铸成一个等底等高的圆锥，圆锥体积是铁块体积的（    ）',
            answer: '1/3',
            choices: ['1/3', '1/2', '相同', '3倍'],
            hint: '等底等高：V圆锥 = 1/3 V圆柱',
            explain: '等底等高的圆锥体积 = 1/3 × 圆柱体积。所以圆锥体积是铁块（圆柱形）体积的1/3。'
        }
    ];

    /* ─────────────────── 立体图形渲染 ─────────────────── */

    function renderCylinder() {
        return '' +
            '<div class="cyd-shape-wrap">' +
                '<svg width="100" height="120" viewBox="0 0 100 120">' +
                    '<ellipse cx="50" cy="15" rx="35" ry="12" fill="#93c5fd" stroke="#3b82f6" stroke-width="2"/>' +
                    '<rect x="15" y="15" width="70" height="80" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>' +
                    '<ellipse cx="50" cy="95" rx="35" ry="12" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>' +
                    '<text x="50" y="115" text-anchor="middle" font-size="11" fill="#3b82f6">圆柱</text>' +
                '</svg>' +
            '</div>';
    }

    function renderCone() {
        return '' +
            '<div class="cyd-shape-wrap">' +
                '<svg width="100" height="120" viewBox="0 0 100 120">' +
                    '<ellipse cx="50" cy="95" rx="35" ry="12" fill="#fca5a5" stroke="#ef4444" stroke-width="2"/>' +
                    '<polygon points="50,10 15,95 85,95" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>' +
                    '<text x="50" y="115" text-anchor="middle" font-size="11" fill="#ef4444">圆锥</text>' +
                '</svg>' +
            '</div>';
    }

    /* ─────────────────── 游戏状态 ─────────────────── */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
    };

    /* ─────────────────── CSS ─────────────────── */

    function buildCSS() {
        return '' +
            '.cyd-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#a78bfa 50%,#7c3aed 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.cyd-header{position:relative;z-index:50;}' +
            '.cyd-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:cyd-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes cyd-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.cyd-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #7c3aed;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:cyd-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes cyd-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.cyd-card-emoji{font-size:40px;}' +
            '.cyd-card-text{' +
                'font-size:20px;font-weight:bold;color:#4c1d95;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.cyd-card-hint{' +
                'font-size:15px;color:#7c3aed;font-style:italic;' +
            '}' +
            '.cyd-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;width:100%;' +
            '}' +
            '.cyd-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 立体图形 */
            '.cyd-shape-wrap{display:flex;justify-content:center;padding:6px 0;}' +

            /* 公式提示区 */
            '.cyd-formula{' +
                'background:#f5f3ff;border:2px solid #c4b5fd;border-radius:12px;' +
                'padding:10px 18px;font-size:15px;color:#5b21b6;' +
                'text-align:center;line-height:1.6;' +
            '}' +

            '.cyd-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#7c3aed,#a855f7);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(124,58,237,0.35);' +
                'animation:cyd-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            '.cyd-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.cyd-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#a78bfa,#7c3aed);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            '.cyd-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '圆柱与圆锥' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1.slice();

            this.render();
            this.showPhaseTransition('🔵 圆柱计算', '认识圆柱的侧面积、表面积和体积！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="cyd-wrap">' +
                    '<div class="cyd-header">' +
                        H.guideBarHTML('🔷', '立体体积挑战——圆柱与圆锥！', 'cyd-guide') +
                    '</div>' +
                    '<div class="cyd-body" id="cyd-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('cyd-body');
            body.innerHTML =
                '<div class="cyd-phase-banner">' + title + '</div>' +
                '<div style="font-size:18px;color:#4c1d95;text-align:center;margin-top:8px;">' +
                    subtitle + '</div>';
            setTimeout(function () { self.nextQuestion(); }, 1800);
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = PHASE2.slice();
                    H.updateGuide('圆柱掌握！来挑战圆锥！', 'cyd-guide');
                    this.showPhaseTransition('🔺 圆锥体积', '圆锥体积 = 1/3 圆柱体积，一起来记牢！');
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = PHASE3.slice();
                    H.updateGuide('圆锥也学会了！终极综合挑战！', 'cyd-guide');
                    this.showPhaseTransition('🏆 综合应用', '把圆柱和圆锥的知识用到实际问题中！');
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('cyd-body');
            var phaseLabels = { 1: '圆柱计算', 2: '圆锥体积', 3: '综合应用' };
            var phaseEmojis = { 1: '🔵', 2: '🔺', 3: '🏆' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var pct = Math.round(totalDone / 12 * 100);

            H.updateGuide('第 ' + (totalDone + 1) + '/12 题 · ' + phaseLabels[state.phase], 'cyd-guide');

            var shapeHTML = '';
            if (state.phase === 1) shapeHTML = renderCylinder();
            else if (state.phase === 2) shapeHTML = renderCone();

            var formulaHTML = '';
            if (state.phase === 1) {
                formulaHTML = '<div class="cyd-formula">📐 侧面积 = 2πrh &nbsp;|&nbsp; 表面积 = 2πr² + 2πrh &nbsp;|&nbsp; 体积 = πr²h</div>';
            } else if (state.phase === 2) {
                formulaHTML = '<div class="cyd-formula">🔺 圆锥体积 = 1/3 × πr²h = 1/3 × 底面积 × 高</div>';
            }

            body.innerHTML =
                '<div class="cyd-card">' +
                    '<div class="cyd-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    shapeHTML +
                    formulaHTML +
                    '<div class="cyd-card-text">' + q.text + '</div>' +
                    '<div class="cyd-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="cyd-card-explain" id="cyd-explain">📖 ' + q.explain + '</div>' +
                    '<div class="cyd-card-choices" id="cyd-choices"></div>' +
                '</div>' +
                '<div class="cyd-progress"><div class="cyd-progress-fill" style="width:' + pct + '%"></div></div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'cyd-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];
                    var el = document.querySelector('#cyd-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        H.updateGuide('答对了！立体几何小天才！✅', 'cyd-guide');
                        if (el) el.classList.add('cyd-correct');
                        self.updateMastery(8);
                        var explainEl = document.getElementById('cyd-explain');
                        if (explainEl) explainEl.style.display = 'block';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1800);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, el);
                        self.updateMastery(-5);
                        self.logError(q.text, picked);
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var correctEl = document.querySelector('#cyd-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('cyd-correct');
                            }
                        });
                        var explainEl2 = document.getElementById('cyd-explain');
                        if (explainEl2) explainEl2.style.display = 'block';
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2400);
                    }
                }
            );
        },

        updateMastery: function (delta) {
            if (window.GameManager && window.GameManager.updateMastery) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, delta);
            }
        },

        logError: function (qText, picked) {
            if (window.GameManager && window.GameManager.logError) {
                window.GameManager.logError(state.levelData.levelId || 'g6_d_u3', qText, picked);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了圆柱和圆锥的面积与体积计算！🔷',
                NEXT_LEVEL
            );
        }
    };

    window.CurrentGameModule = game;
})();
