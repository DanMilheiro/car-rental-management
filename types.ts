export interface Car {
  id?: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  licensePlate: string;
  miles: number;
  fuelLevel: number;
  status: 'available' | 'rented' | 'maintenance';
  customerName?: string;
  photos?: string[];
}

export interface Reservation {
  id?: string;
  carId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface CheckInOut {
  id?: string;
  carId: string;
  type: 'check-in' | 'check-out';
  date: string;
  mileage: number;
  fuelLevel: number;
  notes: string;
  photos: {
    exterior: string[];
    interior: string[];
    dashboard: string;
    windshield: string;
  };
}
