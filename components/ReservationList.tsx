import React, { useState, useEffect } from 'react';
import { db, query, where } from '../firebase';
import { Reservation, Car } from '../types';
import { Link } from 'react-router-dom';
import { Edit, CheckSquare, AlertCircle } from 'lucide-react';

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<(Reservation & { car?: Car })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsCollection = db.collection('reservations');
        const activeReservationsQuery = query('reservations', [where('status', 'in', ['upcoming', 'active'])]);
        const reservationsSnapshot = await activeReservationsQuery.get();
        const reservationsList = reservationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Reservation));

        // Fetch car details for each reservation
        const reservationsWithCars = await Promise.all(
          reservationsList.map(async (reservation) => {
            const carDoc = await db.collection('vehicles').doc(reservation.carId).get();
            const carData = carDoc.data() as Car;
            return { ...reservation, car: carData };
          })
        );

        setReservations(reservationsWithCars);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError('Failed to fetch reservations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading reservations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Reservations</h1>
      <Link to="/add-reservation" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        Add New Reservation
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Car</th>
              <th className="px-4 py-2 text-left">Start Date</th>
              <th className="px-4 py-2 text-left">End Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="border px-4 py-2">{reservation.customerName}</td>
                <td className="border px-4 py-2">
                  {reservation.car ? `${reservation.car.make} ${reservation.car.model}` : 'Loading...'}
                </td>
                <td className="border px-4 py-2">{reservation.startDate}</td>
                <td className="border px-4 py-2">{reservation.endDate}</td>
                <td className="border px-4 py-2">{reservation.status}</td>
                <td className="border px-4 py-2">
                  <div className="flex space-x-2">
                    <Link to={`/edit-reservation/${reservation.id}`} className="text-blue-500 hover:text-blue-700">
                      <Edit className="h-5 w-5" />
                    </Link>
                    {reservation.car && reservation.car.id ? (
                      <Link 
                        to={`/check-in-out/${reservation.car.id}`} 
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded flex items-center"
                      >
                        <CheckSquare className="h-5 w-5 mr-1" />
                        Check In/Out
                      </Link>
                    ) : (
                      <span className="text-red-500 flex items-center" title="Car not available">
                        <AlertCircle className="h-5 w-5 mr-1" />
                        No Car
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationList;
