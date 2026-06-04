import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 好友关系模型
 */
export class Friendship extends Model {
  declare id: number;
  declare user_id: number;
  declare friend_id: number;
  declare status: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Friendship.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '发起者 ID',
    },
    friend_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '目标用户 ID',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '好友状态',
    },
  },
  {
    sequelize,
    tableName: 'friendships',
    indexes: [
      { unique: true, fields: ['user_id', 'friend_id'] },
      { fields: ['status'] },
    ],
  },
);
