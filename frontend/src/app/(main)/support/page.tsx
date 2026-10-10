'use client';
import { useState } from 'react';
import { Heart, Coffee, Copy, Check, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const BtcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
    <path fill="#f7931a" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781c.442-2.952-1.806-4.536-4.869-5.589l1.04-4.174-2.545-.634-1.018 4.086c-.669-.167-1.353-.321-2.041-.471l1.02-4.093-2.545-.634-1.043 4.184c-.559-.13-1.107-.253-1.637-.38l.002-.009-3.52-.876-.68 2.733s1.894.425 1.854.461c1.036.258 1.222.946 1.191 1.492l-1.196 4.802c.07.017.161.048.269.097-.087-.022-.178-.045-.27-.068l-1.68 6.745c-.104.283-.414.71-1.171.521.037.04-1.856-.462-1.856-.462l-1.267 2.92 3.328.829c.621.155 1.233.315 1.838.468l-1.055 4.238 2.545.634 1.041-4.179c.691.185 1.365.358 2.028.522l-1.045 4.195 2.544.634 1.059-4.25c4.053.766 7.106.458 8.026-3.149.742-2.91-.013-4.595-2.095-5.694 1.496-.345 2.624-1.344 2.932-3.411zm-5.462 7.747c-.751 3.018-5.836 1.391-7.488.981l1.341-5.385c1.652.411 6.917 1.332 6.147 4.404zm.643-7.915c-.686 2.756-5.185 1.31-6.637.949l1.215-4.877c1.453.362 6.126 1.121 5.422 3.928z"/>
  </svg>
);

const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path fill="#FFF" d="M15.925 23.969L15.875 24v7.07l.05.014 7.82-11.026z" opacity=".6"/>
    <path fill="#FFF" d="M15.925 23.969v-7.836l-7.818-4.596z" opacity=".45"/>
    <path fill="#FFF" d="M15.925 3.931l-.05.17v15.965l.05.05 7.82-4.594z" opacity=".8"/>
    <path fill="#FFF" d="M15.925 3.931L8.107 15.522l7.818 4.595z" opacity=".45"/>
    <path fill="#FFF" d="M15.925 23.969l7.82-7.836-7.82-4.596z" opacity=".8"/>
    <path fill="#FFF" d="M8.107 20.066l7.818 7.836v-7.836z" opacity=".45"/>
  </svg>
);

const SolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="16" fill="#000"/>
    <path fill="#14F195" d="M22.955 12.015H9.684c-.452 0-.678-.546-.358-.865l2.42-2.42a.507.507 0 01.358-.148h13.271c.452 0 .678.546.358.865l-2.42 2.42a.507.507 0 01-.358.148z"/>
    <path fill="#9945FF" d="M22.955 23.418H9.684c-.452 0-.678-.546-.358-.866l2.42-2.42a.507.507 0 01.358-.148h13.271c.452 0 .678.546.358.865l-2.42 2.42a.508.508 0 01-.358.149z"/>
    <path fill="#14F195" d="M9.045 17.717h13.271c.452 0 .678-.546.358-.865l-2.42-2.42a.507.507 0 00-.358-.148H6.625c-.452 0-.678.546-.358.865l2.42 2.42c.095.094.223.148.358.148z"/>
  </svg>
);

const BnbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
    <path fill="#FFF" d="M12.115 14.544l-2.923-2.923-3.953 3.952 3.953 3.953 2.923-2.922 2.923 2.922-5.846 5.847L3.346 19.526l5.846-5.846-2.923-2.923 2.923-2.923-5.846-5.846 5.846-5.846 2.923 2.923-2.923 2.922 3.953 3.953-3.953 3.953 2.923 2.923 5.846-5.847L28.654 12.5 22.808 6.654l2.923-2.923-2.923-2.923-5.846 5.846-5.846-5.846 2.923 2.923-2.923 2.922 3.953 3.953-3.953 3.953zm5.846 4.31l-2.923-2.923 2.923-2.922 2.923 2.922-2.923 2.923z"/>
  </svg>
);

const CRYPTO_OPTIONS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Network',
    Icon: BtcIcon,
    address: 'bc1qlxpejtpu2amn9y8lehpqzsuescz8a3xw03uhmq'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC-20',
    Icon: EthIcon,
    address: '0xcBA81E9a7F66146159159AAE4853E6A12c8FA863'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana Network',
    Icon: SolIcon,
    address: 'DXHxSyacQPLBgK1ECgCPaqCUHeF3PVEt93fvWTK6LuZ'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BEP-20 (BSC)',
    Icon: BnbIcon,
    address: '0xcBA81E9a7F66146159159AAE4853E6A12c8FA863'
  }
];

export default function SupportPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txId, setTxId] = useState("");
  const [name, setName] = useState("");

  const copyToClipboard = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending to backend notification
    alert("Thank you! Your donation notification has been sent to the Admin.");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start px-4 pt-8 md:pt-16 pb-20 relative">
      
      {/* Header Section */}
      <div className="max-w-3xl w-full text-center mb-12 animate-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-bounce" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Support Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Platform</span>
        </h1>
        <p className="text-zinc-300 text-lg md:text-xl leading-relaxed bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
          We work around the clock to provide you with the best ad-free, high-quality experience. 
          If you enjoy our content, consider supporting us! A small crypto donation (even just <strong>$5 or $10</strong> to buy us a coffee ☕) 
          helps us keep the servers running and the platform growing.
        </p>
      </div>

      {/* Crypto Options Grid */}
      <div className="max-w-5xl w-full">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Coffee className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-bold text-white">Buy Us a Coffee with Crypto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {CRYPTO_OPTIONS.map((crypto) => (
            <div 
              key={crypto.id}
              className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-pink-500/50 transition-all duration-300 group flex flex-col sm:flex-row items-center gap-6"
            >
              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-2xl flex-shrink-0 shadow-lg shadow-black/50">
                <QRCodeSVG 
                  value={crypto.address} 
                  size={110} 
                  level="H" 
                  includeMargin={false}
                  className="rounded-lg"
                />
              </div>

              {/* Coin Details */}
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                    <crypto.Icon />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{crypto.name} <span className="text-zinc-500 font-medium text-sm ml-1">{crypto.symbol}</span></h3>
                    <p className="text-xs font-semibold text-pink-400 mt-0.5">{crypto.network}</p>
                  </div>
                </div>
                
                <div className="relative mt-auto">
                  <input 
                    type="text" 
                    readOnly 
                    value={crypto.address}
                    className="w-full bg-[#111] text-zinc-300 text-[13px] py-3 pl-4 pr-12 rounded-xl border border-white/5 outline-none font-mono focus:border-pink-500/50 transition-colors selection:bg-pink-500/30"
                  />
                  <button
                    onClick={() => copyToClipboard(crypto.id, crypto.address)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-zinc-800 hover:bg-pink-500 text-zinc-300 hover:text-white rounded-lg transition-colors"
                    title="Copy Address"
                  >
                    {copiedId === crypto.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-16 flex justify-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            I Have Donated!
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <h3 className="text-2xl font-bold text-white mb-2">Thank You! 💖</h3>
            <p className="text-sm text-zinc-400 mb-6">Let us know you donated so we can notify the admin.</p>
            
            <form onSubmit={handleDonateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Your Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Anonymous Fan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 text-white py-3 px-4 rounded-xl border border-white/10 focus:border-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Transaction Hash / TxID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 0x123...abc"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full bg-black/50 text-white py-3 px-4 rounded-xl border border-white/10 focus:border-pink-500 outline-none font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors"
                >
                  Send Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
