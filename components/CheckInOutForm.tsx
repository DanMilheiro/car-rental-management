import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Car, CheckInOut } from '../types';

const CheckInOutForm: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [checkInOut, setCheckInOut] = useState<CheckInOut>({
    carId: carId || '',
    type: 'check-out',
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    fuelLevel: 100,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (carId) {
        const carDoc = await getDoc(doc(db, 'vehicles', carId));
        if (carDoc.exists()) {
          setCar({ id: carDoc.id, ...carDoc.data() } as Car);
          setCheckInOut(prev => ({
            ...prev,
            mileage: carDoc.data().miles,
            fuelLevel: carDoc.data().fuelLevel,
          }));
        }
      }
    };
    fetchCar();
  }, [carId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckInOut(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add check-in/out record
      await addDoc(collection(db, 'checkInOuts'), checkInOut);

      // Update car status and details
      if (car && car.id) {
        const carRef = doc(db, 'vehicles', car.id);
        await updateDoc(carRef, {
          status: checkInOut.type === 'check-out' ? 'rented' : 'available',
          miles: checkInOut.mileage,
          fuelLevel: checkInOut.fuelLevel,
        });
      }

      navigate('/cars');
    } catch (error) {
      console.error('Error processing check-in/out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!car) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Check In/Out: {car.make} {car.model}</h2>
      <div className="mb-4">
        <label htmlFor="type" className="block text-gray-700 font-bold mb-2">Type</label>
        <select
          id="type"
          name="type"
          value={checkInOut.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        >
          <option value="check-out">Check Out</option>
          <option value="check-in">Check In</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-bold mb-2">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={checkInOut.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="mileage" className="block text-gray-700 font-bold mb-2">Mileage</label>
        <input
          type="number"
          id="mileage"
          name="mileage"
          value={checkInOut.mileage}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="fuelLevel" className="block text-gray-700 font-bold mb-2">Fuel Level (%)</label>
        <input
          type="number"
          id="fuelLevel"
          name="fuelLevel"
          value={checkInOut.fuelLevel}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="notes" className="block text-gray-700 font-bold mb-2">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={checkInOut.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          rows={3}
        ></textarea>
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
        {loading ? 'Processing...' : `Process ${checkInOut.type === 'check-out' ? 'Check Out' : 'Check In'}`}
      </button>
    </form>
  );
};

export default CheckInOutForm;