import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Bus, Search } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
}

const ShowList = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // NEW STATE

  useEffect(() => {
    axios.get(`${API_URL}/api/shows`)
      .then(res => setShows(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // FILTER LOGIC
  const filteredShows = shows.filter(show => 
    show.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="logo">
          <Bus size={28} />
          <span>TicketGo</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Admin Login</Link>
        </div>
      </header>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Where to next?</h1>
            <p style={{ color: 'var(--text-muted)' }}>Choose from our available trips below.</p>
        </div>
        
        {/* NEW SEARCH BAR */}
        <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
                type="text" 
                placeholder="Search buses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                    padding: '12px 12px 12px 40px', 
                    borderRadius: '30px', 
                    border: '1px solid #e2e8f0', 
                    width: '300px',
                    outline: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
            />
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>Loading trips...</div>
      ) : (
        <div className="grid-shows">
          {filteredShows.length > 0 ? filteredShows.map(show => (
            <div key={show.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <span style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                  Bus Trip
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{show.total_seats} seats</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{show.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} /> {format(new Date(show.start_time), 'EEEE, MMM d, yyyy')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> {format(new Date(show.start_time), 'h:mm a')}
                </div>
              </div>
              <Link to={`/booking/${show.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>Select Seats <ArrowRight size={18} /></button>
              </Link>
            </div>
          )) : <p>No trips found matching "{searchTerm}"</p>}
        </div>
      )}
    </div>
  );
};

export default ShowList;