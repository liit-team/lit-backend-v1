import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   canActivate(context: ExecutionContext): any {
  //     const request = context.switchToHttp().getRequest();
  //     console.log('Authorization Header:', request.headers.authorization);
  //     return super.canActivate(context);
  //   }
}
