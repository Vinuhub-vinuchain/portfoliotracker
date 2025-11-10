import React, { useState } from 'react';
import Web3 from 'web3';
import { Token } from '../types';
import { showError, showSuccess } from '../utils';

interface Props {
  web3: Web3 | null;
  currentAddress: string;
  onAddToken: (token: Token) => void;
  tokens: Token[];
  onRemoveToken: (contract: string) => void;
}

const ERC20_ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"}
];

const TokenAdder: React.FC<Props> = ({ web3, currentAddress, onAddToken, tokens, onRemoveToken }) => {
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenContract, setTokenContract] = useState('');

  const addToken = async () => {
    if (!web3 || !web3.utils.isAddress(tokenContract)) {
      showError('Invalid contract address. Please verify.');
      return;
    }
    try {
      const tokenContractInstance = new web3.eth.Contract(ERC20_ABI, tokenContract);
      let symbol = tokenSymbol || 'Unknown';
      let decimals = 18;
      try {
        if (!tokenSymbol) symbol = await tokenContractInstance.methods.symbol().call();
        decimals = await tokenContractInstance.methods.decimals().call();
      } catch (err) {
        console.warn(`Failed to fetch symbol/decimals for ${tokenContract}: ${(err as Error).message}`);
      }
      const balanceWei = await tokenContractInstance.methods.balanceOf(currentAddress).call();
      const balance = parseFloat(balanceWei) / Math.pow(10, decimals);
      const token: Token = { symbol, contract: tokenContract };
      onAddToken(token);
      showSuccess(`Token ${symbol} added and displayed in portfolio! Balance: ${balance.toFixed(6)}`);
      setTokenSymbol('');
      setTokenContract('');
    } catch (error) {
      showError(`Failed to add token. Verify contract address: ${(error as Error).message}`);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-4">Add ERC-20 Token</h3>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          placeholder="Symbol (optional, auto-detected)"
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <input
          type="text"
          value={tokenContract}
          onChange={(e) => setTokenContract(e.target.value)}
          placeholder="Contract address (0x...)"
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <button className="bg-green-500 text-black px-4 py-2 rounded-lg" onClick={addToken}>
          Add Token
        </button>
      </div>
      <div>
        <h4 className="text-md font-semibold">Tracked Tokens</h4>
        {tokens.length === 0 ? (
          <p className="text-gray-500">No tokens added.</p>
        ) : (
          tokens.map((token, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b border-gray-700">
              <span>{token.symbol} ({shortenAddress(token.contract)})</span>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm"
                onClick={() => onRemoveToken(token.contract)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TokenAdder;
