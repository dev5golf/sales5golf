"use client";
import React, { useRef } from 'react';
import { QUOTATION_NOTES, BANK_INFO } from '@/constants/quotationConstants';
import { createAdditionalInfoImage, generateAdditionalInfoFilename, downloadImage } from '@/lib/utils/imageUtils';

interface AdditionalInfoSectionProps {
    additionalOptions: string;
    onAdditionalOptionsChange: (value: string) => void;
}

export default function AdditionalInfoSection({
    additionalOptions,
    onAdditionalOptionsChange
}: AdditionalInfoSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!sectionRef.current) return;

        try {
            const dataUrl = await createAdditionalInfoImage(sectionRef.current);
            const filename = generateAdditionalInfoFilename();
            downloadImage(dataUrl, filename);
        } catch (error) {
            console.error('이미지 다운로드 실패:', error);
            alert('이미지 다운로드에 실패했습니다.');
        }
    };

    return (
        <div ref={sectionRef} className="additional-info-section px-4 py-4">
            {/* 이미지 저장 버튼 */}
            <div className="mb-4 flex justify-end">
                <button
                    onClick={handleDownloadImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    추가정보 이미지 저장
                </button>
            </div>
            {/* 추가 선택사항 */}
            <div className="mt-6 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">추가선택사항</h3>
                <textarea
                    value={additionalOptions}
                    onChange={(e) => onAdditionalOptionsChange(e.target.value)}
                    placeholder=""
                    className="w-full h-32 px-2 py-2 text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            </div>

            {/* 안내사항 */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">안내사항</h3>
                <ul className="space-y-2 text-2xl text-gray-600">
                    {QUOTATION_NOTES.map((note, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{note}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 입금 정보 */}
            <div className="mt-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 입금하실 곳 */}
                        <div>
                            <div className="text-2xl font-medium text-yellow-800 mb-3">입금하실 곳:</div>
                            <div className="space-y-1 text-2xl text-yellow-700">
                                <div>은행: {BANK_INFO.BANK_NAME}</div>
                                <div>계좌번호: {BANK_INFO.ACCOUNT_NUMBER}</div>
                                <div>예금주: {BANK_INFO.ACCOUNT_HOLDER}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
