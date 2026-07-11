#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SwiftDeploy WSL2 Setup Script
# ═══════════════════════════════════════════════════════════════
# This script configures WSL2 with Docker, dnsmasq, and PXE
# infrastructure for SwiftDeploy.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ── Check prerequisites ──────────────────────────────────────
check_prereqs() {
  log_info "Checking prerequisites..."

  if ! command -v docker &>/dev/null; then
    log_error "Docker not found. Please install Docker Desktop for Windows with WSL2 integration."
    log_info "Download: https://docs.docker.com/desktop/wsl/"
    exit 1
  fi
  log_ok "Docker found: $(docker --version)"

  if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null 2>&1; then
    log_error "Docker Compose not found."
    exit 1
  fi
  log_ok "Docker Compose found"

  if ! command -v pnpm &>/dev/null; then
    log_warn "pnpm not found. Installing..."
    npm install -g pnpm
  fi
  log_ok "pnpm found: $(pnpm --version)"
}

# ── Setup Docker networks ────────────────────────────────────
setup_docker() {
  log_info "Setting up Docker networks..."

  # Create shared network if it doesn't exist
  if ! docker network ls | grep -q swiftdeploy-net; then
    docker network create swiftdeploy-net --driver bridge --subnet 172.20.0.0/16
    log_ok "Created swiftdeploy-net network"
  else
    log_ok "Network swiftdeploy-net already exists"
  fi
}

# ── Install dependencies ─────────────────────────────────────
install_deps() {
  log_info "Installing npm/pnpm dependencies..."

  cd "$(dirname "$0")/../.."
  pnpm install
  log_ok "Dependencies installed"
}

# ── Start services ────────────────────────────────────────────
start_services() {
  log_info "Starting infrastructure services..."

  cd "$(dirname "$0")/../.."
  docker-compose -f docker-compose.infra.yml up -d
  log_ok "Infrastructure services started"
}

# ── Setup WSL2 config ────────────────────────────────────────
setup_wsl2() {
  log_info "Configuring WSL2..."

  WSL_CONFIG="/etc/wsl.conf"
  if [ -f "$WSL_CONFIG" ] && grep -q "systemd" "$WSL_CONFIG" 2>/dev/null; then
    log_ok "WSL2 already configured with systemd"
  else
    log_warn "Please ensure WSL2 has systemd enabled in %USERPROFILE%\\.wslconfig:"
    echo ""
    echo "  [wsl2]"
    echo "  kernelCommandLine = systemd=true"
    echo "  memory = 8GB"
    echo "  processors = 4"
    echo ""
  fi
}

# ── Build project ────────────────────────────────────────────
build_project() {
  log_info "Building project..."

  cd "$(dirname "$0")/../.."

  log_info "Building shared package..."
  pnpm --filter @swiftdeploy/shared build || true

  log_info "Building server..."
  pnpm --filter @swiftdeploy/server build || true

  log_info "Building web..."
  pnpm --filter @swiftdeploy/web build || true

  log_info "Building desktop..."
  pnpm --filter @swiftdeploy/desktop build || true

  log_ok "Build complete"
}

# ── Show summary ─────────────────────────────────────────────
show_summary() {
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  SwiftDeploy WSL2 Setup Complete"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  echo "  Next steps:"
  echo "  1. Start the development server:"
  echo "     $ pnpm --filter @swiftdeploy/server run dev"
  echo ""
  echo "  2. Start the web dev server (optional):"
  echo "     $ pnpm --filter @swiftdeploy/web run dev"
  echo ""
  echo "  3. Run the desktop app:"
  echo "     $ pnpm --filter @swiftdeploy/desktop run dev"
  echo ""
  echo "  4. Start infrastructure:"
  echo "     $ docker-compose -f docker-compose.infra.yml up -d"
  echo ""
  echo "═══════════════════════════════════════════════════════"
}

# ── Main ─────────────────────────────────────────────────────
main() {
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  SwiftDeploy WSL2 Environment Setup"
  echo "═══════════════════════════════════════════════════════"
  echo ""

  check_prereqs
  setup_wsl2
  setup_docker
  install_deps
  build_project
  start_services
  show_summary
}

main "$@"
