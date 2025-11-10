import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WalletConnect from './components/WalletConnect';
import NetworkStats from './components/NetworkStats';
import PortfolioTable from './components/PortfolioTable';
import TokenAdder from './components/TokenAdder';
import PriceAlert from './components/PriceAlert';
import useWeb3 from './hooks/useWeb3';
import usePortfolio from './hooks/usePortfolio';
import { Token, PortfolioItem } from './types';
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
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
          alt="VinuChain Logo"
          className="mx-auto max-w-[150px] mb-2"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          VinuChain Portfolio Tracker
        </h1>
        <p className="text-gray-500 text-sm">Auto-displays VC and tokens with blockchain logs</p>
      </header>

      <WalletConnect
        web3={web3}
        onConnect={handleConnect}
        isMetaMaskDetected={isMetaMaskDetected}
        currentAddress={currentAddress}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />

      <NetworkStats web3={web3} />

      <PortfolioTable portfolioData={portfolioData} totalValue={totalValue} explorerUrl={CONFIG.EXPLORER_URL} />

      <TokenAdder web3={web3} currentAddress={currentAddress} onAddToken={handleAddToken} tokens={tokens} onRemoveToken={handleRemoveToken} />

      <PriceAlert coingeckoId={CONFIG.COINGECKO_VC_ID} />

      <div id="errorDisplay" className="hidden p-3 mt-2 rounded-lg bg-red-900 text-red-400"></div>
    </div>
  );
};

export default App;
