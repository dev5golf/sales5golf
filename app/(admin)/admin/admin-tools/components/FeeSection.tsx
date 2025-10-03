"use client";
import React from 'react';

interface FeeSectionProps {
    numberOfPeople: string;
    golfSchedules: any[];
    golfOnSiteSchedules: any[];
    accommodationSchedules: any[];
    rentalCarSchedules: any[];
    rentalCarOnSiteSchedules: any[];
    flightSchedules: any[];
    regionType?: 'basic' | 'japan';
}

export default function FeeSection({ numberOfPeople, golfSchedules, golfOnSiteSchedules, accommodationSchedules, rentalCarSchedules, rentalCarOnSiteSchedules, flightSchedules, regionType = 'basic' }: FeeSectionProps) {
    // 인원수
    const people = parseInt(numberOfPeople) || 0;

    // 골프 수수료 계산 (1인당 1회 1만원 × 골프 행 수)
    // 기본 지역의 경우 골프수수료는 무료(0원)로 적용
    const golfFeePerPerson = regionType === 'japan' ? 10000 : 0;
    const totalGolfFee = people * (golfSchedules.length + golfOnSiteSchedules.length) * golfFeePerPerson;

    // 숙박 수수료 계산 (숙박 테이블 행의 객실수 × 1만원)
    const accommodationFeePerRoom = 10000;
    const totalAccommodationFee = accommodationSchedules.reduce((total, schedule) => {
        const rooms = parseInt(schedule.rooms) || 0;
        return total + (rooms * accommodationFeePerRoom);
    }, 0);

    // 렌트카 수수료 계산 (1대당 1만원 × 렌트카 행 수)
    const rentalCarFeePerCar = 10000;
    const totalRentalCarFee = (rentalCarSchedules.length + rentalCarOnSiteSchedules.length) * rentalCarFeePerCar;

    // 항공 수수료 계산 (항공 테이블 행의 인원수 × 1만원)
    const flightFeePerPerson = 10000;
    const totalFlightFee = flightSchedules.reduce((total, schedule) => {
        const people = parseInt(schedule.people) || 0;
        return total + (people * flightFeePerPerson);
    }, 0);

    // 8인 이상 시 골프 수수료에만 30% 할인 적용
    const isDiscountEligible = people >= 8;
    const discountRate = isDiscountEligible ? 0.3 : 0;
    const golfDiscountAmount = totalGolfFee * discountRate;
    const finalGolfFee = totalGolfFee - golfDiscountAmount;

    // 총 수수료 (할인 적용된 골프 수수료 + 숙박 수수료 + 렌트카 수수료 + 항공 수수료)
    const finalFee = finalGolfFee + totalAccommodationFee + totalRentalCarFee + totalFlightFee;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">오분골프 수수료</h3>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* 골프 수수료 */}
                    {(golfSchedules.length > 0 || golfOnSiteSchedules.length > 0) && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-800 font-medium text-xl">골프</span>
                            {regionType === 'basic' && finalGolfFee === 0 ? (
                                <span className="text-green-600 font-bold text-xl">₩0 (무료이벤트)</span>
                            ) : isDiscountEligible ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-bold text-xl">₩{finalGolfFee.toLocaleString()}</span>
                                    <span className="text-gray-500 text-sm line-through">(₩{totalGolfFee.toLocaleString()})</span>
                                </div>
                            ) : (
                                <span className="text-gray-900 font-bold text-xl">₩{finalGolfFee.toLocaleString()}</span>
                            )}
                        </div>
                    )}

                    {/* 숙박 수수료 */}
                    {totalAccommodationFee > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-800 font-medium text-xl">숙박</span>
                            <span className="text-gray-900 font-bold text-xl">₩{totalAccommodationFee.toLocaleString()}</span>
                        </div>
                    )}

                    {/* 렌트카 수수료 */}
                    {totalRentalCarFee > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-800 font-medium text-xl">렌트카</span>
                            <span className="text-gray-900 font-bold text-xl">₩{totalRentalCarFee.toLocaleString()}</span>
                        </div>
                    )}

                    {/* 항공 수수료 */}
                    {totalFlightFee > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-800 font-medium text-xl">항공</span>
                            <span className="text-gray-900 font-bold text-xl">₩{totalFlightFee.toLocaleString()}</span>
                        </div>
                    )}

                    {/* 총 수수료 */}
                    {finalFee > 0 && (
                        <div className="flex items-center gap-2 ml-auto border-l border-gray-200 pl-4">
                            <span className="text-gray-800 font-bold text-lg">총 수수료</span>
                            <span className="text-gray-900 font-bold text-xl">₩{finalFee.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* 안내 문구 */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">!</span>
                        </div>
                        <div className="text-yellow-800">
                            <p className="font-medium text-lg mb-1">수수료 안내</p>
                            <p className="text-lg">
                                골프 1인×1회 1만원(8인 이상 시 골프 수수료 30% 할인) / 숙박 1객실 1만원 / 렌트카 1대 1만원 / 항공 1인 1만원
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
