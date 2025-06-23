// Database controller types

export interface DatabaseStatus {
  connected: boolean;
  host: string;
  port: number;
  database: string;
  collections: string[];
  indexes: Record<string, string[]>;
  stats: {
    totalDocuments: number;
    totalSize: string;
    avgObjSize: string;
  };
}

export interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy';
  database: DatabaseStatus;
  timestamp: string;
}