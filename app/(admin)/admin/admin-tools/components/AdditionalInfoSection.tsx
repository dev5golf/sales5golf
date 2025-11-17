"use client";
import React, { useRef } from 'react';
import { QUOTATION_NOTES, BANK_INFO } from '@/constants/quotationConstants';
import { createAdditionalInfoImage, generateAdditionalInfoFilename, downloadImage } from '@/lib/utils/imageUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdditionalInfoSectionProps {
    additionalOptions: string;
    onAdditionalOptionsChange: (value: string) => void;
    golfSchedules: any[];
    golfOnSiteSchedules: any[];
    regionType?: 'basic' | 'japan';
}

export default function AdditionalInfoSection({
    additionalOptions,
    onAdditionalOptionsChange,
    golfSchedules,
    golfOnSiteSchedules,
    regionType = 'basic'
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

    const handleCopyMapLink = async () => {
        try {
            // 골프장 정보 수집 (중복 제거)
            const allSchedules = [...golfSchedules, ...golfOnSiteSchedules];
            const uniqueCourses = new Map<string, { name: string; mapLink?: string }>();
            const noIdCourses: string[] = [];
            const noMapLinkCourses: string[] = [];

            // 골프장별로 중복 제거하며 정보 수집
            for (const schedule of allSchedules) {
                if (schedule.courseName && !uniqueCourses.has(schedule.courseName)) {
                    let mapLink = '';

                    // courseId가 없으면 ID 조회 불가
                    if (!schedule.courseId) {
                        noIdCourses.push(schedule.courseName);
                        continue;
                    }

                    // 골프장 ID로 Firestore에서 지도링크 조회
                    try {
                        const courseDoc = await getDoc(doc(db, 'courses', schedule.courseId));
                        if (courseDoc.exists()) {
                            mapLink = courseDoc.data()?.googleMapsLink || '';
                            if (!mapLink) {
                                noMapLinkCourses.push(schedule.courseName);
                            }
                        }
                    } catch (error) {
                        console.error('골프장 정보 조회 실패:', error);
                    }

                    uniqueCourses.set(schedule.courseName, {
                        name: schedule.courseName,
                        mapLink: mapLink
                    });
                }
            }

            // 에러 알림
            if (noIdCourses.length > 0) {
                alert(`ID 값이 조회되지 않습니다\n${noIdCourses.join(', ')}`);
            }

            if (noMapLinkCourses.length > 0) {
                alert(`구글맵링크가 저장되지 않은 골프장이 있습니다\n${noMapLinkCourses.join(', ')}`);
            }

            // 복사할 텍스트 생성 (지도링크가 있는 경우만)
            let coursesText = '';
            uniqueCourses.forEach((course) => {
                if (course.mapLink) {
                    coursesText += `${course.name}: ${course.mapLink}\n`;
                }
            });

            if (!coursesText) {
                alert('복사할 지도링크가 없습니다.');
                return;
            }

            const textToCopy = coursesText.trim();

            await navigator.clipboard.writeText(textToCopy);
            alert('지도 링크가 클립보드에 복사되었습니다.');
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            alert('클립보드 복사에 실패했습니다.');
        }
    };

    return (
        <div ref={sectionRef} className="additional-info-section px-4 py-4">
            {/* 이미지 저장 버튼 */}
            <div className="mb-4 flex justify-end gap-2">
                <button
                    onClick={handleCopyMapLink}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                    지도 링크 복사
                </button>
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
                    {regionType === 'basic' && (
                        <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>동남아 골프장 특성 상 당일 현장 취소 진행 시, 현지 직원의 구두 상의 안내만으로는 취소/환불 불가하며 골프장으로부터 취소 가능 안내받은 직원 성함 또는 취소확인서를 오분골프 측으로 전달부탁드립니다. 해당 과정 없이 구장 이탈하신 경우 취소/환불 불가합니다.</span>
                        </li>
                    )}
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
