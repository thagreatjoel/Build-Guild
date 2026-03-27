import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ResendQR from './components/ResendQR';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex justify-between">
            <Link to="/" className="font-bold text-xl">Event Check-in</Link>
            <div>
              <Link to="/" className="mr-4">Register</Link>
              <Link to="/resend-qr" className="mr-4">Resend QR</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/resend-qr" element={<ResendQR />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
