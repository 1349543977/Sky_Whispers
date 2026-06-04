import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 步数记录模型
 */
export class StepRecord extends Model {
  declare id: number;
  declare user_id: number;
  declare date: string;
  declare steps: number;
  declare wind_power_earned: number;
  declare readonly created_at: Date;
}

StepRecord.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '日期',
    },
    steps: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '步数',
    },
    wind_power_earned: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '获得的风之力',
    },
  },
  {
    sequelize,
    tableName: 'step_records',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['user_id', 'date'] },
    ],
  },
);
