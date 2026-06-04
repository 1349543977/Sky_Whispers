import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 用户模型
 */
export class User extends Model {
  declare id: number;
  declare openid: string;
  declare unionid: string | null;
  declare nickname: string;
  declare avatar_url: string;
  declare location_lat: number | null;
  declare location_lng: number | null;
  declare city_code: string | null;
  declare level: number;
  declare exp: number;
  declare coins: number;
  declare wind_power: number;
  declare total_steps: number;
  declare last_login_at: Date | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    openid: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: '微信 openid',
    },
    unionid: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
      comment: '微信 unionid',
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '旅行者',
      comment: '昵称',
    },
    avatar_url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: '',
      comment: '头像 URL',
    },
    location_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: '纬度',
    },
    location_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      comment: '经度',
    },
    city_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '城市编码',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '等级',
    },
    exp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '经验值',
    },
    coins: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '金币',
    },
    wind_power: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '风之力',
    },
    total_steps: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '总步数',
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间',
    },
  },
  {
    sequelize,
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['openid'] },
      { unique: true, fields: ['unionid'] },
    ],
  },
);
