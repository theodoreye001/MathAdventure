/**
 * 四年级上册 第三单元：角的度量
 * 路径: src/games/grade4/g4_u3_angle_measure.js
 *
 * 玩法："角度射击"
 *   Phase 1 "角的分类": 判断锐角、直角、钝角、平角。4轮。
 *   Phase 2 "量角挑战": 根据量角器读数选择角度。4轮。
 *   Phase 3 "画角选择": 根据角度选择正确的描述。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u3-angle-measure-styles';
    const NEXT_LEVEL = 'lvl_4_4_1';

    /** 角度分类 */
    function classifyAngle(deg) {
        if (deg > 0 && deg < 90) return '锐角';
        if (deg === 90) return '直角';
        if (deg > 90 && deg < 180) return '钝角';
        if (deg === 180) return '平角';
        if (deg > 180 && deg < 360) return '优角';
        return '周角';
    }

    /** 生成 SVG 角度图 */
    function angleSVG(deg, size) {
        size = size || 120;
        var cx = size / 2, cy = size / 2;
        var r = size * 0.38;
        var lineLen = size * 0.42;

        var rad1 = 0;
        var rad2 = -deg * Math.PI / 180;

        var x1 = cx + lineLen * Math.cos(rad1);
        var y1 = cy - lineLen * Math.sin(rad1);
        var x2 = cx + lineLen * Math.cos(rad2);
        var y2 = cy - lineLen * Math.sin(rad2);

        // 弧线
        var arcR = r * 0.5;
        var largeArc = deg > 180 ? 1 : 0;
        var ax1 = cx + arcR * Math.cos(rad1);
        var ay1 = cy - arcR * Math.sin(rad1);
        var ax2 = cx + arcR * Math.cos(rad2);
        var ay2 = cy - arcR * Math.sin(rad2);

        var arcPath = 'M ' + ax1 + ' ' + ay1 + ' A ' + arcR + ' ' + arcR + ' 0 ' + largeArc + ' 0 ' + ax2 + ' ' + ay2;

        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>' +
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#6366f1"/>' +
            '<path d="' + arcPath + '" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3"/>' +
            '</svg>';
    }

    /* ── Phase 1: 角的分类 ── */
    function buildPhase1() {
        var qs = [];
        var angles = [
            { deg: H.randInt(10, 89) },
            { deg: 90 },
            { deg: H.randInt(91, 179) },
            { deg: 180 },
            { deg: H.randInt(20, 60) },
            { deg: H.randInt(100, 170) }
        ];
        angles = H.shuffle(angles);
        for (var i = 0; i < 4; i++) {
            var a = angles[i];
            qs.push({
                deg: a.deg,
                text: a.deg + '°的角是（    ）',
                answer: classifyAngle(a.deg),
                choices: H.shuffle(['锐角', '直角', '钝角', '平角'])
            });
        }
        return qs;
    }

    /* ── Phase 2: 读量角器 ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var deg = H.randInt(15, 175);
            // 确保角度不是5的倍数太整齐
            if (deg % 10 === 0) deg += H.randInt(1, 4);
            if (deg > 175) deg = 170;
            qs.push({
                deg: deg,
                text: '量角器上显示的角是（    ）度',
                answer: String(deg),
                choices: genAngleChoices(deg)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function genAngleChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-8, 8);
            if (off === 0) off = 5;
            var v = correct + off;
            if (v > 0 && v <= 180 && v !== correct) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 角度描述 ── */
    function buildPhase3() {
        var qs = [
            { text: '一个角是锐角，它（    ）小于90度', answer: '一定', choices: ['一定', '不一定', '可能', '不会'] },
            { text: '直角是（    ）度', answer: '90', choices: ['90', '180', '45', '100'] },
            { text: '平角是（    ）度', answer: '180', choices: ['180', '90', '360', '270'] },
            { text: '钝角比直角（    ）', answer: '大', choices: ['大', '小', '一样', '无法比较'] },
            { text: '一副三角板最大的角是（    ）度', answer: '90', choices: ['90', '60', '45', '120'] },
            { text: '把一个平角分成两个角，这两个角一定是（    ）', answer: '两个锐角或一个直角', choices: ['两个锐角或一个直角', '两个钝角', '两个直角', '一个锐角一个钝角'] }
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
                '<div class="ang4-wrap">' +
                    '<div class="ang4-header">' +
                        H.guideBarHTML('🎯', '角度射击——认识和度量角！', 'ang4-guide') +
                    '</div>' +
                    '<div class="ang4-body" id="ang4-body"></div>' +
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
                    H.updateGuide('分类没问题！来读量角器！', 'ang4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('量角器用得好！最后一关！', 'ang4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('ang4-body');
            var phaseLabels = { 1: '角的分类', 2: '量角器读数', 3: '角度知识' };
            var phaseEmojis = { 1: '📐', 2: '📏', 3: '🧠' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'ang4-guide');

            var svgHTML = '';
            if (q.deg !== undefined) {
                svgHTML = '<div class="ang4-svg-box">' + angleSVG(q.deg, 140) + '</div>';
            }

            body.innerHTML =
                '<div class="ang4-card">' +
                    '<div class="ang4-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    svgHTML +
                    '<div class="ang4-card-text">' + q.text + '</div>' +
                    '<div class="ang4-card-choices" id="ang4-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'ang4-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('角度答对了！百发百中！✅', 'ang4-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#ang4-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#ang4-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#ang4-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了角的分类和度量！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.ang4-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#fef3c7 0%,#fde68a 40%,#fbbf24 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.ang4-header{position:relative;z-index:50;}' +
            '.ang4-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:ang4-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes ang4-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.ang4-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #f59e0b;' +
                'display:flex;flex-direction:column;align-items:center;gap:16px;' +
                'animation:ang4-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:520px;width:92%;' +
            '}' +
            '@keyframes ang4-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.ang4-card-emoji{font-size:46px;}' +

            '.ang4-svg-box{' +
                'background:#fffbeb;border-radius:16px;padding:10px;' +
                'border:2px solid #fde68a;display:flex;justify-content:center;' +
            '}' +

            '.ang4-card-text{' +
                'font-size:22px;font-weight:bold;color:#92400e;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.ang4-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:440px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
