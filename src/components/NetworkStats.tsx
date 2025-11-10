import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { getTokenPrice } from '../utils';

interface Props {
  web3: Web3 | null;
}

const NetworkStats: React.FC<Props> = ({ web3 }) => {
  const [stats, setStats] = useState({ blockNumber: '-', vcPrice: '-', networkStatus: 'Loading...', rpcStatus: '-' });

  useEffect(() => {
    const loadStats = async () => {
      if (!web3) return;
      try {
        const blockNumber = await web3.eth.getBlockNumber();
        const priceData = await getTokenPrice('vinuchain');
        setStats({
          blockNumber: blockNumber.toString(),
          vcPrice: priceData.usd ? `$${priceData.usd.toFixed(4)}` : 'Unavailable',
          networkStatus: '✅ Active',
          rpcStatus: web3.currentProvider instanceof Object ? (web3.currentProvider as any).host : 'Unknown',
        });
      } catch (error) {
        setStats(prev => ({ ...prev, networkStatus: 'Failed to load', vcPrice: 'Unavailable' }));
      }
    };
    loadStats();
  }, [web3]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div><strong>Latest Block:</strong> {stats.blockNumber}</div>
      <div><strong>Gas Price:</strong> 0 (Feeless)</div>
      <div><strong>VC Price:</strong> {stats.vcPrice} USD</div>
      <div><strong>Network:</strong> {stats.networkStatus}</div>
      <div><strong>RPC:</strong> {stats.rpcStatus}</div>
    </div>
  );
};

export default NetworkStats;
