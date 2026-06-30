/**
 * 三年级下册 第八单元：搭配（二）
 * 路径: src/games/grade3/g3_d_u8_combo2.js
 *
 * 穿搭组合 - 两阶段玩法：
 *   Phase 1：三件上衣 × 三条裤子/裙子，找出全部搭配
 *   Phase 2：用 4 个数字组成不重复的两位数（含0的特殊处理）
 */
(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g3-d-u8-cb2-styles';

    /* ==================== 数据 ==================== */

    var TOPS = [
        { emoji: '👔', name: '白衬衫' },
        { emoji: '🧥', name: '棉外套' },
        { emoji: '👕', name: 'T恤' }
    ];

    var BOTTOMS = [
        { emoji: '👖', name: '牛仔裤' },
        { emoji: '👗', name: '连衣裙' },
        { emoji: '🩳', name: '短裤' }
    ];

    var DIGIT_SETS = [
        [0, 1, 2, 3],
        [0, 2, 5, 7],
        [0, 3, 4, 8],
        [1, 4, 6, 9],
        [0, 5, 6, 9],
        [2, 3, 7, 8],
        [0, 1, 5, 9],
        [0, 4, 7, 8]
    ];

    /* ==================== 工具函数 ==================== */

    function getAllTwoDigitNums(digits) {
        var nums = [];
        for (var i = 0; i < digits.length; i++) {
            for (var j = 0; j < digits.length; j++) {
                if (i !== j && digits[i] !== 0) {
                    nums.push(String(digits[i]) + String(digits[j]));
                }
            }
        }
        return nums.sort();
    }

    /* ==================== 状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        phase: 1,
        mistakes: 0,
        isFinished: false,
        // Phase 1
        selTop: -1,
        selBottom: -1,
        foundPairs: [],
        totalPairs: TOPS.length * BOTTOMS.length,
        // Phase 2
        p2Round: 0,
        p2TotalRounds: 3,
        p2Digits: [],
        p2Found: [],
        p2Answered: []
    };

    /* ==================== 渲染 ==================== */

    function buildCSS() {
        return '\
            .cb2-wrap {\
                width:100%;height:100%;position:relative;overflow:hidden;\
                font-family:"PingFang SC","Microsoft YaHei",sans-serif;\
                background:linear-gradient(160deg,#fdf2f8 0%,#fce7f3 40%,#fbcfe8 100%);\
                display:flex;flex-direction:column;align-items:center;\
            }\
            .cb2-phase {\
                flex:1;width:100%;display:flex;flex-direction:column;\
                align-items:center;justify-content:center;gap:20px;\
                padding:70px 16px 24px;\
            }\
            .cb2-phase.hidden { display:none; }\
            .cb2-title {\
                font-size:24px;font-weight:bold;color:#9d174d;\
                text-shadow:0 2px 8px rgba(157,23,77,0.15);margin-bottom:2px;\
            }\
            .cb2-progress {\
                font-size:17px;color:#be185d;font-weight:bold;\
                background:rgba(255,255,255,0.7);padding:4px 18px;border-radius:20px;\
            }\
            /* ── Phase 1 ── */\
            .cb2-closet {\
                display:flex;gap:40px;align-items:flex-start;justify-content:center;\
                flex-wrap:wrap;\
            }\
            .cb2-col {\
                display:flex;flex-direction:column;align-items:center;gap:12px;\
            }\
            .cb2-col-label {\
                font-size:16px;color:#9d174d;font-weight:bold;margin-bottom:4px;\
            }\
            .cb2-item {\
                width:80px;height:80px;background:#fff;border-radius:20px;\
                display:flex;flex-direction:column;align-items:center;justify-content:center;\
                font-size:40px;box-shadow:0 5px 0 #e9d5ff;\
                cursor:pointer;border:3px solid transparent;\
                transition:all .18s;user-select:none;\
            }\
            .cb2-item .cb2-item-name { font-size:11px;color:#6b7280;margin-top:2px; }\
            .cb2-item:hover {\
                transform:scale(1.08);border-color:#c084fc;\
                box-shadow:0 7px 0 #d8b4fe;\
            }\
            .cb2-item:active { transform:scale(0.95);box-shadow:0 2px 0 #d8b4fe; }\
            .cb2-item.selected {\
                border-color:#a855f7;background:#faf5ff;\
                box-shadow:0 5px 0 #a855f7;transform:scale(1.05);\
            }\
            .cb2-item.done { opacity:0.45;cursor:default;pointer-events:none; }\
            .cb2-plus {\
                font-size:36px;color:#c084fc;font-weight:bold;\
                align-self:center;margin-top:20px;\
            }\
            .cb2-pair-hint {\
                font-size:16px;color:#be185d;min-height:28px;text-align:center;\
            }\
            .cb2-found {\
                display:flex;flex-wrap:wrap;gap:8px;justify-content:center;\
                max-width:500px;min-height:48px;\
            }\
            .cb2-found-chip {\
                background:#fff;border:2px solid #f0abfc;border-radius:14px;\
                padding:6px 14px;font-size:18px;color:#9333ea;font-weight:bold;\
                display:flex;align-items:center;gap:6px;\
                animation:cb2-pop .3s ease-out;\
            }\
            @keyframes cb2-pop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}\
            /* ── Phase 2 ── */\
            .cb2-digits {\
                display:flex;gap:16px;justify-content:center;flex-wrap:wrap;\
            }\
            .cb2-digit-card {\
                width:72px;height:72px;background:#fff;border-radius:18px;\
                display:flex;align-items:center;justify-content:center;\
                font-size:36px;font-weight:bold;color:#1e293b;\
                box-shadow:0 5px 0 #c7d2fe;border:3px solid transparent;\
                transition:all .18s;user-select:none;\
            }\
            .cb2-digit-card.used {\
                border-color:#a855f7;background:#faf5ff;opacity:0.6;\
            }\
            .cb2-input-row {\
                display:flex;align-items:center;gap:12px;margin-top:6px;\
            }\
            .cb2-digit-input {\
                width:140px;height:56px;border:3px solid #c084fc;border-radius:16px;\
                font-size:32px;font-weight:bold;text-align:center;color:#1e293b;\
                outline:none;transition:border-color .2s;background:#fff;\
            }\
            .cb2-digit-input:focus {\
                border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,0.2);\
            }\
            .cb2-submit-btn {\
                padding:14px 30px;background:#a855f7;color:#fff;border:none;\
                border-radius:16px;font-size:20px;font-weight:bold;cursor:pointer;\
                transition:all .2s;box-shadow:0 4px 0 #7e22ce;\
            }\
            .cb2-submit-btn:hover { transform:translateY(-2px);box-shadow:0 6px 0 #7e22ce; }\
            .cb2-submit-btn:active { transform:translateY(2px);box-shadow:0 2px 0 #7e22ce; }\
            .cb2-found-nums {\
                display:flex;flex-wrap:wrap;gap:10px;justify-content:center;\
                max-width:460px;min-height:44px;\
            }\
            .cb2-num-chip {\
                background:#fff;border:2px solid #c084fc;border-radius:14px;\
                padding:8px 18px;font-size:24px;font-weight:bold;color:#7e22ce;\
                animation:cb2-pop .3s ease-out;\
            }\
            .cb2-tip {\
                font-size:15px;color:#9ca3af;margin-top:4px;text-align:center;max-width:360px;\
            }\
            .cb2-quick-row {\
                display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px;\
            }\
            .cb2-quick-btn {\
                width:56px;height:56px;background:#fff;border:2px solid #e9d5ff;\
                border-radius:14px;font-size:26px;font-weight:bold;color:#7e22ce;\
                cursor:pointer;transition:all .15s;\
                display:flex;align-items:center;justify-content:center;\
            }\
            .cb2-quick-btn:hover { background:#f3e8ff;border-color:#a855f7;transform:scale(1.1); }\
            .cb2-shake { animation:cb2-shk .4s cubic-bezier(.36,.07,.19,.97) both; }\
            @keyframes cb2-shk{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}\
            .cb2-ok-flash { animation:cb2-ok .45s; }\
            @keyframes cb2-ok{0%{box-shadow:0 0 0 0 rgba(168,85,247,.5)}100%{box-shadow:0 0 0 18px rgba(168,85,247,0)}}\
        ';
    }

    function render() {
        state.container.innerHTML =
            '<div class="cb2-wrap">' +
                H.guideBarHTML('👗', '穿搭组合——找出所有搭配！', 'cb2-guide-text') +
                '<div id="cb2-phase1" class="cb2-phase">' +
                    '<div class="cb2-title" id="cb2-p1-title">👗 衣服搭配</div>' +
                    '<div class="cb2-pair-hint" id="cb2-pair-hint">点击一件上衣，再点一条裤子/裙子，组成搭配！</div>' +
                    '<div class="cb2-closet" id="cb2-closet"></div>' +
                    '<div class="cb2-progress" id="cb2-p1-progress">已找到 0 / ' + state.totalPairs + ' 种</div>' +
                    '<div class="cb2-found" id="cb2-p1-found"></div>' +
                '</div>' +
                '<div id="cb2-phase2" class="cb2-phase hidden">' +
                    '<div class="cb2-title" id="cb2-p2-title">🔢 数字搭配</div>' +
                    '<div class="cb2-pair-hint" id="cb2-p2-hint">用下面的4个数字组成两位数</div>' +
                    '<div class="cb2-digits" id="cb2-digits"></div>' +
                    '<div class="cb2-input-row">' +
                        '<input type="number" class="cb2-digit-input" id="cb2-num-input" placeholder="?" min="10" max="99">' +
                        '<button class="cb2-submit-btn" id="cb2-num-submit">确定</button>' +
                    '</div>' +
                    '<div class="cb2-quick-row" id="cb2-quick-row"></div>' +
                    '<div class="cb2-progress" id="cb2-p2-progress"></div>' +
                    '<div class="cb2-found-nums" id="cb2-p2-found"></div>' +
                    '<div class="cb2-tip" id="cb2-p2-tip">💡 按顺序选，先固定十位，再选个位，就不容易漏！（注意：十位不能是0）</div>' +
                '</div>' +
            '</div>';
    }

    /* ==================== Phase 1 ==================== */

    function startPhase1() {
        state.phase = 1;
        state.selTop = -1;
        state.selBottom = -1;
        state.foundPairs = [];
        H.updateGuide('点击一件上衣👕，再点击一条下装👖，试试看有多少种搭配！');
        renderCloset();
    }

    function renderCloset() {
        var closet = document.getElementById('cb2-closet');
        if (!closet) return;

        var foundSet = new Set(state.foundPairs.map(function (p) { return p.topIdx + '-' + p.bottomIdx; }));

        var html = '<div class="cb2-col">' +
            '<div class="cb2-col-label">上衣 👕</div>' +
            TOPS.map(function (t, i) {
                var topDone = BOTTOMS.every(function (_, bi) { return foundSet.has(i + '-' + bi); });
                return '<div class="cb2-item' + (topDone ? ' done' : '') + (state.selTop === i ? ' selected' : '') +
                    '" data-role="top" data-idx="' + i + '">' +
                    t.emoji + '<span class="cb2-item-name">' + t.name + '</span></div>';
            }).join('') +
        '</div>' +
        '<span class="cb2-plus">+</span>' +
        '<div class="cb2-col">' +
            '<div class="cb2-col-label">下装 👖</div>' +
            BOTTOMS.map(function (b, i) {
                var bottomDone = TOPS.every(function (_, ti) { return foundSet.has(ti + '-' + i); });
                return '<div class="cb2-item' + (bottomDone ? ' done' : '') + (state.selBottom === i ? ' selected' : '') +
                    '" data-role="bottom" data-idx="' + i + '">' +
                    b.emoji + '<span class="cb2-item-name">' + b.name + '</span></div>';
            }).join('') +
        '</div>';

        closet.innerHTML = html;

        closet.querySelectorAll('.cb2-item:not(.done)').forEach(function (el) {
            el.onclick = function () { handleClosetItem(el); };
        });

        updateP1Progress();
    }

    function handleClosetItem(el) {
        var role = el.getAttribute('data-role');
        var idx = parseInt(el.getAttribute('data-idx'));

        if (role === 'top') state.selTop = idx;
        else state.selBottom = idx;

        document.querySelectorAll('#cb2-closet .cb2-item').forEach(function (e) {
            if (!e.classList.contains('done')) e.classList.remove('selected');
        });
        if (state.selTop >= 0) {
            var topEl = document.querySelector('#cb2-closet .cb2-item[data-role="top"][data-idx="' + state.selTop + '"]');
            if (topEl && !topEl.classList.contains('done')) topEl.classList.add('selected');
        }
        if (state.selBottom >= 0) {
            var bottomEl = document.querySelector('#cb2-closet .cb2-item[data-role="bottom"][data-idx="' + state.selBottom + '"]');
            if (bottomEl && !bottomEl.classList.contains('done')) bottomEl.classList.add('selected');
        }

        if (state.selTop >= 0 && state.selBottom >= 0) tryPair();
    }

    function tryPair() {
        var already = state.foundPairs.some(function (p) {
            return p.topIdx === state.selTop && p.bottomIdx === state.selBottom;
        });

        var hintEl = document.getElementById('cb2-pair-hint');
        if (already) {
            hintEl.textContent = '这对已经找过啦，换一个试试！';
            hintEl.style.color = '#f59e0b';
            setTimeout(function () {
                hintEl.textContent = '继续找其他搭配吧！';
                hintEl.style.color = '#be185d';
            }, 1500);
            state.selTop = -1;
            state.selBottom = -1;
            renderCloset();
            return;
        }

        state.foundPairs.push({ topIdx: state.selTop, bottomIdx: state.selBottom });
        var topName = TOPS[state.selTop].name;
        var bottomName = BOTTOMS[state.selBottom].name;
        hintEl.textContent = '✅ 找到新搭配：' + topName + ' + ' + bottomName;
        hintEl.style.color = '#10b981';

        if (window.GameManager) {
            window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
        }

        renderFoundChips();
        state.selTop = -1;
        state.selBottom = -1;

        setTimeout(function () {
            renderCloset();
            if (state.foundPairs.length >= state.totalPairs) {
                hintEl.textContent = '🎉 太棒了！全部搭配都找到了！';
                hintEl.style.color = '#a855f7';
                setTimeout(startPhase2, 1500);
            } else {
                hintEl.textContent = '继续找其他搭配吧！';
                hintEl.style.color = '#be185d';
            }
        }, 600);
    }

    function renderFoundChips() {
        var el = document.getElementById('cb2-p1-found');
        if (!el) return;
        el.innerHTML = state.foundPairs.map(function (p) {
            return '<div class="cb2-found-chip">' + TOPS[p.topIdx].emoji + BOTTOMS[p.bottomIdx].emoji + '</div>';
        }).join('');
    }

    function updateP1Progress() {
        var el = document.getElementById('cb2-p1-progress');
        if (el) el.textContent = '已找到 ' + state.foundPairs.length + ' / ' + state.totalPairs + ' 种';
    }

    /* ==================== Phase 2 ==================== */

    function startPhase2() {
        state.phase = 2;
        state.p2Round = 0;
        state.p2Answered = [];

        document.getElementById('cb2-phase1').classList.add('hidden');
        document.getElementById('cb2-phase2').classList.remove('hidden');

        H.updateGuide('cb2-guide-text', '用4个数字组成两位数，十位不能是0哦！');
        loadP2Round();
    }

    function loadP2Round() {
        if (state.p2Round >= state.p2TotalRounds) {
            finishGame();
            return;
        }

        var pool = DIGIT_SETS.filter(function (ds) {
            return !state.p2Answered.some(function (a) {
                return a.digits.join('') === ds.join('');
            });
        });
        state.p2Digits = pool.length > 0
            ? pool[H.randInt(0, pool.length - 1)]
            : DIGIT_SETS[H.randInt(0, DIGIT_SETS.length - 1)];

        state.p2Found = [];

        document.getElementById('cb2-p2-title').textContent =
            '🔢 数字搭配（第 ' + (state.p2Round + 1) + '/' + state.p2TotalRounds + ' 轮）';
        document.getElementById('cb2-p2-hint').textContent =
            '用 ' + state.p2Digits.join('、') + ' 这四个数字组成两位数';

        renderP2Digits();
        renderP2Found();
        updateP2Progress();

        var input = document.getElementById('cb2-num-input');
        if (input) { input.value = ''; input.disabled = false; }
        var submitBtn = document.getElementById('cb2-num-submit');
        if (submitBtn) submitBtn.disabled = false;

        renderP2QuickBtns();
    }

    function renderP2Digits() {
        var el = document.getElementById('cb2-digits');
        if (!el) return;
        el.innerHTML = state.p2Digits.map(function (d) {
            return '<div class="cb2-digit-card" data-digit="' + d + '">' + d + '</div>';
        }).join('');
    }

    function renderP2QuickBtns() {
        var el = document.getElementById('cb2-quick-row');
        if (!el) return;
        var allNums = getAllTwoDigitNums(state.p2Digits);
        el.innerHTML = allNums.map(function (n) {
            return '<button class="cb2-quick-btn" data-num="' + n + '">' + n + '</button>';
        }).join('');

        el.querySelectorAll('.cb2-quick-btn').forEach(function (btn) {
            btn.onclick = function () { submitP2Answer(btn.getAttribute('data-num'), btn); };
        });
    }

    function submitP2Answer(val, btnEl) {
        if (state.phase !== 2) return;
        val = String(val).trim();
        var input = document.getElementById('cb2-num-input');

        if (val.length !== 2 || isNaN(val)) {
            if (input) {
                input.classList.add('cb2-shake');
                setTimeout(function () { input.classList.remove('cb2-shake'); }, 400);
            }
            return;
        }

        var d1 = parseInt(val[0]);
        var d2 = parseInt(val[1]);

        if (d1 === 0) {
            state.mistakes++;
            var hintEl = document.getElementById('cb2-p2-hint');
            hintEl.textContent = '⚠️ 十位不能是0哦！';
            hintEl.style.color = '#ef4444';
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字搭配-十位为0', val, '十位非0');
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(function () {
                hintEl.textContent = '用 ' + state.p2Digits.join('、') + ' 这四个数字组成两位数';
                hintEl.style.color = '#be185d';
            }, 1500);
            if (input) input.value = '';
            return;
        }

        if (!state.p2Digits.includes(d1) || !state.p2Digits.includes(d2)) {
            state.mistakes++;
            var hintEl2 = document.getElementById('cb2-p2-hint');
            hintEl2.textContent = '⚠️ 只能用给定的数字哦！';
            hintEl2.style.color = '#ef4444';
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字搭配-数字不在范围内', val, state.p2Digits.join(','));
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(function () {
                hintEl2.textContent = '用 ' + state.p2Digits.join('、') + ' 这四个数字组成两位数';
                hintEl2.style.color = '#be185d';
            }, 1500);
            if (input) input.value = '';
            return;
        }

        if (d1 === d2) {
            state.mistakes++;
            var hintEl3 = document.getElementById('cb2-p2-hint');
            hintEl3.textContent = '⚠️ 十位和个位不能用同一个数字！';
            hintEl3.style.color = '#ef4444';
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId, '数字搭配-重复数字', val, '十位个位不同');
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -4);
            }
            setTimeout(function () {
                hintEl3.textContent = '用 ' + state.p2Digits.join('、') + ' 这四个数字组成两位数';
                hintEl3.style.color = '#be185d';
            }, 1500);
            if (input) input.value = '';
            return;
        }

        if (state.p2Found.includes(val)) {
            var hintEl4 = document.getElementById('cb2-p2-hint');
            hintEl4.textContent = '💡 ' + val + ' 已经找过了，试试别的！';
            hintEl4.style.color = '#f59e0b';
            setTimeout(function () {
                hintEl4.textContent = '用 ' + state.p2Digits.join('、') + ' 这四个数字组成两位数';
                hintEl4.style.color = '#be185d';
            }, 1200);
            if (input) input.value = '';
            return;
        }

        // 正确
        state.p2Found.push(val);
        if (btnEl) btnEl.classList.add('cb2-ok-flash');
        if (input) input.value = '';

        renderP2Found();
        updateP2Progress();

        if (window.GameManager) {
            window.GameManager.updateMastery(state.levelData.knowledgePoint, 5);
        }

        var total = getAllTwoDigitNums(state.p2Digits).length;
        var hintEl5 = document.getElementById('cb2-p2-hint');
        if (state.p2Found.length >= total) {
            hintEl5.textContent = '🎉 太厉害了！找到了全部 ' + total + ' 个两位数！';
            hintEl5.style.color = '#a855f7';
            state.p2Answered.push({ digits: state.p2Digits.slice(), count: state.p2Found.length, total: total });

            setTimeout(function () {
                state.p2Round++;
                loadP2Round();
            }, 1800);
        } else {
            hintEl5.textContent = '找到 ' + state.p2Found.length + '/' + total + ' 个，继续加油！';
            hintEl5.style.color = '#10b981';
        }
    }

    function renderP2Found() {
        var el = document.getElementById('cb2-p2-found');
        if (!el) return;
        el.innerHTML = state.p2Found.sort().map(function (n) {
            return '<div class="cb2-num-chip">' + n + '</div>';
        }).join('');
    }

    function updateP2Progress() {
        var total = getAllTwoDigitNums(state.p2Digits).length;
        var el = document.getElementById('cb2-p2-progress');
        if (el) el.textContent = '已找到 ' + state.p2Found.length + ' / ' + total + ' 个';
    }

    /* ==================== 结算 ==================== */

    function finishGame() {
        if (state.isFinished) return;
        state.isFinished = true;
        var subtitle = state.mistakes === 0
            ? '太厉害了！你是搭配大师！'
            : state.mistakes <= 3
                ? '很棒！你掌握了搭配的秘诀！'
                : '继续加油，按顺序找就不容易漏啦！';
        H.showSettlement(state.container, state.levelData.reward || 30, state.levelData, state.mistakes, subtitle, null);
    }

    /* ==================== 主模块 ==================== */

    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30, knowledgePoint: '搭配（二）', levelId: 'lvl_3_d_8' };
            if (!state.container) return;

            state.phase = 1;
            state.mistakes = 0;
            state.isFinished = false;
            state.selTop = -1;
            state.selBottom = -1;
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
