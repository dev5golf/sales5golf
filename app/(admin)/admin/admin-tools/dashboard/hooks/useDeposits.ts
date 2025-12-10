import { useState, useEffect } from 'react';
import { DepositService, DepositListItem } from '../services/depositService';

export const useDeposits = () => {
    const [deposits, setDeposits] = useState<DepositListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDeposits = async () => {
        setLoading(true);
        const response = await DepositService.getDeposits();
        if (response.success && response.data) {
            setDeposits(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadDeposits();
    }, []);

    return {
        deposits,
        loading,
        refresh: loadDeposits
    };
};

