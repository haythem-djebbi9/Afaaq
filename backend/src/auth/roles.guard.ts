import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

interface AuthedRequest {
  user: { userId: string; email: string; role: 'CLIENT' | 'ADMIN' };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      Array<'CLIENT' | 'ADMIN'> | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    if (!required.includes(request.user?.role)) {
      throw new ForbiddenException('Accès réservé.');
    }
    return true;
  }
}
