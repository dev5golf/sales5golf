import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // ExchangeRate-API 사용 (무료)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');

        if (!response.ok) {
            throw new Error('환율 API 호출 실패');
        }

        const data = await response.json();

        // JPY to KRW 환율 반환
        return NextResponse.json({
            rate: data.rates.KRW,
            date: new Date().toISOString()
        });
    } catch (error) {
        console.error('환율 가져오기 실패:', error);
        return NextResponse.json(
            { error: '환율을 가져올 수 없습니다.' },
            { status: 500 }
        );
    }
}
