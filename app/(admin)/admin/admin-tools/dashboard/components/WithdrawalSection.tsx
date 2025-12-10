'use client';

import { DASHBOARD_CONSTANTS } from '../constants';

export default function WithdrawalSection() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {DASHBOARD_CONSTANTS.SECTIONS.WITHDRAWAL}
            </h3>
            <div className="space-y-3">
                <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
            </div>
        </div>
    );
}

