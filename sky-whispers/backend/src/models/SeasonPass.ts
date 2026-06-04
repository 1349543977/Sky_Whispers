import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 季票模型
 */
export class SeasonPass extends Model {
  declare id: number;
  declare name: string;
  declare season: string;
  declare year: number;
  declare start_date: Date;
  declare end_date: Date;
  declare max_level: number;
  declare readonly created_at: Date;
}

SeasonPass.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '季票名称',
    },
    season: {
      type: DataTypes.ENUM('spring', 'summer', 'autumn', 'winter'),
      allowNull: false,
      comment: '季节',
    },
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '年份',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '开始日期',
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '结束日期',
    },
    max_level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 50,
      comment: '最大等级',
    },
  },
  {
    sequelize,
    tableName: 'season_passes',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['season', 'year'] },
    ],
  },
);
