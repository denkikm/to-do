#!/bin/bash

echo "🚀 شروع دیپلوی برنامه..."

# نصب وابستگی‌ها
echo "📦 نصب وابستگی‌ها..."
npm install

# ساخت دیتابیس
echo "🗄️ راه‌اندازی دیتابیس..."
docker-compose up -d

# اجرای مایگریشن‌ها
echo "🔄 اجرای مایگریشن‌های دیتابیس..."
npx prisma migrate deploy

# ساخت نسخه تولید
echo "🏗️ ساخت نسخه تولید..."
npm run build

# راه‌اندازی برنامه
echo "🌟 راه‌اندازی برنامه..."
pm2 delete todo-app || true
pm2 start npm --name "todo-app" -- start

echo "✅ دیپلوی با موفقیت انجام شد!" 