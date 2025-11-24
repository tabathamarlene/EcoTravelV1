import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, TripOption, TransportMode, ChatMessage, UserProfile } from "../types";

const apiKey = process.env.API_KEY;
// Note: In a real production app, we would handle the missing key more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_TYPE_CHECKING' });

const tripSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      transportMode: { type: Type.STRING, enum: ["Train", "Flight", "Bus", "Car", "Mixed"] },
      transportCo2Kg: { type: Type.NUMBER, description: "Emissions from transport only" },
      totalCo2Kg: { type: Type.NUMBER, description: "Transport emissions + (Accommodation emissions * nights)" },
      durationHours: { type: Type.NUMBER, description: "Total travel time in hours" },
      costEstimate: { type: Type.STRING, description: "Total estimated cost range e.g. '150-200€'" },
      sustainabilityScore: { type: Type.NUMBER, description: "Score from 1 to 100 based on eco-friendliness" },
      highlights: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      accommodation: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of suggested sustainable hotel/lodge" },
          type: { type: Type.STRING, description: "Type of stay e.g. Hotel, Eco-Lodge" },
          sustainabilityRating: { type: Type.STRING, description: "e.g. 'Green Key Certified', 'LEED Gold'" },
          features: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Eco features e.g. 'Solar power', 'Rainwater harvesting', 'Zero waste'"
          },
          co2PerNightKg: { type: Type.NUMBER },
          totalAccommodationCo2Kg: { type: Type.NUMBER, description: "co2PerNight * number of nights" },
          costPerNight: { type: Type.STRING }
        },
        required: ["name", "type", "sustainabilityRating", "features", "co2PerNightKg", "totalAccommodationCo2Kg", "costPerNight"]
      }
    },
    required: ["id", "title", "description", "transportMode", "transportCo2Kg", "totalCo2Kg", "durationHours", "costEstimate", "sustainabilityScore", "highlights", "accommodation"]
  }
};

export const generateTripOptions = async (prefs: UserPreferences): Promise<TripOption[]> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    Plan 3 distinct travel options from ${prefs.origin} to ${prefs.destination}.
    Dates/Duration: ${prefs.dates}.
    Budget: ${prefs.budget}.
    Travelers: ${prefs.travelers}.
    Interests: ${prefs.interests}.

    Option 1 must be the most Eco-Friendly (e.g. Train/Bus + Eco-Lodge).
    Option 2 must be the Fastest (usually Flight + Business Hotel).
    Option 3 should be a Balanced option.

    For each option, strictly calculate:
    1. Transport CO2 emissions.
    2. Sustainable Accommodation: Recommend a specific type of place (or real example if known) that fits the vibe.
       - Include specific eco-features (Energy efficiency, Waste management, etc.).
       - Estimate CO2 per night for the stay.
    
    Be realistic with CO2 estimates.
    - Flight: ~150-250g CO2/km per person.
    - Train: ~14g CO2/km per person.
    - Hotel: ~10-40kg CO2 per night depending on sustainability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as TripOption[];
    // Ensure transport mode enum compatibility
    return data.map(d => ({
        ...d,
        transportMode: d.transportMode as TransportMode
    }));

  } catch (error) {
    console.error("Error generating trips:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: ChatMessage[], 
  newMessage: string, 
  contextData: TripOption[],
  userProfile?: UserProfile,
  currentView?: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const contextString = `
    Current App View: ${currentView || 'Unknown'}
    User Profile Context: ${userProfile ? JSON.stringify({
      name: userProfile.name,
      totalCo2Used: userProfile.totalCo2Used,
      co2Limit: userProfile.co2Limit,
      budgetSpent: userProfile.currentSpend,
      budgetLimit: userProfile.yearlyBudgetLimit
    }) : 'Not logged in'}
    Current Trip Options Available to User: ${contextData.length > 0 ? JSON.stringify(contextData) : "None yet (User is in planning/inspiration stage)."}
  `;

  const systemInstruction = `
    You are EcoTravel, a cool, calm, and knowledgeable travel buddy. 
    Your vibe is youthful, relaxed, and motivating — never preachy or judgmental.
    
    Your Goal: Inspire the user to travel sustainably. Accompany them through the whole process: inspiration -> planning -> booking.

    Key Behaviors:
    1. **Tone**: Casual, friendly, enthusiastic. Use "Hey", "Check this out". If speaking German, use "Du".
    2. **Inspiration Phase** (When no trips are generated): Ask about their dream destinations, suggest cool eco-friendly spots based on seasons, or explain why sustainable travel is fun (meeting locals, slow travel).
    3. **Planning Phase** (When trips exist): Compare the options using relatable facts (e.g., "Taking the train saves X kg CO2, basically a small forest's worth of work!").
    4. **Profile/Budget Phase**: If asked about stats, interpret their User Profile data. E.g., "You've used 450kg of your 1500kg limit. Still plenty of room for a summer trip!".
    5. **Accommodation**: Hype up the eco-features (solar power, zero waste).

    Context Handling:
    - Always check 'Current App View' to know what the user is looking at.
    - Use 'User Profile Context' to give personalized advice about their carbon budget.
    
    Language Rule: Adapt to the user's language. If they write in German, reply in cool, youthful German. If English, keep it casual English.
  `;

  let contents = [
    { role: 'user', parts: [{ text: `System Context Data: ${contextString}` }] }
  ];

  history.forEach(msg => {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I encountered an error processing your request.";
  }
};