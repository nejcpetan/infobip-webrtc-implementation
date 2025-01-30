import { NextResponse } from 'next/server';

const VALID_USERNAME = process.env.NEXT_PUBLIC_AUTH_USERNAME;
const VALID_PASSWORD = process.env.AUTH_PASSWORD;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const isValid = 
      username === VALID_USERNAME && 
      password === VALID_PASSWORD;

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 