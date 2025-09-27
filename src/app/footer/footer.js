import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0D0D0D] border-t border-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} MedVerify. All Rights Reserved.
          </p>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/medinfo" className="text-gray-400 hover:text-white transition-colors">
               Info
            </Link>
            <Link href="/medstores" className="text-gray-400 hover:text-white transition-colors">
              Medstores Nearby
            </Link>
            <Link href="/prescription" className="text-gray-400 hover:text-white transition-colors">
              Prescription Reader
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}