import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Check, X, Loader2 } from 'lucide-react';

// USE YOUR DEPLOYED BACKEND URL HERE
const API_URL = import.meta.env.VITE_API_URL || 'https://ticket-backend-j8o6.onrender.com';
const BookingPage = () => {
  const { id } = useParams();
  const [totalSeats, setTotalSeats] = useState(0);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  
  // Status can be: 'idle', 'processing', 'success', 'conflict', 'error'
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  
  const [userId] = useState(Math.floor(Math.random() * 10000));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const showRes = await axios.get(`${API_URL}/api/shows`);
        const show = showRes.data.find((s: any) => s.id === Number(id));
        if (show) setTotalSeats(show.total_seats);

        const seatRes = await axios.get(`${API_URL}/api/shows/${id}/seats`);
        setBookedSeats(seatRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleSeat = (seatNum: number) => {
    if (bookedSeats.includes(seatNum)) return;
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  const handleBooking = async () => {
    setStatus('processing');
    try {
      await axios.post(`${API_URL}/api/bookings`, {
        show_id: id,
        user_id: userId,
        seat_numbers: selectedSeats
      });
      setStatus('success');
      // Wait 2 seconds so user sees the success popup, then reload
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setStatus('conflict');
        // Refresh seats immediately behind the popup
        const seatRes = await axios.get(`${API_URL}/api/shows/${id}/seats`);
        setBookedSeats(seatRes.data);
        setSelectedSeats([]); // Clear selection
      } else {
        setStatus('error');
      }
    }
  };

  const closePopup = () => {
    setStatus('idle');
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      {/* --- POPUPS START --- */}
      
      {/* 1. SUCCESS POPUP */}
      {status === 'success' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Your seats have been successfully reserved. Enjoy your trip!
            </p>
          </div>
        </div>
      )}

      {/* 2. CONFLICT POPUP (Double Booking) */}
      {status === 'conflict' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <X size={40} strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Too Late!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Someone just booked these seats while you were choosing. Please select different seats.
            </p>
            <button className="btn btn-primary" onClick={closePopup} style={{ width: '100%' }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* --- POPUPS END --- */}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ChevronLeft size={20} /> Back
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Select Seats</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Tap on the seats you want to book.</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ width: '20px', height: '20px', background: 'var(--seat-available)', borderRadius: '4px' }}></div> Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '4px' }}></div> Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ width: '20px', height: '20px', background: 'var(--seat-booked)', borderRadius: '4px' }}></div> Booked
        </div>
      </div>

      <div style={{ 
        height: '6px', background: 'linear-gradient(to right, transparent, var(--primary), transparent)', 
        opacity: 0.3, marginBottom: '30px', borderRadius: '10px' 
      }}></div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        justifyContent: 'center',
        margin: '0 auto',
        maxWidth: '300px'
      }}>
        {!loading && Array.from({ length: totalSeats }).map((_, i) => {
          const seatNum = i + 1;
          const isBooked = bookedSeats.includes(seatNum);
          const isSelected = selectedSeats.includes(seatNum);
          const style = i % 4 === 1 ? { marginRight: '20px' } : {};

          return (
            <button
              key={seatNum}
              onClick={() => toggleSeat(seatNum)}
              disabled={isBooked}
              className="seat"
              style={{
                ...style,
                backgroundColor: isBooked ? 'var(--seat-booked)' : isSelected ? 'var(--primary)' : 'var(--seat-available)',
                color: isBooked ? '#666' : isSelected ? 'white' : 'var(--text-main)',
                cursor: isBooked ? 'not-allowed' : 'pointer',
                animationDelay: `${i * 0.02}s`
              }}
            >
              {seatNum}
            </button>
          );
        })}
      </div>

      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'white', borderTop: '1px solid #e2e8f0', padding: '20px',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 500
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', margin: 0 }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Price</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${selectedSeats.length * 25}</div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || status === 'processing'}
            style={{ padding: '12px 30px' }}
          >
            {status === 'processing' ? (
              <> <Loader2 className="animate-spin" size={20} /> Booking... </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
      
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default BookingPage;