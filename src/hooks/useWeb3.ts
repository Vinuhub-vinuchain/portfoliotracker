import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { showError } from '../utils';

const useWeb3 = (rpcUrls: string[]) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isMetaMaskDetected, setIsMetaMaskDetected] = useState(false);

  const initWeb3 = async () => {
    for (const url of rpcUrls) {
      try {
        const web3Instance = new Web3(url);
        await web3Instance.eth.getBlockNumber();
        setWeb3(web3Instance);
        return;
      } catch (error) {
        console.warn(`RPC ${url} failed: ${(error as Error).message}`);
      }
    }
    showError('All RPCs failed. Try again later.');
  };

  useEffect(() => {
    setIsMetaMaskDetected(!!window.ethereum && window.ethereum.isMetaMask);
  }, []);

  return { web3, initWeb3, isMetaMaskDetected };
};

export default useWeb3;
