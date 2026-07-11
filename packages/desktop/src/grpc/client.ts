import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { desktopConfig } from '../config';

const PROTO_PATH = path.join(__dirname, '../../proto/swiftdeploy.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

let client: any = null;

export function getGrpcClient() {
  if (!client) {
    client = new proto.swiftdeploy.SwiftDeploy(
      `${desktopConfig.grpcHost}:${desktopConfig.grpcPort}`,
      grpc.credentials.createInsecure(),
    );
  }
  return client;
}

export function healthCheck(): Promise<any> {
  return new Promise((resolve, reject) => {
    const c = getGrpcClient();
    c.Health({}, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}
