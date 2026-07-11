import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { MonitoringData, AlertRule, AlertLog } from '../../entities/monitor.entity';

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(MonitoringData)
    private dataRepo: Repository<MonitoringData>,
    @InjectRepository(AlertRule)
    private ruleRepo: Repository<AlertRule>,
    @InjectRepository(AlertLog)
    private logRepo: Repository<AlertLog>,
  ) {}

  // ── Monitoring Data ─────────────────────────────────────
  async pushData(data: Partial<MonitoringData>): Promise<MonitoringData> {
    const record = this.dataRepo.create({
      ...data,
      timestamp: new Date(),
    });
    return this.dataRepo.save(record);
  }

  async getData(hostId: string, query: any) {
    const limit = Math.min(parseInt(query.limit) || 60, 1000);
    const where: any = { host_id: hostId };

    if (query.since) {
      where.timestamp = MoreThan(new Date(query.since));
    }

    const items = await this.dataRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: limit,
    });
    return items.reverse();
  }

  // ── Alert Rules ─────────────────────────────────────────
  async findAllRules(query: any) {
    const where: any = {};
    if (query.enabled !== undefined) where.enabled = query.enabled === 'true';
    if (query.severity) where.severity = query.severity;
    if (query.metric) where.metric = query.metric;

    const page = query.page || 1;
    const pageSize = query.page_size || 50;
    const [items, total] = await this.ruleRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { name: 'ASC' },
    });
    return { items, total };
  }

  async findOneRule(id: number): Promise<AlertRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Alert rule ${id} not found`);
    return rule;
  }

  async createRule(data: Partial<AlertRule>): Promise<AlertRule> {
    const rule = this.ruleRepo.create(data);
    return this.ruleRepo.save(rule);
  }

  async updateRule(id: number, data: Partial<AlertRule>): Promise<AlertRule> {
    await this.ruleRepo.update(id, data);
    return this.findOneRule(id);
  }

  async removeRule(id: number): Promise<void> {
    await this.ruleRepo.delete(id);
  }

  // ── Alert Logs ──────────────────────────────────────────
  async findAllLogs(query: any) {
    const where: any = {};
    if (query.rule_id) where.rule_id = parseInt(query.rule_id);
    if (query.host_id) where.host_id = query.host_id;
    if (query.resolved !== undefined) {
      where.resolved_at = query.resolved === 'true' ? MoreThan(new Date(0)) : null;
    }

    const page = query.page || 1;
    const pageSize = query.page_size || 50;
    const [items, total] = await this.logRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { triggered_at: 'DESC' },
    });
    return { items, total };
  }

  async updateLog(id: number, data: Partial<AlertLog>): Promise<AlertLog> {
    const log = await this.logRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Alert log ${id} not found`);
    await this.logRepo.update(id, data);
    return this.logRepo.findOne({ where: { id } }) as Promise<AlertLog>;
  }
}
