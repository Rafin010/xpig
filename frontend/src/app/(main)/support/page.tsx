'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, Coffee, Copy, Check, Sparkles } from 'lucide-react';

const CRYPTO_OPTIONS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Network',
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC-20',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana Network',
    icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=029',
    address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BEP-20 (BSC)',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=029',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    network: 'Dogecoin Network',
    icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=029',
    address: 'D8vFz4p1L37jdg47HXKtSujCheHWNdcq9D'
  }
];

export default function SupportPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start px-4 pt-8 md:pt-16 pb-20">
      
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
      <div className="max-w-4xl w-full">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Coffee className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-bold text-white">Buy Us a Coffee with Crypto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRYPTO_OPTIONS.map((crypto) => (
            <div 
              key={crypto.id}
              className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-pink-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Image src={crypto.icon} alt={crypto.name} width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{crypto.name} <span className="text-zinc-500 font-medium text-sm ml-1">{crypto.symbol}</span></h3>
                  <p className="text-xs text-zinc-400">Network: {crypto.network}</p>
                </div>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value={crypto.address}
                  className="w-full bg-[#111] text-zinc-300 text-sm py-3 pl-4 pr-12 rounded-xl border border-white/5 outline-none font-mono"
                />
                <button
                  onClick={() => copyToClipboard(crypto.id, crypto.address)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white rounded-lg transition-colors"
                  title="Copy Address"
                >
                  {copiedId === crypto.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
