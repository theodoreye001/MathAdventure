/**
 * 五年级下册 第三单元：长方体和正方体
 * 路径: src/games/grade5/g5_d_u3_cuboid.js
 *
 * 玩法："体积灌溉"
 *   Phase 1 "表面积计算": 根据长方体/正方体的尺寸计算表面积。含无盖水箱变体。4题。
 *   Phase 2 "体积计算": 根据尺寸计算体积，含单位换算(cm³↔mL, m³↔L)。4题。
 *   Phase 3 "综合应用": 表面积与体积综合应用题。4题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u3-cuboid-styles';
    const NEXT_LEVEL = 'lvl_5_d_4';

    /* ── 数值工具 ── */

    /** 格式化整数/小数，去掉末尾多余的零 */
    function fmt(n) {
        var s = String(n);
        if (s.indexOf('.') !== -1) {
            s = s.replace(/\.?0+$/, '');
        }
        return s;
    }

    /** 生成选项：1个正确 + 3个干扰，返回字符串数组 */
    function genChoices(correct) {
        var set = new Set();
        var cStr = String(correct);
        set.add(cStr);
        var cNum = parseFloat(correct);
        var tries = 0;
        while (set.size < 4 && tries < 60) {
            tries++;
            var off = H.randInt(1, Math.max(2, Math.round(Math.abs(cNum) * 0.4) + 1));
            if (H.randInt(0, 1) === 0) off = -off;
            var v = cNum + off;
            if (v > 0 && fmt(v) !== cStr) set.add(fmt(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** 表面积：长方体 S = 2(lw + lh + wh) */
    function surfaceArea(l, w, h) {
        return 2 * (l * w + l * h + w * h);
    }

    /** 表面积：无盖长方体 S = lw + 2(lh + wh) */
    function surfaceAreaOpenTop(l, w, h) {
        return l * w + 2 * (l * h + w * h);
    }

    /** 表面积：正方体 S = 6a² */
    function surfaceAreaCube(a) {
        return 6 * a * a;
    }

    /** 体积：长方体 V = lwh */
    function volume(l, w, h) {
        return l * w * h;
    }

    /** 体积：正方体 V = a³ */
    function volumeCube(a) {
        return a * a * a;
    }

    /* ── Phase 1: 表面积计算 ── */
    function buildPhase1() {
        var qs = [];
        var tries = 0;

        // Q1: 长方体表面积
        while (tries < 20) {
            tries++;
            var l = H.randInt(3, 10), w = H.randInt(2, 8), h = H.randInt(2, 8);
            var ans = surfaceArea(l, w, h);
            if (ans > 0 && ans < 1000) {
                qs.push({
                    text: '长方体长 ' + l + 'cm、宽 ' + w + 'cm、高 ' + h + 'cm，表面积是多少cm²？',
                    answer: String(ans),
                    choices: genChoices(ans),
                    hint: '长方体表面积 = 2×(长×宽 + 长×高 + 宽×高)'
                });
                break;
            }
        }

        // Q2: 正方体表面积
        tries = 0;
        while (tries < 20) {
            tries++;
            var a = H.randInt(2, 8);
            var ans2 = surfaceAreaCube(a);
            if (ans2 > 0 && ans2 < 600) {
                qs.push({
                    text: '正方体棱长 ' + a + 'cm，表面积是多少cm²？',
                    answer: String(ans2),
                    choices: genChoices(ans2),
                    hint: '正方体表面积 = 6 × 棱长 × 棱长'
                });
                break;
            }
        }

        // Q3: 无盖水箱（长方体无盖）
        tries = 0;
        while (tries < 20) {
            tries++;
            var tl = H.randInt(3, 8), tw = H.randInt(3, 8), th = H.randInt(3, 8);
            var ans3 = surfaceAreaOpenTop(tl, tw, th);
            if (ans3 > 0 && ans3 < 600) {
                qs.push({
                    text: '一个无盖水箱，长 ' + tl + 'cm、宽 ' + tw + 'cm、高 ' + th + 'cm，做这个水箱需要多少cm²的铁皮？',
                    answer: String(ans3),
                    choices: genChoices(ans3),
                    hint: '无盖 = 底面 + 四个侧面 = 长×宽 + 2×(长×高 + 宽×高)'
                });
                break;
            }
        }

        // Q4: 长方体表面积（另一组数据）
        tries = 0;
        while (tries < 20) {
            tries++;
            var l4 = H.randInt(4, 10), w4 = H.randInt(3, 7), h4 = H.randInt(3, 7);
            var ans4 = surfaceArea(l4, w4, h4);
            if (ans4 > 0 && ans4 < 1000 && ans4 !== ans) {
                qs.push({
                    text: '一个长方体纸箱，长 ' + l4 + 'cm、宽 ' + w4 + 'cm、高 ' + h4 + 'cm，它的表面积是？',
                    answer: String(ans4),
                    choices: genChoices(ans4),
                    hint: '先算三对面的面积，再相加×2'
                });
                break;
            }
        }

        return qs;
    }

    /* ── Phase 2: 体积计算 ── */
    function buildPhase2() {
        var qs = [];

        // Q1: 长方体体积
        var l1 = H.randInt(3, 10), w1 = H.randInt(2, 8), h1 = H.randInt(2, 6);
        var v1 = volume(l1, w1, h1);
        qs.push({
            text: '长方体长 ' + l1 + 'cm、宽 ' + w1 + 'cm、高 ' + h1 + 'cm，体积是多少cm³？',
            answer: String(v1),
            choices: genChoices(v1),
            hint: '长方体体积 = 长 × 宽 × 高'
        });

        // Q2: 正方体体积
        var a2 = H.randInt(2, 8);
        var v2 = volumeCube(a2);
        qs.push({
            text: '正方体棱长 ' + a2 + 'cm，体积是多少cm³？',
            answer: String(v2),
            choices: genChoices(v2),
            hint: '正方体体积 = 棱长 × 棱长 × 棱长'
        });

        // Q3: cm³ → mL 换算 (1cm³ = 1mL)
        var l3 = H.randInt(3, 8), w3 = H.randInt(2, 6), h3 = H.randInt(2, 6);
        var v3 = volume(l3, w3, h3);
        qs.push({
            text: '一个长方体容器长 ' + l3 + 'cm、宽 ' + w3 + 'cm、高 ' + h3 + 'cm，它的容积是多少mL？',
            answer: fmt(v3) + 'mL',
            choices: genChoicesVolume(v3, 'mL'),
            hint: '1cm³ = 1mL，容积就是体积的数值'
        });

        // Q4: m³ → L 换算 (1m³ = 1000L)
        var l4 = H.randInt(2, 5), w4 = H.randInt(2, 4), h4 = H.randInt(2, 4);
        var v4 = volume(l4, w4, h4);
        var v4liters = v4 * 1000;
        qs.push({
            text: '一个水池长 ' + l4 + 'm、宽 ' + w4 + 'm、深 ' + h4 + 'm，能装水多少升(L)？',
            answer: fmt(v4liters) + 'L',
            choices: genChoicesVolume(v4liters, 'L'),
            hint: '1m³ = 1000L，先算体积(m³)再换算'
        });

        return qs;
    }

    /** 生成带单位的体积选项 */
    function genChoicesVolume(correctNum, unit) {
        var set = new Set();
        set.add(fmt(correctNum) + unit);
        var tries = 0;
        while (set.size < 4 && tries < 60) {
            tries++;
            var off = H.randInt(1, Math.max(2, Math.round(correctNum * 0.35) + 1));
            if (H.randInt(0, 1) === 0) off = -off;
            var v = correctNum + off;
            // 常见错误：忘乘1000、多除10等
            if (tries <= 15) {
                // 干扰：忘换算，直接用m³数值
                v = correctNum / 1000 + H.randInt(0, 1);
            } else if (tries <= 30) {
                // 干扰：乘了100而不是1000
                v = correctNum / 10 + H.randInt(-1, 1);
            }
            var str = fmt(v) + unit;
            if (v > 0 && str !== fmt(correctNum) + unit) set.add(str);
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 综合应用 ── */
    function buildPhase3() {
        var qs = [];
        var usedTexts = {};

        /** 去重辅助 */
        function addQ(q) {
            if (usedTexts[q.text]) return false;
            usedTexts[q.text] = true;
            qs.push(q);
            return true;
        }

        // Q1: 装纸箱问题 — 需要多少纸板(表面积)
        for (var t = 0; t < 30 && qs.length < 1; t++) {
            var bl = H.randInt(4, 10), bw = H.randInt(3, 8), bh = H.randInt(3, 8);
            var bsa = surfaceArea(bl, bw, bh);
            addQ({
                text: '📦 要制作一个长' + bl + 'cm、宽' + bw + 'cm、高' + bh + 'cm的纸箱，至少需要多少cm²的纸板？',
                answer: String(bsa),
                choices: genChoices(bsa),
                hint: '纸箱有6个面，用长方体表面积公式'
            });
        }

        // Q2: 粉刷教室墙壁 — 4面墙 + 天花板，不含地面和门窗
        for (var t2 = 0; t2 < 30 && qs.length < 2; t2++) {
            var rl = H.randInt(5, 10), rw = H.randInt(4, 8), rh = H.randInt(3, 4);
            // 4面墙 = 2(rl+rw)*rh，天花板 = rl*rw
            var paintArea = 2 * (rl + rw) * rh + rl * rw;
            if (paintArea < 500) {
                addQ({
                    text: '🏫 教室长' + rl + 'm、宽' + rw + 'm、高' + rh + 'm，粉刷四面墙壁和天花板（不刷地面），粉刷面积是多少m²？',
                    answer: String(paintArea),
                    choices: genChoices(paintArea),
                    hint: '4面墙 = 2×(长+宽)×高，天花板 = 长×宽，合计相加'
                });
            }
        }

        // Q3: 水箱装水 — 体积+容积概念
        for (var t3 = 0; t3 < 30 && qs.length < 3; t3++) {
            var wl = H.randInt(3, 8), ww = H.randInt(2, 6), wh = H.randInt(2, 5);
            var wv = volume(wl, ww, wh);
            if (wv >= 12 && wv <= 300) {
                addQ({
                    text: '💧 一个水箱内壁长' + wl + 'dm、宽' + ww + 'dm、高' + wh + 'dm，这个水箱能装水多少升(L)？',
                    answer: fmt(wv) + 'L',
                    choices: genChoicesVolume(wv, 'L'),
                    hint: '1dm³ = 1L，体积(立方分米)数值 = 容积(升)'
                });
            }
        }

        // Q4: 两个正方体拼成长方体 — 表面积变化
        for (var t4 = 0; t4 < 30 && qs.length < 4; t4++) {
            var sa = H.randInt(2, 6);
            var newL = sa * 2, newW = sa, newH = sa;
            var newSA = surfaceArea(newL, newW, newH);
            var origSA = 2 * surfaceAreaCube(sa); // 两个独立正方体的表面积总和
            var diff = origSA - newSA;
            if (diff > 0 && newSA < 600) {
                addQ({
                    text: '🧊 两个棱长' + sa + 'cm的正方体拼成一个长方体，拼后表面积减少了' + diff + 'cm²，拼成的长方体表面积是多少cm²？',
                    answer: String(newSA),
                    choices: genChoices(newSA),
                    hint: '两个正方体拼在一起，减少2个面；拼后长=' + sa + '×2=' + newL + 'cm'
                });
            }
        }

        // 补充题：如果不够4题，用备选
        if (qs.length < 4) {
            // 备选1: 计算长方体体积的实际问题
            for (var t5 = 0; t5 < 30 && qs.length < 4; t5++) {
                var fl = H.randInt(3, 8), fw = H.randInt(3, 6), fh = H.randInt(2, 5);
                var fv = volume(fl, fw, fh);
                addQ({
                    text: '🏗️ 一个长方体游泳池长' + fl + 'm、宽' + fw + 'm、深' + fh + 'm，最多能蓄水多少m³？',
                    answer: String(fv),
                    choices: genChoices(fv),
                    hint: '蓄水量 = 长 × 宽 × 深'
                });
            }
        }

        return qs;
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
                '<div class="cub-wrap">' +
                    '<div class="cub-header">' +
                        H.guideBarHTML('🌊', '体积灌溉——表面积与体积大挑战！', 'cub-guide') +
                    '</div>' +
                    '<div class="cub-body" id="cub-body"></div>' +
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
                    H.updateGuide('表面积过关！进入体积计算！', 'cub-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('体积也没问题！综合应用挑战！', 'cub-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('cub-body');
            var phaseLabels = { 1: '表面积计算', 2: '体积计算', 3: '综合应用' };
            var phaseEmojis = { 1: '📐', 2: '📏', 3: '🎯' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'cub-guide');

            body.innerHTML =
                '<div class="cub-card">' +
                    '<div class="cub-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="cub-card-text">' + q.text + '</div>' +
                    '<div class="cub-card-hint">' + q.hint + '</div>' +
                    '<div class="cub-card-choices" id="cub-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'cub-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！灌溉高手！✅', 'cub-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#cub-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#cub-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#cub-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了长方体和正方体的表面积、体积公式和单位换算！',
                NEXT_LEVEL
            );
        }
    };

    /* ── 样式 ── */
    function buildCSS() {
        return '' +
            '.cub-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0f2fe 0%,#7dd3fc 40%,#0284c7 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.cub-header{position:relative;z-index:50;}' +
            '.cub-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:cub-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes cub-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.cub-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #0ea5e9;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:cub-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:580px;width:92%;' +
            '}' +
            '@keyframes cub-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.cub-card-emoji{font-size:50px;}' +
            '.cub-card-text{' +
                'font-size:24px;font-weight:bold;color:#0c4a6e;' +
                'text-align:center;line-height:1.7;' +
                'background:#f0f9ff;padding:14px 28px;border-radius:16px;' +
                'border:2px solid #7dd3fc;' +
            '}' +
            '.cub-card-hint{' +
                'font-size:15px;color:#0284c7;font-style:italic;' +
            '}' +
            '.cub-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:500px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
