import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WalletConnect from './components/WalletConnect';
import NetworkStats from './components/NetworkStats';
import PortfolioTable from './components/PortfolioTable';
import TokenAdder from './components/TokenAdder';
import PriceAlert from './components/PriceAlert';
import useWeb3 from './hooks/useWeb3';
import usePortfolio from './hooks/usePortfolio';
import { Token } from './types';
import './styles/globals.css';

const CONFIG = {
  RPC_URLS: ['https://rpc.vinuchain.org', 'https://vinuchain-rpc.com'],
  CHAIN_ID: 207,
  COINGECKO_VC_ID: 'vinuchain',
  EXPLORER_URL: 'https://vinuexplorer.org',
};

const App: React.FC = () => {
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>(JSON.parse(localStorage.getItem('vinuTokens') || '[]'));
  const [watchlist, setWatchlist] = useState<string[]>(JSON.parse(localStorage.getItem('vinuWatchlist') || '[]'));
  const { web3, initWeb3, isMetaMaskDetected } = useWeb3(CONFIG.RPC_URLS);
  const { portfolioData, totalValue, loadPortfolio } = usePortfolio(web3, currentAddress, tokens);

  useEffect(() => {
    initWeb3();
    if (watchlist.length > 0) {
      setCurrentAddress(watchlist[0]);
    }
    const interval = setInterval(() => loadPortfolio(), 60000);
    return () => clearInterval(interval);
  }, [initWeb3, watchlist, loadPortfolio]);

  const handleConnect = async (address: string) => {
    setCurrentAddress(address);
    setWatchlist([address, ...watchlist.filter(a => a !== address).slice(0, 9)]);
    localStorage.setItem('vinuWatchlist', JSON.stringify(watchlist));
    await loadPortfolio();
  };

  const handleAddToken = async (token: Token) => {
    if (!tokens.find(t => t.contract.toLowerCase() === token.contract.toLowerCase())) {
      const newTokens = [...tokens, token];
      setTokens(newTokens);
      localStorage.setItem('vinuTokens', JSON.stringify(newTokens));
      await loadPortfolio();
    }
  };

  const handleRemoveToken = (contract: string) => {
    const newTokens = tokens.filter(t => t.contract !== contract);
    setTokens(newTokens);
    localStorage.setItem('vinuTokens', JSON.stringify(newTokens));
    loadPortfolio();
  };

  return (
    <div className="container mx-auto p-4 text-white bg-black min-h-screen">
      <header className="text-center py-4 border-b border-gray-700 mb-6">
        <img
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/175984769551
