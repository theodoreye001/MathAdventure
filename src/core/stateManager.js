/**
 * 《数学大冒险》游戏状态管理器 (State Manager)
 * 采用全局单例模式：window.GameManager
 */

class StateManager {
    constructor() {
        this.SAVE_KEY = 'MATH_ADVENTURE_SAVE_DATA';
        // 初始默认状态
        this.state = {
            coins: 0,
            titles: ["初出茅庐"],
            unlockedLevels: ['lvl_1_1_1'],
            levelRecords: {}, // { levelId: { stars: 0 } }
            errorLog: [], // [{ levelId, date, question, wrongAnswer, correctAnswer }]
            mastery: {} // { "知识点": 80 }
        };
    }

    /** 获取当前金币数量 */
    get coins() {
        return this.state.coins;
    }

    /** 初始化：从本地读取存档 */
    init() {
        console.log("[GameManager] 正在初始化...");
        const localData = localStorage.getItem(this.SAVE_KEY);
        if (localData) {
            try {
                this.state = { ...this.state, ...JSON.parse(localData) };
                console.log("[GameManager] 存档加载成功");
            } catch (error) {
                console.error("[GameManager] 存档损坏，已重置", error);
                this.save();
            }
        } else {
            this.save();
        }
    }

    /** 保存到本地 */
    save() {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.warn("[GameManager] 无法保存进度，可能是存储空间已满或处于无痕模式。", error);
        }
    }

    /** 增加金币 */
    addCoins(amount) {
        this.state.coins += amount;
        if (this.state.coins < 0) this.state.coins = 0;
        console.log(`[GameManager] 金币变动: ${amount}, 当前: ${this.state.coins}`);
        this.save();
    }

    /** 解锁关卡 */
    unlockLevel(levelId) {
        if (!this.state.unlockedLevels.includes(levelId)) {
            this.state.unlockedLevels.push(levelId);
            console.log(`[GameManager] 关卡解锁: ${levelId}`);
            this.save();
        }
    }

    /** 检查是否解锁 */
    isLevelUnlocked(levelId) {
        return this.state.unlockedLevels.includes(levelId);
    }

    /** 更新记录（星星） */
    updateRecord(levelId, stars) {
        const current = this.state.levelRecords[levelId] || { stars: 0 };
        if (stars > current.stars) {
            this.state.levelRecords[levelId] = { stars: stars };
            console.log(`[GameManager] 关卡 ${levelId} 纪录更新为 ${stars} 星`);
            this.save();
        }
    }

    /** 记录错题 */
    logError(levelId, question, wrongAnswer, correctAnswer) {
        const errorEntry = {
            levelId,
            date: new Date().toISOString(),
            question,
            wrongAnswer,
            correctAnswer
        };
        this.state.errorLog.unshift(errorEntry); // 最新在最前
        
        // 限制 100 条
        if (this.state.errorLog.length > 100) {
            this.state.errorLog.pop();
        }
        
        console.log(`[GameManager] 错题已记录: ${question}`);
        this.save();
    }

    /** 更新熟练度 */
    updateMastery(knowledgePoint, delta) {
        if (!this.state.mastery[knowledgePoint]) {
            this.state.mastery[knowledgePoint] = 0;
        }
        
        let newValue = this.state.mastery[knowledgePoint] + delta;
        newValue = Math.max(0, Math.min(100, newValue));
        
        this.state.mastery[knowledgePoint] = newValue;
        console.log(`[GameManager] 知识点 [${knowledgePoint}] 熟练度更新: ${newValue}`);
        this.save();
    }

    /** 清空错题 */
    clearErrors() {
        this.state.errorLog = [];
        this.save();
        console.log("[GameManager] 错题记录已清空");
    }
}

// 核心：创建全局单例并自动初始化
window.GameManager = new StateManager();
window.GameManager.init();
