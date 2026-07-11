import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('role_templates')
export class RoleTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  name!: string;

  @Column({ length: 64, default: '' })
  category!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'simple-json', default: '{}' })
  schema!: Record<string, unknown>;

  @Column({ length: 256, default: '' })
  playbook_path!: string;

  @Column({ type: 'simple-json', default: '{}' })
  monitoring!: Record<string, unknown>;

  @Column({ default: false })
  built_in!: boolean;
}

@Entity('service_deployments')
export class ServiceDeployment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 17 })
  @Index()
  host_id!: string;

  @Column()
  role_id!: number;

  @Column({ type: 'simple-json', default: '{}' })
  config!: Record<string, unknown>;

  @Column({ length: 32, default: 'pending' })
  @Index()
  status!: string;

  @Column({ type: 'datetime', nullable: true })
  deployed_at!: Date | null;
}
