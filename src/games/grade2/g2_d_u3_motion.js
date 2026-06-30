/**
 * 二年级下册 第三单元：图形的运动（一）
 * 路径: src/games/grade2/g2_d_u3_motion.js
 *
 * 两阶段游戏 "魔法门":
 *   Phase 1 "对称判断" — 判断图形是否为轴对称图形（5题，是/否）
 *   Phase 2 "运动分类" — 将运动方式分类为平移或旋转（5题）
 */

(function () {
    var H = window.GameHelpers;
    var STYLE_ID = 'g2-d-u3-motion-styles';

    /* ==================== Phase 1: 对称判断题目 ==================== */

    /**
     * 5道对称判断题：
     *   shape: SVG 绘制函数名
     *   answer: true = 轴对称, false = 非轴对称
     *   label:  图形名称
     */
    var symmetryQuestions = [
        { shape: 'heart',     answer: true,  label: '爱心' },
        { shape: 'butterfly', answer: true,  label: '蝴蝶' },
        { shape: 'house',     answer: true,  label: '小房子' },
        { shape: 'flag',      answer: false, label: '小旗子' },
        { shape: 'fish',      answer: false, label: '小鱼（方向不对称）' }
    ];

    /* ==================== Phase 2: 运动分类题目 ==================== */

    function buildMotionQuestions() {
        return H.shuffle([
            { motion: 'car',        answer: '平移', label: '小汽车沿直线行驶' },
            { motion: 'fan',        answer: '旋转', label: '电风扇转动' },
            { motion: 'elevator',   answer: '平移', label: '电梯上下移动' },
            { motion: 'windmill',   answer: '旋转', label: '风车转动' },
            { motion: 'sliding',    answer: '平移', label: '拉抽屉' },
            { motion: 'door',       answer: '旋转', label: '开门' },
            { motion: 'train',      answer: '平移', label: '火车沿铁轨行驶' },
            { motion: 'clock',      answer: '旋转', label: '钟表指针转动' }
        ]).slice(0, 5);
    }

    /* ==================== SVG 图形绘制 ==================== */

    /** 爱心（轴对称） */
    function svgHeart(size) {
        var s = size || 180;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
            '<path d="M100 170 C60 140 10 100 10 60 A45 45 0 0 1 100 40 A45 45 0 0 1 190 60 C190 100 140 140 100 170Z" ' +
            'fill="#ef4444" stroke="#dc2626" stroke-width="3"/>' +
            '<line x1="100" y1="40" x2="100" y2="175" stroke="#fca5a5" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>' +
            '</svg>';
    }

    /** 蝴蝶（轴对称） */
    function svgButterfly(size) {
        var s = size || 180;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
            '<ellipse cx="100" cy="100" rx="6" ry="50" fill="#6b4c3b"/>' +
            '<circle cx="100" cy="42" r="6" fill="#6b4c3b"/>' +
            // 左翅上
            '<ellipse cx="55" cy="72" rx="42" ry="28" fill="#818cf8" stroke="#6366f1" stroke-width="2" transform="rotate(-15 55 72)"/>' +
            // 左翅下
            '<ellipse cx="60" cy="120" rx="32" ry="22" fill="#a78bfa" stroke="#7c3aed" stroke-width="2" transform="rotate(10 60 120)"/>' +
            // 右翅上
            '<ellipse cx="145" cy="72" rx="42" ry="28" fill="#818cf8" stroke="#6366f1" stroke-width="2" transform="rotate(15 145 72)"/>' +
            // 右翅下
            '<ellipse cx="140" cy="120" rx="32" ry="22" fill="#a78bfa" stroke="#7c3aed" stroke-width="2" transform="rotate(-10 140 120)"/>' +
            // 触角
            '<line x1="100" y1="42" x2="80" y2="20" stroke="#6b4c3b" stroke-width="2"/>' +
            '<circle cx="80" cy="20" r="4" fill="#f59e0b"/>' +
            '<line x1="100" y1="42" x2="120" y2="20" stroke="#6b4c3b" stroke-width="2"/>' +
            '<circle cx="120" cy="20" r="4" fill="#f59e0b"/>' +
            // 对称轴
            '<line x1="100" y1="15" x2="100" y2="190" stroke="#fca5a5" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>' +
            '</svg>';
    }

    /** 小房子（轴对称） */
    function svgHouse(size) {
        var s = size || 180;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
            // 屋顶
            '<polygon points="100,25 30,95 170,95" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>' +
            // 墙
            '<rect x="45" y="95" width="110" height="85" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>' +
            // 门
            '<rect x="82" y="125" width="36" height="55" rx="4" fill="#92400e"/>' +
            '<circle cx="112" cy="155" r="3" fill="#fbbf24"/>' +
            // 窗
            '<rect x="55" y="108" width="22" height="22" rx="3" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2"/>' +
            '<rect x="123" y="108" width="22" height="22" rx="3" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2"/>' +
            // 对称轴
            '<line x1="100" y1="15" x2="100" y2="190" stroke="#fca5a5" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>' +
            '</svg>';
    }

    /** 小旗子（非轴对称） */
    function svgFlag(size) {
        var s = size || 180;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
            // 旗杆
            '<line x1="55" y1="30" x2="55" y2="185" stroke="#78716c" stroke-width="4" stroke-linecap="round"/>' +
            // 旗面（三角形，向右飘）
            '<polygon points="55,30 170,60 55,100" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>' +
            '</svg>';
    }

    /** 小鱼（非轴对称 — 尾巴歪向一侧） */
    function svgFish(size) {
        var s = size || 180;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
            // 身体
            '<ellipse cx="95" cy="100" rx="58" ry="38" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>' +
            // 尾巴（朝右上方偏）
            '<polygon points="153,100 195,70 195,130" fill="#f97316" stroke="#ea580c" stroke-width="2"/>' +
            // 眼睛
            '<circle cx="62" cy="92" r="8" fill="white"/>' +
            '<circle cx="64" cy="91" r="4" fill="#1e293b"/>' +
            // 鳍
            '<ellipse cx="95" cy="65" rx="20" ry="10" fill="#fb923c" stroke="#f59e0b" stroke-width="1.5"/>' +
            // 嘴
            '<path d="M40 100 Q35 95 38 90" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>' +
            '</svg>';
    }

    /** 对称轴参考线（小图标） */
    function svgAxisRef() {
        return '<svg width="30" height="50" viewBox="0 0 30 50">' +
            '<line x1="15" y1="2" x2="15" y2="48" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5,3"/>' +
            '</svg>';
    }

    var shapeRenderers = {
        heart:     svgHeart,
        butterfly: svgButterfly,
        house:     svgHouse,
        flag:      svgFlag,
        fish:      svgFish
    };

    /* ==================== Phase 2 动画 SVG ==================== */

    /** 平移类动画 — 箭头指示 + 物体 */
    function motionTranslationSVG(motionType, size) {
        var s = size || 200;
        var content = '';

        if (motionType === 'car') {
            content =
                '<!-- 轨道 -->' +
                '<line x1="20" y1="130" x2="180" y2="130" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>' +
                '<!-- 箭头 -->' +
                '<line x1="25" y1="155" x2="160" y2="155" stroke="#3b82f6" stroke-width="3" marker-end="url(#mo-arrow)"/>' +
                '<!-- 小汽车 -->' +
                '<g class="mo-anim-slide">' +
                '<rect x="65" y="95" width="70" height="35" rx="8" fill="#3b82f6"/>' +
                '<rect x="80" y="80" width="40" height="22" rx="6" fill="#60a5fa"/>' +
                '<circle cx="82" cy="132" r="8" fill="#1e293b"/>' +
                '<circle cx="118" cy="132" r="8" fill="#1e293b"/>' +
                '<circle cx="82" cy="132" r="4" fill="#94a3b8"/>' +
                '<circle cx="118" cy="132" r="4" fill="#94a3b8"/>' +
                '</g>';
        } else if (motionType === 'elevator') {
            content =
                '<!-- 电梯轨道 -->' +
                '<rect x="75" y="20" width="50" height="160" rx="4" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-dasharray="6,4"/>' +
                '<!-- 箭头 -->' +
                '<line x1="55" y1="150" x2="55" y2="45" stroke="#3b82f6" stroke-width="3" marker-end="url(#mo-arrow-up)"/>' +
                '<!-- 电梯箱 -->' +
                '<g class="mo-anim-slide-v">' +
                '<rect x="78" y="90" width="44" height="44" rx="4" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>' +
                '<line x1="100" y1="93" x2="100" y2="131" stroke="#d97706" stroke-width="1.5"/>' +
                '<circle cx="100" cy="112" r="3" fill="#92400e"/>' +
                '</g>';
        } else if (motionType === 'sliding') {
            content =
                '<!-- 柜子 -->' +
                '<rect x="30" y="80" width="140" height="80" rx="6" fill="#d4a574" stroke="#92400e" stroke-width="2.5"/>' +
                '<line x1="100" y1="80" x2="100" y2="160" stroke="#92400e" stroke-width="2"/>' +
                '<!-- 箭头 -->' +
                '<line x1="75" y1="170" x2="130" y2="170" stroke="#3b82f6" stroke-width="3" marker-end="url(#mo-arrow)"/>' +
                '<!-- 抽屉（滑出） -->' +
                '<g class="mo-anim-slide">' +
                '<rect x="50" y="95" width="40" height="50" rx="3" fill="#fef3c7" stroke="#92400e" stroke-width="1.5"/>' +
                '<circle cx="70" cy="120" r="3" fill="#f59e0b"/>' +
                '</g>';
        } else if (motionType === 'train') {
            content =
                '<!-- 铁轨 -->' +
                '<line x1="10" y1="135" x2="190" y2="135" stroke="#78716c" stroke-width="3"/>' +
                '<line x1="10" y1="140" x2="190" y2="140" stroke="#78716c" stroke-width="3"/>' +
                // 枕木
                '<line x1="30" y1="132" x2="30" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<line x1="60" y1="132" x2="60" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<line x1="90" y1="132" x2="90" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<line x1="120" y1="132" x2="120" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<line x1="150" y1="132" x2="150" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<line x1="180" y1="132" x2="180" y2="143" stroke="#92400e" stroke-width="2"/>' +
                '<!-- 箭头 -->' +
                '<line x1="20" y1="160" x2="165" y2="160" stroke="#3b82f6" stroke-width="3" marker-end="url(#mo-arrow)"/>' +
                '<!-- 火车 -->' +
                '<g class="mo-anim-slide">' +
                '<rect x="40" y="95" width="80" height="38" rx="6" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>' +
                '<rect x="45" y="100" width="20" height="18" rx="3" fill="#bfdbfe"/>' +
                '<rect x="70" y="100" width="20" height="18" rx="3" fill="#bfdbfe"/>' +
                '<rect x="95" y="100" width="20" height="18" rx="3" fill="#bfdbfe"/>' +
                '<circle cx="60" cy="136" r="7" fill="#1e293b"/>' +
                '<circle cx="100" cy="136" r="7" fill="#1e293b"/>' +
                '<circle cx="60" cy="136" r="3" fill="#94a3b8"/>' +
                '<circle cx="100" cy="136" r="3" fill="#94a3b8"/>' +
                '</g>';
        }

        return svgBase(size || 200, content);
    }

    /** 旋转类动画 — 圆弧箭头 + 物体 */
    function motionRotationSVG(motionType, size) {
        var s = size || 200;
        var content = '';

        if (motionType === 'fan') {
            content =
                '<!-- 中心 -->' +
                '<circle cx="100" cy="95" r="10" fill="#64748b"/>' +
                '<circle cx="100" cy="95" r="5" fill="#94a3b8"/>' +
                '<!-- 扇叶 -->' +
                '<g class="mo-anim-spin">' +
                '<ellipse cx="100" cy="40" rx="14" ry="45" fill="#60a5fa" stroke="#3b82f6" stroke-width="1.5"/>' +
                '<ellipse cx="148" cy="122" rx="14" ry="45" fill="#60a5fa" stroke="#3b82f6" stroke-width="1.5" transform="rotate(120 100 95)"/>' +
                '<ellipse cx="52" cy="122" rx="14" ry="45" fill="#60a5fa" stroke="#3b82f6" stroke-width="1.5" transform="rotate(240 100 95)"/>' +
                '</g>' +
                '<!-- 旋转箭头 -->' +
                '<path d="M100 38 A62 62 0 0 1 162 95" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" marker-end="url(#mo-arrow-curve)"/>';
        } else if (motionType === 'windmill') {
            content =
                '<!-- 支架 -->' +
                '<rect x="95" y="140" width="10" height="45" fill="#78716c"/>' +
                '<rect x="75" y="180" width="50" height="8" rx="3" fill="#57534e"/>' +
                '<!-- 中心 -->' +
                '<circle cx="100" cy="90" r="8" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>' +
                '<!-- 风车叶片 -->' +
                '<g class="mo-anim-spin">' +
                '<polygon points="100,90 100,20 125,50" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>' +
                '<polygon points="100,90 170,90 140,65" fill="#3b82f6" stroke="#2563eb" stroke-width="1.5"/>' +
                '<polygon points="100,90 100,160 75,130" fill="#10b981" stroke="#059669" stroke-width="1.5"/>' +
                '<polygon points="100,90 30,90 60,115" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>' +
                '</g>' +
                '<!-- 旋转箭头 -->' +
                '<path d="M100 28 A62 62 0 0 1 162 90" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" marker-end="url(#mo-arrow-curve)"/>';
        } else if (motionType === 'door') {
            content =
                '<!-- 门框 -->' +
                '<rect x="50" y="40" width="100" height="140" rx="4" fill="none" stroke="#78716c" stroke-width="4"/>' +
                '<rect x="50" y="36" width="104" height="8" rx="3" fill="#78716c"/>' +
                '<!-- 门扇（旋转） -->' +
                '<g class="mo-anim-door">' +
                '<rect x="54" y="44" width="92" height="132" rx="3" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>' +
                '<circle cx="138" cy="110" r="5" fill="#92400e"/>' +
                '</g>' +
                '<!-- 旋转箭头 -->' +
                '<path d="M100 44 A55 55 0 0 1 155 100" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" marker-end="url(#mo-arrow-curve)"/>' +
                '<!-- 旋转轴 -->' +
                '<circle cx="54" cy="110" r="4" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>';
        } else if (motionType === 'clock') {
            content =
                '<!-- 表盘 -->' +
                '<circle cx="100" cy="100" r="75" fill="white" stroke="#1e293b" stroke-width="4"/>' +
                '<circle cx="100" cy="100" r="68" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>' +
                // 刻度
                '<line x1="100" y1="30" x2="100" y2="38" stroke="#1e293b" stroke-width="2.5"/>' +
                '<line x1="100" y1="162" x2="100" y2="170" stroke="#1e293b" stroke-width="2.5"/>' +
                '<line x1="30" y1="100" x2="38" y2="100" stroke="#1e293b" stroke-width="2.5"/>' +
                '<line x1="162" y1="100" x2="170" y2="100" stroke="#1e293b" stroke-width="2.5"/>' +
                // 指针
                '<g class="mo-anim-spin">' +
                '<line x1="100" y1="100" x2="100" y2="48" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>' +
                '</g>' +
                '<circle cx="100" cy="100" r="5" fill="#ef4444"/>' +
                '<!-- 旋转箭头 -->' +
                '<path d="M100 32 A68 68 0 0 1 168 100" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" marker-end="url(#mo-arrow-curve)"/>';
        }

        return svgBase(s, content);
    }

    /** SVG 基础模板，含 defs 中的箭头标记 */
    function svgBase(size, innerContent) {
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 200 200">' +
            '<defs>' +
                '<marker id="mo-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">' +
                    '<polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>' +
                '</marker>' +
                '<marker id="mo-arrow-up" markerWidth="10" markerHeight="7" refX="5" refY="0" orient="auto">' +
                    '<polygon points="0 7, 5 0, 10 7" fill="#3b82f6"/>' +
                '</marker>' +
                '<marker id="mo-arrow-curve" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">' +
                    '<polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/>' +
                '</marker>' +
            '</defs>' +
            innerContent +
        '</svg>';
    }

    var motionRenderers = {
        translation: motionTranslationSVG,
        rotation:    motionRotationSVG
    };

    /** 根据 motionType 判断运动类型 */
    function getMotionType(motionType) {
        var translationTypes = ['car', 'elevator', 'sliding', 'train'];
        return translationTypes.indexOf(motionType) >= 0 ? 'translation' : 'rotation';
    }

    /* ==================== 内部状态 ==================== */

    var state = {
        container: null,
        levelData: null,
        phase: 1,
        p1Index: 0,            // Phase 1 当前题号
        p2Index: 0,            // Phase 2 当前题号
        p2Questions: [],       // Phase 2 题目数组
        mistakes: 0,
        finished: false
    };

    /* ==================== 主模块 ==================== */

    var game = {

        /* ---------- 生命周期 ---------- */

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 20 };
            if (!state.container) return;

            this.injectStyles();
            this.resetState();
            this.render();
        },

        resetState: function () {
            state.phase = 1;
            state.p1Index = 0;
            state.p2Index = 0;
            state.p2Questions = buildMotionQuestions();
            state.mistakes = 0;
            state.finished = false;
        },

        /* ---------- 样式注入 ---------- */

        injectStyles: function () {
            if (document.getElementById(STYLE_ID)) return;

            var css = '' +
                '/* ---- 全局 ---- */' +
                '.mot-game {' +
                    'width:100%;height:100%;position:relative;overflow:hidden;' +
                    'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                    'background:linear-gradient(160deg,#ecfdf5 0%,#e0f2fe 50%,#ede9fe 100%);' +
                    'display:flex;flex-direction:column;align-items:center;' +
                    'color:#1e293b;' +
                '}' +

                '/* ---- 进度点 ---- */' +
                '.mot-progress { display:flex;gap:8px;margin-top:18px; }' +
                '.mot-dot {' +
                    'width:14px;height:14px;border-radius:50%;' +
                    'background:#e2e8f0;border:2px solid #cbd5e1;transition:all 0.3s;' +
                '}' +
                '.mot-dot.done { background:#10b981;border-color:#10b981; }' +
                '.mot-dot.active { background:#f59e0b;border-color:#f59e0b;transform:scale(1.2); }' +

                '/* ---- 场景 ---- */' +
                '.mot-scene {' +
                    'flex:1;width:100%;display:flex;flex-direction:column;' +
                    'align-items:center;justify-content:center;padding:80px 20px 20px;' +
                '}' +

                '/* ---- Phase 1 对称判断 ---- */' +
                '.mot-p1-area { display:flex;flex-direction:column;align-items:center;gap:18px;width:100%; }' +
                '.mot-shape-card {' +
                    'background:white;border-radius:28px;padding:20px 30px;' +
                    'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #e2e8f0;' +
                    'display:flex;flex-direction:column;align-items:center;gap:8px;' +
                '}' +
                '.mot-shape-label {' +
                    'font-size:20px;font-weight:bold;color:#475569;' +
                '}' +
                '.mot-symmetry-hint {' +
                    'font-size:16px;color:#94a3b8;font-weight:bold;' +
                '}' +

                '/* 是/否按钮组 */' +
                '.mot-yn-group { display:flex;gap:24px;flex-wrap:wrap;justify-content:center; }' +
                '.mot-yn-btn {' +
                    'padding:18px 52px;font-size:28px;font-weight:bold;' +
                    'border:3px solid;border-radius:24px;' +
                    'background:white;cursor:pointer;transition:all 0.2s;' +
                    'user-select:none;' +
                '}' +
                '.mot-yn-btn:hover { transform:scale(1.06); }' +
                '.mot-yn-btn:active { transform:scale(0.95); }' +
                '.mot-yn-yes { border-color:#10b981;color:#047857; }' +
                '.mot-yn-yes:hover { background:#10b981;color:white; }' +
                '.mot-yn-no { border-color:#ef4444;color:#b91c1c; }' +
                '.mot-yn-no:hover { background:#ef4444;color:white; }' +
                '.mot-yn-btn.mot-correct {' +
                    'background:#10b981;color:white;border-color:#10b981;' +
                    'animation:motPop 0.35s ease-out;' +
                '}' +
                '.mot-yn-btn.mot-wrong {' +
                    'background:#ef4444;color:white;border-color:#ef4444;' +
                    'animation:motShake 0.45s ease-out;' +
                '}' +

                '/* ---- Phase 2 运动分类 ---- */' +
                '.mot-p2-area { display:flex;flex-direction:column;align-items:center;gap:18px;width:100%; }' +
                '.mot-motion-card {' +
                    'background:white;border-radius:28px;padding:16px;' +
                    'box-shadow:0 10px 30px rgba(0,0,0,0.08);border:3px solid #e2e8f0;' +
                    'display:flex;flex-direction:column;align-items:center;gap:6px;' +
                '}' +
                '.mot-motion-desc {' +
                    'font-size:20px;font-weight:bold;color:#475569;' +
                '}' +
                '.mot-q-counter { font-size:18px;color:#64748b;font-weight:bold; }' +

                '/* 平移/旋转按钮组 */' +
                '.mot-classify-group { display:flex;gap:24px;flex-wrap:wrap;justify-content:center; }' +
                '.mot-classify-btn {' +
                    'padding:18px 48px;font-size:26px;font-weight:bold;' +
                    'border:3px solid;border-radius:24px;' +
                    'background:white;cursor:pointer;transition:all 0.2s;' +
                    'user-select:none;' +
                '}' +
                '.mot-classify-btn:hover { transform:scale(1.06); }' +
                '.mot-classify-btn:active { transform:scale(0.95); }' +
                '.mot-btn-translate { border-color:#3b82f6;color:#1d4ed8; }' +
                '.mot-btn-translate:hover { background:#3b82f6;color:white; }' +
                '.mot-btn-rotate { border-color:#f59e0b;color:#b45309; }' +
                '.mot-btn-rotate:hover { background:#f59e0b;color:white; }' +
                '.mot-classify-btn.mot-correct {' +
                    'background:#10b981;color:white;border-color:#10b981;' +
                    'animation:motPop 0.35s ease-out;' +
                '}' +
                '.mot-classify-btn.mot-wrong {' +
                    'background:#ef4444;color:white;border-color:#ef4444;' +
                    'animation:motShake 0.45s ease-out;' +
                '}' +

                '/* ---- 动画关键帧 ---- */' +
                '@keyframes motPop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }' +
                '@keyframes motShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }' +

                /* 平移滑动动画 */
                '@keyframes motSlide {' +
                    '0%{transform:translateX(-25px)} 50%{transform:translateX(25px)} 100%{transform:translateX(-25px)}' +
                '}' +
                '.mo-anim-slide { animation:motSlide 1.8s ease-in-out infinite; }' +

                /* 垂直平移动画 */
                '@keyframes motSlideV {' +
                    '0%{transform:translateY(25px)} 50%{transform:translateY(-25px)} 100%{transform:translateY(25px)}' +
                '}' +
                '.mo-anim-slide-v { animation:motSlideV 2s ease-in-out infinite; }' +

                /* 旋转动画 */
                '@keyframes motSpin {' +
                    '0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}' +
                '}' +
                '.mo-anim-spin { transform-origin:center;animation:motSpin 2.5s linear infinite; }' +

                /* 开门动画（绕左轴旋转） */
                '@keyframes motDoor {' +
                    '0%{transform:perspective(400px) rotateY(0deg)} 50%{transform:perspective(400px) rotateY(-55deg)} 100%{transform:perspective(400px) rotateY(0deg)}' +
                '}' +
                '.mo-anim-door { transform-origin:left center;animation:motDoor 3s ease-in-out infinite; }' +

                /* ---- 过渡提示 ---- */ +
                '.mot-transition-msg {' +
                    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
                    'background:rgba(255,255,255,0.92);z-index:60;backdrop-filter:blur(8px);' +
                '}' +
                '.mot-transition-inner {' +
                    'text-align:center;animation:motPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                '}' +
                '.mot-transition-emoji { font-size:64px;margin-bottom:12px; }' +
                '.mot-transition-text { font-size:28px;font-weight:bold;color:#065f46; }';

            H.injectStyles(STYLE_ID, css);
        },

        /* ---------- 渲染入口 ---------- */

        render: function () {
            if (!state.container) return;
            if (state.phase === 1) {
                this.renderPhase1();
            } else {
                this.renderPhase2();
            }
        },

        /* ==================== Phase 1: 对称判断 ==================== */

        renderPhase1: function () {
            if (state.p1Index >= symmetryQuestions.length) {
                this.startPhase2Transition();
                return;
            }

            var q = symmetryQuestions[state.p1Index];
            var total = symmetryQuestions.length;
            var renderer = shapeRenderers[q.shape];

            var dotsHTML = '';
            for (var i = 0; i < total; i++) {
                var cls = 'mot-dot';
                if (i < state.p1Index) cls += ' done';
                else if (i === state.p1Index) cls += ' active';
                dotsHTML += '<div class="' + cls + '"></div>';
            }

            state.container.innerHTML =
                '<div class="mot-game">' +
                    H.guideBarHTML('🚪', '魔法门 — 对称判断') +

                    '<div class="mot-scene">' +
                        '<div class="mot-p1-area">' +
                            '<div class="mot-progress">' + dotsHTML + '</div>' +
                            '<div class="mot-q-counter">第 ' + (state.p1Index + 1) + ' / ' + total + ' 题</div>' +

                            '<div class="mot-shape-card">' +
                                '<div>' + renderer(180) + '</div>' +
                                '<div class="mot-shape-label">' + q.label + '</div>' +
                                '<div class="mot-symmetry-hint">沿一条线对折，两边能完全重合吗？</div>' +
                            '</div>' +

                            '<div class="mot-yn-group" id="mot-yn-group">' +
                                '<button class="mot-yn-btn mot-yn-yes" data-val="yes">是 — 轴对称</button>' +
                                '<button class="mot-yn-btn mot-yn-no" data-val="no">否 — 不是</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            this.bindPhase1Events(q);
        },

        bindPhase1Events: function (q) {
            var self = this;
            var btns = state.container.querySelectorAll('.mot-yn-btn');

            for (var i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function () {
                    // 禁用所有按钮
                    for (var j = 0; j < btns.length; j++) {
                        btns[j].style.pointerEvents = 'none';
                    }

                    var playerSays = this.dataset.val === 'yes';
                    var correct = (playerSays === q.answer);

                    if (correct) {
                        this.classList.add('mot-correct');
                        H.updateGuide(
                            state.p1Index < symmetryQuestions.length - 1
                                ? '答对了！' + q.label + (q.answer ? '是轴对称图形！' : '不是轴对称图形！')
                                : '太棒了！对称判断全部完成！',
                            'gh-guide-text'
                        );
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                        }
                        setTimeout(function () {
                            state.p1Index++;
                            self.renderPhase1();
                        }, 900);
                    } else {
                        this.classList.add('mot-wrong');
                        state.mistakes++;
                        H.triggerError(
                            state.container,
                            q.answer
                                ? '这是轴对称图形哦！沿中线对折能重合的！'
                                : '这不是轴对称图形哦！对折后两边不一样的！',
                            this
                        );
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        // 1.2s 后显示正确答案并继续
                        setTimeout(function () {
                            for (var k = 0; k < btns.length; k++) {
                                var isYesBtn = btns[k].dataset.val === 'yes';
                                if (isYesBtn === q.answer) btns[k].classList.add('mot-correct');
                            }
                            setTimeout(function () {
                                state.p1Index++;
                                self.renderPhase1();
                            }, 700);
                        }, 1000);
                    }
                });
            }
        },

        /* ==================== Phase 2 过渡 ==================== */

        startPhase2Transition: function () {
            var self = this;
            state.container.innerHTML =
                '<div class="mot-game">' +
                    '<div class="mot-transition-msg">' +
                        '<div class="mot-transition-inner">' +
                            '<div class="mot-transition-emoji">🎯</div>' +
                            '<div class="mot-transition-text">对称判断完成！</div>' +
                            '<div class="mot-transition-text" style="font-size:22px;color:#64748b;margin-top:8px;">马上进入运动分类挑战！</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            if (window.GameManager) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
            }

            setTimeout(function () {
                state.phase = 2;
                state.p2Index = 0;
                self.renderPhase2();
            }, 1500);
        },

        /* ==================== Phase 2: 运动分类 ==================== */

        renderPhase2: function () {
            if (state.p2Index >= state.p2Questions.length) {
                this.finishGame();
                return;
            }

            var q = state.p2Questions[state.p2Index];
            var total = state.p2Questions.length;
            var motionType = getMotionType(q.motion);
            var renderer = motionRenderers[motionType];
            var svgSize = 200;

            var dotsHTML = '';
            for (var i = 0; i < total; i++) {
                var cls = 'mot-dot';
                if (i < state.p2Index) cls += ' done';
                else if (i === state.p2Index) cls += ' active';
                dotsHTML += '<div class="' + cls + '"></div>';
            }

            state.container.innerHTML =
                '<div class="mot-game">' +
                    H.guideBarHTML('🚪', '魔法门 — 运动分类') +

                    '<div class="mot-scene">' +
                        '<div class="mot-p2-area">' +
                            '<div class="mot-progress">' + dotsHTML + '</div>' +
                            '<div class="mot-q-counter">第 ' + (state.p2Index + 1) + ' / ' + total + ' 题</div>' +

                            '<div class="mot-motion-card">' +
                                '<div>' + renderer(q.motion, svgSize) + '</div>' +
                                '<div class="mot-motion-desc">' + q.label + '</div>' +
                            '</div>' +

                            '<div class="mot-classify-group" id="mot-classify-group">' +
                                '<button class="mot-classify-btn mot-btn-translate" data-val="平移">平移</button>' +
                                '<button class="mot-classify-btn mot-btn-rotate" data-val="旋转">旋转</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            this.bindPhase2Events(q);
        },

        bindPhase2Events: function (q) {
            var self = this;
            var btns = state.container.querySelectorAll('.mot-classify-btn');

            for (var i = 0; i < btns.length; i++) {
                btns[i].addEventListener('click', function () {
                    for (var j = 0; j < btns.length; j++) {
                        btns[j].style.pointerEvents = 'none';
                    }

                    var chosen = this.dataset.val;
                    var correct = (chosen === q.answer);

                    if (correct) {
                        this.classList.add('mot-correct');
                        H.updateGuide(
                            state.p2Index < state.p2Questions.length - 1
                                ? '答对了！这是「' + q.answer + '」！'
                                : '最后也答对了！太厉害了！',
                            'gh-guide-text'
                        );
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, 10);
                        }
                        setTimeout(function () {
                            state.p2Index++;
                            self.renderPhase2();
                        }, 900);
                    } else {
                        this.classList.add('mot-wrong');
                        state.mistakes++;
                        H.triggerError(
                            state.container,
                            '这是「' + q.answer + '」哦，不是「' + chosen + '」！',
                            this
                        );
                        if (window.GameManager) {
                            window.GameManager.updateMastery(state.levelData.knowledgePoint, -5);
                        }
                        // 1.2s 后显示正确答案并继续
                        setTimeout(function () {
                            for (var k = 0; k < btns.length; k++) {
                                if (btns[k].dataset.val === q.answer) {
                                    btns[k].classList.add('mot-correct');
                                }
                            }
                            setTimeout(function () {
                                state.p2Index++;
                                self.renderPhase2();
                            }, 700);
                        }, 1000);
                    }
                });
            }
        },

        /* ==================== 结算 ==================== */

        finishGame: function () {
            if (state.finished) return;
            state.finished = true;
            H.showSettlement(
                state.container,
                state.levelData.reward || 20,
                state.levelData,
                state.mistakes,
                '魔法门闯关完成！你已经学会了轴对称和图形运动！',
                'lvl_2_d_4'
            );
        }
    };

    /* ==================== 导出 ==================== */

    window.CurrentGameModule = game;
})();
