import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Host } from '../../entities/host.entity';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(Host)
    private hostRepo: Repository<Host>,
  ) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.os) where.os = query.os;
    if (query.search) {
      where.hostname = Like(`%${query.search}%`);
    }
    const page = query.page || 1;
    const pageSize = query.page_size || 20;
    const [items, total] = await this.hostRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total };
  }

  async findOne(mac: string): Promise<Host> {
    const host = await this.hostRepo.findOne({ where: { mac } });
    if (!host) throw new NotFoundException(`Host ${mac} not found`);
    return host;
  }

  async create(data: Partial<Host>): Promise<Host> {
    const host = this.hostRepo.create(data);
    return this.hostRepo.save(host);
  }

  async update(mac: string, data: Partial<Host>): Promise<Host> {
    await this.hostRepo.update(mac, data as any);
    return this.findOne(mac);
  }

  async remove(mac: string): Promise<void> {
    await this.hostRepo.delete(mac);
  }
}
