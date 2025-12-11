import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, Users, Type} from 'lucide-react';

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

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <header className="header">
        <h1 style={{ fontSize: '1.8rem' }}>Admin Dashboard</h1>
        <Link to="/" className="btn" style={{ background: '#e2e8f0', color: 'black' }}>
          Go to User View
        </Link>
      </header>

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