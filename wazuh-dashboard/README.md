# Custom Security Dashboard (Vue) cho đồ án Wazuh IDS

Dashboard riêng thay thế giao diện mặc định của Wazuh, tự query dữ liệu từ Wazuh Indexer.

## Kiến trúc
```
Vue Frontend (port 5173) → Node.js Backend proxy (port 4000) → Wazuh Indexer (port 9200)
```

## Cách chạy trên Kali

### 1. Cài Node.js (nếu chưa có)
```bash
sudo apt install -y nodejs npm
node --version   # cần >= 18
```

### 2. Chạy Backend
```bash
cd wazuh-dashboard/backend
npm install
cp .env.example .env
nano .env   # điền INDEXER_PASS đúng với password Wazuh của bạn (mặc định trong config/wazuh_indexer/internal_users.yml)
npm start
```
Backend chạy tại `http://localhost:4000`. Kiểm tra nhanh: mở trình duyệt vào `http://localhost:4000/api/alerts` — phải thấy JSON dữ liệu (hoặc mảng rỗng nếu chưa có alert nào).

### 3. Chạy Frontend (mở terminal mới)
```bash
cd wazuh-dashboard/frontend
npm install
npm run dev
```
Mở trình duyệt vào địa chỉ Vite in ra (thường `http://localhost:5173`).

## Lưu ý khi demo
- Phải chạy đúng thứ tự: Wazuh Docker (đã setup trước) → Backend → Frontend
- Nếu Dashboard hiện "Mất kết nối tới backend": kiểm tra lại backend có đang chạy, và `.env` đã điền đúng password Indexer chưa
- Password lấy từ file `config/wazuh_indexer/internal_users.yml` trong thư mục `wazuh-docker/single-node` (đã đổi ở bước trước theo hướng dẫn)
