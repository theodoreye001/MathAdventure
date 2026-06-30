/**
 * 四年级下册 第九单元：鸡兔同笼
 * 路径: src/games/grade4/g4_d_u9_chicken_rabbit.js
 *
 * 玩法："鸡兔推理"
 *   Phase 1 "列表尝试法": 用列表法逐步尝试。4轮。
 *   Phase 2 "假设法": 用假设法解鸡兔同笼。4轮。
 *   Phase 3 "生活应用": 鸡兔同笼变式题。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-d-u9-chicken-rabbit-styles';
    const NEXT_LEVEL = null;

    function genChoices(ans) {
        var set = new Set();
        set.add(String(ans));
        while (set.size < 4) {
            var off = H.randInt(-5, 5);
            if (off === 0) off = H.randInt(1, 3);
            var v = ans + off;
            if (v >= 0 && v !== ans) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** 生成鸡兔同笼题目 */
    function genCRProblem(headsMin, headsMax, legsPer1, legsPer2) {
        var heads = H.randInt(headsMin, headsMax);
        var rabbits = H.randInt(1, heads - 1);
        var chickens = heads - rabbits;
        var legs = chickens * legsPer1 + rabbits * legsPer2;
        return { heads: heads, legs: legs, rabbits: rabbits, chickens: chickens };
    }

    /** Phase 1: 列表尝试法 */
    function buildPhase1() {
        var qs = [];
        var used = [];
        for (var i = 0; i < 6; i++) {
            var p = genCRProblem(6, 12, 2, 4);
            var key = p.heads + '_' + p.legs;
            if (used.indexOf(key) !== -1) continue;
            used.push(key);
            qs.push({
                text: '鸡和兔共 ' + p.heads + ' 只，脚共 ' + p.legs + ' 只。兔有多少只？',
                answer: String(p.rabbits),
                choices: genChoices(p.rabbits),
                hint: '列表法：从兔0只开始，逐步增加试试'
            });
            if (qs.length >= 4) break;
        }
        while (qs.length < 4) {
            var p2 = genCRProblem(8, 15, 2, 4);
            qs.push({
                text: '鸡和兔共 ' + p2.heads + ' 只，脚共 ' + p2.legs + ' 只。兔有多少只？',
                answer: String(p2.rabbits),
                choices: genChoices(p2.rabbits),
                hint: '列表法：假设兔0只时脚几只？逐步调整'
            });
        }
        return qs;
    }

    /** Phase 2: 假设法 */
    function buildPhase2() {
        var qs = [];
        var used = [];
        for (var i = 0; i < 6; i++) {
            var p = genCRProblem(10, 25, 2, 4);
            var key = p.heads + '_' + p.legs;
            if (used.indexOf(key) !== -1) continue;
            used.push(key);
            qs.push({
                text: '🐔和🐰共 ' + p.heads + ' 只，脚共 ' + p.legs + ' 只。🐰有多少只？',
                answer: String(p.rabbits),
                choices: genChoices(p.rabbits),
                hint: '假设全是鸡：脚数=' + (p.heads * 2) + '，差' + (p.legs - p.heads * 2) + '只脚'
            });
            if (qs.length >= 4) break;
        }
        while (qs.length < 4) {
            var p2 = genCRProblem(15, 30, 2, 4);
            qs.push({
                text: '🐔和🐰共 ' + p2.heads + ' 只，脚共 ' + p2.legs + ' 只。🐰有多少只？',
                answer: String(p2.rabbits),
                choices: genChoices(p2.rabbits),
                hint: '假设全是鸡，每只比兔少2只脚'
            });
        }
        return qs;
    }

    /** Phase 3: 变式应用 */
    function buildPhase3() {
        var qs = [];

        // 龟鹤问题
        var heads3 = H.randInt(8, 15);
        var cranes = H.randInt(1, heads3 - 1);
        var turtles = heads3 - cranes;
        qs.push({
            text: '🐢和🦩共 ' + heads3 + ' 只，脚共 ' + (cranes * 2 + turtles * 4) + ' 只。🐢有多少只？',
            answer: String(turtles),
            choices: genChoices(turtles),
            hint: '和鸡兔同笼一样：假设全是🦩'
        });

        // 自行车和三轮车
        var vehicles = H.randInt(8, 20);
        var trikes = H.randInt(1, vehicles - 1);
        var bikes = vehicles - trikes;
        qs.push({
            text: '🚲和三轮车共 ' + vehicles + ' 辆，轮子共 ' + (bikes * 2 + trikes * 3) + ' 个。三轮车有几辆？',
            answer: String(trikes),
            choices: genChoices(trikes),
            hint: '假设全是🚲，每个少1个轮子'
        });

        // 大小船
        var boats = H.randInt(6, 12);
        var bigBoats = H.randInt(1, boats - 1);
        var smallBoats = boats - bigBoats;
        var people = bigBoats * 6 + smallBoats * 4;
        qs.push({
            text: '大船坐6人，小船坐4人，共 ' + boats + ' 条船坐了 ' + people + ' 人。大船有几条？',
            answer: String(bigBoats),
            choices: genChoices(bigBoats),
            hint: '假设全是小船，每条少坐2人'
        });

        // 答对答错
        var total = H.randInt(10, 25);
        var wrong = H.randInt(1, total - 1);
        var right = total - wrong;
        var score = right * 5 - wrong * 2;
        qs.push({
            text: '一次测试共 ' + total + ' 题，答对得5分，答错扣2分，小明得了 ' + score + ' 分。答对了几题？',
            answer: String(right),
            choices: genChoices(right),
            hint: '假设全答对得' + (total * 5) + '分，差' + ((total * 5) - score) + '分'
        });

        return H.shuffle(qs).slice(0, 4);
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
                '<div class="crb-wrap">' +
                    '<div class="crb-header">' +
                        H.guideBarHTML('🐔', '鸡兔推理——经典逻辑挑战！', 'crb-guide') +
                    '</div>' +
                    '<div class="crb-body" id="crb-body"></div>' +
                '</div>';
        },

        nextQuestion: function () {
            state.answered = false;
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2; state.qIndex = 0; state.questions = buildPhase2();
                    H.updateGuide('列表法掌握了！试试假设法！', 'crb-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3; state.qIndex = 0; state.questions = buildPhase3();
                    H.updateGuide('假设法也行！挑战变式题！', 'crb-guide');
                    setTimeout(function () { game.nextQuestion(); }, 1200);
                    return;
                } else { this.finishGame(); return; }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('crb-body');
            var labels = { 1: '列表尝试法', 2: '假设法', 3: '生活应用' };
            var emojis = { 1: '📋', 2: '💡', 3: '🌍' };
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + labels[state.phase], 'crb-guide');

            body.innerHTML =
                '<div class="crb-card">' +
                    '<div class="crb-card-emoji">' + emojis[state.phase] + '</div>' +
                    '<div class="crb-card-text">' + q.text + '</div>' +
                    '<div class="crb-card-hint">' + q.hint + '</div>' +
                    '<div class="crb-card-choices" id="crb-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(q.choices, 'crb-choices', function (idx) {
                if (state.answered) return;
                state.answered = true;
                if (q.choices[idx] === q.answer) {
                    H.updateGuide('推理正确！逻辑小天才！✅', 'crb-guide');
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                    var el = document.querySelector('#crb-choices .gh-choice-btn[data-idx="' + idx + '"]');
                    if (el) { el.style.background = '#10b981'; el.style.borderColor = '#10b981'; el.style.color = 'white'; }
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                } else {
                    state.mistakes++;
                    H.triggerError(state.container, '正确答案：' + q.answer, document.querySelector('#crb-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                    if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                    q.choices.forEach(function (c, ci) {
                        if (c === q.answer) {
                            var el2 = document.querySelector('#crb-choices .gh-choice-btn[data-idx="' + ci + '"]');
                            if (el2) { el2.style.background = '#10b981'; el2.style.borderColor = '#10b981'; el2.style.color = 'white'; }
                        }
                    });
                    state.qIndex++;
                    setTimeout(function () { self.nextQuestion(); }, 2000);
                }
            });
        },

        finishGame: function () {
            var nextText = NEXT_LEVEL ? NEXT_LEVEL : null;
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了鸡兔同笼的各种解法！四年级下册全部通关！🎉',
                nextText
            );
        }
    };

    function buildCSS() {
        return '' +
            '.crb-wrap{width:100%;height:100%;position:relative;overflow:hidden;font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#fefce8 0%,#fde68a 40%,#eab308 100%);display:flex;flex-direction:column;user-select:none;}' +
            '.crb-header{position:relative;z-index:50;}' +
            '.crb-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;animation:crb-fadeIn 0.4s ease;}' +
            '@keyframes crb-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +
            '.crb-card{background:white;border-radius:30px;padding:35px 40px 30px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #eab308;display:flex;flex-direction:column;align-items:center;gap:18px;animation:crb-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:580px;width:94%;}' +
            '@keyframes crb-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.crb-card-emoji{font-size:50px;}' +
            '.crb-card-text{font-size:22px;font-weight:bold;color:#a16207;text-align:center;line-height:1.8;background:#fefce8;padding:14px 28px;border-radius:16px;border:2px solid #fde047;}' +
            '.crb-card-hint{font-size:16px;color:#ca8a04;font-style:italic;}' +
            '.crb-card-choices{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;max-width:480px;}';
    }

    window.CurrentGameModule = game;
})();
