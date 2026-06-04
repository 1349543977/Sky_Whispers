import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 广告交互模型
 */
export class AdInteraction extends Model {
  declare id: number;
  declare user_id: number;
  declare ad_type: string;
  declare reward_data: object;
  declare watched_at: Date;
  declare expires_at: Date;
}

AdInteraction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户 ID',
    },
    ad_type: {
      type: DataTypes.ENUM('meteor_shower', 'weather_boost', 'daily_bonus'),
      allowNull: false,
      comment: '广告类型',
    },
    reward_data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: '奖励数据',
    },
    watched_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '观看时间',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '过期时间',
    },
  },
  {
    sequelize,
    tableName: 'ad_interactions',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    indexes: [
      { fields: ['user_id', 'ad_type'] },
    ],
  },
);
