/**
 * 六年级上册 第二单元：位置与方向（二）
 * 路径: src/games/grade6/g6_u2_direction2.js
 *
 * 玩法："方向导航"
 *   Phase 1 "确定位置": 根据方向和距离确定物体位置。4轮。
 *   Phase 2 "描述路线": 描述行走路线的方向和距离。4轮。
 *   Phase 3 "综合导航": 根据多步指令判断最终位置。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g6-u2-direction2-styles';
    const NEXT_LEVEL = 'lvl_6_3_1';

    /* ── 方向数据 ── */
    var DIRECTIONS = [
        { name: '北', angle: 0, dx: 0, dy: -1 },
        { name: '东北', angle: 45, dx: 1, dy: -1 },
        { name: '东', angle: 90, dx: 1, dy: 0 },
        { name: '东南', angle: 135, dx: 1, dy: 1 },
        { name: '南', angle: 180, dx: 0, dy: 1 },
        { name: '西南', angle: 225, dx: -1, dy: 1 },
        { name: '西', angle: 270, dx: -1, dy: 0 },
        { name: '西北', angle: 315, dx: -1, dy: -1 }
    ];

    var COMPASS_ARROWS = {
        '北': '⬆️', '东北': '↗️', '东': '➡️', '东南': '↘️',
        '南': '⬇️', '西南': '↙️', '西': '⬅️', '西北': '↖️'
    };

    var PLACES = ['学校🏫', '公园🌳', '图书馆📚', '超市🛒', '医院🏥', '邮局📮', '银行🏦', '餐厅🍜'];

    function pickPlace() { return PLACES[H.randInt(0, PLACES.length - 1)]; }
    function pickDir() { return DIRECTIONS[H.randInt(0, DIRECTIONS.length - 1)]; }

    /* ── Phase 1: 确定位置 ── */

    function genPositionQ() {
        var dir = pickDir();
        var dist = H.randInt(2, 15) * 100;
        var place = pickPlace();

        // 从A出发，向某方向走某距离到B
        var start = pickPlace();
        while (start === place) { start = pickPlace(); }

        var text = '从' + start + '出发，向' + dir.name + '方向走' + dist + '米到达' + place;
        text += '\n' + COMPASS_ARROWS[dir.name] + ' ' + dir.name + ' ' + dist + 'm → ' + place;
        var question = '正确描述是？';

        var correctAnswer = '向' + dir.name + '方向走' + dist + '米';
        var choices = genPositionChoices(dir, dist, correctAnswer);
        return {
            text: question + '\n（' + text + '）',
            answer: correctAnswer,
            answerText: correctAnswer,
            choices: choices,
            hint: '确定位置需要方向和距离两个条件'
        };
    }

    function genPositionChoices(dir, dist, correct) {
        var set = new Set();
        set.add(correct);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                // 反方向
                var oppIdx = (DIRECTIONS.indexOf(dir) + 4) % 8;
                fake = '向' + DIRECTIONS[oppIdx].name + '方向走' + dist + '米';
            } else if (type === 1) {
                // 错误距离
                var wrongDist = dist + H.randInt(-5, 5) * 100;
                if (wrongDist <= 0) wrongDist = dist + 200;
                fake = '向' + dir.name + '方向走' + wrongDist + '米';
            } else {
                // 只有方向没有距离
                fake = '向' + dir.name + '方向走';
            }
            if (fake !== correct) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            var rDir = pickDir();
            var rDist = H.randInt(2, 15) * 100;
            fake = '向' + rDir.name + '方向走' + rDist + '米';
            if (fake !== correct) set.add(fake);
            fb++;
            if (fb > 30) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 描述路线 ── */

    function genRouteQ() {
        var steps = H.randInt(2, 3);
        var route = [];
        var curDir, curDist;
        for (var i = 0; i < steps; i++) {
            curDir = pickDir();
            curDist = H.randInt(1, 8) * 100;
            route.push({ dir: curDir.name, dist: curDist, arrow: COMPASS_ARROWS[curDir.name] });
        }

        var start = pickPlace();
        var end = pickPlace();
        while (end === start) { end = pickPlace(); }

        var routeDesc = route.map(function (s) {
            return s.arrow + '向' + s.dir + '走' + s.dist + '米';
        }).join('，再');

        var correctAnswer = route.map(function (s) {
            return '向' + s.dir + '方向走' + s.dist + '米';
        }).join('，再');

        var text = '从小明家出发到' + end + '：' + routeDesc;
        var question = '路线描述正确的是？';

        var choices = genRouteChoices(route, correctAnswer);
        return {
            text: question + '\n（' + text + '）',
            answer: correctAnswer,
            answerText: correctAnswer,
            choices: choices,
            hint: '描述路线要按顺序说出每一步的方向和距离'
        };
    }

    function genRouteChoices(route, correct) {
        var set = new Set();
        set.add(correct);
        var tries = 0;
        while (set.size < 4 && tries < 40) {
            tries++;
            var type = H.randInt(0, 2);
            var fake;
            if (type === 0) {
                // 交换两步顺序
                if (route.length >= 2) {
                    var swapped = route.map(function (s) { return s; });
                    var tmp = swapped[0]; swapped[0] = swapped[1]; swapped[1] = tmp;
                    fake = swapped.map(function (s) {
                        return '向' + s.dir + '方向走' + s.dist + '米';
                    }).join('，再');
                }
            } else if (type === 1) {
                // 某步方向反了
                var wrongRoute = route.map(function (s, idx) {
                    if (idx === 0) {
                        var oppIdx = (DIRECTIONS.findIndex(function (d) { return d.name === s.dir; }) + 4) % 8;
                        return '向' + DIRECTIONS[oppIdx].name + '方向走' + s.dist + '米';
                    }
                    return '向' + s.dir + '方向走' + s.dist + '米';
                });
                fake = wrongRoute.join('，再');
            } else {
                // 距离错误
                var badRoute = route.map(function (s, idx) {
                    if (idx === 0) {
                        return '向' + s.dir + '方向走' + (s.dist + 200) + '米';
                    }
                    return '向' + s.dir + '方向走' + s.dist + '米';
                });
                fake = badRoute.join('，再');
            }
            if (fake && fake !== correct) set.add(fake);
        }
        var fb = 1;
        while (set.size < 4) {
            var rDir = pickDir(), rDist = H.randInt(1, 8) * 100;
            var rDir2 = pickDir(), rDist2 = H.randInt(1, 8) * 100;
            fake = '向' + rDir.name + '方向走' + rDist + '米，再向' + rDir2.name + '方向走' + rDist2 + '米';
            if (fake !== correct) set.add(fake);
            fb++;
            if (fb > 30) break;
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 3: 综合导航 ── */

    function genNavQ() {
        var dx = 0, dy = 0;
        var steps = [];
        var stepCount = H.randInt(2, 3);

        for (var i = 0; i < stepCount; i++) {
            var dir = pickDir();
            var dist = H.randInt(1, 3);
            dx += dir.dx * dist;
            dy += dir.dy * dist;
            steps.push({ dir: dir.name, dist: dist });
        }

        // 确定最终方向
        var finalDir;
        if (dx === 0 && dy < 0) finalDir = '北';
        else if (dx === 0 && dy > 0) finalDir = '南';
        else if (dx > 0 && dy === 0) finalDir = '东';
        else if (dx < 0 && dy === 0) finalDir = '西';
        else if (dx > 0 && dy < 0) finalDir = '东北';
        else if (dx > 0 && dy > 0) finalDir = '东南';
        else if (dx < 0 && dy < 0) finalDir = '西北';
        else finalDir = '西南';

        var stepsDesc = steps.map(function (s) {
            return '向' + s.dir + '走' + s.dist + '格';
        }).join('，再');

        var question = '小明从起点出发：' + stepsDesc + '。\n最终在起点的哪个方向？';

        var choices = genNavChoices(finalDir);
        return {
            text: question,
            answer: finalDir,
            answerText: finalDir,
            choices: choices,
            hint: '可以画图分析：把每步分解为东西和南北方向'
        };
    }

    function genNavChoices(correctDir) {
        var set = new Set();
        set.add(correctDir);
        var allDirs = ['北', '南', '东', '西', '东北', '东南', '西北', '西南'];
        var tries = 0;
        while (set.size < 4 && tries < 20) {
            tries++;
            var pick = allDirs[H.randInt(0, allDirs.length - 1)];
            if (pick !== correctDir) set.add(pick);
        }
        return H.shuffle(Array.from(set));
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
                '<div class="dr2-wrap">' +
                    '<div class="dr2-header">' +
                        H.guideBarHTML('🧭', '方向导航——找准方向出发！', 'dr2-guide') +
                    '</div>' +
                    '<div class="dr2-body" id="dr2-body"></div>' +
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
                    H.updateGuide('位置确定没问题！挑战路线描述！', 'dr2-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('路线描述棒棒哒！挑战综合导航！', 'dr2-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('dr2-body');
            var phaseLabels = { 1: '确定位置', 2: '描述路线', 3: '综合导航' };
            var phaseEmojis = { 1: '📍', 2: '🗺️', 3: '🧭' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'dr2-guide');

            body.innerHTML =
                '<div class="dr2-card">' +
                    '<div class="dr2-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    '<div class="dr2-card-num">' + q.text + '</div>' +
                    '<div class="dr2-card-hint">' + q.hint + '</div>' +
                    '<div class="dr2-card-choices" id="dr2-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'dr2-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('导航成功！方向感满分！', 'dr2-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#dr2-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#dr2-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#dr2-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了确定位置、描述路线和综合导航！',
                NEXT_LEVEL
            );
        }
    };

    function buildPhase1() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genPositionQ();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildPhase2() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genRouteQ();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildPhase3() {
        var qs = []; var seen = {}; var tries = 0;
        while (qs.length < 4 && tries < 50) {
            tries++;
            var q = genNavQ();
            if (!seen[q.text]) { seen[q.text] = true; qs.push(q); }
        }
        return qs;
    }

    function buildCSS() {
        return '' +
            '.dr2-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#e0f2fe 0%,#7dd3fc 40%,#0284c7 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.dr2-header{position:relative;z-index:50;}' +
            '.dr2-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:dr2-fadeIn 0.4s ease;}' +
            '@keyframes dr2-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.dr2-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #0ea5e9;display:flex;flex-direction:column;align-items:center;gap:18px;animation:dr2-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:560px;width:92%;}' +
            '@keyframes dr2-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.dr2-card-emoji{font-size:50px;}' +
            '.dr2-card-num{font-size:22px;font-weight:bold;color:#0c4a6e;text-align:center;line-height:1.8;background:#e0f2fe;padding:14px 28px;border-radius:16px;border:2px solid #7dd3fc;white-space:pre-line;}' +
            '.dr2-card-hint{font-size:16px;color:#0369a1;font-style:italic;}' +
            '.dr2-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
