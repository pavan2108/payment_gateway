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
  })
  name: string;
}

export const UserEntitySchema = SchemaFactory.createForClass(UserEntity);
