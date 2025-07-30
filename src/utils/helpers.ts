import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns';

export const formatTimestamp = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm:ss');
  }
  
  return format(dateObj, 'MMM dd, HH:mm:ss');
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getHttpMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    GET: 'text-blue-600 bg-blue-50',
    POST: 'text-green-600 bg-green-50',
    PUT: 'text-yellow-600 bg-yellow-50',
    PATCH: 'text-orange-600 bg-orange-50',
    DELETE: 'text-red-600 bg-red-50',
    HEAD: 'text-purple-600 bg-purple-50',
    OPTIONS: 'text-gray-600 bg-gray-50',
  };
  
  return colors[method.toUpperCase()] || 'text-gray-600 bg-gray-50';
};

export const generateWebhookUrl = (baseUrl: string, endpointId: string): string => {
  return `${baseUrl}/hooks/${endpointId}/`;
};

export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const formatJson = (str: string): string => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
};
