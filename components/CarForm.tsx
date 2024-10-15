import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Car } from '../types';

const CarForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car>({
    make: '',
    model: '',
    vin: '',
    licensePlate: '',
    miles: 0,
    fuelLevel: 100,
    status: 'available',
    customerName: '',
    photos: [],
    year: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCar = async () => {
        const carDoc = await getDoc(doc(db, 'vehicles', id));
        if (carDoc.exists()) {
          setCar({ id: carDoc.id, ...carDoc.data() } as Car);
        }
      };
      fetchCar();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCar(prevCar => ({ ...prevCar, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const uploadPhotos = async () => {
    const uploadedUrls = [];
    for (const photo of photos) {
      const photoRef = ref(storage, `car-photos/${car.vin}-${Date.now()}`);
      await uploadBytes(photoRef, photo);
      const url = await getDownloadURL(photoRef);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let carData = { ...car };
      if (photos.length > 0) {
        const newPhotoUrls = await uploadPhotos();
        carData.photos = [...carData.photos, ...newPhotoUrls];
      }

      if (id) {
        await updateDoc(doc(db, 'vehicles', id), carData);
      } else {
        await addDoc(collection(db, 'vehicles'), carData);
      }
      navigate('/cars');
    } catch (error) {
      console.error('Error saving car:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this car?')) {
      setLoading(true);
      try {
        // Delete photos from storage
        for (const photoUrl of car.photos) {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        }
        // Delete car document
        await deleteDoc(doc(db, 'vehicles', id));
        navigate('/cars');
      } catch (error) {
        console.error('Error deleting car:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Car' : 'Add New Car'}</h2>
      <div className="mb-4">
        <label htmlFor="make" className="block text-gray-700 font-bold mb-2">Make</label>
        <input
          type="text"
          id="make"
          name="make"
          value={car.make}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="model" className="block text-gray-700 font-bold mb-2">Model</label>
        <input
          type="text"
          id="model"
          name="model"
          value={car.model}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year</label>
        <input
          type="text"
          id="year"
          name="year"
          value={car.year}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="vin" className="block text-gray-700 font-bold mb-2">VIN</label>
        <input
          type="text"
          id="vin"
          name="vin"
          value={car.vin}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="licensePlate" className="block text-gray-700 font-bold mb-2">License Plate</label>
        <input
          type="text"
          id="licensePlate"
          name="licensePlate"
          value={car.licensePlate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="miles" className="block text-gray-700 font-bold mb-2">Miles</label>
        <input
          type="number"
          id="miles"
          name="miles"
          value={car.miles}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="fuelLevel" className="block text-gray-700 font-bold mb-2">Fuel Level (%)</label>
        <input
          type="number"
          id="fuelLevel"
          name="fuelLevel"
          value={car.fuelLevel}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          id="status"
          name="status"
          value={car.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        >
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="customerName" className="block text-gray-700 font-bold mb-2">Customer Name</label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={car.customerName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="photos" className="block text-gray-700 font-bold mb-2">Photos</label>
        <input
          type="file"
          id="photos"
          onChange={handlePhotoChange}
          accept="image/*"
          multiple
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
      {car.photos.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-700 font-bold mb-2">Current Photos:</p>
          <div className="flex flex-wrap gap-2">
            {car.photos.map((photo, index) => (
              <img key={index} src={photo} alt={`Car photo ${index + 1}`} className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-between">
        <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          {loading ? 'Saving...' : (id ? 'Update Car' : 'Add Car')}
        </button>
        {id && (
          <button type="button" onClick={handleDelete} disabled={loading} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">
            {loading ? 'Deleting...' : 'Delete Car'}
          </button>
        )}
      </div>
    </form>
  );
};

export default CarForm;