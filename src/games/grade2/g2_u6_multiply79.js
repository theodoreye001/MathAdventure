/**
 * 二年级上册 第六单元：表内乘法（二）— 乘法口诀 7~9
 * 模块路径: src/games/grade2/g2_u6_multiply79.js
 *
 * Phase 1 口诀填空：补全缺失的口诀部分
 * Phase 2 乘法对战：速算选择题 + 射箭命中视觉
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u6-mul79-styles';

    let state = {
        container: null,
        levelData: null,
        phase: 1,
        step: 0,
        mistakes: 0,
        rounds: [],   // 当前阶段的题目数组
    };

    // ─── 口诀题库（7/8/9 乘法表） ───────────────────────────────
    // 每条: { a, b, product, full（完整口诀）, prompt（显示文本，含括号）, answer }
    const RHYME_BANK = [];

    // 中文数字映射
    const CN = { 7: '七', 8: '八', 9: '九',
        14: '十四', 21: '二十一', 28: '二十八', 35: '三十五', 42: '四十二', 49: '四十九',
        16: '十六', 24: '二十四', 32: '三十二', 40: '四十', 48: '四十八', 56: '五十六', 64: '六十四',
        18: '十八', 27: '二十七', 36: '三十六', 45: '四十五', 54: '五十四', 63: '六十三', 72: '七十二', 81: '八十一'
    };

    // 构建 7x7 ~ 9x9 完整口诀库
    function buildRhymeBank() {
        for (let a = 7; a <= 9; a++) {
            for (let b = a; b <= 9; b++) {
                const prod = a * b;
                // 口诀遵循：较小数在前，较大数在后（a×b 中 a<=b）
                const full = CN[a] + CN[b] + CN[prod];
                RHYME_BANK.push({
                    a, b, product: prod, full,
                    // 按被乘数分组的文本
                    displayA: CN[a],
                    displayB: CN[b],
                    displayProd: CN[prod]
                });
            }
        }
    }
    buildRhymeBank();

    // ─── 乘法题库（a×b=? 格式） ─────────────────────────────────
    function buildMulQuestions(count) {
        const pool = [];
        for (let a = 7; a <= 9; a++) {
            for (let b = a; b <= 9; b++) {
                pool.push({ a, b, answer: a * b });
            }
        }
        return H.shuffle(pool).slice(0, count);
    }

    // ─── 口诀随机缺失类型 ───────────────────────────────────────
    // type 0: "七八( )" → 缺结果
    // type 1: "( )八五十六" → 缺被乘数
    // type 2: "七( )五十六" → 缺乘数（仅当 a!=b 时有意义，否则同 type 1）
    function buildRhymeRound(item) {
        const r = H.randInt(0, item.a === item.b ? 0 : 2);
        if (r === 0) {
            return {
                text: item.displayA + item.displayB + '(  )',
                answer: String(item.product),
                hint: item.displayProd
            };
        } else if (r === 1) {
            return {
                text: '(  )' + item.displayB + item.displayProd,
                answer: String(item.a),
                hint: item.displayA
            };
        } else {
            return {
                text: item.displayA + '(  )' + item.displayProd,
                answer: String(item.b),
                hint: item.displayB
            };
        }
    }

    // ─── 样式 ──────────────────────────────────────────────────
    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ── 全局容器 ── */
            .m79-wrap {
                width:100%; height:100%; position:relative; overflow:hidden;
                font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                background: linear-gradient(160deg,#fef9ef 0%,#fdf2e9 40%,#fde8d0 100%);
                display:flex; flex-direction:column; align-items:center;
            }

            /* ── 引导栏复用 ── */
            .m79-guide {
                position:absolute; top:16px; left:50%; transform:translateX(-50%);
                background:rgba(255,255,255,0.92); padding:10px 36px; border-radius:40px;
                box-shadow:0 4px 14px rgba(0,0,0,0.08); font-size:21px; font-weight:bold;
                color:#92400e; z-index:50; display:flex; align-items:center; gap:12px;
                border:3px solid #f59e0b; white-space:nowrap;
            }
            .m79-guide-spr { font-size:28px; animation:m79float 2s infinite ease-in-out; }
            @keyframes m79float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

            /* ── 进度指示 ── */
            .m79-progress {
                position:absolute; top:72px; left:50%; transform:translateX(-50%);
                font-size:15px; color:#92400e; font-weight:bold; z-index:50;
            }

            /* ── 阶段1 口诀填空 ── */
            .m79-phase { display:none; flex-direction:column; align-items:center; width:100%; height:100%; }
            .m79-phase.active { display:flex; }

            .m79-rhyme-card {
                margin-top:120px; background:#fff; border-radius:28px; padding:36px 52px;
                box-shadow:0 8px 28px rgba(0,0,0,0.08); text-align:center;
                border:4px solid #fbbf24; min-width:320px;
            }
            .m79-rhyme-label { font-size:16px; color:#92400e; margin-bottom:10px; font-weight:bold; }
            .m79-rhyme-text {
                font-size:52px; font-weight:bold; color:#78350f; letter-spacing:4px;
                margin:12px 0 24px; line-height:1.3;
            }
            .m79-rhyme-text .m79-blank {
                display:inline-block; min-width:80px; border-bottom:5px solid #f59e0b;
                margin:0 4px;
            }

            /* 输入行 */
            .m79-input-row { display:flex; gap:12px; align-items:center; justify-content:center; margin-top:8px; }
            .m79-input {
                width:120px; font-size:42px; text-align:center; padding:10px 0;
                border:3px solid #d97706; border-radius:14px; outline:none;
                color:#78350f; font-weight:bold; background:#fffbeb;
            }
            .m79-input:focus { border-color:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,0.25); }
            .m79-submit {
                padding:12px 30px; font-size:20px; font-weight:bold; border:none;
                border-radius:14px; background:#f59e0b; color:#fff; cursor:pointer;
                transition:all 0.2s;
            }
            .m79-submit:hover { background:#d97706; transform:scale(1.05); }

            /* ── 阶段2 乘法对战 ── */
            .m79-battle-area {
                margin-top:100px; display:flex; flex-direction:column; align-items:center; gap:18px;
            }
            .m79-target-wrap {
                position:relative; width:200px; height:200px;
                display:flex; align-items:center; justify-content:center;
            }
            .m79-target {
                width:180px; height:180px; border-radius:50%;
                background: radial-gradient(circle,#fff 18%,#fecaca 20%,#f87171 38%,#fff 40%,#f87171 58%,#fff 60%,#ef4444 78%,#991b1b 80%);
                box-shadow:0 6px 20px rgba(239,68,68,0.35);
                display:flex; align-items:center; justify-content:center;
                font-size:48px; font-weight:bold; color:#7f1d1d;
                transition:transform 0.15s;
            }
            .m79-target.hit {
                animation:m79hit 0.5s ease-out;
            }
            @keyframes m79hit {
                0%{transform:scale(1)}
                30%{transform:scale(1.15)}
                60%{transform:scale(0.95)}
                100%{transform:scale(1)}
            }

            /* 箭矢动画 */
            .m79-arrow {
                position:absolute; font-size:40px; pointer-events:none;
                transition:all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
                z-index:10;
            }
            .m79-arrow.shot {
                top:50% !important; left:50% !important;
                transform:translate(-50%,-50%) scale(0.5) !important;
                opacity:0;
            }

            .m79-question {
                font-size:22px; font-weight:bold; color:#78350f; margin-top:10px;
            }

            .m79-options {
                display:grid; grid-template-columns:1fr 1fr; gap:14px; width:340px; margin-top:8px;
            }
            .m79-opt {
                padding:16px; font-size:26px; font-weight:bold; border:none;
                border-radius:16px; background:#fff; color:#92400e;
                border:3px solid #f59e0b; cursor:pointer; transition:all 0.2s;
            }
            .m79-opt:hover { background:#fef3c7; transform:scale(1.05); }
            .m79-opt.correct {
                background:#dcfce7 !important; border-color:#22c55e !important; color:#166534 !important;
                animation:m79pop 0.3s ease-out;
            }
            .m79-opt.wrong {
                background:#fee2e2 !important; border-color:#ef4444 !important; color:#991b1b !important;
                animation:m79shake 0.4s ease-out;
            }
            @keyframes m79pop { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
            @keyframes m79shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

            /* 正确/错误浮标 */
            .m79-float-tag {
                position:absolute; padding:8px 20px; border-radius:20px;
                font-size:18px; font-weight:bold; z-index:60; pointer-events:none;
                animation:m79floatUp 1.2s forwards;
            }
            @keyframes m79floatUp { 0%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-30px)} }
            .m79-float-tag.ok { background:#dcfce7; color:#166534; }
            .m79-float-tag.nope { background:#fee2e2; color:#991b1b; }

            /* ── 阶段切换横幅 ── */
            .m79-banner {
                position:absolute; inset:0; display:none; align-items:center; justify-content:center;
                background:rgba(254,243,199,0.92); z-index:80;
                backdrop-filter:blur(6px);
            }
            .m79-banner.show { display:flex; }
            .m79-banner-inner {
                text-align:center; animation:m79pop 0.5s ease-out;
            }
            .m79-banner-inner h2 { font-size:42px; color:#92400e; margin:0 0 12px; }
            .m79-banner-inner p { font-size:22px; color:#b45309; }
        `);
    }

    // ─── 主控 ──────────────────────────────────────────────────
    const game = {
        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30 };
            if (!state.container) return;

            state.phase = 1;
            state.step = 0;
            state.mistakes = 0;

            injectStyles();
            renderLayout();
            startPhase1();
        }
    };

    // ─── 布局 ──────────────────────────────────────────────────
    function renderLayout() {
        state.container.innerHTML = `
            <div class="m79-wrap">
                <!-- 阶段横幅 -->
                <div class="m79-banner" id="m79-banner">
                    <div class="m79-banner-inner" id="m79-banner-inner"></div>
                </div>

                <!-- 引导栏 -->
                <div class="m79-guide">
                    <span class="m79-guide-spr">🏹</span>
                    <span id="m79-guide-text"></span>
                </div>
                <div class="m79-progress" id="m79-progress"></div>

                <!-- Phase 1: 口诀填空 -->
                <div class="m79-phase active" id="m79-phase1">
                    <div class="m79-rhyme-card">
                        <div class="m79-rhyme-label">请补全乘法口诀</div>
                        <div class="m79-rhyme-text" id="m79-rhyme-text"></div>
                        <div class="m79-input-row">
                            <input class="m79-input" id="m79-rhyme-input" maxlength="2" inputmode="numeric">
                            <button class="m79-submit" id="m79-rhyme-submit">确认</button>
                        </div>
                    </div>
                </div>

                <!-- Phase 2: 乘法对战 -->
                <div class="m79-phase" id="m79-phase2">
                    <div class="m79-battle-area">
                        <div class="m79-target-wrap" id="m79-target-wrap">
                            <div class="m79-arrow" id="m79-arrow" style="top:-50px;left:50%;transform:translateX(-50%);">🏹</div>
                            <div class="m79-target" id="m79-target">🎯</div>
                        </div>
                        <div class="m79-question" id="m79-question"></div>
                        <div class="m79-options" id="m79-options"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ─── Phase 1: 口诀填空 ──────────────────────────────────────
    function startPhase1() {
        state.phase = 1;
        state.step = 0;
        // 挑 6 条不重复口诀，覆盖 7/8/9
        const bank = H.shuffle([...RHYME_BANK]);
        // 确保覆盖：至少一条含7、一条含8、一条含9（作为被乘数）
        const picked = [];
        const used7 = bank.filter(r => r.a === 7 || r.b === 7);
        const used8 = bank.filter(r => r.a === 8 || r.b === 8);
        const used9 = bank.filter(r => r.a === 9 || r.b === 9);

        // 先各取一条保证覆盖
        picked.push(H.shuffle(used7)[0]);
        picked.push(H.shuffle(used8)[0]);
        picked.push(H.shuffle(used9)[0]);

        // 去重后补齐6条
        const ids = new Set(picked.map(p => p.a + 'x' + p.b));
        for (const item of bank) {
            const id = item.a + 'x' + item.b;
            if (!ids.has(id)) {
                picked.push(item);
                ids.add(id);
                if (picked.length >= 6) break;
            }
        }

        state.rounds = picked.slice(0, 6).map(item => buildRhymeRound(item));
        H.updateGuide('补全口诀，射出神箭！🏹', 'm79-guide-text');
        updateProgress();
        showRhymeRound();
    }

    function showRhymeRound() {
        const r = state.rounds[state.step];
        const textEl = document.getElementById('m79-rhyme-text');
        const inputEl = document.getElementById('m79-rhyme-input');

        // 渲染口诀文本，空白用下划线框
        const html = r.text.replace('(  )', '<span class="m79-blank" id="m79-blank">&nbsp;&nbsp;&nbsp;</span>');
        textEl.innerHTML = html;

        inputEl.value = '';
        inputEl.focus();

        // 解绑后重新绑定
        const btn = document.getElementById('m79-rhyme-submit');
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = checkRhyme;
        inputEl.onkeyup = function (e) { if (e.key === 'Enter') checkRhyme(); };
    }

    function checkRhyme() {
        const r = state.rounds[state.step];
        const inputEl = document.getElementById('m79-rhyme-input');
        const val = inputEl.value.trim();

        if (!val) return;

        if (val === r.answer) {
            showFloatTag(state.container.querySelector('#m79-phase1'), '✅ 正确!', 'ok');
            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(showRhymeRound, 600);
                updateProgress();
            } else {
                // Phase 1 完成，切换到 Phase 2
                setTimeout(showPhaseBanner, 600);
            }
        } else {
            state.mistakes++;
            showFloatTag(state.container.querySelector('#m79-phase1'), '💡 提示：' + r.hint, 'nope');
            inputEl.value = '';
            inputEl.classList.add('shake');
            setTimeout(function () { inputEl.classList.remove('shake'); }, 500);
        }
    }

    // ─── 阶段切换横幅 ──────────────────────────────────────────
    function showPhaseBanner() {
        const banner = document.getElementById('m79-banner');
        const inner = document.getElementById('m79-banner-inner');
        inner.innerHTML = '<h2>🎯 第二关：乘法对战</h2><p>选出正确答案，射中靶心！</p>';
        banner.classList.add('show');

        setTimeout(function () {
            banner.classList.remove('show');
            startPhase2();
        }, 1500);
    }

    // ─── Phase 2: 乘法对战 ──────────────────────────────────────
    function startPhase2() {
        state.phase = 2;
        state.step = 0;

        // 切换可见区域
        document.getElementById('m79-phase1').classList.remove('active');
        document.getElementById('m79-phase2').classList.add('active');

        state.rounds = buildMulQuestions(6);
        H.updateGuide('看算式，射靶心！🏹', 'm79-guide-text');
        updateProgress();
        showBattleRound();
    }

    function showBattleRound() {
        const q = state.rounds[state.step];
        document.getElementById('m79-question').textContent = q.a + ' × ' + q.b + ' = ?';

        // 生成 4 个选项（含正确答案）
        const opts = [q.answer];
        while (opts.length < 4) {
            // 在正确答案 ±15 范围内生成干扰项（排除重复和负数）
            let fake = q.answer + H.randInt(-8, 8);
            if (fake < 1 || fake > 81 || fake === q.answer || opts.includes(fake)) continue;
            opts.push(fake);
        }

        const container = document.getElementById('m79-options');
        H.renderChoices(H.shuffle(opts).map(String), 'm79-options', function (idx, text) {
            handleBattleChoice(parseInt(text), q, container);
        });

        // 重置靶心 & 箭
        var target = document.getElementById('m79-target');
        target.classList.remove('hit');
        var arrow = document.getElementById('m79-arrow');
        arrow.className = 'm79-arrow';
        arrow.style.cssText = 'top:-50px;left:50%;transform:translateX(-50%);';
    }

    function handleBattleChoice(val, q, containerEl) {
        const correct = val === q.answer;
        const buttons = containerEl.querySelectorAll('.m79-opt');

        // 禁用所有按钮
        buttons.forEach(function (btn) {
            btn.style.pointerEvents = 'none';
        });

        if (correct) {
            // 标记正确
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === q.answer) btn.classList.add('correct');
            });

            // 箭射中靶心动画
            var arrow = document.getElementById('m79-arrow');
            arrow.classList.add('shot');
            setTimeout(function () {
                document.getElementById('m79-target').classList.add('hit');
            }, 200);

            showFloatTag(document.getElementById('m79-phase2'), '🎯 命中!', 'ok');

            state.step++;
            if (state.step < state.rounds.length) {
                setTimeout(showBattleRound, 1000);
                updateProgress();
            } else {
                setTimeout(function () {
                    H.showSettlement(
                        state.container,
                        state.levelData.reward || 30,
                        state.levelData,
                        state.mistakes,
                        '口诀射箭，百发百中！',
                        'lvl_2_7_1'
                    );
                }, 1000);
            }
        } else {
            state.mistakes++;
            buttons.forEach(function (btn) {
                if (parseInt(btn.textContent) === val) btn.classList.add('wrong');
            });
            showFloatTag(document.getElementById('m79-phase2'), '再想想!', 'nope');

            setTimeout(function () {
                // 恢复未中靶的按钮可点击
                buttons.forEach(function (btn) {
                    if (!btn.classList.contains('wrong')) {
                        btn.style.pointerEvents = '';
                    }
                });
            }, 700);
        }
    }

    // ─── 公共 UI ───────────────────────────────────────────────
    function updateProgress() {
        var el = document.getElementById('m79-progress');
        if (!el) return;
        var phaseLabel = state.phase === 1 ? '口诀填空' : '乘法对战';
        el.textContent = phaseLabel + '  ' + (state.step + 1) + ' / ' + state.rounds.length;
    }

    function showFloatTag(parent, text, type) {
        if (!parent) return;
        var tag = document.createElement('div');
        tag.className = 'm79-float-tag ' + type;
        tag.textContent = text;
        tag.style.left = '50%';
        tag.style.top = '50%';
        tag.style.transform = 'translate(-50%,-50%)';
        parent.appendChild(tag);
        setTimeout(function () { tag.remove(); }, 1300);
    }

    // ─── 暴露全局 ──────────────────────────────────────────────
    window.CurrentGameModule = game;
})();
