import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 精灵类型模型
 */
export class SpriteType extends Model {
  declare id: number;
  declare name: string;
  declare name_en: string;
  declare description: string;
  declare rarity: string;
  declare weather_condition: string;
  declare catch_rate: number;
  declare ability: object;
  declare sprite_url: string;
  declare readonly created_at: Date;
}

SpriteType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '精灵名称',
    },
    name_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '英文名称',
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
      comment: '描述',
    },
    rarity: {
      type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
      allowNull: false,
      defaultValue: 'common',
      comment: '稀有度',
    },
    weather_condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '出现天气条件',
    },
    catch_rate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.5,
      validate: { min: 0, max: 1 },
      comment: '捕获率 (0-1)',
    },
    ability: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: '能力数据',
    },
    sprite_url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: '',
      comment: '精灵图 URL',
    },
  },
  {
    sequelize,
    tableName: 'sprite_types',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['rarity'] },
      { fields: ['weather_condition'] },
    ],
  },
);
