/**
 * 四年级下册 第七单元：图形的运动（二）
 * 路径: src/games/grade4/g4_d_u7_motion2.js
 *
 * 玩法："对称与平移"
 *   Phase 1 "轴对称图形": 判断哪些是轴对称图形。4轮。
 *   Phase 2 "对称轴数量": 判断对称轴有几条。4轮。
 *   Phase 3 "平移图形": 判断平移后的正确位置。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u7-motion2-styles';
    const NEXT_LEVEL = 'lvl_4_d_8';

    /** Phase 1: 判断轴对称图形 */
    function buildPhase1() {
        var qs = [];
        var templates = [
            { shape: '正方形 🟦', symmetric: true, wrong: ['不是轴对称', '不确定', '只有旋转对称'] },
            { shape: '字母 A', symmetric: true, wrong: ['不是轴对称', '不确定', '只有中心对称'] },
            { shape: '数字 6', symmetric: false, wrong: ['是轴对称', '不确定', '有两条对称轴'] },
            { shape: '字母 E', symmetric: true, wrong: ['不是轴对称', '不确定', '有两条对称轴'] },
            { shape: '平行四边形 ◇', symmetric: false, wrong: ['是轴对称', '不确定', '有两条对称轴'] },
            { shape: '等腰三角形 △', symmetric: true, wrong: ['不是轴对称', '不确定', '有三条对称轴'] },
            { shape: '字母 S', symmetric: false, wrong: ['是轴对称', '不确定', '有一条对称轴'] },
            { shape: '圆 ⭕', symmetric: true, wrong: ['不是轴对称', '不确定', '只有一条对称轴'] },
            { shape: '长方形 🟧', symmetric: true, wrong: ['不是轴对称', '不确定', '有四条对称轴'] },
            { shape: '数字 3', symmetric: false, wrong: ['是轴对称', '不确定', '有两条对称轴'] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            var correct = t.symmetric ? '是轴对称图形' : '不是轴对称图形';
            var wrong = t.symmetric ?
                ['不是轴对称图形', '不确定', '只有中心对称'] :
                ['是轴对称图形', '不确定', '有对称轴'];
            qs.push({
                text: t.shape + ' 是轴对称图形吗？',
                answer: correct,
                choices: H.shuffle([correct].concat(wrong)),
                hint: '沿着一条线对折，两边能完全重合就是轴对称'
            });
        }
        return qs;
    }

    /** Phase 2: 对称轴数量 */
    function buildPhase2() {
        var qs = [];
        var templates = [
            { shape: '正方形', axes: 4, wrong: [1, 2, 3] },
            { shape: '等边三角形', axes: 3, wrong: [1, 2, 4] },
            { shape: '长方形（非正方形）', axes: 2, wrong: [1, 3, 4] },
            { shape: '等腰三角形（非等边）', axes: 1, wrong: [2, 3, 0] },
            { shape: '圆', axes: '无数', wrong: [1, 4, 8] },
            { shape: '正五边形', axes: 5, wrong: [1, 3, 10] },
            { shape: '等腰梯形', axes: 1, wrong: [2, 3, 4] },
            { shape: '正六边形', axes: 6, wrong: [1, 3, 12] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: t.shape + ' 有几条对称轴？',
                answer: String(t.axes),
                choices: H.shuffle([String(t.axes)].concat(t.wrong.map(String))),
                hint: '对称轴是能将图形对折重合的直线'
            });
        }
        return qs;
    }

    /** Phase 3: 平移 */
    function buildPhase3() {
        var qs = [];
        var templates = [
            { desc: '一个★在第2行第3列，向右平移3格', answer: '第2行第6列', wrong: ['第2行第5列', '第3行第6列', '第2行第3列'] },
            { desc: '一个●在第1行第2列，向下平移2格', answer: '第3行第2列', wrong: ['第2行第2列', '第1行第4列', '第3行第4列'] },
            { desc: '一个▲在第4行第1列，向右平移4格', answer: '第4行第5列', wrong: ['第4行第4列', '第5行第5列', '第4行第3列'] },
            { desc: '一个■在第3行第5列，向左平移3格', answer: '第3行第2列', wrong: ['第3行第3列', '第2行第2列', '第3行第8列'] },
            { desc: '一个◆在第2行第1列，向下平移3格', answer: '第5行第1列', wrong: ['第4行第1列', '第2行第4列', '第5行第4列'] },
            { desc: '一个♦在第5行第4列，向左平移2格', answer: '第5行第2列', wrong: ['第5行第3列', '第4行第2列', '第5行第6列'] },
            { desc: '一个○在第1行第3列，向右平移2格', answer: '第1行第5列', wrong: ['第1行第4列', '第3行第5列', '第1行第1列'] },
            { desc: '一个□在第3行第6列，向左平移4格', answer: '第3行第2列', wrong: ['第3行第3列', '第2行第2列', '第3行第4列'] }
        ];
        var picked = H.shuffle(templates).slice(0, 4);
        for (var i = 0; i < picked.length; i++) {
            var t = picked[i];
            qs.push({
                text: t.desc + '，现在在哪里？',
                answer: t.answer,
                choices: H.shuffle([t.answer].concat(t.wrong)),
                hint: '平移只改变位置，不改变方向'
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
                '<div class="mo2-wrap">' +
                    '<div class="mo2-header">' +
                        H.guideBarHTML('🪞', '对称与平移——发现图形的运动之美！', 'mo2-guide') +
                    '</div>' +
                    '<div class="mo2-body" id="mo2-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('对称判断没问题！数数有几条对称轴！', 'mo2-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('对称轴也数对了！来试试平移！', 'mo2-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('mo2-body');
            var labels = { 1: '轴对称判断', 2: '对称轴数量', 3: '平移位置' };
            var emojis = { 1: '🦋', 2: '✂️', 3: '➡️' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'mo2-guide');

            body.innerHTML =
                '<div class="mo2-card">' +
                    '<div class="mo2-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="mo2-card-text">' + q.text + '</div>' +
                    '<div class="mo2-card-hint">' + q.hint + '</div>' +
                    '<div class="mo2-card-choices" id="mo2-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'mo2-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('图形运动小达人！✅', 'mo2-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#mo2-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#mo2-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#mo2-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, '你掌握了轴对称和平移的知识！', NEXT_LEVEL);
        }
    };

    function buildCSS() {
        return '' +
            '.mo2-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fff7ed 0%,#fed7aa 40%,#f97316 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.mo2-header{position:relative;z-index:50;}' +
            '.mo2-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:mo2-fadeIn 0.4s ease;}' +
            '@keyframes mo2-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.mo2-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #f97316;display:flex;flex-direction:column;align-items:center;gap:18px;animation:mo2-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes mo2-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.mo2-card-emoji{font-size:50px;}' +
            '.mo2-card-text{font-size:24px;font-weight:bold;color:#c2410c;text-align:center;line-height:1.6;background:#fff7ed;padding:12px 24px;border-radius:16px;border:2px solid #fdba74;}' +
            '.mo2-card-hint{font-size:16px;color:#ea580c;font-style:italic;}' +
            '.mo2-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
