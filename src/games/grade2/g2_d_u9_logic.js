/**
 * 二年级下册 第九单元：数学广角——推理（Logic & Reasoning）
 * 路径: src/games/grade2/g2_d_u9_logic.js
 *
 * 玩法：逻辑侦探
 *   Phase 1 "猜图形": 线索排除法，如"不是三角形，不是圆形，是？"，
 *           3 轮，每轮 3 条线索，从剩余图形中推理出正确图形。
 *   Phase 2 "猜数字": 经典数字推理，如"比5大，比8小，是双数" → 6，
 *           3 轮，每轮 4 个选项。
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g2-d-u9-logic-styles';

    /* ═══════════════════ 数据 ═══════════════════ */

    /** Phase 1 图形池 */
    var SHAPES = [
        { emoji: '⭕', name: '圆形' },
        { emoji: '🔺', name: '三角形' },
        { emoji: '⬛', name: '正方形' },
        { emoji: '🔷', name: '菱形' },
        { emoji: '⭐', name: '五角星' },
        { emoji: '❤️', name: '爱心' },
        { emoji: '🔸', name: '小菱形' },
        { emoji: '💚', name: '绿心' }
    ];

    /**
     * Phase 1 题库 —— 每题 5 个图形候选，3 条排除线索，唯一答案
     */
    var SHAPE_PROBLEMS = [
        {
            candidates: ['⭕', '🔺', '⬛', '🔷', '⭐'],
            answer: '⭐',
            clues: ['不是圆形', '不是三角形', '不是正方形']
        },
        {
            candidates: ['⭕', '🔺', '⬛', '❤️', '🔷'],
            answer: '❤️',
            clues: ['不是圆形', '不是三角形', '不是正方形']
        },
        {
            candidates: ['⬛', '🔷', '⭐', '❤️', '🔸'],
            answer: '🔸',
            clues: ['不是正方形', '不是菱形', '不是五角星']
        },
        {
            candidates: ['⭕', '⭐', '❤️', '💚', '🔷'],
            answer: '💚',
            clues: ['不是圆形', '不是五角星', '不是爱心']
        },
        {
            candidates: ['🔺', '⬛', '🔷', '💚', '❤️'],
            answer: '💚',
            clues: ['不是三角形', '不是正方形', '不是菱形']
        },
        {
            candidates: ['⭕', '🔺', '⭐', '❤️', '🔸'],
            answer: '🔸',
            clues: ['不是圆形', '不是三角形', '不是五角星']
        },
        {
            candidates: ['⬛', '🔷', '⭐', '💚', '🔺'],
            answer: '🔺',
            clues: ['不是正方形', '不是菱形', '不是五角星']
        },
        {
            candidates: ['⭕', '🔷', '❤️', '💚', '⭐'],
            answer: '💚',
            clues: ['不是圆形', '不是菱形', '不是爱心']
        },
        {
            candidates: ['⭕', '⬛', '🔷', '❤️', '🔸'],
            answer: '🔸',
            clues: ['不是圆形', '不是正方形', '不是菱形']
        },
        {
            candidates: ['🔺', '⭐', '❤️', '💚', '⬛'],
            answer: '💚',
            clues: ['不是三角形', '不是五角星', '不是爱心']
        },
        {
            candidates: ['⭕', '🔺', '⬛', '⭐', '💚'],
            answer: '💚',
            clues: ['不是圆形', '不是三角形', '不是正方形']
        },
        {
            candidates: ['⭕', '🔷', '⭐', '❤️', '⬛'],
            answer: '⬛',
            clues: ['不是圆形', '不是菱形', '不是五角星']
        }
    ];

    /** Phase 2 数字推理题库 —— 4 个选项，唯一答案 */
    var NUM_PROBLEMS = [
        {
            answer: 6,
            clues: ['比5大', '比8小', '是双数'],
            options: [6, 7, 5, 9]
        },
        {
            answer: 4,
            clues: ['比2大', '比6小', '是单数加1'],
            options: [4, 3, 5, 2]
        },
        {
            answer: 3,
            clues: ['比1大', '比5小', '是单数'],
            options: [3, 2, 4, 5]
        },
        {
            answer: 8,
            clues: ['比6大', '比10小', '是双数'],
            options: [8, 7, 9, 6]
        },
        {
            answer: 7,
            clues: ['比5大', '比9小', '是单数'],
            options: [7, 6, 8, 9]
        },
        {
            answer: 9,
            clues: ['比7大', '比11小', '是单数'],
            options: [9, 8, 10, 7]
        },
        {
            answer: 2,
            clues: ['比0大', '比4小', '是双数'],
            options: [2, 1, 3, 4]
        },
        {
            answer: 5,
            clues: ['比3大', '比7小', '是单数'],
            options: [5, 4, 6, 3]
        },
        {
            answer: 10,
            clues: ['比8大', '比12小', '是双数'],
            options: [10, 9, 11, 8]
        },
        {
            answer: 1,
            clues: ['比0大', '比3小', '是单数'],
            options: [1, 2, 3, 0]
        },
        {
            answer: 6,
            clues: ['比4大', '比8小', '是双数'],
            options: [6, 5, 7, 4]
        },
        {
            answer: 8,
            clues: ['比6大', '比10小', '不是单数'],
            options: [8, 7, 9, 10]
        }
    ];

    /* ═══════════════════ 状态 ═══════════════════ */

    var state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        isFinished: false,
        // Phase 1
        p1Round: 0,
        p1TotalRounds: 3,
        p1Candidates: [],
        p1Clues: [],
        p1Answer: null,
        p1RevealedClues: 0,
        // Phase 2
        p2Round: 0,
        p2TotalRounds: 3,
        p2Answer: null,
        p2Options: [],
        p2Clues: []
    };

    /* ═══════════════════ 随机工具 ═══════════════════ */

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = H.randInt(0, i);
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    function pickShapeProblems() {
        var pool = shuffle(SHAPE_PROBLEMS);
        return pool.slice(0, state.p1TotalRounds);
    }

    function pickNumProblems() {
        var pool = shuffle(NUM_PROBLEMS);
        return pool.slice(0, state.p2TotalRounds);
    }

    /* ═══════════════════ CSS ═══════════════════ */

    function buildCSS() {
        return `
            .lgc-wrap {
                width:100%;height:100%;position:relative;overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background:linear-gradient(160deg,#eef2ff 0%,#e0e7ff 40%,#c7d2fe 100%);
                display:flex;flex-direction:column;align-items:center;
            }

            .lgc-phase{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:70px 16px 24px;}
            .lgc-phase.hidden{display:none;}

            .lgc-title{
                font-size:24px;font-weight:bold;color:#3730a3;
                text-shadow:0 2px 8px rgba(55,48,163,0.15);margin-bottom:2px;
            }
            .lgc-progress{
                font-size:17px;color:#4338ca;font-weight:bold;
                background:rgba(255,255,255,0.7);padding:4px 18px;border-radius:20px;
            }

            /* ── Phase 1 猜图形 ── */
            .lgc-clue-area{
                display:flex;flex-direction:column;align-items:center;gap:12px;
                min-height:130px;
            }
            .lgc-clue-box{
                background:rgba(255,255,255,0.85);border-radius:16px;
                padding:14px 28px;font-size:19px;color:#3730a3;font-weight:bold;
                box-shadow:0 3px 12px rgba(55,48,163,0.1);
                border-left:4px solid #818cf8;
                animation:lgc-slide-in .35s ease-out;
            }
            @keyframes lgc-slide-in{0%{opacity:0;transform:translateY(-10px)}100%{opacity:1;transform:translateY(0)}}

            .lgc-clue-label{
                font-size:14px;color:#6b7280;margin-bottom:2px;
            }

            .lgc-candidates{
                display:flex;gap:14px;flex-wrap:wrap;justify-content:center;
                max-width:460px;
            }
            .lgc-cand{
                width:80px;height:80px;background:#fff;border-radius:20px;
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                font-size:38px;box-shadow:0 5px 0 #c7d2fe;
                cursor:pointer;border:3px solid transparent;
                transition:all .18s;user-select:none;
            }
            .lgc-cand .lgc-cand-name{font-size:11px;color:#6b7280;margin-top:2px;}
            .lgc-cand:hover{transform:scale(1.08);border-color:#818cf8;box-shadow:0 7px 0 #a5b4fc;}
            .lgc-cand:active{transform:scale(0.95);box-shadow:0 2px 0 #a5b4fc;}
            .lgc-cand.eliminated{
                opacity:0.3;cursor:default;pointer-events:none;
                text-decoration:line-through;
            }

            .lgc-next-clue-btn{
                padding:12px 28px;background:#6366f1;color:#fff;border:none;
                border-radius:16px;font-size:18px;font-weight:bold;cursor:pointer;
                transition:all .2s;box-shadow:0 4px 0 #4338ca;
                margin-top:4px;
            }
            .lgc-next-clue-btn:hover{transform:translateY(-2px);box-shadow:0 6px 0 #4338ca;}
            .lgc-next-clue-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #4338ca;}

            /* ── Phase 2 猜数字 ── */
            .lgc-num-clue-area{
                display:flex;flex-direction:column;align-items:center;gap:10px;
                min-height:100px;
            }
            .lgc-num-clue{
                background:rgba(255,255,255,0.85);border-radius:14px;
                padding:10px 24px;font-size:19px;color:#3730a3;font-weight:bold;
                box-shadow:0 3px 10px rgba(55,48,163,0.1);
                border-left:4px solid #f59e0b;
                animation:lgc-slide-in .35s ease-out;
            }
            .lgc-num-clue-label{
                font-size:14px;color:#6b7280;
            }

            .lgc-num-options{
                display:flex;gap:14px;flex-wrap:wrap;justify-content:center;
            }
            .lgc-num-opt{
                width:76px;height:76px;background:#fff;border-radius:18px;
                display:flex;align-items:center;justify-content:center;
                font-size:34px;font-weight:bold;color:#1e293b;
                box-shadow:0 5px 0 #c7d2fe;border:3px solid transparent;
                cursor:pointer;transition:all .18s;user-select:none;
            }
            .lgc-num-opt:hover{transform:scale(1.1);border-color:#818cf8;box-shadow:0 7px 0 #a5b4fc;}
            .lgc-num-opt:active{transform:scale(0.95);box-shadow:0 2px 0 #a5b4fc;}

            /* 成功 / 错误反馈 */
            .lgc-correct{animation:lgc-ok .45s;}
            @keyframes lgc-ok{0%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}100%{box-shadow:0 0 0 18px rgba(16,185,129,0)}}

            .lgc-wrong{animation:lgc-shk .4s cubic-bezier(.36,.07,.19,.97) both;}
            @keyframes lgc-shk{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}

            /* 倒计时线索展示 */
            .lgc-clue-count{
                font-size:15px;color:#6b7280;margin-top:6px;
            }

            /* 正确答案高亮 */
            .lgc-cand.correct-highlight{
                border-color:#10b981;background:#d1fae5;
                box-shadow:0 5px 0 #10b981;
                transform:scale(1.1);
            }
            .lgc-num-opt.correct-highlight{
                border-color:#10b981;background:#d1fae5;
                box-shadow:0 5px 0 #10b981;
                transform:scale(1.1);
            }

            /* 转场提示 */
            .lgc-transition{
                position:absolute;top:0;left:0;width:100%;height:100%;
                display:flex;align-items:center;justify-content:center;
                background:rgba(238,242,255,0.95);z-index:100;
                font-size:28px;font-weight:bold;color:#4338ca;
                animation:lgc-fade-in .4s ease-out;
            }
            @keyframes lgc-fade-in{0%{opacity:0}100%{opacity:1}}
        `;
    }

    /* ═══════════════════ 渲染入口 ═══════════════════ */

    function render() {
        state.container.innerHTML = `
            <div class="lgc-wrap">
                ${H.guideBarHTML('🔍', '逻辑侦探——用线索找出答案！', 'gh-guide-text')}

                <!-- Phase 1: 猜图形 -->
                <div id="lgc-phase1" class="lgc-phase">
                    <div class="lgc-title" id="lgc-p1-title">🔍 猜图形</div>
                    <div class="lgc-clue-area" id="lgc-clue-area">
                        <div class="lgc-clue-label" id="lgc-clue-label">线索</div>
                    </div>
                    <div class="lgc-candidates" id="lgc-candidates"></div>
                    <div class="lgc-progress" id="lgc-p1-progress"></div>
                </div>

                <!-- Phase 2: 猜数字 -->
                <div id="lgc-phase2" class="lgc-phase hidden">
                    <div class="lgc-title" id="lgc-p2-title">🔢 猜数字</div>
                    <div class="lgc-num-clue-area" id="lgc-num-clue-area">
                        <div class="lgc-num-clue-label" id="lgc-num-clue-label">线索</div>
                    </div>
                    <div class="lgc-num-options" id="lgc-num-options"></div>
                    <div class="lgc-progress" id="lgc-p2-progress"></div>
                </div>
            </div>
        `;
    }

    /* ═══════════════════ Phase 1: 猜图形 ═══════════════════ */

    var p1Problems;

    function startPhase1() {
        state.phase = 1;
        state.p1Round = 0;
        p1Problems = pickShapeProblems();
        H.updateGuide('看看线索，用排除法找出正确的图形吧！');
        renderP1Round();
    }

    function renderP1Round() {
        if (state.p1Round >= state.p1TotalRounds) {
            startPhase2();
            return;
        }

        var prob = p1Problems[state.p1Round];
        state.p1Candidates = prob.candidates.slice();
        state.p1Clues = prob.clues;
        state.p1Answer = prob.answer;
        state.p1RevealedClues = 0;

        document.getElementById('lgc-p1-title').textContent =
            '🔍 猜图形（第 ' + (state.p1Round + 1) + '/' + state.p1TotalRounds + ' 题）';
        document.getElementById('lgc-p1-progress').textContent =
            '第 ' + (state.p1Round + 1) + ' / ' + state.p1TotalRounds + ' 题';

        // 渲染线索区
        var clueArea = document.getElementById('lgc-clue-area');
        clueArea.innerHTML = `
            <div class="lgc-clue-label" id="lgc-clue-label">读线索，找出正确的图形！</div>
            <div id="lgc-clues-shown"></div>
            <button class="lgc-next-clue-btn" id="lgc-clue-btn">看下一条线索</button>
        `;
        document.getElementById('lgc-clue-btn').onclick = revealNextClue;

        // 渲染候选图形
        renderCandidates();
    }

    function revealNextClue() {
        if (state.p1RevealedClues >= state.p1Clues.length) return;

        var clueText = state.p1Clues[state.p1RevealedClues];
        state.p1RevealedClues++;

        var shownArea = document.getElementById('lgc-clues-shown');
        var clueDiv = document.createElement('div');
        clueDiv.className = 'lgc-clue-box';
        clueDiv.textContent = '线索 ' + state.p1RevealedClues + '：' + clueText;
        shownArea.appendChild(clueDiv);

        // 根据线索自动排除已知不可能的图形
        applyElimination(clueText);

        // 更新按钮文字
        var btn = document.getElementById('lgc-clue-btn');
        if (state.p1RevealedClues >= state.p1Clues.length) {
            btn.textContent = '三条线索都看完啦，选出答案！';
            btn.style.display = 'none';
        } else {
            btn.textContent = '看下一条线索（' + (state.p1RevealedClues) + '/' + state.p1Clues.length + '）';
        }
    }

    function applyElimination(clue) {
        // 线索包含"不是XXX"，排除对应图形
        SHAPES.forEach(function (s) {
            if (clue.indexOf(s.name) !== -1) {
                // 标记该图形为已排除
                var candEls = document.querySelectorAll('#lgc-candidates .lgc-cand');
                candEls.forEach(function (el) {
                    if (el.getAttribute('data-name') === s.name && !el.classList.contains('eliminated')) {
                        el.classList.add('eliminated');
                        el.style.pointerEvents = 'none';
                    }
                });
            }
        });
    }

    function renderCandidates() {
        var candEl = document.getElementById('lgc-candidates');
        candEl.innerHTML = '';

        SHAPES.forEach(function (s) {
            var div = document.createElement('div');
            div.className = 'lgc-cand';
            div.setAttribute('data-name', s.name);
            div.innerHTML = s.emoji + '<span class="lgc-cand-name">' + s.name + '</span>';

            if (state.p1Candidates.indexOf(s.emoji) === -1) {
                div.classList.add('eliminated');
            }

            div.onclick = function () { handleShapeChoice(s.emoji, s.name, div); };
            candEl.appendChild(div);
        });
    }

    function handleShapeChoice(emoji, name, el) {
        if (el.classList.contains('eliminated')) return;

        if (emoji === state.p1Answer) {
            // 正确
            el.classList.add('lgc-correct', 'correct-highlight');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            state.p1Round++;
            setTimeout(function () { renderP1Round(); }, 700);
        } else {
            // 错误
            state.mistakes++;
            el.classList.add('lgc-wrong');
            H.triggerError(state.container, '不是这个哦，再看线索想想！', el);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '猜图形错误',
                    '答案:' + state.p1Answer + ' 选择了:' + emoji);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(function () { el.classList.remove('lgc-wrong'); }, 500);
        }
    }

    /* ═══════════════════ Phase 2: 猜数字 ═══════════════════ */

    var p2Problems;

    function startPhase2() {
        state.phase = 2;
        state.p2Round = 0;
        p2Problems = pickNumProblems();

        document.getElementById('lgc-phase1').classList.add('hidden');
        document.getElementById('lgc-phase2').classList.remove('hidden');

        H.updateGuide('根据线索猜数字，仔细想一想！');
        renderP2Round();
    }

    function renderP2Round() {
        if (state.p2Round >= state.p2TotalRounds) {
            finishGame();
            return;
        }

        var prob = p2Problems[state.p2Round];
        state.p2Answer = prob.answer;
        state.p2Options = prob.options.slice();
        state.p2Clues = prob.clues;

        document.getElementById('lgc-p2-title').textContent =
            '🔢 猜数字（第 ' + (state.p2Round + 1) + '/' + state.p2TotalRounds + ' 题）';
        document.getElementById('lgc-p2-progress').textContent =
            '第 ' + (state.p2Round + 1) + ' / ' + state.p2TotalRounds + ' 题';

        // 渲染线索区
        var clueArea = document.getElementById('lgc-num-clue-area');
        clueArea.innerHTML = `
            <div class="lgc-num-clue-label" id="lgc-num-clue-label">读线索，选出正确的数字！</div>
            <div id="lgc-num-clues-shown"></div>
            <button class="lgc-next-clue-btn" id="lgc-num-clue-btn">看下一条线索</button>
        `;
        document.getElementById('lgc-num-clue-btn').onclick = revealNextNumClue;

        // 渲染选项
        renderNumOptions();
    }

    var p2RevealedClues = 0;

    function revealNextNumClue() {
        if (p2RevealedClues >= state.p2Clues.length) return;

        var clueText = state.p2Clues[p2RevealedClues];
        p2RevealedClues++;

        var shownArea = document.getElementById('lgc-num-clues-shown');
        var clueDiv = document.createElement('div');
        clueDiv.className = 'lgc-num-clue';
        clueDiv.textContent = '线索 ' + p2RevealedClues + '：' + clueText;
        shownArea.appendChild(clueDiv);

        var btn = document.getElementById('lgc-num-clue-btn');
        if (p2RevealedClues >= state.p2Clues.length) {
            btn.textContent = '线索全部揭示，选答案吧！';
            btn.style.display = 'none';
        } else {
            btn.textContent = '看下一条线索（' + p2RevealedClues + '/' + state.p2Clues.length + '）';
        }
    }

    function renderNumOptions() {
        p2RevealedClues = 0;
        var optEl = document.getElementById('lgc-num-options');
        optEl.innerHTML = '';

        var shuffled = shuffle(state.p2Options);
        shuffled.forEach(function (num) {
            var btn = document.createElement('div');
            btn.className = 'lgc-num-opt';
            btn.textContent = num;
            btn.onclick = function () { handleNumChoice(num, btn); };
            optEl.appendChild(btn);
        });
    }

    function handleNumChoice(chosen, el) {
        if (chosen === state.p2Answer) {
            // 正确
            el.classList.add('lgc-correct', 'correct-highlight');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            state.p2Round++;
            setTimeout(function () { renderP2Round(); }, 700);
        } else {
            // 错误
            state.mistakes++;
            el.classList.add('lgc-wrong');
            H.triggerError(state.container, '不是这个数字哦，再看线索想想！', el);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '猜数字错误',
                    '答案:' + state.p2Answer + ' 选择了:' + chosen);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(function () { el.classList.remove('lgc-wrong'); }, 500);
        }
    }

    /* ═══════════════════ 结算 ═══════════════════ */

    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        var subtitle = state.mistakes === 0
            ? '太厉害了！你是逻辑侦探大师！'
            : state.mistakes <= 2
                ? '很棒！你的推理能力很强！'
                : '继续加油，多练习推理就会越来越棒！';
        H.showSettlement(state.container, state.levelData.reward || 25, state.levelData, state.mistakes, subtitle, null);
    }

    /* ═══════════════════ 入口 ═══════════════════ */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            // 重置状态
            state.phase = 1;
            state.mistakes = 0;
            state.isFinished = false;
            state.p1Round = 0;
            state.p2Round = 0;
            p2RevealedClues = 0;

            H.injectStyles(STYLE_ID, buildCSS());
            render();
            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
