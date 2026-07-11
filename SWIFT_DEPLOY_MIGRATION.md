# SwiftDeploy Next — 架构迁移进度日志

## 迁移状态总览

| 阶段 | 描述 | 状态 |
|------|------|------|
| Phase 1 | 项目骨架 (Monorepo + Shared + Server + Desktop + Web) | ✅ 完成 |
| Phase 2 | 拓扑画布核心 (React Flow 集成) | 🔄 进行中 |
| Phase 3 | 交互与操作 (选择/快捷键/撤销重做/批量) | ⬜ 待开始 |
| Phase 4 | 标注与绘图工具 | ⬜ 待开始 |
| Phase 5 | 模板系统与首页流程 | ⬜ 待开始 |
| Phase 6 | 路由管理与设备管理 | ⬜ 待开始 |
| Phase 7 | 后端完整 API | ⬜ 待开始 |
| Phase 8 | 基础设施与打包 | ⬜ 待开始 |

## Phase 1: 项目骨架 (完成)

### 创建的文件

#### 根配置
- [x] `package.json` — pnpm workspaces monorepo
- [x] `tsconfig.base.json` — 基础 TypeScript 配置
- [x] `.env.example` — 环境变量模板
- [x] `pnpm-workspace.yaml` — workspace 配置
- [x] `docker-compose.yml` — 生产环境 (NestJS + PostgreSQL + pgAdmin)
- [x] `docker-compose.dev.yml` — 开发环境 (SQLite)
- [x] `docker-compose.infra.yml` — 基础设施 (dnsmasq, nginx, ansible)

#### Shared 包 (@swiftdeploy/shared)
- [x] `package.json`, `tsconfig.json`
- [x] 10 个枚举: HostStatus, NodeType, TaskStatus, ServiceStatus, AlertSeverity, AlertCondition, CloudType, UserRole, InstallType, DistroType
- [x] 1 个接口文件: ApiResponse, PaginatedResponse, HealthResponse, Host, Blueprint, Install, Monitor, Service, System 所有 DTO
- [x] `index.ts` 桶导出

#### Server 包 (@swiftdeploy/server) — NestJS
- [x] `package.json`, `tsconfig.json`, `Dockerfile`
- [x] `main.ts`, `app.module.ts`
- [x] `config/env.config.ts`, `config/config.module.ts`
- [x] `database/datasource.ts`, `database/database.module.ts`
- [x] `common/http-exception.filter.ts`
- [x] 6 个实体文件 (14 个实体): Host, Group, User, AuditLog, License, Blueprint, BlueprintNode, Connection, Image, InstallTask, InstallTarget, RoleTemplate, ServiceDeployment, MonitoringData, AlertRule, AlertLog
- [x] SystemModule: GET /system/health, /system/config
- [x] HostModule: CRUD /hosts (controller + service)
- [x] BlueprintModule: CRUD /blueprints (controller + service)
- [x] AuthModule: POST /auth/login (JWT + bcrypt)
- [x] WsModule: WebSocket gateway (Socket.IO)
- [x] InstallModule, ServiceModule, MonitorModule (骨架)

#### Desktop 包 (@swiftdeploy/desktop) — Electron
- [x] `package.json`, `tsconfig.json`
- [x] `src/main.ts` — BrowserWindow 创建, frame: false
- [x] `src/preload.ts` — contextBridge (health, host, blueprint, auth, window controls)
- [x] `src/ipc/handlers.ts` — IPC → HTTP API 桥接 (health, host CRUD, blueprint CRUD, auth login, window controls)
- [x] `src/grpc/client.ts` — gRPC 客户端骨架
- [x] `src/config.ts` — 配置

