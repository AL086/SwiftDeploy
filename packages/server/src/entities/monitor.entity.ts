import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('monitoring_data')
export class MonitoringData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 17 })
  @Index()
  host_id!: string;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  @Index()
  timestamp!: Date;

  @Column({ type: 'float', default: 0 })
  cpu_percent!: number;

  @Column({ type: 'float', default: 0 })
  mem_percent!: number;

  @Column({ type: 'float', default: 0 })
  disk_percent!: number;

  @Column({ default: 0 })
  net_rx_bytes!: number;

  @Column({ default: 0 })
  net_tx_bytes!: number;

  @Column({ type: 'float', default: 0 })
  load_1m!: number;
}

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  name!: string;

  @Column({ length: 64 })
  metric!: string;

  @Column({ length: 8 })
  condition!: string;

  @Column({ type: 'float' })
  threshold!: number;

  @Column({ default: 60 })
  duration_sec!: number;

  @Column({ length: 16, default: 'warning' })
  severity!: string;

  @Column({ default: true })
  enabled!: boolean;
}

@Entity('alert_logs')
export class AlertLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  rule_id!: number;

  @Column({ type: 'varchar', length: 17, nullable: true })
  @Index()
  host_id!: string | null;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  triggered_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  resolved_at!: Date | null;

  @Column({ type: 'float', default: 0 })
  value!: number;

  @Column({ default: false })
  notified!: boolean;
}
