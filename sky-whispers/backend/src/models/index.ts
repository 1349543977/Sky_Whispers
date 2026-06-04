export { sequelize, initDatabase, closeDatabase } from '@/models/database';
export { User } from '@/models/User';
export { Island } from '@/models/Island';
export { Plant } from '@/models/Plant';
export { PlantType } from '@/models/PlantType';
export { WeatherSprite } from '@/models/WeatherSprite';
export { SpriteType } from '@/models/SpriteType';
export { Friendship } from '@/models/Friendship';
export { Gift } from '@/models/Gift';
export { IslandVisit } from '@/models/IslandVisit';
export { ShopItem } from '@/models/ShopItem';
export { UserInventory } from '@/models/UserInventory';
export { SeasonPass } from '@/models/SeasonPass';
export { SeasonPassProgress } from '@/models/SeasonPassProgress';
export { AdInteraction } from '@/models/AdInteraction';
export { StepRecord } from '@/models/StepRecord';

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

// ==================== User 关联 ====================
User.hasOne(Island, { foreignKey: 'user_id', as: 'island' });
User.hasMany(WeatherSprite, { foreignKey: 'user_id', as: 'sprites' });
User.hasMany(Friendship, { foreignKey: 'user_id', as: 'friendships' });
User.hasMany(Gift, { foreignKey: 'sender_id', as: 'sentGifts' });
User.hasMany(Gift, { foreignKey: 'receiver_id', as: 'receivedGifts' });
User.hasMany(UserInventory, { foreignKey: 'user_id', as: 'inventory' });
User.hasMany(SeasonPassProgress, { foreignKey: 'user_id', as: 'seasonProgress' });
User.hasMany(AdInteraction, { foreignKey: 'user_id', as: 'adInteractions' });
User.hasMany(StepRecord, { foreignKey: 'user_id', as: 'stepRecords' });

// ==================== Island 关联 ====================
Island.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Island.hasMany(Plant, { foreignKey: 'island_id', as: 'plants' });
Island.hasMany(IslandVisit, { foreignKey: 'island_id', as: 'visits' });

// ==================== Plant 关联 ====================
Plant.belongsTo(Island, { foreignKey: 'island_id', as: 'island' });
Plant.belongsTo(PlantType, { foreignKey: 'plant_type_id', as: 'plantType' });

// ==================== PlantType 关联 ====================
PlantType.hasMany(Plant, { foreignKey: 'plant_type_id', as: 'plants' });

// ==================== WeatherSprite 关联 ====================
WeatherSprite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WeatherSprite.belongsTo(SpriteType, { foreignKey: 'sprite_type_id', as: 'spriteType' });

// ==================== SpriteType 关联 ====================
SpriteType.hasMany(WeatherSprite, { foreignKey: 'sprite_type_id', as: 'sprites' });

// ==================== Friendship 关联 ====================
Friendship.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Friendship.belongsTo(User, { foreignKey: 'friend_id', as: 'friend' });

// ==================== Gift 关联 ====================
Gift.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Gift.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// ==================== IslandVisit 关联 ====================
IslandVisit.belongsTo(User, { foreignKey: 'visitor_id', as: 'visitor' });
IslandVisit.belongsTo(Island, { foreignKey: 'island_id', as: 'island' });

// ==================== ShopItem 关联 ====================
ShopItem.hasMany(UserInventory, { foreignKey: 'item_id', as: 'inventories' });

// ==================== UserInventory 关联 ====================
UserInventory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserInventory.belongsTo(ShopItem, { foreignKey: 'item_id', as: 'item' });

// ==================== SeasonPass 关联 ====================
SeasonPass.hasMany(SeasonPassProgress, { foreignKey: 'pass_id', as: 'progress' });

// ==================== SeasonPassProgress 关联 ====================
SeasonPassProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SeasonPassProgress.belongsTo(SeasonPass, { foreignKey: 'pass_id', as: 'seasonPass' });

// ==================== AdInteraction 关联 ====================
AdInteraction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ==================== StepRecord 关联 ====================
StepRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
