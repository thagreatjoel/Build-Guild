import { useEffect, useState } from 'react';
import axios from 'axios';

const UserList = ({ token }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Checked In', 'Checked In At', 'Registered At'];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.phone,
      u.checkedIn ? 'Yes' : 'No',
      u.checkedInAt ? new Date(u.checkedInAt).toLocaleString() : '',
      new Date(u.createdAt).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Attendees</h2>
        <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Checked In At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.phone}</td>
                <td className="border p-2">{user.checkedIn ? '✅ Checked In' : '❌ Not Checked In'}</td>
                <td className="border p-2">{user.checkedInAt ? new Date(user.checkedInAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
