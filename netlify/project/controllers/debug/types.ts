// Debug controller types

export interface DebugInfo {
  environment: string;
  nodeVersion: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  headers: Record<string, string>;
  query: Record<string, string>;
  method: string;
  url: string;
}

export interface DebugResponse {
  debug: DebugInfo;
  message: string;
}
