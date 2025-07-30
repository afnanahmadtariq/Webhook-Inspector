import { useState, useEffect } from 'react';
import './App.css';
import DashboardHeader from './components/DashboardHeader';
import EndpointManager from './components/EndpointManager';
import RequestViewer from './components/RequestViewer';
import webhookService from './services/webhookService';
import type { WebhookEndpoint, WebhookRequest, WebhookStats, FilterOptions } from './types/webhook';

function App() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    totalEndpoints: 0,
    activeEndpoints: 0,
    totalRequests: 0,
    requestsToday: 0,
  });
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [endpointsData, requestsData, statsData] = await Promise.all([
          webhookService.getEndpoints(),
          webhookService.getRequests(),
          webhookService.getStats(),
        ]);
        
        setEndpoints(endpointsData);
        setRequests(requestsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      if (endpoints.length > 0) {
        const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        if (randomEndpoint.isActive && new Date() < randomEndpoint.expiresAt) {
          try {
            const newRequest = await webhookService.simulateIncomingRequest(randomEndpoint.id);
            setRequests(prev => [newRequest, ...prev]);
            
            // Update stats
            const updatedStats = await webhookService.getStats();
            setStats(updatedStats);
            
            // Update endpoint request count
            setEndpoints(prev => prev.map(ep => 
              ep.id === randomEndpoint.id 
                ? { ...ep, requestCount: ep.requestCount + 1 }
                : ep
            ));
          } catch (error) {
            console.error('Error simulating request:', error);
          }
        }
      }
    }, 10000); // Simulate new request every 10 seconds

    return () => clearInterval(interval);
  }, [endpoints]);

  const handleCreateEndpoint = async (endpointData: Omit<WebhookEndpoint, 'id' | 'createdAt'>) => {
    try {
      const newEndpoint = await webhookService.createEndpoint(endpointData);
      setEndpoints(prev => [newEndpoint, ...prev]);
      
      // Update stats
      const updatedStats = await webhookService.getStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Error creating endpoint:', error);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    try {
      await webhookService.deleteEndpoint(id);
      setEndpoints(prev => prev.filter(ep => ep.id !== id));
      setRequests(prev => prev.filter(req => req.endpointId !== id));
      
      // Update stats
      const updatedStats = await webhookService.getStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Error deleting endpoint:', error);
    }
  };

  // Filter requests based on current filters
  const filteredRequests = requests.filter(request => {
    if (filters.method && request.method !== filters.method) {
      return false;
    }
    
    if (filters.contentType && !request.contentType.includes(filters.contentType)) {
      return false;
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        request.body.toLowerCase().includes(query) ||
        request.ipAddress.toLowerCase().includes(query) ||
        Object.values(request.headers).some(header => 
          header.toLowerCase().includes(query)
        )
      );
    }
    
    if (filters.startDate && new Date(request.timestamp) < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && new Date(request.timestamp) > filters.endDate) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Webhook Inspector...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader stats={stats} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <EndpointManager
          endpoints={endpoints}
          onCreateEndpoint={handleCreateEndpoint}
          onDeleteEndpoint={handleDeleteEndpoint}
          baseUrl="https://webhook-inspector.com"
        />
        
        <RequestViewer
          requests={filteredRequests}
          onFilterChange={setFilters}
          filters={filters}
        />
      </div>
    </div>
  );
}

export default App;
