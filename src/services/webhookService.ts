import { v4 as uuidv4 } from 'uuid';
import type { WebhookEndpoint, WebhookRequest, WebhookStats } from '../types/webhook';

// Mock data storage
let mockEndpoints: WebhookEndpoint[] = [];
let mockRequests: WebhookRequest[] = [];

// Generate some sample data
const generateSampleData = () => {
  const now = new Date();
  
  // Sample endpoints
  const endpoint1: WebhookEndpoint = {
    id: uuidv4(),
    url: `https://webhook-inspector.com/hooks/${uuidv4()}/`,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    expiresAt: new Date(now.getTime() + 58 * 60 * 1000), // 58 minutes from now
    requestCount: 5,
    maxRequests: 100,
    isActive: true,
  };

  const endpoint2: WebhookEndpoint = {
    id: uuidv4(),
    url: `https://webhook-inspector.com/hooks/${uuidv4()}/`,
    createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
    requestCount: 12,
    maxRequests: 50,
    isActive: true,
  };

  mockEndpoints = [endpoint1, endpoint2];

  // Sample requests
  const sampleRequests: Omit<WebhookRequest, 'id'>[] = [
    {
      endpointId: endpoint1.id,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-Hookshot/abc123',
        'X-GitHub-Event': 'push',
        'X-GitHub-Delivery': 'def456',
      },
      body: JSON.stringify({
        ref: 'refs/heads/main',
        repository: {
          name: 'webhook-test',
          full_name: 'user/webhook-test',
        },
        commits: [
          {
            id: 'abc123def456',
            message: 'Update README.md',
            author: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        ],
      }, null, 2),
      contentType: 'application/json',
      ipAddress: '192.30.252.1',
      timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
      userAgent: 'GitHub-Hookshot/abc123',
    },
    {
      endpointId: endpoint1.id,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Stripe/1.0',
        'Stripe-Signature': 'v1=abc123def456',
      },
      body: JSON.stringify({
        id: 'evt_1234567890',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_1234567890',
            amount: 2000,
            currency: 'usd',
            status: 'succeeded',
          },
        },
      }, null, 2),
      contentType: 'application/json',
      ipAddress: '54.187.174.169',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      userAgent: 'Stripe/1.0',
    },
    {
      endpointId: endpoint2.id,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Twilio/1.0',
      },
      body: 'From=%2B1234567890&To=%2B0987654321&Body=Hello+World&MessageSid=SMxxxxxx',
      contentType: 'application/x-www-form-urlencoded',
      ipAddress: '54.172.60.0',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
      userAgent: 'Twilio/1.0',
    },
  ];

  mockRequests = sampleRequests.map(req => ({
    ...req,
    id: uuidv4(),
  }));
};

// Initialize sample data
generateSampleData();

export const webhookService = {
  // Endpoints
  async getEndpoints(): Promise<WebhookEndpoint[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockEndpoints]), 300);
    });
  },

  async createEndpoint(endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt'>): Promise<WebhookEndpoint> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEndpoint: WebhookEndpoint = {
          ...endpoint,
          id: uuidv4(),
          createdAt: new Date(),
        };
        mockEndpoints.push(newEndpoint);
        resolve(newEndpoint);
      }, 500);
    });
  },

  async deleteEndpoint(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockEndpoints = mockEndpoints.filter(ep => ep.id !== id);
        mockRequests = mockRequests.filter(req => req.endpointId !== id);
        resolve();
      }, 300);
    });
  },

  // Requests
  async getRequests(endpointId?: string): Promise<WebhookRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let requests = [...mockRequests];
        if (endpointId) {
          requests = requests.filter(req => req.endpointId === endpointId);
        }
        // Sort by timestamp, newest first
        requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(requests);
      }, 300);
    });
  },

  // Stats
  async getStats(): Promise<WebhookStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const stats: WebhookStats = {
          totalEndpoints: mockEndpoints.length,
          activeEndpoints: mockEndpoints.filter(ep => 
            ep.isActive && new Date() < ep.expiresAt
          ).length,
          totalRequests: mockRequests.length,
          requestsToday: mockRequests.filter(req => 
            new Date(req.timestamp) >= todayStart
          ).length,
        };
        resolve(stats);
      }, 200);
    });
  },

  // Simulate real-time updates
  async simulateIncomingRequest(endpointId: string): Promise<WebhookRequest> {
    const methods = ['POST', 'GET', 'PUT', 'PATCH'];
    const contentTypes = ['application/json', 'application/x-www-form-urlencoded', 'text/plain'];
    
    const newRequest: WebhookRequest = {
      id: uuidv4(),
      endpointId,
      method: methods[Math.floor(Math.random() * methods.length)],
      headers: {
        'Content-Type': contentTypes[Math.floor(Math.random() * contentTypes.length)],
        'User-Agent': 'TestClient/1.0',
        'X-Request-ID': uuidv4(),
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a simulated webhook request',
          random: Math.random(),
        },
      }, null, 2),
      contentType: 'application/json',
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: new Date(),
      userAgent: 'TestClient/1.0',
    };

    mockRequests.unshift(newRequest);
    
    // Update endpoint request count
    const endpoint = mockEndpoints.find(ep => ep.id === endpointId);
    if (endpoint) {
      endpoint.requestCount++;
    }

    return newRequest;
  },
};

export default webhookService;
