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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, SendMoneyDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: 'users',
  version: '0.0.1',
})
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'It takes email, password and name of the user and will create an account with random account number and ifsc code.' +
      'By default we will credit 10000 rupees to the user on his bank account',
  })
  @ApiPreconditionFailedResponse({
    description: 'If the required data is not received from the user',
    schema: {
      example: {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'Please enter a valid email address, password and username',
      },
    },
  })
  @ApiConflictResponse({
    description:
      'If their is any conflict with the data sent by the user and the conditions needed to process the request',
    schema: {
      example: {
        status: HttpStatus.CONFLICT,
        message: 'Email already exists',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'If the occurred error is not handled by the server',
    schema: {
      example: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error occurred while creating the user',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'On Successfully created user',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'Account created successfully',
      },
    },
  })
  async register(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  @Post('login')
  @ApiPreconditionFailedResponse({
    description: 'If the required data is not received from the user',
    schema: {
      example: {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'Please enter a valid email address, password',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'If their is any conflict with the data sent by the user and the conditions needed to process the request',
    schema: {
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Email / password are in correct',
      },
    },
  })
  @ApiOkResponse({
    description: 'On Successfully created user',
    schema: {
      example: {
        status: HttpStatus.OK,
        data: {
          token: 'token',
          name: 'sample',
          account_number: '1012121212',
          ifsc_code: 'SBIN332322',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Login user',
    description:
      'It takes email, password and will login the user' +
      'it generates a jwt token which can be used as authentication token. The token created will have cool period of 1 second to prevent any attacks' +
      'in the return object we get the user account number and ifsc code but not the amount in the bank / wallet',
  })
  async login(@Body() user: LoginUserDto) {
    return this.userService.login(user);
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: 200,
        data: {
          money_in_bank_account: 10000,
          money_in_wallet: 0,
          _id: '66731fa8816feed175d198eb',
          email: 'sample@gmail.com',
          account_number: '102711155012',
          ifsc_code: 'SBIN1550096',
          name: 'sample',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Get the data of logged in user',
    description:
      'This api expects you to pass the jwt token as part to get the data of the user, not passing token will result in un authorization error',
  })
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
  @ApiResponse({
    status: HttpStatus.EXPECTATION_FAILED,
    schema: {
      example: {
        status: 417,
        message: 'No Sufficient funds available for processing request',
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: 200,
        message: 'Successfully sent',
      },
    },
  })
  @ApiOperation({
    summary: 'Send money to wallet',
    description:
      'User must to login to access this api, user should have enough funds to process the transaction failing will result in expectation failed error',
  })
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
  @ApiOperation({
    summary: 'Send money to wallet',
    description:
      'User must to login to access this api, user should have enough funds to process the transaction failing will result in expectation failed error',
  })
  async sendMoneyToBank(
    @Request() request: Request & any,
    @Body() transaction: SendMoneyDto,
  ) {
    const { modelId } = request.user;
    return this.userService.sendMoneyToBank(modelId, transaction.money);
  }
}
