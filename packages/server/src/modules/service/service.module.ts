import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleTemplate, ServiceDeployment } from '../../entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleTemplate, ServiceDeployment])],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
