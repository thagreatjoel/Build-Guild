import { useState } from 'react';
import axios from 'axios';

const ManualRegister = ({ token, onRegister }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/manual-register', formData, {
        headers: { 'x-auth-token': token },
      });
      setMessage(res.data.msg);
      setError('');
      setFormData({ name: '', email: '', phone: '' });
      onRegister();
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setMessage('');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Manual Walk-in Registration</h2>
      {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input type="text" name="name" placeholder="Name *" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <input type="email" name="email" placeholder="Email *" required value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <input type="tel" name="phone" placeholder="Phone (optional)" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register Walk-in</button>
      </form>
    </div>
  );
};

export default ManualRegister;
