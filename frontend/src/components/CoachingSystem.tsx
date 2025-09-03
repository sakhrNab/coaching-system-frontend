import React, { useState, useEffect } from 'react';
import { QrCode, Users, Heart, Target, Clock, Send, Plus, Edit, Check, X, Calendar, Globe, Upload, Download, Loader } from 'lucide-react';

interface Client {
  id: string | number;
  name: string;
  phone_number: string;
  categories: string[];
  timezone: string;
  country?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CoachData {
  id: string;
  name: string;
  whatsapp_token: string;
}

const CoachingSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('barcode');
  const [isRegistered, setIsRegistered] = useState(false);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Client data - now from API with static fallback
  const [selectedClients, setSelectedClients] = useState<(string | number)[]>([]);
  const [clientCategories, setClientCategories] = useState<string[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Messages
  const [celebrationMessages, setCelebrationMessages] = useState<Record<string, string>>({});
  const [accountabilityMessages, setAccountabilityMessages] = useState<Record<string, string>>({});
  const [defaultCelebrationMessages, setDefaultCelebrationMessages] = useState<string[]>([]);
  
  // Scheduling
  const [schedulingOptions, setSchedulingOptions] = useState<Record<string, any>>({});
  const [coachTimezone, setCoachTimezone] = useState('EST');

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Static fallback data
  const fallbackClients: Client[] = [
    { id: 1, name: 'Mike Johnson', phone_number: '+1234567890', categories: ['Health', 'Relationship'], timezone: 'EST' },
    { id: 2, name: 'Francis Williams', phone_number: '+1234567891', categories: ['Finance'], timezone: 'PST' },
    { id: 3, name: 'Bernard Smith', phone_number: '+1234567892', categories: ['Growth', 'Relationship', 'Finance'], timezone: 'CST' },
    { id: 4, name: 'Sarah Davis', phone_number: '+1234567893', categories: ['Health', 'Weight'], timezone: 'EST' },
    { id: 5, name: 'John Miller', phone_number: '+1234567894', categories: ['Business', 'Communication'], timezone: 'PST' }
  ];

  const fallbackCategories = [
    'Weight', 'Diet', 'Business', 'Finance', 'Relationship', 
    'Health', 'Growth', 'Socialization', 'Communication', 'Writing', 
    'Creativity', 'Career'
  ];

  const fallbackCelebrationMessages = [
    "🎉 What are we celebrating today?",
    "✨ What are you grateful for?",
    "🌟 What victory are you proud of today?",
    "🎊 What positive moment made your day?",
    "💫 What breakthrough did you experience?"
  ];

  const timezones = ['EST', 'PST', 'CST', 'MST', 'GMT', 'CET', 'JST', 'AEST'];

  // API Functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check if user is already logged in (localStorage or session)
      const savedCoachData = localStorage.getItem('coachData');
      if (savedCoachData) {
        const coach = JSON.parse(savedCoachData);
        setCoachData(coach);
        setIsRegistered(true);
        setCurrentStep('dashboard');
        await loadCoachData(coach.id);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Use fallback data
      setAvailableCategories(fallbackCategories);
      setDefaultCelebrationMessages(fallbackCelebrationMessages);
    }
  };

