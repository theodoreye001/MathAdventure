/**
 * 二年级下册 第四单元：表内除法（二）— 用7~9的乘法口诀求商
 * 路径: src/games/grade2/g2_d_u4_divide2.js
 *
 * Phase 1 "口诀求商" — 5道除法选择题，用7/8/9乘法口诀求商
 * Phase 2 "应用闯关" — 4道除法应用题（分物场景），选择正确答案
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-d-u4-div2-styles';

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        step: 0,
        mistakes: 0,
        rounds: []
    };

    /* ─── 题库：7/8/9 表内除法 ───────────────────────────────── */

    // 所有可用的除法算式（被除数 = a×b, 除数 = a, 商 = b）
    // 覆盖 7/8/9 乘法口诀的全部组合
    const DIV_BANK = [];
    function buildDivBank() {
        for (let a = 7; a <= 9; a++) {
            for (let b = 2; b <= 9; b++) {
                DIV_BANK.push({ divisor: a, quotient: b, dividend: a * b });
            }
        }
    }
    buildDivBank();

    // 应用题模板库
    const WORD_BANK = [
        { item: '苹果', unit: '个', context: '平均分给' },
        { item: '糖果', unit: '颗', context: '平均分给' },
        { item: '铅笔', unit: '支', context: '平均分给' },
        { item: '饼干', unit: '块', context: '平均分给' },
        { item: '气球', unit: '个', context: '每人分' },
        { item: '花朵', unit: '朵', context: '每瓶插' },
        { item: '小鸟', unit: '只', context: '每个笼子住' },
        { item: '桃子', unit: '个', context: '每盘放' }
    ];

    /** 生成 Phase 1 除法选择题（5题，覆盖7/8/9） */
    function buildDivQuestions(count) {
        const bank = H.shuffle([...DIV_BANK]);
        // 确保 7、8、9 各至少出现一次
        const byDivisor = { 7: [], 8: [], 9: [] };
        bank.forEach(function (q) {
            if (byDivisor[q.divisor]) byDivisor[q.divisor].push(q);
        });
        const picked = [];
        picked.push(H.shuffle(byDivisor[7])[0]);
        picked.push(H.shuffle(byDivisor[8])[0]);
        picked.push(H.shuffle(byDivisor[9])[0]);

        const used = new Set(picked.map(function (q) { return q.dividend + '/' + q.divisor; }));
        for (var i = 0; i < bank.length && picked.length < count; i++) {
            var key = bank[i].dividend + '/' + bank[i].divisor;
            if (!used.has(key)) {
                picked.push(bank[i]);
                used.add(key);
            }
        }
        return H.shuffle(picked);
    }

    /** 为一道除法题生成 4 个选项（含正确答案） */
    function makeDivOptions(answer) {
        var opts = new Set([answer]);
        while (opts.size < 4) {
            var fake = answer + H.randInt(-3, 3);
            if (fake >= 1 && fake <= 9 && fake !== answer) {
                opts.add(fake);
            }
        }
        return H.shuffle([...opts]);
    }

    /** 生成 Phase 2 应用题（4道） */
    function buildWordProblems(count) {
        var questions = buildDivQuestions(count);
        var problems = [];
        var usedTemplates = H.shuffle([...WORD_BANK]);
        for (var i = 0; i < count; i++) {
            var q = questions[i];
            var tpl = usedTemplates[i % usedTemplates.length];
            // 构造应用题文本
            var text;
            switch (tpl.context) {
                case '平均分给':
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，平均分给' + q.divisor + '个人，每人几个' + tpl.unit + '？';
                    break;
                case '每人分':
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，每人分' + tpl.unit + tpl.item + '，可以分给几个人？';
                    // 注意：此时 answer 表示人数（divisor），dividend 表示总数
                    // 但应用题场景里问的是"几个人"→答案 = divisor，已正确
                    break;
                case '每瓶插':
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，每瓶插' + tpl.unit + tpl.item + '，可以插几瓶？';
                    break;
                case '每个笼子住':
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，每个笼子住一只，需要几个笼子？';
                    break;
                case '每盘放':
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，每盘放' + tpl.unit + tpl.item + '，可以放几盘？';
                    break;
                default:
                    text = '有' + q.dividend + tpl.unit + tpl.item + '，平均分给' + q.divisor + '个人，每人几个' + tpl.unit + '？';
            }
            problems.push({
                text: text,
                answer: q.quotient,
                dividend: q.dividend,
                divisor: q.divisor,
                item: tpl.item
            });
        }
        return problems;
    }

    /* ─── 样式 ──────────────────────────────────────────────── */
    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ====== 全局容器 ====== */
            .dv2-wrap {
                width:100%;height:100%;position:relative;overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background:linear-gradient(160deg,#eef9ff 0%,#e0f2fe 40%,#bae6fd 100%);
                display:flex;flex-direction:column;align-items:center;
            }

            /* ====== 引导栏 ====== */
            .dv2-guide {
                position:absolute;top:16px;left:50%;transform:translateX(-50%);
                background:rgba(255,255,255,0.92);padding:10px 36px;border-radius:40px;
                box-shadow:0 4px 14px rgba(0,0,0,0.08);font-size:21px;font-weight:bold;
                color:#075985;z-index:50;display:flex;align-items:center;gap:12px;
                border:3px solid #0ea5e9;white-space:nowrap;
            }
            .dv2-guide-spr { font-size:28px;animation:dv2float 2s infinite ease-in-out; }
            @keyframes dv2float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

            /* ====== 进度 ====== */
            .dv2-progress {
                position:absolute;top:72px;left:50%;transform:translateX(-50%);
                font-size:15px;color:#075985;font-weight:bold;z-index:50;
            }

            /* ====== Phase 容器 ====== */
            .dv2-phase { display:none;flex-direction:column;align-items:center;width:100%;height:100%; }
            .dv2-phase.active { display:flex; }

            /* ====== Phase 1: 口诀求商 ====== */
            .dv2-card {
                margin-top:120px;background:#fff;border-radius:28px;padding:36px 52px;
                box-shadow:0 8px 28px rgba(0,0,0,0.08);text-align:center;
                border:4px solid #38bdf8;min-width:320px;
            }
            .dv2-card-label {
                font-size:16px;color:#075985;margin-bottom:10px;font-weight:bold;
            }
            .dv2-card-eq {
                font-size:52px;font-weight:bold;color:#0c4a6e;letter-spacing:4px;
                margin:12px 0 24px;line-height:1.3;
            }
            .dv2-options {
                display:grid;grid-template-columns:1fr 1fr;gap:14px;width:340px;margin-top:12px;
            }
            .dv2-opt {
                padding:16px;font-size:28px;font-weight:bold;border:none;
                border-radius:16px;background:#f0f9ff;color:#0c4a6e;
                border:3px solid #38bdf8;cursor:pointer;transition:all 0.2s;
            }
            .dv2-opt:hover { background:#e0f2fe;transform:scale(1.05); }
            .dv2-opt.correct {
                background:#dcfce7 !important;border-color:#22c55e !important;color:#166534 !important;
                animation:dv2pop 0.3s ease-out;
            }
            .dv2-opt.wrong {
                background:#fee2e2 !important;border-color:#ef4444 !important;color:#991b1b !important;
                animation:dv2shake 0.4s ease-out;
            }
            @keyframes dv2pop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
            @keyframes dv2shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

            /* ====== Phase 2: 应用题 ====== */
            .dv2-word-card {
                margin-top:110px;background:#fff;border-radius:28px;padding:30px 44px;
                box-shadow:0 8px 28px rgba(0,0,0,0.08);border:4px solid #f59e0b;
                max-width:520px;text-align:center;
            }
            .dv2-word-title {
                font-size:16px;color:#92400e;margin-bottom:8px;font-weight:bold;
            }
            .dv2-word-icon { font-size:56px;margin:8px 0; }
            .dv2-word-text {
                font-size:24px;font-weight:bold;color:#78350f;line-height:1.5;
                margin:12px 0 20px;
            }
            .dv2-word-opts {
                display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;
            }
            .dv2-word-btn {
                padding:16px;font-size:26px;font-weight:bold;border:none;
                border-radius:16px;background:#fffbeb;color:#92400e;
                border:3px solid #f59e0b;cursor:pointer;transition:all 0.2s;
            }
            .dv2-word-btn:hover { background:#fef3c7;transform:scale(1.05); }
            .dv2-word-btn.correct {
                background:#dcfce7 !important;border-color:#22c55e !important;color:#166534 !important;
                animation:dv2pop 0.3s ease-out;
            }
            .dv2-word-btn.wrong {
                background:#fee2e2 !important;border-color:#ef4444 !important;color:#991b1b !important;
                animation:dv2shake 0.4s ease-out;
            }

            /* ====== 浮标 ====== */
            .dv2-float {
                position:absolute;padding:8px 20px;border-radius:20px;
                font-size:18px;font-weight:bold;z-index:60;pointer-events:none;
                animation:dv2floatUp 1.2s forwards;
            }
            @keyframes dv2floatUp { 0%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-30px)} }
            .dv2-float.ok { background:#dcfce7;color:#166534; }
            .dv2-float.nope { background:#fee2e2;color:#991b1b; }

            /* ====== 阶段切换横幅 ====== */
            .dv2-banner {
                position:absolute;inset:0;display:none;align-items:center;justify-content:center;
                background:rgba(224,242,254,0.92);z-index:80;backdrop-filter:blur(6px);
            }
            .dv2-banner.show { display:flex; }
            .dv2-banner-inner {
                text-align:center;animation:dv2pop 0.5s ease-out;
            }
            .dv2-banner-inner h2 { font-size:42px;color:#075985;margin:0 0 12px; }
            .dv2-banner-inner p { font-size:22px;color:#0284c7; }
        `);
    }

    /* ─── 工具 ──────────────────────────────────────────────── */
    function updateProgress() {
        var el = document.getElementById('dv2-progress');
        if (!el) return;
        var label = state.phase === 1 ? '口诀求商' : '应用闯关';
        el.textContent = label + '  ' + (state.step + 1) + ' / ' + state.rounds.length;
    }

    function updateGuide(text) {
        H.updateGuide(text, 'dv2-guide-text');
    }

    function showFloatTag(parent, text, type) {
        if (!parent) return;
        var tag = document.createElement('div');
        tag.className = 'dv2-float ' + type;
        tag.textContent = text;
        tag.style.left = '50%';
        tag.style.top = '45%';
        tag.style.transform = 'translate(-50%,-50%)';
        parent.appendChild(tag);
        setTimeout(function () { tag.remove(); }, 1300);
    }

    /* ─── Phase 1: 口诀求商 ─────────────────────────────────── */
    function startPhase1() {
        state.phase = 1;
        state.step = 0;
        state.rounds = buildDivQuestions(5);
        H.updateGuide('用口诀算出答案！', 'dv2-guide-text');
        updateProgress();
        showDivRound();
    }

    function showDivRound() {
        var q = state.rounds[state.step];
        document.getElementById('dv2-dividend').textContent = q.dividend;
        document.getElementById('dv2-divisor').textContent = q.divisor;

        var container = document.getElementById('dv2-choices');
        var options = makeDivOptions(q.quotient);
        H.renderChoices(options.map(String), 'dv2-choices', function (idx, text) {
            handleDivChoice(parseInt(text), q);
        });

        updateGuide('第 ' + (state.step + 1) + ' 题：' + q.dividend + ' ÷ ' + q.divisor + ' = ?');
        updateProgress();
    }

    function handleDivChoice(val, q) {
        var container = document.getElementById('dv2-choices');
        var buttons = container.querySelectorAll('.dv2-opt');
        buttons.forEach(function (btn) { btn.style.pointerEvents = 'none'; });

        if (val === q.quotient) {
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === q.quotient) btn.classList.add('correct');
            });
            showFloatTag(state.container.querySelector('#dv2-phase1'), '答对了！', 'ok');
            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(showDivRound, 900);
            } else {
                setTimeout(showPhaseBanner, 900);
            }
        } else {
            state.mistakes++;
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === val) btn.classList.add('wrong');
            });
            showFloatTag(state.container.querySelector('#dv2-phase1'),
                '用 ' + q.divisor + ' 的口诀试试！', 'nope');
            setTimeout(function () {
                buttons.forEach(function (btn) {
                    if (!btn.classList.contains('wrong')) btn.style.pointerEvents = '';
                });
            }, 700);
        }
    }

    /* ─── 阶段切换横幅 ──────────────────────────────────────── */
    function showPhaseBanner() {
        var banner = document.getElementById('dv2-banner');
        var inner = document.getElementById('dv2-banner-inner');
        inner.innerHTML = '<h2>应用闯关</h2><p>用除法解决生活中的分物问题！</p>';
        banner.classList.add('show');
        setTimeout(function () {
            banner.classList.remove('show');
            startPhase2();
        }, 1500);
    }

    /* ─── Phase 2: 应用题 ───────────────────────────────────── */
    function startPhase2() {
        state.phase = 2;
        state.step = 0;
        state.rounds = buildWordProblems(4);

        document.getElementById('dv2-phase1').classList.remove('active');
        document.getElementById('dv2-phase2').classList.add('active');

        H.updateGuide('读题再作答，分一分想一想！', 'dv2-guide-text');
        updateProgress();
        showWordRound();
    }

    function showWordRound() {
        var p = state.rounds[state.step];
        var iconMap = { '苹果': '🍎', '糖果': '🍬', '铅笔': '✏️', '饼干': '🍪',
            '气球': '🎈', '花朵': '🌸', '小鸟': '🐦', '桃子': '🍑' };
        var icon = iconMap[p.item] || '📦';

        var container = document.getElementById('dv2-word-opts');
        var options = makeDivOptions(p.answer);
        H.renderChoices(options.map(String), 'dv2-word-opts', function (idx, text) {
            handleWordChoice(parseInt(text), p);
        });

        document.getElementById('dv2-word-icon').textContent = icon;
        document.getElementById('dv2-word-text').textContent = p.text;

        updateGuide('第 ' + (state.step + 1) + ' 题，想一想怎么分！');
        updateProgress();
    }

    function handleWordChoice(val, p) {
        var container = document.getElementById('dv2-word-opts');
        var buttons = container.querySelectorAll('.dv2-opt');
        buttons.forEach(function (btn) { btn.style.pointerEvents = 'none'; });

        if (val === p.answer) {
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === p.answer) btn.classList.add('correct');
            });
            showFloatTag(state.container.querySelector('#dv2-phase2'), '太棒了！', 'ok');
            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(showWordRound, 1000);
            } else {
                setTimeout(finishGame, 1000);
            }
        } else {
            state.mistakes++;
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === val) btn.classList.add('wrong');
            });
            showFloatTag(state.container.querySelector('#dv2-phase2'),
                p.dividend + ' ÷ ' + p.divisor + ' = ' + p.answer, 'nope');
            setTimeout(function () {
                buttons.forEach(function (btn) {
                    if (!btn.classList.contains('wrong')) btn.style.pointerEvents = '';
                });
            }, 700);
        }
    }

    /* ─── 结算 ──────────────────────────────────────────────── */
    function finishGame() {
        H.showSettlement(
            state.container,
            state.levelData.reward || 30,
            state.levelData,
            state.mistakes,
            '用口诀算商，分物不难！',
            'lvl_2_d_5'
        );
    }

    /* ─── 主控 ──────────────────────────────────────────────── */
    var game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30 };
            if (!state.container) return;

            state.phase = 1;
            state.step = 0;
            state.mistakes = 0;

            injectStyles();

            state.container.innerHTML = `
                <div class="dv2-wrap">
                    <div class="dv2-banner" id="dv2-banner">
                        <div class="dv2-banner-inner" id="dv2-banner-inner"></div>
                    </div>
                    <div class="dv2-guide">
                        <span class="dv2-guide-spr">➗</span>
                        <span id="dv2-guide-text"></span>
                    </div>
                    <div class="dv2-progress" id="dv2-progress"></div>

                    <!-- Phase 1: 口诀求商 -->
                    <div class="dv2-phase active" id="dv2-phase1">
                        <div class="dv2-card">
                            <div class="dv2-card-label">用乘法口诀求商</div>
                            <div class="dv2-card-eq">
                                <span id="dv2-dividend">?</span>
                                <span style="color:#0ea5e9"> ÷ </span>
                                <span id="dv2-divisor">?</span>
                                <span style="color:#0ea5e9"> = ?</span>
                            </div>
                            <div class="dv2-options" id="dv2-choices"></div>
                        </div>
                    </div>

                    <!-- Phase 2: 应用闯关 -->
                    <div class="dv2-phase" id="dv2-phase2">
                        <div class="dv2-word-card">
                            <div class="dv2-word-title">想一想，算一算</div>
                            <div class="dv2-word-icon" id="dv2-word-icon">📦</div>
                            <div class="dv2-word-text" id="dv2-word-text"></div>
                            <div class="dv2-word-opts" id="dv2-word-opts"></div>
                        </div>
                    </div>
                </div>
            `;

            startPhase1();
        }
    };

    window.CurrentGameModule = game;
})();
