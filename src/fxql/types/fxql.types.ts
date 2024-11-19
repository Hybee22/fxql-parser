
export interface FXQLStatement {
  sourceCurrency: string;
  destinationCurrency: string;
  buyRate: number;
  sellRate: number;
  cap: number;
}

export interface FXQLParseResult {
  success: boolean;
  data?: FXQLStatement;
  error?: string;
}

export interface FXQLResponse {
  success: boolean;
  data?: any;
  error?: string;
} 