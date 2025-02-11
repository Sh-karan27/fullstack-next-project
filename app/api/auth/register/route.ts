import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log(email, password);
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db_connected = await connectToDatabase();

    if (!db_connected) {
      console.log('Database not connected');
    }
    console.log('Database connected');

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'User already' }, { status: 400 });
    }

    await User.create({ email, password });

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to  created user' },
      { status: 500 }
    );
  }
}
