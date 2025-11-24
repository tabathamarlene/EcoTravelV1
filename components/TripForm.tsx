import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { MapPin, Calendar, Wallet, Users, Heart } from 'lucide-react';

interface TripFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
  initialValues?: UserPreferences | null;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading, initialValues }) => {
  const defaultValues: UserPreferences = {
    origin: '',
    destination: '',
    dates: '',
    budget: '',
    travelers: 1,
    interests: ''
  };

  const [formData, setFormData] = useState<UserPreferences>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    } else {
      setFormData(defaultValues);
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Where to next?
        </h2>
        <p className="text-emerald-50 text-sm mt-1 opacity-90">Enter your details for a full carbon breakdown.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Origin</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
              <input
                required
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="City, Airport..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
              <input
                required
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Dream spot..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">When?</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                required
                type="text"
                name="dates"
                value={formData.dates}
                onChange={handleChange}
                placeholder="e.g., June"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                required
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 500€"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">People</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                required
                type="number"
                min="1"
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Vibe & Interests</label>
          <div className="relative">
            <Heart className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Hiking, vegan food, museums, luxury..."
              rows={2}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-2 ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Options...
            </span>
          ) : (
            initialValues ? 'Update Plans' : 'Show Me Sustainable Trips'
          )}
        </button>
      </form>
    </div>
  );
};

export default TripForm;