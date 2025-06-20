import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/column-preferences')
  async getColumnPreferences(@Req() req: any) {
    const user = await this.usersService.findOne(req.user._id);
    return user.columnPreferences || {};
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/column-preferences')
  async updateColumnPreferences(@Req() req: any, @Body() prefs: Record<string, any>) {
    const updated = await this.usersService.updateColumnPreferences(req.user._id, prefs);
    if (!updated) throw new NotFoundException('User not found');
    return updated.columnPreferences;
  }
}
