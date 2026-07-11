import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('health')
  async health() {
    return {
      status: 'ok',
      version: '0.1.0',
      database: 'connected',
    };
  }

  @Get('config')
  async getConfig() {
    return {
      server_host: process.env.SERVER_HOST || '127.0.0.1',
      server_port: parseInt(process.env.SERVER_PORT || '3000', 10),
      log_level: process.env.LOG_LEVEL || 'INFO',
      theme: 'dark',
      language: 'zh',
    };
  }
}
