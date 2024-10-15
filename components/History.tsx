import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckInOut, Car } from '../types';

const History: React.FC = () => {
  const [history, setHistory] = useState<(CheckInOut & { car?: Car })[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('guestName');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cars
        const carsCollection = collection(db, 'vehicles');
        const carsSnapshot = await getDocs(carsCollection);
        const carsData = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        setCars(carsData);

        // Fetch check-in/out history
        const historyCollection = collection(db, 'checkInOuts');
        const historyQuery = query(historyCollection, orderBy('date', 'desc'));
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckInOut));

        // Combine history with car data
        const combinedHistory = historyData.map(item => ({
          ...item,
          car: carsData.find(car => car.id === item.carId)
        }));

        setHistory(combinedHistory);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredHistory = history.filter(item => {
    if (!filter) return true;
    const lowerFilter = filter.toLowerCase();
    switch (filterType) {
      case 'guestName':
        return item.car?.customerName?.toLowerCase().includes(lowerFilter);
      case 'vin':
        return item.car?.vin.toLowerCase().includes(lowerFilter);
      case 'plate':
        return item.car?.licensePlate.toLowerCase().includes(lowerFilter);
      case 'model':
        return `${item.car?.make} ${item.car?.model}`.toLowerCase().includes(lowerFilter);
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Check-in/out History</h1>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 mr-2"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="guestName">Guest Name</option>
          <option value="vin">VIN</option>
          <option value="plate">License Plate</option>
          <option value="model">Make/Model</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Car</th>
              <th className="px-4 py-2 text-left">Guest Name</th>
              <th className="px-4 py-2 text-left">Mileage</th>
              <th className="px-4 py-2 text-left">Fuel Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{item.type === 'check-in' ? 'Check-in' : 'Check-out'}</td>
                <td className="border px-4 py-2">{item.car ? `${item.car.make} ${item.car.model}` : 'N/A'}</td>
                <td className="border px-4 py-2">{item.car?.customerName || 'N/A'}</td>
                <td className="border px-4 py-2">{item.mileage}</td>
                <td className="border px-4 py-2">{item.fuelLevel}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;