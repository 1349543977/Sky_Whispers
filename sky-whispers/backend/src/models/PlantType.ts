import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 植物类型模型
 */
export class PlantType extends Model {
  declare id: number;
  declare name: string;
  declare name_en: string;
  declare description: string;
  declare rarity: string;
  declare growth_time_base: number;
  declare required_weather: object;
  declare required_light_min: number;
  declare required_moisture_min: number;
  declare coin_yield: number;
  declare sprite_url: string;
  declare is_special: boolean;
  declare readonly created_at: Date;
}

PlantType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '植物名称',
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
    growth_time_base: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '基础生长时间（秒）',
    },
    required_weather: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '所需天气条件',
    },
    required_light_min: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '最低光照需求',
    },
    required_moisture_min: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '最低湿度需求',
    },
    coin_yield: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
      comment: '金币产出',
    },
    sprite_url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: '',
      comment: '精灵图 URL',
    },
    is_special: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否特殊植物',
    },
  },
  {
    sequelize,
    tableName: 'plant_types',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    indexes: [
      { fields: ['rarity'] },
    ],
  },
);
