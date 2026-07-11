import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blueprint, BlueprintNode, Connection } from '../../entities/blueprint.entity';
import { BlueprintController } from './blueprint.controller';
import { BlueprintService } from './blueprint.service';

@Module({
  imports: [TypeOrmModule.forFeature([Blueprint, BlueprintNode, Connection])],
  controllers: [BlueprintController],
  providers: [BlueprintService],
  exports: [BlueprintService],
})
export class BlueprintModule {}
