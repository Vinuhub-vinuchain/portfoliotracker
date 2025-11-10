import React, { useEffect, useState } from 'react';
import { getTokenPrice } from '../utils';

interface Props {
  coingeckoId: string;
}

interface Alert {
  price: number;
  email: string;
}

const PriceAlert: React.FC<Props> = ({ coingeckoId }) => {
  const [alert, setAlert] = useState<Alert>(JSON.parse(localStorage.getItem('vinuVCAlert') || '{}'));
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const checkAlert = async () => {
      if (alert.price) {
        const data = await getTokenPrice(coingeckoId);
        if (data.usd > alert.price) {
          console.log(`VC price alert! Current: $${data.usd.toFixed(4)} (Target: $${alert.price})`);
        }
      }
    };
    const interval = setInterval(checkAlert, 60000);
    return () => clearInterval(interval);
  }, [alert, coingeckoId]);

  const setVCAlert = () => {
    const priceNum = parseFloat(price);
    if (!isNaN(priceNum) && email.includes('@')) {
      const newAlert = { price: priceNum, email };
      setAlert(newAlert);
      localStorage.setItem('vinuVCAlert', JSON.stringify(newAlert));
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">VC Price Alert</h3>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for alerts"
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Alert if VC > USD"
          step="0.0001"
          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
        <button className="bg-white text-black px-4 py-2 rounded-lg" onClick={setVCAlert}>
          Set Alert
        </button>
      </div>
      {alert.price && (
        <div className="flex justify-between items-center p-2 border-b border-gray-700">
          <span>VC &gt; ${alert.price} → {alert.email}</span>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm"
            onClick={() => setAlert({ price: 0, email: '' })}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceAlert;
