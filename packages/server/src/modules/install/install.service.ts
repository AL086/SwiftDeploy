import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InstallTask, InstallTarget, Image } from '../../entities/install.entity';

@Injectable()
export class InstallService {
  constructor(
    @InjectRepository(InstallTask)
    private taskRepo: Repository<InstallTask>,
    @InjectRepository(InstallTarget)
    private targetRepo: Repository<InstallTarget>,
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,
  ) {}

  // ── Images ──────────────────────────────────────────────
  async findAllImages(): Promise<Image[]> {
    return this.imageRepo.find({ order: { name: 'ASC' } });
  }

  async createImage(data: Partial<Image>): Promise<Image> {
    const img = this.imageRepo.create(data);
    return this.imageRepo.save(img);
  }

  async removeImage(id: number): Promise<void> {
    await this.imageRepo.delete(id);
  }

  // ── Tasks ───────────────────────────────────────────────
  async findAllTasks(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) where.name = Like(`%${query.search}%`);

    const page = query.page || 1;
    const pageSize = query.page_size || 20;
    const [items, total] = await this.taskRepo.findAndCount({
      where,
      relations: ['targets'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { created_at: 'DESC' },
    });
    return { items, total };
  }

  async findOneTask(id: number): Promise<InstallTask> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['targets'],
    });
    if (!task) throw new NotFoundException(`Install task ${id} not found`);
    return task;
  }

  async createTask(data: Partial<InstallTask>): Promise<InstallTask> {
    const task = this.taskRepo.create({
      ...data,
      status: 'pending',
      created_at: new Date(),
    });
    return this.taskRepo.save(task);
  }

  async updateTask(id: number, data: Partial<InstallTask>): Promise<InstallTask> {
    await this.taskRepo.update(id, data);
    return this.findOneTask(id);
  }

  async removeTask(id: number): Promise<void> {
    await this.taskRepo.delete(id);
  }

  // ── Targets ─────────────────────────────────────────────
  async findTargetsByTask(taskId: number): Promise<InstallTarget[]> {
    return this.targetRepo.find({ where: { task_id: taskId } });
  }

  async updateTarget(id: number, data: Partial<InstallTarget>): Promise<InstallTarget> {
    const target = await this.targetRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException(`Install target ${id} not found`);
    await this.targetRepo.update(id, data);
    return this.targetRepo.findOne({ where: { id } }) as Promise<InstallTarget>;
  }
}
