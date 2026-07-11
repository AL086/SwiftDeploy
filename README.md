# 🚀 SwiftDeploy 轻舟

> **轻舟已过万重山 — 批量操作系统部署与运维管理平台**

SwiftDeploy（轻舟）是一款面向数据中心与私有云的**批量 OS 部署 + 运维管理平台**。它通过 PXE 网络启动实现裸机批量安装操作系统，随后对已部署的主机进行全生命周期管理——服务编排、监控告警、拓扑可视化，一站式完成。

---

## 📋 项目概览

| 项目 | 说明 |
|---|---|
| **状态** | 🛠️ 开发中（Pre-alpha），核心骨架已完成 |
| **架构** | Monorepo (pnpm workspace) |
| **后端** | NestJS + TypeORM + PostgreSQL/SQLite + gRPC + Socket.IO |
| **前端** | React 18 + Ant Design 5 + ReactFlow + Zustand + Vite |
| **桌面端** | Electron + gRPC 客户端 |
| **基础架构** | PXE + DHCP (dnsmasq) + TFTP + Ansible 自动化部署 |
| **包管理器** | pnpm 9.x |

---

## 🧱 软件架构

```
swiftdeploy-next/
├── packages/
│   ├── server/          # NestJS 后端 API 服务
│   ├── web/             # React 前端管理界面
│   ├── desktop/         # Electron 桌面客户端
│   └── shared/          # 共享的类型定义与枚举
├── infra/               # 基础设施部署配置
│   └── ansible/         # Ansible 剧本 (dnsmasq + Nginx PXE)
├── docs/                # 文档
└── docker-compose*.yml  # 多环境 Docker 编排
```

### 数据流架构

```
┌──────────┐     HTTP/REST      ┌────────────┐     SQL      ┌────────────┐
│  Web UI  │ ──────────────────→│            │─────────────→│            │
│ (React)  │                    │  NestJS    │              │ PostgreSQL │
│          │←────────────────── │   Server   │←─────────────│  / SQLite  │
├──────────┤     WebSocket      │            │              └────────────┘
│ Desktop  │──────────────────→│            │
│(Electron)│←────────────────── │            │
└──────────┘     gRPC           └─────┬──────┘
                                      │
                               ┌──────┴──────┐
                               │   PXE/DHCP   │
                               │  (dnsmasq)   │
                               └─────────────┘
```

---

## ✅ 已完成功能

### 后端 (NestJS)

| 模块 | 功能 | 状态 |
|---|---|---|
| **Auth** | JWT 认证 + bcrypt 密码加密 | ✅ 完成 |
| **Host** | 主机 CRUD、分组管理 | ✅ 完成 |
| **Blueprint** | 部署蓝图 CRUD | ✅ 完成 |
| **Install** | 安装任务管理、镜像管理、目标管理 | ✅ 完成（骨架完善） |
| **Service** | 服务部署 CRUD | ✅ 完成（骨架） |
| **Monitor** | 监控数据查询、告警规则管理 | ✅ 完成（骨架） |
| **System** | 健康检查、系统配置 | ✅ 完成 |
| **WebSocket** | Socket.IO 实时通信网关 | ✅ 完成 |
| **Database** | PostgreSQL/SQLite 双数据源支持 | ✅ 完成 |
| **Validation** | 全局 ValidationPipe + 异常过滤器 | ✅ 完成 |

### 前端 (React)

| 功能 | 状态 |
|---|---|
| **拓扑编辑器** — ReactFlow 驱动的拖拽式网络拓扑图 | ✅ 核心完成 |
| **自定义节点** — 设备(8种)、路由器、标注、图形节点 | ✅ 完成 |
| **设备面板** — 设备选择拖拽到画布 | ✅ 完成 |
| **属性面板** — 节点选中后编辑属性 | ✅ 完成 |
| **拓扑工具栏** — 缩放、布局、对齐等 | ✅ 完成 |
| **自动布局** — 按设备类型分层自动排列 | ✅ 完成 |
| **批量操作** — 批量创建/重命名/IP 配置/DHCP 配置 | ✅ 完成 |
| **模板网格** — 从模板快速创建拓扑 | ✅ 完成 |
| **自定义连线** — 连接线样式定制 | ✅ 完成 |
| **暗色主题** — Ant Design ConfigProvider 暗色主题 | ✅ 完成 |
| **响应式布局** — 标题栏/侧边栏/状态栏主框架 | ✅ 完成 |
| **登录页面** | ✅ 完成 |
| **欢迎页面** | ✅ 完成 |

### 桌面端 (Electron)

| 功能 | 状态 |
|---|---|
| Electron BrowserWindow 无边框窗口 | ✅ 完成 |
| IPC ↔ HTTP API 桥接（health/host/blueprint/auth） | ✅ 完成 |
| gRPC 客户端骨架 | ✅ 完成 |

### 基础设施

