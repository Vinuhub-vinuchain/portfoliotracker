import { render, screen } from '@testing-library/react';
import PortfolioTable from '../src/components/PortfolioTable';

test('renders VC and added tokens in portfolio table', () => {
  const portfolioData = [
    { symbol: 'VC (Native)', balance: 10, price_usd: 0.1234, value_usd: 1.234, contract: 'native' },
    { symbol: 'TEST', balance: 100, price_usd: 0, value_usd: 0, contract: '0x123' },
  ];
  render(<PortfolioTable portfolioData={portfolioData} totalValue={1.234} explorerUrl="https://vinuexplorer.org" />);
  expect(screen.getByText('VC (Native)')).toBeInTheDocument();
  expect(screen.getByText('TEST')).toBeInTheDocument();
  expect(screen.getByText('10.000000')).toBeInTheDocument();
  expect(screen.getByText('$0.1234')).toBeInTheDocument();
  expect(screen.getByText('$1.23')).toBeInTheDocument();
  expect(screen.getByText('100.0%')).toBeInTheDocument();
});
