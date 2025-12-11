import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ShowList from './ShowList';
import BookingPage from './BookingPage';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <nav style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
          <Link to="/" style={{ marginRight: 20 }}>Home (Shows)</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<ShowList />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;