import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { Car } from '../types';
import { Calendar, Fuel, User, CheckSquare } from 'lucide-react';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      if (id) {
        const carDoc = await db.collection('vehicles').doc(id).get();
        if (carDoc.exists) {
          setCar({ id: carDoc.id, ...carDoc.data() } as Car);
        }
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!car) {
    return <div className="text-center">Car not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:w-48" 
            src={car.photos && car.photos.length > 0 ? car.photos[0] : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'} 
            alt={`${car.make} ${car.model}`} 
          />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{car.make} {car.model} ({car.year})</div>
          <p className="mt-2 text-gray-500">VIN: {car.vin}</p>
          <p className="mt-2 text-gray-500">License Plate: {car.licensePlate}</p>
          <div className="mt-4 flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-gray-600">{car.miles} miles</p>
          </div>
          <div className="mt-2 flex items-center">
            <Fuel className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-gray-600">Fuel Level: {car.fuelLevel}%</p>
          </div>
          <div className="mt-2 flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-gray-600">Status: {car.status}</p>
          </div>
          <div className="mt-6 flex space-x-3">
            <Link to={`/edit/${car.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Edit
            </Link>
            <Link to={`/check-in-out/${car.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              Check In/Out
            </Link>
            <Link to="/cars" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
