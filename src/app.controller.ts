import {Controller, Get, Request} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Request() request: Request): string {
    return this.appService.getHello(request.headers['host']);
  }
}
