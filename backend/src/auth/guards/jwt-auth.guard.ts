// src/auth/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 1) antes de validar el token, imprimimos la cabecera Authorization
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    console.log(
      '[JwtAuthGuard] incoming request:',
      req.method,
      req.url,
      'Authorization:',
      req.headers.authorization,
    );
    // delegamos a Passport para que valide el JWT
    return super.canActivate(context);
  }

  // 2) después de validar, si no hay usuario, lanzamos error
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      console.error('[JwtAuthGuard] authentication failed:', info?.message);
      throw err || new UnauthorizedException();
    }
    // imprimimos el user extraído del token
    console.log('[JwtAuthGuard] authenticated user:', user);
    return user;
  }
}
