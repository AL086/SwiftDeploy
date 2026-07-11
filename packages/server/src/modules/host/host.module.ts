import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host, Group } from '../../entities/host.entity';
import { HostController } from './host.controller';
import { HostService } from './host.service';

@Module({
  imports: [TypeOrmModule.forFeature([Host, Group])],
  controllers: [HostController],
  providers: [HostService],
  exports: [HostService],
})
export class HostModule {}
