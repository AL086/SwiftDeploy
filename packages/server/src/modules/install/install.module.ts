import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallTask, InstallTarget, Image } from '../../entities/install.entity';
import { InstallController } from './install.controller';
import { InstallService } from './install.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstallTask, InstallTarget, Image])],
  controllers: [InstallController],
  providers: [InstallService],
})
export class InstallModule {}
