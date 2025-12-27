import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { PortfolioItem } from '../types';
import { shortenAddress } from '../utils';


Chart.register(
  ArcElement,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface Props {
  portfolioData: PortfolioItem[];
  totalValue: number;
  explorerUrl: string;
  currentAddress: string;
}

const PortfolioTable: React.FC<Props> = ({
  portfolioData,
  totalValue,
  explorerUrl,
  currentAddress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const labels = portfolioData.length > 0
      ? portfolioData.map(item => item.symbol)
      : ['No Data'];

    const dataValues = portfolioData.length > 0
      ? portfolioData.map(item => item.value_usd ?? item.balance ?? 0)
      : [1];

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FFCD56', '#C9CBCF', '#4BC0C0', '#F7464A',
    ];

    chartInstance.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: portfolioData.length > 0
            ? colors.slice(0, portfolioData.length)
            : ['#333333'],
          borderColor: '#000000',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              color: '#ffffff',
              font: { size: 12 },
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed || 0;
                const percentage = totalValue > 0
                  ? ((value / totalValue) * 100).toFixed(1)
                  : '0';
                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });


    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [portfolioData, totalValue]);


  const topHolding = portfolioData.length > 0
    ? portfolioData.reduce((prev, curr) =>
        (curr.value_usd ?? 0) > (prev.value_usd ?? 0) ? curr : prev
      )
    : null;

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Portfolio Analytics</h3>
        <span id="portfolioLoading" className="hidden animate-spin h-5 w-5 border-2 border-t-white rounded-full"></span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm text-gray-400">Total Value</h4>
          <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          <p className="text-sm text-gray-500">24h Change: <span>Loading...</span></p>
        </div>
        <div>
          <h4 className="text-sm text-gray-400">Top Holding</h4>
          <p className="text-xl font-semibold">
            {topHolding ? `${topHolding.symbol}` : '-'}
          </p>
          <p className="text-sm text-gray-500">
            {topHolding ? `$${topHolding.value_usd?.toFixed(2) ?? '0.00'}` : '-'}
          </p>
        </div>
      </div>

      <div className="h-96 bg-gray-800 rounded-lg p-4 mb-6 relative">
        <canvas ref={canvasRef} />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-800 text-xs uppercase tracking-wider">
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
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No tokens found. Add tokens or check address.
              </td>
            </tr>
          ) : portfolioData.every(item => item.balance === 0 && item.symbol === 'VC (Native)') ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No tokens held. VC (Native) balance is 0.
              </td>
            </tr>
          ) : (
            portfolioData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700 transition-colors">
                <td className="p-3">
                  <div>{item.symbol}</div>
                  <small className="text-gray-500">{shortenAddress(item.contract)}</small>
                </td>
                <td className="p-3">{Number(item.balance).toFixed(6)}</td>
                <td className="p-3">${Number(item.price_usd).toFixed(4)}</td>
                <td className="p-3">${Number(item.value_usd).toFixed(2)}</td>
                <td className="p-3">
                  {totalValue > 0
                    ? ((item.value_usd / totalValue) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="mt-6 text-center">
        <a
          href={`${explorerUrl}/address/${currentAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline text-sm"
        >
          View Full Portfolio on VinuExplorer →
        </a>
      </p>
    </div>
  );
};

export default PortfolioTable;