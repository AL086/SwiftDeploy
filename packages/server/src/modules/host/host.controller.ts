import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { HostService } from './host.service';

@Controller('hosts')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.hostService.findAll(query);
    return { success: true, data: result };
  }

  @Get(':mac')
  async findOne(@Param('mac') mac: string) {
    const data = await this.hostService.findOne(mac);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.hostService.create(body);
    return { success: true, data };
  }

  @Put(':mac')
  async update(@Param('mac') mac: string, @Body() body: any) {
    const data = await this.hostService.update(mac, body);
    return { success: true, data };
  }

  @Delete(':mac')
  async remove(@Param('mac') mac: string) {
    await this.hostService.remove(mac);
    return { success: true, message: 'Host deleted' };
  }
}
