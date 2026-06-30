/**
 * 五年级下册 第七单元：折线统计图
 * 路径: src/games/grade5/g5_d_u7_line_chart.js
 *
 * 玩法："趋势分析"
 *   Phase 1 "读图识数": 给定折线统计图，读取特定数据点。4题。
 *   Phase 2 "趋势判断": 给定折线统计图，分析数据变化趋势。4题。
 *   Phase 3 "绘制与比较": 给定文字数据，选择正确的折线图；或比较两张图。4题。
 */
(function () {
    const H = window.GameHelpers;
    const STYLE_ID = 'g5-d-u7-line-chart-styles';
    const NEXT_LEVEL = 'lvl_5_d_8';

    /* ── 预定义图表数据 ── */
    var CHARTS = [
        {
            title: '小明一周跳绳成绩',
            xLabels: ['周一', '周二', '周三', '周四', '周五'],
            yMin: 0, yMax: 100, yStep: 20,
            data: [45, 60, 55, 70, 80],
            unit: '个'
        },
        {
            title: '商店一到六月销量',
            xLabels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            yMin: 0, yMax: 500, yStep: 100,
            data: [120, 180, 250, 200, 310, 380],
            unit: '件'
        },
        {
            title: '一周气温变化',
            xLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            yMin: 0, yMax: 40, yStep: 8,
            data: [18, 22, 20, 26, 28, 24, 20],
            unit: '°C'
        },
        {
            title: '小红阅读页数统计',
            xLabels: ['第1天', '第2天', '第3天', '第4天', '第5天'],
            yMin: 0, yMax: 60, yStep: 10,
            data: [15, 25, 20, 35, 45],
            unit: '页'
        },
        {
            title: '工厂月产量趋势',
            xLabels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            yMin: 0, yMax: 600, yStep: 100,
            data: [300, 350, 280, 420, 480, 550],
            unit: '吨'
        },
        {
            title: '学生一周运动时间',
            xLabels: ['周一', '周二', '周三', '周四', '周五'],
            yMin: 0, yMax: 120, yStep: 20,
            data: [30, 45, 60, 40, 75],
            unit: '分钟'
        },
        {
            title: '图书馆借阅量统计',
            xLabels: ['1月', '2月', '3月', '4月', '5月'],
            yMin: 0, yMax: 400, yStep: 80,
            data: [200, 320, 280, 150, 250],
            unit: '本'
        },
        {
            title: '小刚一周身高体重变化',
            xLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            yMin: 30, yMax: 40, yStep: 2,
            data: [33, 33.2, 33.5, 33.3, 33.8, 34, 34.1],
            unit: '千克'
        },
        {
            title: '超市周末客流',
            xLabels: ['8时', '10时', '12时', '14时', '16时', '18时'],
            yMin: 0, yMax: 200, yStep: 40,
            data: [50, 120, 160, 100, 140, 180],
            unit: '人'
        },
        {
            title: '班级数学成绩趋势',
            xLabels: ['单元1', '单元2', '单元3', '单元4', '单元5'],
            yMin: 0, yMax: 100, yStep: 20,
            data: [72, 78, 85, 80, 90],
            unit: '分'
        },
        {
            title: '植物生长高度记录',
            xLabels: ['第1周', '第2周', '第3周', '第4周', '第5周'],
            yMin: 0, yMax: 30, yStep: 6,
            data: [2, 5, 10, 18, 28],
            unit: '厘米'
        },
        {
            title: '家庭月支出',
            xLabels: ['1月', '2月', '3月', '4月'],
            yMin: 0, yMax: 8000, yStep: 2000,
            data: [4500, 5200, 4800, 6000],
            unit: '元'
        }
    ];

    /* ── 图表 CSS 渲染引擎 ── */

    /** 格式化数值（整数去掉小数点） */
    function fmtNum(v) {
        if (v === Math.floor(v)) return '' + v;
        return v.toFixed(1);
    }

    /**
     * renderLineChart(chartData) -> HTML 字符串
     * 纯 CSS 定位折线图，不依赖 canvas / SVG / 外部库
     */
    function renderLineChart(chart) {
        var n = chart.data.length;
        var yMin = chart.yMin;
        var yMax = chart.yMax;
        var yStep = chart.yStep || Math.ceil((yMax - yMin) / 5);
        var unit = chart.unit || '';

        // 布局常量
        var PAD_LEFT = 48;      // Y 轴标签宽度
        var PAD_RIGHT = 16;
        var PAD_TOP = 30;       // 标题空间
        var PAD_BOTTOM = 36;    // X 轴标签空间
        var CHART_W = Math.max(n * 70, 260);  // 绘图区宽度
        var CHART_H = 160;     // 绘图区高度
        var TOTAL_W = PAD_LEFT + CHART_W + PAD_RIGHT;
        var TOTAL_H = PAD_TOP + CHART_H + PAD_BOTTOM;

        // Y 轴刻度数量
        var yTicks = [];
        for (var v = yMin; v <= yMax; v += yStep) {
            yTicks.push(v);
        }

        // 绘制 Y 轴刻度 + 网格线
        var yHtml = '';
        for (var ti = 0; ti < yTicks.length; ti++) {
            var tickVal = yTicks[ti];
            var pct = (tickVal - yMin) / (yMax - yMin);
            var yPos = PAD_TOP + CHART_H - pct * CHART_H;
            yHtml += '<span class="lch-ylabel" style="top:' + (yPos - 8) + 'px">' + fmtNum(tickVal) + '</span>';
            if (ti > 0) {
                yHtml += '<span class="lch-gridline" style="top:' + yPos + 'px"></span>';
            }
        }

        // 数据点坐标
        var points = [];
        for (var di = 0; di < n; di++) {
            var xPct = n === 1 ? 0.5 : di / (n - 1);
            var yPct = (chart.data[di] - yMin) / (yMax - yMin);
            var cx = PAD_LEFT + xPct * CHART_W;
            var cy = PAD_TOP + CHART_H - yPct * CHART_H;
            points.push({ x: cx, y: cy, val: chart.data[di], label: chart.xLabels[di] });
        }

        // 连线段（SVG polyline 用于精确连线）
        var lineDots = '';
        var lineSegments = '';
        if (points.length > 1) {
            // 使用小 SVG 叠加在绘图区上画线
            var svgW = CHART_W;
            var svgH = CHART_H;
            var polyPts = '';
            for (var pi = 0; pi < points.length; pi++) {
                var lx = points[pi].x - PAD_LEFT;
                var ly = points[pi].y - PAD_TOP;
                polyPts += lx + ',' + ly + ' ';
            }
            lineSegments = '<svg class="lch-lines-svg" width="' + svgW + '" height="' + svgH + '" ' +
                'style="position:absolute;left:' + PAD_LEFT + 'px;top:' + PAD_TOP + 'px;pointer-events:none;z-index:1">' +
                '<polyline points="' + polyPts + '" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>';
        }

        // 数据点圆点 + 数值标签
        for (var di2 = 0; di2 < points.length; di2++) {
            var p = points[di2];
            lineDots += '<span class="lch-dot" style="left:' + (p.x - 6) + 'px;top:' + (p.y - 6) + 'px" title="' + p.label + ': ' + p.val + unit + '"></span>';
            lineDots += '<span class="lch-val" style="left:' + (p.x - 16) + 'px;top:' + (p.y - 24) + 'px">' + fmtNum(p.val) + '</span>';
        }

        // X 轴标签
        var xHtml = '';
        for (var xi = 0; xi < n; xi++) {
            var xPos = points[xi].x;
            xHtml += '<span class="lch-xlabel" style="left:' + (xPos - 18) + 'px">' + chart.xLabels[xi] + '</span>';
        }

        // 汇总 HTML
        var html =
            '<div class="lch-chart-title">' + chart.title + '</div>' +
            '<div class="lch-chart-box" style="width:' + TOTAL_W + 'px;height:' + TOTAL_H + 'px">' +
                '<div class="lch-yaxis" style="left:0;top:' + PAD_TOP + 'px;height:' + CHART_H + 'px"></div>' +
                '<div class="lch-xaxis" style="left:' + PAD_LEFT + 'px;top:' + (PAD_TOP + CHART_H) + 'px;width:' + CHART_W + 'px"></div>' +
                yHtml +
                '<div class="lch-plotarea" style="left:' + PAD_LEFT + 'px;top:' + PAD_TOP + 'px;width:' + CHART_W + 'px;height:' + CHART_H + 'px">' +
                    lineSegments +
                    lineDots +
                '</div>' +
                xHtml +
            '</div>';

        return html;
    }

    /**
     * renderMiniChart(chart, maxW, maxH) -> 缩略图 HTML（Phase 3 选项用）
     * 使用 SVG polyline 实现缩小版折线图
     */
    function renderMiniChart(chart, maxW, maxH) {
        maxW = maxW || 200;
        maxH = maxH || 100;
        var pad = { t: 8, r: 8, b: 20, l: 30 };
        var w = maxW;
        var h = maxH;
        var plotW = w - pad.l - pad.r;
        var plotH = h - pad.t - pad.b;

        var yMin = chart.yMin;
        var yMax = chart.yMax;
        var n = chart.data.length;

        // 构建折线点
        var pts = '';
        var dots = '';
        for (var i = 0; i < n; i++) {
            var xPct = n === 1 ? 0.5 : i / (n - 1);
            var yPct = (chart.data[i] - yMin) / (yMax - yMin);
            var px = pad.l + xPct * plotW;
            var py = pad.t + plotH - yPct * plotH;
            pts += px + ',' + py + ' ';
            dots += '<circle cx="' + px + '" cy="' + py + '" r="3" fill="#6366f1"/>';
        }

        // X 轴线
        var axisY = pad.t + plotH;
        var axisX2 = pad.l + plotW;

        // X 轴标签（取首尾 + 中间）
        var xLabelsSvg = '';
        for (var j = 0; j < n; j++) {
            var xp = pad.l + (n === 1 ? 0.5 : j / (n - 1)) * plotW;
            xLabelsSvg += '<text x="' + xp + '" y="' + (h - 4) + '" text-anchor="middle" font-size="7" fill="#6b7280">' + chart.xLabels[j] + '</text>';
        }

        var svg =
            '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
                '<text x="' + (w / 2) + '" y="10" text-anchor="middle" font-size="8" font-weight="bold" fill="#374151">' + chart.title + '</text>' +
                // Y 轴
                '<line x1="' + pad.l + '" y1="' + pad.t + '" x2="' + pad.l + '" y2="' + axisY + '" stroke="#d1d5db" stroke-width="1"/>' +
                // X 轴
                '<line x1="' + pad.l + '" y1="' + axisY + '" x2="' + axisX2 + '" y2="' + axisY + '" stroke="#d1d5db" stroke-width="1"/>' +
                // 折线
                '<polyline points="' + pts + '" fill="none" stroke="#6366f1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
                dots +
                xLabelsSvg +
            '</svg>';

        return svg;
    }

    /* ── Phase 1: 读图识数 ── */

    function buildPhase1() {
        var qs = [];
        var pool = H.shuffle(CHARTS.slice());
        for (var i = 0; i < 4; i++) {
            var chart = pool[i % pool.length];
            qs.push(makeReadQuestion(chart, i));
        }
        return qs;
    }

    function makeReadQuestion(chart, idx) {
        var types = ['readPoint', 'readMax', 'readMin', 'readCompare'];
        var qType = types[idx % types.length];
        var answer, text, hint, choices;

        if (qType === 'readPoint') {
            // "X月/周X的数值是多少？"
            var pi = H.randInt(0, chart.data.length - 1);
            var val = chart.data[pi];
            answer = fmtNum(val);
            text = chart.xLabels[pi] + '的' + chart.unit.replace(/[^a-zA-Z一-龥]/g, '') + '是多少？';
            hint = '请在图中找到' + chart.xLabels[pi] + '对应的数据点';
            choices = genNumericChoices(val, chart.data, chart.yMin, chart.yMax);

        } else if (qType === 'readMax') {
            // "哪个月/天最高？是多少？"
            var maxV = Math.max.apply(null, chart.data);
            var maxIdx = chart.data.indexOf(maxV);
            answer = fmtNum(maxV);
            text = chart.title + '中，最高值是' + chart.xLabels[maxIdx] + '的（    ）' + chart.unit;
            hint = '找到折线图的最高点';
            choices = genNumericChoices(maxV, chart.data, chart.yMin, chart.yMax);

        } else if (qType === 'readMin') {
            var minV = Math.min.apply(null, chart.data);
            var minIdx = chart.data.indexOf(minV);
            answer = fmtNum(minV);
            text = chart.title + '中，最低值是' + chart.xLabels[minIdx] + '的（    ）' + chart.unit;
            hint = '找到折线图的最低点';
            choices = genNumericChoices(minV, chart.data, chart.yMin, chart.yMax);

        } else {
            // readCompare: 两个值的差
            var ci1 = H.randInt(0, chart.data.length - 1);
            var ci2 = H.randInt(0, chart.data.length - 1);
            while (ci2 === ci1 && chart.data.length > 1) {
                ci2 = H.randInt(0, chart.data.length - 1);
            }
            var diff = Math.abs(chart.data[ci1] - chart.data[ci2]);
            answer = fmtNum(diff);
            text = chart.xLabels[ci1] + '和' + chart.xLabels[ci2] + '相差（    ）' + chart.unit;
            hint = '计算两个数据点的差值';
            choices = genNumericChoices(diff, chart.data, chart.yMin, chart.yMax);
        }

        return {
            chart: chart,
            text: text,
            answer: answer,
            choices: choices,
            hint: hint
        };
    }

    /** 生成数值选项（1个正确 + 3个干扰） */
    function genNumericChoices(correct, dataArr, yMin, yMax) {
        var set = new Set();
        set.add(fmtNum(correct));
        var candidates = [];
        // 优先用数据集中已有的值
        for (var i = 0; i < dataArr.length; i++) {
            if (fmtNum(dataArr[i]) !== fmtNum(correct)) {
                candidates.push(fmtNum(dataArr[i]));
            }
        }
        // 再补一些偏移值
        var offsets = [-3, -2, -1, 1, 2, 3, 5, 10];
        for (var oi = 0; oi < offsets.length; oi++) {
            var fake = correct + offsets[oi];
            if (fake >= yMin && fake <= yMax && fmtNum(fake) !== fmtNum(correct)) {
                candidates.push(fmtNum(fake));
            }
        }
        var tries = 0;
        while (set.size < 4 && tries < 30) {
            tries++;
            var pick = candidates[H.randInt(0, candidates.length - 1)];
            if (pick !== fmtNum(correct)) set.add(pick);
        }
        // 兜底
        while (set.size < 4) {
            var fb = correct + H.randInt(-10, 10);
            if (fb >= yMin && fb <= yMax) set.add(fmtNum(fb));
        }
        return H.shuffle(Array.from(set));
    }

    /* ── Phase 2: 趋势判断 ── */

    function buildPhase2() {
        var qs = [];
        var pool = H.shuffle(CHARTS.slice());
        var trendTypes = ['overallTrend', 'fastestGrowth', 'declineCount', 'compareSegment'];
        for (var i = 0; i < 4; i++) {
            var chart = pool[i % pool.length];
            qs.push(makeTrendQuestion(chart, trendTypes[i]));
        }
        return qs;
    }

    /** 分析折线趋势方向 */
    function analyzeTrend(data) {
        if (data.length < 2) return '平稳';
        var first = data[0];
        var last = data[data.length - 1];
        var allUp = true, allDown = true;
        for (var i = 1; i < data.length; i++) {
            if (data[i] < data[i - 1]) allUp = false;
            if (data[i] > data[i - 1]) allDown = false;
        }
        if (allUp) return '持续上升';
        if (allDown) return '持续下降';
        if (last > first && (last - first) / (data.length - 1) > (Math.max.apply(null, data) - Math.min.apply(null, data)) * 0.3) {
            return '总体上升';
        }
        if (first > last && (first - last) / (data.length - 1) > (Math.max.apply(null, data) - Math.min.apply(null, data)) * 0.3) {
            return '总体下降';
        }
        return '有升有降';
    }

    /** 找增长最快（增幅最大）的相邻段 */
    function findFastestGrowth(data) {
        var maxDiff = -Infinity;
        var maxIdx = 0;
        for (var i = 1; i < data.length; i++) {
            var d = data[i] - data[i - 1];
            if (d > maxDiff) {
                maxDiff = d;
                maxIdx = i;
            }
        }
        return maxIdx;
    }

    /** 计数下降次数（相邻两段中后 < 前） */
    function countDeclines(data) {
        var c = 0;
        for (var i = 1; i < data.length; i++) {
            if (data[i] < data[i - 1]) c++;
        }
        return c;
    }

    function makeTrendQuestion(chart, tType) {
        var answer, text, hint, choices;

        if (tType === 'overallTrend') {
            var trend = analyzeTrend(chart.data);
            answer = trend;
            text = chart.title + '的总体趋势是什么？';
            hint = '观察折线的整体走向';
            var trendOpts = ['持续上升', '持续下降', '总体上升', '总体下降', '有升有降', '平稳'];
            choices = [answer];
            for (var ti = 0; ti < trendOpts.length && choices.length < 4; ti++) {
                if (trendOpts[ti] !== answer) choices.push(trendOpts[ti]);
            }
            choices = H.shuffle(choices.slice(0, 4));

        } else if (tType === 'fastestGrowth') {
            var fgIdx = findFastestGrowth(chart.data);
            var fgLabel = chart.xLabels[fgIdx - 1] + '到' + chart.xLabels[fgIdx];
            answer = fgLabel;
            text = chart.title + '中，增长最快的是哪一段？';
            hint = '比较每段的增幅大小';
            choices = genSegmentChoices(fgIdx, chart);

        } else if (tType === 'declineCount') {
            var dc = countDeclines(chart.data);
            answer = '' + dc;
            text = chart.title + '中，下降了（    ）次';
            hint = '逐段比较，后一个比前一个小就是下降';
            var dcChoices = new Set();
            dcChoices.add(answer);
            var offsets2 = [-1, 1, 2];
            for (var di = 0; di < offsets2.length; di++) {
                var fake = dc + offsets2[di];
                if (fake >= 0 && fake <= chart.data.length - 1) dcChoices.add('' + fake);
            }
            // 兜底
            while (dcChoices.size < 4) {
                var fb = dc + H.randInt(-2, 3);
                if (fb >= 0) dcChoices.add('' + fb);
            }
            choices = H.shuffle(Array.from(dcChoices).slice(0, 4));

        } else {
            // compareSegment: 哪段变化最大（绝对值）
            var maxAbsDiff = 0;
            var maxAbsIdx = 0;
            for (var si = 1; si < chart.data.length; si++) {
                var absD = Math.abs(chart.data[si] - chart.data[si - 1]);
                if (absD > maxAbsDiff) {
                    maxAbsDiff = absD;
                    maxAbsIdx = si;
                }
            }
            var segLabel = chart.xLabels[maxAbsIdx - 1] + '到' + chart.xLabels[maxAbsIdx];
            answer = segLabel;
            text = chart.title + '中，变化幅度最大的是哪一段？';
            hint = '变化幅度 = |后一个值 - 前一个值|';
            choices = genSegmentChoices(maxAbsIdx, chart);
        }

        return {
            chart: chart,
            text: text,
            answer: answer,
            choices: choices,
            hint: hint
        };
    }

    /** 生成"哪段"类选项 */
    function genSegmentChoices(correctIdx, chart) {
        var set = new Set();
        var correctLabel = chart.xLabels[correctIdx - 1] + '到' + chart.xLabels[correctIdx];
        set.add(correctLabel);
        for (var i = 1; i < chart.xLabels.length; i++) {
            var lbl = chart.xLabels[i - 1] + '到' + chart.xLabels[i];
            if (lbl !== correctLabel) set.add(lbl);
        }
        return H.shuffle(Array.from(set).slice(0, 4));
    }

    /* ── Phase 3: 绘制与比较 ── */

    /** 生成干扰图表（基于原数据做扰动） */
    function genVariantChart(original) {
        var variant = {
            title: original.title,
            xLabels: original.xLabels.slice(),
            yMin: original.yMin,
            yMax: original.yMax,
            yStep: original.yStep,
            data: [],
            unit: original.unit
        };
        for (var i = 0; i < original.data.length; i++) {
            // 随机偏移 ±15%
            var delta = original.data[i] * (Math.random() * 0.3 - 0.15);
            var newVal = Math.max(original.yMin, Math.min(original.yMax, Math.round(original.data[i] + delta)));
            variant.data.push(newVal);
        }
        // 确保至少一个值不同
        var allSame = true;
        for (var j = 0; j < original.data.length; j++) {
            if (variant.data[j] !== original.data[j]) { allSame = false; break; }
        }
        if (allSame) {
            var ri = H.randInt(0, original.data.length - 1);
            variant.data[ri] = Math.min(original.yMax, variant.data[ri] + Math.max(5, Math.round(original.data[ri] * 0.2)));
        }
        return variant;
    }

    /** 生成完全不同的干扰图表 */
    function genDifferentChart(original) {
        var diff = {
            title: original.title,
            xLabels: original.xLabels.slice(),
            yMin: original.yMin,
            yMax: original.yMax,
            yStep: original.yStep,
            data: [],
            unit: original.unit
        };
        // 生成完全不同的趋势
        var isReverse = countDeclines(original.data) < original.data.length / 2;
        if (isReverse) {
            // 原图上升居多 → 干扰图下降居多
            var high = original.yMax * 0.8;
            var low = original.yMin + (original.yMax - original.yMin) * 0.2;
            for (var i = 0; i < original.data.length; i++) {
                var t = i / (original.data.length - 1 || 1);
                diff.data.push(Math.round(high - t * (high - low) + H.randInt(-5, 5)));
            }
        } else {
            // 原图下降居多 → 干扰图上升居多
            var low2 = original.yMin + (original.yMax - original.yMin) * 0.2;
            var high2 = original.yMax * 0.8;
            for (var j = 0; j < original.data.length; j++) {
                var t2 = j / (original.data.length - 1 || 1);
                diff.data.push(Math.round(low2 + t2 * (high2 - low2) + H.randInt(-5, 5)));
            }
        }
        return diff;
    }

    function buildPhase3() {
        var qs = [];
        var pool = H.shuffle(CHARTS.slice());

        // Q1-Q2: 给文字数据，选正确的折线图
        for (var i = 0; i < 2; i++) {
            qs.push(makeDrawQuestion(pool[i % pool.length]));
        }
        // Q3-Q4: 比较两张图
        for (var j = 0; j < 2; j++) {
            qs.push(makeCompareQuestion(pool[(j + 2) % pool.length]));
        }
        return H.shuffle(qs);
    }

    function makeDrawQuestion(chart) {
        // 用 chart 数据生成正确图，再生成 3 个干扰
        var variants = [];
        for (var v = 0; v < 3; v++) {
            if (v === 0) {
                variants.push(genDifferentChart(chart));
            } else {
                variants.push(genVariantChart(chart));
            }
        }

        // 构建 4 个选项（含正确答案）
        var options = [];
        options.push({ chart: chart, correct: true });
        for (var vi = 0; vi < variants.length; vi++) {
            options.push({ chart: variants[vi], correct: false });
        }
        options = H.shuffle(options);

        // 找正确答案的索引
        var correctIdx = 0;
        for (var ci = 0; ci < options.length; ci++) {
            if (options[ci].correct) { correctIdx = ci; break; }
        }

        // 数据文字
        var dataStr = chart.xLabels.map(function (label, idx) {
            return label + ' ' + chart.data[idx] + chart.unit;
        }).join('，');

        var choiceLabels = ['A', 'B', 'C', 'D'];
        var answer = choiceLabels[correctIdx];

        // 生成选项 HTML（缩略图）
        var miniChartsHtml = '';
        for (var mi = 0; mi < options.length; mi++) {
            miniChartsHtml += '<div class="lch-mini-option" data-idx="' + mi + '">' +
                '<div class="lch-mini-label">' + choiceLabels[mi] + '</div>' +
                '<div class="lch-mini-chart">' + renderMiniChart(options[mi].chart, 200, 100) + '</div>' +
                '</div>';
        }

        return {
            text: '请选出下面数据对应的折线统计图：\n' + dataStr,
            answer: answer,
            choices: ['A', 'B', 'C', 'D'],
            hint: '根据数据在图中的位置逐一比对',
            miniChartsHtml: miniChartsHtml,
            isDrawQuestion: true
        };
    }

    function makeCompareQuestion(chart) {
        // 比较两张图的特征
        var chart2 = genDifferentChart(chart);
        // 确保趋势方向不同
        var trend1 = analyzeTrend(chart.data);
        var trend2 = analyzeTrend(chart2.data);
        var tries = 0;
        while (trend1 === trend2 && tries < 10) {
            chart2 = genDifferentChart(chart);
            trend2 = analyzeTrend(chart2.data);
            tries++;
        }

        var max1 = Math.max.apply(null, chart.data);
        var max2 = Math.max.apply(null, chart2.data);
        var maxChart = max1 >= max2 ? chart : chart2;
        var maxChartLabel = max1 >= max2 ? '图A' : '图B';
        var minChart = max1 < max2 ? chart : chart2;
        var minChartLabel = max1 < max2 ? '图A' : '图B';

        var answer = maxChartLabel;
        var text = '图A（' + chart.title + '）和图B（' + chart2.title + '）中，哪个的最大值更大？';
        var hint = '分别找到两张图的最高点进行比较';

        var compareChartsHtml =
            '<div class="lch-compare-wrap">' +
                '<div class="lch-compare-item">' +
                    '<div class="lch-compare-tag">图A</div>' +
                    '<div class="lch-compare-svg">' + renderMiniChart(chart, 220, 110) + '</div>' +
                '</div>' +
                '<div class="lch-compare-item">' +
                    '<div class="lch-compare-tag">图B</div>' +
                    '<div class="lch-compare-svg">' + renderMiniChart(chart2, 220, 110) + '</div>' +
                '</div>' +
            '</div>';

        return {
            text: text,
            answer: answer,
            choices: ['图A', '图B'],
            hint: hint,
            compareChartsHtml: compareChartsHtml,
            isCompareQuestion: true
        };
    }

    /* ── 游戏状态 ── */
    var state = {
        container: null,
        levelData: null,
        mistakes: 0,
        phase: 0,
        qIndex: 0,
        questions: [],
        answered: false
    };

    var game = {

        init: function (containerSelector, levelData) {
            state.container = document.querySelector(containerSelector);
            state.levelData = levelData || { reward: 30 };
            if (!state.container) return;

            H.injectStyles(STYLE_ID, buildCSS());

            state.mistakes = 0;
            state.phase = 1;
            state.qIndex = 0;
            state.answered = false;
            state.questions = buildPhase1();

            this.render();
            this.startPhase1();
        },

        render: function () {
            state.container.innerHTML =
                '<div class="lch-wrap">' +
                    '<div class="lch-header">' +
                        H.guideBarHTML('📈', '趋势分析——读懂折线统计图！', 'lch-guide') +
                    '</div>' +
                    '<div class="lch-body" id="lch-body"></div>' +
                '</div>';
        },

        startPhase1: function () {
            state.phase = 1;
            state.qIndex = 0;
            state.questions = buildPhase1();
            this.nextQuestion();
        },

        nextQuestion: function () {
            state.answered = false;

            if (state.qIndex >= state.questions.length) {
                if (state.phase === 1) {
                    state.phase = 2;
                    state.qIndex = 0;
                    state.questions = buildPhase2();
                    H.updateGuide('读图没问题！来分析趋势！', 'lch-guide');
                    var self = this;
                    setTimeout(function () { self.nextQuestion(); }, 1200);
                    return;
                } else if (state.phase === 2) {
                    state.phase = 3;
                    state.qIndex = 0;
                    state.questions = buildPhase3();
                    H.updateGuide('趋势分析高手！最后挑战：绘制与比较！', 'lch-guide');
                    var self2 = this;
                    setTimeout(function () { self2.nextQuestion(); }, 1200);
                    return;
                } else {
                    this.finishGame();
                    return;
                }
            }

            var q = state.questions[state.qIndex];
            var body = document.getElementById('lch-body');
            var phaseLabels = { 1: '读图识数', 2: '趋势判断', 3: '绘制与比较' };
            var phaseEmojis = { 1: '🔍', 2: '📊', 3: '✏️' };

            H.updateGuide('第 ' + (state.qIndex + 1) + '/4 题 · ' + phaseLabels[state.phase], 'lch-guide');

            // 构建题目区内容
            var chartHtml = '';
            if (q.chart) {
                chartHtml = '<div class="lch-chart-area">' + renderLineChart(q.chart) + '</div>';
            }

            var extraHtml = '';
            if (q.isDrawQuestion && q.miniChartsHtml) {
                extraHtml = '<div class="lch-mini-options">' + q.miniChartsHtml + '</div>';
            }
            if (q.isCompareQuestion && q.compareChartsHtml) {
                extraHtml = q.compareChartsHtml;
            }

            body.innerHTML =
                '<div class="lch-card">' +
                    '<div class="lch-card-emoji">' + phaseEmojis[state.phase] + '</div>' +
                    chartHtml +
                    '<div class="lch-card-text">' + q.text.replace(/\n/g, '<br>') + '</div>' +
                    extraHtml +
                    '<div class="lch-card-hint">' + q.hint + '</div>' +
                    '<div class="lch-card-choices" id="lch-choices"></div>' +
                '</div>';

            var self = this;

            if (q.isDrawQuestion) {
                // 绘图题：点击缩略图选项
                this.bindMiniOptionClicks(q);
            } else {
                // 普通选项
                H.renderChoices(
                    q.choices,
                    'lch-choices',
                    function (idx) {
                        self.handleAnswer(idx, q);
                    }
                );
            }
        },

        /** 绘图题：绑定缩略图点击 */
        bindMiniOptionClicks: function (q) {
            var self = this;
            var miniOptions = document.querySelectorAll('.lch-mini-option');
            miniOptions.forEach(function (el) {
                el.addEventListener('click', function () {
                    if (state.answered) return;
                    var idx = parseInt(el.getAttribute('data-idx'));
                    var picked = q.choices[idx];
                    state.answered = true;

                    if (picked === q.answer) {
                        H.updateGuide('折线图画得准！趋势分析达人！✅', 'lch-guide');
                        self.updateMastery(8);
                        el.classList.add('lch-mini-selected-correct');
                        self.advanceQ();
                    } else {
                        state.mistakes++;
                        H.triggerError(state.container, '正确答案：' + q.answer, el);
                        self.updateMastery(-5);
                        el.classList.add('lch-mini-selected-wrong');
                        // 高亮正确
                        miniOptions.forEach(function (opt) {
                            if (opt.getAttribute('data-idx') === String(q.choices.indexOf(q.answer))) {
                                opt.classList.add('lch-mini-selected-correct');
                            }
                        });
                        self.advanceQ(true);
                    }
                });
            });
        },

        /** 通用答题处理 */
        handleAnswer: function (idx, q) {
            if (state.answered) return;
            state.answered = true;
            var self = this;
            var picked = q.choices[idx];

            if (picked === q.answer) {
                H.updateGuide('答对了！趋势分析能力真强！✅', 'lch-guide');
                this.updateMastery(8);
                var el = document.querySelector('#lch-choices .gh-choice-btn[data-idx="' + idx + '"]');
                if (el) {
                    el.style.background = '#10b981';
                    el.style.borderColor = '#10b981';
                    el.style.color = 'white';
                }
                this.advanceQ();
            } else {
                state.mistakes++;
                H.triggerError(state.container, '正确答案：' + q.answer,
                    document.querySelector('#lch-choices .gh-choice-btn[data-idx="' + idx + '"]'));
                this.updateMastery(-5);
                q.choices.forEach(function (c, ci) {
                    if (c === q.answer) {
                        var el2 = document.querySelector('#lch-choices .gh-choice-btn[data-idx="' + ci + '"]');
                        if (el2) {
                            el2.style.background = '#10b981';
                            el2.style.borderColor = '#10b981';
                            el2.style.color = 'white';
                        }
                    }
                });
                this.advanceQ(true);
            }
        },

        /** 推进到下一题（含延迟） */
        advanceQ: function (isWrong) {
            var self = this;
            var delay = isWrong ? 2000 : 1200;
            state.qIndex++;
            setTimeout(function () { self.nextQuestion(); }, delay);
        },

        /** 更新掌握度 */
        updateMastery: function (delta) {
            if (window.GameManager && window.GameManager.updateMastery) {
                window.GameManager.updateMastery(state.levelData.knowledgePoint, delta);
            }
        },

        finishGame: function () {
            H.showSettlement(
                state.container,
                state.levelData.reward || 30,
                state.levelData,
                state.mistakes,
                '你掌握了折线统计图的读取、趋势分析和比较！',
                NEXT_LEVEL
            );
        }
    };

    /* ── CSS ── */
    function buildCSS() {
        return '' +
            /* 布局 */
            '.lch-wrap{' +
                'width:100%;height:100%;position:relative;overflow:hidden;' +
                'font-family:"PingFang SC","Microsoft YaHei",sans-serif;' +
                'background:linear-gradient(180deg,#ede9fe 0%,#c4b5fd 40%,#7c3aed 100%);' +
                'display:flex;flex-direction:column;user-select:none;' +
            '}' +
            '.lch-header{position:relative;z-index:50;}' +
            '.lch-body{' +
                'flex:1;display:flex;flex-direction:column;align-items:center;' +
                'justify-content:center;padding:12px;gap:12px;' +
                'animation:lch-fadeIn 0.4s ease;overflow-y:auto;' +
            '}' +
            '@keyframes lch-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}' +

            /* 卡片 */
            '.lch-card{' +
                'background:white;border-radius:24px;padding:20px 24px 18px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.08);' +
                'border:3px solid #7c3aed;' +
                'display:flex;flex-direction:column;align-items:center;gap:12px;' +
                'animation:lch-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);' +
                'max-width:640px;width:96%;' +
            '}' +
            '@keyframes lch-pop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}' +
            '.lch-card-emoji{font-size:36px;}' +
            '.lch-card-text{' +
                'font-size:18px;font-weight:bold;color:#4c1d95;' +
                'text-align:center;line-height:1.6;' +
            '}' +
            '.lch-card-hint{' +
                'font-size:13px;color:#8b5cf6;font-style:italic;' +
                'background:#f5f3ff;padding:4px 12px;border-radius:8px;' +
            '}' +
            '.lch-card-choices{' +
                'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;' +
                'width:100%;max-width:500px;' +
            '}' +

            /* ── 折线图样式 ── */
            '.lch-chart-area{' +
                'width:100%;display:flex;justify-content:center;overflow-x:auto;' +
                'padding:4px 0;' +
            '}' +
            '.lch-chart-title{' +
                'font-size:14px;font-weight:bold;color:#374151;' +
                'text-align:center;margin-bottom:2px;' +
            '}' +
            '.lch-chart-box{' +
                'position:relative;margin:0 auto;' +
            '}' +

            /* 坐标轴 */
            '.lch-yaxis{' +
                'position:absolute;width:2px;background:#9ca3af;border-radius:1px;' +
            '}' +
            '.lch-xaxis{' +
                'position:absolute;height:2px;background:#9ca3af;border-radius:1px;' +
            '}' +

            /* Y 轴标签 */
            '.lch-ylabel{' +
                'position:absolute;font-size:10px;color:#6b7280;' +
                'width:40px;text-align:right;right:calc(100% + 4px);' +
                'transform:none;white-space:nowrap;' +
            '}' +

            /* 网格线 */
            '.lch-gridline{' +
                'position:absolute;left:48px;right:16px;' +
                'height:1px;background:#e5e7eb;z-index:0;' +
            '}' +

            /* X 轴标签 */
            '.lch-xlabel{' +
                'position:absolute;font-size:10px;color:#6b7280;' +
                'top:calc(100% - 2px);text-align:center;' +
                'width:36px;white-space:nowrap;' +
            '}' +

            /* 绘图区 */
            '.lch-plotarea{' +
                'position:absolute;z-index:2;' +
            '}' +

            /* 数据点 */
            '.lch-dot{' +
                'position:absolute;width:12px;height:12px;' +
                'background:#6366f1;border:2px solid white;' +
                'border-radius:50%;z-index:3;' +
                'box-shadow:0 1px 4px rgba(99,102,241,0.4);' +
                'transition:transform 0.15s ease;' +
            '}' +
            '.lch-dot:hover{transform:scale(1.3);}' +

            /* 数值标签 */
            '.lch-val{' +
                'position:absolute;font-size:10px;font-weight:bold;' +
                'color:#4338ca;white-space:nowrap;z-index:4;' +
                'pointer-events:none;' +
            '}' +

            /* SVG 连线 */
            '.lch-lines-svg{display:block;}' +

            /* ── 缩略图选项（Phase 3 绘图题） ── */
            '.lch-mini-options{' +
                'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;' +
                'width:100%;margin-top:4px;' +
            '}' +
            '.lch-mini-option{' +
                'border:2px solid #d1d5db;border-radius:12px;' +
                'padding:6px;cursor:pointer;transition:all 0.2s ease;' +
                'background:#fafafa;display:flex;align-items:center;gap:6px;' +
                'min-width:180px;flex:0 1 48%;' +
            '}' +
            '.lch-mini-option:hover{' +
                'border-color:#7c3aed;background:#f5f3ff;transform:translateY(-2px);' +
                'box-shadow:0 4px 12px rgba(124,58,237,0.15);' +
            '}' +
            '.lch-mini-label{' +
                'font-size:16px;font-weight:bold;color:#7c3aed;' +
                'min-width:24px;text-align:center;flex-shrink:0;' +
            '}' +
            '.lch-mini-chart{flex:1;overflow:hidden;}' +
            '.lch-mini-selected-correct{' +
                'border-color:#10b981 !important;background:#d1fae5 !important;' +
                'box-shadow:0 0 0 3px rgba(16,185,129,0.3) !important;' +
            '}' +
            '.lch-mini-selected-wrong{' +
                'border-color:#ef4444 !important;background:#fee2e2 !important;' +
                'box-shadow:0 0 0 3px rgba(239,68,68,0.3) !important;' +
            '}' +

            /* ── 比较图（Phase 3 比较题） ── */
            '.lch-compare-wrap{' +
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;' +
                'width:100%;margin-top:4px;' +
            '}' +
            '.lch-compare-item{' +
                'border:2px solid #d1d5db;border-radius:12px;' +
                'padding:8px;background:#fafafa;text-align:center;' +
                'flex:0 1 46%;min-width:180px;' +
            '}' +
            '.lch-compare-tag{' +
                'font-size:14px;font-weight:bold;color:#7c3aed;' +
                'margin-bottom:4px;' +
            '}' +
            '.lch-compare-svg{display:flex;justify-content:center;overflow:hidden;}' +

            /* ── 响应式 ── */
            '@media(max-width:480px){' +
                '.lch-card{padding:14px 12px 12px;border-radius:18px;}' +
                '.lch-card-text{font-size:15px;}' +
                '.lch-mini-option{min-width:140px;flex:0 1 100%;}' +
                '.lch-compare-item{flex:0 1 100%;}' +
            '}' +
            '';
    }

    window.CurrentGameModule = game;
})();