#### Web 包 (@swiftdeploy/web) — React + Ant Design
- [x] `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- [x] `src/main.tsx` — Ant Design ConfigProvider (暗色主题)
- [x] `src/App.tsx` — 根组件
- [x] `src/vite-env.d.ts` — ElectronAPI 类型声明
- [x] Layout: `MainLayout.tsx`, `TitleBar.tsx`, `Sidebar.tsx`, `StatusBar.tsx`
- [x] Pages: `WelcomePage.tsx` (5 按钮), `LoginDialog.tsx`, `SplashWindow.tsx`, `PlaceholderPage.tsx`
- [x] Topology: `TopologyPage.tsx` (React Flow 骨架 + 工具栏), `TemplateGrid.tsx` (3 标签模板网格)
- [x] Nodes: `DeviceNode.tsx` (8 种设备类型), `RouterNode.tsx` (端口指示器)
- [x] Edges: `ConnectionEdge.tsx` (贝塞尔曲线)
- [x] Stores: `useAppStore.ts`, `useAuthStore.ts`, `useTopologyStore.ts` (撤销/重做)
- [x] Services: `ipc.service.ts` (IPC 调用封装)

## Phase 2: 拓扑画布核心 (进行中)

### React Flow 集成
- [x] 自定义 DeviceNode (8 种设备类型, 颜色, 缩写)
- [x] 自定义 RouterNode (端口指示器小方块)
- [x] 自定义 ConnectionEdge (贝塞尔曲线)
- [x] 撤销/重做 Zustand store
- [ ] 3 面板布局 (DevicePalette + Canvas + NodePropertiesPanel)
- [ ] 设备拖放: DevicePalette → Canvas
- [ ] 自动布局 (grid-based, 按设备类型分行)
- [ ] SVG 背景网格
- [ ] 设备悬浮提示

## Phase 3-8: 待实现

### 设备类型配置
- NODE_COLORS: switch=#20c997, router=#748ffc, firewall=#ff6b6b, server=#51cf66, storage=#845ef7, load_balancer=#ff922b, ac=#22b8cf, ap=#fcc419
- NODE_LABELS: SW, RT, FW, SRV, ST, LB, AC, AP

### API 端口对照
| 服务 | 端口 | 协议 |
|------|------|------|
| NestJS HTTP | 3000 | REST |
| gRPC | 50051 | gRPC |
| PostgreSQL | 5432 | TCP |
| pgAdmin | 5050 | HTTP |
| dnsmasq | 53/67 | UDP |
| Nginx PXE | 80 | HTTP |
| Vite Dev | 5173 | HTTP |

## 旧→新文件映射 (已迁移)

| 旧文件 (Python) | 新文件 (TypeScript) | 状态 |
|----------------|-------------------|------|
| `shared/constants.py` (10 枚举) | `shared/src/constants/*.enum.ts` | ✅ |
| `shared/schemas/common.py` | `shared/src/interfaces/api-response.interface.ts` | ✅ |
| `shared/schemas/host.py` | 同上 | ✅ |
| `shared/schemas/blueprint.py` | 同上 | ✅ |
| `shared/schemas/install.py` | 同上 | ✅ |
| `shared/schemas/monitor.py` | 同上 | ✅ |
| `shared/schemas/service.py` | 同上 | ✅ |
| `shared/schemas/system.py` | 同上 | ✅ |
| `server/models/host.py` | `server/src/entities/host.entity.ts` | ✅ |
| `server/models/system.py` | `server/src/entities/system.entity.ts` | ✅ |
| `server/models/blueprint.py` | `server/src/entities/blueprint.entity.ts` | ✅ |
| `server/models/install.py` | `server/src/entities/install.entity.ts` | ✅ |
| `server/models/service.py` | `server/src/entities/service.entity.ts` | ✅ |
| `server/models/monitor.py` | `server/src/entities/monitor.entity.ts` | ✅ |
| `server/routers/system.py` | `server/src/modules/system/system.controller.ts` | ✅ |
| `server/routers/host.py` | `server/src/modules/host/host.controller.ts` | ✅ |
| `server/routers/ws.py` | `server/src/modules/ws/ws.gateway.ts` | ✅ |
| `server/database.py` | `server/src/database/datasource.ts` | ✅ |
| `server/config.py` | `server/src/config/env.config.ts` | ✅ |
| `server/main.py` | `server/src/main.ts` | ✅ |
| `client/main.py` | `desktop/src/main.ts` | ✅ |
| `client/ui/main_window.py` | `web/src/layout/MainLayout.tsx` | ✅ |
| `client/ui/title_bar` | `web/src/layout/TitleBar.tsx` | ✅ |
| `client/ui/sidebar` | `web/src/layout/Sidebar.tsx` | ✅ |
| `client/ui/status_bar.py` | `web/src/layout/StatusBar.tsx` | ✅ |
| `client/ui/welcome_page.py` | `web/src/pages/Welcome/WelcomePage.tsx` | ✅ |
| `client/ui/login_dialog.py` | `web/src/pages/Login/LoginDialog.tsx` | ✅ |
| `client/ui/splash_window.py` | `web/src/pages/Splash/SplashWindow.tsx` | ✅ |
| `client/ui/pages/topology_page.py` | `web/src/pages/Topology/TopologyPage.tsx` | ✅ |
| `client/ui/pages/node_properties` | — | ⬜ |
| `client/ui/pages/device_palette.py` | — | ⬜ |
| `client/ui/pages/batch_dialogs.py` | — | ⬜ |
| `client/ui/pages/canvas_items.py` | — | ⬜ |
| `client/api/client.py` | `desktop/src/ipc/handlers.ts` | ✅ |
