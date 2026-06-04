import { Context, Next } from 'koa';
import Joi from 'joi';
import { ValidationError } from '@/utils/errors';

/**
 * 创建 Joi 验证中间件
 * @param schema Joi schema 对象，支持 body、query、params
 * @returns Koa 中间件
 */
export function validate(schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) {
  return async function validationMiddleware(ctx: Context, next: Next): Promise<void> {
    try {
      if (schema.body) {
        const { error, value } = schema.body.validate(ctx.request.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          throw new ValidationError(
            '请求体验证失败',
            error.details.map((d) => d.message),
          );
        }
        ctx.request.body = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(ctx.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          throw new ValidationError(
            '查询参数验证失败',
            error.details.map((d) => d.message),
          );
        }
        ctx.query = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(ctx.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          throw new ValidationError(
            '路径参数验证失败',
            error.details.map((d) => d.message),
          );
        }
        ctx.params = value;
      }

      await next();
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw error;
    }
  };
}
