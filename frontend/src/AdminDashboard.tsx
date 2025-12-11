import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Users, Type, TrendingUp, DollarSign } from 'lucide-react';
const API_URL = 'https://ticket-backend-j8o6.onrender.com';

interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
}

const AdminDashboard = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    total_seats: 40
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shows`);
      setShows(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  

// Helper to get current local time for the "min" attribute
const getCurrentDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await axios.post(`${API_URL}/api/shows`, formData);
      setStatus('success');
      setFormData({ name: '', start_time: '', total_seats: 40 });
      fetchShows(); // Refresh list
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      setStatus('error');

    }
  };
  const totalTrips = shows.length;
  const totalCapacity = shows.reduce((acc, show) => acc + show.total_seats, 0);
  // Mocking revenue for demo purposes (since we don't fetch all bookings here to save bandwidth)
  const estimatedRevenue = totalCapacity * 25;
  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <header className="header">
        <h1 style={{ fontSize: '1.8rem' }}>Admin Dashboard</h1>
        <Link to="/" className="btn" style={{ background: '#e2e8f0', color: 'black' }}>Go to User View</Link>
      </header>
      {/* NEW STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><TrendingUp size={24} /></div>
            <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Trips</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalTrips}</h3>
            </div>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '50%', color: '#16a34a' }}><Users size={24} /></div>
            <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Capacity</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalCapacity}</h3>
            </div>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '50%', color: '#d97706' }}><DollarSign size={24} /></div>
            <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Potential Revenue</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>${estimatedRevenue}</h3>
            </div>
        </div>
      </div>
      {/* CREATE FORM */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PlusCircle size={24} color="var(--primary)" /> Create New Trip
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
              <Type size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Trip Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Morning Bus to City"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Start Time
              </label>
              <input 
                type="datetime-local" 
                required
                min={getCurrentDateTime()}
                value={formData.start_time}
                onChange={e => setFormData({...formData, start_time: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                <Users size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> Total Seats
              </label>
              <input 
                type="number" 
                required
                min={10}
                max={60}
                value={formData.total_seats}
                onChange={e => setFormData({...formData, total_seats: Number(e.target.value)})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Creating...' : 'Create Show'}
          </button>
          
          {status === 'success' && <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Trip Created Successfully!</p>}
          {status === 'error' && <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Error Creating Trip</p>}
        </form>
      </div>

      {/* SHOW LIST */}
      <h2 style={{ marginBottom: '20px' }}>Existing Trips</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {shows.map(show => (
          <div key={show.id} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{show.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {new Date(show.start_time).toLocaleString()} • {show.total_seats} Seats
              </p>
            </div>
            <Link to={`/booking/${show.id}`} className="btn" style={{ fontSize: '0.8rem', padding: '8px 12px', background: '#f1f5f9' }}>
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;