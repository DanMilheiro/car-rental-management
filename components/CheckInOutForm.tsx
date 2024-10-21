import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Car, CheckInOut } from '../types';
import { Camera } from 'lucide-react';

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
    photos: {
      exterior: [],
      interior: [],
      dashboard: '',
      windshield: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (carId) {
        try {
          const carDoc = await db.collection('vehicles').doc(carId).get();
          if (carDoc.exists) {
            const carData = carDoc.data() as Car;
            setCar({ id: carDoc.id, ...carData });
            setCheckInOut(prev => ({
              ...prev,
              mileage: carData.miles,
              fuelLevel: carData.fuelLevel,
            }));
          } else {
            setError(`Car not found with ID: ${carId}`);
          }
        } catch (err) {
          console.error('Error fetching car:', err);
          setError('Failed to fetch car details');
        } finally {
          setLoading(false);
        }
      } else {
        setError('No car ID provided');
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckInOut(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'exterior' | 'interior' | 'dashboard' | 'windshield') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'exterior' || type === 'interior') {
          setCheckInOut(prev => ({
            ...prev,
            photos: {
              ...prev.photos,
              [type]: [...prev.photos[type], reader.result as string],
            },
          }));
        } else {
          setCheckInOut(prev => ({
            ...prev,
            photos: {
              ...prev.photos,
              [type]: reader.result as string,
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.collection('checkInOuts').add(checkInOut);
      if (car) {
        await db.collection('vehicles').doc(car.id).update({
          status: checkInOut.type === 'check-out' ? 'rented' : 'available',
          miles: checkInOut.mileage,
          fuelLevel: checkInOut.fuelLevel,
        });
      }
      navigate('/cars');
    } catch (error) {
      console.error('Error processing check-in/out:', error);
      setError('Failed to process check-in/out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {checkInOut.type === 'check-out' ? 'Check Out' : 'Check In'}: {car?.make} {car?.model}
      </h2>

      {/* ... (other form fields remain the same) ... */}

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Exterior Photos (8)</label>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, index) => (
            <div key={`exterior-${index}`} className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'exterior')}
                className="hidden"
                id={`exterior-${index}`}
              />
              <label
                htmlFor={`exterior-${index}`}
                className="block w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500"
              >
                {checkInOut.photos.exterior[index] ? (
                  <img src={checkInOut.photos.exterior[index]} alt={`Exterior ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Interior Photos (2)</label>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(2)].map((_, index) => (
            <div key={`interior-${index}`} className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'interior')}
                className="hidden"
                id={`interior-${index}`}
              />
              <label
                htmlFor={`interior-${index}`}
                className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500"
              >
                {checkInOut.photos.interior[index] ? (
                  <img src={checkInOut.photos.interior[index]} alt={`Interior ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Dashboard Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, 'dashboard')}
          className="hidden"
          id="dashboard"
        />
        <label
          htmlFor="dashboard"
          className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500"
        >
          {checkInOut.photos.dashboard ? (
            <img src={checkInOut.photos.dashboard} alt="Dashboard" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Camera className="w-12 h-12 text-gray-400" />
          )}
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Windshield Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, 'windshield')}
          className="hidden"
          id="windshield"
        />
        <label
          htmlFor="windshield"
          className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500"
        >
          {checkInOut.photos.windshield ? (
            <img src={checkInOut.photos.windshield} alt="Windshield" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Camera className="w-12 h-12 text-gray-400" />
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
      >
        {loading ? 'Processing...' : `Process ${checkInOut.type === 'check-out' ? 'Check Out' : 'Check In'}`}
      </button>
    </form>
  );
};

export default CheckInOutForm;
