import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Maximize2, Minimize2, Sparkles, ArrowRight } from 'lucide-react';
import { ChatMessage, TripOption, UserProfile } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatInterfaceProps {
  tripContext: TripOption[];
  isMinimized: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[], userMsg?: string) => void;
  userProfile: UserProfile;
  currentView: string;
}

// Using DiceBear 'Micah' style for a hand-drawn, youthful, friendly look
const AI_AVATAR_URL = "https://api.dicebear.com/9.x/micah/svg?seed=TravelBuddy&backgroundColor=d1fae5&mouth=smile&hair=pixie";

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  tripContext, 
  isMinimized, 
  onToggle, 
  messages, 
  onUpdateMessages,
  userProfile,
  currentView
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMinimized) {
        scrollToBottom();
    }
  }, [messages, isMinimized, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    onUpdateMessages(newMessages, textToSend);
    setInput('');
    setIsTyping(true);

    try {
      // Pass context including profile and view
      const responseText = await sendChatMessage(newMessages, textToSend, tripContext, userProfile, currentView);
      const botMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      onUpdateMessages([...newMessages, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suggestions when chat is fresh
  const renderSuggestions = () => {
    if (messages.length > 2) return null;
    
    const suggestions = [
        "Inspire me with eco-trips! 🌿",
        "How's my CO2 budget? 📉",
        "Why travel by train? 🚆",
        "Plan a weekend getaway"
    ];

    return (
        <div className="flex flex-wrap gap-2 mt-4 px-2">
            {suggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>
    );
  };

  // MINIMIZED VIEW
  if (isMinimized) {
    return (
      <div 
        onClick={onToggle}
        className="h-full w-full bg-gray-900 hover:bg-gray-800 transition-all cursor-pointer flex flex-col items-center py-4 gap-4 shadow-xl"
      >
         <div className="relative mt-2">
            <img 
              src={AI_AVATAR_URL} 
              alt="AI Avatar" 
              className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-white object-cover"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full animate-bounce"></div>
         </div>
         
         {/* Vertical Text */}
         <div className="flex-1 flex items-center justify-center">
            <div className="writing-vertical-lr transform rotate-180 text-gray-400 font-bold tracking-widest text-xs uppercase">
                EcoTravel Buddy
            </div>
         </div>

         <div className="text-gray-500 hover:text-white mb-2">
            <Maximize2 size={20} />
         </div>
      </div>
    );
  }

  // MAXIMIZED VIEW
  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
             <img 
                src={AI_AVATAR_URL} 
                alt="Travel Buddy" 
                className="w-10 h-10 rounded-full border-2 border-emerald-100 bg-emerald-50 object-cover"
             />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">EcoTravel Buddy</h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
               <Sparkles size={10} /> Online & Ready to Inspire
            </p>
          </div>
        </div>
        <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            title="Minimize Sidebar"
        >
            <Minimize2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex w-full animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar for message bubble */}
              <div className="flex-shrink-0 mt-1">
                  {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shadow-sm">
                          <User size={16} />
                      </div>
                  ) : (
                      <img 
                        src={AI_AVATAR_URL} 
                        alt="AI" 
                        className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 object-cover shadow-sm"
                      />
                  )}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gray-100 text-gray-800 rounded-tr-sm' 
                      : 'bg-emerald-50/50 border border-emerald-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-emerald-600 prose-strong:text-gray-900">
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
              </div>

            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="ml-11 bg-gray-50 p-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
             </div>
          </div>
        )}
        
        {renderSuggestions()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm shadow-inner transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all transform active:scale-95 shadow-md"
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">
            AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;