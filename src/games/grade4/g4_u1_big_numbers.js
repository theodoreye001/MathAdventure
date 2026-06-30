/**
 * 四年级上册 第一单元：大数的认识（亿以内）
 * 路径: src/games/grade4/g4_u1_big_numbers.js
 *
 * 玩法："大数读写塔"
 *   Phase 1 "读数挑战": 给出大数，选择正确读法。4轮。
 *   Phase 2 "写数挑战": 给出读法或数字描述，填写数字。4轮。
 *   Phase 3 "比较与改写": 比较大小、四舍五入改写。4轮。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g4-u1-big-numbers-styles';
    const NEXT_LEVEL = 'lvl_4_2_1';

    /* ── 中文数位 ── */
    var UNITS = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿'];
    var DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    /** 数字转中文读法（万以内简化版） */
    function readNumCN(num) {
        if (num === 0) return '零';
        var s = String(num);
        var len = s.length;
        var result = '';
        var zeroFlag = false;
        for (var i = 0; i < len; i++) {
            var d = parseInt(s[i]);
            var pos = len - 1 - i;
            if (d === 0) {
                zeroFlag = true;
            } else {
                if (zeroFlag && result !== '') result += '零';
                zeroFlag = false;
                result += DIGITS[d] + UNITS[pos];
            }
        }
        return result;
    }

    /** 生成一个万以内随机数（含整万数） */
    function randBigNum() {
        var types = [
            function () { return H.randInt(10, 99) * 100 + H.randInt(1, 99); },   // 4位
            function () { return H.randInt(10, 999) * 100 + H.randInt(1, 99); }, // 5~6位
            function () { return H.randInt(100, 999) * 10000; },                  // 整万
            function () { return H.randInt(10, 99) * 100000 + H.randInt(10, 99) * 10000 + H.randInt(100, 999); } // 7~8位
        ];
        return types[H.randInt(0, types.length - 1)]();
    }

    /** 生成读法选项（包含正确答案和3个干扰项） */
    function genReadChoices(num) {
        var correct = readNumCN(num);
        var set = new Set();
        set.add(correct);
        while (set.size < 4) {
            var fakeNum = num + H.randInt(-500, 500);
            if (fakeNum > 0 && fakeNum !== num) {
                set.add(readNumCN(fakeNum));
            }
        }
        return H.shuffle(Array.from(set));
    }

    /** 生成数字选项（含正确答案） */
    function genNumChoices(correct) {
        var set = new Set();
        set.add(String(correct));
        while (set.size < 4) {
            var off = H.randInt(-200, 200);
            if (off === 0) off = 50;
            var v = correct + off;
            if (v > 999 && v !== correct) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /** 生成四舍五入选项 */
    function genRoundChoices(num, target) {
        var set = new Set();
        set.add(String(target));
        while (set.size < 4) {
            var off = H.randInt(-1, 1) * (target >= 10000 ? 10000 : 1000);
            if (off === 0) off = target >= 10000 ? 10000 : 1000;
            var v = target + off;
            if (v > 0) set.add(String(v));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 1: 读数 ── */
    function buildPhase1() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var num = randBigNum();
            qs.push({
                text: num.toLocaleString(),
                answer: readNumCN(num),
                choices: genReadChoices(num),
                hint: '选择正确的中文读法'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 2: 写数（选择正确数字） ── */
    function buildPhase2() {
        var qs = [];
        for (var i = 0; i < 6; i++) {
            var num = randBigNum();
            var readStr = readNumCN(num);
            qs.push({
                text: '下面哪个数读作：' + readStr + '？',
                answer: String(num),
                choices: genNumChoices(num),
                hint: '根据读法选出正确的数'
            });
        }
        return H.shuffle(qs).slice(0, 4);
    }

    /* ── Phase 3: 比较与改写 ── */
    function buildPhase3() {
        var qs = [];
        // 比较大小
        for (var i = 0; i < 3; i++) {
            var a = randBigNum();
            var b = randBigNum();
            if (a === b) b += 1000;
            var correct = a > b ? (a.toLocaleString() + ' > ' + b.toLocaleString()) : (a.toLocaleString() + ' < ' + b.toLocaleString());
            var wrong1 = a > b ? (a.toLocaleString() + ' < ' + b.toLocaleString()) : (a.toLocaleString() + ' > ' + b.toLocaleString());
            var wrong2 = a.toLocaleString() + ' = ' + b.toLocaleString();
            var wrong3 = '无法比较';
            qs.push({
                text: '比较大小：' + a.toLocaleString() + ' 和 ' + b.toLocaleString(),
                answer: correct,
                choices: H.shuffle([correct, wrong1, wrong2, wrong3]),
                hint: '选择正确的比较符号'
            });
        }
        // 四舍五入到万位
        for (var i = 0; i < 3; i++) {
            var num = H.randInt(100000, 9999999);
            var wan = Math.round(num / 10000) * 10000;
            qs.push({
                text: num.toLocaleString() + ' 四舍五入到万位约是（    ）',
                answer: String(wan),
                choices: genRoundChoices(num, wan),
                hint: '四舍五入到万位'
            });
        }
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
                '<div class="bgn4-wrap">' +
                    '<div class="bgn4-header">' +
                        H.guideBarHTML('🗼', '大数读写塔——认读亿以内的大数！', 'bgn4-guide') +
                    '</div>' +
                    '<div class="bgn4-body" id="bgn4-body"></div>' +
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
                    H.updateGuide('读数没问题！试试写数吧！', 'bgn4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最后一关：比较大小与四舍五入！', 'bgn4-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('bgn4-body');
            var phaseLabels = { 1: '读数挑战', 2: '写数挑战', 3: '比较与改写' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'bgn4-guide');

            var phaseEmoji = state.phase === 1 ? '📖' : state.phase === 2 ? '✏️' : '⚖️';

            body.innerHTML =
                '<div class="bgn4-card">' +
                    '<div class="bgn4-card-emoji">' + phaseEmoji + '</div>' +
                    '<div class="bgn4-card-num">' + q.text + '</div>' +
                    '<div class="bgn4-card-hint">' + q.hint + '</div>' +
                    '<div class="bgn4-card-choices" id="bgn4-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'bgn4-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.answer) {
                        H.updateGuide('答对了！大数认读小能手！✅', 'bgn4-guide');
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        var el = document.querySelector('#bgn4-choices .gh-choice-btn[data-idx="' + idx + '"]');
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
                            document.querySelector('#bgn4-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var el2 = document.querySelector('#bgn4-choices .gh-choice-btn[data-idx="' + ci + '"]');
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
                '你掌握了亿以内大数的读写和比较！',
                NEXT_LEVEL
            );
        }
    };

    function buildCSS() {
        return '' +
            '.bgn4-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#ddd6fe 40%,#a78bfa 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.bgn4-header{position:relative;z-index:50;}' +
            '.bgn4-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:20px;' +
                'animation:bgn4-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes bgn4-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            '.bgn4-card{' +
                'background:white;border-radius:30px;padding:35px 40px 30px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #8b5cf6;' +
                'display:flex;flex-direction:column;align-items:center;gap:18px;' +
                'animation:bgn4-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes bgn4-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.bgn4-card-emoji{font-size:50px;}' +
            '.bgn4-card-num{' +
                'font-size:30px;font-weight:bold;color:#5b21b6;' +
                'text-align:center;line-height:1.6;' +
                'font-family:"Courier New",monospace;' +
                'background:#f5f3ff;padding:12px 28px;border-radius:16px;' +
                'border:2px solid #c4b5fd;' +
            '}' +
            '.bgn4-card-hint{' +
                'font-size:16px;color:#7c3aed;font-style:italic;' +
            '}' +
            '.bgn4-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    window.CurrentGameModule = game;
})();
