#!/bin/bash

# ── Màu sắc terminal ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Dọn dẹp khi thoát (Ctrl+C) ───────────────────────────────────────────────
cleanup() {
    echo -e "\n${YELLOW}[INFO] Đang dừng tất cả tiến trình...${NC}"
    kill $(jobs -p) 2>/dev/null
    wait 2>/dev/null
    echo -e "${GREEN}[INFO] Đã dừng tất cả. Tạm biệt!${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║         Unijob — Khởi động tất cả APIs          ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Khởi động FastAPI servers ─────────────────────────────────────────────────
echo -e "${CYAN}[1/6] Khởi động Company Verification API (port 2004)...${NC}"
uvicorn apis.host_company_verify:app --host 0.0.0.0 --port 2004 \
    > "$LOG_DIR/company_verify.log" 2>&1 &
PID_VERIFY=$!

echo -e "${CYAN}[2/6] Khởi động Company Score API (port 2005)...${NC}"
uvicorn apis.host_company_score:app --host 0.0.0.0 --port 2005 \
    > "$LOG_DIR/company_score.log" 2>&1 &
PID_SCORE=$!

echo -e "${CYAN}[3/6] Khởi động Fraud Detection API (port 2006)...${NC}"
uvicorn apis.host_fraud_detection:app --host 0.0.0.0 --port 2006 \
    > "$LOG_DIR/fraud_detection.log" 2>&1 &
PID_FRAUD=$!

# ── Chờ các server khởi động xong ────────────────────────────────────────────
echo -e "${YELLOW}[INFO] Đợi các server khởi động (5 giây)...${NC}"
sleep 5

# ── Tạo cloudflare tunnel cho từng API ───────────────────────────────────────
echo -e "\n${CYAN}[4/6] Tạo Cloudflare Tunnel cho Company Verification API...${NC}"
cloudflared tunnel --url http://localhost:2004 \
    > "$LOG_DIR/tunnel_verify.log" 2>&1 &
PID_TUNNEL_VERIFY=$!

echo -e "${CYAN}[5/6] Tạo Cloudflare Tunnel cho Company Score API...${NC}"
cloudflared tunnel --url http://localhost:2005 \
    > "$LOG_DIR/tunnel_score.log" 2>&1 &
PID_TUNNEL_SCORE=$!

echo -e "${CYAN}[6/6] Tạo Cloudflare Tunnel cho Fraud Detection API...${NC}"
cloudflared tunnel --url http://localhost:2006 \
    > "$LOG_DIR/tunnel_fraud.log" 2>&1 &
PID_TUNNEL_FRAUD=$!

# ── Đợi cloudflared lấy public URL ───────────────────────────────────────────
echo -e "${YELLOW}[INFO] Đợi Cloudflare tạo public URL (8 giây)...${NC}"
sleep 8

# ── Đọc public URL từ log ─────────────────────────────────────────────────────
extract_url() {
    grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$1" | head -1
}

URL_VERIFY=$(extract_url "$LOG_DIR/tunnel_verify.log")
URL_SCORE=$(extract_url "$LOG_DIR/tunnel_score.log")
URL_FRAUD=$(extract_url "$LOG_DIR/tunnel_fraud.log")

# ── In bảng kết quả ───────────────────────────────────────────────────────────
echo -e "\n${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                    Tất cả APIs đã sẵn sàng!                        ║"
echo "╠══════════════════════════════════════════════════════════════════════╣"
printf "║  %-25s  port %-6s  %-28s ║\n" "Company Verification" "2004" "${URL_VERIFY:-'(đang tạo...)'}"
printf "║  %-25s  port %-6s  %-28s ║\n" "Company Score" "2005" "${URL_SCORE:-'(đang tạo...)'}"
printf "║  %-25s  port %-6s  %-28s ║\n" "Fraud Detection" "2006" "${URL_FRAUD:-'(đang tạo...)'}"
echo "╠══════════════════════════════════════════════════════════════════════╣"
echo "║  Swagger UI: <public_url>/docs                                      ║"
echo "║  Logs: ./logs/                                                      ║"
echo "║  Nhấn Ctrl+C để dừng tất cả                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Theo dõi URL nếu chưa lấy được ───────────────────────────────────────────
if [ -z "$URL_VERIFY" ] || [ -z "$URL_SCORE" ] || [ -z "$URL_FRAUD" ]; then
    echo -e "${YELLOW}[INFO] Một số URL chưa sẵn sàng, đang theo dõi log...${NC}"
    echo -e "       Chạy lệnh sau để xem URL theo thời gian thực:${NC}"
    echo -e "${CYAN}       grep -h 'trycloudflare' logs/tunnel_*.log${NC}\n"
fi

# ── Giữ script chạy, theo dõi tiến trình ─────────────────────────────────────
while true; do
    # Kiểm tra nếu server bị crash
    if ! kill -0 $PID_VERIFY 2>/dev/null; then
        echo -e "${RED}[WARN] Company Verification API (2004) đã dừng, đang khởi động lại...${NC}"
        uvicorn apis.host_company_verify:app --host 0.0.0.0 --port 2004 \
            >> "$LOG_DIR/company_verify.log" 2>&1 &
        PID_VERIFY=$!
    fi
    if ! kill -0 $PID_SCORE 2>/dev/null; then
        echo -e "${RED}[WARN] Company Score API (2005) đã dừng, đang khởi động lại...${NC}"
        uvicorn apis.host_company_score:app --host 0.0.0.0 --port 2005 \
            >> "$LOG_DIR/company_score.log" 2>&1 &
        PID_SCORE=$!
    fi
    if ! kill -0 $PID_FRAUD 2>/dev/null; then
        echo -e "${RED}[WARN] Fraud Detection API (2006) đã dừng, đang khởi động lại...${NC}"
        uvicorn apis.host_fraud_detection:app --host 0.0.0.0 --port 2006 \
            >> "$LOG_DIR/fraud_detection.log" 2>&1 &
        PID_FRAUD=$!
    fi
    sleep 10
done
