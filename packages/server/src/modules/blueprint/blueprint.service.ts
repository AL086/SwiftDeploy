import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blueprint } from '../../entities/blueprint.entity';

@Injectable()
export class BlueprintService {
  constructor(
    @InjectRepository(Blueprint)
    private bpRepo: Repository<Blueprint>,
  ) {}

  async findAll(): Promise<Blueprint[]> {
    return this.bpRepo.find({ relations: ['nodes', 'connections'] });
  }

  async findOne(id: number): Promise<Blueprint> {
    const bp = await this.bpRepo.findOne({ where: { id }, relations: ['nodes', 'connections'] });
    if (!bp) throw new NotFoundException(`Blueprint ${id} not found`);
    return bp;
  }

  async create(data: Partial<Blueprint>): Promise<Blueprint> {
    const bp = this.bpRepo.create(data);
    return this.bpRepo.save(bp);
  }

  async update(id: number, data: Partial<Blueprint>): Promise<Blueprint> {
    await this.bpRepo.update(id, data as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.bpRepo.delete(id);
  }
}
