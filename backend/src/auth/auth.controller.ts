import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 1) Inicia el flujo de Google OAuth. No devuelve nada,
   *    Passport redirige automáticamente a Google para solicitar permiso.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Este método queda vacío: Passport se encarga de la redirección a Google
  }

  /**
   * 2) Callback al que Google redirige con ?code=…
   *    GoogleStrategy.validate() habrá generado un JWT y lo dejó en req.user.
   * @param req Contiene req.user = { accessToken: '...' }
   * @param res Opcionalmente, puedes usar res.redirect para mandar al frontend.
   */
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken } = req.user as { accessToken: string };

    // OPCIÓN A: devolver JSON con el token (útil si tu frontend consume la API y maneja la respuesta)
    // return res.json({ accessToken });

    // OPCIÓN B: redirigir al frontend con el token en query params
    // (asegúrate que tu frontend luego capture ese token y lo guarde en cookie/localStorage)
    return res.redirect(`http://localhost:3000/auth/success?token=${accessToken}`);
  }

  /**
   * 3) Ruta de ejemplo protegida con JWT. Cliente debe enviar:
   *    Authorization: Bearer <JWT>
   * @param req Contiene req.user = usuario validado por JwtStrategy.validate()
   */
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected(@Req() req: Request) {
    // req.user ya es el objeto User retornado por AuthService.validateUser()
    return {
      message: 'You have accessed a protected route',
      user: (req as any).user,
    };
  }
}
