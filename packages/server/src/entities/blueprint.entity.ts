import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('blueprints')
export class Blueprint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'simple-json', default: '{}' })
  layout_data!: Record<string, unknown>;

  @Column({ default: 1 })
  version!: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  git_url!: string | null;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  created_at!: Date;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  updated_at!: Date;

  @OneToMany(() => BlueprintNode, (node) => node.blueprint, { cascade: true })
  nodes!: BlueprintNode[];

  @OneToMany(() => Connection, (conn) => conn.blueprint, { cascade: true })
  connections!: Connection[];
}

@Entity('blueprint_nodes')
export class BlueprintNode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  blueprint_id!: number;

  @Column({ length: 32 })
  type!: string;

  @Column({ length: 64 })
  label!: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  @Index()
  mac!: string | null;

  @Column({ type: 'varchar', length: 39, nullable: true })
  ip!: string | null;

  @Column({ type: 'int', nullable: true })
  role_template_id!: number | null;

  @Column({ type: 'simple-json', default: '{}' })
  config!: Record<string, unknown>;

  @Column({ type: 'float', default: 0 })
  pos_x!: number;

  @Column({ type: 'float', default: 0 })
  pos_y!: number;

  @ManyToOne(() => Blueprint, (bp) => bp.nodes)
  @JoinColumn({ name: 'blueprint_id' })
  blueprint!: Blueprint;
}

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  blueprint_id!: number;

  @Column()
  from_node_id!: number;

  @Column()
  to_node_id!: number;

  @Column({ length: 32, default: '' })
  from_port!: string;

  @Column({ length: 32, default: '' })
  to_port!: string;

  @ManyToOne(() => Blueprint, (bp) => bp.connections)
  @JoinColumn({ name: 'blueprint_id' })
  blueprint!: Blueprint;
}
