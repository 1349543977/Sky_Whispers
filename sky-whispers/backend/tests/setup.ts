import { getSequelize, closeDatabase } from '@/models/database';
import { User } from '@/models/User';
import { Island } from '@/models/Island';
import { Plant } from '@/models/Plant';
import { PlantType } from '@/models/PlantType';
import { WeatherSprite } from '@/models/WeatherSprite';
import { SpriteType } from '@/models/SpriteType';
import { Friendship } from '@/models/Friendship';
import { Gift } from '@/models/Gift';
import { IslandVisit } from '@/models/IslandVisit';
import { ShopItem } from '@/models/ShopItem';
import { UserInventory } from '@/models/UserInventory';
import { SeasonPass } from '@/models/SeasonPass';
import { SeasonPassProgress } from '@/models/SeasonPassProgress';
import { AdInteraction } from '@/models/AdInteraction';
import { StepRecord } from '@/models/StepRecord';

// 重新导入关联
import '@/models/index';

/**
 * 初始化测试数据库（使用主 database 模块的 sqlite3 内存数据库）
 */
export async function setupTestDatabase() {
  const testSequelize = getSequelize();
  await testSequelize.sync({ force: true });
  return testSequelize;
}

/**
 * 清理测试数据库
 */
export async function cleanupTestDatabase(): Promise<void> {
  await closeDatabase();
}
