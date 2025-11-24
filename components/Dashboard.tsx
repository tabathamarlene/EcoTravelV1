
import React, { useState } from 'react';
import { UserProfile, SearchHistoryItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Leaf, Wallet, History, Settings, Search, Calendar, ArrowRight, RotateCcw, Bookmark, MapPin, DollarSign } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onUpdateLimits: (co2: number, budget: number) => void;
  searchHistory: SearchHistoryItem[];
  onRestoreSearch: (item: SearchHistoryItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onUpdateLimits, searchHistory, onRestoreSearch }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'searches'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newCo2Limit, setNewCo2Limit] = useState(profile.co2Limit);
  const [newBudgetLimit, setNewBudgetLimit] = useState(profile.yearlyBudgetLimit);

  const handleSave = () => {
    onUpdateLimits(newCo2Limit, newBudgetLimit);
    setIsEditing(false);
  };

  const co2Percentage = Math.min(100, (profile.totalCo2Used / profile.co2Limit) * 100);
  const budgetPercentage = Math.min(100, (profile.currentSpend / profile.yearlyBudgetLimit) * 100);

  const co2Data = [
    { name: 'Used', value: profile.totalCo2Used },
    { name: 'Remaining', value: Math.max(0, profile.co2Limit - profile.totalCo2Used) },
  ];
  const budgetData = [
    { name: 'Spent', value: profile.currentSpend },
    { name: 'Remaining', value: Math.max(0, profile.yearlyBudgetLimit - profile.currentSpend) },
  ];

  const COLORS = {
    co2: ['#10b981', '#d1fae5'], // Emerald
    budget: ['#3b82f6', '#dbeafe'], // Blue
    alert: '#ef4444'
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {profile.name}</h2>
          <p className="text-gray-500">Manage your sustainability goals and travel history.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Impact
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'searches' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Search History
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-end">
             <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">{isEditing ? 'Cancel' : 'Edit Limits'}</span>
              </button>
           </div>

          {isEditing && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-800 mb-4">Set Your Personal Annual Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Max CO₂ Target (kg)</label>
                  <input 
                    type="number" 
                    value={newCo2Limit}
                    onChange={(e) => setNewCo2Limit(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Annual Travel Budget (€)</label>
                  <input 
                    type="number" 
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CO2 Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Leaf size={20} /> CO₂ Footprint
                </div>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Annual</span>
              </div>
              <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={co2Data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {co2Data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? (co2Percentage > 100 ? COLORS.alert : COLORS.co2[0]) : COLORS.co2[1]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold text-gray-800">{profile.totalCo2Used}</span>
                    <span className="text-xs text-gray-400">kg used</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className={`font-medium ${co2Percentage > 100 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {co2Percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${co2Percentage > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(100, co2Percentage)}%` }} 
                  />
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">Limit: {profile.co2Limit} kg</p>
              </div>
            </div>

            {/* Budget Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Wallet size={20} /> Travel Budget
                </div>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Annual</span>
              </div>
              <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {budgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? (budgetPercentage > 100 ? COLORS.alert : COLORS.budget[0]) : COLORS.budget[1]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold text-gray-800">€{profile.currentSpend}</span>
                    <span className="text-xs text-gray-400">spent</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className={`font-medium ${budgetPercentage > 100 ? 'text-red-500' : 'text-blue-600'}`}>
                    {budgetPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${budgetPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, budgetPercentage)}%` }} 
                  />
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">Limit: €{profile.yearlyBudgetLimit}</p>
              </div>
            </div>
          </div>

          {/* Saved Trips Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Bookmark className="text-emerald-500" />
              <h3 className="font-semibold text-gray-800">Saved Trips</h3>
            </div>
            {profile.savedTrips.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No trips saved yet. Click the heart icon on a trip card to save it for later.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {profile.savedTrips.map((trip) => (
                  <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                       <h4 className="font-bold text-gray-800">{trip.title}</h4>
                       <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={12}/> {trip.accommodation?.name}</span>
                          <span className="flex items-center gap-1"><Leaf size={12} className="text-emerald-600"/> {trip.totalCo2Kg} kg CO₂</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{trip.costEstimate}</span>
                            <span className="block text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 text-center">
                                Score: {trip.sustainabilityScore}
                            </span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking History List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <History className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">Confirmed Bookings</h3>
            </div>
            {profile.history.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">
                No trips booked yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {profile.history.map((trip) => (
                  <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{trip.destination}</p>
                      <p className="text-xs text-gray-500">{new Date(trip.dateBooked).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400 mt-1">{trip.tripTitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end text-emerald-600 font-medium text-sm">
                        <Leaf size={12} /> {trip.co2Used} kg
                      </div>
                      <div className="text-gray-600 text-sm">{trip.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH HISTORY TAB */}
      {activeTab === 'searches' && (
        <div className="space-y-4 animate-fade-in">
          {searchHistory.length === 0 ? (
             <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium">No recent searches</h3>
                <p className="text-gray-400 text-sm">Your search history will appear here.</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {searchHistory.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-1">
                      <span>{item.preferences.origin}</span>
                      <ArrowRight size={16} className="text-gray-400" />
                      <span>{item.preferences.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                       <span className="flex items-center gap-1"><Calendar size={14}/> {item.preferences.dates}</span>
                       <span className="flex items-center gap-1"><Wallet size={14}/> {item.preferences.budget}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => onRestoreSearch(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium text-sm transition-colors"
                  >
                    <RotateCcw size={16} />
                    Load Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
