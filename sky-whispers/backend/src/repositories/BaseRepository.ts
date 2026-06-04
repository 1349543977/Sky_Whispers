import { Model, FindOptions, CreateOptions, UpdateOptions, DestroyOptions, Attributes, CreationAttributes } from 'sequelize';
import { logger } from '@/utils/logger';
import { NotFoundError } from '@/utils/errors';

/**
 * 基础仓库类 - 提供通用 CRUD 操作
 * @typeparam T Sequelize Model 类型
 */
export class BaseRepository<T extends Model> {
  protected model: typeof Model & { new (): T };

  constructor(model: typeof Model & { new (): T }) {
    this.model = model;
  }

  /**
   * 根据主键查找记录
   * @param id 主键值
   * @param options 查询选项
   * @returns 模型实例或 null
   */
  async findById(id: number, options?: Omit<FindOptions<Attributes<T>>, 'where'>): Promise<T | null> {
    try {
      const record = await this.model.findByPk(id, options);
      return record as T | null;
    } catch (error) {
      logger.error(`${this.model.name}.findById 失败`, { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据主键查找记录，不存在则抛出异常
   * @param id 主键值
   * @param options 查询选项
   * @returns 模型实例
   */
  async findByIdOrFail(id: number, options?: Omit<FindOptions<Attributes<T>>, 'where'>): Promise<T> {
    const record = await this.findById(id, options);
    if (!record) {
      throw new NotFoundError(this.model.name, id);
    }
    return record;
  }

  /**
   * 根据条件查找一条记录
   * @param options 查询选项
   * @returns 模型实例或 null
   */
  async findOne(options: FindOptions<Attributes<T>>): Promise<T | null> {
    try {
      const record = await this.model.findOne(options);
      return record as T | null;
    } catch (error) {
      logger.error(`${this.model.name}.findOne 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据条件查找所有记录
   * @param options 查询选项
   * @returns 模型实例数组
   */
  async findAll(options?: FindOptions<Attributes<T>>): Promise<T[]> {
    try {
      const records = await this.model.findAll(options);
      return records as T[];
    } catch (error) {
      logger.error(`${this.model.name}.findAll 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 创建新记录
   * @param data 创建数据
   * @param options 创建选项
   * @returns 新建的模型实例
   */
  async create(data: CreationAttributes<T>, options?: CreateOptions): Promise<T> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const record = await this.model.create(data as any, options);
      return record as T;
    } catch (error) {
      logger.error(`${this.model.name}.create 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 批量创建记录
   * @param dataArr 创建数据数组
   * @param options 创建选项
   * @returns 新建的模型实例数组
   */
  async bulkCreate(dataArr: CreationAttributes<T>[], options?: CreateOptions): Promise<T[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const records = await this.model.bulkCreate(dataArr as any[], options);
      return records as T[];
    } catch (error) {
      logger.error(`${this.model.name}.bulkCreate 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新记录
   * @param data 更新数据
   * @param options 更新选项（必须包含 where）
   * @returns 受影响的行数
   */
  async update(data: Partial<Attributes<T>>, options: UpdateOptions<Attributes<T>>): Promise<number> {
    try {
      const [affectedCount] = await this.model.update(data, options);
      return affectedCount;
    } catch (error) {
      logger.error(`${this.model.name}.update 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据主键更新记录
   * @param id 主键值
   * @param data 更新数据
   * @returns 更新后的模型实例
   */
  async updateById(id: number, data: Partial<Attributes<T>>): Promise<T> {
    const record = await this.findByIdOrFail(id);
    await record.update(data as Record<string, unknown>);
    return record;
  }

  /**
   * 删除记录
   * @param options 删除选项（必须包含 where）
   * @returns 受影响的行数
   */
  async delete(options: DestroyOptions<Attributes<T>>): Promise<number> {
    try {
      const affectedCount = await this.model.destroy(options);
      return affectedCount;
    } catch (error) {
      logger.error(`${this.model.name}.delete 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据主键删除记录
   * @param id 主键值
   */
  async deleteById(id: number): Promise<void> {
    const record = await this.findByIdOrFail(id);
    await record.destroy();
  }

  /**
   * 统计记录数
   * @param options 查询选项
   * @returns 记录总数
   */
  async count(options?: Omit<FindOptions<Attributes<T>>, 'group'>): Promise<number> {
    try {
      const count = await this.model.count(options);
      return count;
    } catch (error) {
      logger.error(`${this.model.name}.count 失败`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 分页查询
   * @param page 页码（从1开始）
   * @param pageSize 每页数量
   * @param options 查询选项
   * @returns 分页结果
   */
  async paginate(
    page: number,
    pageSize: number,
    options?: Omit<FindOptions<Attributes<T>>, 'offset' | 'limit'>,
  ): Promise<{ rows: T[]; count: number }> {
    try {
      const offset = (page - 1) * pageSize;
      const result = await this.model.findAndCountAll({
        ...options,
        offset,
        limit: pageSize,
      });
      return { rows: result.rows as T[], count: result.count };
    } catch (error) {
      logger.error(`${this.model.name}.paginate 失败`, { error: (error as Error).message });
      throw error;
    }
  }
}
