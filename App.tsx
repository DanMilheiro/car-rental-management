import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CarList from './components/CarList';
import CarForm from './components/CarForm';
import CarDetails from './components/CarDetails';
import ReservationList from './components/ReservationList';
import ReservationForm from './components/ReservationForm';
import CheckInOutForm from './components/CheckInOutForm';
import History from './components/History';
import { db } from './firebase';

// Add some initial mock data
const initMockData = async () => {
  const mockCars = [
    { make: 'Toyota', model: 'Camry', year: '2022', vin: 'ABC123', licensePlate: 'XYZ789', miles: 15000, fuelLevel: 75, status: 'available' },
    { make: 'Honda', model: 'Civic', year: '2021', vin: 'DEF456', licensePlate: 'LMN456', miles: 20000, fuelLevel: 50, status: 'rented' },
    { make: 'Ford', model: 'F-150', year: '2023', vin: 'GHI789', licensePlate: 'PQR789', miles: 5000, fuelLevel: 90, status: 'available' },
  ];

  const mockReservations = [
    { carId: 'DEF456', customerName: 'John Doe', startDate: '2023-05-20', endDate: '2023-05-25', status: 'active' },
    { carId: 'ABC123', customerName: 'Jane Smith', startDate: '2023-06-01', endDate: '2023-06-05', status: 'upcoming' },
  ];

  for (const car of mockCars) {
    await db.collection('vehicles').add(car);
  }

  for (const reservation of mockReservations) {
    await db.collection('reservations').add(reservation);
  }
};

function App() {
  useEffect(() => {
    initMockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cars" element={<CarList />} />
          <Route path="/add" element={<CarForm />} />
          <Route path="/edit/:id" element={<CarForm />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/reservations" element={<ReservationList />} />
          <Route path="/add-reservation" element={<ReservationForm />} />
          <Route path="/edit-reservation/:id" element={<ReservationForm />} />
          <Route path="/check-in-out/:carId" element={<CheckInOutForm />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
