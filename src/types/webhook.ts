export interface WebhookEndpoint {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  requestCount: number;
  maxRequests?: number;
  isActive: boolean;
}

export interface WebhookRequest {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  ipAddress: string;
  timestamp: Date;
  userAgent?: string;
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  method?: string;
  contentType?: string;
  searchQuery?: string;
}

export interface WebhookStats {
  totalEndpoints: number;
  activeEndpoints: number;
  totalRequests: number;
  requestsToday: number;
}
