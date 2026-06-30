/**
 * 二年级下册 第二单元：表内除法（一）—— 分宝大师
 * 路径: src/games/grade2/g2_d_u2_divide.js
 *
 * Phase 1: 平均分 — 将宝石平均分到 M 个组（点击分配交互，3 轮）
 * Phase 2: 除法口算 — 选择题，5 道，2~6 乘法表范围内
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-d-u2-divide-styles';

    // ---- 题库：Phase 1 平均分 ----
    const P1_PROBLEMS = [
        { total: 12, groups: 3 }, // 12÷3
        { total: 8,  groups: 4 }, // 8÷4
        { total: 15, groups: 5 }, // 15÷5
    ];

    // ---- 题库：Phase 2 口算 ----
    const P2_TOTAL = 5;

    let state = {
        container: null,
        levelData: null,
        mistakes: 0,
        // Phase 1
        phase: 1,
        p1Index: 0,         // 当前第几轮
        p1Total: P1_PROBLEMS.length,
        p1TotalItems: 0,    // 本轮宝石总数
        p1Groups: 0,        // 本轮组数
        p1PerGroup: 0,      // 每组应分几个
        p1Remaining: 0,     // 还剩几个未分
        p1Distribution: [], // 每组当前分配数 [n, n, ...]
        p1Locked: false,
        // Phase 2
        p2Index: 0,
        p2Total: P2_TOTAL,
        p2Score: 0,
        p2Locked: false,
    };

    const game = {
        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || {
                reward: 10,
                knowledgePoint: '表内除法',
                levelId: 'lvl_2_d_3',
            };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, this.css());
            this.resetState();
            this.render();
            this.startPhase1();
        },

        resetState() {
            state.mistakes = 0;
            state.phase = 1;
            state.p1Index = 0;
            state.p1Locked = false;
            state.p2Index = 0;
            state.p2Score = 0;
            state.p2Locked = false;
        },

        /* ======================== CSS ======================== */
        css() {
            return `
                .div-wrapper {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(135deg,#fdf2f8 0%,#ede9fe 50%,#dbeafe 100%);
                    display:flex;flex-direction:column;align-items:center;
                    user-select:none;
                }

                /* ---- Phase containers ---- */
                .div-phase { display:none;width:100%;flex:1;flex-direction:column;
                    align-items:center;justify-content:center;gap:20px; }
                .div-phase.active { display:flex; }

                /* ---- Round indicator ---- */
                .div-round-bar {
                    font-size:18px;color:#7c3aed;font-weight:bold;
                    background:rgba(255,255,255,0.8);padding:8px 24px;
                    border-radius:20px;border:2px solid #c4b5fd;
                }

                /* ---- Equation banner ---- */
                .div-eq {
                    font-size:44px;font-weight:bold;color:#4c1d95;
                    background:white;padding:14px 48px;border-radius:28px;
                    border:4px solid #a78bfa;box-shadow:0 6px 20px rgba(124,58,237,0.15);
                    text-align:center;
                }
                .div-eq .div-eq-sign { color:#7c3aed; }

                /* ---- Remaining gems display ---- */
                .div-gems-row {
                    display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
                    background:rgba(255,255,255,0.6);padding:14px 24px;
                    border-radius:18px;border:3px dashed #c4b5fd;
                    min-height:64px;min-width:200px;transition:all 0.3s;
                }
                .div-gems-row.empty {
                    border-color:#10b981;background:rgba(16,185,129,0.06);
                }
                .div-gem {
                    width:44px;height:44px;font-size:28px;
                    display:flex;align-items:center;justify-content:center;
                    transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
                    cursor:default;
                }
                .div-gem.fly {
                    opacity:0;transform:scale(0.3) translateY(40px);
                }

                /* ---- Groups area ---- */
                .div-groups {
                    display:flex;gap:16px;flex-wrap:wrap;justify-content:center;
                }
                .div-group {
                    display:flex;flex-direction:column;align-items:center;gap:6px;
                    padding:12px 16px;border-radius:18px;cursor:pointer;
                    border:4px solid #a78bfa;background:rgba(255,255,255,0.7);
                    transition:all 0.25s;min-width:80px;
                }
                .div-group:hover:not(.div-group-done) {
                    transform:scale(1.08);border-color:#7c3aed;
                    background:rgba(167,139,250,0.15);
                }
                .div-group.div-group-full {
                    border-color:#f59e0b;background:rgba(251,191,36,0.1);
                }
                .div-group.div-group-done {
                    border-color:#10b981;background:rgba(16,185,129,0.1);
                    cursor:default;animation:div-pop 0.4s ease;
                }
                @keyframes div-pop {
                    0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)}
                }
                .div-group-label {
                    font-size:16px;font-weight:bold;color:#6d28d9;
                }
                .div-group-gems {
                    display:flex;flex-wrap:wrap;gap:4px;justify-content:center;
                    min-height:36px;min-width:50px;
                }
                .div-group-gems .div-gem {
                    width:32px;height:32px;font-size:20px;cursor:default;
                }
                .div-group-count {
                    font-size:14px;color:#7c3aed;font-weight:bold;
                    background:white;padding:2px 10px;border-radius:10px;
                    border:2px solid #c4b5fd;
                }

                /* ---- Hint ---- */
                .div-hint {
                    font-size:20px;color:#7c3aed;font-weight:bold;
                    background:rgba(255,255,255,0.85);padding:10px 28px;
                    border-radius:18px;border:2px solid #c4b5fd;
                    text-align:center;max-width:90%;
                }

                /* ---- Phase 2: 口算 ---- */
                .div-p2-wrap {
                    width:100%;flex:1;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:28px;
                }
                .div-p2-counter {
                    font-size:20px;color:#6d28d9;font-weight:bold;
                }
                .div-p2-eq {
                    font-size:52px;font-weight:bold;color:#4c1d95;
                    background:white;padding:18px 56px;border-radius:28px;
                    border:4px solid #a78bfa;
                }
                .div-p2-choices {
                    display:grid;grid-template-columns:1fr 1fr;gap:16px;
                    width:80%;max-width:480px;
                }
                .div-p2-btn {
                    padding:18px 0;font-size:30px;font-weight:bold;
                    background:white;border:4px solid #a78bfa;border-radius:20px;
                    color:#4c1d95;cursor:pointer;transition:all 0.2s;
                }
                .div-p2-btn:hover:not(.div-p2-disabled) {
                    background:#a78bfa;color:white;transform:scale(1.05);
                }
                .div-p2-btn.correct {
                    background:#10b981;border-color:#10b981;color:white;
                    animation:div-bounce 0.5s;
                }
                .div-p2-btn.wrong {
                    background:#ef4444;border-color:#ef4444;color:white;
                    animation:div-shake 0.4s;
                }
                @keyframes div-bounce {
                    0%,100%{transform:scale(1)} 50%{transform:scale(1.15)}
                }
                @keyframes div-shake {
                    0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
                }
                .div-p2-disabled { pointer-events:none; }
            `;
        },

        /* ======================== Render ======================== */
        render() {
            state.container.innerHTML = `
                <div class="div-wrapper">
                    ${H.guideBarHTML('💎', '准备分宝石！')}
                    <div id="div-phase1" class="div-phase active"></div>
                    <div id="div-phase2" class="div-phase"></div>
                </div>
            `;
        },

        /* ======================== Phase 1: 平均分 ======================== */
        startPhase1() {
            state.phase = 1;
            state.p1Index = 0;
            this.renderP1Round();
        },

        renderP1Round() {
            if (state.p1Index >= state.p1Total) {
                // Phase 1 全部完成，进入 Phase 2
                setTimeout(() => this.startPhase2(), 800);
                return;
            }

            const prob = P1_PROBLEMS[state.p1Index];
            state.p1TotalItems = prob.total;
            state.p1Groups = prob.groups;
            state.p1PerGroup = prob.total / prob.groups;
            state.p1Remaining = prob.total;
            state.p1Distribution = new Array(prob.groups).fill(0);
            state.p1Locked = false;

            const p1 = document.getElementById('div-phase1');
            p1.innerHTML = `
                <div class="div-round-bar">第 ${state.p1Index + 1} / ${state.p1Total} 轮</div>
                <div class="div-eq">${prob.total} <span class="div-eq-sign">÷</span> ${prob.groups} = ?</div>
                <div class="div-hint" id="div-p1-hint">点击下方的盒子，把 ${prob.total} 颗宝石平均分进 ${prob.groups} 个盒子</div>
                <div class="div-gems-row" id="div-gems-row">
                    ${Array(prob.total).fill(0).map((_, i) =>
                        `<div class="div-gem" data-idx="${i}">💎</div>`
                    ).join('')}
                </div>
                <div class="div-groups" id="div-groups">
                    ${Array(prob.groups).fill(0).map((_, i) =>
                        `<div class="div-group" data-g="${i}">
                            <div class="div-group-label">盒子${i + 1}</div>
                            <div class="div-group-gems" id="div-grp-${i}"></div>
                            <div class="div-group-count" id="div-grp-cnt-${i}">0 / ${state.p1PerGroup}</div>
                        </div>`
                    ).join('')}
                </div>
            `;

            this.bindP1Events();
            this.updateGuide(`第${state.p1Index + 1}题：把 ${prob.total} 颗💎平均分到 ${prob.groups} 个盒子里，点击盒子分配！`);
        },

        bindP1Events() {
            document.querySelectorAll('#div-groups .div-group').forEach(grp => {
                grp.onclick = () => this.handleGroupClick(parseInt(grp.dataset.g));
            });
        },

        handleGroupClick(gIdx) {
            if (state.p1Locked) return;
            if (state.p1Remaining <= 0) return;

            // 检查这组是否已经满了
            if (state.p1Distribution[gIdx] >= state.p1PerGroup) return;

            // 分配一颗宝石
            state.p1Distribution[gIdx]++;
            state.p1Remaining--;

            // 从 gems-row 移除一颗（飞行动画）
            const gemRow = document.getElementById('div-gems-row');
            const firstGem = gemRow.querySelector('.div-gem:not(.fly)');
            if (firstGem) {
                firstGem.classList.add('fly');
                setTimeout(() => firstGem.remove(), 350);
            }

            // 更新组 UI
            const grpGems = document.getElementById(`div-grp-${gIdx}`);
            const grpCnt = document.getElementById(`div-grp-cnt-${gIdx}`);
            grpGems.innerHTML += `<div class="div-gem">💎</div>`;
            grpCnt.textContent = `${state.p1Distribution[gIdx]} / ${state.p1PerGroup}`;

            const grp = grpGems.closest('.div-group');
            if (state.p1Distribution[gIdx] >= state.p1PerGroup) {
                grp.classList.add('div-group-done');
                this.updateGuide(`盒子${gIdx + 1}分好了！(${state.p1PerGroup}颗) ${state.p1Remaining > 0 ? '还有' + state.p1Remaining + '颗要分' : ''}`);
            } else {
                this.updateGuide(`盒子${gIdx + 1}已有${state.p1Distribution[gIdx]}颗，还差${state.p1PerGroup - state.p1Distribution[gIdx]}颗`);
            }

            // 全部分完
            if (state.p1Remaining <= 0) {
                state.p1Locked = true;
                document.getElementById('div-gems-row').classList.add('done');
                this.updateGuide(`分完了！${state.p1TotalItems} ÷ ${state.p1Groups} = ${state.p1PerGroup}，每盒${state.p1PerGroup}颗！`);

                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }

                // 标记所有组为完成
                document.querySelectorAll('#div-groups .div-group').forEach(g => {
                    g.classList.add('div-group-done');
                });

                // 进入下一轮
                state.p1Index++;
                setTimeout(() => this.renderP1Round(), 1800);
            }
        },

        /* ======================== Phase 2: 除法口算 ======================== */
        startPhase2() {
            state.phase = 2;
            state.p2Index = 0;
            state.p2Score = 0;

            document.getElementById('div-phase1').classList.remove('active');
            document.getElementById('div-phase2').classList.add('active');

            this.updateGuide('除法口算时间！看谁算得又快又准！');
            this.renderP2Question();
        },

        renderP2Question() {
            if (state.p2Index >= state.p2Total) {
                this.finishGame();
                return;
            }

            // 用 2~6 乘法表生成除法题
            const a = H.randInt(2, 6);
            const b = H.randInt(2, 6);
            const dividend = a * b;
            const divisor = b;
            const answer = a;

            // 生成 4 个选项
            const options = new Set([answer]);
            while (options.size < 4) {
                const fake = H.randInt(2, 6);
                if (fake !== answer) options.add(fake);
            }
            const shuffled = H.shuffle([...options]);

            const p2 = document.getElementById('div-phase2');
            p2.innerHTML = `
                <div class="div-p2-wrap">
                    <div class="div-p2-counter">第 ${state.p2Index + 1} / ${state.p2Total} 题</div>
                    <div class="div-p2-eq">${dividend} <span class="div-eq-sign">÷</span> ${divisor} = ?</div>
                    <div class="div-p2-choices" id="div-p2-choices">
                        ${shuffled.map(opt =>
                            `<button class="div-p2-btn" data-val="${opt}">${opt}</button>`
                        ).join('')}
                    </div>
                </div>
            `;

            this.updateGuide(`${dividend} ÷ ${divisor} = ?，选择正确答案！`);

            document.querySelectorAll('#div-p2-choices .div-p2-btn').forEach(btn => {
                btn.onclick = () => this.handleP2Answer(btn, parseInt(btn.dataset.val), answer,
                    `${dividend}÷${divisor}`);
            });
        },

        handleP2Answer(btn, chosen, correct, questionStr) {
            if (state.p2Locked) return;
            state.p2Locked = true;

            // 禁用所有按钮
            document.querySelectorAll('#div-p2-choices .div-p2-btn').forEach(b => {
                b.classList.add('div-p2-disabled');
            });

            if (chosen === correct) {
                btn.classList.add('correct');
                state.p2Score++;
                this.updateGuide(`答对了！${correct} 是正确的！`);
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
            } else {
                btn.classList.add('wrong');
                state.mistakes++;
                this.updateGuide(`答错了，正确答案是 ${correct}`);
                // 高亮正确答案
                document.querySelectorAll('#div-p2-choices .div-p2-btn').forEach(b => {
                    if (parseInt(b.dataset.val) === correct) {
                        b.classList.add('correct');
                    }
                });
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, questionStr, chosen, correct);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }

            state.p2Index++;
            state.p2Locked = false;
            setTimeout(() => this.renderP2Question(), 1400);
        },

        /* ======================== 通关结算 ======================== */
        finishGame() {
            H.showSettlement(
                state.container,
                state.levelData.reward || 10,
                state.levelData,
                state.mistakes,
                `你已经掌握了表内除法！口算答对了 ${state.p2Score}/${state.p2Total} 道题。`,
                'lvl_2_d_3'
            );
        },

        /* ======================== 工具 ======================== */
        updateGuide(text) {
            H.updateGuide(text);
        },

        destroy() {
            if (state.container) state.container.innerHTML = '';
            const style = document.getElementById(STYLE_ID);
            if (style) style.remove();
        },
    };

    window.CurrentGameModule = game;
})();
