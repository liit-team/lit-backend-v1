import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 특정 필드를 매개변수로 받고 반환합니다.
    if (data) {
      return user?.[data];
    }

    return user.id; // 사용자 객체의 id를 반환합니다.
  },
);
