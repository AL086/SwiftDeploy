import * as path from 'path';

export const config = {
  serverHost: process.env.SERVER_HOST || '0.0.0.0',
  serverPort: parseInt(process.env.SERVER_PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || `sqlite:///${path.join(process.cwd(), 'data', 'swiftdeploy.db')}`,
  jwtSecret: process.env.JWT_SECRET || 'swiftdeploy-dev-secret',
  logLevel: process.env.LOG_LEVEL || 'debug',
  grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),
};
