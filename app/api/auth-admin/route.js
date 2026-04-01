import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Mengambil data dari Environment Vercel
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PW;

    if (email === envEmail && password === envPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
