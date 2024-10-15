import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Car } from '../types';

const CarList: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const vehiclesCollection = collection(db, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesCollection);
        const carsList = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || 'available',
          fuelLevel: doc.data().fuelLevel || 0,
          photos: doc.data().photos || [],
        } as Car));
        setCars(carsList);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setError('Failed to fetch cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Car Inventory</h1>
      {cars.length === 0 ? (
        <p className="text-center">No cars found in the inventory.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Link key={car.id} to={`/car/${car.id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <img src={car.photos[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover rounded-t-lg" />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    car.status === 'available' ? 'bg-green-100 text-green-800' :
                    car.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {car.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
                <p className="text-gray-600 mb-2">License Plate: {car.licensePlate}</p>
                <p className="text-gray-600">Fuel: {car.fuelLevel}%</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarList;