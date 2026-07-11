import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RoleTemplate, ServiceDeployment } from '../../entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(RoleTemplate)
    private templateRepo: Repository<RoleTemplate>,
    @InjectRepository(ServiceDeployment)
    private deployRepo: Repository<ServiceDeployment>,
  ) {}

  // ── Templates ───────────────────────────────────────────
  async findAllTemplates(query: any) {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.search) where.name = Like(`%${query.search}%`);

    const page = query.page || 1;
    const pageSize = query.page_size || 20;
    const [items, total] = await this.templateRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { name: 'ASC' },
    });
    return { items, total };
  }

  async findOneTemplate(id: number): Promise<RoleTemplate> {
    const tmpl = await this.templateRepo.findOne({ where: { id } });
    if (!tmpl) throw new NotFoundException(`Role template ${id} not found`);
    return tmpl;
  }

  async createTemplate(data: Partial<RoleTemplate>): Promise<RoleTemplate> {
    const tmpl = this.templateRepo.create(data);
    return this.templateRepo.save(tmpl);
  }

  async updateTemplate(id: number, data: Partial<RoleTemplate>): Promise<RoleTemplate> {
    await this.templateRepo.update(id, data as any);
    return this.findOneTemplate(id);
  }

  async removeTemplate(id: number): Promise<void> {
    await this.templateRepo.delete(id);
  }

  // ── Deployments ─────────────────────────────────────────
  async findAllDeployments(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.host_id) where.host_id = query.host_id;

    const page = query.page || 1;
    const pageSize = query.page_size || 20;
    const [items, total] = await this.deployRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { deployed_at: 'DESC' },
    });
    return { items, total };
  }

  async findOneDeployment(id: number): Promise<ServiceDeployment> {
    const dep = await this.deployRepo.findOne({ where: { id } });
    if (!dep) throw new NotFoundException(`Deployment ${id} not found`);
    return dep;
  }

  async createDeployment(data: Partial<ServiceDeployment>): Promise<ServiceDeployment> {
    const dep = this.deployRepo.create({
      ...data,
      status: 'pending',
    });
    return this.deployRepo.save(dep);
  }

  async updateDeployment(id: number, data: Partial<ServiceDeployment>): Promise<ServiceDeployment> {
    await this.deployRepo.update(id, data as any);
    return this.findOneDeployment(id);
  }

  async removeDeployment(id: number): Promise<void> {
    await this.deployRepo.delete(id);
  }
}
