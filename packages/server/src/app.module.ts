import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { SystemModule } from './modules/system/system.module';
import { HostModule } from './modules/host/host.module';
import { BlueprintModule } from './modules/blueprint/blueprint.module';
import { InstallModule } from './modules/install/install.module';
import { ServiceModule } from './modules/service/service.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { AuthModule } from './modules/auth/auth.module';
import { WsModule } from './modules/ws/ws.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SystemModule,
    HostModule,
    BlueprintModule,
    InstallModule,
    ServiceModule,
    MonitorModule,
    AuthModule,
    WsModule,
  ],
})
export class AppModule {}
