export interface Token {
  symbol: string;
  contract: string;
}

export interface PortfolioItem {
  symbol: string;
  balance: number;
  price_usd: number;
  value_usd: number;
  contract: string;
}
