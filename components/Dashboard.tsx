import React, { useState, useEffect } from 'react';
import { db, query, where } from '../firebase';
import { Car, Reservation } from '../types';
import { Link } from 'react-router-dom';
import { Car as CarIcon, UserCheck, CheckCircle, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, rented: 0, available: 0, reservations: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const vehiclesCollection = db.collection('vehicles');
        const vehiclesSnapshot = await vehiclesCollection.get();
        const vehicles = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        
        const reservationsCollection = db.collection('reservations');
        const activeReservationsQuery = query('reservations', [where('status', 'in', ['upcoming', 'active'])]);
        const reservationsSnapshot = await activeReservationsQuery.get();
        
        setStats({
          total: vehicles.length,
          rented: vehicles.filter(car => car.status === 'rented').length,
          available: vehicles.filter(car => car.status === 'available').length,
          reservations: reservationsSnapshot.docs.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to fetch dashboard data. Please try again later.');
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Fleet" value={stats.total} icon={<CarIcon className="h-8 w-8" />} color="bg-blue-100 text-blue-800" />
        <StatCard title="Rented" value={stats.rented} icon={<UserCheck className="h-8 w-8" />} color="bg-yellow-100 text-yellow-800" />
        <StatCard title="Available" value={stats.available} icon={<CheckCircle className="h-8 w-8" />} color="bg-green-100 text-green-800" />
        <StatCard title="Active Reservations" value={stats.reservations} icon={<Calendar className="h-8 w-8" />} color="bg-purple-100 text-purple-800" />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <Link to="/add" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Add New Car
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link to="/cars" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">View All Cars</h3>
          <p className="text-gray-600">See the complete list of cars in your fleet</p>
        </Link>
        <Link to="/reservations" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Manage Reservations</h3>
          <p className="text-gray-600">View and manage all current reservations</p>
        </Link>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-lg shadow p-6 flex items-center`}>
    <div className="mr-4">{icon}</div>
    <div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-sm">{title}</p>
    </div>
  </div>
);

export default Dashboard;
