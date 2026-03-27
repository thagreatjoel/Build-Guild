import { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/user/register', formData);
      setMessage(res.data.msg);
      setError('');
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Register for Event</h2>
      {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Name *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email *</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone (optional)</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
