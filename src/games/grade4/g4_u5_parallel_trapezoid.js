/**
 * 四年级上册 第五单元：平行四边形和梯形
 * 路径: src/games/grade4/g4_u5_parallel_trapezoid.js
 *
 * 玩法："图形分类"
 *   Phase 1 "平行与垂直": 判断线段关系。4轮。
 *   Phase 2 "图形辨认": 辨认平行四边形、梯形。4轮。
 *   Phase 3 "图形特征": 判断图形属性。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u5-parallel-trapezoid-styles';
    const NEXT_LEVEL = 'lvl_4_6_1';

    /** SVG 绘制平行四边形 */
    function parallelogramSVG(w, h, skew) {
        skew = skew || 30;
        var pad = 20;
        var svgW = w + skew + pad * 2;
        var svgH = h + pad * 2 + 25;
        var pts = [
            (pad + skew) + ',' + pad,
            (pad + skew + w) + ',' + pad,
            (pad + w) + ',' + (pad + h),
            pad + ',' + (pad + h)
        ].join(' ');
        return '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '">' +
            '<polygon points="' + pts + '" fill="rgba(99,102,241,0.15)" stroke="#6366f1" stroke-width="3"/>' +
            '<text x="' + (svgW / 2) + '" y="' + (svgH - 8) + '" text-anchor="middle" font-size="14" font-weight="bold" fill="#6366f1">平行四边形</text>' +
            '</svg>';
    }

    /** SVG 绘制梯形 */
    function trapezoidSVG(top, bottom, h) {
        var pad = 20;
        var skew = (bottom - top) / 2;
        var svgW = bottom + pad * 2;
        var svgH = h + pad * 2 + 25;
        var pts = [
            (pad + skew) + ',' + pad,
            (pad + skew + top) + ',' + pad,
            (pad + bottom) + ',' + (pad + h),
            pad + ',' + (pad + h)
        ].join(' ');
        return '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '">' +
            '<polygon points="' + pts + '" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="3"/>' +
            '<text x="' + (svgW / 2) + '" y="' + (svgH - 8) + '" text-anchor="middle" font-size="14" font-weight="bold" fill="#f59e0b">梯形</text>' +
            '</svg>';
    }

    /** SVG 绘制长方形 */
    function rectSVG(w, h) {
        var pad = 20;
        var svgW = w + pad * 2;
        var svgH = h + pad * 2 + 25;
        return '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '">' +
            '<rect x="' + pad + '" y="' + pad + '" width="' + w + '" height="' + h + '" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="3"/>' +
            '<text x="' + (svgW / 2) + '" y="' + (svgH - 8) + '" text-anchor="middle" font-size="14" font-weight="bold" fill="#10b981">长方形</text>' +
            '</svg>';
    }

    /* ── Phase 1: 平行与垂直 ── */
    function buildPhase1() {
        var qs = [
            { text: '在同一平面内，不相交的两条直线叫做（    ）', answer: '平行线', choices: ['平行线', '垂直线', '相交线', '射线'] },
            { text: '两条直线相交成直角，这两条直线叫做（    ）', answer: '互相垂直', choices: ['互相平行', '互相垂直', '互相交叉', '互相重合'] },
            { text: '正方形有几组对边互相平行？', answer: '2组', choices: ['1组', '2组', '3组', '4组'] },
            { text: '长方形的相邻两条边是什么关系？', answer: '互相垂直', choices: ['互相平行', '互相垂直', '没有关系', '互相交叉'] },
            { text: '过直线外一点，可以画几条直线与已知直线平行？', answer: '1条', choices: ['0条', '1条', '2条', '无数条'] },
            { text: '过直线外一点，可以画几条直线与已知直线垂直？', answer: '1条', choices: ['0条', '1条', '2条', '无数条'] }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 图形辨认 ── */
    function buildPhase2() {
        var qs = [
            { svg: parallelogramSVG(120, 70, 25), text: '这个图形是（    ）', answer: '平行四边形', choices: ['梯形', '平行四边形', '长方形', '三角形'] },
            { svg: trapezoidSVG(60, 120, 70), text: '这个图形是（    ）', answer: '梯形', choices: ['梯形', '平行四边形', '正方形', '五边形'] },
            { svg: rectSVG(120, 70), text: '长方形是特殊的（    ）', answer: '平行四边形', choices: ['梯形', '平行四边形', '三角形', '正方形'] },
            { text: '只有一组对边平行的四边形叫做（    ）', answer: '梯形', choices: ['平行四边形', '梯形', '长方形', '菱形'] },
            { text: '两组对边分别平行的四边形叫做（    ）', answer: '平行四边形', choices: ['梯形', '平行四边形', '三角形', '五边形'] },
            { svg: parallelogramSVG(120, 70, 0), text: '这个图形是特殊的（    ）', answer: '长方形', choices: ['梯形', '平行四边形', '长方形', '菱形'] }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 图形特征 ── */
    function buildPhase3() {
        var qs = [
            { text: '平行四边形有几组对边？', answer: '2组', choices: ['1组', '2组', '3组', '4组'] },
            { text: '平行四边形的对角有什么特点？', answer: '相等', choices: ['相等', '互补', '垂直', '没有关系'] },
            { text: '梯形有几组对边平行？', answer: '1组', choices: ['0组', '1组', '2组', '3组'] },
            { text: '正方形是不是平行四边形？', answer: '是', choices: ['是', '不是', '有时是', '无法确定'] },
            { text: '平行四边形容易变形的特性叫做（    ）', answer: '不稳定性', choices: ['稳定性', '不稳定性', '对称性', '平行性'] },
            { text: '等腰梯形的两条腰有什么特点？', answer: '长度相等', choices: ['长度相等', '互相平行', '互相垂直', '没有关系'] }
        ];
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
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
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="ptz-wrap">' +
                    '<div class="ptz-header">' +
                        H.guideBarHTML('🔷', '图形分类——认识平行四边形和梯形！', 'ptz-guide') +
                    '</div>' +
                    '<div class="ptz-body" id="ptz-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildPhase1();
            this.nextQuestion();
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('平行与垂直搞清楚了！来辨认图形！', 'ptz-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('图形辨认不错！最后挑战特征知识！', 'ptz-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('ptz-body');
            var phaseLabels = { 1: '平行与垂直', 2: '图形辨认', 3: '图形特征' };
            var phaseEmojis = { 1: '📏', 2: '🔷', 3: '🧠' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'ptz-guide');

            var svgHTML = q.svg ? '<div class="ptz-svg-box">' + q.svg + '</div>' : '';

            body.innerHTML =
                '<div class="ptz-card">' +
                    '<div class="ptz-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    svgHTML +
                    '<div class="ptz-card-text">' + q.text + '</div>' +
                    '<div class="ptz-card-choices" id="ptz-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'ptz-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('图形知识掌握得好！✅', 'ptz-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#ptz-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer,
                            document.querySelector('#ptz-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#ptz-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (el2) {
                                    el2.style.background = '#10b981';
                                    el2.style.borderColor = '#10b981';
                                    el2.style.color = 'white';
                                }
                            }
                        });
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2000);
                    }
                }
            );
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了平行四边形和梯形的特征！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.ptz-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fce7f3 0%,#fbcfe8 40%,#f472b6 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.ptz-header{position:relative;z-index:50;}' +
            '.ptz-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:ptz-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes ptz-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.ptz-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #ec4899;' +
                'display:flex;flex-direction:column;align-items:center;gap:16px;' +
                'animation:ptz-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:520px;width:92%;' +
            '}' +
            '@keyframes ptz-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.ptz-card-emoji{font-size:46px;}' +

            '.ptz-svg-box{' +
                'background:#fdf2f8;border-radius:16px;padding:12px;' +
                'border:2px solid #fbcfe8;display:flex;justify-content:center;' +
            '}' +

            '.ptz-card-text{' +
                'font-size:21px;font-weight:bold;color:#9d174d;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.ptz-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
