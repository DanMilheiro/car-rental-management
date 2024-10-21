import React, { useState, useEffect } from 'react';
import { db, query, orderBy } from '../firebase';
import { CheckInOut, Car } from '../types';
import { Camera } from 'lucide-react';

const History: React.FC = () => {
  const [history, setHistory] = useState<(CheckInOut & { car?: Car })[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('guestName');
  const [selectedItem, setSelectedItem] = useState<CheckInOut | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cars
        const carsCollection = db.collection('vehicles');
        const carsSnapshot = await carsCollection.get();
        const carsData = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        setCars(carsData);

        // Fetch check-in/out history
        const historyCollection = db.collection('checkInOuts');
        const historyQuery = query('checkInOuts', [], 'date');
        const historySnapshot = await historyQuery.get();
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
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <th className="px-4 py-2 text-left">Photos</th>
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
                <td className="border px-4 py-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    View Photos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4">Photos for {selectedItem.car?.make} {selectedItem.car?.model} ({selectedItem.type})</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Exterior Photos</h3>
                <div className="grid grid-cols-4 gap-2">
                  {selectedItem.photos.exterior.map((photo, index) => (
                    <img key={index} src={photo} alt={`Exterior ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interior Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItem.photos.interior.map((photo, index) => (
                    <img key={index} src={photo} alt={`Interior ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Dashboard</h3>
                  <img src={selectedItem.photos.dashboard} alt="Dashboard" className="w-full h-32 object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Windshield</h3>
                  <img src={selectedItem.photos.windshield} alt="Windshield" className="w-full h-32 object-cover rounded-lg" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
