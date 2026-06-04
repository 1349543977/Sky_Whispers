import { logger } from '@/utils/logger';

/**
 * 安全执行异步函数，捕获异常并返回结果
 * @param fn 异步函数
 * @param defaultValue 失败时的默认返回值
 * @returns 函数结果或默认值
 */
export async function safeAsync<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error('safeAsync 捕获异常', { error: (error as Error).message });
    return defaultValue;
  }
}

/**
 * 延迟指定毫秒
 * @param ms 延迟毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成指定范围的随机整数
 * @param min 最小值（含）
 * @param max 最大值（含）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 根据概率判断是否命中
 * @param rate 概率 (0-1)
 */
export function hitChance(rate: number): boolean {
  return Math.random() < rate;
}

/**
 * 分页参数计算偏移量
 * @param page 页码（从1开始）
 * @param pageSize 每页数量
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * 计算总页数
 * @param total 总记录数
 * @param pageSize 每页数量
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param t 进度 (0-1)
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * 限制数值在指定范围内
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 省略对象中的敏感字段
 * @param obj 原始对象
 * @param keys 需要省略的键
 */
export function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
