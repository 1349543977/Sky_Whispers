import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 用户背包模型
 */
export class UserInventory extends Model {
  declare id: number;
  declare user_id: number;
  declare item_id: number;
  declare quantity: number;
  declare is_active: boolean;
  declare acquired_at: Date;
}

UserInventory.init(
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
    item_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '物品 ID',
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '数量',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否装备中',
    },
    acquired_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '获取时间',
    },
  },
  {
    sequelize,
    tableName: 'user_inventories',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['user_id', 'item_id'] },
    ],
  },
);
