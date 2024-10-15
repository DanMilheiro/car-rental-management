export interface Car {
  id?: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  miles: number;
  fuelLevel: number;
  status: 'available' | 'rented' | 'maintenance';
  customerName?: string;
  photos: string[];
  year: string;
}