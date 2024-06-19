import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDocument, UserEntity } from './user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateRandomAccountNumber, generateRandomIfScCode } from './utility';
import { compare, genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { config } from 'dotenv';
import { CreateUserDto } from './user.dto';

config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserEntity>,
  ) {}
  async create(user: CreateUserDto) {
    if (
      user.email === undefined ||
      user.name === undefined ||
      user.password === undefined
    ) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'Please enter a valid email address, password and username',
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const is_email_exist = await this.userModel
      .findOne({
        email: user.email,
      })
      .select(['_id']);
    if (is_email_exist) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }
    const account_number = generateRandomAccountNumber();
    const ifsc_code = generateRandomIfScCode();
    const password_salt = await genSalt();
    const password = await hash(user.password, password_salt);
    try {
      await this.userModel.create({
        email: user.email,
        password: password,
        name: user.name,
        ifsc_code: ifsc_code,
        account_number: account_number,
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Account created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error occurred while creating the user',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(user: Partial<UserDocument>) {
    if (user.email === undefined || user.password === undefined) {
      throw new HttpException(
        {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'Please enter a valid email address, password',
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const user_account_data = await this.userModel
      .findOne({
        email: user.email,
      })
      .select(['_id', 'password', 'name', 'ifsc_code', 'account_number']);
    if (!user_account_data) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Email does not exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const is_valid_password = await compare(
      user.password,
      user_account_data.password,
    );
    if (!is_valid_password) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email / password are in correct',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const jwt_token = sign(
      {
        email: user.email,
        modelId: user_account_data._id,
      },
      process.env.AUTH_SECRET,
      {
        mutatePayload: false,
        expiresIn: process.env.AUTH_EXPIRES,
        notBefore: 1, // 1 second
      },
    );
    return {
      status: HttpStatus.OK,
      data: {
        token: jwt_token,
        name: user_account_data.name,
        account_number: user_account_data.account_number,
        ifsc_code: user_account_data.ifsc_code,
      },
    };
  }

  async getMyData(modelId: string): Promise<UserEntity> {
    const user_data = await this.userModel.findById(modelId);
    if (!user_data) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No user exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user_data;
  }

  async sendMoneyToWallet(
    modelId: string,
    amount: number,
  ): Promise<{
    status: HttpStatus;
    message: string;
  }> {
    if (amount <= 0) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          message: 'Amount should be greater than 0.0',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const user_data = await this.userModel
      .findById(modelId)
      .select(['money_in_bank_account']);
    if (!user_data) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No user exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (user_data.money_in_bank_account < amount) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          message: 'No Sufficient funds available for processing request',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    user_data.money_in_wallet += amount;
    user_data.money_in_bank_account -= amount;
    await user_data.save();
    return {
      status: HttpStatus.OK,
      message: 'Successfully sent',
    };
  }

  async sendMoneyToBank(
    modelId: string,
    amount: number,
  ): Promise<{
    status: HttpStatus;
    message: string;
  }> {
    if (amount <= 0) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          message: 'Amount should be greater than 0.0',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    const user_data = await this.userModel
      .findById(modelId)
      .select(['money_in_wallet']);
    if (!user_data) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No user exists',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (user_data.money_in_wallet < amount) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          message: 'No Sufficient funds available for processing request',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    user_data.money_in_bank_account += amount;
    user_data.money_in_wallet -= amount;
    await user_data.save();
    return {
      status: HttpStatus.OK,
      message: 'Successfully sent',
    };
  }
}
