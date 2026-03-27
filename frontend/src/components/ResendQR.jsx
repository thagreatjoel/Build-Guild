import { useState } from 'react';
import axios from 'axios';

const ResendQR = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/user/resend-qr', { email });
      setMessage(res.data.msg);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to resend QR');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Resend QR Code</h2>
      {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Resend QR</button>
      </form>
    </div>
  );
};

export default ResendQR;
