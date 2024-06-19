import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({
  timestamps: true,
})
export class UserEntity {
  @Prop({
    type: String,
    required: [true, 'Please provide email id'],
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: [true, 'Please provide password'],
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    immutable: true,
  })
  account_number: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  ifsc_code: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
  })
  name: string;

  @Prop({
    type: Number,
    default: 10000,
  })
  money_in_bank_account: number;

  @Prop({
    type: Number,
    default: 0,
  })
  money_in_wallet: number;
}

export const UserEntitySchema = SchemaFactory.createForClass(UserEntity);
