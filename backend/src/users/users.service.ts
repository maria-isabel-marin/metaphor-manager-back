import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Ejemplo de métodos (implementarlos según necesidades):
  // async create(createUserDto: CreateUserDto): Promise<User> { ... }
  // async findAll(): Promise<User[]> { ... }
  // async findOne(id: string): Promise<User> { ... }
  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> { ... }
  // async remove(id: string): Promise<void> { ... }
}
