import { useState, useCallback } from 'react';
import Web3 from 'web3';
import { Token, PortfolioItem } from '../types';
import { getTokenPrice, showError } from '../utils';

const ERC20_ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"}
];

const usePortfolio = (web3: Web3 | null, currentAddress: string, tokens: Token[]) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const loadPortfolio = useCallback(async () => {
    if (!web3 || !currentAddress) return;
    try {
      document.getElementById('portfolioLoading')?.classList.remove('hidden');
      const newPortfolioData: PortfolioItem[] = [];
      let newTotalValue = 0;

      // VC (Native)
      let vcBalance = 0;
      let vcPrice = 0;
      try {
        const vcBalanceWei = await web3.eth.getBalance(currentAddress);
        vcBalance = parseFloat(web3.utils.fromWei(vcBalanceWei, 'ether'));
        const vcPriceData = await getTokenPrice('vinuchain');
        vcPrice = vcPriceData.usd || 0;
      } catch (error) {
        console.warn('VC balance/price error:', error);
      }
      const vcValue = vcBalance * vcPrice;
      newPortfolioData.push({
        symbol: 'VC (Native)',
        balance: vcBalance,
        price_usd: vcPrice,
        value_usd: vcValue,
        contract: 'native',
      });
      newTotalValue += vcValue;

      // Auto-detect ERC-20 tokens
      const tokenContracts = new Set<string>();
      try {
        const latestBlock = await web3.eth.getBlockNumber();
        const fromBlock = Math.max(0, Number(latestBlock) - 50000);
        const topics = [
          web3.utils.sha3('Transfer(address,address,uint256)'),
          null,
          web3.utils.padLeft(currentAddress.toLowerCase(), 64),
        ];
        const logs = await web3.eth.getPastLogs({ fromBlock, toBlock: 'latest', topics });
        logs.forEach(log => log.address && tokenContracts.add(log.address));
      } catch (error) {
        console.warn('Token detection error:', error);
        showError('Failed to detect tokens. Manually added tokens will still display.');
      }

      // Include manually added tokens
      tokens.forEach(token => tokenContracts.add(token.contract));

      // Query balances
      for (const contract of tokenContracts) {
        if (contract === 'native') continue;
        try {
          const tokenContract = new web3.eth.Contract(ERC20_ABI, contract);
          let symbol = tokens.find(t => t.contract.toLowerCase() === contract.toLowerCase())?.symbol || 'Unknown';
          let decimals = 18;
          try {
            if (symbol === 'Unknown') symbol = await tokenContract.methods.symbol().call();
            decimals = await tokenContract.methods.decimals().call();
          } catch (err) {
            console.warn(`Failed to fetch symbol/decimals for ${contract}: ${(err as Error).message}`);
          }
          const balanceWei = await tokenContract.methods.balanceOf(currentAddress).call();
          const balance = parseFloat(balanceWei) / Math.pow(10, decimals);
          newPortfolioData.push({
            symbol,
            balance,
            price_usd: 0,
            value_usd: 0,
            contract,
          });
        } catch (err) {
          console.warn(`Error processing token ${contract}: ${(err as Error).message}`);
        }
      }

      // Sort: VC first, then non-zero balances
      newPortfolioData.sort((a, b) => {
        if (a.symbol === 'VC (Native)') return -1;
        if (b.symbol === 'VC (Native)') return 1;
        return b.balance - a.balance;
      });

      setPortfolioData(newPortfolioData);
      setTotalValue(newTotalValue);
    } catch (error) {
      showError('Failed to load portfolio. Manually added tokens will still display.');
      if (!portfolioData.some(item => item.symbol === 'VC (Native)')) {
        setPortfolioData([{ symbol: 'VC (Native)', balance: 0, price_usd: 0, value_usd: 0, contract: 'native' }]);
      }
    } finally {
      document.getElementById('portfolioLoading')?.classList.add('hidden');
    }
  }, [web3, currentAddress, tokens]);

  return { portfolioData, totalValue, loadPortfolio };
};

export default usePortfolio;
