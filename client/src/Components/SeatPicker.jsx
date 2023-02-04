import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';

const SeatPicker = () => {
    const [seats, setSeats] = useState([]);
    const [Booking, setBooking] = useState(0)

    async function fetchSeats() {
        const response = await fetch('http://localhost:3000/api/seats');
        const data = await response.json();
        setSeats(data);
    }

    useEffect(() => {
        fetchSeats();
    }, []);

    useEffect(() => {
       fetchSeats()
    }, [Booking]);

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ margin: '30px' }}>
                <BookingForm setBooking={setBooking}/>
            </div>
            <div style={{ textAlign: 'center', margin: '75px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {seats.map((seat, i) => (
                        <div className={seat.isAvailable ? 'greenColor seatBox' : 'redColor seatBox'} key={seat._id}>
                            {seat.seatNumber}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SeatPicker;