| 功能 | 状态 |
|---|---|
| Docker Compose 生产部署 (Server + PostgreSQL + pgAdmin) | ✅ 完成 |
| Docker Compose 开发环境 (SQLite) | ✅ 完成 |
| Docker Compose 基础设施 (dnsmasq) | ✅ 完成 |
| Ansible 自动化部署剧本 | ✅ 完成 |
| GitHub Actions CI | ✅ 完成 |
| Electron Builder NSIS 打包配置 | ✅ 完成 |

---

## 🚧 开发中 & 待实现

### 当前开发中
- **拓扑画布** — 交互优化（选择、快捷键、撤销/重做）
- **标注与绘图工具** — 自由绘制、标注线框

### 未来规划

| 阶段 | 功能 | 状态 |
|---|---|---|
| Phase 1 | 项目骨架（Monorepo + 各包基础设施） | ✅ 完成 |
| Phase 2 | 拓扑画布核心（ReactFlow 集成） | 🔄 开发中 |
| Phase 3 | 交互与操作（选择/快捷键/撤销重做/批量） | ⬜ 待开始 |
| Phase 4 | 标注与绘图工具 | ⬜ 待开始 |
| Phase 5 | 模板系统与首页流程 | ⬜ 待开始 |
| Phase 6 | 路由管理与设备管理 | ⬜ 待开始 |
| Phase 7 | 后端完整 API（安装流程对接、PXE 状态跟踪） | ⬜ 待开始 |
| Phase 8 | 基础设施与打包（PXE 服务端、生产环境部署） | ⬜ 待开始 |

### 计划中的核心能力
- 🔲 **PXE 批量部署** — 从拓扑设计到一键推送安装
- 🔲 **安装进度实时追踪** — WebSocket 推送到拓扑画布
- 🔲 **服务编排** — 部署后的服务发现与配置管理
- 🔲 **监控告警** — 主机指标采集 + 告警规则引擎
- 🔲 **多租户** — 用户角色权限管理
- 🔲 **模板市场** — 共享部署蓝图
- 🔲 **离线部署** — 完全离线环境下的 PXE 部署

---

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 并行启动所有包
pnpm dev

# 或单独启动
pnpm --filter @swiftdeploy/server dev
pnpm --filter @swiftdeploy/web dev
```

### 生产部署

```bash
# 使用 Docker Compose（PostgreSQL）
docker compose up -d

# 使用 SQLite 开发模式
docker compose -f docker-compose.dev.yml up -d

# 启动基础设施（dnsmasq）
docker compose -f docker-compose.infra.yml up -d
```

### 环境变量

复制 `.env.example` 为 `.env` 并按需修改：

```bash
cp .env.example .env
```

---

## 🗂️ 项目结构速览

```
packages/
├── server/src/
│   ├── main.ts                    # 应用入口
│   ├── app.module.ts              # 根模块（引入所有功能模块）
│   ├── config/                    # 配置模块
│   ├── database/                  # 数据库连接与配置
│   ├── entities/                  # TypeORM 实体
│   ├── common/                    # 公共过滤器与守卫
│   └── modules/
│       ├── auth/                  # 认证模块
│       ├── host/                  # 主机管理
│       ├── blueprint/             # 蓝图管理
│       ├── install/               # 安装任务
│       ├── service/               # 服务编排
│       ├── monitor/               # 监控告警
│       ├── system/                # 系统设置
│       └── ws/                    # WebSocket 网关
│
├── web/src/
│   ├── main.tsx                   # React 入口
│   ├── App.tsx                    # 根组件
│   ├── layout/                    # 布局组件
│   ├── pages/
│   │   ├── Login/                 # 登录
│   │   ├── Welcome/               # 欢迎页
│   │   ├── Splash/                # 启动页面
│   │   ├── Placeholder/           # 占位页
│   │   └── Topology/              # 拓扑编辑器（核心）
│   ├── stores/                    # Zustand 状态管理
│   └── services/                  # API 服务层
│
├── desktop/src/
│   ├── main.ts                    # Electron 主进程
│   ├── preload.ts                 # 预加载脚本
│   ├── ipc/handlers.ts            # IPC 通信处理
│   └── grpc/client.ts             # gRPC 客户端
│
└── shared/src/
    ├── constants/                 # 枚举常量
    └── interfaces/                # 共享接口
```

---

## 🧪 技术栈

| 层 | 技术 |
|---|---|
| **后端运行时** | Node.js, TypeScript, NestJS |
| **前端框架** | React 18, TypeScript |
| **UI 组件库** | Ant Design 5, @ant-design/icons |
| **拓扑引擎** | ReactFlow 11 |
| **状态管理** | Zustand 4 |
| **桌面** | Electron 29, electron-builder |
| **数据库** | PostgreSQL 16 (prod), SQLite (dev) |
| **ORM** | TypeORM 0.3 |
| **认证** | Passport + JWT, bcrypt |
| **实时通信** | Socket.IO, @nestjs/websockets |
| **RPC** | gRPC (@grpc/grpc-js) |
| **基础设施** | Docker, dnsmasq, PXE, Ansible |
| **CI** | GitHub Actions |

---

## 📄 许可证

MIT

---

<div align="center">
  <sub>Built with ❤️ by AL086</sub>
</div>
