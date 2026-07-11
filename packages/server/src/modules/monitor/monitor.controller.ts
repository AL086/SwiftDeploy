import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MonitorService } from './monitor.service';

@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  // ── Monitoring Data ─────────────────────────────────────
  @Post('data')
  async pushData(@Body() body: any) {
    const data = await this.monitorService.pushData(body);
    return { success: true, data };
  }

  @Get('data/:hostId')
  async getData(@Param('hostId') hostId: string, @Query() query: any) {
    const data = await this.monitorService.getData(hostId, query);
    return { success: true, data };
  }

  // ── Alert Rules ─────────────────────────────────────────
  @Get('alerts/rules')
  async getRules(@Query() query: any) {
    const data = await this.monitorService.findAllRules(query);
    return { success: true, data };
  }

  @Get('alerts/rules/:id')
  async getRule(@Param('id') id: number) {
    const data = await this.monitorService.findOneRule(id);
    return { success: true, data };
  }

  @Post('alerts/rules')
  async createRule(@Body() body: any) {
    const data = await this.monitorService.createRule(body);
    return { success: true, data };
  }

  @Put('alerts/rules/:id')
  async updateRule(@Param('id') id: number, @Body() body: any) {
    const data = await this.monitorService.updateRule(id, body);
    return { success: true, data };
  }

  @Delete('alerts/rules/:id')
  async removeRule(@Param('id') id: number) {
    await this.monitorService.removeRule(id);
    return { success: true };
  }

  // ── Alert Logs ──────────────────────────────────────────
  @Get('alerts/logs')
  async getLogs(@Query() query: any) {
    const data = await this.monitorService.findAllLogs(query);
    return { success: true, data };
  }

  @Put('alerts/logs/:id')
  async updateLog(@Param('id') id: number, @Body() body: any) {
    const data = await this.monitorService.updateLog(id, body);
    return { success: true, data };
  }
}
