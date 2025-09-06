import React, { useState, useEffect } from 'react';
import { QrCode, Users, Heart, Target, Clock, Send, Plus, Edit, Check, X, Calendar, Globe, Upload, Download, Loader } from 'lucide-react';

const CoachingSystem = () => {
  const [currentStep, setCurrentStep] = useState('barcode');
  const [isRegistered, setIsRegistered] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Client data - now from API with static fallback
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Messages
  const [celebrationMessages, setCelebrationMessages] = useState({});
  const [accountabilityMessages, setAccountabilityMessages] = useState({});
  const [defaultCelebrationMessages, setDefaultCelebrationMessages] = useState([]);
  const [defaultAccountabilityMessages, setDefaultAccountabilityMessages] = useState([]);
  
  // Scheduling
  const [schedulingOptions, setSchedulingOptions] = useState({});
  const [coachTimezone, setCoachTimezone] = useState('EST');
  
  // Analytics and Stats
  const [coachStats, setCoachStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Client Management
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  
  // 24-hour window tracking
  const [clientFreeMessageStatus, setClientFreeMessageStatus] = useState({});
  const [showFreeMessageWarning, setShowFreeMessageWarning] = useState(false);

  // API Base URL - Use runtime configuration
  const API_BASE = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8001';
  
  // Debug: Log API URL (remove in production)
  console.log('API Base URL:', API_BASE);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Runtime Config:', window._env_);

  // Static fallback data
  const fallbackClients = [
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

  // Celebration messages (templates 6-10)
  const fallbackCelebrationMessages = [
    "🎉 What are we celebrating today?",
    "✨ What are you grateful for?",
    "🌟 What victory are you proud of today?",
    "🎊 What positive moment made your day?",
    "💫 What breakthrough did you experience?"
  ];

  // Accountability messages (templates 1-5)
  const fallbackAccountabilityMessages = [
    "🔥 What will you commit to tomorrow?",
    "📝 How did you progress on your goals today?",
    "🎯 What action did you take towards your target?",
    "💪 What challenge did you overcome today?",
    "📈 How are you measuring your progress?"
  ];

  const timezones = [
    // North America
    { value: 'EST', label: 'EST - Eastern Time (US/Canada)', offset: '-05:00' },
    { value: 'PST', label: 'PST - Pacific Time (US/Canada)', offset: '-08:00' },
    { value: 'CST', label: 'CST - Central Time (US/Canada)', offset: '-06:00' },
    { value: 'MST', label: 'MST - Mountain Time (US/Canada)', offset: '-07:00' },
    
    // Europe
    { value: 'GMT', label: 'GMT - Greenwich Mean Time (UK)', offset: '+00:00' },
    { value: 'CET', label: 'CET - Central European Time (Europe)', offset: '+01:00' },
    { value: 'EET', label: 'EET - Eastern European Time (Greece, Finland)', offset: '+02:00' },
    
    // Middle East
    { value: 'AST', label: 'AST - Arabia Standard Time (Saudi Arabia, UAE)', offset: '+03:00' },
    { value: 'IRST', label: 'IRST - Iran Standard Time (Iran)', offset: '+03:30' },
    { value: 'GST', label: 'GST - Gulf Standard Time (Oman, Qatar)', offset: '+04:00' },
    
    // Africa
    { value: 'WAT', label: 'WAT - West Africa Time (Nigeria, Ghana)', offset: '+01:00' },
    { value: 'CAT', label: 'CAT - Central Africa Time (South Africa, Egypt)', offset: '+02:00' },
    { value: 'EAT', label: 'EAT - East Africa Time (Kenya, Tanzania)', offset: '+03:00' },
    { value: 'SAST', label: 'SAST - South Africa Standard Time (South Africa)', offset: '+02:00' },
    
    // Asia
    { value: 'JST', label: 'JST - Japan Standard Time (Japan)', offset: '+09:00' },
    { value: 'IST', label: 'IST - India Standard Time (India)', offset: '+05:30' },
    { value: 'CST_CN', label: 'CST - China Standard Time (China)', offset: '+08:00' },
    
    // Australia
    { value: 'AEST', label: 'AEST - Australian Eastern Time (Australia)', offset: '+10:00' }
  ];

  // API Functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
      } else {
        // Only set fallback data if no saved coach data
        setAvailableCategories(fallbackCategories);
        setDefaultCelebrationMessages(fallbackCelebrationMessages);
        setDefaultAccountabilityMessages(fallbackAccountabilityMessages);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Use fallback data only on error
      setAvailableCategories(fallbackCategories);
      setDefaultCelebrationMessages(fallbackCelebrationMessages);
      setDefaultAccountabilityMessages(fallbackAccountabilityMessages);
    }
  };

  const loadCoachData = async (coachId) => {
    if (loading) {
      console.log('loadCoachData already in progress, skipping...');
      return;
    }
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
        if (categories && categories.length > 0) {
          setAvailableCategories(categories.map(cat => cat.name));
        } else {
          setAvailableCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Failed to load categories, using fallback:', error);
        setAvailableCategories(fallbackCategories);
      }

      // Load default celebration messages
      try {
        const templates = await apiCall(`/coaches/${coachId}/templates?type=celebration`);
        if (templates && templates.length > 0) {
          setDefaultCelebrationMessages(templates.map(t => t.content));
        } else {
          setDefaultCelebrationMessages(fallbackCelebrationMessages);
        }
      } catch (error) {
        console.error('Failed to load celebration templates, using fallback:', error);
        setDefaultCelebrationMessages(fallbackCelebrationMessages);
      }

      // Load default accountability messages
      try {
        const templates = await apiCall(`/coaches/${coachId}/templates?type=accountability`);
        if (templates && templates.length > 0) {
          setDefaultAccountabilityMessages(templates.map(t => t.content));
        } else {
          setDefaultAccountabilityMessages(fallbackAccountabilityMessages);
        }
      } catch (error) {
        console.error('Failed to load accountability templates, using fallback:', error);
        setDefaultAccountabilityMessages(fallbackAccountabilityMessages);
      }

      // Load coach stats for dashboard
      try {
        const stats = await apiCall(`/coaches/${coachId}/stats`);
        setCoachStats(stats);
      } catch (error) {
        console.error('Failed to load coach stats:', error);
      }

    } catch (error) {
      setError('Failed to load coach data');
      console.error('Load coach data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API functions for better frontend integration
  const loadCoachStats = async () => {
    try {
      const stats = await apiCall(`/coaches/${coachData.id}/stats`);
      setCoachStats(stats);
    } catch (error) {
      console.error('Failed to load coach stats:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await apiCall(`/coaches/${coachData.id}/analytics`);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      setLoading(true);
      await apiCall(`/coaches/${coachData.id}/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData)
      });
      await loadCoachData(coachData.id); // Reload clients
      return true;
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (clientId) => {
    try {
      setLoading(true);
      await apiCall(`/coaches/${coachData.id}/clients/${clientId}`, {
        method: 'DELETE'
      });
      await loadCoachData(coachData.id); // Reload clients
      alert('Client deleted successfully!');
      return true;
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadClientHistory = async (clientId) => {
    try {
      setLoading(true);
      const history = await apiCall(`/coaches/${coachData.id}/clients/${clientId}/history`);
      setClientHistory(history || []);
      return history;
    } catch (error) {
      console.error('Failed to load client history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Import contacts from Google Contacts
  const importGoogleContacts = async () => {
    setLoading(true);
    try {
      // Request Google Contacts access
      if (window.gapi && window.gapi.load) {
        window.gapi.load('auth2', async () => {
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (!authInstance) {
            await window.gapi.auth2.init({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
            });
          }
          
          const user = await window.gapi.auth2.getAuthInstance().signIn({
            scope: 'https://www.googleapis.com/auth/contacts.readonly'
          });
          
          const accessToken = user.getAuthResponse().access_token;
          
          // Fetch contacts
          const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          const contactsData = await response.json();
          const contacts = contactsData.connections || [];
          
          // Transform contacts to client format
          const newClients = contacts
            .filter(contact => contact.phoneNumbers && contact.names)
            .map(contact => ({
              name: contact.names[0].displayName,
              phone_number: contact.phoneNumbers[0].value,
              country: 'USA',
              timezone: coachTimezone,
              categories: []
            }));

          // Add to backend
          for (const client of newClients) {
            try {
              await apiCall(`/coaches/${coachData.id}/clients`, {
                method: 'POST',
                body: JSON.stringify(client)
              });
            } catch (error) {
              console.error('Failed to add client:', client.name, error);
            }
          }

          // Reload clients
          await loadCoachData(coachData.id);
          alert(`Imported ${newClients.length} contacts successfully!`);
        });
      } else {
        throw new Error('Google API not loaded');
      }
    } catch (error) {
      console.error('Import contacts error:', error);
      alert('Failed to import contacts. Please ensure Google APIs are loaded.');
    } finally {
      setLoading(false);
    }
  };

  // Import from CSV/Excel
  const importFromFile = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('coach_id', coachData.id);

      const result = await fetch(`${API_BASE}/coaches/${coachData.id}/import-clients`, {
        method: 'POST',
        body: formData
      });

      const data = await result.json();
      
      if (data.status === 'success') {
        await loadCoachData(coachData.id);
        alert(`Imported ${data.count} clients successfully!`);
      } else {
        throw new Error(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('File import error:', error);
      alert('Failed to import file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  // Export to Google Sheets
  const exportToGoogleSheets = async () => {
    setLoading(true);
    try {
      const result = await apiCall(`/coaches/${coachData.id}/export`, {
        method: 'GET'
      });
      
      if (result.sheet_url) {
        window.open(result.sheet_url, '_blank');
        alert('Data exported to Google Sheets successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export to Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  // Barcode scanning with real registration
  const handleBarcodeScanned = async (scannedData) => {
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
      setDefaultAccountabilityMessages(fallbackAccountabilityMessages);
      setCurrentStep('dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Add new client
  const addNewClient = async (clientData) => {
    try {
      const result = await apiCall(`/coaches/${coachData.id}/clients`, {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
      
      if (result.status === 'created') {
        await loadCoachData(coachData.id);
        return true;
      }
    } catch (error) {
      console.error('Add client error:', error);
      // Add to local state as fallback
      const newClient = {
        id: Date.now(),
        ...clientData
      };
      setAllClients(prev => [...prev, newClient]);
    }
    return false;
  };

  // Add custom category
  const addCustomCategory = async (categoryName) => {
    try {
      await apiCall(`/coaches/${coachData.id}/categories`, {
        method: 'POST',
        body: JSON.stringify({ name: categoryName })
      });
      
      setAvailableCategories(prev => [...prev, categoryName]);
      return true;
    } catch (error) {
      console.error('Add category error:', error);
      // Add locally as fallback
      setAvailableCategories(prev => [...prev, categoryName]);
      return false;
    }
  };

  // Send only celebration messages
  const sendCelebrationMessages = async () => {
    setLoading(true);
    try {
      const messageRequests = [];
      
      // Prepare celebration messages only
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

      // Send all celebration messages
      for (const messageRequest of messageRequests) {
        try {
          await apiCall('/messages/send', {
            method: 'POST',
            body: JSON.stringify(messageRequest)
          });
        } catch (error) {
          console.error('Failed to send celebration message:', error);
        }
      }

      // Export to Google Sheets
      await exportToGoogleSheets();
      
      alert(`Successfully sent ${messageRequests.length} celebration messages! 🎉`);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Send celebration messages error:', error);
      alert('Some celebration messages may have failed to send. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Send only accountability messages
  const sendAccountabilityMessages = async () => {
    setLoading(true);
    try {
      const messageRequests = [];
      
      // Prepare accountability messages only
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

      // Send all accountability messages
      for (const messageRequest of messageRequests) {
        try {
          await apiCall('/messages/send', {
            method: 'POST',
            body: JSON.stringify(messageRequest)
          });
        } catch (error) {
          console.error('Failed to send accountability message:', error);
        }
      }

      // Export to Google Sheets
      await exportToGoogleSheets();
      
      alert(`Successfully sent ${messageRequests.length} accountability messages! 🎯`);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Send accountability messages error:', error);
      alert('Some accountability messages may have failed to send. Check the console for details.');
    } finally {
      setLoading(false);
    }
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

      // Export to Google Sheets
      await exportToGoogleSheets();
      
      alert(`Successfully processed ${messageRequests.length} messages! 🎉`);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Send messages error:', error);
      alert('Some messages may have failed to send. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Check 24-hour window for free messages
  const checkFreeMessageStatus = async (clientId) => {
    if (!coachData?.id) return;
    
    try {
      const response = await apiCall(`/coaches/${coachData.id}/clients/${clientId}/can-send-free`);
      setClientFreeMessageStatus(prev => ({
        ...prev,
        [clientId]: response.can_send_free
      }));
    } catch (error) {
      console.error('Failed to check free message status:', error);
      // Default to false (can't send free) if check fails
      setClientFreeMessageStatus(prev => ({
        ...prev,
        [clientId]: false
      }));
    }
  };


  // Client selection handlers
  const handleClientSelection = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        const newSelection = [...prev, clientId];
        // Check free message status for the newly selected client
        setTimeout(() => {
          checkFreeMessageStatus(clientId);
        }, 100);
        return newSelection;
      }
    });
  };

  const selectAllClients = () => {
    if (selectedClients.length === allClients.length) {
      setSelectedClients([]);
    } else {
      const newSelection = allClients.map(c => c.id);
      setSelectedClients(newSelection);
      // Check free message status for all clients
      setTimeout(() => {
        newSelection.forEach(clientId => checkFreeMessageStatus(clientId));
      }, 100);
    }
  };

  const handleCelebrationMessage = (clientId, message) => {
    // Check if it's a custom message (not a template)
    const isTemplate = defaultCelebrationMessages.includes(message);
    
    // If it's a custom message and we can't send free, show warning
    if (!isTemplate && !clientFreeMessageStatus[clientId]) {
      setShowFreeMessageWarning(true);
      return;
    }
    
    setCelebrationMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleCelebrationMessageChange = (clientId, message) => {
    // This handles custom message input changes
    // Always allow custom message changes, even if it matches a template
    setCelebrationMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleAccountabilityMessage = (clientId, message) => {
    // Check if it's a custom message (not a template)
    const isTemplate = defaultAccountabilityMessages.includes(message);
    
    // If it's a custom message and we can't send free, show warning
    if (!isTemplate && !clientFreeMessageStatus[clientId]) {
      setShowFreeMessageWarning(true);
      return;
    }
    
    setAccountabilityMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleAccountabilityMessageChange = (clientId, message) => {
    // This handles custom message input changes
    // Always allow custom message changes, even if it matches a template
    setAccountabilityMessages(prev => ({
      ...prev,
      [clientId]: message
    }));
  };

  const handleScheduling = (clientId, type, option, datetime = null) => {
    let processedDatetime = datetime;
    
    // Convert datetime-local input to ISO string for backend
    if (datetime && option === 'specific') {
      // datetime-local input is in format: "2024-01-15T14:30"
      // Convert to ISO string with timezone info
      const date = new Date(datetime);
      processedDatetime = date.toISOString();
    }
    
    setSchedulingOptions(prev => ({
      ...prev,
      [`${clientId}_${type}`]: { option, datetime: processedDatetime }
    }));
  };

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
      <span className="text-gray-600">Loading...</span>
    </div>
  );

  // 24-Hour Window Warning Modal
  const FreeMessageWarningModal = () => (
    showFreeMessageWarning && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ 24-Hour Window Rule</h2>
            <div className="text-left space-y-4 mb-6">
              <p className="text-gray-600">
                You cannot send custom messages outside the 24-hour window after the last message from the client.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">💡 What you can do:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Choose one of the template messages above</li>
                  <li>• Wait for the client to respond (resets the 24h window)</li>
                  <li>• Use voice messages via WhatsApp for AI transcription</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📱 Template Messages:</h3>
                <p className="text-sm text-gray-600">
                  Template messages can always be sent and will initiate conversations with clients.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFreeMessageWarning(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Add Client Modal Component
  const AddClientModal = ({ isOpen, onClose }) => {
    const [newClient, setNewClient] = useState({
      name: '',
      phone_number: '',
      country: 'USA',
      timezone: coachTimezone,
      categories: []
    });

    if (!isOpen) return null;

    const handleSave = async () => {
      if (newClient.name && newClient.phone_number) {
        const success = await addNewClient(newClient);
        if (success) {
          onClose();
          setNewClient({
            name: '',
            phone_number: '',
            country: 'USA',
            timezone: coachTimezone,
            categories: []
          });
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Client Name"
              value={newClient.name}
              onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="tel"
              placeholder="Phone Number"
              value={newClient.phone_number}
              onChange={(e) => setNewClient({...newClient, phone_number: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={newClient.timezone}
              onChange={(e) => setNewClient({...newClient, timezone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>

            <div>
              <label className="block text-sm font-medium mb-2">Categories:</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      if (newClient.categories.includes(category)) {
                        setNewClient({
                          ...newClient,
                          categories: newClient.categories.filter(c => c !== category)
                        });
                      } else {
                        setNewClient({
                          ...newClient,
                          categories: [...newClient.categories, category]
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newClient.categories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Client
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                onClick={exportToGoogleSheets}
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
        
        {/* Analytics Section */}
        {coachStats && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Your Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{coachStats.total_clients || 0}</div>
                <div className="text-sm text-gray-500">Total Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{coachStats.messages_sent || 0}</div>
                <div className="text-sm text-gray-500">Messages Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{coachStats.active_goals || 0}</div>
                <div className="text-sm text-gray-500">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{availableCategories.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        )}

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

        {/* Quick Client Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">👥 Recent Clients</h2>
            <button
              onClick={() => setCurrentStep('manage-clients')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allClients.slice(0, 6).map(client => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{client.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setCurrentStep('edit-client');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${client.name}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{client.phone_number}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.categories?.slice(0, 2).map(cat => (
                    <span key={cat} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                  {client.categories?.length > 2 && (
                    <span className="text-xs text-gray-500">+{client.categories.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const renderClientSelection = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Clients</h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddClientModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
              
              <button
                onClick={importGoogleContacts}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Google Contacts
              </button>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    importFromFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="file-import"
              />
              <button
                onClick={() => document.getElementById('file-import').click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV/Excel
              </button>
            </div>
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

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Filter by Categories</h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    if (clientCategories.includes(category)) {
                      setClientCategories(prev => prev.filter(c => c !== category));
                    } else {
                      setClientCategories(prev => [...prev, category]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    clientCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
              
              <button
                onClick={() => {
                  const customCategory = prompt('Enter new category name:');
                  if (customCategory && customCategory.trim()) {
                    addCustomCategory(customCategory.trim());
                  }
                }}
                className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-600 hover:border-gray-400"
              >
                + Add Category
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {allClients
              .filter(client => 
                clientCategories.length === 0 || 
                client.categories.some(cat => clientCategories.includes(cat))
              )
              .map(client => (
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
        
        <AddClientModal 
          isOpen={showAddClientModal} 
          onClose={() => setShowAddClientModal(false)} 
        />
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
            return (
              <div key={clientId} className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{client.name}</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Default Messages (Template Messages):</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    💡 These messages are sent as WhatsApp templates and can initiate conversations
                  </p>
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
                        <div className="flex items-center justify-between">
                          <span>{message}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Template
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Custom Message:</h4>
                  <textarea
                    value={celebrationMessages[clientId] || ''}
                    onChange={(e) => handleCelebrationMessageChange(clientId, e.target.value)}
                    placeholder="Type your custom celebration message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: You can also send voice messages via WhatsApp for AI transcription & correction
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">⏰ When to send:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleScheduling(clientId, 'celebration', 'now')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_celebration`]?.option === 'now'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Send className="w-5 h-5 mx-auto mb-1" />
                      Send Now
                    </button>
                    
                    <button
                      onClick={() => handleScheduling(clientId, 'celebration', 'specific')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_celebration`]?.option === 'specific'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mx-auto mb-1" />
                      Specific Time
                    </button>
                    
                    <button
                      onClick={() => handleScheduling(clientId, 'celebration', 'recurring')}
                      className={`p-3 border rounded-lg transition-colors ${
                        schedulingOptions[`${clientId}_celebration`]?.option === 'recurring'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      Recurring
                    </button>
                  </div>
                  
                  {schedulingOptions[`${clientId}_celebration`]?.option === 'specific' && (
                    <input
                      type="datetime-local"
                      onChange={(e) => handleScheduling(clientId, 'celebration', 'specific', e.target.value)}
                      className="w-full mt-3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                  
                  {schedulingOptions[`${clientId}_celebration`]?.option === 'recurring' && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium mb-2">Repeat every:</label>
                      <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCurrentStep('clients')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={sendCelebrationMessages}
                disabled={loading || Object.values(celebrationMessages).every(msg => !msg?.trim())}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Celebration Only
              </button>
              
              <button 
                onClick={() => setCurrentStep('accountability')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Accountability
              </button>
            </div>
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
            return (
              <div key={clientId} className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{client.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Categories: {client.categories.join(', ')}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Default Messages (Template Messages):</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    💡 These messages are sent as WhatsApp templates and can initiate conversations
                  </p>
                  <div className="grid gap-2">
                    {defaultAccountabilityMessages.map((message, index) => (
                      <button
                        key={index}
                        onClick={() => handleAccountabilityMessage(clientId, message)}
                        className={`p-3 text-left rounded-lg border transition-colors ${
                          accountabilityMessages[clientId] === message
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{message}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Template
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Custom Accountability Message:</h4>
                  <textarea
                    value={accountabilityMessages[clientId] || ''}
                    onChange={(e) => handleAccountabilityMessageChange(clientId, e.target.value)}
                    placeholder="Type your custom accountability message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
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
                  
                  {schedulingOptions[`${clientId}_accountability`]?.option === 'recurring' && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium mb-2">Repeat every:</label>
                      <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
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
            
            <div className="flex gap-3">
              <button 
                onClick={sendAccountabilityMessages}
                disabled={loading || Object.values(accountabilityMessages).every(msg => !msg?.trim())}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Accountability Only
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
            onClick={exportToGoogleSheets}
            className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            View Google Sheet
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced client management renders
  const renderClientManagement = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Client Management</h2>
            <button
              onClick={() => setCurrentStep('dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="grid gap-4">
            {allClients.map(client => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{client.name}</h3>
                    <p className="text-gray-600">{client.phone_number}</p>
                    <p className="text-sm text-gray-500">{client.country} • {client.timezone}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.categories?.map(cat => (
                        <span key={cat} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setCurrentStep('edit-client');
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${client.name}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditClient = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Client</h2>
            <button
              onClick={() => {
                setEditingClient(null);
                setCurrentStep('manage-clients');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {editingClient && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const clientData = {
                name: formData.get('name'),
                phone_number: formData.get('phone_number'),
                country: formData.get('country'),
                timezone: formData.get('timezone'),
                categories: formData.get('categories').split(',').map(c => c.trim()).filter(c => c)
              };
              
              const success = await updateClient(editingClient.id, clientData);
              if (success) {
                setEditingClient(null);
                setCurrentStep('manage-clients');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingClient.name}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    name="phone_number"
                    type="tel"
                    defaultValue={editingClient.phone_number}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      name="country"
                      type="text"
                      defaultValue={editingClient.country}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      name="timezone"
                      defaultValue={editingClient.timezone}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma-separated)</label>
                  <input
                    name="categories"
                    type="text"
                    defaultValue={editingClient.categories?.join(', ') || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Health, Finance, Business"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClient(null);
                    setCurrentStep('manage-clients');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <div className="font-sans">
      <FreeMessageWarningModal />
      {currentStep === 'barcode' && renderBarcodeScanner()}
      {currentStep === 'dashboard' && renderDashboard()}
      {currentStep === 'clients' && renderClientSelection()}
      {currentStep === 'manage-clients' && renderClientManagement()}
      {currentStep === 'edit-client' && renderEditClient()}
      {currentStep === 'celebration' && renderCelebration()}
      {currentStep === 'accountability' && renderAccountability()}
      {currentStep === 'confirmation' && renderConfirmation()}
    </div>
  );
};

export default CoachingSystem;