import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" name="email" required value={credentials.email} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input type="password" name="password" required value={credentials.password} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
