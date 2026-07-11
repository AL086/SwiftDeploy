import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringData, AlertRule, AlertLog } from '../../entities/monitor.entity';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';

@Module({
  imports: [TypeOrmModule.forFeature([MonitoringData, AlertRule, AlertLog])],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule {}
