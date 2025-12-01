import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // 요청 본문에서 FormData 파라미터와 access_token 받기
        const formData = await request.formData();

        // Authorization 헤더에서 Bearer 토큰 추출
        const authHeader = request.headers.get('Authorization');
        let accessToken: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7); // 'Bearer ' 제거
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Authorization 헤더에 Bearer 토큰이 포함되어야 합니다.' },
                { status: 400 }
            );
        }

        // FormData 파라미터 추출
        const accountnum = formData.get('accountnum')?.toString();
        const datatype = formData.get('datatype')?.toString() || 'json';
        const charset = formData.get('charset')?.toString() || 'utf8';
        const datefrom = formData.get('datefrom')?.toString();
        const dateto = formData.get('dateto')?.toString();
        const bkcode = formData.get('bkcode')?.toString();
        const istest = formData.get('istest')?.toString() || 'n';

        // 외부 API에 전송할 FormData 생성
        const externalFormData = new FormData();
        if (accountnum) externalFormData.append('accountnum', accountnum);
        externalFormData.append('datatype', datatype);
        externalFormData.append('charset', charset);
        if (datefrom) externalFormData.append('datefrom', datefrom);
        if (dateto) externalFormData.append('dateto', dateto);
        if (bkcode) externalFormData.append('bkcode', bkcode);
        externalFormData.append('istest', istest);

        // 외부 API 호출
        const response = await fetch('https://a.bankda.com/dtsvc/bank_tr.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {
                    error: '외부 API 호출 실패',
                    status: response.status,
                    statusText: response.statusText,
                    details: errorText
                },
                { status: response.status }
            );
        }

        // 응답 데이터 파싱
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            // JSON이 아닌 경우 텍스트로 받기
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { raw: text };
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Bankda API 호출 실패:', error);
        return NextResponse.json(
            {
                error: 'API 호출 중 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

