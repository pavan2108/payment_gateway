import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'sample@gmail.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'P@ssword',
  })
  password: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'sample',
  })
  name: string;
}

export class LoginUserDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'sample@gmail.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'P@ssword',
  })
  password: string;
}

export class SendMoneyDto {
  @ApiProperty({
    type: Number,
    required: true,
    default: 0.1,
  })
  money: number;
}
