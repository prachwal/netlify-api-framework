// Hello controller types

export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface HelloRequest {
  name?: string;
}
