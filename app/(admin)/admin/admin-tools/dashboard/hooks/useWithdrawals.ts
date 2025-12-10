import { useState, useEffect } from 'react';
import { WithdrawalService, WithdrawalListItem } from '../services/withdrawalService';

export const useWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState<WithdrawalListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadWithdrawals = async () => {
        setLoading(true);
        const response = await WithdrawalService.getWithdrawals();
        if (response.success && response.data) {
            setWithdrawals(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadWithdrawals();
    }, []);

    return {
        withdrawals,
        loading,
        refresh: loadWithdrawals
    };
};

