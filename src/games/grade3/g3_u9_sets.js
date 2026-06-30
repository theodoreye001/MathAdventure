/**
 * 三年级上册 第九单元：集合（重叠问题）
 * 路径: src/games/grade3/g3_u9_sets.js
 *
 * 玩法："重叠问题"
 *   Phase 1 "求总数": 两个有重叠的集合，已知各自人数和重叠人数，求总人数。4轮。
 *   Phase 2 "求重叠": 已知两组总人数和各自人数，求重叠部分人数。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g3-u9-sets-styles';

    /* ── Phase 1: 求总数 ── */
    function buildPhase1() {
        var qs = [];
        var topics = [
            ['喜欢篮球', '喜欢足球'], ['会弹钢琴', '会拉小提琴'],
            ['喜欢吃苹果', '喜欢吃香蕉'], ['养了猫', '养了狗'],
            ['参加了美术组', '参加了音乐组'], ['喜欢语文', '喜欢数学']
        ];
        var names = H.shuffle(topics);
        for (var i = 0; i < 6; i++) {
            var t = names[i];
            var overlap = H.randInt(2, 8);
            var onlyA = H.randInt(3, 12);
            var onlyB = H.randInt(3, 12);
            var total = onlyA + onlyB + overlap;
            qs.push({
                groupA: t[0],
                groupB: t[1],
                countA: onlyA + overlap,
                countB: onlyB + overlap,
                overlap: overlap,
                onlyA: onlyA,
                onlyB: onlyB,
                answer: String(total),
                question: t[0] + '的有 ' + (onlyA + overlap) + ' 人，' + t[1] + '的有 ' + (onlyB + overlap) + ' 人，两样都喜欢的有 ' + overlap + ' 人。一共有多少人？',
                choices: generateChoices(total, 5, 35)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 求重叠 ── */
    function buildPhase2() {
        var qs = [];
        var topics = [
            ['喜欢红色', '喜欢蓝色'], ['会骑自行车', '会游泳'],
            ['戴眼镜', '戴帽子'], ['有铅笔', '有橡皮'],
            ['喜欢跑步', '喜欢跳绳'], ['家里有花', '家里有鱼']
        ];
        var names = H.shuffle(topics);
        for (var i = 0; i < 6; i++) {
            var t = names[i];
            var overlap = H.randInt(3, 10);
            var onlyA = H.randInt(5, 15);
            var onlyB = H.randInt(5, 15);
            var countA = onlyA + overlap;
            var countB = onlyB + overlap;
            var total = countA + countB - overlap;
            qs.push({
                groupA: t[0],
                groupB: t[1],
                countA: countA,
                countB: countB,
                overlap: overlap,
                total: total,
                question: t[0] + '的有 ' + countA + ' 人，' + t[1] + '的有 ' + countB + ' 人，一共有 ' + total + ' 人。两样都喜欢的有多少人？',
                answer: String(overlap),
                choices: generateChoices(overlap, 1, 15)
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    function generateChoices(correct, min, max) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var v = H.randInt(min, max);
            set.add(String(v));
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
            state.levelData = levelData || { reward: 25 };
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
                '<div class="sts-wrap">' +
                    '<div class="sts-header">' +
                        H.guideBarHTML('🔘', '重叠问题——用集合思维解题！', 'sts-guide') +
                    '</div>' +
                    '<div class="sts-body" id="sts-body"></div>' +
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
                    H.updateGuide('你会求总数了！现在反过来求重叠部分！', 'sts-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('sts-body');
            var phaseLabel = state.phase === 1 ? '求总人数' : '求重叠人数';

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabel, 'sts-guide');

            /* 渲染韦恩图 */
            var vennHTML = '';
            if (state.phase === 1) {
                vennHTML =
                    '<div class="sts-venn">' +
                        '<div class="sts-circle sts-circle-a">' +
                            '<div class="sts-circle-label">' + q.groupA + '</div>' +
                            '<div class="sts-circle-count">' + q.countA + '人</div>' +
                        '</div>' +
                        '<div class="sts-circle sts-circle-b">' +
                            '<div class="sts-circle-label">' + q.groupB + '</div>' +
                            '<div class="sts-circle-count">' + q.countB + '人</div>' +
                        '</div>' +
                        '<div class="sts-overlap">' +
                            '<div class="sts-overlap-text">重叠 ' + q.overlap + '人</div>' +
                        '</div>' +
                    '</div>';
            } else {
                vennHTML =
                    '<div class="sts-venn">' +
                        '<div class="sts-circle sts-circle-a">' +
                            '<div class="sts-circle-label">' + q.groupA + '</div>' +
                            '<div class="sts-circle-count">' + q.countA + '人</div>' +
                        '</div>' +
                        '<div class="sts-circle sts-circle-b">' +
                            '<div class="sts-circle-label">' + q.groupB + '</div>' +
                            '<div class="sts-circle-count">' + q.countB + '人</div>' +
                        '</div>' +
                        '<div class="sts-overlap">' +
                            '<div class="sts-overlap-text sts-overlap-q">？</div>' +
                        '</div>' +
                    '</div>';
            }

            body.innerHTML =
                '<div class="sts-card">' +
                    '<div class="sts-card-emoji">' + (state.phase === 1 ? '📊' : '🔍') + '</div>' +
                    vennHTML +
                    '<div class="sts-card-text">' + q.question + '</div>' +
                    '<div class="sts-card-choices" id="sts-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'sts-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！你学会了集合重叠的计算方法！✅', 'sts-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#sts-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案是 ' + q.answer,
                            document.querySelector('#sts-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#sts-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                state.levelData.reward || 25,
                state.levelData,
                state.mistakes,
                '你掌握了集合重叠问题的解法！三年级上册全部通关！',
                null
            );
        }
    };

    function buildCSS() {
        return '' +
            '.sts-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#ddd6fe 40%,#c4b5fd 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.sts-header{position:relative;z-index:50;}' +
            '.sts-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:16px;' +
                'animation:sts-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes sts-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.sts-card{' +
                'background:white;border-radius:30px;padding:25px 35px 22px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #8b5cf6;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:sts-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:520px;width:94%;' +
            '}' +
            '@keyframes sts-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.sts-card-emoji{font-size:40px;}' +

            /* 韦恩图 */
            '.sts-venn{' +
                'position:relative;width:260px;height:160px;margin:8px 0;' +
            '}' +
            '.sts-circle{' +
                'position:absolute;width:140px;height:140px;border-radius:50%;' +
                'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'border:3px solid;transition:all 0.3s;' +
            '}' +
            '.sts-circle-a{' +
                'left:20px;top:10px;' +
                'background:rgba(239,68,68,0.15);border-color:#ef4444;' +
            '}' +
            '.sts-circle-b{' +
                'right:20px;top:10px;' +
                'background:rgba(59,130,246,0.15);border-color:#3b82f6;' +
            '}' +
            '.sts-circle-label{font-size:11px;font-weight:bold;color:#374151;text-align:center;line-height:1.2;}' +
            '.sts-circle-count{font-size:16px;font-weight:bold;margin-top:2px;}' +
            '.sts-circle-a .sts-circle-count{color:#ef4444;}' +
            '.sts-circle-b .sts-circle-count{color:#3b82f6;}' +

            /* 重叠区域 */
            '.sts-overlap{' +
                'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
                'z-index:10;' +
            '}' +
            '.sts-overlap-text{' +
                'background:rgba(139,92,246,0.2);border:2px dashed #8b5cf6;' +
                'border-radius:12px;padding:4px 10px;font-size:12px;' +
                'font-weight:bold;color:#6d28d9;white-space:nowrap;' +
            '}' +
            '.sts-overlap-q{font-size:18px;color:#ef4444;}' +

            '.sts-card-text{' +
                'font-size:18px;font-weight:bold;color:#5b21b6;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.sts-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;' +
                'width:100%;max-width:400px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
