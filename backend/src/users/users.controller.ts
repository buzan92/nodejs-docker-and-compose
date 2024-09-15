import {
  Controller,
  Get,
  Req,
  UseGuards,
  Patch,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req) {
    return await this.usersService.findOne({ id: req.user.id }, false, true);
  }

  @Patch('me')
  async updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async meWishes(@Req() req) {
    return await this.usersService.findWithWishes(req.user.id);
  }

  @Get(':username')
  async findUser(@Param('username') username: string) {
    return await this.usersService.findOne({ username });
  }

  @Get(':username/wishes')
  async findUserWishes(@Param('username') username: string) {
    return await this.usersService.findUserWishes(username);
  }

  @Post('find')
  async findMany(@Body() data: { query: string }) {
    return await this.usersService.findMany(data.query);
  }
}
