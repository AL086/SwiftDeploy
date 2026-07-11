import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BlueprintService } from './blueprint.service';

@Controller('blueprints')
export class BlueprintController {
  constructor(private readonly bpService: BlueprintService) {}

  @Get()
  async findAll() {
    const data = await this.bpService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const data = await this.bpService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.bpService.create(body);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    const data = await this.bpService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.bpService.remove(id);
    return { success: true, message: 'Blueprint deleted' };
  }
}
