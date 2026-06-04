import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 礼物模型
 */
export class Gift extends Model {
  declare id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare gift_type: string;
  declare gift_data: object;
  declare message: string;
  declare is_claimed: boolean;
  declare claimed_at: Date | null;
  declare readonly created_at: Date;
  declare expires_at: Date;
}

Gift.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '发送者 ID',
    },
    receiver_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '接收者 ID',
    },
    gift_type: {
      type: DataTypes.ENUM('rain_cloud', 'breeze', 'plant_seed', 'sprite_food'),
      allowNull: false,
      comment: '礼物类型',
    },
    gift_data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: '礼物数据',
    },
    message: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
      comment: '留言',
    },
    is_claimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已领取',
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '领取时间',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '过期时间',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '创建时间',
    },
  },
  {
    sequelize,
    tableName: 'gifts',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['receiver_id', 'is_claimed'] },
      { fields: ['sender_id'] },
    ],
  },
);
