export const desktopConfig = {
  serverUrl: process.env.SERVER_URL || 'http://localhost:3000',
  grpcHost: process.env.GRPC_HOST || 'localhost',
  grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),
  windowWidth: 1280,
  windowHeight: 820,
  minWidth: 960,
  minHeight: 640,
};
