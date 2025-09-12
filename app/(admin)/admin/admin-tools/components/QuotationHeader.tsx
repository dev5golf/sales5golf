'use client';

import { Button } from '../../../../../components/ui/button';
import { Download, Eye } from 'lucide-react';

interface QuotationHeaderProps {
    onPreview: () => void;
    onDownload: () => void;
}

export default function QuotationHeader({ onPreview, onDownload }: QuotationHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
            <div>
                <h1 className="text-3xl font-semibold text-gray-800">관리자 도구</h1>
                <p className="text-gray-600 mt-1">편의 기능</p>
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={onPreview}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Eye className="h-4 w-4" />
                    미리보기
                </Button>
                <Button
                    onClick={onDownload}
                    variant="default"
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    이미지 다운로드
                </Button>
            </div>
        </div>
    );
}
