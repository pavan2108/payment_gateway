import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URI),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
