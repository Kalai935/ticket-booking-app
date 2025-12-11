import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Bus } from 'lucide-react';
import { format } from 'date-fns';

// USE YOUR DEPLOYED BACKEND URL HERE (OR localhost:5000 for dev)
// If you deployed, use: 'https://your-backend-url.onrender.com'
const API_URL = import.meta.env.VITE_API_URL || 'https://ticket-backend-j8o6.onrender.com';
interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
}

const ShowList = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/shows`)
      .then(res => setShows(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="logo">
          <Bus size={28} />
          <span>TicketGo</span>
        </Link>
        <div style={{ color: 'var(--text-muted)' }}>
          Welcome back
        </div>
      </header>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Where to next?</h1>
        <p style={{ color: 'var(--text-muted)' }}>Choose from our available trips below.</p>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>Loading trips...</div>
      ) : (
        <div className="grid-shows">
          {shows.map(show => (
            <div key={show.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <span style={{ 
                  background: '#e0e7ff', color: 'var(--primary)', 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600'
                }}>
                  Bus Trip
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {show.total_seats} seats
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{show.name}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  {format(new Date(show.start_time), 'EEEE, MMM d, yyyy')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} />
                  {format(new Date(show.start_time), 'h:mm a')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  <span>Main Station</span>
                </div>
              </div>

              <Link to={`/booking/${show.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  Select Seats <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowList;