/**
 * 二年级上册 第八单元：数学广角——搭配（一）(Simple Combinatorics)
 * 路径: src/games/grade2/g2_u8_combo.js
 *
 * 玩法：搭配魔法
 *   Phase 1 "衣服搭配": 3 件上衣 × 2 条裤子，找出全部 6 种搭配
 *   Phase 2 "数字搭配": 用 3 个数字组成不重复的两位数，4 轮
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u8-combo-styles';

    /* ═══════════════════ 数据 ═══════════════════ */

    const TOPS = [
        { emoji: '👔', name: '衬衫' },
        { emoji: '🧥', name: '外套' },
        { emoji: '👕', name: 'T恤' }
    ];
    const PANTS = [
        { emoji: '👖', name: '牛仔裤' },
        { emoji: '👗', name: '裙子' }
    ];

    /** Phase 2 数字轮次题库 —— 每轮 3 个不同数字 */
    const DIGIT_SETS = [
        [1, 2, 3],
        [2, 5, 7],
        [3, 4, 8],
        [1, 6, 9],
        [4, 5, 6],
        [2, 3, 9],
        [1, 4, 7],
        [5, 8, 9]
    ];

    /* ═══════════════════ 状态 ═══════════════════ */

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        isFinished: false,
        // Phase 1
        selTop: -1,
        selPant: -1,
        foundPairs: [],   // [{topIdx, pantIdx}]
        totalPairs: TOPS.length * PANTS.length,
        // Phase 2
        p2Round: 0,
        p2TotalRounds: 4,
        p2Digits: [],
        p2Found: [],      // 已找出的两位数 (string[])
        p2Answered: []    // 每轮找到的个数，用于最终统计
    };

    /* ═══════════════════ CSS ═══════════════════ */

    function buildCSS() {
        return `
            .cmb-wrap {
                width:100%;height:100%;position:relative;overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background:linear-gradient(160deg,#fdf2f8 0%,#fce7f3 40%,#fbcfe8 100%);
                display:flex;flex-direction:column;align-items:center;
            }

            .cmb-phase{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:70px 16px 24px;}
            .cmb-phase.hidden{display:none;}

            .cmb-title{
                font-size:24px;font-weight:bold;color:#9d174d;
                text-shadow:0 2px 8px rgba(157,23,77,0.15);margin-bottom:2px;
            }
            .cmb-progress{
                font-size:17px;color:#be185d;font-weight:bold;
                background:rgba(255,255,255,0.7);padding:4px 18px;border-radius:20px;
            }

            /* ── Phase 1 衣服搭配 ── */
            .cmb-closet{
                display:flex;gap:40px;align-items:flex-start;justify-content:center;
                flex-wrap:wrap;
            }
            .cmb-col{display:flex;flex-direction:column;align-items:center;gap:12px;}
            .cmb-col-label{font-size:16px;color:#9d174d;font-weight:bold;margin-bottom:4px;}

            .cmb-item{
                width:80px;height:80px;background:#fff;border-radius:20px;
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                font-size:40px;box-shadow:0 5px 0 #e9d5ff;
                cursor:pointer;border:3px solid transparent;
                transition:all .18s;user-select:none;
            }
            .cmb-item .cmb-item-name{font-size:11px;color:#6b7280;margin-top:2px;}
            .cmb-item:hover{transform:scale(1.08);border-color:#c084fc;box-shadow:0 7px 0 #d8b4fe;}
            .cmb-item:active{transform:scale(0.95);box-shadow:0 2px 0 #d8b4fe;}
            .cmb-item.selected{
                border-color:#a855f7;background:#faf5ff;
                box-shadow:0 5px 0 #a855f7;transform:scale(1.05);
            }
            .cmb-item.done{
                opacity:0.45;cursor:default;pointer-events:none;
            }

            .cmb-plus{
                font-size:36px;color:#c084fc;font-weight:bold;
                align-self:center;margin-top:20px;
            }

            .cmb-pair-hint{
                font-size:16px;color:#be185d;
                min-height:28px;text-align:center;
            }

            /* 已找到的搭配列表 */
            .cmb-found{
                display:flex;flex-wrap:wrap;gap:8px;justify-content:center;
                max-width:500px;min-height:48px;
            }
            .cmb-found-chip{
                background:#fff;border:2px solid #f0abfc;border-radius:14px;
                padding:6px 14px;font-size:18px;color:#9333ea;font-weight:bold;
                display:flex;align-items:center;gap:6px;
                animation:cmb-pop .3s ease-out;
            }
            @keyframes cmb-pop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}

            .cmb-arrow{font-size:20px;color:#d946ef;}

            /* ── Phase 2 数字搭配 ── */
            .cmb-digits{
                display:flex;gap:16px;justify-content:center;flex-wrap:wrap;
            }
            .cmb-digit-card{
                width:72px;height:72px;background:#fff;border-radius:18px;
                display:flex;align-items:center;justify-content:center;
                font-size:36px;font-weight:bold;color:#1e293b;
                box-shadow:0 5px 0 #c7d2fe;border:3px solid transparent;
                transition:all .18s;user-select:none;
            }
            .cmb-digit-card.used{
                border-color:#a855f7;background:#faf5ff;
                opacity:0.6;
            }

            .cmb-input-row{
                display:flex;align-items:center;gap:12px;margin-top:6px;
            }
            .cmb-digit-input{
                width:140px;height:56px;border:3px solid #c084fc;border-radius:16px;
                font-size:32px;font-weight:bold;text-align:center;color:#1e293b;
                outline:none;transition:border-color .2s;background:#fff;
            }
            .cmb-digit-input:focus{border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,0.2);}

            .cmb-submit-btn{
                padding:14px 30px;background:#a855f7;color:#fff;border:none;
                border-radius:16px;font-size:20px;font-weight:bold;cursor:pointer;
                transition:all .2s;box-shadow:0 4px 0 #7e22ce;
            }
            .cmb-submit-btn:hover{transform:translateY(-2px);box-shadow:0 6px 0 #7e22ce;}
            .cmb-submit-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #7e22ce;}

            .cmb-found-nums{
                display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
                max-width:460px;min-height:44px;
            }
            .cmb-num-chip{
                background:#fff;border:2px solid #c084fc;border-radius:14px;
                padding:8px 18px;font-size:24px;font-weight:bold;color:#7e22ce;
                animation:cmb-pop .3s ease-out;
            }

            .cmb-tip{
                font-size:15px;color:#9ca3af;margin-top:4px;text-align:center;max-width:360px;
            }

            /* 按钮提交后的快速选择面板 */
            .cmb-quick-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px;}
            .cmb-quick-btn{
                width:56px;height:56px;background:#fff;border:2px solid #e9d5ff;
                border-radius:14px;font-size:26px;font-weight:bold;color:#7e22ce;
                cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;
            }
            .cmb-quick-btn:hover{background:#f3e8ff;border-color:#a855f7;transform:scale(1.1);}

            /* 错误抖动 */
            .cmb-shake{animation:cmb-shk .4s cubic-bezier(.36,.07,.19,.97) both;}
            @keyframes cmb-shk{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}

            /* 成功闪光 */
            .cmb-ok-flash{animation:cmb-ok .45s;}
            @keyframes cmb-ok{0%{box-shadow:0 0 0 0 rgba(168,85,247,.5)}100%{box-shadow:0 0 0 18px rgba(168,85,247,0)}}
        `;
    }

    /* ═══════════════════ 渲染入口 ═══════════════════ */

    function render() {
        state.container.innerHTML = `
            <div class="cmb-wrap">
                ${H.guideBarHTML('👗', '搭配魔法——找出所有搭配！', 'gh-guide-text')}

                <!-- Phase 1 -->
                <div id="cmb-phase1" class="cmb-phase">
                    <div class="cmb-title" id="cmb-p1-title">👗 衣服搭配</div>
                    <div class="cmb-pair-hint" id="cmb-pair-hint">点击一件上衣，再点一条裤子，组成搭配！</div>
                    <div class="cmb-closet" id="cmb-closet"></div>
                    <div class="cmb-progress" id="cmb-p1-progress">已找到 0 / ${state.totalPairs} 种</div>
                    <div class="cmb-found" id="cmb-p1-found"></div>
                </div>

                <!-- Phase 2 -->
                <div id="cmb-phase2" class="cmb-phase hidden">
                    <div class="cmb-title" id="cmb-p2-title">🔢 数字搭配</div>
                    <div class="cmb-pair-hint" id="cmb-p2-hint">用下面的数字组成两位数（十位和个位不能相同）</div>
                    <div class="cmb-digits" id="cmb-digits"></div>
                    <div class="cmb-input-row">
                        <input type="number" class="cmb-digit-input" id="cmb-num-input" placeholder="?" min="10" max="99">
                        <button class="cmb-submit-btn" id="cmb-num-submit">确定</button>
                    </div>
                    <div class="cmb-quick-row" id="cmb-quick-row"></div>
                    <div class="cmb-progress" id="cmb-p2-progress"></div>
                    <div class="cmb-found-nums" id="cmb-p2-found"></div>
                    <div class="cmb-tip" id="cmb-p2-tip">💡 提示：按顺序选，先固定十位，再选个位，就不容易漏啦！</div>
                </div>
            </div>
        `;
    }

    /* ═══════════════════ Phase 1: 衣服搭配 ═══════════════════ */

    function startPhase1() {
        state.phase = 1;
        state.selTop = -1;
        state.selPant = -1;
        state.foundPairs = [];
        H.updateGuide('点击一件上衣👕，再点击一条裤子👖，试试看有多少种搭配！');
        renderCloset();
    }

    function renderCloset() {
        const closet = document.getElementById('cmb-closet');
        if (!closet) return;

        const foundSet = new Set(state.foundPairs.map(p => p.topIdx + '-' + p.pantIdx));

        let html = `
            <div class="cmb-col">
                <div class="cmb-col-label">上衣 👕</div>
                ${TOPS.map((t, i) => {
                    const allFound = TOPS.every((_, ti) =>
                        PANTS.every((_, pi) => foundSet.has(ti + '-' + pi))
                    );
                    const cls = state.selTop === i ? ' selected' : (allFound ? '' : '');
                    // 标记所有搭配都已找到的上衣
                    const topDone = PANTS.every((_, pi) => foundSet.has(i + '-' + pi));
                    return `<div class="cmb-item${topDone ? ' done' : ''}${state.selTop === i ? ' selected' : ''}" data-role="top" data-idx="${i}">
                        ${t.emoji}<span class="cmb-item-name">${t.name}</span>
                    </div>`;
                }).join('')}
            </div>
            <span class="cmb-plus">+</span>
            <div class="cmb-col">
                <div class="cmb-col-label">裤子 👖</div>
                ${PANTS.map((p, i) => {
                    const pantDone = TOPS.every((_, ti) => foundSet.has(ti + '-' + i));
                    return `<div class="cmb-item${pantDone ? ' done' : ''}${state.selPant === i ? ' selected' : ''}" data-role="pant" data-idx="${i}">
                        ${p.emoji}<span class="cmb-item-name">${p.name}</span>
                    </div>`;
                }).join('')}
            </div>
        `;
        closet.innerHTML = html;

        // 绑定点击
        closet.querySelectorAll('.cmb-item:not(.done)').forEach(el => {
            el.onclick = () => handleClosetItem(el);
        });

        updateP1Progress();
    }

    function handleClosetItem(el) {
        const role = el.getAttribute('data-role');
        const idx = parseInt(el.getAttribute('data-idx'));

        if (role === 'top') {
            state.selTop = idx;
        } else {
            state.selPant = idx;
        }

        // 高亮当前选择
        document.querySelectorAll('#cmb-closet .cmb-item').forEach(e => {
            if (!e.classList.contains('done')) e.classList.remove('selected');
        });
        if (state.selTop >= 0) {
            const topEl = document.querySelector(`#cmb-closet .cmb-item[data-role="top"][data-idx="${state.selTop}"]`);
            if (topEl && !topEl.classList.contains('done')) topEl.classList.add('selected');
        }
        if (state.selPant >= 0) {
            const pantEl = document.querySelector(`#cmb-closet .cmb-item[data-role="pant"][data-idx="${state.selPant}"]`);
            if (pantEl && !pantEl.classList.contains('done')) pantEl.classList.add('selected');
        }

        // 两件都选了 → 检查搭配
        if (state.selTop >= 0 && state.selPant >= 0) {
            tryPair();
        }
    }

    function tryPair() {
        const key = state.selTop + '-' + state.selPant;
        const hintEl = document.getElementById('cmb-pair-hint');

        const already = state.foundPairs.some(p => p.topIdx === state.selTop && p.pantIdx === state.selPant);
        if (already) {
            hintEl.textContent = '这对已经找过啦，换一个试试！';
            hintEl.style.color = '#f59e0b';
            setTimeout(() => { hintEl.textContent = '继续找其他搭配吧！'; hintEl.style.color = '#be185d'; }, 1500);
            state.selTop = -1;
            state.selPant = -1;
            renderCloset();
            return;
        }

        // 新搭配！
        state.foundPairs.push({ topIdx: state.selTop, pantIdx: state.selPant });

        const topName = TOPS[state.selTop].name;
        const pantName = PANTS[state.selPant].name;
        hintEl.textContent = `✅ 找到新搭配：${topName} + ${pantName}`;
        hintEl.style.color = '#10b981';

        if (window.GameManager) {
            window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
        }

        renderFoundChips();
        state.selTop = -1;
        state.selPant = -1;

        setTimeout(() => {
            renderCloset();
            if (state.foundPairs.length >= state.totalPairs) {
                hintEl.textContent = '🎉 太棒了！全部搭配都找到了！';
                hintEl.style.color = '#a855f7';
                setTimeout(() => startPhase2(), 1500);
            } else {
                hintEl.textContent = '继续找其他搭配吧！';
                hintEl.style.color = '#be185d';
            }
        }, 600);
    }

    function renderFoundChips() {
        const el = document.getElementById('cmb-p1-found');
        if (!el) return;
        el.innerHTML = state.foundPairs.map(p =>
            `<div class="cmb-found-chip">${TOPS[p.topIdx].emoji}${PANTS[p.pantIdx].emoji}</div>`
        ).join('');
    }

    function updateP1Progress() {
        const el = document.getElementById('cmb-p1-progress');
        if (el) el.textContent = `已找到 ${state.foundPairs.length} / ${state.totalPairs} 种`;
    }

    /* ═══════════════════ Phase 2: 数字搭配 ═══════════════════ */

    function startPhase2() {
        state.phase = 2;
        state.p2Round = 0;
        state.p2Answered = [];

        document.getElementById('cmb-phase1').classList.add('hidden');
        document.getElementById('cmb-phase2').classList.remove('hidden');

        H.updateGuide('用数字卡片组成两位数，每个数只能用一次哦！');
        loadP2Round();
    }

    function loadP2Round() {
        if (state.p2Round >= state.p2TotalRounds) {
            finishGame();
            return;
        }

        // 随机选一组不重复的数字集合
        const pool = DIGIT_SETS.filter(ds =>
            !state.p2Answered.some(a => a.digits.join('') === ds.join(''))
        );
        state.p2Digits = pool.length > 0
            ? pool[H.randInt(0, pool.length - 1)]
            : DIGIT_SETS[H.randInt(0, DIGIT_SETS.length - 1)];

        // 计算所有可能的两位数
        state.p2Found = [];

        document.getElementById('cmb-p2-title').textContent =
            `🔢 数字搭配（第 ${state.p2Round + 1}/${state.p2TotalRounds} 轮）`;
        document.getElementById('cmb-p2-hint').textContent =
            `用 ${state.p2Digits.join('、')} 这三个数字组成两位数`;

        renderP2Digits();
        renderP2Found();
        updateP2Progress();

        // 清空输入
        const input = document.getElementById('cmb-num-input');
        if (input) { input.value = ''; input.disabled = false; }
        const submitBtn = document.getElementById('cmb-num-submit');
        if (submitBtn) submitBtn.disabled = false;

        // 渲染快速选择按钮
        renderP2QuickBtns();
    }

    function renderP2Digits() {
        const el = document.getElementById('cmb-digits');
        if (!el) return;
        el.innerHTML = state.p2Digits.map(d =>
            `<div class="cmb-digit-card" data-digit="${d}">${d}</div>`
        ).join('');
    }

    function renderP2QuickBtns() {
        const el = document.getElementById('cmb-quick-row');
        if (!el) return;
        // 显示所有可能的两位数组合作为快捷按钮
        const allNums = getAllPossibleNums(state.p2Digits);
        el.innerHTML = allNums.map(n =>
            `<button class="cmb-quick-btn" data-num="${n}">${n}</button>`
        ).join('');

        el.querySelectorAll('.cmb-quick-btn').forEach(btn => {
            btn.onclick = () => submitP2Answer(btn.getAttribute('data-num'), btn);
        });
    }

    /** 获取所有可能的两位数排列 */
    function getAllPossibleNums(digits) {
        const nums = [];
        for (let i = 0; i < digits.length; i++) {
            for (let j = 0; j < digits.length; j++) {
                if (i !== j) {
                    nums.push(String(digits[i]) + String(digits[j]));
                }
            }
        }
        return nums.sort();
    }

    function submitP2Answer(val, btnEl) {
        if (state.phase !== 2) return;
        val = String(val).trim();
        const input = document.getElementById('cmb-num-input');

        // 验证格式
        if (val.length !== 2 || isNaN(val)) {
            if (input) {
                input.classList.add('cmb-shake');
                setTimeout(() => input.classList.remove('cmb-shake'), 400);
            }
            return;
        }

        const d1 = parseInt(val[0]);
        const d2 = parseInt(val[1]);

        // 检查是否在可用数字中
        if (!state.p2Digits.includes(d1) || !state.p2Digits.includes(d2)) {
            state.mistakes++;
            const hintEl = document.getElementById('cmb-p2-hint');
            hintEl.textContent = '⚠️ 只能用给定的数字哦！';
            hintEl.style.color = '#ef4444';
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字搭配-数字不在范围内', val, state.p2Digits.join(','));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(() => {
                hintEl.textContent = `用 ${state.p2Digits.join('、')} 这三个数字组成两位数`;
                hintEl.style.color = '#be185d';
            }, 1500);
            if (input) input.value = '';
            return;
        }

        // 检查十位和个位是否相同
        if (d1 === d2) {
            state.mistakes++;
            const hintEl = document.getElementById('cmb-p2-hint');
            hintEl.textContent = '⚠️ 十位和个位不能用同一个数字！';
            hintEl.style.color = '#ef4444';
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字搭配-重复数字', val, '十位个位不同');
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(() => {
                hintEl.textContent = `用 ${state.p2Digits.join('、')} 这三个数字组成两位数`;
                hintEl.style.color = '#be185d';
            }, 1500);
            if (input) input.value = '';
            return;
        }

        // 检查是否已经找到
        if (state.p2Found.includes(val)) {
            const hintEl = document.getElementById('cmb-p2-hint');
            hintEl.textContent = `💡 ${val} 已经找过了，试试别的！`;
            hintEl.style.color = '#f59e0b';
            setTimeout(() => {
                hintEl.textContent = `用 ${state.p2Digits.join('、')} 这三个数字组成两位数`;
                hintEl.style.color = '#be185d';
            }, 1200);
            if (input) input.value = '';
            return;
        }

        // 正确！
        state.p2Found.push(val);
        if (btnEl) btnEl.classList.add('cmb-ok-flash');
        if (input) input.value = '';

        renderP2Found();
        updateP2Progress();

        if (window.GameManager) {
            window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
        }

        const total = getAllPossibleNums(state.p2Digits).length;
        const hintEl = document.getElementById('cmb-p2-hint');
        if (state.p2Found.length >= total) {
            hintEl.textContent = `🎉 太厉害了！找到了全部 ${total} 个两位数！`;
            hintEl.style.color = '#a855f7';
            state.p2Answered.push({ digits: [...state.p2Digits], count: state.p2Found.length, total: total });

            setTimeout(() => {
                state.p2Round++;
                loadP2Round();
            }, 1800);
        } else {
            hintEl.textContent = `找到 ${state.p2Found.length}/${total} 个，继续加油！`;
            hintEl.style.color = '#10b981';
        }
    }

    function renderP2Found() {
        const el = document.getElementById('cmb-p2-found');
        if (!el) return;
        el.innerHTML = state.p2Found.sort().map(n =>
            `<div class="cmb-num-chip">${n}</div>`
        ).join('');
    }

    function updateP2Progress() {
        const total = getAllPossibleNums(state.p2Digits).length;
        const el = document.getElementById('cmb-p2-progress');
        if (el) el.textContent = `已找到 ${state.p2Found.length} / ${total} 个`;
    }

    /* ═══════════════════ 结算 ═══════════════════ */

    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        const subtitle = state.mistakes === 0
            ? '太厉害了！你是搭配小达人！'
            : state.mistakes <= 3
                ? '很棒！你掌握了搭配的秘诀！'
                : '继续加油，按顺序找就不容易漏啦！';
        H.showSettlement(state.container, state.levelData.reward || 25, state.levelData, state.mistakes, subtitle, 'lvl_2_d_1');
    }

    /* ═══════════════════ 入口 ═══════════════════ */

    const game = {
        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            state.phase = 1;
            state.mistakes = 0;
            state.isFinished = false;
            state.selTop = -1;
            state.selPant = -1;
            state.foundPairs = [];
            state.p2Round = 0;
            state.p2Found = [];
            state.p2Answered = [];

            H.injectStyles(STYLE_ID, buildCSS());
            render();
            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
