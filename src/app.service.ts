import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(host: string): string {
    return `Refer ${host}/docs for documentation`;
  }
}
