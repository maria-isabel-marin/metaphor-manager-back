// backend/src/auth/auth.controller.ts

import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface JwtRequest extends Request {
  user: {
    sub: string;
    email: string;
    name: string;
    role: string;
    // cualquier otro claim
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 1) Inicia OAuth con Google */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport redirige a Google
  }

  /** 2) Callback de Google */
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken } = req.user as { accessToken: string };
    // Redirigir al frontend con el token
    return res.redirect(`http://localhost:3001/auth/success?token=${accessToken}`);
  }

  /** 3) Ruta de prueba protegida */
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected(@Req() req: JwtRequest) {
    return {
      message: 'You have accessed a protected route',
      user: {
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    };
  }

  /** 4) Perfil del usuario logueado */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    // req.user es un UserDocument completo
    return {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar,
      googleId: req.user.googleId,
    };
  }
}
