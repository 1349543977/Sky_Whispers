"use strict";
// ============================================================
// StepSystem - Step tracking and wind power conversion
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
const constants_1 = require("../utils/constants");
const timer_1 = require("../utils/timer");
class StepSystem {
    constructor(wxService, apiClient) {
        this.todaySteps = 0;
        this.windPower = 0;
        this.lastSyncDate = '';
        this.initialized = false;
        this.wxService = wxService;
        this.apiClient = apiClient;
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    async init() {
        if (this.initialized)
            return;
        try {
            await this.syncSteps();
        }
        catch (err) {
            console.error('[StepSystem] Init failed:', err);
        }
        this.initialized = true;
    }
    async syncSteps() {
        try {
            const weRunData = await this.wxService.getWeRunData();
            if (!weRunData) {
                console.warn('[StepSystem] No WeRun data available');
                return;
            }
            // Send encrypted data to server for decryption
            const response = await this.apiClient.syncSteps({
                encrypted_data: weRunData.encryptedData,
                iv: weRunData.iv,
            });
            if (response.code === 0) {
                const record = response.data;
                this.todaySteps = record.steps;
                this.windPower = record.wind_power;
                this.lastSyncDate = record.date;
                this.eventManager.emit(types_1.GameEvent.StepsUpdated, {
                    steps: this.todaySteps,
                    date: record.date,
                });
                this.eventManager.emit(types_1.GameEvent.WindPowerChanged, {
                    windPower: this.windPower,
                });
            }
        }
        catch (err) {
            console.error('[StepSystem] Sync failed:', err);
        }
    }
    convertStepsToWindPower(steps) {
        return Math.floor(steps * constants_1.GAME.STEP_TO_WIND_RATIO);
    }
    getTodaySteps() {
        return this.todaySteps;
    }
    getWindPower() {
        return this.windPower;
    }
    getLastSyncDate() {
        return this.lastSyncDate;
    }
    isSyncedToday() {
        return this.lastSyncDate === (0, timer_1.todayDateString)();
    }
    destroy() {
        this.initialized = false;
    }
}
exports.StepSystem = StepSystem;
//# sourceMappingURL=StepSystem.js.map