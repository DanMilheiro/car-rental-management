import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">Car Rental Manager</span>
          </Link>
          <div>
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Dashboard
            </Link>
            <Link to="/cars" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Cars
            </Link>
            <Link to="/add" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Add Car
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;