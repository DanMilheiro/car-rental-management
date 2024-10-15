import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CarList from './components/CarList';
import CarForm from './components/CarForm';
import CarDetails from './components/CarDetails';

function App() {
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
        </Routes>
      </div>
    </div>
  );
}

export default App;