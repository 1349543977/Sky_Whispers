export declare class StorageService {
    private prefix;
    constructor(prefix?: string);
    private getKey;
    set<T>(key: string, value: T): void;
    get<T>(key: string, defaultValue: T): T;
    remove(key: string): void;
    has(key: string): boolean;
    clear(): void;
    getAllKeys(): string[];
    getStorageSize(): number;
}
//# sourceMappingURL=StorageService.d.ts.map