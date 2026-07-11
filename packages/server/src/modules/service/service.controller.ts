import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // ── Role Templates ──────────────────────────────────────
  @Get('templates')
  async getTemplates(@Query() query: any) {
    const data = await this.serviceService.findAllTemplates(query);
    return { success: true, data };
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: number) {
    const data = await this.serviceService.findOneTemplate(id);
    return { success: true, data };
  }

  @Post('templates')
  async createTemplate(@Body() body: any) {
    const data = await this.serviceService.createTemplate(body);
    return { success: true, data };
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: number, @Body() body: any) {
    const data = await this.serviceService.updateTemplate(id, body);
    return { success: true, data };
  }

  @Delete('templates/:id')
  async removeTemplate(@Param('id') id: number) {
    await this.serviceService.removeTemplate(id);
    return { success: true };
  }

  // ── Service Deployments ─────────────────────────────────
  @Get('deployments')
  async getDeployments(@Query() query: any) {
    const data = await this.serviceService.findAllDeployments(query);
    return { success: true, data };
  }

  @Get('deployments/:id')
  async getDeployment(@Param('id') id: number) {
    const data = await this.serviceService.findOneDeployment(id);
    return { success: true, data };
  }

  @Post('deployments')
  async createDeployment(@Body() body: any) {
    const data = await this.serviceService.createDeployment(body);
    return { success: true, data };
  }

  @Put('deployments/:id')
  async updateDeployment(@Param('id') id: number, @Body() body: any) {
    const data = await this.serviceService.updateDeployment(id, body);
    return { success: true, data };
  }

  @Delete('deployments/:id')
  async removeDeployment(@Param('id') id: number) {
    await this.serviceService.removeDeployment(id);
    return { success: true };
  }
}
