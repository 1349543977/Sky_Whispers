import { SpriteRepository } from '@/repositories/SpriteRepository';
import { SpriteTypeRepository } from '@/repositories/SpriteTypeRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { GameCalculationService } from '@/services/GameCalculationService';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { hitChance } from '@/utils/helpers';

const spriteRepo = new SpriteRepository();
const spriteTypeRepo = new SpriteTypeRepository();
const userRepo = new UserRepository();
const calculationService = new GameCalculationService();

/**
 * 精灵服务 - 处理天气精灵捕获、喂食、图鉴业务逻辑
 */
export class SpriteService {
  /**
   * 获取用户精灵收藏
   * @param userId 用户 ID
   * @returns 精灵收藏列表
   */
  async getCollection(userId: number) {
    try {
      const sprites = await spriteRepo.findByUserId(userId);
      return sprites.map((sprite) => ({
        id: sprite.id,
        spriteTypeId: sprite.sprite_type_id,
        nickname: sprite.nickname,
        level: sprite.level,
        happiness: sprite.happiness,
        lastFedAt: sprite.last_fed_at,
        createdAt: sprite.created_at,
        spriteType: sprite.get('spriteType') ? {
          id: (sprite.get('spriteType') as Record<string, unknown>).id,
          name: (sprite.get('spriteType') as Record<string, unknown>).name,
          rarity: (sprite.get('spriteType') as Record<string, unknown>).rarity,
          weatherCondition: (sprite.get('spriteType') as Record<string, unknown>).weather_condition,
          spriteUrl: (sprite.get('spriteType') as Record<string, unknown>).sprite_url,
        } : null,
      }));
    } catch (error) {
      logger.error('SpriteService.getCollection 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 尝试捕获精灵
   * @param userId 用户 ID
   * @param spriteTypeId 精灵类型 ID
   * @param currentWeather 当前天气
   * @returns 捕获结果
   */
  async attemptCatch(userId: number, spriteTypeId: number, currentWeather: string) {
    try {
      const spriteType = await spriteTypeRepo.findByIdOrFail(spriteTypeId);

      if (spriteType.weather_condition !== currentWeather) {
        throw new ValidationError('当前天气不适合捕获此精灵');
      }

      const existing = await spriteRepo.findByType(userId, spriteTypeId);
      if (existing) {
        throw new ConflictError('你已经拥有此精灵');
      }

      const catchRate = calculationService.calculateCatchRate(
        Number(spriteType.catch_rate),
        spriteType.rarity,
      );

      const isCaught = hitChance(catchRate);

      if (!isCaught) {
        logger.info('精灵捕获失败', { userId, spriteTypeId });
        return { caught: false, catchRate };
      }

      const sprite = await spriteRepo.create({
        user_id: userId,
        sprite_type_id: spriteTypeId,
        nickname: spriteType.name,
        level: 1,
        happiness: 80,
      } as Record<string, unknown>);

      logger.info('精灵捕获成功', { userId, spriteTypeId, spriteId: sprite.id });

      return {
        caught: true,
        catchRate,
        sprite: {
          id: sprite.id,
          nickname: sprite.nickname,
          level: sprite.level,
          happiness: sprite.happiness,
          spriteTypeName: spriteType.name,
          rarity: spriteType.rarity,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof ConflictError) throw error;
      logger.error('SpriteService.attemptCatch 失败', { userId, spriteTypeId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 喂食精灵
   * @param spriteId 精灵 ID
   * @param userId 用户 ID
   * @returns 喂食结果
   */
  async feedSprite(spriteId: number, userId: number) {
    try {
      const sprite = await spriteRepo.findByIdOrFail(spriteId);

      if (sprite.happiness >= 100) {
        throw new ValidationError('精灵幸福度已满');
      }

      const happinessGain = calculationService.calculateFeedHappinessGain(sprite.level);
      const newHappiness = Math.min(100, sprite.happiness + happinessGain);

      const updated = await spriteRepo.updateHappiness(spriteId, newHappiness);

      logger.info('精灵喂食', { spriteId, userId, happinessGain });

      return {
        happiness: updated.happiness,
        happinessGain,
        lastFedAt: updated.last_fed_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('SpriteService.feedSprite 失败', { spriteId, userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取精灵图鉴
   * @param userId 用户 ID
   * @returns 图鉴信息
   */
  async getCodex(userId: number) {
    try {
      const allTypes = await spriteTypeRepo.listAll();
      const userSprites = await spriteRepo.findByUserId(userId);
      const ownedTypeIds = new Set(userSprites.map((s) => s.sprite_type_id));

      return allTypes.map((type) => ({
        id: type.id,
        name: type.name,
        nameEn: type.name_en,
        description: type.description,
        rarity: type.rarity,
        weatherCondition: type.weather_condition,
        spriteUrl: type.sprite_url,
        owned: ownedTypeIds.has(type.id),
      }));
    } catch (error) {
      logger.error('SpriteService.getCodex 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }
}
