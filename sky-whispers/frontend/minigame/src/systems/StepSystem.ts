// ============================================================
// StepSystem - Step tracking and wind power conversion
// ============================================================

import { GameEvent, StepRecord } from '../types';
import { EventManager } from '../core/EventManager';
import { WxService } from '../services/WxService';
import { ApiClient } from '../services/ApiClient';
import { GAME } from '../utils/constants';
import { todayDateString } from '../utils/timer';

export class StepSystem {
  private eventManager: EventManager;
  private wxService: WxService;
  private apiClient: ApiClient;
  private todaySteps: number = 0;
  private windPower: number = 0;
  private lastSyncDate: string = '';
  private initialized: boolean = false;

  constructor(wxService: WxService, apiClient: ApiClient) {
    this.wxService = wxService;
    this.apiClient = apiClient;
    this.eventManager = EventManager.getInstance();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.syncSteps();
    } catch (err) {
      console.error('[StepSystem] Init failed:', err);
    }

    this.initialized = true;
  }

  async syncSteps(): Promise<void> {
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
        const record: StepRecord = response.data;
        this.todaySteps = record.steps;
        this.windPower = record.wind_power;
        this.lastSyncDate = record.date;

        this.eventManager.emit(GameEvent.StepsUpdated, {
          steps: this.todaySteps,
          date: record.date,
        });

        this.eventManager.emit(GameEvent.WindPowerChanged, {
          windPower: this.windPower,
        });
      }
    } catch (err) {
      console.error('[StepSystem] Sync failed:', err);
    }
  }

  convertStepsToWindPower(steps: number): number {
    return Math.floor(steps * GAME.STEP_TO_WIND_RATIO);
  }

  getTodaySteps(): number {
    return this.todaySteps;
  }

  getWindPower(): number {
    return this.windPower;
  }

  getLastSyncDate(): string {
    return this.lastSyncDate;
  }

  isSyncedToday(): boolean {
    return this.lastSyncDate === todayDateString();
  }

  destroy(): void {
    this.initialized = false;
  }
}
