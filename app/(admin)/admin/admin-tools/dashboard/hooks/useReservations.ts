import { useState, useEffect } from 'react';
import { ReservationService, ReservationListItem } from '../services/reservationService';

export const useReservations = () => {
    const [reservations, setReservations] = useState<ReservationListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReservations = async () => {
        setLoading(true);
        const response = await ReservationService.getReservations();
        if (response.success && response.data) {
            setReservations(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadReservations();
    }, []);

    return {
        reservations,
        loading,
        refresh: loadReservations
    };
};

