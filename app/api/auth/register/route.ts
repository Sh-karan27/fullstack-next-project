import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, avatar } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar is required' },
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

    console.log('avatar:', avatar);

    const user = await User.create({ email, password, username, avatar });
    await user.save();
    console.log('avatar after user:', avatar);
    console.log(user);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to  created user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created', user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to  created user' },
      { status: 500 }
    );
  }
}
