/**
 * 二年级下册 第六单元：有余数的除法
 * 路径: src/games/grade2/g2_d_u6_remainder.js
 *
 * 余数密码 - 两阶段玩法：
 *   Phase 1 "动手分"：展示物品和盘子，玩家逐个分发，直观看到余数
 *   Phase 2 "余数计算"：输入商和余数，含"余数必须比除数小"校验
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g2-d-u6-rem-styles';

    /* ==================== 题目配置 ==================== */

    var PHASE1_ROUNDS = [
        { total: 13, divisor: 4, emoji: '🍪', divisorLabel: '盘子', itemLabel: '饼干' },
        { total: 17, divisor: 5, emoji: '🍒', divisorLabel: '盘子', itemLabel: '草莓' },
        { total: 23, divisor: 6, emoji: '⭐', divisorLabel: '盒子', itemLabel: '星星糖' }
    ];

    var PHASE2_ROUNDS = [
        { dividend: 17, divisor: 5 },
        { dividend: 22, divisor: 6 },
        { dividend: 29, divisor: 7 },
        { dividend: 35, divisor: 8 },
        { dividend: 19, divisor: 4 }
    ];

    /* ==================== 内部状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 1,

        // Phase 1
        p1Step: 0,
        p1Distributed: 0,   // 已分发的物品数
        p1PlateCounts: [],   // 每个盘子当前数量
        p1Locked: false,

        // Phase 2
        p2Step: 0,
        p2Rounds: []
    };

    /* ==================== 主模块 ==================== */

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || {
                reward: 25,
                knowledgePoint: '有余数的除法',
                levelId: 'lvl_2_d_6'
            };
            if (!state.container) return;

            injectStyles();
            state.phase = 1;
            state.p1Step = 0;
            state.mistakes = 0;
            state.p2Rounds = buildPhase2Rounds();

            renderLayout();
            startPhase1Round();
        }
    };

    /* ==================== Phase 2 题目生成 ==================== */

    function buildPhase2Rounds() {
        return H.shuffle(PHASE2_ROUNDS).map(function (q) {
            return {
                dividend: q.dividend,
                divisor: q.divisor,
                quotient: Math.floor(q.dividend / q.divisor),
                remainder: q.dividend % q.divisor
            };
        });
    }

    /* ==================== 布局渲染 ==================== */

    function renderLayout() {
        state.container.innerHTML =
            '<div class="rem-wrap">' +
                '<div class="rem-banner" id="rem-banner"><div class="rem-banner-inner" id="rem-banner-inner"></div></div>' +
                '<div class="rem-guide">' +
                    '<span class="rem-guide-spr">🌟</span>' +
                    '<span id="rem-guide-text"></span>' +
                '</div>' +
                '<div class="rem-progress" id="rem-progress"></div>' +
                '<div class="rem-phase active" id="rem-phase1">' +
                    '<div class="rem-distribute-area" id="rem-distribute-area"></div>' +
                '</div>' +
                '<div class="rem-phase" id="rem-phase2">' +
                    '<div class="rem-calc-area" id="rem-calc-area"></div>' +
                '</div>' +
            '</div>';
    }

    /* ==================== Phase 1：动手分 ==================== */

    function startPhase1Round() {
        state.phase = 1;
        var round = PHASE1_ROUNDS[state.p1Step];
        if (!round) {
            showPhaseBanner();
            return;
        }

        state.p1Distributed = 0;
        state.p1PlateCounts = [];
        for (var i = 0; i < round.divisor; i++) {
            state.p1PlateCounts.push(0);
        }
        state.p1Locked = false;

        H.updateGuide('rem-guide-text', round.itemLabel + ' ' + round.emoji + ' 共 ' + round.total +
            ' 个，分到 ' + round.divisor + ' 个' + round.divisorLabel + '里，点击分发吧！');
        updateProgress();
        renderDistributeArea(round);
    }

    function renderDistributeArea(round) {
        var area = document.getElementById('rem-distribute-area');
        if (!area) return;

        var remaining = round.total - state.p1Distributed;

        // 物品区
        var itemsHTML = '';
        for (var i = 0; i < remaining; i++) {
            itemsHTML += '<span class="rem-item" data-idx="' + i + '">' + round.emoji + '</span>';
        }

        // 盘子区
        var platesHTML = '';
        for (var p = 0; p < round.divisor; p++) {
            var plateItems = '';
            var count = state.p1PlateCounts[p];
            for (var j = 0; j < count; j++) {
                plateItems += '<span class="rem-plate-item">' + round.emoji + '</span>';
            }
            platesHTML +=
                '<div class="rem-plate">' +
                    '<div class="rem-plate-label">' + round.divisorLabel + (p + 1) + '</div>' +
                    '<div class="rem-plate-items">' + (plateItems || '<span class="rem-plate-empty">空</span>') + '</div>' +
                    '<div class="rem-plate-count">' + count + ' 个</div>' +
                '</div>';
        }

        area.innerHTML =
            '<div class="rem-card">' +
                '<div class="rem-card-title">' + round.emoji + ' ' + round.itemLabel +
                    '（共 ' + round.total + ' 个，已分 ' + state.p1Distributed + ' 个）</div>' +
                '<div class="rem-items-pool" id="rem-items-pool">' +
                    (itemsHTML || '<span class="rem-all-done">全部分完了！</span>') +
                '</div>' +
            '</div>' +
            '<div class="rem-plates-row" id="rem-plates-row">' + platesHTML + '</div>' +
            '<div class="rem-remainder-box" id="rem-remainder-box" style="display:none;"></div>';

        // 绑定物品点击
        if (remaining > 0) {
            bindItemClicks(round);
        } else {
            // 全部分完，展示结果
            showDistributeResult(round);
        }
    }

    function bindItemClicks(round) {
        var pool = document.getElementById('rem-items-pool');
        if (!pool) return;

        pool.querySelectorAll('.rem-item').forEach(function (el) {
            el.addEventListener('click', function () {
                if (state.p1Locked) return;
                distributeOne(round, el);
            });
        });
    }

    function distributeOne(round, itemEl) {
        state.p1Locked = true;

        // 动画：物品飞向盘子
        var plateIdx = state.p1Distributed % round.divisor;
        var plateEl = document.querySelectorAll('.rem-plate')[plateIdx];

        itemEl.classList.add('rem-item-fly');
        if (plateEl) {
            var rect = plateEl.getBoundingClientRect();
            itemEl.style.setProperty('--fly-x', (rect.left + rect.width / 2 - itemEl.getBoundingClientRect().left) + 'px');
            itemEl.style.setProperty('--fly-y', (rect.top + rect.height / 2 - itemEl.getBoundingClientRect().top) + 'px');
        }

        setTimeout(function () {
            state.p1PlateCounts[plateIdx]++;
            state.p1Distributed++;

            var remaining = round.total - state.p1Distributed;
            if (remaining % round.divisor === 0 && remaining > 0) {
                H.updateGuide('rem-guide-text',
                    round.emoji + ' 还剩 ' + remaining + ' 个，继续分！');
            } else if (remaining === 0) {
                H.updateGuide('rem-guide-text', '全部分完了！看看结果吧~');
            }

            renderDistributeArea(round);
        }, 350);
    }

    function showDistributeResult(round) {
        var quotient = Math.floor(round.total / round.divisor);
        var remainder = round.total % round.divisor;

        var box = document.getElementById('rem-remainder-box');
        if (!box) return;

        var remainText = remainder > 0
            ? '还剩下 <strong>' + remainder + '</strong> ' + round.emoji + ' 不够再分一组'
            : '刚好分完，没有剩余！';

        box.style.display = '';
        box.innerHTML =
            '<div class="rem-result-card">' +
                '<div class="rem-result-eq">' + round.total + ' ÷ ' + round.divisor + ' = ' + quotient +
                    (remainder > 0 ? ' ...... ' + remainder : '') + '</div>' +
                '<div class="rem-result-desc">' +
                    '每' + round.divisorLabel + ' ' + quotient + ' 个' + round.itemLabel +
                    (remainder > 0 ? '，多出 ' + remainder + ' 个' + round.itemLabel : '') +
                '</div>' +
                '<div class="rem-result-remain">' + remainText + '</div>' +
                '<button class="rem-btn-next" id="rem-btn-p1-next">继续</button>' +
            '</div>';

        var nextBtn = document.getElementById('rem-btn-p1-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                state.p1Step++;
                startPhase1Round();
            });
        }
    }

    /* ==================== 阶段切换 ==================== */

    function showPhaseBanner() {
        var banner = document.getElementById('rem-banner');
        var inner = document.getElementById('rem-banner-inner');
        inner.innerHTML = '<h2>💡 第二关：余数计算</h2><p>算出商和余数，挑战开始！</p>';
        banner.classList.add('show');

        setTimeout(function () {
            banner.classList.remove('show');
            startPhase2();
        }, 1500);
    }

    /* ==================== Phase 2：余数计算 ==================== */

    function startPhase2() {
        state.phase = 2;
        state.p2Step = 0;

        document.getElementById('rem-phase1').classList.remove('active');
        document.getElementById('rem-phase2').classList.add('active');

        H.updateGuide('rem-guide-text', '✨ 输入商和余数，注意：余数必须比除数小！');
        updateProgress();
        showCalcRound();
    }

    function showCalcRound() {
        var q = state.p2Rounds[state.p2Step];
        if (!q) {
            finishGame();
            return;
        }

        var area = document.getElementById('rem-calc-area');
        if (!area) return;

        area.innerHTML =
            '<div class="rem-calc-card">' +
                '<div class="rem-calc-problem">' +
                    '<span class="rem-calc-num">' + q.dividend + '</span>' +
                    '<span class="rem-calc-op">÷</span>' +
                    '<span class="rem-calc-num">' + q.divisor + '</span>' +
                    '<span class="rem-calc-op">=</span>' +
                    '<span class="rem-calc-qmark">?…?…</span>' +
                '</div>' +
                '<div class="rem-calc-form">' +
                    '<div class="rem-calc-row">' +
                        '<label class="rem-calc-label">商</label>' +
                        '<input class="rem-calc-input" id="rem-input-q" type="number" inputmode="numeric" min="0">' +
                    '</div>' +
                    '<div class="rem-calc-row">' +
                        '<label class="rem-calc-label">余数</label>' +
                        '<input class="rem-calc-input" id="rem-input-r" type="number" inputmode="numeric" min="0">' +
                    '</div>' +
                    '<div class="rem-calc-hint" id="rem-calc-hint"></div>' +
                    '<button class="rem-btn-submit" id="rem-btn-submit">确认</button>' +
                '</div>' +
            '</div>';

        updateProgress();

        var inputQ = document.getElementById('rem-input-q');
        var inputR = document.getElementById('rem-input-r');
        var btn = document.getElementById('rem-btn-submit');

        // Tab 键切换到余数输入
        inputQ.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                inputR.focus();
            }
        });

        inputR.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkCalcAnswer(q);
            }
        });

        btn.addEventListener('click', function () {
            checkCalcAnswer(q);
        });

        inputQ.focus();
    }

    function checkCalcAnswer(q) {
        var inputQ = document.getElementById('rem-input-q');
        var inputR = document.getElementById('rem-input-r');
        var hint = document.getElementById('rem-calc-hint');
        var valQ = parseInt(inputQ.value, 10);
        var valR = parseInt(inputR.value, 10);

        // 校验输入
        if (isNaN(valQ) || isNaN(valR)) {
            showCalcHint(hint, '❗ 请输入商和余数', true);
            return;
        }

        if (valR < 0 || valQ < 0) {
            showCalcHint(hint, '❗ 商和余数都要大于等于 0', true);
            return;
        }

        // 核心校验：余数必须比除数小
        if (valR >= q.divisor) {
            state.mistakes++;
            showCalcHint(hint, '⭐ 提示：余数必须比除数小！' +
                q.dividend + ' ÷ ' + q.divisor + ' = ' + valQ + '……' + valR +
                '，但余数 ' + valR + ' 不能等于或大于除数 ' + q.divisor, false);

            if (window.GameManager) {
                window.GameManager.logError(
                    state.levelData.levelId,
                    q.dividend + '÷' + q.divisor + '=' + valQ + '…' + valR,
                    valQ + '…' + valR,
                    q.quotient + '…' + q.remainder
                );
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -3);
            }
            inputR.value = '';
            inputR.classList.add('shake');
            setTimeout(function () { inputR.classList.remove('shake'); }, 500);
            return;
        }

        // 全面校验
        if (valQ === q.quotient && valR === q.remainder) {
            // 正确
            showCalcHint(hint, '✅ 太棒了！' + q.dividend + ' ÷ ' + q.divisor +
                ' = ' + valQ + '……' + valR, false);

            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }

            state.p2Step++;
            updateProgress();

            setTimeout(function () {
                showCalcRound();
            }, 1200);
        } else {
            // 错误
            state.mistakes++;

            var feedback = '';
            if (valQ !== q.quotient && valR === q.remainder) {
                feedback = '商算错了哦，再想想：' +
                    q.dividend + ' ÷ ' + q.divisor + ' = ?……' + q.remainder;
            } else if (valQ === q.quotient && valR !== q.remainder) {
                feedback = '商对了，但余数不对，再算算：' +
                    q.dividend + ' - ' + q.quotient + ' × ' + q.divisor + ' = ?';
            } else {
                feedback = '再试试：' + q.dividend + ' ÷ ' + q.divisor + ' ≈ ……';
            }
            showCalcHint(hint, '❗ ' + feedback, true);

            if (window.GameManager) {
                window.GameManager.logError(
                    state.levelData.levelId,
                    q.dividend + '÷' + q.divisor,
                    valQ + '…' + valR,
                    q.quotient + '…' + q.remainder
                );
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }

            inputQ.value = '';
            inputR.value = '';
            inputQ.classList.add('shake');
            setTimeout(function () { inputQ.classList.remove('shake'); }, 500);
            inputQ.focus();
        }
    }

    function showCalcHint(el, text, isError) {
        if (!el) return;
        el.textContent = text;
        el.className = 'rem-calc-hint' + (isError ? ' rem-hint-error' : ' rem-hint-ok');
    }

    /* ==================== 公共 UI ==================== */

    function updateProgress() {
        var el = document.getElementById('rem-progress');
        if (!el) return;
        if (state.phase === 1) {
            el.textContent = '动手分  ' + (state.p1Step + 1) + ' / ' + PHASE1_ROUNDS.length;
        } else {
            el.textContent = '余数计算  ' + (state.p2Step + 1) + ' / ' + state.p2Rounds.length;
        }
    }

    /* ==================== 结算 ==================== */

    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 25,
            state.levelData,
            state.mistakes,
            '余数密码已破解！记住：余数永远比除数小！',
            'lvl_2_d_7'
        );
    }

    /* ==================== 样式注入 ==================== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ---- 全局容器 ---- */
            .rem-wrap {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: linear-gradient(150deg, #eff6ff 0%, #dbeafe 40%, #ede9fe 100%);
                display: flex; flex-direction: column; align-items: center;
            }

            /* ---- 引导栏 ---- */
            .rem-guide {
                position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
                background: rgba(255,255,255,0.92); padding: 10px 36px; border-radius: 40px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.08); font-size: 20px; font-weight: bold;
                color: #1e40af; z-index: 50; display: flex; align-items: center; gap: 12px;
                border: 3px solid #60a5fa; white-space: nowrap; max-width: 90vw;
                text-overflow: ellipsis; overflow: hidden;
            }
            .rem-guide-spr {
                font-size: 28px; animation: rem-float 2s infinite ease-in-out; flex-shrink: 0;
            }
            @keyframes rem-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

            /* ---- 进度 ---- */
            .rem-progress {
                position: absolute; top: 72px; left: 50%; transform: translateX(-50%);
                font-size: 15px; color: #1e40af; font-weight: bold; z-index: 50;
            }

            /* ---- Phase 容器 ---- */
            .rem-phase {
                display: none; flex-direction: column; align-items: center;
                width: 100%; height: 100%; padding: 100px 16px 20px;
                overflow-y: auto; box-sizing: border-box;
            }
            .rem-phase.active { display: flex; }

            /* ---- 卡片 ---- */
            .rem-card {
                background: rgba(255,255,255,0.92); border-radius: 24px; padding: 20px 24px;
                box-shadow: 0 8px 28px rgba(0,0,0,0.06); border: 3px solid #93c5fd;
                width: 100%; max-width: 520px; text-align: center; animation: rem-pop 0.4s ease-out;
            }
            @keyframes rem-pop { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }

            .rem-card-title {
                font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 14px;
            }

            /* ---- 物品池 ---- */
            .rem-items-pool {
                display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
                min-height: 52px; padding: 10px; background: #eff6ff; border-radius: 14px;
            }
            .rem-item {
                width: 52px; height: 52px; font-size: 28px;
                display: flex; align-items: center; justify-content: center;
                background: white; border-radius: 14px; border: 2px solid #bfdbfe;
                cursor: pointer; user-select: none;
                box-shadow: 0 3px 0 #e2e8f0; transition: all 0.2s;
            }
            .rem-item:hover {
                transform: translateY(-3px) scale(1.1);
                box-shadow: 0 6px 0 #bfdbfe; border-color: #3b82f6;
            }
            .rem-item:active { transform: translateY(1px) scale(0.95); }
            .rem-item-fly {
                transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
                transform: translate(var(--fly-x, 0), var(--fly-y, 0)) scale(0.3);
                opacity: 0; pointer-events: none;
            }
            .rem-all-done {
                color: #93c5fd; font-size: 18px; padding: 8px;
            }

            /* ---- 盘子行 ---- */
            .rem-plates-row {
                display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
                margin-top: 18px; width: 100%; max-width: 520px;
            }
            .rem-plate {
                background: rgba(255,255,255,0.88); border-radius: 18px; padding: 12px 10px;
                border: 3px solid #c7d2fe; min-width: 90px; text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05); animation: rem-pop 0.3s ease-out;
            }
            .rem-plate-label {
                font-size: 14px; font-weight: bold; color: #6366f1; margin-bottom: 6px;
            }
            .rem-plate-items {
                display: flex; flex-wrap: wrap; gap: 3px; justify-content: center;
                min-height: 32px; margin-bottom: 4px;
            }
            .rem-plate-item { font-size: 18px; animation: rem-pop 0.25s ease-out; }
            .rem-plate-empty { color: #d1d5db; font-size: 14px; }
            .rem-plate-count {
                font-size: 13px; font-weight: bold; color: #4f46e5;
            }

            /* ---- 余数结果框 ---- */
            .rem-remainder-box {
                margin-top: 18px; width: 100%; max-width: 520px;
                animation: rem-pop 0.4s ease-out;
            }
            .rem-result-card {
                background: white; border-radius: 22px; padding: 24px;
                border: 3px solid #10b981; text-align: center;
                box-shadow: 0 8px 24px rgba(16,185,129,0.12);
            }
            .rem-result-eq {
                font-size: 32px; font-weight: bold; color: #065f46; margin-bottom: 10px;
            }
            .rem-result-desc {
                font-size: 18px; color: #374151; margin-bottom: 8px;
            }
            .rem-result-remain {
                font-size: 16px; color: #6b7280; margin-bottom: 16px;
            }
            .rem-btn-next {
                padding: 12px 40px; font-size: 18px; font-weight: bold; border: none;
                border-radius: 16px; background: #10b981; color: white; cursor: pointer;
                transition: all 0.2s;
            }
            .rem-btn-next:hover { background: #059669; transform: scale(1.05); }

            /* ---- Phase 2 计算区 ---- */
            .rem-calc-area {
                width: 100%; max-width: 460px; display: flex; flex-direction: column;
                align-items: center; animation: rem-pop 0.4s ease-out;
            }
            .rem-calc-card {
                background: rgba(255,255,255,0.95); border-radius: 28px; padding: 30px 32px;
                box-shadow: 0 10px 32px rgba(0,0,0,0.08); border: 4px solid #818cf8;
                width: 100%; text-align: center;
            }
            .rem-calc-problem {
                display: flex; align-items: center; justify-content: center;
                gap: 10px; margin-bottom: 24px; flex-wrap: wrap;
            }
            .rem-calc-num {
                font-size: 48px; font-weight: bold; color: #312e81;
                background: #eef2ff; padding: 4px 18px; border-radius: 14px;
                border: 3px solid #a5b4fc;
            }
            .rem-calc-op {
                font-size: 36px; color: #6366f1; font-weight: bold;
            }
            .rem-calc-qmark {
                font-size: 36px; color: #a78bfa; font-weight: bold;
            }

            .rem-calc-form { display: flex; flex-direction: column; gap: 14px; }
            .rem-calc-row { display: flex; align-items: center; gap: 12px; justify-content: center; }
            .rem-calc-label {
                font-size: 22px; font-weight: bold; color: #4338ca; min-width: 70px;
                text-align: right;
            }
            .rem-calc-input {
                width: 120px; font-size: 36px; text-align: center; padding: 8px 0;
                border: 3px solid #a5b4fc; border-radius: 14px; outline: none;
                color: #312e81; font-weight: bold; background: #f5f3ff;
            }
            .rem-calc-input:focus {
                border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
            }
            .rem-calc-hint {
                font-size: 15px; min-height: 24px; text-align: center;
                margin-top: 4px; line-height: 1.5;
            }
            .rem-hint-error { color: #dc2626; }
            .rem-hint-ok { color: #059669; }

            .rem-btn-submit {
                padding: 14px 48px; font-size: 22px; font-weight: bold; border: none;
                border-radius: 16px; background: #6366f1; color: white; cursor: pointer;
                transition: all 0.2s; margin-top: 8px;
            }
            .rem-btn-submit:hover { background: #4f46e5; transform: scale(1.05); }

            /* ---- 阶段切换横幅 ---- */
            .rem-banner {
                position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
                background: rgba(219,234,254,0.92); z-index: 80;
                backdrop-filter: blur(6px);
            }
            .rem-banner.show { display: flex; }
            .rem-banner-inner {
                text-align: center; animation: rem-pop 0.5s ease-out;
            }
            .rem-banner-inner h2 { font-size: 40px; color: #1e40af; margin: 0 0 12px; }
            .rem-banner-inner p { font-size: 22px; color: #3b82f6; }

            /* ---- 通用动画 ---- */
            @keyframes rem-shake {
                10%, 90% { transform: translateX(-1px); }
                20%, 80% { transform: translateX(2px); }
                30%, 50%, 70% { transform: translateX(-4px); }
                40%, 60% { transform: translateX(4px); }
            }
            .shake { animation: rem-shake 0.4s ease; }

            /* ---- 响应式 ---- */
            @media (max-width: 480px) {
                .rem-guide { font-size: 16px; padding: 8px 20px; }
                .rem-item { width: 42px; height: 42px; font-size: 22px; }
                .rem-plate { min-width: 72px; padding: 10px 6px; }
                .rem-calc-num { font-size: 36px; padding: 4px 12px; }
                .rem-calc-op { font-size: 28px; }
                .rem-calc-input { width: 90px; font-size: 28px; }
                .rem-calc-label { font-size: 18px; min-width: 56px; }
                .rem-result-eq { font-size: 24px; }
                .rem-btn-submit { padding: 12px 36px; font-size: 18px; }
            }
        `);
    }

    /* ==================== 导出 ==================== */

    window.CurrentGameModule = game;
})();
