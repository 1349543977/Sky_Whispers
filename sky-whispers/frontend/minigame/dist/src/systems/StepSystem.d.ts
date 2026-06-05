import { WxService } from '../services/WxService';
import { ApiClient } from '../services/ApiClient';
export declare class StepSystem {
    private eventManager;
    private wxService;
    private apiClient;
    private todaySteps;
    private windPower;
    private lastSyncDate;
    private initialized;
    constructor(wxService: WxService, apiClient: ApiClient);
    init(): Promise<void>;
    syncSteps(): Promise<void>;
    convertStepsToWindPower(steps: number): number;
    getTodaySteps(): number;
    getWindPower(): number;
    getLastSyncDate(): string;
    isSyncedToday(): boolean;
    destroy(): void;
}
