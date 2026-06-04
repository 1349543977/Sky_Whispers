import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 季票进度模型
 */
export class SeasonPassProgress extends Model {
  declare id: number;
  declare user_id: number;
  declare pass_id: number;
  declare level: number;
  declare exp: number;
  declare is_premium: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

SeasonPassProgress.init(
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
    pass_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '季票 ID',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '当前等级',
    },
    exp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '当前经验',
    },
    is_premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否高级版',
    },
  },
  {
    sequelize,
    tableName: 'season_pass_progress',
    indexes: [
      { unique: true, fields: ['user_id', 'pass_id'] },
    ],
  },
);
