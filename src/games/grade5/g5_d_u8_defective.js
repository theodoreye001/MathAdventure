/**
 * 五年级下册 第八单元：找次品（数学广角）
 * 路径: src/games/grade5/g5_d_u8_defective.js
 *
 * 玩法："三分法推理" —— 用天平称量找出次品的最优策略
 *   Phase 1 "理解三分法" (4题): 理解为什么三分法最优。
 *   Phase 2 "最少次数" (4题): 已知N个零件有1个次品(较重)，求最少称量次数。
 *   Phase 3 "推理判断" (4题): 给定具体称量场景，判断下一步操作。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u8-defective-styles';
    const NEXT_LEVEL = null;

    /* ─────────────────── Phase 1 数据 ─────────────────── */

    var PHASE1_QUESTIONS = [
        {
            text: '8个零件中有1个次品（较重），至少称几次一定能找到？',
            answer: '2次',
            choices: ['1次', '2次', '3次', '4次'],
            hint: '把8分成3、3、2三组来称',
            explain: '8→(3,3,2) 第一次称两个3：若不平衡取重的3再称1次；若平衡取2再称1次。共2次。'
        },
        {
            text: '为什么找次品时，分成3组比分成2组更好？',
            answer: '一次称量能排除更多零件',
            choices: ['操作更简单', '一次称量能排除更多零件', '不需要天平', '只需要称1次'],
            hint: '三分法每次排除约2/3的零件',
            explain: '天平有3种结果（左重、右重、平衡），分成3组可以利用每种结果排除约2/3的零件。'
        },
        {
            text: '天平称一次有几种可能的结果？',
            answer: '3种',
            choices: ['2种', '3种', '4种', '1种'],
            hint: '想想天平可能出现的所有情况',
            explain: '左倾、右倾、平衡，共3种结果。这就是为什么要分成3组而不是2组。'
        },
        {
            text: '9个零件分成3组(3,3,3)，称第一次后如果天平平衡，次品在哪组？',
            answer: '没上天平的那组',
            choices: ['左边那组', '右边那组', '没上天平的那组', '无法判断'],
            hint: '天平平衡说明两边都是正品',
            explain: '两边一样重说明正品在天平上，次品就是没上天平的那3个。'
        }
    ];

    /* ─────────────────── Phase 2 数据 ─────────────────── */

    // (N个零件) → 最少称量次数
    var PHASE2_ITEMS = [
        { total: 3,  answer: '1次',  options: ['1次', '2次', '3次'] },
        { total: 5,  answer: '2次',  options: ['1次', '2次', '3次'] },
        { total: 7,  answer: '2次',  options: ['1次', '2次', '3次'] },
        { total: 9,  answer: '2次',  options: ['1次', '2次', '3次'] },
        { total: 12, answer: '3次',  options: ['2次', '3次', '4次'] },
        { total: 20, answer: '3次',  options: ['2次', '3次', '4次'] },
        { total: 27, answer: '3次',  options: ['2次', '3次', '4次'] },
        { total: 40, answer: '4次',  options: ['3次', '4次', '5次'] }
    ];

    /**
     * 计算最少称量次数（数学公式）
     * n个零件找1个次品(较重)，最少次数 = ceil(log3(n))
     */
    function minWeighings(n) {
        if (n <= 1) return 0;
        var count = 0;
        var power = 1;
        while (power < n) {
            power *= 3;
            count++;
        }
        return count;
    }

    /* ─────────────────── Phase 3 数据 ─────────────────── */

    var SCENARIOS = [
        {
            total: 9, groups: [3, 3, 3], result: 'left-lighter',
            description: '9个球分成A(3)、B(3)、C(3)三组，A放左边，B放右边，C不放。天平向右倾斜（左边轻）。',
            question: '接下来应该怎么做？',
            answer: '取右边(B组)的3个，分成1、1、1再称',
            choices: [
                '取左边(A组)的3个，分成1、1、1再称',
                '取右边(B组)的3个，分成1、1、1再称',
                '取没上天平的C组的3个再称',
                '随便从任意一组取1个称'
            ],
            hint: '次品较重，天平轻的那边是正品',
            explain: '左边轻 → 左边是正品；右边重 → 次品在右边B组的3个中。再称1次(1vs1)即可找出。'
        },
        {
            total: 9, groups: [3, 3, 3], result: 'balanced',
            description: '9个球分成A(3)、B(3)、C(3)三组，A放左边，B放右边，C不放。天平平衡。',
            question: '次品在哪组？',
            answer: '没上天平的C组',
            choices: ['左边A组', '右边B组', '没上天平的C组', '无法判断'],
            hint: '天平平衡说明天平上都是正品',
            explain: 'A和B一样重 → A、B都是正品 → 次品在没上天平的C组3个中。'
        },
        {
            total: 8, groups: [3, 3, 2], result: 'balanced',
            description: '8个零件分成A(3)、B(3)、C(2)三组，A放左边，B放右边，C不放。天平平衡。',
            question: '接下来怎么做？',
            answer: '取C组的2个，放天平两边各1个称',
            choices: [
                '取A组的3个继续称',
                '取B组的3个继续称',
                '取C组的2个，放天平两边各1个称',
                '从A、B各取1个称'
            ],
            hint: '平衡了说明A、B都没有次品',
            explain: 'A=B=正品 → 次品在C组2个中。把这2个放天平两边(1vs1)，重的就是次品。'
        },
        {
            total: 8, groups: [3, 3, 2], result: 'left-heavy',
            description: '8个零件分成A(3)、B(3)、C(2)三组，A放左边，B放右边，C不放。天平向左倾斜（左边重）。',
            question: '次品在哪组？接下来怎么做？',
            answer: '取左边(A组)的3个，分成1、1、1称',
            choices: [
                '取右边(B组)的3个，分成1、1、1称',
                '取左边(A组)的3个，分成1、1、1称',
                '取C组的2个称',
                '需要再把所有零件重新分组'
            ],
            hint: '次品较重，天平重的那边有次品',
            explain: '左边重 → 次品在A组3个中。取A组3个，任取2个放天平(1vs1)：若一边重则找到；若平衡则第3个是次品。'
        },
        {
            total: 27, groups: [9, 9, 9], result: 'left-lighter',
            description: '27个零件分成A(9)、B(9)、C(9)三组，A放左边，B放右边，C不放。天平向右倾斜（左边轻）。',
            question: '次品在哪个范围？',
            answer: '右边B组的9个中',
            choices: ['左边A组的9个中', '右边B组的9个中', '没上天平的C组9个中', '所有27个中'],
            hint: '次品较重，轻的那边是正品',
            explain: '左边轻=正品，次品在右边B组(较重)的9个中，还需再称2次才能确定。'
        },
        {
            total: 27, groups: [9, 9, 9], result: 'balanced',
            description: '27个零件分成A(9)、B(9)、C(9)三组，A放左边，B放右边，C不放。天平平衡。',
            question: '次品在哪个范围？',
            answer: '没上天平的C组9个中',
            choices: ['左边A组的9个中', '右边B组的9个中', '没上天平的C组9个中', '无法确定'],
            hint: '平衡说明两边都是正品',
            explain: 'A=B=正品 → 次品在C组9个中。接下来把这9个再分成(3,3,3)继续称。'
        },
        {
            total: 5, groups: [2, 2, 1], result: 'balanced',
            description: '5个零件分成A(2)、B(2)、C(1)三组，A放左边，B放右边，C不放。天平平衡。',
            question: '次品是哪个？',
            answer: '没上天平的那1个',
            choices: ['左边的2个之一', '右边的2个之一', '没上天平的那1个', '还需要再称一次'],
            hint: '天平两边一样重说明它们都是正品',
            explain: 'A=B=正品 → 次品就是没上天平的那1个，不用再称了！'
        },
        {
            total: 12, groups: [4, 4, 4], result: 'left-heavy',
            description: '12个零件分成A(4)、B(4)、C(4)三组，A放左边，B放右边，C不放。天平向左倾斜（左边重）。',
            question: '接下来应该怎么做？',
            answer: '从左边A组4个中取3个，分成(1,1,1)称，留1个备用',
            choices: [
                '从左边A组4个中取3个，分成(1,1,1)称，留1个备用',
                '把A组4个分成(2,2)称',
                '把A组4个分成(1,1,1,1)逐个称',
                '取C组4个重新称'
            ],
            hint: '12个零件需要3次，第2次要尽量缩小范围',
            explain: '次品在A组4个中。取3个分(1,1,1)：若某一边重则找到；若平衡则第4个(备用的)是次品。第2次搞定。'
        }
    ];

    /* ─────────────────── 天平渲染 ─────────────────── */

    /**
     * 生成天平 HTML
     * @param {string} tilt - 'balanced' | 'left-heavy' | 'left-lighter'
     * @param {number} leftCount  - 左盘物品数
     * @param {number} rightCount - 右盘物品数
     * @returns {string} HTML
     */
    function renderBalance(tilt, leftCount, rightCount) {
        var angle = 0;
        if (tilt === 'left-heavy') angle = -8;
        else if (tilt === 'left-lighter') angle = 8;

        var leftItems = '';
        for (var i = 0; i < leftCount; i++) {
            leftItems += '<span class="dft-pan-item">⚪</span>';
        }
        var rightItems = '';
        for (var j = 0; j < rightCount; j++) {
            rightItems += '<span class="dft-pan-item">⚪</span>';
        }

        return '' +
            '<div class="dft-balance-wrap">' +
                '<div class="dft-balance-beam-area">' +
                    '<div class="dft-beam" style="transform:rotate(' + angle + 'deg)">' +
                        '<div class="dft-pan dft-pan-left">' +
                            '<div class="dft-pan-plate">' + leftItems + '</div>' +
                            '<div class="dft-pan-hook"></div>' +
                        '</div>' +
                        '<div class="dft-pan dft-pan-right">' +
                            '<div class="dft-pan-plate">' + rightItems + '</div>' +
                            '<div class="dft-pan-hook"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="dft-fulcrum">▲</div>' +
                '</div>' +
            '</div>';
    }

    /* ─────────────────── 题目生成 ─────────────────── */

    function buildPhase2() {
        var pool = H.shuffle(PHASE2_ITEMS.slice());
        return pool.slice(0, 4).map(function (item) {
            return {
                text: '🔍 ' + item.total + '个零件中有1个次品（较重），用天平至少称几次一定能找到？',
                answer: item.answer,
                choices: H.shuffle(item.options),
                hint: '三分法：每次分成尽量相等的3组',
                explain: '最少次数公式：3^k >= n → k = ceil(log₃(n))。' + item.total + '个零件需要' + item.answer + '。'
            };
        });
    }

    function buildPhase3() {
        var pool = H.shuffle(SCENARIOS.slice());
        return pool.slice(0, 4).map(function (s) {
            return {
                text: s.description,
                question: s.question,
                answer: s.answer,
                choices: s.choices.slice(),
                hint: s.hint,
                explain: s.explain,
                scenario: s
            };
        });
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
            /* 整体布局 */
            '.dft-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#e0f2fe 0%,#7dd3fc 50%,#0ea5e9 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.dft-header{position:relative;z-index:50;}' +
            '.dft-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:20px;gap:15px;' +
                'animation:dft-fadeIn 0.4s ease;' +
            '}' +
            '@keyframes dft-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* 卡片 */
            '.dft-card{' +
                'background:white;border-radius:30px;padding:30px 35px 25px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #0ea5e9;' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
                'animation:dft-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:620px;width:94%;' +
            '}' +
            '@keyframes dft-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +

            '.dft-card-num{' +
                'font-size:24px;font-weight:bold;color:#0369a1;' +
                'text-align:center;line-height:1.6;' +
                'background:#e0f2fe;padding:12px 24px;border-radius:16px;' +
                'border:2px solid #7dd3fc;' +
            '}' +
            '.dft-card-question{' +
                'font-size:20px;font-weight:bold;color:#0c4a6e;' +
                'text-align:center;line-height:1.5;' +
                'margin-top:4px;' +
            '}' +
            '.dft-card-hint{' +
                'font-size:15px;color:#0284c7;font-style:italic;' +
            '}' +
            '.dft-card-explain{' +
                'font-size:15px;color:#065f46;line-height:1.6;' +
                'background:#ecfdf5;padding:12px 18px;border-radius:12px;' +
                'border:2px solid #6ee7b7;display:none;' +
            '}' +
            '.dft-card-choices{' +
                'display:flex;flex-direction:column;gap:10px;' +
                'width:100%;max-width:520px;' +
            '}' +

            /* 天平 */
            '.dft-balance-wrap{' +
                'width:100%;display:flex;justify-content:center;' +
                'padding:10px 0;' +
            '}' +
            '.dft-balance-beam-area{' +
                'position:relative;width:300px;height:180px;' +
            '}' +
            '.dft-beam{' +
                'position:absolute;top:30px;left:0;width:100%;' +
                'display:flex;justify-content:space-between;align-items:flex-start;' +
                'transform-origin:center top;' +
                'transition:transform 0.8s cubic-bezier(0.34,1.56,0.64,1);' +
            '}' +
            '.dft-pan{' +
                'display:flex;flex-direction:column;align-items:center;' +
            '}' +
            '.dft-pan-hook{' +
                'width:3px;height:25px;background:#475569;border-radius:2px;' +
            '}' +
            '.dft-pan-plate{' +
                'min-width:80px;min-height:45px;' +
                'background:#fef3c7;border:3px solid #d97706;border-radius:0 0 50% 50%;' +
                'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;' +
                'padding:6px 8px;gap:2px;' +
            '}' +
            '.dft-pan-item{font-size:18px;line-height:1;}' +
            '.dft-fulcrum{' +
                'position:absolute;bottom:0;left:50%;transform:translateX(-50%);' +
                'font-size:30px;color:#475569;line-height:1;' +
            '}' +

            /* 场景描述区 */
            '.dft-scenario{' +
                'width:100%;max-width:520px;' +
                'background:#f0f9ff;border:2px solid #bae6fd;border-radius:16px;' +
                'padding:14px 18px;margin-bottom:4px;' +
            '}' +
            '.dft-scenario-label{' +
                'font-size:14px;color:#0369a1;font-weight:bold;margin-bottom:6px;' +
            '}' +
            '.dft-scenario-text{' +
                'font-size:17px;color:#0c4a6e;line-height:1.6;' +
            '}' +

            /* 阶段标题 */
            '.dft-phase-banner{' +
                'font-size:28px;font-weight:bold;color:white;' +
                'background:linear-gradient(135deg,#0ea5e9,#2563eb);' +
                'padding:14px 40px;border-radius:20px;' +
                'box-shadow:0 6px 20px rgba(14,165,233,0.35);' +
                'animation:dft-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'text-align:center;' +
            '}' +

            /* 知识卡片（阶段过渡） */
            '.dft-knowledge{' +
                'background:white;border-radius:24px;padding:28px 32px;' +
                'box-shadow:0 8px 25px rgba(0,0,0,0.1);' +
                'border:3px solid #f59e0b;' +
                'max-width:560px;width:92%;' +
                'animation:dft-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'display:flex;flex-direction:column;align-items:center;gap:14px;' +
            '}' +
            '.dft-knowledge h3{' +
                'font-size:24px;color:#92400e;margin:0;' +
            '}' +
            '.dft-knowledge p{' +
                'font-size:18px;color:#78716c;line-height:1.7;text-align:center;margin:0;' +
            '}' +

            /* 进度条 */
            '.dft-progress{' +
                'width:90%;max-width:400px;height:10px;' +
                'background:rgba(255,255,255,0.4);border-radius:5px;' +
                'overflow:hidden;margin-top:6px;' +
            '}' +
            '.dft-progress-fill{' +
                'height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);' +
                'border-radius:5px;transition:width 0.5s ease;' +
            '}' +

            /* 答对高亮 */
            '.dft-correct{background:#10b981!important;border-color:#10b981!important;color:white!important;}';
    }

    /* ─────────────────── 游戏主逻辑 ─────────────────── */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '找次品' };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = PHASE1_QUESTIONS.slice();

            this.render();
            this.showPhaseTransition('📐 理解三分法', '天平找次品的奥秘，从理解三分法开始！');
        },

        render: function () {
            state.container.innerHTML =
                '<div class="dft-wrap">' +
                    '<div class="dft-header">' +
                        H.guideBarHTML('⚖️', '三分法推理——找次品的最优策略！', 'dft-guide') +
                    '</div>' +
                    '<div class="dft-body" id="dft-body"></div>' +
                '</div>';
        },

        showPhaseTransition: function (title, subtitle) {
            var self = this;
            var body = document.getElementById('dft-body');
            body.innerHTML =
                '<div class="dft-phase-banner">' + title + '</div>' +
                '<div style="font-size:18px;color:#0c4a6e;text-align:center;margin-top:8px;">' +
                    subtitle + '</div>';
            setTimeout(function () { self.nextQuestion(); }, 1800);
        },

        showKnowledge: function (title, text, callback) {
            var self = this;
            var body = document.getElementById('dft-body');
            body.innerHTML =
                '<div class="dft-knowledge">' +
                    '<h3>' + title + '</h3>' +
                    '<p>' + text + '</p>' +
                '</div>';
            setTimeout(function () { callback(); }, 2200);
        },

        nextQuestion: function () {
            state.answered = false;

            /* 阶段切换 */
            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('进入第二关：最少次数大挑战！', 'dft-guide');
                    var self = this;
                    this.showKnowledge(
                        '💡 最少次数公式',
                        'n个零件找1个次品（较重），最少称量次数 k 满足 3^k ≥ n。' +
                        '即 k = ⌈log₃n⌉。例如：3个→1次，9个→2次，27个→3次。',
                        function () { self.nextQuestion(); }
                    );
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('最终挑战：推理判断！', 'dft-guide');
                    var self = this;
                    this.showKnowledge(
                        '🧠 推理判断要点',
                        '给定天平称量结果，根据"次品较重"这一条件推理：' +
                        '重的一边有次品，天平平衡则次品在没上天平的那组中。逐步缩小范围！',
                        function () { self.nextQuestion(); }
                    );
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('dft-body');

            var phaseLabels = { 1: '理解三分法', 2: '最少次数', 3: '推理判断' };
            var totalDone = (state.phase - 1) * 4 + state.qIndex;
            var totalAll = 12;
            var pct = Math.round(totalDone / totalAll * 100);

            H.updateGuide(
                '第 ' + totalDone + '/' + totalAll + ' 题 · ' + phaseLabels[state.phase],
                'dft-guide'
            );

            /* 进度条 */
            var progressHTML =
                '<div class="dft-progress">' +
                    '<div class="dft-progress-fill" style="width:' + pct + '%"></div>' +
                '</div>';

            /* Phase 3: 场景天平 */
            var balanceHTML = '';
            var scenarioHTML = '';
            if (state.phase === 3 && q.scenario) {
                var s = q.scenario;
                var leftOnPan = 0, rightOnPan = 0;
                if (s.groups.length >= 2) {
                    leftOnPan = s.groups[0];
                    rightOnPan = s.groups[1];
                }
                balanceHTML = renderBalance(s.result, leftOnPan, rightOnPan);
                scenarioHTML =
                    '<div class="dft-scenario">' +
                        '<div class="dft-scenario-label">📋 场景信息</div>' +
                        '<div class="dft-scenario-text">' + s.description + '</div>' +
                    '</div>';
            }

            /* Phase 1: 简单天平示意（非场景） */
            if (state.phase === 1) {
                balanceHTML = renderBalance('balanced', 3, 3);
            }

            var cardNumHTML = q.text;
            var questionHTML = '';
            if (q.question) {
                questionHTML = '<div class="dft-card-question">' + q.question + '</div>';
            }

            body.innerHTML =
                '<div class="dft-card">' +
                    scenarioHTML +
                    balanceHTML +
                    '<div class="dft-card-num">' + cardNumHTML + '</div>' +
                    questionHTML +
                    '<div class="dft-card-hint">💡 ' + q.hint + '</div>' +
                    '<div class="dft-card-explain" id="dft-explain">📖 ' + q.explain + '</div>' +
                    '<div class="dft-card-choices" id="dft-choices"></div>' +
                '</div>' +
                progressHTML;

            var self = this;
            H.renderChoices(
                q.choices,
                'dft-choices',
                function (idx) {
                    if (state.answered) return;
                    state.answered = true;
                    var picked = q.choices[idx];

                    var el = document.querySelector('#dft-choices .gh-choice-btn[data-idx="' + idx + '"]');

                    if (picked === q.answer) {
                        /* 正确 */
                        H.updateGuide('答对了！你是三分法小达人！✅', 'dft-guide');
                        if (el) {
                            el.classList.add('dft-correct');
                        }
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 8);
                        }
                        /* 显示解析 */
                        var explainEl = document.getElementById('dft-explain');
                        if (explainEl) explainEl.style.display = 'block';

                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 1800);
                    } else {
                        /* 错误 */
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, el);
                        if (window.GameManager && window.GameManager.updateMastery) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        if (window.GameManager && window.GameManager.logError) {
                            window.GameManager.logError(state.levelData.levelId || 'g5_d_u8', q.text, picked);
                        }
                        /* 高亮正确答案 */
                        q.choices.forEach(function (c, ci) {
                            if (c === q.answer) {
                                var correctEl = document.querySelector('#dft-choices .gh-choice-btn[data-idx="' + ci + '"]');
                                if (correctEl) correctEl.classList.add('dft-correct');
                            }
                        });
                        /* 显示解析 */
                        var explainEl = document.getElementById('dft-explain');
                        if (explainEl) explainEl.style.display = 'block';

                        state.qIndex++;
                        setTimeout(function () { self.nextQuestion(); }, 2400);
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
                '你掌握了用天平三分法找次品的最优策略！⚖️',
                NEXT_LEVEL
            );
        }
    };

    /* ─────────────────── 注册模块 ─────────────────── */

    window.CurrentGameModule = game;
})();
