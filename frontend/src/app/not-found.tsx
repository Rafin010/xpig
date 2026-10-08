import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* 404 Illustration */}
      <div className="relative w-full max-w-2xl aspect-[4/3] mb-8">
        <Image 
          src="/404-pig.png" 
          alt="404 Page Not Found" 
          fill 
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* Action Button */}
      <Link 
        href="/" 
        className="px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold rounded-full shadow-lg shadow-rose-900/20 transition-all transform hover:scale-105"
      >
        Go Back Home
      </Link>
    </div>
  );
}
