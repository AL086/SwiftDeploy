import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '../config/env.config';
import { Host, Group } from '../entities/host.entity';
import { User, AuditLog, License } from '../entities/system.entity';
import { Blueprint, BlueprintNode, Connection } from '../entities/blueprint.entity';
import { Image, InstallTask, InstallTarget } from '../entities/install.entity';
import { RoleTemplate, ServiceDeployment } from '../entities/service.entity';
import { MonitoringData, AlertRule, AlertLog } from '../entities/monitor.entity';

const dbPath = config.databaseUrl.replace('sqlite:///', '');
export const AppDataSource = new DataSource({
  type: 'sqljs',
  database: dbPath as any,
  entities: [
    Host, Group, User, AuditLog, License,
    Blueprint, BlueprintNode, Connection,
    Image, InstallTask, InstallTarget,
    RoleTemplate, ServiceDeployment,
    MonitoringData, AlertRule, AlertLog,
  ],
  synchronize: true,
  logging: config.logLevel === 'debug',
} as any);
