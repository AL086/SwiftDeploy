import {
  Entity, Column, PrimaryColumn, ManyToMany, JoinTable,
  OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index,
} from 'typeorm';

@Entity('hosts')
export class Host {
  @PrimaryColumn({ length: 17 })
  mac!: string;

  @Column({ length: 39 })
  @Index()
  ip!: string;

  @Column({ length: 128, default: '' })
  hostname!: string;

  @Column({ length: 64, default: '' })
  os!: string;

  @Column({ length: 64, default: '' })
  os_version!: string;

  @Column({ type: 'simple-json', default: '{}' })
  hardware!: Record<string, unknown>;

  @Column({ length: 32, default: 'pending' })
  @Index()
  status!: string;

  @Column({ default: 0 })
  cpu_cores!: number;

  @Column({ default: 0 })
  memory_gb!: number;

  @Column({ default: 0 })
  disk_gb!: number;

  @Column({ type: 'varchar', length: 39, nullable: true })
  ipmi_ip!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipmi_user!: string | null;

  @Column({ type: 'text', nullable: true })
  ipmi_password_enc!: string | null;

  @Column({ type: 'datetime', nullable: true })
  last_seen!: Date | null;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  created_at!: Date;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  updated_at!: Date;

  @ManyToMany(() => Group, (group) => group.hosts)
  @JoinTable({
    name: 'host_group',
    joinColumn: { name: 'host_mac', referencedColumnName: 'mac' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  groups!: Group[];
}

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  name!: string;

  @Column({ nullable: true })
  parent_id!: number | null;

  @Column({ length: 256, default: '' })
  description!: string;

  @ManyToMany(() => Host, (host) => host.groups)
  hosts!: Host[];

  @OneToMany(() => Group, (group) => group.parent)
  children!: Group[];

  @ManyToOne(() => Group, (group) => group.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Group | null;
}
