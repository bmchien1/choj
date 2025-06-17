# Choj - Hệ thống học lập trình

## 1. Source Code
Source code của dự án được chia thành 3 phần chính:

### Frontend (choj)
- Repository: https://github.com/bmchien1/choj
- Công nghệ: React, Vite, Antd, Tailwind CSS
- Cấu trúc:
  ```
  choj/
  ├── src/
  │   ├── apis/         # API services
  │   ├── components/   # Reusable components
  │   ├── constants/    # Constants & types
  │   ├── hooks/        # Custom hooks
  │   ├── layouts/      # Layout components
  │   ├── pages/        # Page components
  │   ├── providers/    # Context providers
  │   ├── routes/       # Route configurations
  │   ├── themes/       # Theme configurations
  │   └── utils/        # Utility functions
  ├── public/           # Static files
  └── package.json      # Dependencies
  ```

### Backend (choj-node)
- Repository: https://github.com/bmchien1/choj-node
- Công nghệ: Node.js, Express, MongoDB
- Cấu trúc:
  ```
  choj-node/
  ├── src/
  │   ├── controllers/  # Business logic
  │   ├── models/       # Database models
  │   ├── routes/       # API routes
  │   ├── services/     # Business services
  │   └── utils/        # Utility functions
  └── package.json      # Dependencies
  ```

### Evaluation Service (choj-eval)
- Repository: https://github.com/bmchien1/choj-eval
- Công nghệ: Node.js, Docker
- Cấu trúc:
  ```
  choj-eval/
  ├── src/
  │   ├── evaluators/   # Code evaluators
  │   └── utils/        # Utility functions
  ├── Dockerfile        # Docker configuration
  └── package.json      # Dependencies
  ```

## 2. Chương trình

### Yêu cầu hệ thống
- Node.js (v18 trở lên)
- MongoDB (v4.4 trở lên)
- Docker và Docker Compose
- Git

### Các tính năng chính
1. **Quản lý người dùng**
   - Đăng ký/Đăng nhập
   - Quản lý profile
   - Phân quyền (Admin/Teacher/Student)

2. **Quản lý bài tập**
   - Tạo/Sửa/Xóa bài tập
   - Phân loại bài tập
   - Upload test cases

3. **Chấm điểm tự động**
   - Chạy code người dùng
   - Kiểm tra test cases
   - Trả về kết quả

4. **Thống kê và báo cáo**
   - Theo dõi tiến độ
   - Xem thống kê
   - Xuất báo cáo

## 3. Hướng dẫn chạy

### Bước 1: Cài đặt MongoDB
```bash
# Cài đặt MongoDB
# Windows: Tải và cài đặt từ https://www.mongodb.com/try/download/community
# Linux:
sudo apt update
sudo apt install mongodb

# Khởi động MongoDB
# Windows: MongoDB sẽ chạy như một service
# Linux:
sudo systemctl start mongodb
```

### Bước 2: Cài đặt Frontend
```bash
# Clone repository
git clone https://github.com/bmchien1/choj.git
cd choj

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa các biến môi trường trong .env

# Chạy development server
npm run dev
```

### Bước 3: Cài đặt Backend
```bash
# Clone repository
git clone https://github.com/bmchien1/choj-node.git
cd choj-node

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa các biến môi trường trong .env

# Chạy development server
npm run dev
```

### Bước 4: Cài đặt Evaluation Service
```bash
# Clone repository
git clone https://github.com/bmchien1/choj-eval.git
cd choj-eval

# Build và chạy Docker container
docker-compose up --build
```

### Kiểm tra cài đặt
1. Frontend: Truy cập http://localhost:3000
2. Backend: API sẽ chạy tại http://localhost:4000
3. Evaluation Service: Sẽ chạy trong Docker container

### Cấu hình môi trường
1. **Frontend (.env)**
```env
VITE_API_URL=http://localhost:4000
VITE_API_TIMEOUT=30000
VITE_AUTH_TOKEN_KEY=choj_auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=choj_refresh_token
```

2. **Backend (.env)**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/choj
JWT_SECRET=your-secret-key
EVAL_SERVICE_URL=http://localhost:5000
```

3. **Evaluation Service (docker-compose.yml)**
```yaml
version: '3'
services:
  eval-service:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
```

### Xử lý lỗi thường gặp
1. **Lỗi kết nối MongoDB**
   - Kiểm tra MongoDB đã chạy chưa
   - Kiểm tra URI trong file .env

2. **Lỗi CORS**
   - Kiểm tra CORS_ORIGIN trong backend
   - Đảm bảo frontend và backend đúng port

3. **Lỗi Docker**
   - Kiểm tra Docker đã cài đặt và chạy
   - Kiểm tra port 5000 đã được sử dụng chưa

### Hỗ trợ
Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs của từng service
2. Xem lại cấu hình trong file .env
3. Đảm bảo tất cả dependencies đã được cài đặt
4. Kiểm tra các port không bị conflict
