import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { config } from '../config/env.config';

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: resolveDbPath(config.databaseUrl),
      autoLoadEntities: true,
      synchronize: true,
      autoSave: true,
      logging: config.logLevel === 'debug',
      sqlJsOptions: {
        locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm'),
      },
    } as any),
  ],
})
export class DatabaseModule {}

/** Resolve sqlite:/// URL to an absolute file path */
function resolveDbPath(dbUrl: string): string {
  // sqlite:///path or sqlite://path → /path (or D:\path on Windows)
  let raw = dbUrl.replace(/^sqlite:\/{2,3}/, '');
  // On Windows, strip leading slash from paths like /D:\...
  if (process.platform === 'win32' && raw.startsWith('/')) {
    raw = raw.slice(1);
  }
  if (!path.isAbsolute(raw)) {
    raw = path.resolve(process.cwd(), raw);
  }
  // Ensure directory exists
  const dir = path.dirname(raw);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return raw;
}
