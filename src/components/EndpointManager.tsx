import React, { useState } from 'react';
import { Plus, Copy, Trash2, ExternalLink, Clock, Activity } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { WebhookEndpoint } from '../types/webhook';
import { copyToClipboard, formatRelativeTime, generateWebhookUrl } from '../utils/helpers';

interface EndpointManagerProps {
  endpoints: WebhookEndpoint[];
  onCreateEndpoint: (endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt'>) => void;
  onDeleteEndpoint: (id: string) => void;
  baseUrl?: string;
}

const EndpointManager: React.FC<EndpointManagerProps> = ({
  endpoints,
  onCreateEndpoint,
  onDeleteEndpoint,
  baseUrl = 'https://your-webhook-inspector.com',
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newEndpointTTL, setNewEndpointTTL] = useState(60); // minutes
  const [maxRequests, setMaxRequests] = useState<number | undefined>(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateEndpoint = () => {
    const endpointId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + newEndpointTTL * 60 * 1000);
    
    const newEndpoint: Omit<WebhookEndpoint, 'id' | 'createdAt'> = {
      url: generateWebhookUrl(baseUrl, endpointId),
      expiresAt,
      requestCount: 0,
      maxRequests: maxRequests || undefined,
      isActive: true,
    };

    onCreateEndpoint(newEndpoint);
    setIsCreating(false);
    setNewEndpointTTL(60);
    setMaxRequests(100);
  };

  const handleCopyUrl = async (url: string, id: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getStatusColor = (endpoint: WebhookEndpoint) => {
    if (!endpoint.isActive || new Date() > endpoint.expiresAt) {
      return 'text-red-600 bg-red-50';
    }
    if (endpoint.maxRequests && endpoint.requestCount >= endpoint.maxRequests) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (endpoint: WebhookEndpoint) => {
    if (!endpoint.isActive) return 'Inactive';
    if (new Date() > endpoint.expiresAt) return 'Expired';
    if (endpoint.maxRequests && endpoint.requestCount >= endpoint.maxRequests) {
      return 'Limit Reached';
    }
    return 'Active';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Webhook Endpoints</h2>
            <p className="text-gray-600 mt-1">
              Create temporary endpoints to receive and inspect webhooks
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Endpoint
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Endpoint</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time to Live (minutes)
              </label>
              <input
                type="number"
                value={newEndpointTTL}
                onChange={(e) => setNewEndpointTTL(Number(e.target.value))}
                min="1"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Requests (optional)
              </label>
              <input
                type="number"
                value={maxRequests || ''}
                onChange={(e) => setMaxRequests(e.target.value ? Number(e.target.value) : undefined)}
                min="1"
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreateEndpoint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Endpoint
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {endpoints.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No webhook endpoints yet. Create your first endpoint to get started.
          </div>
        ) : (
          endpoints.map((endpoint) => (
            <div key={endpoint.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        endpoint
                      )}`}
                    >
                      {getStatusText(endpoint)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {formatRelativeTime(endpoint.createdAt)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-900 break-all">
                        {endpoint.url}
                      </code>
                      <button
                        onClick={() => handleCopyUrl(endpoint.url, endpoint.id)}
                        className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === endpoint.id ? (
                          <span className="text-green-600 text-xs">Copied!</span>
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      <span>{endpoint.requestCount} requests</span>
                      {endpoint.maxRequests && (
                        <span>/ {endpoint.maxRequests}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Expires {formatRelativeTime(endpoint.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(endpoint.url, '_blank')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEndpoint(endpoint.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete endpoint"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EndpointManager;
