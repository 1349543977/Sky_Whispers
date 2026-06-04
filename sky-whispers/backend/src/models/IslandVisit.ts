import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/models/database';

/**
 * 岛屿访问记录模型
 */
export class IslandVisit extends Model {
  declare id: number;
  declare visitor_id: number;
  declare island_id: number;
  declare interaction_type: string;
  declare readonly created_at: Date;
}

IslandVisit.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    visitor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '访问者 ID',
    },
    island_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '岛屿 ID',
    },
    interaction_type: {
      type: DataTypes.ENUM('water', 'breeze', 'gift', 'view'),
      allowNull: false,
      comment: '交互类型',
    },
  },
  {
    sequelize,
    tableName: 'island_visits',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['island_id'] },
      { fields: ['visitor_id'] },
    ],
  },
);
