/**
 * 一年级下册 第二单元：20以内的退位减法（破十法可视化）
 * 路径: src/games/grade1/g1_d_u2_sub20.js
 *
 * Phase 1: 破十过关 — 可视化拆分过程（拖拽交互）
 * Phase 2: 快速口算 — 5道随机退位减法选择题
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g1-d-u2-sub20-styles';

    let state = {
        container: null,
        levelData: null,
        mistakes: 0,
        // Phase 1
        phase: 1,
        numA: 0,          // 被减数 (11-19)
        numB: 0,          // 减数
        answer: 0,        // 正确答案
        onesDigit: 0,     // numA 的个位
        breakStep: 0,     // 0:待操作 1:从个位拆出 2:从10里再拆 3:完成
        removedFromOnes: 0, // 从个位部分移除的 orb 数量
        removedFromTen: 0,  // 从十里面移除的 orb 数量
        // Phase 2
        p2Index: 0,       // 当前第几题
        p2Total: 5,       // 共几题
        p2Score: 0        // 答对几题
    };

    const game = {
        init(containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData;
            if (!state.container) return;

            H.injectStyles(STYLE_ID, this.css());
            this.resetState();
            this.render();
            this.startPhase1();
        },

        resetState() {
            state.mistakes = 0;
            state.phase = 1;
            state.p2Index = 0;
            state.p2Score = 0;
            state.breakStep = 0;
            state.removedFromOnes = 0;
            state.removedFromTen = 0;
        },

        /* ==================== CSS ==================== */
        css() {
            return `
                .s20-wrapper {
                    width:100%;height:100%;position:relative;overflow:hidden;
                    font-family:'PingFang SC','Microsoft YaHei',sans-serif;
                    background:linear-gradient(135deg,#ede9fe 0%,#dbeafe 100%);
                    display:flex;flex-direction:column;align-items:center;
                    user-select:none;
                }

                /* ---- Phase 1: 破十过关 ---- */
                .s20-phase { display:none;width:100%;flex:1;flex-direction:column;
                    align-items:center;justify-content:center;gap:25px; }
                .s20-phase.active { display:flex; }

                /* 算式标题 */
                .s20-equation {
                    font-size:52px;font-weight:bold;color:#4c1d95;
                    background:white;padding:14px 50px;border-radius:30px;
                    border:4px solid #a78bfa;box-shadow:0 6px 20px rgba(124,58,237,0.15);
                }
                .s20-equation .s20-eq-sub { color:#7c3aed; }

                /* orb 展示区 */
                .s20-orbs-stage {
                    display:flex;gap:50px;align-items:flex-start;justify-content:center;
                    flex-wrap:wrap;
                }
                .s20-orb-group {
                    display:flex;flex-direction:column;align-items:center;gap:10px;
                }
                .s20-orb-group-label {
                    font-size:22px;font-weight:bold;color:#6d28d9;
                    background:rgba(255,255,255,0.7);padding:6px 20px;border-radius:20px;
                }
                .s20-orb-grid {
                    display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
                    min-width:120px;min-height:80px;padding:15px;
                    border:3px dashed #c4b5fd;border-radius:20px;
                    background:rgba(255,255,255,0.4);
                    transition:all 0.3s;
                }
                .s20-orb-grid.highlight {
                    border-color:#f59e0b;background:rgba(251,191,36,0.1);
                }
                .s20-orb-grid.done {
                    border-color:#10b981;background:rgba(16,185,129,0.08);
                }

                .s20-orb {
                    width:48px;height:48px;border-radius:50%;font-size:28px;
                    display:flex;align-items:center;justify-content:center;
                    transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);
                    cursor:pointer;position:relative;
                    box-shadow:0 4px 8px rgba(0,0,0,0.15);
                }
                .s20-orb.red { background:linear-gradient(135deg,#fca5a5,#ef4444); }
                .s20-orb.blue { background:linear-gradient(135deg,#93c5fd,#3b82f6); }
                .s20-orb.gold {
                    background:linear-gradient(135deg,#fde68a,#f59e0b);
                    box-shadow:0 0 15px rgba(245,158,11,0.4);
                }
                .s20-orb.removed {
                    opacity:0.2;transform:scale(0.6);pointer-events:none;
                }
                .s20-orb:hover:not(.removed) {
                    transform:scale(1.15);
                }

                /* 提示文字 */
                .s20-hint {
                    font-size:24px;color:#7c3aed;font-weight:bold;
                    background:rgba(255,255,255,0.8);padding:12px 30px;
                    border-radius:20px;border:2px solid #c4b5fd;
                }

                /* 分割线箭头 */
                .s20-arrow-row {
                    display:flex;align-items:center;gap:20px;
                    font-size:36px;color:#7c3aed;
                }

                /* ---- Phase 2: 快速口算 ---- */
                .s20-p2-wrapper {
                    width:100%;flex:1;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:30px;
                }
                .s20-p2-counter {
                    font-size:20px;color:#6d28d9;font-weight:bold;
                }
                .s20-p2-eq {
                    font-size:56px;font-weight:bold;color:#4c1d95;
                    background:white;padding:20px 60px;border-radius:30px;
                    border:4px solid #a78bfa;
                }
                .s20-p2-choices {
                    display:grid;grid-template-columns:1fr 1fr;gap:18px;
                    width:80%;max-width:500px;
                }
                .s20-p2-btn {
                    padding:18px 0;font-size:30px;font-weight:bold;
                    background:white;border:4px solid #a78bfa;border-radius:20px;
                    color:#4c1d95;cursor:pointer;transition:all 0.2s;
                }
                .s20-p2-btn:hover {
                    background:#a78bfa;color:white;transform:scale(1.05);
                }
                .s20-p2-btn.correct {
                    background:#10b981;border-color:#10b981;color:white;
                    animation:s20-bounce 0.5s;
                }
                .s20-p2-btn.wrong {
                    background:#ef4444;border-color:#ef4444;color:white;
                    animation:s20-shake 0.4s;
                }
                @keyframes s20-bounce {
                    0%,100%{transform:scale(1)} 50%{transform:scale(1.15)}
                }
                @keyframes s20-shake {
                    0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
                }
                .s20-p2-disabled { pointer-events:none; }
            `;
        },

        /* ==================== Render ==================== */
        render() {
            state.container.innerHTML = `
                <div class="s20-wrapper">
                    ${H.guideBarHTML('✨', '准备破十过关！')}
                    <div id="s20-phase1" class="s20-phase active"></div>
                    <div id="s20-phase2" class="s20-phase"></div>
                </div>
            `;
        },

        /* ==================== Phase 1: 破十过关 ==================== */
        startPhase1() {
            state.phase = 1;
            state.breakStep = 0;
            state.removedFromOnes = 0;
            state.removedFromTen = 0;

            // 生成退位减法题目: numA (11-19), numB > onesDigit (确保退位)
            for (let attempt = 0; attempt < 100; attempt++) {
                const a = H.randInt(11, 19);
                const ones = a % 10;
                if (ones >= 9) continue;
                const minB = ones + 1;
                const maxB = Math.min(9, a - 1);
                if (minB > maxB) continue;
                state.numA = a;
                state.onesDigit = ones;
                state.numB = H.randInt(minB, maxB);
                break;
            }
            // 兜底
            if (!state.numB) {
                state.numA = 13; state.numB = 5; state.onesDigit = 3;
            }
            state.answer = state.numA - state.numB;

            this.renderPhase1();
            this.updateGuide(`题目：${state.numA} - ${state.numB}，先点击个位部分的圆球把它拆开！`);
        },

        renderPhase1() {
            const p1 = document.getElementById('s20-phase1');
            const onesDigit = state.numA % 10;
            const tenCount = 10;

            // 构建 orb 布局：左边是 10 个一组（十），右边是个位部分
            // 视觉上：13 = 十(10个红) + 个位(3个蓝)
            p1.innerHTML = `
                <div class="s20-equation">${state.numA} <span class="s20-eq-sub">-</span> ${state.numB}</div>
                <div class="s20-hint" id="s20-step-hint">点击右边个位区的球，把个位拆出来给减法</div>
                <div class="s20-orbs-stage">
                    <div class="s20-orb-group">
                        <div class="s20-orb-group-label">十位 (10个)</div>
                        <div class="s20-orb-grid" id="s20-ten-grid">
                            ${Array(tenCount).fill(0).map((_, i) =>
                                `<div class="s20-orb red" data-zone="ten" data-idx="${i}">🔴</div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="s20-arrow-row" id="s20-arrow">➡️</div>
                    <div class="s20-orb-group">
                        <div class="s20-orb-group-label">个位 (${onesDigit}个)</div>
                        <div class="s20-orb-grid" id="s20-ones-grid">
                            ${Array(onesDigit).fill(0).map((_, i) =>
                                `<div class="s20-orb blue" data-zone="ones" data-idx="${i}">🟡</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <div id="s20-result-display" style="display:none;font-size:36px;font-weight:bold;color:#059669;
                    background:white;padding:12px 30px;border-radius:20px;border:3px solid #10b981;"></div>
            `;

            this.bindPhase1Events();
        },

        bindPhase1Events() {
            // Step 1: 点击个位区的 orb，逐个移除（模拟从个位拿走）
            document.querySelectorAll('#s20-ones-grid .s20-orb').forEach(orb => {
                orb.onclick = () => this.handleOnesClick(orb);
            });
        },

        handleOnesClick(orb) {
            if (state.breakStep > 1) return; // 已进入下一步
            if (orb.classList.contains('removed')) return;

            // Step 1: 先把个位全部移走（给减法用掉个位部分）
            // 破十法逻辑：13 - 5
            // Step 1: 把 13 拆成 10 和 3
            // Step 2: 10 - 5 = 5
            // Step 3: 5 + 3 = 8

            // 交互设计：点击个位 orb 逐个移除，表示"把个位从被减数里拆出来"
            orb.classList.add('removed');
            state.removedFromOnes++;

            const onesDigit = state.numA % 10;

            if (state.removedFromOnes >= onesDigit) {
                // 个位全部拆完，进入第二步：从十里面减去 numB
                state.breakStep = 1;
                document.getElementById('s20-step-hint').textContent =
                    `个位拆完了！现在从十位的 10 个里拿走 ${state.numB} 个`;
                document.getElementById('s20-ten-grid').classList.add('highlight');
                document.getElementById('s20-ones-grid').classList.add('done');

                // 绑定十位区的点击
                document.querySelectorAll('#s20-ten-grid .s20-orb').forEach(orb2 => {
                    orb2.onclick = () => this.handleTenClick(orb2);
                });

                this.updateGuide(`个位的 ${onesDigit} 个拆开了！现在从 10 里面减去 ${state.numB} 吧！`);
            } else {
                this.updateGuide(`再拆！还有 ${onesDigit - state.removedFromOnes} 个要拆`);
            }
        },

        handleTenClick(orb) {
            if (state.breakStep !== 1) return;
            if (orb.classList.contains('removed')) return;

            orb.classList.add('removed');
            state.removedFromTen++;

            if (state.removedFromTen >= state.numB) {
                // 完成！
                state.breakStep = 2;
                this.showBreakResult();
            } else {
                this.updateGuide(`再拿！还需要从 10 里拿走 ${state.numB - state.removedFromTen} 个`);
            }
        },

        showBreakResult() {
            const tenRemain = 10 - state.numB;
            const onesDigit = state.numA % 10;
            const result = tenRemain + onesDigit;

            document.getElementById('s20-ten-grid').classList.remove('highlight');
            document.getElementById('s20-ten-grid').classList.add('done');

            document.getElementById('s20-step-hint').textContent =
                `破十成功！10 - ${state.numB} = ${tenRemain}，再加回 ${onesDigit} = ${result}`;

            const resultEl = document.getElementById('s20-result-display');
            resultEl.style.display = 'block';
            resultEl.innerHTML = `${state.numA} - ${state.numB} = <span style="color:#7c3aed">${tenRemain}</span> + <span style="color:#2563eb">${onesDigit}</span> = <span style="color:#059669;font-size:42px">${result}</span>`;

            this.updateGuide(`太棒了！破十法成功：${state.numA} - ${state.numB} = ${result}`);

            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 15);
                window.GameManager.logError(state.levelData.levelId, '破十法演示',
                    `${state.numA}-${state.numB}`, result);
            }

            setTimeout(() => this.startPhase2(), 3000);
        },

        /* ==================== Phase 2: 快速口算 ==================== */
        startPhase2() {
            state.phase = 2;
            state.p2Index = 0;
            state.p2Score = 0;

            document.getElementById('s20-phase1').classList.remove('active');
            document.getElementById('s20-phase2').classList.add('active');

            this.generateP2Question();
        },

        generateP2Question() {
            if (state.p2Index >= state.p2Total) {
                this.finishGame();
                return;
            }

            // 生成有效退位减法（用循环避免递归风险）
            let numA, numB;
            for (let attempt = 0; attempt < 100; attempt++) {
                numA = H.randInt(11, 19);
                const realOnes = numA % 10;
                if (realOnes >= 9) continue; // 个位是9无法退位减法
                const minB = realOnes + 1;
                const maxB = Math.min(9, numA - 1);
                if (minB > maxB) continue;
                numB = H.randInt(minB, maxB);
                break;
            }
            // 兜底
            if (!numB) { numA = 13; numB = 5; }
            const answer = numA - numB;

            // 生成4个选项（包含正确答案）
            const options = new Set([answer]);
            while (options.size < 4) {
                const fake = answer + H.randInt(-3, 3);
                if (fake >= 1 && fake <= 18 && fake !== answer) {
                    options.add(fake);
                }
            }
            const shuffled = H.shuffle([...options]);

            const p2 = document.getElementById('s20-phase2');
            p2.innerHTML = `
                <div class="s20-p2-wrapper">
                    <div class="s20-p2-counter">第 ${state.p2Index + 1} / ${state.p2Total} 题</div>
                    <div class="s20-p2-eq">${numA} - ${numB} = ?</div>
                    <div class="s20-p2-choices" id="s20-p2-choices">
                        ${shuffled.map((opt, i) =>
                            `<button class="s20-p2-btn" data-val="${opt}">${opt}</button>`
                        ).join('')}
                    </div>
                </div>
            `;

            this.updateGuide(`快速口算！${numA} - ${numB} = ?`);

            document.querySelectorAll('#s20-p2-choices .s20-p2-btn').forEach(btn => {
                btn.onclick = () => this.handleP2Answer(btn, parseInt(btn.dataset.val), answer);
            });
        },

        handleP2Answer(btn, chosen, correct) {
            // 禁用所有按钮
            document.querySelectorAll('#s20-p2-choices .s20-p2-btn').forEach(b => {
                b.classList.add('s20-p2-disabled');
            });

            if (chosen === correct) {
                btn.classList.add('correct');
                state.p2Score++;
                this.updateGuide(`答对了！${chosen} 是正确的！`);
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
            } else {
                btn.classList.add('wrong');
                state.mistakes++;
                this.updateGuide(`答错了，正确答案是 ${correct}`);
                // 高亮正确答案
                document.querySelectorAll('#s20-p2-choices .s20-p2-btn').forEach(b => {
                    if (parseInt(b.dataset.val) === correct) {
                        b.classList.add('correct');
                    }
                });
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId, '退位减法口算', chosen, correct);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }

            state.p2Index++;
            setTimeout(() => this.generateP2Question(), 1500);
        },

        /* ==================== 通关 ==================== */
        finishGame() {
            H.showSettlement(
                state.container,
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                `你已经掌握了破十法！答对了 ${state.p2Score}/${state.p2Total} 道口算题。`,
                'lvl_1_d_3'
            );
        },

        /* ==================== 工具 ==================== */
        updateGuide(text) {
            H.updateGuide(text);
        }
    };

    window.CurrentGameModule = game;
})();
