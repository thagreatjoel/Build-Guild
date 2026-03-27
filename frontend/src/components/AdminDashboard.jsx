import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatsCards from './StatsCards';
import Scanner from './Scanner';
import ManualRegister from './ManualRegister';
import UserList from './UserList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchStats();
  }, [token, navigate]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { 'x-auth-token': token },
      });
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin');
    }
  };

  const onCheckinSuccess = () => {
    fetchStats();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <StatsCards total={stats.total} checkedIn={stats.checkedIn} />
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <Scanner token={token} onSuccess={onCheckinSuccess} />
        </div>
        <div>
          <ManualRegister token={token} onRegister={fetchStats} />
        </div>
      </div>
      <div className="mt-8">
        <UserList token={token} />
      </div>
    </div>
  );
};

export default AdminDashboard;
