import React, { useEffect, useState } from "react";
import Web3 from "web3";
import WalletConnect from "./components/WalletConnect";
import NetworkStats from "./components/NetworkStats";
import PortfolioTable from "./components/PortfolioTable";
import TokenAdder from "./components/TokenAdder";
import PriceAlert from "./components/PriceAlert";
import useWeb3 from "./hooks/useWeb3";
import usePortfolio from "./hooks/usePortfolio";
import { Token } from "./types";
import "./styles/globals.css";

const CONFIG = {
  RPC_URLS: ["https://rpc.vinuchain.org", "https://vinuchain-rpc.com"],
  CHAIN_ID: 207,
  COINGECKO_VC_ID: "vinuchain",
  EXPLORER_URL: "https://vinuexplorer.org",
};

const App: React.FC = () => {
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>(
    JSON.parse(localStorage.getItem("vinuTokens") || "[]")
  );
  const [watchlist, setWatchlist] = useState<string[]>(
    JSON.parse(localStorage.getItem("vinuWatchlist") || "[]")
  );
  const [showPortfolio, setShowPortfolio] = useState(false); // NEW: control delayed rendering

  const { web3, initWeb3, isMetaMaskDetected } = useWeb3(CONFIG.RPC_URLS);
  const { portfolioData, totalValue, loadPortfolio } = usePortfolio(
    web3,
    currentAddress,
    tokens
  );

  // Initial load & auto-refresh
  useEffect(() => {
    initWeb3();

    if (watchlist.length > 0 && !currentAddress) {
      setCurrentAddress(watchlist[0]);
    }

    loadPortfolio();

    const interval = setInterval(() => {
      loadPortfolio();
    }, 60000);

    return () => clearInterval(interval);
  }, [initWeb3, watchlist, currentAddress, loadPortfolio]);


  // When wallet connects or address is tracked
  const handleConnect = async (address: string) => {
    setCurrentAddress(address);

    const newWatchlist = [
      address,
      ...watchlist
        .filter((a) => a.toLowerCase() !== address.toLowerCase())
        .slice(0, 9),
    ];
    setWatchlist(newWatchlist);
    localStorage.setItem("vinuWatchlist", JSON.stringify(newWatchlist));

    await loadPortfolio();
  };

  // Add manually tracked token
  const handleAddToken = async (token: Token) => {
    const exists = tokens.some(
      (t) => t.contract.toLowerCase() === token.contract.toLowerCase()
    );
    if (!exists) {
      const newTokens = [...tokens, token];
      setTokens(newTokens);
      localStorage.setItem("vinuTokens", JSON.stringify(newTokens));
      await loadPortfolio();
    }
  };

  // Remove token from tracking
  const handleRemoveToken = (contract: string) => {
    const newTokens = tokens.filter((t) => t.contract !== contract);
    setTokens(newTokens);
    localStorage.setItem("vinuTokens", JSON.stringify(newTokens));
    loadPortfolio();
  };

  return (
    <div className="container mx-auto p-4 text-white bg-black min-h-screen">
      {/* Header */}
      <header className="text-center py-8 border-b border-gray-700 mb-8">
        <img
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
          alt="VinuChain Logo"
          className="mx-auto w-32 md:w-40 mb-4"
        />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          VinuChain Portfolio Tracker
        </h1>
        <p className="text-gray-500 mt-2">
          Track VC & ERC-20 tokens on VinuChain
        </p>
      </header>

      {/* Wallet Connection */}
      <WalletConnect
        web3={web3}
        onConnect={handleConnect}
        isMetaMaskDetected={isMetaMaskDetected}
        currentAddress={currentAddress}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />

      {/* Network Stats */}
      <NetworkStats web3={web3} />

      {/* Portfolio Table */}
   
      <PortfolioTable
        portfolioData={portfolioData}
        totalValue={totalValue}
        explorerUrl={CONFIG.EXPLORER_URL}
        currentAddress={currentAddress}
      />

      {/* Add Custom Token */}
      <TokenAdder
        web3={web3}
        currentAddress={currentAddress}
        onAddToken={handleAddToken}
        tokens={tokens}
        onRemoveToken={handleRemoveToken}
      />

      {/* VC Price Alert */}
      <PriceAlert coingeckoId={CONFIG.COINGECKO_VC_ID} />

      {/* Global Notification */}
      <div
        id="errorDisplay"
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-center hidden z-50 max-w-md w-full"
      ></div>
    </div>
  );
};

export default App;
