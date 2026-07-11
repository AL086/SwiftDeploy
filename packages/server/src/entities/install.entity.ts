import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  name!: string;

  @Column({ length: 32 })
  distro!: string;

  @Column({ length: 64, default: '' })
  version!: string;

  @Column({ length: 512 })
  path!: string;

  @Column({ length: 128, default: '' })
  checksum!: string;

  @Column({ default: 0 })
  size_mb!: number;

  @Column({ default: 0 })
  is_custom!: number;
}

@Entity('install_tasks')
export class InstallTask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  name!: string;

  @Column({ type: 'int', nullable: true })
  blueprint_id!: number | null;

  @Column({ length: 32, default: 'pending' })
  @Index()
  status!: string;

  @Column({ length: 32, default: 'pxe' })
  type!: string;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  created_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at!: Date | null;

  @OneToMany(() => InstallTarget, (target) => target.task, { cascade: true })
  targets!: InstallTarget[];
}

@Entity('install_targets')
export class InstallTarget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  task_id!: number;

  @Column({ type: 'varchar', length: 17, nullable: true })
  host_id!: string | null;

  @Column({ type: 'int', nullable: true })
  image_id!: number | null;

  @Column({ type: 'int', nullable: true })
  template_id!: number | null;

  @Column({ type: 'text', default: '{}' })
  config!: string;

  @Column({ length: 32, default: 'pending' })
  @Index()
  status!: string;

  @Column({ default: 0 })
  progress!: number;

  @Column({ type: 'text', default: '' })
  log!: string;

  @ManyToOne(() => InstallTask, (task) => task.targets)
  @JoinColumn({ name: 'task_id' })
  task!: InstallTask;
}
