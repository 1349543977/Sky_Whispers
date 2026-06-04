import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 植物模型
 */
export class Plant extends Model {
  declare id: number;
  declare island_id: number;
  declare plant_type_id: number;
  declare growth_stage: number;
  declare growth_progress: number;
  declare planted_at: Date;
  declare matured_at: Date | null;
  declare is_collected: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Plant.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    island_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属岛屿 ID',
    },
    plant_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '植物类型 ID',
    },
    growth_stage: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 3 },
      comment: '生长阶段 (0-3)',
    },
    growth_progress: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: '生长进度 (0-100)',
    },
    planted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '种植时间',
    },
    matured_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '成熟时间',
    },
    is_collected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已收获',
    },
  },
  {
    sequelize,
    tableName: 'plants',
    indexes: [
      { fields: ['island_id'] },
      { fields: ['plant_type_id'] },
    ],
  },
);
