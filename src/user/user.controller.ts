import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, SendMoneyDto } from './user.dto';
import { UserEntity } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: 'users',
  version: '0.0.1',
})
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  @Post('login')
  async login(@Body() user: LoginUserDto) {
    return this.userService.login(user);
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMyData(@Request() request: Request & any) {
    const { modelId } = request.user;
    const user_data = await this.userService.getMyData(modelId);
    return {
      status: HttpStatus.OK,
      data: user_data,
    };
  }

  @Put('send-to-wallet')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async sendMoneyToWallet(
    @Request() request: Request & any,
    @Body() transaction: SendMoneyDto,
  ) {
    const { modelId } = request.user;
    return this.userService.sendMoneyToWallet(modelId, transaction.money);
  }

  @Put('send-to-bank')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async sendMoneyToBank(
    @Request() request: Request & any,
    @Body() transaction: SendMoneyDto,
  ) {
    const { modelId } = request.user;
    return this.userService.sendMoneyToBank(modelId, transaction.money);
  }
}
