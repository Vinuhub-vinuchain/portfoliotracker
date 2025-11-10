import React, { useState } from 'react';
import Web3 from 'web3';
import { shortenAddress } from '../utils';

interface Props {
  web3: Web3 | null;
  onConnect: (address: string) => void;
  isMetaMaskDetected: boolean;
  currentAddress: string;
  watchlist: string[];
  setWatchlist: (watchlist: string[]) => void;
}

const WalletConnect: React.FC<Props> = ({ web3, onConnect, isMetaMaskDetected, currentAddress, watchlist, setWatchlist }) => {
  const [walletInput, setWalletInput] = useState('');
  const [status, setStatus] = useState<string>('');

  const connectWallet = async () => {
    if (!web3 || !window.ethereum) {
      setStatus('MetaMask not detected');
      return;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      onConnect(accounts[0]);
      setStatus(`Connected: ${shortenAddress(accounts[0])}`);
    } catch (error) {
      setStatus(`Connection failed: ${(error as Error).message}`);
    }
  };

  const trackAddress = async () => {
    if (web3 && web3.utils.isAddress(walletInput)) {
      onConnect(walletInput);
      setStatus(`Tracking: ${shortenAddress(walletInput)}`);
    } else {
      setStatus('Invalid address');
    }
  };

  const removeFromWatchlist = (index: number) => {
    const newWatchlist = watchlist.filter((_, i) => i !== index);
    setWatchlist(newWatchlist);
    localStorage.setItem('vinuWatchlist', JSON.stringify(newWatchlist));
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Wallet & Tokens</h3>
        <div>
          <button
            className="bg-white text-black px-4 py-2 rounded-lg mr-2 disabled:bg-gray-500"
            onClick={connectWallet}
            disabled={!isMetaMaskDetected}
          >
            🔗 Connect MetaMask
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-lg">📊 Export CSV</button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-lg ml-2">🔗 Share</button>
        </div>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          placeholder="Enter VinuChain wallet address (0x...)"
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <button className="bg-white text-black px-4 py-2 rounded-lg" onClick={trackAddress}>
          Track Address
        </button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded-lg" onClick={() => setWatchlist([walletInput, ...watchlist.filter(a => a !== walletInput).slice(0, 9)])}>
          ⭐ Watchlist
        </button>
      </div>
      <div className="text-sm p-2 rounded-lg bg-gray-800">{status}</div>
      <div>
        <h4 className="text-md font-semibold mt-4">Watchlist</h4>
        {watchlist.length === 0 ? (
          <p className="text-gray-500">No addresses in watchlist.</p>
        ) : (
          watchlist.map((address, index) => (
            <div key={address} className="flex justify-between items-center p-2 border-b border-gray-700">
              <span>{shortenAddress(address)}</span>
              <div>
                <button className="bg-white text-black px-2 py-1 rounded-lg text-sm mr-2" onClick={() => setWalletInput(address)}>
                  Load
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm" onClick={() => removeFromWatchlist(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
