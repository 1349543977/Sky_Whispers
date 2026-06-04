import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 商店物品模型
 */
export class ShopItem extends Model {
  declare id: number;
  declare name: string;
  declare category: string;
  declare price_coins: number;
  declare price_rmb: number;
  declare item_data: object;
  declare is_seasonal: boolean;
  declare season_id: number | null;
  declare available_from: Date | null;
  declare available_until: Date | null;
  declare readonly created_at: Date;
}

ShopItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物品名称',
    },
    category: {
      type: DataTypes.ENUM('skin', 'effect', 'prop', 'pass'),
      allowNull: false,
      comment: '物品类别',
    },
    price_coins: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '金币价格',
    },
    price_rmb: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '人民币价格',
    },
    item_data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: '物品数据',
    },
    is_seasonal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否季节限定',
    },
    season_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关联季节 ID',
    },
    available_from: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上架时间',
    },
    available_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下架时间',
    },
  },
  {
    sequelize,
    tableName: 'shop_items',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['category'] },
      { fields: ['is_seasonal'] },
    ],
  },
);
