import React from 'react';

const CommonFooter = () => {
  return (
    <footer className="py-12 px-6 bg-blue-950">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-white">
                <path d="M12 3a6 6 0 0 0 9 9 6 6 0 0 1-9 9 6 6 0 0 1-9-9 6 6 0 0 0 9-9Z"/><path d="M6 6h.01"/><path d="M18 18h.01"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Rapid Web Development</h3>
          </div>
          <p className="text-blue-200 mb-4">Your partner in professional web development, delivered in 3-5 days with complete ownership and no hidden fees.</p>
          <p className="text-xl font-bold text-blue-300">Fast. Affordable. Completely Yours.</p>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Main Navigation</h4>
          <ul className="space-y-2 text-blue-200">
            <li><a href="#home" className="hover:text-blue-300 transition-colors">Home</a></li>
            <li><a href="#about" className="hover:text-blue-300 transition-colors">About</a></li>
            <li><a href="#services" className="hover:text-blue-300 transition-colors">Services</a></li>
            <li><a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a></li>
            <li><a href="#portfolio" className="hover:text-blue-300 transition-colors">Portfolio</a></li>
            <li><a href="#process" className="hover:text-blue-300 transition-colors">Our Process</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Resources</h4>
          <ul className="space-y-2 text-blue-200">
            <li><a href="#learning" className="hover:text-blue-300 transition-colors">Learning Center</a></li>
            <li><a href="#blog" className="hover:text-blue-300 transition-colors">Blog</a></li>
            <li><a href="#faq" className="hover:text-blue-300 transition-colors">FAQs</a></li>
            <li><a href="#documentation" className="hover:text-blue-300 transition-colors">Documentation</a></li>
            <li><a href="#tutorials" className="hover:text-blue-300 transition-colors">Video Tutorials</a></li>
            <li><a href="#support" className="hover:text-blue-300 transition-colors">Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4">Contact Us</h4>
          <ul className="space-y-4 text-blue-200">
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock-3 text-blue-400 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Support Hours: Monday-Friday, 8AM-5PM CST</span>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square text-blue-400 flex-shrink-0">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Email: contact@rapidwebdev.com</span>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone text-blue-400 flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Phone: <span className="font-bold text-white">414-367-6211</span></span>
            </li>
          </ul>

          <div className="mt-6 flex gap-4">
            <a href="#" className="bg-blue-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white text-xs">FB</span>
            </a>
            <a href="#" className="bg-blue-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white text-xs">TW</span>
            </a>
            <a href="#" className="bg-blue-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white text-xs">LI</span>
            </a>
            <a href="#" className="bg-blue-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white text-xs">IG</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-blue-800/50 text-center text-blue-300 text-sm">
        &copy; {new Date().getFullYear()} Rapid Web Development. All rights reserved.
      </div>
    </footer>
  );
};

export default CommonFooter;
