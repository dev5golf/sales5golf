import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Vercel API 테스트 성공!',
        timestamp: new Date().toISOString(),
        path: '/api/test'
    });
}

export async function POST() {
    return NextResponse.json({
        message: 'POST 테스트 성공!',
        timestamp: new Date().toISOString()
    });
}