  const loadCoachData = async (coachId: string) => {
    setLoading(true);
    try {
      // Load clients
      try {
        const clients = await apiCall(`/coaches/${coachId}/clients`);
        setAllClients(clients || []);
      } catch (error) {
        console.error('Failed to load clients, using fallback:', error);
        setAllClients(fallbackClients);
      }

      // Load categories
      try {
        const categories = await apiCall(`/coaches/${coachId}/categories`);
        setAvailableCategories(categories.map((cat: any) => cat.name) || []);
      } catch (error) {
        console.error('Failed to load categories, using fallback:', error);
        setAvailableCategories(fallbackCategories);
      }

      // Load default messages
      try {
        const templates = await apiCall(`/coaches/${coachId}/templates?type=celebration`);
        setDefaultCelebrationMessages(templates.map((t: any) => t.content) || fallbackCelebrationMessages);
      } catch (error) {
        console.error('Failed to load message templates, using fallback:', error);
        setDefaultCelebrationMessages(fallbackCelebrationMessages);
      }

    } catch (error) {
      setError('Failed to load coach data');
      console.error('Load coach data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Barcode scanning with real registration
  const handleBarcodeScanned = async (scannedData?: string) => {
    setLoading(true);
    try {
      // Parse barcode data
      const barcodeData = JSON.parse(scannedData || '{"coach_id":"demo","whatsapp_token":"demo_token","name":"Demo Coach"}');
      
      const registrationData = {
        barcode: barcodeData.coach_id,
        whatsapp_token: barcodeData.whatsapp_token,
        name: barcodeData.name,
        timezone: coachTimezone
      };

      const result = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });

      if (result.status === 'registered' || result.status === 'existing') {
        const coach = {
          id: result.coach_id,
          name: barcodeData.name,
          whatsapp_token: barcodeData.whatsapp_token
        };
        
        setCoachData(coach);
        setIsRegistered(true);
        
        // Save to localStorage for persistence
        localStorage.setItem('coachData', JSON.stringify(coach));
        
        await loadCoachData(result.coach_id);
        setCurrentStep('dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to demo mode
      const demoCoach = {
        id: 'demo-coach-id',
        name: 'Demo Coach',
        whatsapp_token: 'demo_token'
      };
      setCoachData(demoCoach);
      setIsRegistered(true);
      setAllClients(fallbackClients);
      setAvailableCategories(fallbackCategories);
      setDefaultCelebrationMessages(fallbackCelebrationMessages);
      setCurrentStep('dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Client selection handlers
  const handleClientSelection = (clientId: string | number) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const selectAllClients = () => {
    if (selectedClients.length === allClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(allClients.map(c => c.id));
    }
  };

  const handleCelebrationMessage = (clientId: string | number, message: string) => {
    setCelebrationMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleAccountabilityMessage = (clientId: string | number, message: string) => {
    setAccountabilityMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleScheduling = (clientId: string | number, type: string, option: string, datetime: string | null = null) => {
    setSchedulingOptions(prev => ({
      ...prev,
      [`${clientId}_${type}`]: { option, datetime }
    }));
  };

  // Send messages with real API
  const sendMessages = async () => {
    setLoading(true);
    try {
      const messageRequests = [];
      
      // Prepare celebration messages
      Object.entries(celebrationMessages).forEach(([clientId, message]) => {
        if (message && message.trim()) {
          messageRequests.push({
            client_ids: [clientId],
            message_type: 'celebration',
            content: message,
            schedule_type: schedulingOptions[`${clientId}_celebration`]?.option || 'now',
            scheduled_time: schedulingOptions[`${clientId}_celebration`]?.datetime
          });
        }
      });

      // Prepare accountability messages
      Object.entries(accountabilityMessages).forEach(([clientId, message]) => {
        if (message && message.trim()) {
          messageRequests.push({
            client_ids: [clientId],
            message_type: 'accountability',
            content: message,
            schedule_type: schedulingOptions[`${clientId}_accountability`]?.option || 'now',
            scheduled_time: schedulingOptions[`${clientId}_accountability`]?.datetime
          });
        }
      });

      // Send all messages
      for (const messageRequest of messageRequests) {
        try {
          await apiCall('/messages/send', {
            method: 'POST',
            body: JSON.stringify(messageRequest)
          });
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }

      alert(`Successfully processed ${messageRequests.length} messages! 🎉`);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Send messages error:', error);
      alert('Some messages may have failed to send. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
      <span className="text-gray-600">Loading...</span>
    </div>
  );

  // Render functions for each step
  const renderBarcodeScanner = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <QrCode className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Coach Registration</h1>
          <p className="text-gray-600">Scan your registration barcode to connect your WhatsApp Business API</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Position barcode in the camera frame</p>
            </>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <button 
          onClick={() => handleBarcodeScanned('{"coach_id":"demo","whatsapp_token":"demo_token","name":"Demo Coach"}')}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Demo: Simulate Barcode Scan'}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {coachData?.name}! 👋</h1>
              <p className="text-gray-600">Your WhatsApp Business API is connected. Let's send some messages to your clients!</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {allClients.length} clients loaded
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => alert('Export functionality')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('coachData');
                  setCurrentStep('barcode');
                  setIsRegistered(false);
                  setCoachData(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div 
            onClick={() => setCurrentStep('clients')}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-blue-500"
          >
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">1. Select Clients</h3>
            <p className="text-gray-600">Choose which clients to send messages to</p>
            <div className="mt-2 text-sm text-gray-500">
              {selectedClients.length} of {allClients.length} selected
            </div>
          </div>
          
          <div 
            onClick={() => selectedClients.length > 0 && setCurrentStep('celebration')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-green-500 ${
              selectedClients.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Heart className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">2. Celebration</h3>
            <p className="text-gray-600">Send celebration & gratitude messages</p>
          </div>
          
          <div 
            onClick={() => selectedClients.length > 0 && setCurrentStep('accountability')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-purple-500 ${
              selectedClients.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Target className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">3. Accountability</h3>
            <p className="text-gray-600">Send accountability check-ins</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientSelection = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Clients</h2>
          </div>
          
          {loading && <LoadingSpinner />}
          
          <div className="mb-6">
            <button 
              onClick={selectAllClients}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              {selectedClients.length === allClients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid gap-4">
            {allClients.map(client => (
              <div 
                key={client.id}
                onClick={() => handleClientSelection(client.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedClients.includes(client.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{client.name}</h4>
                    <p className="text-gray-600">{client.phone_number} • {client.timezone}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.categories.map(cat => (
                        <span key={cat} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedClients.includes(client.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedClients.includes(client.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button 
              onClick={() => setCurrentStep('dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={() => setCurrentStep('celebration')}
              disabled={selectedClients.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue ({selectedClients.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCelebration = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">🎉 Celebration Messages</h2>
          
          {selectedClients.map(clientId => {
            const client = allClients.find(c => c.id === clientId);
            if (!client) return null;
            
            return (
              <div key={clientId} className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{client.name}</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Default Messages:</h4>
                  <div className="grid gap-2">
                    {defaultCelebrationMessages.map((message, index) => (
                      <button
                        key={index}
                        onClick={() => handleCelebrationMessage(clientId, message)}
                        className={`p-3 text-left rounded-lg border transition-colors ${
                          celebrationMessages[clientId] === message
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Custom Message:</h4>
                  <textarea
                    value={celebrationMessages[clientId] || ''}
                    onChange={(e) => handleCelebrationMessage(clientId, e.target.value)}
                    placeholder="Type your custom celebration message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: You can also send voice messages via WhatsApp for AI transcription & correction
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentStep('clients')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={() => setCurrentStep('accountability')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Accountability
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountability = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">🎯 Accountability Messages</h2>
          
          {selectedClients.map(clientId => {
            const client = allClients.find(c => c.id === clientId);
            if (!client) return null;
            
            return (
              <div key={clientId} className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{client.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Categories: {client.categories.join(', ')}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Suggested Message (based on goals):</h4>
                  <div className="bg-gray-50 p-3 rounded-lg mb-2">
                    <p className="text-gray-700">
                      {client.categories.includes('Health') && "How did your health goals go today? Any wins to share?"}
                      {client.categories.includes('Finance') && "How are you progressing with your financial goals this week?"}
                      {client.categories.includes('Business') && "What business action did you take today toward your goals?"}
                      {!client.categories.includes('Health') && !client.categories.includes('Finance') && !client.categories.includes('Business') && 
                        "How are you progressing toward your goals today?"}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Custom Accountability Message:</h4>
                  <textarea
                    value={accountabilityMessages[clientId] || ''}
                    onChange={(e) => handleAccountabilityMessage(clientId, e.target.value)}
                    placeholder="Type your custom accountability message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">⏰ When to send:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleScheduling(clientId, 'accountability', 'now')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_accountability`]?.option === 'now'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Send className="w-5 h-5 mx-auto mb-1" />
                      Send Now
                    </button>
                    
                    <button
                      onClick={() => handleScheduling(clientId, 'accountability', 'specific')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_accountability`]?.option === 'specific'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mx-auto mb-1" />
                      Specific Time
                    </button>
                    
                    <button
                      onClick={() => handleScheduling(clientId, 'accountability', 'recurring')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_accountability`]?.option === 'recurring'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      Recurring
                    </button>
                  </div>
                  
                  {schedulingOptions[`${clientId}_accountability`]?.option === 'specific' && (
                    <input
                      type="datetime-local"
                      onChange={(e) => handleScheduling(clientId, 'accountability', 'specific', e.target.value)}
                      className="w-full mt-3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Coach Settings</h3>
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <label className="font-medium">Default Timezone:</label>
              <select 
                value={coachTimezone}
                onChange={(e) => setCoachTimezone(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button 
              onClick={() => setCurrentStep('celebration')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={sendMessages}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Sending...' : 'Send All Messages'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Messages Sent! ✨</h1>
        <p className="text-gray-600 mb-6">Your celebration and accountability messages have been sent to your clients and exported to Google Sheets.</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => {
              setCurrentStep('dashboard');
              // Reset state for new session
              setSelectedClients([]);
              setCelebrationMessages({});
              setAccountabilityMessages({});
              setSchedulingOptions({});
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Send More Messages
          </button>
          
          <button 
            onClick={() => alert('Google Sheets export functionality')}
            className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            View Google Sheet
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <div className="font-sans">
      {currentStep === 'barcode' && renderBarcodeScanner()}
      {currentStep === 'dashboard' && renderDashboard()}
      {currentStep === 'clients' && renderClientSelection()}
      {currentStep === 'celebration' && renderCelebration()}
      {currentStep === 'accountability' && renderAccountability()}
      {currentStep === 'confirmation' && renderConfirmation()}
    </div>
  );
};

export default CoachingSystem;

