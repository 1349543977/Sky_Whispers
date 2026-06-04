import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 岛屿模型
 */
export class Island extends Model {
  declare id: number;
  declare user_id: number;
  declare name: string;
  declare skin_id: number;
  declare level: number;
  declare expansion_slots: number;
  declare weather_type: string;
  declare light_level: number;
  declare moisture_level: number;
  declare windmill_level: number;
  declare auto_collect: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Island.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '我的浮岛',
      comment: '岛屿名称',
    },
    skin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '皮肤 ID',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '岛屿等级',
    },
    expansion_slots: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 6,
      comment: '扩展槽位数',
    },
    weather_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'sunny',
      comment: '当前天气类型',
    },
    light_level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 50,
      comment: '光照等级 (0-100)',
    },
    moisture_level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 50,
      comment: '湿度等级 (0-100)',
    },
    windmill_level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '风车等级',
    },
    auto_collect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否自动收集',
    },
  },
  {
    sequelize,
    tableName: 'islands',
    indexes: [
      { unique: true, fields: ['user_id'] },
    ],
  },
);
