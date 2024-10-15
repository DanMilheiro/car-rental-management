import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Reservation } from '../types';
import { Link } from 'react-router-dom';

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsCollection = collection(db, 'reservations');
        const activeReservationsQuery = query(reservationsCollection, where('status', 'in', ['upcoming', 'active']));
        const reservationsSnapshot = await getDocs(activeReservationsQuery);
        const reservationsList = reservationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Reservation));
        setReservations(reservationsList);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading reservations...</div>;
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
                <td className="border px-4 py-2">{reservation.carId}</td>
                <td className="border px-4 py-2">{reservation.startDate}</td>
                <td className="border px-4 py-2">{reservation.endDate}</td>
                <td className="border px-4 py-2">{reservation.status}</td>
                <td className="border px-4 py-2">
                  <Link to={`/edit-reservation/${reservation.id}`} className="text-blue-500 hover:text-blue-700 mr-2">
                    Edit
                  </Link>
                  <Link to={`/check-in-out/${reservation.carId}`} className="text-green-500 hover:text-green-700">
                    Check In/Out
                  </Link>
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