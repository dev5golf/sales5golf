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
}

export default function FeeSection({ numberOfPeople, golfSchedules, golfOnSiteSchedules, accommodationSchedules, rentalCarSchedules, rentalCarOnSiteSchedules, flightSchedules }: FeeSectionProps) {
    // 인원수
    const people = parseInt(numberOfPeople) || 0;

    // 골프 수수료 계산 (1인당 1회 1만원 × 골프 행 수)
    const golfFeePerPerson = 10000;
    const totalGolfFee = people * (golfSchedules.length + golfOnSiteSchedules.length) * golfFeePerPerson;

    // 숙박 수수료 계산 (1객실당 1만원)
    const accommodationFeePerRoom = 10000;
    const totalAccommodationFee = accommodationSchedules.length * accommodationFeePerRoom;

    // 렌트카 수수료 계산 (1대당 1만원 × 렌트카 행 수)
    const rentalCarFeePerCar = 10000;
    const totalRentalCarFee = (rentalCarSchedules.length + rentalCarOnSiteSchedules.length) * rentalCarFeePerCar;

    // 항공 수수료 계산 (항공 테이블 행의 인원수 × 1만원)
    const flightFeePerPerson = 10000;
    const totalFlightFee = flightSchedules.reduce((total, schedule) => {
        const passengers = parseInt(schedule.passengers) || 0;
        return total + (passengers * flightFeePerPerson);
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
                <div className="flex justify-center">
                    <div className="w-full max-w-md space-y-3">
                        {/* 골프 수수료 */}
                        <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-6">
                            <span className="text-blue-800 font-bold text-lg">골프</span>
                            <span className="text-blue-900 font-bold text-xl">₩{finalGolfFee.toLocaleString()}</span>
                        </div>

                        {/* 숙박 수수료 */}
                        <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-6">
                            <span className="text-green-800 font-bold text-lg">숙박</span>
                            <span className="text-green-900 font-bold text-xl">₩{totalAccommodationFee.toLocaleString()}</span>
                        </div>

                        {/* 렌트카 수수료 */}
                        <div className="flex justify-between items-center py-3 bg-purple-50 rounded-lg px-6">
                            <span className="text-purple-800 font-bold text-lg">렌트카</span>
                            <span className="text-purple-900 font-bold text-xl">₩{totalRentalCarFee.toLocaleString()}</span>
                        </div>

                        {/* 항공 수수료 */}
                        <div className="flex justify-between items-center py-3 bg-orange-50 rounded-lg px-6">
                            <span className="text-orange-800 font-bold text-lg">항공</span>
                            <span className="text-orange-900 font-bold text-xl">₩{totalFlightFee.toLocaleString()}</span>
                        </div>

                        {/* 할인 적용 */}
                        {isDiscountEligible && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-orange-600 font-medium">골프 8인 이상 할인 (30%)</span>
                                <span className="text-orange-600 font-semibold">-₩{golfDiscountAmount.toLocaleString()}</span>
                            </div>
                        )}

                        {/* 총 수수료 */}
                        <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-6 border-2 border-gray-200">
                            <span className="text-gray-800 font-bold text-xl">총 수수료</span>
                            <span className="text-gray-900 font-bold text-2xl">₩{finalFee.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* 안내 문구 */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">!</span>
                        </div>
                        <div className="text-yellow-800">
                            <p className="font-medium mb-1">수수료 안내</p>
                            <p className="text-sm">
                                골프 1인×1회 당 1만원, 숙박 1객실 당 1만원, 렌트카 1대 당 1만원, 항공 1인 당 1만원 (단, 8인 이상 시 골프 수수료 30% 할인)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
