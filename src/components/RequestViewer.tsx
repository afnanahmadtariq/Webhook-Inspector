import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, Copy, Download } from 'lucide-react';
import type { WebhookRequest, FilterOptions } from '../types/webhook';
import { 
  formatTimestamp, 
  getHttpMethodColor, 
  copyToClipboard, 
  formatBytes,
  isValidJson,
  formatJson 
} from '../utils/helpers';

interface RequestViewerProps {
  requests: WebhookRequest[];
  onFilterChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}

const RequestViewer: React.FC<RequestViewerProps> = ({
  requests,
  onFilterChange,
  filters,
}) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'headers' | 'body'>('body');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExport = (request: WebhookRequest) => {
    const data = {
      id: request.id,
      timestamp: request.timestamp,
      method: request.method,
      headers: request.headers,
      body: request.body,
      contentType: request.contentType,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-request-${request.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const formatBodyContent = (body: string, contentType: string) => {
    if (contentType.includes('application/json') && isValidJson(body)) {
      return formatJson(body);
    }
    return body;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Webhook Requests</h2>
            <p className="text-gray-600 mt-1">
              {requests.length} request{requests.length !== 1 ? 's' : ''} captured
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  onFilterChange({ ...filters, searchQuery: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select
              value={filters.method || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  method: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={filters.contentType || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  contentType: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="application/json">JSON</option>
              <option value="application/x-www-form-urlencoded">Form Data</option>
              <option value="text/plain">Text</option>
              <option value="application/xml">XML</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onFilterChange({})}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No webhook requests yet. Send a request to one of your endpoints to see it here.
          </div>
        ) : (
          requests.map((request) => {
            const isExpanded = expandedRequest === request.id;
            const bodySize = new Blob([request.body]).size;

            return (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHttpMethodColor(
                          request.method
                        )}`}
                      >
                        {request.method}
                      </span>
                      <span className="text-sm text-gray-600">
                        {request.contentType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatBytes(bodySize)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(request.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      From {request.ipAddress}
                      {request.userAgent && (
                        <span className="ml-2 text-gray-400">
                          • {request.userAgent.substring(0, 60)}
                          {request.userAgent.length > 60 ? '...' : ''}
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-4">
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              onClick={() => setSelectedTab('body')}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                selectedTab === 'body'
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              Request Body
                            </button>
                            <button
                              onClick={() => setSelectedTab('headers')}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                selectedTab === 'headers'
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              Headers ({Object.keys(request.headers).length})
                            </button>
                          </nav>
                        </div>

                        {selectedTab === 'body' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                Request Body
                              </h4>
                              <button
                                onClick={() => handleCopy(request.body, `body-${request.id}`)}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              >
                                {copiedId === `body-${request.id}` ? (
                                  'Copied!'
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto">
                              <code>
                                {formatBodyContent(request.body, request.contentType)}
                              </code>
                            </pre>
                          </div>
                        )}

                        {selectedTab === 'headers' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                Request Headers
                              </h4>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    JSON.stringify(request.headers, null, 2),
                                    `headers-${request.id}`
                                  )
                                }
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              >
                                {copiedId === `headers-${request.id}` ? (
                                  'Copied!'
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-medium text-gray-900">
                                      Header
                                    </th>
                                    <th className="text-left py-2 font-medium text-gray-900">
                                      Value
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(request.headers).map(([key, value]) => (
                                    <tr key={key} className="border-b border-gray-100">
                                      <td className="py-2 font-mono text-gray-700">
                                        {key}
                                      </td>
                                      <td className="py-2 text-gray-600 break-all">
                                        {value}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleExport(request)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Export request"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleExpanded(request.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestViewer;
