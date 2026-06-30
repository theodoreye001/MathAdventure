/**
 * 二年级上册 第一单元：长度单位（厘米、米；1米=100厘米）
 * 路径: src/games/grade2/g2_u1_length.js
 * 游戏: "测量迷宫"
 *   阶段一 "认识尺子": 用虚拟尺子测量物体，输入厘米数（4轮）
 *   阶段二 "单位换算": 填空 + 选择题，练习 cm/m 单位（4题）
 */

(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g2-u1-length-styles';

    let state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,       // 1=认识尺子, 2=单位换算
        round: 0,       // 当前轮次（0-based）
        totalRounds: 4,
        // 阶段一
        rulerItems: [],  // [{length, emoji, name}]
        // 阶段二
        unitQuestions: [],
        questionIndex: 0
    };

    /* ===== 关卡数据生成 ===== */

    const RULER_OBJECTS = [
        { length: 3,  emoji: '✂️',  name: '小刀' },
        { length: 7,  emoji: '🖍️',  name: '蜡笔' },
        { length: 12, emoji: '📐',  name: '三角板' },
        { length: 15, emoji: '✏️',  name: '铅笔' }
    ];

    /** 阶段二题库（每题含题目文本、类型、答案） */
    function buildUnitQuestions() {
        var pool = [
            { q: '1米 = (  )厘米',        type: 'choice', answer: '100',   opts: ['10', '50', '100', '1000'] },
            { q: '100厘米 = (  )米',       type: 'choice', answer: '1',    opts: ['1', '10', '100', '5'] },
            { q: '200厘米 = (  )米',       type: 'choice', answer: '2',    opts: ['2', '20', '200', '3'] },
            { q: '30厘米 + 70厘米 = (  )厘米', type: 'choice', answer: '100', opts: ['80', '90', '100', '110'] },
            { q: '30厘米 + 70厘米 = (  )米',   type: 'choice', answer: '1',  opts: ['1', '2', '10', '3'] },
            { q: '铅笔长约18(  )',         type: 'choice', answer: '厘米', opts: ['厘米', '米', '千米', '分米'] },
            { q: '教室门高约2(  )',        type: 'choice', answer: '米',   opts: ['厘米', '米', '分米', '毫米'] },
            { q: '5米 = (  )厘米',         type: 'choice', answer: '500',  opts: ['50', '500', '5000', '55'] },
            { q: '一根手指宽约1(  )',      type: 'choice', answer: '厘米', opts: ['厘米', '米', '分米', '毫米'] },
            { q: '1米 - 40厘米 = (  )厘米', type: 'choice', answer: '60',  opts: ['50', '60', '70', '140'] },
            { q: '40厘米 + 60厘米 = (  )米', type: 'choice', answer: '1',  opts: ['1', '2', '10', '100'] },
            { q: '数学书长约26(  )',       type: 'choice', answer: '厘米', opts: ['厘米', '米', '分米', '毫米'] }
        ];
        return H.shuffle(pool).slice(0, 4);
    }

    /* ===== 主模块 ===== */

    const game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 20, knowledgePoint: '长度单位', levelId: 'lvl_2_1_1' };
            if (!state.container) return;

            state.mistakes = 0;
            state.round = 0;
            state.phase = 0;
            state.questionIndex = 0;
            state.rulerItems = H.shuffle([...RULER_OBJECTS]);
            state.unitQuestions = buildUnitQuestions();

            injectStyles();
            game.render();
        },

        /* ---------- 渲染入口 ---------- */

        render: function () {
            state.phase = 1;
            state.round = 0;
            state.container.innerHTML = `
                <div class="len-game">
                    ${H.guideBarHTML('📏', '直尺爷爷的木工坊开始了！', 'len-guide-text')}
                    <div class="len-phase" id="len-phase1"></div>
                    <div class="len-phase" id="len-phase2" style="display:none;"></div>
                </div>
            `;
            this.renderRulerRound();
        },

        /* ======== 阶段一：认识尺子 ======== */

        renderRulerRound: function () {
            state.phase = 1;
            var obj = state.rulerItems[state.round];
            var roundLabel = state.round + 1;

            H.updateGuide('第 ' + roundLabel + ' 件：' + obj.emoji + ' ' + obj.name + ' 有多长？读读尺子吧！', 'len-guide-text');

            var phase1 = document.getElementById('len-phase1');
            phase1.style.display = '';
            phase1.innerHTML = `
                <div class="len-ruler-wrap">
                    <div class="len-object-bar-wrap">
                        <div class="len-object-label">${obj.emoji} ${obj.name}</div>
                        <div class="len-object-bar" style="width:${obj.length * 18}px;"></div>
                        <div class="len-hint">↑ 长度对齐尺子的起点</div>
                    </div>
                    <div class="len-ruler" id="len-ruler">
                        ${this.buildRulerMarks(obj.length + 3)}
                    </div>
                </div>
                <div class="len-input-row">
                    <span class="len-input-label">长度：</span>
                    <input id="len-input" type="number" class="len-input" min="1" max="30"
                           placeholder="?" autocomplete="off" />
                    <span class="len-unit">厘米</span>
                    <button id="len-btn-submit" class="len-btn-submit">确认</button>
                </div>
            `;

            // 绑定答案
            H.bindAnswerInput(
                'len-input', 'len-btn-submit',
                function (val) { return parseInt(val) === obj.length; },
                function () { this.onRulerCorrect(); }.bind(this),
                function () { this.onRulerWrong(); }.bind(this)
            );

            // 自动聚焦
            setTimeout(function () {
                var inp = document.getElementById('len-input');
                if (inp) inp.focus();
            }, 100);
        },

        /** 生成尺子刻度 HTML（每厘米一个大刻度，0.5cm 一个中刻度） */
        buildRulerMarks: function (maxCm) {
            var html = '<div class="len-ruler-body">';
            for (var i = 0; i <= maxCm; i++) {
                var isMajor = i <= 20; // 只显示到 20 标号
                html += '<div class="len-tick-group">';
                html += '<div class="len-tick len-tick-major"></div>';
                html += '<div class="len-tick-label">' + (i <= maxCm ? i : '') + '</div>';
                // 半厘米刻度
                if (i < maxCm) {
                    html += '<div class="len-tick len-tick-minor"></div>';
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        },

        onRulerCorrect: function () {
            var obj = state.rulerItems[state.round];
            H.updateGuide('对啦！' + obj.emoji + ' ' + obj.name + ' 长 ' + obj.length + ' 厘米，读得很准！', 'len-guide-text');
            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }
            state.round++;
            if (state.round >= state.totalRounds) {
                setTimeout(function () { game.startPhase2(); }, 1200);
            } else {
                setTimeout(function () { game.renderRulerRound(); }, 1200);
            }
        },

        onRulerWrong: function () {
            state.mistakes++;
            var obj = state.rulerItems[state.round];
            H.triggerError(state.container, '再数数看，' + obj.name + '对应尺子上的刻度是多少？',
                document.getElementById('len-input'));
            if (window.GameManager) {
                window.GameManager.logError(state.levelData.levelId,
                    '尺子读数：' + obj.name + ' 长度', '-', obj.length);
                window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
            }
        },

        /* ======== 阶段二：单位换算 ======== */

        startPhase2: function () {
            state.phase = 2;
            state.questionIndex = 0;
            document.getElementById('len-phase1').style.display = 'none';
            var phase2 = document.getElementById('len-phase2');
            phase2.style.display = '';
            this.renderUnitQuestion();
        },

        renderUnitQuestion: function () {
            var idx = state.questionIndex;
            var q = state.unitQuestions[idx];
            var roundLabel = idx + 1;

            H.updateGuide('换算练习 (' + roundLabel + '/' + state.totalRounds + ')：选出正确答案！', 'len-guide-text');

            var phase2 = document.getElementById('len-phase2');
            phase2.innerHTML = `
                <div class="len-unit-card">
                    <div class="len-q-num">第 ${roundLabel} 题</div>
                    <div class="len-q-text">${q.q}</div>
                    <div class="len-choices" id="len-choices"></div>
                </div>
            `;

            H.renderChoices(H.shuffle(q.opts), 'len-choices', function (i, text) {
                this.onUnitChoose(text, q);
            }.bind(this));
        },

        onUnitChoose: function (chosen, q) {
            if (chosen === q.answer) {
                // 正确
                H.updateGuide('太棒了！' + q.q.replace('(  )', '【' + q.answer + '】'), 'len-guide-text');
                if (window.GameManager) {
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                }
                state.questionIndex++;
                if (state.questionIndex >= state.totalRounds) {
                    setTimeout(function () { game.finishGame(); }, 1200);
                } else {
                    setTimeout(function () { game.renderUnitQuestion(); }, 1200);
                }
            } else {
                // 错误
                state.mistakes++;
                H.triggerError(state.container, '想一想，答案再仔细看看哦！',
                    document.querySelector('.len-choices'));
                if (window.GameManager) {
                    window.GameManager.logError(state.levelData.levelId,
                        '单位换算: ' + q.q, chosen, q.answer);
                    window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                }
            }
        },

        /* ======== 结算 ======== */

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                '你学会了用尺子测量长度，还能在厘米和米之间自由换算！',
                'lvl_2_2_1'
            );
        }
    };

    /* ===== 样式注入 ===== */

    function injectStyles() {
        H.injectStyles(STYLE_ID, `
            /* ---- 全局容器 ---- */
            .len-game {
                width: 100%; height: 100%; position: relative; overflow: hidden;
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                display: flex; flex-direction: column; align-items: center;
                padding-top: 80px;
            }

            /* ---- 阶段容器 ---- */
            .len-phase {
                width: 100%; flex: 1;
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; gap: 30px;
            }

            /* ==================== 阶段一：尺子 ==================== */
            .len-ruler-wrap {
                display: flex; flex-direction: column; align-items: center;
                background: rgba(255,255,255,0.85); padding: 30px 35px;
                border-radius: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                border: 3px solid #bae6fd;
            }

            /* 物体条 */
            .len-object-bar-wrap {
                display: flex; flex-direction: column; align-items: flex-start;
                margin-bottom: 16px; width: 100%;
            }
            .len-object-label {
                font-size: 20px; font-weight: bold; color: #0369a1;
                margin-bottom: 6px;
            }
            .len-object-bar {
                height: 22px; border-radius: 11px;
                background: linear-gradient(90deg, #f97316, #fb923c);
                box-shadow: 0 3px 8px rgba(249,115,22,0.3);
                transition: width 0.5s ease;
                min-width: 20px;
            }
            .len-hint {
                font-size: 13px; color: #94a3b8; margin-top: 4px;
            }

            /* 尺子主体 */
            .len-ruler {
                width: 420px; height: 64px; position: relative;
                background: linear-gradient(to bottom, #fef9c3 0%, #fef08a 100%);
                border: 2px solid #ca8a04; border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .len-ruler-body {
                display: flex; height: 100%; padding: 0 4px;
                align-items: flex-start;
            }
            .len-tick-group {
                display: flex; flex-direction: column; align-items: center;
                width: 18px; flex-shrink: 0;
            }
            .len-tick {
                width: 2px; background: #78350f; flex-shrink: 0;
            }
            .len-tick-major {
                height: 20px; margin-top: 4px;
                border-left: 2px solid #78350f;
            }
            .len-tick-minor {
                height: 12px; margin-top: 2px;
                border-left: 1.5px solid #a16207;
                opacity: 0.6;
            }
            .len-tick-label {
                font-size: 10px; font-weight: bold; color: #78350f;
                margin-top: 2px; line-height: 1;
            }

            /* 输入行 */
            .len-input-row {
                display: flex; align-items: center; gap: 10px;
                margin-top: 10px;
            }
            .len-input-label {
                font-size: 22px; font-weight: bold; color: #0369a1;
            }
            .len-input {
                width: 80px; height: 50px; font-size: 28px; text-align: center;
                border: 3px solid #0ea5e9; border-radius: 14px;
                outline: none; background: white; color: #0c4a6e;
                transition: border-color 0.3s;
            }
            .len-input:focus {
                border-color: #0284c7;
                box-shadow: 0 0 0 4px rgba(14,165,233,0.15);
            }
            .len-unit {
                font-size: 20px; font-weight: bold; color: #64748b;
            }
            .len-btn-submit {
                padding: 14px 30px; font-size: 18px; font-weight: bold;
                background: #0ea5e9; color: white; border: none;
                border-radius: 14px; cursor: pointer;
                box-shadow: 0 4px 0 #0284c7;
                transition: all 0.15s;
            }
            .len-btn-submit:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 0 #0284c7;
            }
            .len-btn-submit:active {
                transform: translateY(2px);
                box-shadow: 0 1px 0 #0284c7;
            }

            /* ==================== 阶段二：单位换算 ==================== */
            .len-unit-card {
                background: rgba(255,255,255,0.92); padding: 35px 40px;
                border-radius: 28px; box-shadow: 0 10px 35px rgba(0,0,0,0.07);
                border: 3px solid #a78bfa;
                text-align: center; min-width: 360px;
            }
            .len-q-num {
                font-size: 16px; color: #7c3aed; font-weight: bold;
                margin-bottom: 10px;
            }
            .len-q-text {
                font-size: 28px; font-weight: bold; color: #1e1b4b;
                margin-bottom: 28px; line-height: 1.5;
            }
            .len-choices {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 14px;
            }

            /* ---- 动画 ---- */
            @keyframes len-bounce {
                0%   { transform: scale(0.8); opacity: 0; }
                60%  { transform: scale(1.08); opacity: 1; }
                100% { transform: scale(1); }
            }
            .len-unit-card { animation: len-bounce 0.4s ease-out; }

            @keyframes len-shake {
                10%, 90% { transform: translateX(-1px); }
                20%, 80% { transform: translateX(2px); }
                30%, 50%, 70% { transform: translateX(-4px); }
                40%, 60% { transform: translateX(4px); }
            }
            .len-shake { animation: len-shake 0.4s ease; }
        `);
    }

    // 挂载到全局
    window.CurrentGameModule = game;
})();
