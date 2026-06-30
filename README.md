# 🌍 MathAdventure（数学大冒险）

> 🚀 **在线直接试玩地址**：[https://theodoreye001.github.io/MathAdventure/](https://theodoreye001.github.io/MathAdventure/)
> 
> *提示：本游戏完全适配移动端与电脑端浏览器，无须下载安装，点开链接即玩！*

---

## 🎮 游戏简介

`MathAdventure` 是一款专为小学阶段（1-6年级）设计的闯关类互动数学游戏平台。项目紧贴国内人教版小学数学大纲，涵盖了 **12 个学期、近百个知识单元**。

平台通过把枯燥的“刷题”拆解为一个个充满趣味性的“小游戏”（共计 **94 个独立关卡**），利用程序化随机出题机制，引导孩子们在玩乐中巩固知识，摆脱枯燥无味的机械式练习。

### 🌟 核心特色
* **关卡丰富**：94 个游戏模块，难度从一年级“点击 Emoji 数数”平滑过渡到六年级“比例与圆柱体积计算”。
* **程序化出题**：数值和干扰选项由算法随机生成，每次挑战都是新题目，拒绝死记硬背。
* **游戏化反馈**：星级评定（⭐⭐⭐）、金币奖励系统、荣誉称号晋升。
* **错题本与家长控制台**：自动捕获并记录每一道错题，利用 Chart.js 渲染直观的“知识掌握度雷达图”。
* **极致轻量**：纯原生前端技术（HTML/CSS/JS），**0 图片、0 音频、0 构建工具**，完全使用 HSL 色彩系统、CSS 动效及 Emoji 表现画面。

---

## 📂 项目结构

```text
MathAdventure/
├── index.html          # 游戏大厅（年级导航、关卡选择地图、星级展示）
├── game.html           # 关卡热加载容器（解析URL参数，动态装载对应JS）
├── dashboard.html      # 家长控制台（雷达图表、错题回顾、金币与通关统计）
├── data/
│   └── levels.json     # 全局关卡配置文件（包含 94 个关卡的路由与描述）
├── docs/               # 策划与设计文档
│   ├── 游戏设计.txt     # AI 协作开发完整对话记录
│   └── 知识点.md       # 人教版课标对齐文档
└── src/
    ├── core/
    │   └── stateManager.js  # 核心状态引擎（存档持久化、金币与错题日志）
    └── games/
        ├── common/
        │   └── gameHelpers.js # 公共工具库（选择题渲染、结算面板、震动动画）
        └── grade1~6/          # 94 个独立的关卡逻辑 JS 文件
```

---

## 💻 本地运行指南

如果您想在本地运行或二次开发该项目，请阅读以下指南：

### ⚠️ 运行前须知
由于游戏使用原生的 `fetch()` 异步请求加载 `data/levels.json` 数据，**直接双击 `index.html` 打开会触发浏览器的 CORS 跨域限制安全报错**。您必须在本地搭建一个简易的 HTTP 服务器环境。

### 本地启动方式

#### 方法 1：使用 VS Code Live Server 插件（最推荐）
1. 用 **VS Code** 打开 `MathAdventure` 文件夹。
2. 安装 **Live Server** 插件。
3. 点击编辑器右下角的 **Go Live** 即可在浏览器中一键启动并自动刷新。

#### 方法 2：使用 Node.js (npx)
在项目根目录下打开终端，运行以下命令：
```bash
npx serve
```
然后根据提示访问 `http://localhost:3000`（或 `5000`）。

#### 方法 3：使用 Python
在项目根目录下打开终端，运行：
```bash
# Python 3
python -m http.server 8000
```
然后浏览器访问 `http://localhost:8000` 即可。

---

## 🛠️ 技术栈
* **核心语言**：Vanilla JavaScript (ES6+), HTML5, CSS3
* **状态持久化**：`localStorage` (键名: `MATH_ADVENTURE_SAVE_DATA`)
* **第三方库**：`Chart.js v4` (仅在家长控制台 `dashboard.html` 中通过 CDN 引入，用于绘制雷达图)
* **工程架构**：采用约定优于配置 (Convention over Configuration) 自动路由装载。
