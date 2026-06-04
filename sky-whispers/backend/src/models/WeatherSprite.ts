import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 天气精灵模型
 */
export class WeatherSprite extends Model {
  declare id: number;
  declare user_id: number;
  declare sprite_type_id: number;
  declare nickname: string;
  declare level: number;
  declare happiness: number;
  declare last_fed_at: Date | null;
  declare readonly created_at: Date;
}

WeatherSprite.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属用户 ID',
    },
    sprite_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '精灵类型 ID',
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      comment: '精灵昵称',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '精灵等级',
    },
    happiness: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 80,
      validate: { min: 0, max: 100 },
      comment: '幸福度 (0-100)',
    },
    last_fed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后喂食时间',
    },
  },
  {
    sequelize,
    tableName: 'weather_sprites',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['sprite_type_id'] },
    ],
  },
);
