/**
 * 五年级下册 第二单元：因数与倍数
 * 路径: src/games/grade5/g5_d_u2_factor_multiple.js
 *
 * 玩法："因数忍者"
 *   Phase 1 "因数配对" (4题): 给出一个数，从可点击选项中选出它的所有因数。
 *   Phase 2 "质数合数" (4题): 判断一个数是质数、合数还是1。
 *   Phase 3 "最大公因数与最小公倍数" (4题): 求两个数的 GCF 或 LCM。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u2-factor-multiple-styles';
    const NEXT_LEVEL = 'lvl_5_d_3';

    /* ========== 数学工具 ========== */

    /** 求一个数的所有因数，升序排列 */
    function getFactors(n) {
        var factors = [];
        for (var i = 1; i <= n; i++) {
            if (n % i === 0) factors.push(i);
        }
        return factors;
    }

    /** 判断质数/合数/1：返回 'prime' | 'composite' | 'unit' */
    function classifyNumber(n) {
        if (n === 1) return 'unit';
        if (n === 2) return 'prime';
        if (n % 2 === 0) return 'composite';
        for (var i = 3; i * i <= n; i += 2) {
            if (n % i === 0) return 'composite';
        }
        return 'prime';
    }

    /** 最大公因数（辗转相除） */
    function gcf(a, b) {
        while (b !== 0) {
            var t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    /** 最小公倍数 */
    function lcm(a, b) {
        return (a * b) / gcf(a, b);
    }

    /** 从数组中随机选取不重复元素 */
    function pickRandom(arr, count) {
        var shuffled = H.shuffle(arr);
        return shuffled.slice(0, count);
    }

    /* ========== Phase 1: 因数配对 ========== */

    /**
     * 生成一组因数选择题。
     * 从候选数中选一个数，列出所有因数作为正确项，再加上干扰项。
     */
    function buildPhase1() {
        var candidates = [12, 18, 24, 30, 36, 48];
        var questions = [];

        for (var i = 0; i < candidates.length; i++) {
            var num = candidates[i];
            var factors = getFactors(num);
            // 干扰项：不是因数的数
            var distractors = [];
            for (var d = 1; d <= num; d++) {
                if (num % d !== 0) distractors.push(d);
            }
            // 选若干干扰项，让选项总数为 8
            var need = Math.max(0, 8 - factors.length);
            var chosenDistractors = pickRandom(distractors, need);
            var allOptions = H.shuffle(factors.concat(chosenDistractors));

            questions.push({
                num: num,
                factors: factors,
                options: allOptions,
                correctSet: factors.slice() // 正确因数集合
            });
        }

        return H.shuffle(questions).slice(0, 4);
    }

    /* ========== Phase 2: 质数合数 ========== */

    function buildPhase2() {
        // 混合小质数、合数和1
        var pool = [1, 2, 3, 5, 7, 11, 13, 4, 6, 8, 9, 10, 12, 14, 15, 16, 21, 25, 27, 32, 49];
        var picked = pickRandom(pool, 6);
        var questions = [];

        for (var i = 0; i < picked.length; i++) {
            var num = picked[i];
            var type = classifyNumber(num);
            var label;
            if (type === 'unit') label = '1（既不是质数也不是合数）';
            else if (type === 'prime') label = '质数';
            else label = '合数';

            questions.push({
                num: num,
                type: type,
                label: label,
                choices: ['质数', '合数', '1（既不是质数也不是合数）']
            });
        }

        return H.shuffle(questions).slice(0, 4);
    }

    /* ========== Phase 3: 最大公因数与最小公倍数 ========== */

    function buildPhase3() {
        // 配对好的 (a, b)，保证有非平凡的 GCF 和 LCM
        var pairs = [
            [12, 18], [8, 12], [15, 20], [24, 36],
            [9, 15], [10, 14], [16, 24], [6, 10],
            [21, 28], [14, 21]
        ];
        var pickedPairs = pickRandom(pairs, 6);
        var questions = [];

        for (var i = 0; i < pickedPairs.length; i++) {
            var pair = pickedPairs[i];
            var a = pair[0], b = pair[1];
            var isGCF = H.randInt(0, 1) === 0;
            var correctVal = isGCF ? gcf(a, b) : lcm(a, b);
            var opLabel = isGCF ? '最大公因数' : '最小公倍数';

            // 生成干扰选项
            var distractors = new Set();
            distractors.add(correctVal);
            // 加一些合理范围内的干扰
            var baseVal = isGCF ? Math.min(a, b) : Math.max(a, b);
            var rangeStart = Math.max(1, correctVal - 6);
            var rangeEnd = correctVal + 15;
            var tries = 0;
            while (distractors.size < 4 && tries < 60) {
                tries++;
                var dv = H.randInt(rangeStart, rangeEnd);
                if (dv !== correctVal && dv > 0) distractors.add(dv);
            }

            questions.push({
                a: a,
                b: b,
                op: opLabel,
                answer: correctVal,
                choices: H.shuffle(Array.from(distractors).map(String))
            });
        }

        return H.shuffle(questions).slice(0, 4);
    }

    /* ========== 游戏状态 ========== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false,
        // Phase 1 多选状态
        selected: [],      // 当前已选的因数
        totalMistakes: 0   // Phase 1 每题的错误计数
    };

    /* ========== 游戏主体 ========== */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 35 };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.selected = [];
            state.questions = buildPhase1();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="fac-wrap">' +
                    '<div class="fac-header">' +
                        H.guideBarHTML('🥷', '因数忍者——因数与倍数大挑战！', 'fac-guide') +
                    '</div>' +
                    '<div class="fac-body" id="fac-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildPhase1();
            H.updateGuide('第一关：找出所有因数！选完后点"确认"', 'fac-guide');
            var self = this;
            setTimeout(function () { self.renderPhase1Question(); }, 800);
        },

        startPhase2: function () {
            state.phase = 2;
            state.qIndex = 0;
            state.questions = buildPhase2();
            H.updateGuide('第二关：判断质数还是合数！', 'fac-guide');
            var self = this;
            setTimeout(function () { self.nextQuestion(); }, 1000);
        },

        startPhase3: function () {
            state.phase = 3;
            state.qIndex = 0;
            state.questions = buildPhase3();
            H.updateGuide('终极关：最大公因数与最小公倍数！', 'fac-guide');
            var self = this;
            setTimeout(function () { self.nextQuestion(); }, 1000);
        },

        /* ── Phase 1 特殊渲染：多选因数 ── */
        renderPhase1Question: function () {
            state.answered = false;
            state.selected = [];

            if (state.qIndex >= state.questions.length) {
                this.startPhase2();
                return;
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fac-body');

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · 因数配对 · 找出 ' + q.num + ' 的所有因数', 'fac-guide');

            var html =
                '<div class="fac-card">' +
                    '<div class="fac-card-emoji">🔍</div>' +
                    '<div class="fac-card-num">' +
                        '<span class="fac-big-num">' + q.num + '</span>' +
                        '<span class="fac-label">的因数是哪些？</span>' +
                    '</div>' +
                    '<div class="fac-card-hint">点击所有是因数的数，然后点"确认"</div>' +
                    '<div class="fac-grid" id="fac-grid"></div>' +
                    '<button class="fac-confirm-btn" id="fac-confirm-btn" disabled>✅ 确认选择</button>' +
                '</div>';

            body.innerHTML = html;

            // 渲染选项网格
            var grid = document.getElementById('fac-grid');
            var optionsHTML = '';
            for (var i = 0; i < q.options.length; i++) {
                optionsHTML +=
                    '<button class="fac-opt-btn" data-val="' + q.options[i] + '" data-idx="' + i + '">' +
                        q.options[i] +
                    '</button>';
            }
            grid.innerHTML = optionsHTML;

            var self = this;
            var confirmBtn = document.getElementById('fac-confirm-btn');
            var btns = grid.querySelectorAll('.fac-opt-btn');

            // 绑定点击切换
            btns.forEach(function (btn) {
                btn.onclick = function () {
                    if (state.answered) return;
                    var val = parseInt(btn.getAttribute('data-val'));
                    var idx = state.selected.indexOf(val);
                    if (idx >= 0) {
                        // 取消选中
                        state.selected.splice(idx, 1);
                        btn.classList.remove('fac-selected');
                    } else {
                        // 选中
                        state.selected.push(val);
                        btn.classList.add('fac-selected');
                    }
                    confirmBtn.disabled = state.selected.length === 0;
                };
            });

            // 确认按钮
            confirmBtn.onclick = function () {
                if (state.answered || state.selected.length === 0) return;
                state.answered = true;
                self.checkPhase1Answer(q, btns, confirmBtn);
            };
        },

        checkPhase1Answer: function (q, btns, confirmBtn) {
            var selectedSet = new Set(state.selected);
            var correctSet = new Set(q.correctSet);

            // 比较两个集合是否相等
            var isCorrect = selectedSet.size === correctSet.size;
            if (isCorrect) {
                selectedSet.forEach(function (v) {
                    if (!correctSet.has(v)) isCorrect = false;
                });
            }

            if (isCorrect) {
                H.updateGuide('太厉害了！' + q.num + ' 的因数全找对了！✅', 'fac-guide');
                this.masteryUp();
                // 全部标绿
                btns.forEach(function (btn) {
                    var v = parseInt(btn.getAttribute('data-val'));
                    if (correctSet.has(v)) {
                        btn.classList.add('fac-correct');
                    }
                });
                confirmBtn.disabled = true;
                confirmBtn.textContent = '✅ 正确！';
                confirmBtn.classList.add('fac-confirm-done');
            } else {
                state.mistakes++;
                this.masteryDown();
                // 标记正确和错误
                var wrongBtn = null;
                btns.forEach(function (btn) {
                    var v = parseInt(btn.getAttribute('data-val'));
                    if (correctSet.has(v)) {
                        btn.classList.add('fac-correct');
                    } else if (selectedSet.has(v)) {
                        btn.classList.add('fac-wrong');
                        if (!wrongBtn) wrongBtn = btn;
                    }
                });
                // 找到第一个错误按钮触发提示
                if (!wrongBtn) wrongBtn = btns[0];
                H.triggerError(state.container, '正确因数: ' + q.correctSet.join(', '), wrongBtn);

                confirmBtn.disabled = true;
                confirmBtn.textContent = '❌ 看正确答案';
                confirmBtn.classList.add('fac-confirm-wrong');
            }

            var self = this;
            state.qIndex++;
            setTimeout(function () {
                self.renderPhase1Question();
            }, isCorrect ? 1200 : 2200);
        },

        /* ── Phase 2 & 3 通用渲染 ── */
        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 2) {
                    this.startPhase3();
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('fac-body');

            if (state.phase === 2) {
                this.renderPhase2Question(q, body);
            } else {
                this.renderPhase3Question(q, body);
            }
        },

        renderPhase2Question: function (q, body) {
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · 质数合数', 'fac-guide');

            body.innerHTML =
                '<div class="fac-card">' +
                    '<div class="fac-card-emoji">🧬</div>' +
                    '<div class="fac-card-num">' +
                        '<span class="fac-big-num">' + q.num + '</span>' +
                        '<span class="fac-label">是质数、合数，还是1？</span>' +
                    '</div>' +
                    '<div class="fac-card-hint">质数：只有1和它本身两个因数<br>合数：除了1和本身还有别的因数</div>' +
                    '<div class="fac-card-choices" id="fac-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fac-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === q.label) {
                        H.updateGuide(q.num + ' ' + q.label + '！判断正确！✅', 'fac-guide');
                        self.masteryUp();
                        var el = document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        self.masteryDown();
                        H.triggerError(state.container, q.num + ' 是 ' + q.label,
                            document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        q.choices.forEach(function (c, ci) {
                            if (c === q.label) {
                                var el2 = document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + ci + '"]');
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

        renderPhase3Question: function (q, body) {
            var opEmoji = q.op === '最大公因数' ? '🤝' : '🔗';
            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + q.op, 'fac-guide');

            body.innerHTML =
                '<div class="fac-card">' +
                    '<div class="fac-card-emoji">' + opEmoji + '</div>' +
                    '<div class="fac-card-num">' +
                        '<span class="fac-pair">' + q.a + '</span>' +
                        '<span class="fac-pair-sep">与</span>' +
                        '<span class="fac-pair">' + q.b + '</span>' +
                        '<span class="fac-label">的' + q.op + '是？</span>' +
                    '</div>' +
                    '<div class="fac-card-hint">' +
                        (q.op === '最大公因数' ? '公因数中最大的那个' : '公倍数中最小的那个') +
                    '</div>' +
                    '<div class="fac-card-choices" id="fac-choices"></div>' +
                '</div>';

            var self = this;
            H.renderChoices(
                q.choices,
                'fac-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    if (picked === String(q.answer)) {
                        H.updateGuide(q.a + ' 与 ' + q.b + ' 的' + q.op + '是 ' + q.answer + '！✅', 'fac-guide');
                        self.masteryUp();
                        var el = document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + idx + '"]');
                        if (el) {
                            el.style.background = '#10b981';
                            el.style.borderColor = '#10b981';
                            el.style.color = 'white';
                        }
                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1200);
                    } else {
                        state.mistakes++;
                        self.masteryDown();
                        H.triggerError(state.container, q.op + ' 是 ' + q.answer,
                            document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                        q.choices.forEach(function (c, ci) {
                            if (c === String(q.answer)) {
                                var el2 = document.querySelector('#fac-choices .gh-choice-btn[data-idx="' + ci + '"]');
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

        /* ── 掌握度 ── */
        masteryUp: function () {
            if (window.GameManager && window.GameManager.updateMastery) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
            }
        },

        masteryDown: function () {
            if (window.GameManager && window.GameManager.updateMastery) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
        },

        /* ── 结束 ── */
        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 35,
                state.levelData,
                state.mistakes,
                '你掌握了因数倍数、质数合数以及 GCF 和 LCM！因数忍者功成！',
                NEXT_LEVEL
            );
        }
    };

    /* ========== CSS ========== */

    function buildCSS() {
        return '' +
            /* ── 容器 ── */
            '.fac-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ecfdf5 0%,#a7f3d0 40%,#059669 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.fac-header{position:relative;z-index:50;}' +
            '.fac-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:18px;' +
                'animation:fac-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes fac-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* ── 卡片 ── */
            '.fac-card{' +
                'background:white;border-radius:30px;padding:30px 35px 28px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #059669;' +
                'display:flex;flex-direction:column;align-items:center;gap:16px;' +
                'animation:fac-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:560px;width:92%;' +
            '}' +
            '@keyframes fac-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.fac-card-emoji{font-size:48px;}' +

            /* ── 数字区域 ── */
            '.fac-card-num{' +
                'display:flex;align-items:center;gap:12px;flex-wrap:wrap;' +
                'justify-content:center;' +
            '}' +
            '.fac-big-num{' +
                'font-size:38px;font-weight:bold;color:#065f46;' +
                'background:#d1fae5;padding:8px 24px;border-radius:16px;' +
                'border:2px solid #6ee7b7;font-family:"Courier New",monospace;' +
            '}' +
            '.fac-label{' +
                'font-size:20px;font-weight:bold;color:#065f46;' +
            '}' +
            '.fac-pair{' +
                'font-size:32px;font-weight:bold;color:#065f46;' +
                'background:#d1fae5;padding:6px 20px;border-radius:14px;' +
                'border:2px solid #6ee7b7;font-family:"Courier New",monospace;' +
            '}' +
            '.fac-pair-sep{' +
                'font-size:22px;font-weight:bold;color:#059669;' +
            '}' +

            /* ── 提示文字 ── */
            '.fac-card-hint{' +
                'font-size:15px;color:#059669;text-align:center;line-height:1.6;' +
            '}' +

            /* ── 选项网格（Phase 1 多选） ── */
            '.fac-grid{' +
                'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;' +
                'width:100%;max-width:400px;' +
            '}' +
            '.fac-opt-btn{' +
                'padding:14px 0;background:white;border:3px solid #6ee7b7;' +
                'border-radius:16px;font-size:22px;font-weight:bold;color:#065f46;' +
                'cursor:pointer;transition:all 0.2s;' +
                'font-family:"Courier New",monospace;' +
            '}' +
            '.fac-opt-btn:hover{background:#ecfdf5;border-color:#059669;}' +
            '.fac-opt-btn.fac-selected{' +
                'background:#059669;color:white;border-color:#059669;' +
                'box-shadow:0 0 0 3px rgba(5,150,105,0.3);' +
                'transform:scale(1.05);' +
            '}' +
            '.fac-opt-btn.fac-correct{' +
                'background:#10b981;color:white;border-color:#10b981;' +
                'animation:fac-bounce 0.4s ease;' +
            '}' +
            '.fac-opt-btn.fac-wrong{' +
                'background:#ef4444;color:white;border-color:#ef4444;' +
                'animation:fac-shake 0.4s ease;' +
            '}' +
            '@keyframes fac-bounce{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}' +
            '@keyframes fac-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' +

            /* ── 确认按钮 ── */
            '.fac-confirm-btn{' +
                'padding:14px 40px;font-size:20px;font-weight:bold;' +
                'background:#059669;color:white;border:none;border-radius:20px;' +
                'cursor:pointer;transition:all 0.25s;' +
                'box-shadow:0 4px 12px rgba(5,150,105,0.3);' +
            '}' +
            '.fac-confirm-btn:hover:not(:disabled){' +
                'transform:scale(1.05);box-shadow:0 6px 18px rgba(5,150,105,0.4);' +
            '}' +
            '.fac-confirm-btn:disabled{' +
                'background:#a7f3d0;cursor:not-allowed;box-shadow:none;' +
            '}' +
            '.fac-confirm-btn.fac-confirm-done{' +
                'background:#10b981;cursor:default;' +
            '}' +
            '.fac-confirm-btn.fac-confirm-wrong{' +
                'background:#ef4444;cursor:default;' +
            '}' +

            /* ── 通用选项容器 ── */
            '.fac-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;max-width:480px;' +
            '}';
    }

    /* ========== 注册 ========== */

    window.CurrentGameModule = game;
})();
