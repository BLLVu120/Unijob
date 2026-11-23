#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Unijob — Payment API  |  Chạy: ./run_payment_v2.sh
# ─────────────────────────────────────────────────────────────────────────────

# ── Màu sắc ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

PORT=2007
CONDA_ENV="exe_env"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"

cd "$ROOT_DIR"
mkdir -p "$LOG_DIR"

# ── Dừng sạch khi Ctrl+C ──────────────────────────────────────────────────────
cleanup() {
    echo -e "\n${YELLOW}[INFO] Đang dừng server...${NC}"
    kill "$PID_SERVER" "$PID_TAIL" 2>/dev/null
    wait 2>/dev/null
    echo -e "${GREEN}[INFO] Đã dừng. Tạm biệt!${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║     Unijob — Payment API (SePay Webhook)    ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── BƯỚC 1: Kích hoạt Conda environment ──────────────────────────────────────
echo -e "${CYAN}[1/4] Kích hoạt conda env '${CONDA_ENV}'...${NC}"

CONDA_INIT="/home/dangmanh/miniconda3/etc/profile.d/conda.sh"
if [ ! -f "$CONDA_INIT" ]; then
    echo -e "${RED}[ERROR] Không tìm thấy conda tại: $CONDA_INIT${NC}"
    echo -e "${YELLOW}        Sửa biến CONDA_INIT trong script nếu đường dẫn khác.${NC}"
    exit 1
fi

source "$CONDA_INIT"
conda activate "$CONDA_ENV" 2>/dev/null || true

if [ "$CONDA_DEFAULT_ENV" != "$CONDA_ENV" ]; then
    echo -e "${RED}[ERROR] Không thể activate env '${CONDA_ENV}'.${NC}"
    echo -e "${YELLOW}        Tạo env bằng: conda create -n ${CONDA_ENV} python=3.10${NC}"
    exit 1
fi

echo -e "${GREEN}    OK — $(python --version) | env: ${CONDA_DEFAULT_ENV}${NC}"

# ── BƯỚC 2: Cài dependencies nếu thiếu ───────────────────────────────────────
echo -e "${CYAN}[2/4] Kiểm tra dependencies...${NC}"

if ! python -c "import fastapi, uvicorn, httpx, dotenv" 2>/dev/null; then
    echo -e "${YELLOW}    Đang cài từ requirements.txt...${NC}"
    pip install -r "$ROOT_DIR/requirements.txt" -q
    echo -e "${GREEN}    Cài xong.${NC}"
else
    echo -e "${GREEN}    OK — fastapi / uvicorn / httpx đều có.${NC}"
fi

# ── BƯỚC 3: Load .env ─────────────────────────────────────────────────────────
echo -e "${CYAN}[3/4] Load biến môi trường từ .env...${NC}"

ENV_FILE="$ROOT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}[ERROR] Không tìm thấy file .env tại: $ENV_FILE${NC}"
    exit 1
fi

# Load từng dòng (xử lý đúng giá trị có dấu cách)
while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    export "$key"="$value"
done < "$ENV_FILE"

# Kiểm tra các biến SePay bắt buộc
MISSING=0
for var in SEPAY_ACCESS_TOKEN SEPAY_ACCOUNT_NUMBER SEPAY_WEBHOOK_SECRET SEPAY_BANK_CODE; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}    Thiếu biến: $var${NC}"
        MISSING=1
    fi
done
if [ "$MISSING" -eq 1 ]; then
    echo -e "${RED}[ERROR] Kiểm tra lại file .env rồi chạy lại.${NC}"
    exit 1
fi

echo -e "${GREEN}    OK — Tài khoản: ${SEPAY_BANK_CODE} | ${SEPAY_ACCOUNT_NUMBER}${NC}"

# ── BƯỚC 4: Kiểm tra cổng / khởi động server ─────────────────────────────────
echo -e "${CYAN}[4/4] Khởi động Payment API trên port ${PORT}...${NC}"

# Dọn dẹp nếu cổng đang bị chiếm
if lsof -Pi ":$PORT" -sTCP:LISTEN -t &>/dev/null; then
    OLD_PID=$(lsof -ti ":$PORT")
    echo -e "${YELLOW}    Cổng $PORT đang bận (PID $OLD_PID) — đang kill...${NC}"
    kill "$OLD_PID" 2>/dev/null
    sleep 1
fi

uvicorn payment.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --reload \
    >> "$LOG_DIR/payment.log" 2>&1 &
PID_SERVER=$!

# Hiện log ra terminal song song
sleep 0.5 && tail -f "$LOG_DIR/payment.log" &
PID_TAIL=$!

# Chờ server khởi động (tối đa 10 giây)
echo -n "    Chờ server sẵn sàng"
for i in $(seq 1 10); do
    sleep 1
    echo -n "."
    if curl -sf "http://localhost:${PORT}/api/payment/pending" -o /dev/null 2>/dev/null; then
        echo -e " ${GREEN}sẵn sàng!${NC}"
        break
    fi
    if [ "$i" -eq 10 ]; then
        echo -e "\n${RED}[ERROR] Server không phản hồi sau 10s. Xem log: logs/payment.log${NC}"
        exit 1
    fi
done

# ── Bảng kết quả ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            Payment API san sang! (SePay Webhook)             ║"
echo "╠═══════════════════════╦═══════════════════════════════════════╣"
printf "║  %-21s  ║  %-37s  ║\n" "Checkout page"      "http://localhost:${PORT}/"
printf "║  %-21s  ║  %-37s  ║\n" "Swagger UI"         "http://localhost:${PORT}/docs"
printf "║  %-21s  ║  %-37s  ║\n" "Tao don"            "POST /api/payment/create"
printf "║  %-21s  ║  %-37s  ║\n" "Kiem tra TT"        "GET  /api/payment/status/{code}"
printf "║  %-21s  ║  %-37s  ║\n" "Webhook SePay"      "POST /api/payment/webhook"
printf "║  %-21s  ║  %-37s  ║\n" "Log file"           "logs/payment.log"
echo "╚═══════════════════════╩═══════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BOLD}${YELLOW}  >>> Mo trinh duyet: http://localhost:${PORT}/ <<<${NC}"
echo -e "${YELLOW}  Nhan Ctrl+C de dung server.${NC}\n"

# ── Giữ script sống ───────────────────────────────────────────────────────────
wait "$PID_SERVER"
