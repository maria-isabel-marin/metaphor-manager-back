import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleLogin(profile: any): Promise<{ accessToken: string }> {
    const googleId = profile.id as string;
    const email = profile.emails?.[0]?.value as string | undefined;
    const displayName = profile.displayName as string;
    const avatar = profile.photos?.[0]?.value as string;

    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    let user: UserDocument | null = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersService.findByEmail(email);
    }

    if (!user) {
      // Crea un UserDocument
      user = await this.usersService.create({
        name: displayName,
        email,
        role: 'editor',
        googleId,
        avatar,
      });
    } else if (!user.googleId) {
      // Actualiza y recarga
      const idStr = (user._id as Types.ObjectId).toHexString();
      await this.usersService.update(idStr, { googleId });
      user = await this.usersService.findOne(idStr);
    }

    // En este punto `user` es definitivamente un UserDocument
    const id = (user._id as Types.ObjectId).toHexString();
    const payload = { sub: id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser(payload: any): Promise<UserDocument> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
