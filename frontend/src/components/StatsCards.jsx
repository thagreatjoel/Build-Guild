const StatsCards = ({ total, checkedIn }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow text-center">
        <h3 className="text-gray-500">Total Registered</h3>
        <p className="text-3xl font-bold">{total}</p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <h3 className="text-gray-500">Checked In</h3>
        <p className="text-3xl font-bold">{checkedIn}</p>
      </div>
    </div>
  );
};

export default StatsCards;
