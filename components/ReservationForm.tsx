import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation, Car } from '../types';

const ReservationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation>({
    carId: '',
    customerName: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
  });
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      const carsCollection = collection(db, 'vehicles');
      const carsSnapshot = await getDocs(carsCollection);
      const carsList = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
      setCars(carsList);
    };

    fetchCars();

    if (id) {
      const fetchReservation = async () => {
        const reservationDoc = await getDoc(doc(db, 'reservations', id));
        if (reservationDoc.exists()) {
          setReservation({ id: reservationDoc.id, ...reservationDoc.data() } as Reservation);
        }
      };
      fetchReservation();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReservation(prevReservation => ({ ...prevReservation, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateDoc(doc(db, 'reservations', id), reservation);
      } else {
        await addDoc(collection(db, 'reservations'), reservation);
      }
      navigate('/reservations');
    } catch (error) {
      console.error('Error saving reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Reservation' : 'Add New Reservation'}</h2>
      <div className="mb-4">
        <label htmlFor="carId" className="block text-gray-700 font-bold mb-2">Car</label>
        <select
          id="carId"
          name="carId"
          value={reservation.carId}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        >
          <option value="">Select a car</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>
              {car.make} {car.model} ({car.licensePlate})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="customerName" className="block text-gray-700 font-bold mb-2">Customer Name</label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={reservation.customerName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="startDate" className="block text-gray-700 font-bold mb-2">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={reservation.startDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="endDate" className="block text-gray-700 font-bold mb-2">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={reservation.endDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          id="status"
          name="status"
          value={reservation.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
        {loading ? 'Saving...' : (id ? 'Update Reservation' : 'Add Reservation')}
      </button>
    </form>
  );
};

export default ReservationForm;