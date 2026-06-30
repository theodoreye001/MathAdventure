/**
 * 一年级下册 第七单元：找规律（Pattern Recognition）- 下册补充
 * 路径: src/games/grade1/g1_d_u7_patterns.js
 *
 * 玩法：规律接龙
 *   Phase 1 图形规律: 展示图形序列，找出下一个（ABAB / ABCABC / AABB / ABBABB）
 *   Phase 2 数字规律: 展示数字序列，输入缺失数字（+2 / +5 / +10 等）
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u7-patterns-styles';

    /* ═══════════════════ 数据 ═══════════════════ */

    /** Phase 1 图形集：随机抽取构成序列 */
    const SHAPE_POOL = [
        { emoji: '🔴', name: '红球' },
        { emoji: '🔵', name: '蓝球' },
        { emoji: '🟢', name: '绿球' },
        { emoji: '🟡', name: '黄球' },
        { emoji: '🟣', name: '紫球' },
        { emoji: '⬛', name: '黑方' },
        { emoji: '⬜', name: '白方' },
        { emoji: '🔺', name: '三角' },
        { emoji: '🔶', name: '橙钻' },
        { emoji: '⭐', name: '星星' }
    ];

    /** Phase 2 数字规律题库模板 */
    const NUM_TEMPLATES = [
        // { start, step, count, label }
        { start: 2,  step: 2,  count: 6, label: '数2个数' },
        { start: 5,  step: 5,  count: 6, label: '数5个数' },
        { start: 10, step: 10, count: 6, label: '数10个数' },
        { start: 1,  step: 3,  count: 6, label: '数3个数' },
        { start: 3,  step: 4,  count: 6, label: '数4个数' },
        { start: 7,  step: 3,  count: 6, label: '每次加3' },
        { start: 4,  step: 6,  count: 6, label: '每次加6' },
        { start: 8,  step: 2,  count: 6, label: '每次加2' },
        { start: 10, step: 5,  count: 6, label: '每次加5' },
        { start: 20, step: 10, count: 6, label: '每次加10' }
    ];

    /* ═══════════════════ 游戏状态 ═══════════════════ */
    let state = {
        container: null,
        levelData: null,
        phase: 1,
        round: 0,
        mistakes: 0,
        totalRounds: 5,
        isFinished: false,
        // Phase 1 当前题目
        patternItems: [],
        patternAnswer: null,
        patternOptions: [],
        // Phase 2
        numAnswer: null,
        numSequence: [],
        numBlankIndex: -1
    };

    /* ═══════════════════ 序列生成 ═══════════════════ */

    /**
     * 生成图形规律序列
     * @returns {{ items: string[], answer: string, options: string[], type: string }}
     */
    function generatePatternProblem() {
        const types = ['ABAB', 'ABCABC', 'AABB', 'ABBABB'];
        const type = types[H.randInt(0, types.length - 1)];
        const shapes = H.shuffle(SHAPE_POOL);

        let pattern, seq, answer, options;

        switch (type) {
            case 'ABAB': {
                const a = shapes[0].emoji, b = shapes[1].emoji;
                seq = [a, b, a, b];
                answer = a;
                options = [a, b, shapes[2].emoji, shapes[3].emoji];
                break;
            }
            case 'ABCABC': {
                const a = shapes[0].emoji, b = shapes[1].emoji, c = shapes[2].emoji;
                seq = [a, b, c, a, b];
                answer = c;
                options = [a, b, c, shapes[3].emoji];
                break;
            }
            case 'AABB': {
                const a = shapes[0].emoji, b = shapes[1].emoji;
                seq = [a, a, b, b];
                answer = a;
                options = [a, b, shapes[2].emoji, shapes[3].emoji];
                break;
            }
            case 'ABBABB': {
                const a = shapes[0].emoji, b = shapes[1].emoji;
                seq = [a, b, b, a, b];
                answer = b;
                options = [a, b, shapes[2].emoji, shapes[3].emoji];
                break;
            }
        }

        return {
            items: seq,
            answer: answer,
            options: H.shuffle(options),
            type: type
        };
    }

    /**
     * 生成数字规律题目
     * @returns {{ sequence: number[], blankIndex: number, answer: number, options: number[] }}
     */
    function generateNumberProblem() {
        const t = NUM_TEMPLATES[H.randInt(0, NUM_TEMPLATES.length - 1)];
        const fullSeq = [];
        for (let i = 0; i < t.count; i++) {
            fullSeq.push(t.start + t.step * i);
        }
        // 空白放在中间位置 (index 2 或 3)
        const blankIdx = H.randInt(2, Math.min(3, fullSeq.length - 2));
        const answer = fullSeq[blankIdx];
        const seq = [...fullSeq];
        seq[blankIdx] = '_';

        // 生成干扰选项
        const distractors = new Set();
        distractors.add(answer);
        while (distractors.size < 4) {
            const offset = H.randInt(-3, 3);
            if (offset !== 0) {
                const d = answer + offset * t.step;
                if (d > 0 && d !== answer) distractors.add(d);
            }
        }
        const options = H.shuffle([...distractors]);

        return {
            sequence: seq,
            blankIndex: blankIdx,
            answer: answer,
            options: options
        };
    }

    /* ═══════════════════ CSS ═══════════════════ */

    function buildCSS() {
        return `
            .pat-wrap {
                width:100%;height:100%;position:relative;overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background:linear-gradient(160deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
                display:flex;flex-direction:column;align-items:center;
            }

            /* 引导栏 */
            .pat-guide {
                margin-top:16px;background:rgba(255,255,255,0.92);padding:10px 36px;
                border-radius:30px;box-shadow:0 4px 15px rgba(0,0,0,0.25);
                border:3px solid #fbbf24;font-size:21px;font-weight:bold;
                color:#1e293b;display:flex;align-items:center;gap:12px;z-index:50;
            }
            .pat-guide span.s2d-sprite{font-size:30px;animation:pat-float 2s infinite ease-in-out;}
            @keyframes pat-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

            /* 通用 */
            .pat-phase{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:10px 16px;}
            .pat-phase.hidden{display:none;}

            .pat-title{
                color:#fbbf24;font-size:24px;font-weight:bold;
                text-shadow:0 2px 8px rgba(251,191,36,0.3);margin-bottom:4px;
            }

            .pat-progress{
                font-size:18px;color:rgba(255,255,255,0.7);margin-top:4px;
            }

            /* ── 序列展示 ── */
            .pat-seq{
                display:flex;align-items:center;gap:10px;flex-wrap:wrap;
                justify-content:center;max-width:600px;
            }
            .pat-card{
                width:72px;height:72px;background:#fff;border-radius:18px;
                display:flex;align-items:center;justify-content:center;
                font-size:36px;box-shadow:0 6px 0 #cbd5e1;
                transition:transform .2s;
            }
            .pat-card.pat-blank{
                border:3px dashed #f59e0b;background:rgba(251,191,36,0.12);
                font-size:28px;color:#f59e0b;font-weight:bold;
                animation:pat-pulse 1.2s infinite;
            }
            @keyframes pat-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}

            .pat-arrow{font-size:24px;color:#64748b;}

            /* ── 选项 ── */
            .pat-options{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:10px;}
            .pat-opt{
                width:72px;height:72px;background:#fff;border-radius:18px;
                display:flex;align-items:center;justify-content:center;
                font-size:36px;box-shadow:0 6px 0 #cbd5e1;
                cursor:pointer;border:3px solid transparent;
                transition:all .18s;
            }
            .pat-opt:hover{transform:scale(1.1);border-color:#6366f1;box-shadow:0 8px 0 #94a3b8;}
            .pat-opt:active{transform:scale(0.95);box-shadow:0 2px 0 #94a3b8;}

            /* ── Phase 2 数字 ── */
            .pat-num-seq{
                display:flex;align-items:center;gap:8px;flex-wrap:wrap;
                justify-content:center;max-width:600px;
            }
            .pat-num-card{
                width:64px;height:64px;background:#fff;border-radius:16px;
                display:flex;align-items:center;justify-content:center;
                font-size:30px;font-weight:bold;color:#1e293b;
                box-shadow:0 5px 0 #cbd5e1;
            }
            .pat-num-blank{
                border:3px dashed #f59e0b;background:rgba(251,191,36,0.12);
                color:#f59e0b;font-size:28px;
                animation:pat-pulse 1.2s infinite;
            }
            .pat-num-arrow{font-size:20px;color:#64748b;}

            .pat-input-group{
                display:flex;align-items:center;gap:12px;margin-top:10px;
            }
            .pat-input{
                width:120px;height:56px;border:3px solid #6366f1;border-radius:16px;
                font-size:30px;font-weight:bold;text-align:center;color:#1e293b;
                outline:none;transition:border-color .2s;
            }
            .pat-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.25);}

            .pat-submit{
                padding:14px 36px;background:#10b981;color:#fff;border:none;
                border-radius:16px;font-size:22px;font-weight:bold;cursor:pointer;
                transition:all .2s;box-shadow:0 4px 0 #059669;
            }
            .pat-submit:hover{transform:translateY(-2px);box-shadow:0 6px 0 #059669;}
            .pat-submit:active{transform:translateY(2px);box-shadow:0 2px 0 #059669;}

            /* Phase 2 选项按钮 */
            .pat-num-options{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;}
            .pat-num-opt{
                padding:12px 28px;background:#fff;border:3px solid #6366f1;
                border-radius:16px;font-size:26px;font-weight:bold;color:#4338ca;
                cursor:pointer;transition:all .18s;
            }
            .pat-num-opt:hover{background:#6366f1;color:#fff;transform:scale(1.06);}

            /* 正确/错误反馈动画 */
            .pat-correct-flash{animation:pat-green .5s;}
            @keyframes pat-green{0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}100%{box-shadow:0 0 0 20px rgba(16,185,129,0)}}
            .pat-wrong-flash{animation:pat-red .5s;}
            @keyframes pat-red{0%{box-shadow:0 0 0 0 rgba(239,68,68,.6)}100%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}
        `;
    }

    /* ═══════════════════ 渲染 ═══════════════════ */

    function render() {
        state.container.innerHTML = `
            <div class="pat-wrap">
                ${H.guideBarHTML('🔗', '规律接龙——找出规律，接下去！', 'gh-guide-text')}

                <!-- Phase 1: 图形规律 -->
                <div id="pat-phase1" class="pat-phase">
                    <div class="pat-title" id="pat-phase1-title">图形规律</div>
                    <div id="pat-seq-display" class="pat-seq"></div>
                    <div id="pat-options" class="pat-options"></div>
                    <div class="pat-progress" id="pat-progress"></div>
                </div>

                <!-- Phase 2: 数字规律 -->
                <div id="pat-phase2" class="pat-phase pat-phase hidden">
                    <div class="pat-title" id="pat-phase2-title">数字规律</div>
                    <div id="pat-num-display" class="pat-num-seq"></div>
                    <div id="pat-num-options" class="pat-num-options"></div>
                    <div class="pat-progress" id="pat-num-progress"></div>
                </div>
            </div>
        `;
    }

    /* ═══════════════════ Phase 1: 图形规律 ═══════════════════ */

    function startPhase1() {
        state.phase = 1;
        state.round = 0;
        H.updateGuide('观察图形的排列规律，选出下一个！');
        renderPatternRound();
    }

    function renderPatternRound() {
        if (state.round >= state.totalRounds) {
            startPhase2();
            return;
        }

        const problem = generatePatternProblem();
        state.patternItems = problem.items;
        state.patternAnswer = problem.answer;
        state.patternOptions = problem.options;

        document.getElementById('pat-phase1-title').textContent =
            `图形规律 (第 ${state.round + 1}/${state.totalRounds} 题)`;
        document.getElementById('pat-progress').textContent =
            `第 ${state.round + 1} / ${state.totalRounds} 题`;

        // 渲染序列
        const seqEl = document.getElementById('pat-seq-display');
        let html = '';
        state.patternItems.forEach((emoji, i) => {
            html += `<div class="pat-card">${emoji}</div>`;
            if (i < state.patternItems.length - 1) {
                html += `<span class="pat-arrow">→</span>`;
            }
        });
        html += `<span class="pat-arrow">→</span><div class="pat-card pat-blank">?</div>`;
        seqEl.innerHTML = html;

        // 渲染选项
        const optEl = document.getElementById('pat-options');
        optEl.innerHTML = '';
        state.patternOptions.forEach((emoji, i) => {
            const btn = document.createElement('div');
            btn.className = 'pat-opt';
            btn.textContent = emoji;
            btn.setAttribute('data-emoji', emoji);
            btn.onclick = () => handlePatternChoice(emoji, btn);
            optEl.appendChild(btn);
        });
    }

    function handlePatternChoice(chosen, btnEl) {
        if (chosen === state.patternAnswer) {
            // 正确
            btnEl.classList.add('pat-correct-flash');
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            state.round++;
            setTimeout(() => renderPatternRound(), 500);
        } else {
            // 错误
            state.mistakes++;
            btnEl.classList.add('pat-wrong-flash');
            H.triggerError(state.container, '不是这个哦，再看看规律！', btnEl);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '图形规律错误',
                    `答案:${state.patternAnswer} 选择了:${chosen}`);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(() => btnEl.classList.remove('pat-wrong-flash'), 500);
        }
    }

    /* ═══════════════════ Phase 2: 数字规律 ═══════════════════ */

    function startPhase2() {
        state.phase = 2;
        state.round = 0;
        document.getElementById('pat-phase1').classList.add('hidden');
        document.getElementById('pat-phase2').classList.remove('hidden');
        H.updateGuide('观察数字的变化规律，填入缺失的数！');
        renderNumberRound();
    }

    function renderNumberRound() {
        if (state.round >= state.totalRounds) {
            finishGame();
            return;
        }

        const problem = generateNumberProblem();
        state.numAnswer = problem.answer;
        state.numSequence = problem.sequence;
        state.numBlankIndex = problem.blankIndex;

        document.getElementById('pat-phase2-title').textContent =
            `数字规律 (第 ${state.round + 1}/${state.totalRounds} 题)`;
        document.getElementById('pat-num-progress').textContent =
            `第 ${state.round + 1} / ${state.totalRounds} 题`;

        // 渲染数字序列
        const seqEl = document.getElementById('pat-num-display');
        let html = '';
        state.numSequence.forEach((num, i) => {
            if (num === '_') {
                html += `<div class="pat-num-card pat-num-blank">?</div>`;
            } else {
                html += `<div class="pat-num-card">${num}</div>`;
            }
            if (i < state.numSequence.length - 1) {
                html += `<span class="pat-num-arrow">→</span>`;
            }
        });
        seqEl.innerHTML = html;

        // 渲染选项按钮
        const optEl = document.getElementById('pat-num-options');
        optEl.innerHTML = '';
        problem.options.forEach(num => {
            const btn = document.createElement('button');
            btn.className = 'pat-num-opt';
            btn.textContent = num;
            btn.onclick = () => handleNumberChoice(num, btn);
            optEl.appendChild(btn);
        });
    }

    function handleNumberChoice(chosen, btnEl) {
        if (chosen === state.numAnswer) {
            // 正确 - 将空白填上
            btnEl.classList.add('pat-correct-flash');
            const blankCard = document.querySelector('.pat-num-blank');
            if (blankCard) {
                blankCard.textContent = state.numAnswer;
                blankCard.classList.remove('pat-num-blank');
                blankCard.style.color = '#10b981';
                blankCard.style.borderColor = '#10b981';
            }
            if (window.GameManager) window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            state.round++;
            setTimeout(() => renderNumberRound(), 800);
        } else {
            // 错误
            state.mistakes++;
            btnEl.classList.add('pat-wrong-flash');
            H.triggerError(state.container, `答案是 ${state.numAnswer}，再想想！`, btnEl);
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字规律错误',
                    `答案:${state.numAnswer} 选择了:${chosen}`);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(() => btnEl.classList.remove('pat-wrong-flash'), 500);
        }
    }

    /* ═══════════════════ 结算 ═══════════════════ */

    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        const subtitle = state.mistakes === 0
            ? '太厉害了！你发现了所有规律！'
            : state.mistakes <= 2
                ? '很棒！你掌握了大部分规律！'
                : '继续加油，多练习就能找到规律啦！';
        H.showSettlement(state.container, state.levelData.reward || 25, state.levelData, state.mistakes, subtitle, 'lvl_2_4_1');
    }

    /* ═══════════════════ 入口 ═══════════════════ */

    const game = {
        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            // 重置状态
            state.phase = 1;
            state.round = 0;
            state.mistakes = 0;
            state.isFinished = false;

            H.injectStyles(STYLE_ID, buildCSS());
            render();
            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
