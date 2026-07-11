import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 64, unique: true })
  @Index()
  username!: string;

  @Column({ length: 256 })
  password_hash!: string;

  @Column({ length: 128, default: '' })
  email!: string;

  @Column({ length: 32, default: 'operator' })
  role!: string;

  @Column({ length: 16, default: 'dark' })
  theme_pref!: string;

  @Column({ length: 8, default: 'zh' })
  lang_pref!: string;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  created_at!: Date;
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  user_id!: number | null;

  @Column({ length: 128 })
  @Index()
  action!: string;

  @Column({ type: 'simple-json', default: '{}' })
  details!: Record<string, unknown>;

  @Column({ length: 39, default: '' })
  ip_address!: string;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  @Index()
  created_at!: Date;
}

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128, unique: true })
  license_key!: string;

  @Column({ type: 'datetime', nullable: true })
  activated_at!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'simple-json', default: '[]' })
  features!: unknown[];

  @Column({ type: 'varchar', length: 17, nullable: true })
  host_id!: string | null;
}
