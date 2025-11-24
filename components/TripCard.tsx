import React from 'react';
import { TripOption, TransportMode } from '../types';
import { Train, Plane, Bus, Car, Timer, DollarSign, Leaf, Award, Hotel, CheckCircle, Heart, ArrowRightLeft } from 'lucide-react';

interface TripCardProps {
  trip: TripOption;
  isRecommended?: boolean;
  onBook: (trip: TripOption) => void;
  onSave: (trip: TripOption) => void;
  onCompare: (trip: TripOption) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, isRecommended, onBook, onSave, onCompare }) => {
  const getIcon = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.TRAIN: return <Train className="w-6 h-6" />;
      case TransportMode.FLIGHT: return <Plane className="w-6 h-6" />;
      case TransportMode.BUS: return <Bus className="w-6 h-6" />;
      case TransportMode.CAR: return <Car className="w-6 h-6" />;
      default: return <Train className="w-6 h-6" />;
    }
  };

  // Calculate color theme based on sustainability score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`relative bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md flex flex-col h-full ${
      isRecommended ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
    }`}>
      {isRecommended && (
        <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
          <Award size={12} /> Eco Pick
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${
            trip.transportMode === TransportMode.FLIGHT ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {getIcon(trip.transportMode)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{trip.title}</h4>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{trip.transportMode}</p>
          </div>
        </div>
        <div className={`flex flex-col items-end ${getScoreColor(trip.sustainabilityScore)} px-2 py-1 rounded-md min-w-[60px]`}>
          <span className="text-[10px] font-bold uppercase">Score</span>
          <span className="text-xl font-bold leading-none">{trip.sustainabilityScore}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
        {trip.description}
      </p>

      {/* CO2 Calculator Receipt */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
          <Leaf size={12} /> Footprint Calculator
        </p>
        <div className="flex justify-between text-xs text-gray-600">
            <span>Transport ({trip.transportMode})</span>
            <span className="font-mono">{trip.transportCo2Kg} kg</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
            <span>Accommodation ({trip.accommodation?.type})</span>
            <span className="font-mono">{trip.accommodation?.totalAccommodationCo2Kg} kg</span>
        </div>
        <div className="border-t border-gray-200 pt-1 flex justify-between text-sm font-bold text-gray-800">
            <span>Total Estimate</span>
            <span>{trip.totalCo2Kg} kg</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded text-blue-800">
          <Timer className="w-4 h-4" />
          <span className="text-xs font-semibold">{trip.durationHours}h Travel</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 p-2 rounded text-green-800">
          <DollarSign className="w-4 h-4" />
          <span className="text-xs font-semibold">{trip.costEstimate}</span>
        </div>
      </div>

      {/* Accommodation Section */}
      {trip.accommodation && (
        <div className="mb-4 border border-emerald-100 rounded-lg p-3 bg-emerald-50/30">
            <div className="flex items-center gap-2 mb-2">
                <Hotel className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-gray-800">{trip.accommodation.name}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-[10px] px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 rounded-full shadow-sm">
                    {trip.accommodation.sustainabilityRating}
                </span>
            </div>
            <ul className="text-[11px] text-gray-600 space-y-1 ml-1">
                {trip.accommodation.features.slice(0, 2).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" /> {feat}
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button 
          onClick={() => onSave(trip)}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-[0.98]"
          title="Save to Profile"
        >
          <Heart size={20} />
        </button>
        <button 
          onClick={() => onCompare(trip)}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-[0.98]"
          title="Compare Options"
        >
          <ArrowRightLeft size={20} />
        </button>
        <button 
          onClick={() => onBook(trip)}
          className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
        >
          Select & Book
        </button>
      </div>
    </div>
  );
};

export default TripCard;