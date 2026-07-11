import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { InstallService } from './install.service';

@Controller('install')
export class InstallController {
  constructor(private readonly installService: InstallService) {}

  // ── Images ──────────────────────────────────────────────
  @Get('images')
  async getImages() {
    const data = await this.installService.findAllImages();
    return { success: true, data };
  }

  @Post('images')
  async createImage(@Body() body: any) {
    const data = await this.installService.createImage(body);
    return { success: true, data };
  }

  @Delete('images/:id')
  async removeImage(@Param('id') id: number) {
    await this.installService.removeImage(id);
    return { success: true };
  }

  // ── Install Tasks ───────────────────────────────────────
  @Get('tasks')
  async getTasks(@Query() query: any) {
    const data = await this.installService.findAllTasks(query);
    return { success: true, data };
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: number) {
    const data = await this.installService.findOneTask(id);
    return { success: true, data };
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    const data = await this.installService.createTask(body);
    return { success: true, data };
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: number, @Body() body: any) {
    const data = await this.installService.updateTask(id, body);
    return { success: true, data };
  }

  @Delete('tasks/:id')
  async removeTask(@Param('id') id: number) {
    await this.installService.removeTask(id);
    return { success: true };
  }

  // ── Install Targets ─────────────────────────────────────
  @Get('targets/:taskId')
  async getTargets(@Param('taskId') taskId: number) {
    const data = await this.installService.findTargetsByTask(taskId);
    return { success: true, data };
  }

  @Put('targets/:id')
  async updateTarget(@Param('id') id: number, @Body() body: any) {
    const data = await this.installService.updateTarget(id, body);
    return { success: true, data };
  }
}
