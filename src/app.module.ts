import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';

import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import * as process from 'node:process';
import { JwtStrategy } from './strategies/jwt.strategy';

config();

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URI),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: process.env.AUTH_EXPIRES,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
