import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'لطفاً تمام فیلدها را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر با ایمیل مشابه
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'این ایمیل قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // رمزنگاری پسورد
    const hashedPassword = await bcrypt.hash(password, 12);

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json(
      { message: 'ثبت‌نام با موفقیت انجام شد' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in register:', error);
    return NextResponse.json(
      { message: 'خطایی در ثبت‌نام رخ داد' },
      { status: 500 }
    );
  }
} 