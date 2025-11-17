export const getTokenPrice = async (id: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined }
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
