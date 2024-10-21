import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, ClipboardList, Clock } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">Car Rental Manager</span>
          </Link>
          <div className="flex space-x-4">
            <NavLink to="/" icon={<ClipboardList className="h-5 w-5" />} text="Dashboard" />
            <NavLink to="/cars" icon={<Car className="h-5 w-5" />} text="Cars" />
            <NavLink to="/reservations" icon={<Calendar className="h-5 w-5" />} text="Reservations" />
            <NavLink to="/history" icon={<Clock className="h-5 w-5" />} text="History" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; text: string }> = ({ to, icon, text }) => (
  <Link to={to} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default Navbar;
