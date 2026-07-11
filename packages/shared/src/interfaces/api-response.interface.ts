import {
  HostStatus, NodeType, TaskStatus, ServiceStatus,
  AlertSeverity, AlertCondition, UserRole, InstallType,
} from '../constants';

// ── Common ──────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  database: string;
}

// ── Host ────────────────────────────────────────────

export interface HostBase {
  mac: string;
  ip: string;
  hostname: string;
  os: string;
  os_version: string;
  cpu_cores: number;
  memory_gb: number;
  disk_gb: number;
  status: HostStatus;
}

export interface HostCreate extends HostBase {
  hardware: Record<string, unknown>;
  ipmi_ip?: string | null;
  ipmi_user?: string | null;
  group_ids: number[];
}

export interface HostUpdate {
  hostname?: string | null;
  ip?: string | null;
  os?: string | null;
  os_version?: string | null;
  status?: HostStatus | null;
  hardware?: Record<string, unknown> | null;
  cpu_cores?: number | null;
  memory_gb?: number | null;
  disk_gb?: number | null;
}

export interface HostResponse extends HostBase {
  hardware: Record<string, unknown>;
  ipmi_ip?: string | null;
  ipmi_user?: string | null;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostQuery {
  status?: HostStatus | null;
  os?: string | null;
  group_id?: number | null;
  search?: string | null;
  page?: number;
  page_size?: number;
}

// ── Blueprint ───────────────────────────────────────

export interface BlueprintBase {
  name: string;
  description: string;
  layout_data: Record<string, unknown>;
}

export interface BlueprintCreate extends BlueprintBase {}

export interface BlueprintUpdate {
  name?: string | null;
  description?: string | null;
  layout_data?: Record<string, unknown> | null;
}

export interface BlueprintResponse extends BlueprintBase {
  id: number;
  version: number;
  git_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlueprintNodeCreate {
  blueprint_id: number;
  type: NodeType;
  label: string;
  mac?: string | null;
  ip?: string | null;
  role_template_id?: number | null;
  config: Record<string, unknown>;
  pos_x: number;
  pos_y: number;
}

export interface BlueprintNodeResponse {
  id: number;
  blueprint_id: number;
  type: NodeType;
  label: string;
  mac?: string | null;
  ip?: string | null;
  role_template_id?: number | null;
  config: Record<string, unknown>;
  pos_x: number;
  pos_y: number;
}

export interface ConnectionResponse {
  id: number;
  blueprint_id: number;
  from_node_id: number;
  to_node_id: number;
  from_port: string;
  to_port: string;
}

// ── Install ─────────────────────────────────────────

export interface InstallTaskCreate {
  name: string;
  blueprint_id?: number | null;
  type: InstallType;
  target_ids: number[];
}

export interface InstallTaskResponse {
  id: number;
  name: string;
  blueprint_id?: number | null;
  status: TaskStatus;
  type: InstallType;
  progress: number;
  created_at: string;
  completed_at?: string | null;
}

export interface InstallTargetResponse {
  id: number;
  task_id: number;
  host_id: number;
  image_id?: number | null;
  status: TaskStatus;
  progress: number;
  log: string;
}

// ── Monitor ─────────────────────────────────────────

export interface MonitoringDataResponse {
  id: number;
  host_id: number;
  timestamp: string;
  cpu_percent: number;
  mem_percent: number;
  disk_percent: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
  load_1m: number;
}

export interface AlertRuleCreate {
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  duration_sec?: number;
  severity?: AlertSeverity;
}

export interface AlertRuleResponse {
  id: number;
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  duration_sec: number;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface AlertLogResponse {
  id: number;
  rule_id: number;
  host_id: number;
  triggered_at: string;
  resolved_at?: string | null;
  value: number;
  notified: boolean;
}

// ── Service ─────────────────────────────────────────

export interface RoleTemplateResponse {
  id: number;
  name: string;
  category: string;
  description: string;
  schema: Record<string, unknown>;
  built_in: boolean;
}

export interface ServiceDeployRequest {
  host_ids: number[];
  role_id: number;
  config: Record<string, unknown>;
}

export interface ServiceDeploymentResponse {
  id: number;
  host_id: number;
  role_id: number;
  config: Record<string, unknown>;
  status: ServiceStatus;
  deployed_at?: string | null;
}

// ── System ──────────────────────────────────────────

export interface SystemConfigResponse {
  server_host: string;
  server_port: number;
  log_level: string;
  theme: string;
  language: string;
}

export interface UserCreate {
  username: string;
  password: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  theme_pref: string;
  lang_pref: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}
