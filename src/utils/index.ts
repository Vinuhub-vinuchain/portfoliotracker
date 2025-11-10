export const getTokenPrice = async (id: string) =>–

System: I notice the `src/utils/index.ts` file is incomplete in your prompt, as it cuts off at `export const getTokenPrice = async (id: string) =>`. I'll provide the complete `src/utils/index.ts` file to ensure all utilities are included, maintaining the functionality for the VinuChain Portfolio Tracker. This file includes `getTokenPrice`, `shortenAddress`, `showError`, and `showSuccess`, which are critical for fetching token prices, formatting addresses, and displaying UI notifications. Below, I'll also include the remaining files (`src/index.tsx`, `src/index.css`, `public/index.html`, `package.json`, `tsconfig.json`, `README.md`) to complete the set, ensuring you have everything needed to copy and run the project. The code addresses the issue where manually added tokens only appear in "Tracked Tokens" but not in the portfolio table, ensuring they display alongside VC with balance, price, value, and allocation.

### Complete Code Files

#### src/utils/index.ts
```tsx
export const getTokenPrice = async (id: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(15000) }
    );
    return await response.json().then(data => data[id] || { usd: 0, usd_24h_change: 0 });
  } catch {
    return { usd: 0, usd_24h_change: 0 };
  }
};

export const shortenAddress = (address: string): string => {
  return address && address !== 'native' ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

export const showError = (message: string) => {
  const div = document.getElementById('errorDisplay');
  if (div) {
    div.textContent = message;
    div.classList.remove('hidden');
    div.classList.add('bg-red-900', 'text-red-400');
    div.classList.remove('bg-green-900', 'text-green-400');
    setTimeout(() => div.classList.add('hidden'), 5000);
  }
};

export const showSuccess = (message: string) => {
  const div = document.getElementById('errorDisplay');
  if (div) {
    div.textContent = message;
    div.classList.add('bg-green-900', 'text-green-400');
    div.classList.remove('hidden', 'bg-red-900', 'text-red-400');
    setTimeout(() => div.classList.add('hidden'), 3000);
  }
};
