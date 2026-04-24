// se cambia todo el auth para que pueda cerrar la sesion
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(_context: ExecutionContext) {
    return {
      prompt: 'select_account',
    };
  }
}