import React, { useState, useEffect } from 'react';
import { UserPreferences, TripOption, UserProfile, TripHistoryItem, SearchHistoryItem, ChatMessage } from './types';
import { generateTripOptions, sendChatMessage } from './services/geminiService';
import TripForm from './components/TripForm';
import TripCard from './components/TripCard';
import ChatInterface from './components/ChatInterface';
import CarbonChart from './components/CarbonChart';
import Dashboard from './components/Dashboard';
import CompareModal from './components/CompareModal';
import { Map, UserCircle, LayoutDashboard, Edit2, PlusCircle, Menu } from 'lucide-react';

// Consistent Avatar URL used across the app
const AI_AVATAR_URL = "https://api.dicebear.com/9.x/micah/svg?seed=TravelBuddy&backgroundColor=d1fae5&mouth=smile&hair=pixie";

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'dashboard' | 'profile'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  
  // State to control chat visibility/size
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Compare Modal State
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareHighlightId, setCompareHighlightId] = useState<string | null>(null);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  
  // Active Search & Chat State
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Mock User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alex",
    totalCo2Used: 450, // Pre-filled for demo
    co2Limit: 1500,
    yearlyBudgetLimit: 3000,
    currentSpend: 850,
    history: [
      {
        id: 'hist_1',
        destination: 'Amsterdam',
        dateBooked: Date.now() - 1000000000,
        co2Used: 45,
        cost: '120€',
        tripTitle: 'Train to Amsterdam'
      },
      {
        id: 'hist_2',
        destination: 'Barcelona',
        dateBooked: Date.now() - 500000000,
        co2Used: 405,
        cost: '730€',
        tripTitle: 'Summer Holiday Flight'
      }
    ],
    savedTrips: []
  });

  // Initialize Chat with inspiration message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'model',
        text: "Hey! 👋 I'm your EcoTravel Buddy. \n\nI'm here to help you plan the perfect trip and keep your footprint low. Where are you dreaming of going today?",
        timestamp: Date.now()
      }]);
    }
  }, []);

  const handleChatUpdate = async (newMessages: ChatMessage[], userMessageStr?: string) => {
    setChatMessages(newMessages);
    
    // Sync with history if we have an active search
    if (currentSearchId) {
      setSearchHistory(prev => prev.map(item => 
        item.id === currentSearchId 
          ? { ...item, chatHistory: newMessages } 
          : item
      ));
    }

    // If this update was triggered by a user message (not just a state set), we trigger the API call here
    // Note: ChatInterface usually handles the API call locally, but we can also centralize it. 
    // For now, we assume ChatInterface calls sendChatMessage. 
    // However, ChatInterface needs the profile/view context which we pass as props.
  };

  const handleFormSubmit = async (preferences: UserPreferences) => {
    setIsLoading(true);
    setPrefs(preferences);
    
    // Add a system message to chat indicating search started
    setChatMessages(prev => [...prev, {
      role: 'model',
      text: `Awesome! I'm looking for the best routes from ${preferences.origin} to ${preferences.destination} for you... 🌍`,
      timestamp: Date.now()
    }]);

    try {
      const options = await generateTripOptions(preferences);
      setTrips(options);
      
      const newId = Date.now().toString();
      setCurrentSearchId(newId);

      // Add results message
      const successMsg: ChatMessage = {
        role: 'model',
        text: `I found ${options.length} great options! Check them out on the left. Option 1 is super green! 🌱`,
        timestamp: Date.now()
      };
      
      const loadingMsg: ChatMessage = {
        role: 'model',
        text: `Awesome! I'm looking for the best routes from ${preferences.origin} to ${preferences.destination} for you... 🌍`,
        timestamp: Date.now()
      };

      const newChatHistory: ChatMessage[] = [...chatMessages, loadingMsg, successMsg];

      setChatMessages(newChatHistory);

      // Save to History
      const newHistoryItem: SearchHistoryItem = {
        id: newId,
        timestamp: Date.now(),
        preferences: preferences,
        results: options,
        chatHistory: newChatHistory
      };
      setSearchHistory(prev => [newHistoryItem, ...prev]);

      setView('dashboard'); // 'dashboard' here means Results View
    } catch (error) {
      console.error("Failed to fetch options", error);
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: "Oof, I hit a snag trying to find those trips. Mind checking your internet or trying again?",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setView('form');
    setTrips([]);
    setPrefs(null);
    setCurrentSearchId(null);
    // We DON'T clear chat, we keep the companion alive
    setChatMessages(prev => [...prev, {
      role: 'model',
      text: "Starting fresh! Where to next?",
      timestamp: Date.now()
    }]);
  };

  const handleEditRequest = () => {
    setView('form');
  };

  const handleRestoreSearch = (item: SearchHistoryItem) => {
    setPrefs(item.preferences);
    setTrips(item.results);
    setCurrentSearchId(item.id);
    setChatMessages(item.chatHistory || []); 
    setView('dashboard');
  };

  const handleBookTrip = (trip: TripOption) => {
    const historyItem: TripHistoryItem = {
      id: `booking_${Date.now()}`,
      destination: prefs?.destination || trip.title,
      dateBooked: Date.now(),
      co2Used: trip.totalCo2Kg,
      cost: trip.costEstimate,
      tripTitle: trip.title
    };

    const costNum = parseInt(trip.costEstimate.replace(/[^0-9]/g, '')) || 0;

    setUserProfile(prev => ({
      ...prev,
      totalCo2Used: prev.totalCo2Used + trip.totalCo2Kg,
      currentSpend: prev.currentSpend + costNum,
      history: [historyItem, ...prev.history]
    }));

    setChatMessages(prev => [...prev, {
      role: 'model',
      text: `Woohoo! 🎉 "${trip.title}" is booked. I've added it to your dashboard. Your carbon footprint for this trip is ${trip.totalCo2Kg}kg.`,
      timestamp: Date.now()
    }]);

    setView('profile');
  };

  const handleSaveTrip = (trip: TripOption) => {
    const isAlreadySaved = userProfile.savedTrips.some(t => t.id === trip.id);
    if (isAlreadySaved) return;

    setUserProfile(prev => ({
      ...prev,
      savedTrips: [trip, ...prev.savedTrips]
    }));
    
    setChatMessages(prev => [...prev, {
      role: 'model',
      text: `I've saved "${trip.title}" for later. You can find it in your dashboard!`,
      timestamp: Date.now()
    }]);
  };

  const handleOpenCompare = (trip: TripOption) => {
    setCompareHighlightId(trip.id);
    setIsCompareModalOpen(true);
  };

  const handleUpdateLimits = (co2: number, budget: number) => {
    setUserProfile(prev => ({
      ...prev,
      co2Limit: co2,
      yearlyBudgetLimit: budget
    }));
  };

  const bestEcoTripId = trips.length > 0 ? [...trips].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)[0].id : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* Global Header */}
      <header className="bg-white border-b border-gray-200 shrink-0 h-16 z-40 relative">
        <div className="max-w-full mx-auto px-4 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('form')}
          >
            <Map className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl text-gray-800 tracking-tight">EcoTravel<span className="text-emerald-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            {view === 'dashboard' && (
              <div className="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4">
                <button 
                  onClick={handleEditRequest}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={handleNewSearch}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <PlusCircle size={16} /> New
                </button>
              </div>
            )}
            <button
              onClick={() => setView(view === 'profile' ? 'form' : 'profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
                view === 'profile' 
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {view === 'profile' ? <LayoutDashboard size={18} /> : <UserCircle size={18} />}
              <span className="text-sm font-medium hidden sm:inline">
                {view === 'profile' ? 'Planner' : 'My Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Compare Modal */}
      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        trips={trips}
        highlightedTripId={compareHighlightId}
        onBook={handleBookTrip}
      />

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* LEFT PANEL: Content (Form, Results, Dashboard) */}
        <div className={`bg-emerald-50/30 overflow-y-auto custom-scrollbar transition-all duration-500 relative flex flex-col ${
          isChatMinimized ? 'lg:col-span-11' : 'lg:col-span-8'
        }`}>
          
          {/* View: Planning Form */}
          {view === 'form' && (
            <div className="p-6 md:p-10 flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in">
              <div className="text-center mb-8 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                  Let's Plan Your <span className="text-emerald-600">Green Getaway</span>
                </h1>
                <p className="text-gray-600">
                  Tell us your travel dreams. Our AI analyzes routes and accommodations to keep your footprint light and your experience memorable.
                </p>
              </div>
              <TripForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
                initialValues={prefs} 
              />
              {/* Stats Teaser if Profile exists */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition" onClick={() => setView('profile')}>
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                       <UserCircle size={20} />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">CO2 Balance</p>
                       <p className="font-bold text-gray-800">{userProfile.co2Limit - userProfile.totalCo2Used} kg remaining</p>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition" onClick={() => setView('profile')}>
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                       <LayoutDashboard size={20} />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-bold">Recent Trips</p>
                       <p className="font-bold text-gray-800">{userProfile.history.length} booked</p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* View: User Profile Dashboard */}
          {view === 'profile' && (
             <div className="p-4 md:p-8 max-w-6xl mx-auto w-full animate-fade-in">
                <Dashboard 
                  profile={userProfile} 
                  onUpdateLimits={handleUpdateLimits} 
                  searchHistory={searchHistory}
                  onRestoreSearch={handleRestoreSearch}
                />
             </div>
          )}

          {/* View: Trip Results (Previously 'dashboard') */}
          {view === 'dashboard' && (
            <div className="p-4 md:p-6 space-y-6 animate-fade-in">
                {/* Header Info */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-30 backdrop-blur-md bg-white/90">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="bg-emerald-100 p-1 rounded text-emerald-600"><Map size={16}/></span>
                      {prefs?.origin} <span className="text-gray-400">→</span> {prefs?.destination}
                    </h2>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span>{prefs?.budget}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 self-center"></span>
                      <span>{prefs?.travelers} Travelers</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={handleEditRequest} className="sm:hidden text-emerald-600 bg-emerald-50 p-2 rounded-lg"><Edit2 size={20}/></button>
                  </div>
                </div>

                {/* Chart */}
                <CarbonChart data={trips} />

                {/* Cards Grid */}
                <div className={`grid gap-4 ${isChatMinimized ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 xl:grid-cols-2'}`}>
                  {trips.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      isRecommended={trip.id === bestEcoTripId}
                      onBook={handleBookTrip}
                      onSave={handleSaveTrip}
                      onCompare={handleOpenCompare}
                    />
                  ))}
                </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Chat Interface (Persistent) */}
        <div className={`border-l border-gray-200 bg-white h-full flex flex-col transition-all duration-500 absolute lg:relative right-0 z-50 ${
          isChatMinimized 
            ? 'w-16 lg:w-auto lg:col-span-1 translate-x-full lg:translate-x-0' // On mobile, minimized might hide it or show icon
            : 'w-full lg:w-auto lg:col-span-4 translate-x-0 shadow-2xl lg:shadow-none'
        }`}>
          {/* Mobile toggle for chat is handled inside ChatInterface or here */}
          <ChatInterface 
            tripContext={trips} 
            isMinimized={isChatMinimized}
            onToggle={() => setIsChatMinimized(!isChatMinimized)}
            messages={chatMessages}
            onUpdateMessages={(msgs) => handleChatUpdate(msgs)}
            userProfile={userProfile}
            currentView={view}
          />
        </div>

        {/* Mobile Chat Toggle (Floating Avatar Button) if chat is "minimized" (hidden on mobile) */}
        <button 
           onClick={() => setIsChatMinimized(!isChatMinimized)}
           className={`lg:hidden fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-2xl z-[60] transition-transform hover:scale-105 active:scale-95 border-4 border-white overflow-hidden bg-emerald-100 ${!isChatMinimized ? 'hidden' : 'block'}`}
        >
           <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse z-10"></span>
           <img 
             src={AI_AVATAR_URL} 
             alt="Open Chat" 
             className="w-full h-full object-cover"
           />
        </button>

      </main>
    </div>
  );
};

export default App;