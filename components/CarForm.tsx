import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Car } from '../types';

const CarForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car>({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    status: 'available',
    fuelLevel: 100,
    miles: 0,
    photos: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCar = async () => {
        const carDoc = await db.collection('vehicles').doc(id).get();
        if (carDoc.exists) {
          setCar({ id: carDoc.id, ...carDoc.data() } as Car);
        }
      };
      fetchCar();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCar(prevCar => ({ ...prevCar, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await db.collection('vehicles').doc(id).update(car);
      } else {
        await db.collection('vehicles').add(car);
      }
      navigate('/cars');
    } catch (error) {
      console.error('Error saving car:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Car' : 'Add New Car'}</h2>
      <div className="mb-4">
        <label htmlFor="make" className="block text-gray-700 font-bold mb-2">Make</label>
        <input
          type="text"
          id="make"
          name="make"
          value={car.make}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="model" className="block text-gray-700 font-bold mb-2">Model</label>
        <input
          type="text"
          id="model"
          name="model"
          value={car.model}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year</label>
        <input
          type="text"
          id="year"
          name="year"
          value={car.year}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="licensePlate" className="block text-gray-700 font-bold mb-2">License Plate</label>
        <input
          type="text"
          id="licensePlate"
          name="licensePlate"
          value={car.licensePlate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="vin" className="block text-gray-700 font-bold mb-2">VIN</label>
        <input
          type="text"
          id="vin"
          name="vin"
          value={car.vin}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          id="status"
          name="status"
          value={car.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="fuelLevel" className="block text-gray-700 font-bold mb-2">Fuel Level (%)</label>
        <input
          type="number"
          id="fuelLevel"
          name="fuelLevel"
          value={car.fuelLevel}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="miles" className="block text-gray-700 font-bold mb-2">Miles</label>
        <input
          type="number"
          id="miles"
          name="miles"
          value={car.miles}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
        {loading ? 'Saving...' : (id ? 'Update Car' : 'Add Car')}
      </button>
    </form>
  );
};

export default CarForm;
