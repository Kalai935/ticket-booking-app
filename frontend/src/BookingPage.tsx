import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Check, X, Loader2, Clock } from 'lucide-react';

// USE YOUR DEPLOYED BACKEND URL HERE
const API_URL = 'https://ticket-backend-j8o6.onrender.com';

const BookingPage = () => {
  const { id } = useParams();
  const [totalSeats, setTotalSeats] = useState(0);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  
  // TIMER STATE
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds = 2 minutes

  // Status can be: 'idle', 'processing', 'success', 'conflict', 'error'
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  
  const [userId] = useState(Math.floor(Math.random() * 10000));

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const showRes = await axios.get(`${API_URL}/api/shows`);
        const show = showRes.data.find((s: any) => s.id === Number(id));
        if (show) setTotalSeats(show.total_seats);
      } catch (err) { console.error(err); }
    };

    const fetchSeats = async () => {
      try {
        if (status !== 'processing') {
           const seatRes = await axios.get(`${API_URL}/api/shows/${id}/seats`);
           setBookedSeats(seatRes.data);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };

    fetchShowDetails();
    fetchSeats(); 

    // POLLING: Fetch seats every 3 seconds
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, [id, status]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timerId: any;

    if (selectedSeats.length > 0 && timeLeft > 0) {
      // If seats are selected, tick down
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (selectedSeats.length === 0) {
      // If no seats selected, reset timer
      setTimeLeft(120);
    }

    // Handle Expiry
    if (timeLeft === 0) {
      alert("Session Expired! Please select your seats again.");
      setSelectedSeats([]); // Clear selection
      setTimeLeft(120); // Reset timer
    }

    return () => clearInterval(timerId);
  }, [selectedSeats, timeLeft]);

  // Helper to format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  // -------------------

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
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setStatus('conflict');
        const seatRes = await axios.get(`${API_URL}/api/shows/${id}/seats`);
        setBookedSeats(seatRes.data);
        setSelectedSeats([]);
      } else {
        setStatus('error');
      }
    }
  };

  const closePopup = () => setStatus('idle');

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      {/* SUCCESS POPUP */}
      {status === 'success' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '0', overflow: 'hidden', border: 'none' }}>
            <div style={{ background: 'var(--success)', color: 'white', padding: '20px' }}>
              <Check size={40} style={{ margin: '0 auto 10px' }} />
              <h2 style={{ margin: 0 }}>Booking Confirmed!</h2>
            </div>
            <div style={{ padding: '30px', textAlign: 'left' }}>
              <div style={{ borderBottom: '2px dashed #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Passenger ID</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>#USER-{userId}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SEATS</p>
                  <p style={{ fontWeight: 'bold' }}>{selectedSeats.join(', ')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL</p>
                  <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>${selectedSeats.length * 25}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center' }}>
                Present this digital ticket at the boarding station.
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/'} 
              className="btn btn-primary" 
              style={{ width: '100%', borderRadius: 0 }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* CONFLICT POPUP */}
      {status === 'conflict' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <X size={40} strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Too Late!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Someone just booked these seats.
            </p>
            <button className="btn btn-primary" onClick={closePopup} style={{ width: '100%' }}>
              Try Again
            </button>
          </div>
        </div>
      )}

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
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', 
        justifyContent: 'center', margin: '0 auto', maxWidth: '300px'
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

      {/* FOOTER WITH WORKING TIMER */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'white', borderTop: '1px solid #e2e8f0', padding: '20px',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 500
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', margin: 0 }}>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Price</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${selectedSeats.length * 25}</div>
            </div>
            
            {/* REAL TIMER BADGE */}
            {selectedSeats.length > 0 && (
                <div style={{ 
                  background: '#fef2f2', color: '#ef4444', 
                  padding: '6px 14px', borderRadius: '20px', 
                  fontSize: '0.9rem', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: '1px solid #fecaca'
                }}>
                   <Clock size={14} /> {formatTime(timeLeft)}
                </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             {selectedSeats.length > 0 && (
                <button onClick={() => setSelectedSeats([])} className="btn" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  Clear
                </button>
              )}
              
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
      </div>
      
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default BookingPage;