// src/auth/strategies/google.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID:     configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL:  configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope:        ['email', 'profile'],
      passReqToCallback: true,       // <-- Obligatorio para StrategyOptionsWithRequest
    });
  }

  /**
   * Ahora validate recibe primero el Request,
   * luego accessToken, refreshToken y profile.
   */
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const jwt = await this.authService.validateGoogleLogin(profile);
      done(null, jwt);
    } catch (err) {
      done(err, false);
    }
  }
}
