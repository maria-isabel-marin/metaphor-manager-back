import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      // Extrae el JWT del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Passport llama automáticamente a validate() cuando el token es válido en el header
  async validate(payload: any) {
    // payload.sub contiene userId, payload.email, payload.role
    return this.authService.validateUser(payload);
    // Si validateUser devuelve un usuario, req.user = ese usuario y la petición continúa
    // Si falla, lanza UnauthorizedException y Nest devuelve 401
  }
}
