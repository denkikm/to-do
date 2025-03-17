import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/todos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId !== session.user.id) {
      return NextResponse.json(
        { message: 'شما اجازه دسترسی به این اطلاعات را ندارید' },
        { status: 403 }
      );
    }

    const todos = await prisma.todo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت کارها' },
      { status: 500 }
    );
  }
}

// POST /api/todos
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, dueDate, priority, category, tags, reminder } = body;

    if (!title) {
      return NextResponse.json(
        { message: 'عنوان کار الزامی است' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        category,
        tags: tags || [],
        reminder: reminder ? new Date(reminder) : null,
        userId: session.user.id
      }
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    return NextResponse.json(
      { message: 'خطا در ایجاد کار جدید' },
      { status: 500 }
    );
  }
} 