import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './request-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.authUser;
  },
);
