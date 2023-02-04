import React, { useState } from 'react';

function BookingForm({ setBooking }) {
  const [seatsToBook, setSeatsToBook] = useState(0);
  const [bookingResult, setBookingResult] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatsToBook }),
      });
      const result = await response.json();
      setBookingResult(result);
      setBooking(result.SeatNumberBooked) 
      setSeatsToBook(0)
    } catch (error) {
      console.error(error);
      setBookingResult({ error: 'An error occurred while booking the seats.' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="seatsToBook">Number of Seats:</label>
      <input
        type="number"
        id="seatsToBook"
        min='1'
        max='7'
        value={seatsToBook}
        onChange={(e) => setSeatsToBook(e.target.value)}
      />

      <button type="submit">Book Seats</button>

      {bookingResult.error && <p>{bookingResult.error}</p>}
      {bookingResult.SeatNumberBooked && <p>{bookingResult.SeatNumberBooked.map((num, i)=>{
        return <span key={i}>{num} </span>
      })} seats booked.</p>}
    </form>
  );
}

export default BookingForm;
