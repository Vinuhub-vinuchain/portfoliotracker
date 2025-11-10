import React, { useEffect } from 'react';
import { Chart } from 'chart.js';
import { PortfolioItem } from '../types';
import { shortenAddress } from '../utils';

interface Props {
  portfolioData: PortfolioItem[];
  totalValue: number;
  explorerUrl: string;
}

const PortfolioTable: React.FC<Props> = ({ portfolioData, totalValue, explorerUrl }) => {
  useEffect(() => {
    const ctx = document.getElementById('portfolioChart') as HTMLCanvasElement;
    let chartInstance: Chart | null = null;
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: portfolioData.length > 0 ? portfolioData.map(item => item.symbol) : ['No Data'],
          datasets: [{
            data: portfolioData.length > 0 ? portfolioData.map(item => item.value_usd || item.balance) : [1],
            backgroundColor: portfolioData.length > 0 
              ? ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'].slice(0, portfolioData.length)
              : ['#333333'],
            borderColor: '#000000',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#ffffff', font: { size: 12 } } } },
        },
      });
    }
    return () => chartInstance?.destroy();
  }, [portfolioData]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Portfolio Analytics</h3>
        <span id="portfolioLoading" className="hidden animate-spin h-5 w-5 border-2 border-t-white rounded-full"></span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h4>Total Value: ${totalValue.toFixed(2)}</h4>
          <p>24h Change: <span>Loading...</span></p>
        </div>
        <div>
          <h4>Top Holding</h4>
          <p>
            {portfolioData.length > 0 
              ? `${portfolioData.reduce((prev, curr) => prev.value_usd > curr.value_usd ? prev : curr, { symbol: '-', value_usd: 0 }).symbol}: $${totalValue.toFixed(2)}`
              : '-'}
          </p>
        </div>
      </div>
      <div className="h-96 bg-gray-800 rounded-lg p-4 mb-4">
        <canvas id="portfolioChart"></canvas>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-xs uppercase">
            <th className="p-3 text-left">Asset</th>
            <th className="p-3 text-left">Balance</th>
            <th className="p-3 text-left">Price (USD)</th>
            <th className="p-3 text-left">Value (USD)</th>
            <th className="p-3 text-left">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {portfolioData.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500">
                No tokens found. Add tokens or check address.
              </td>
            </tr>
          ) : portfolioData.every(item => item.balance === 0 && item.symbol === 'VC (Native)') ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500">
                No tokens held. VC (Native) balance is 0.
              </td>
            </tr>
          ) : (
            portfolioData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="p-3">{item.symbol}<br /><small>{shortenAddress(item.contract)}</small></td>
                <td className="p-3">{item.balance.toFixed(6)}</td>
                <td className="p-3">${item.price_usd.toFixed(4)}</td>
                <td className="p-3">${item.value_usd.toFixed(2)}</td>
                <td className="p-3">{totalValue > 0 ? (item.value_usd / totalValue * 100).toFixed(1) : 0}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="mt-4">
        <a href={`${explorerUrl}/address/${currentAddress}`} target="_blank" className="text-gray-500">
          View Full Portfolio on VinuExplorer
        </a>
      </p>
    </div>
  );
};

export default PortfolioTable;
