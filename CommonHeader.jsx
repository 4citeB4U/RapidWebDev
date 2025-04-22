import React from 'react';

const CommonHeader = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="bg-indigo-900/80 backdrop-blur-md border-y border-indigo-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap justify-between items-center">
          {/* Main Navigation Section */}
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h3 className="font-bold text-blue-300 mb-2">Main Navigation</h3>
            <ul className="flex flex-wrap gap-4">
              <li><a href="#home" className="text-white hover:text-blue-300 transition-colors">Home</a></li>
              <li><a href="#about" className="text-white hover:text-blue-300 transition-colors">About</a></li>
              <li><a href="#services" className="text-white hover:text-blue-300 transition-colors">Services</a></li>
              <li><a href="#pricing" className="text-white hover:text-blue-300 transition-colors">Pricing</a></li>
              <li><a href="#portfolio" className="text-white hover:text-blue-300 transition-colors">Portfolio</a></li>
            </ul>
          </div>
          
          {/* Resources Section */}
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h3 className="font-bold text-blue-300 mb-2">Resources</h3>
            <ul className="flex flex-wrap gap-4">
              <li><a href="#learning" className="text-white hover:text-blue-300 transition-colors">Learning Center</a></li>
              <li><a href="#blog" className="text-white hover:text-blue-300 transition-colors">Blog</a></li>
              <li><a href="#faq" className="text-white hover:text-blue-300 transition-colors">FAQ</a></li>
              <li><a href="#documentation" className="text-white hover:text-blue-300 transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h3 className="font-bold text-blue-300 mb-2">Contact</h3>
            <ul className="flex flex-wrap gap-4">
              <li><a href="#contact" className="text-white hover:text-blue-300 transition-colors">Contact Us</a></li>
              <li><a href="tel:4143676211" className="text-white hover:text-blue-300 transition-colors">414-367-6211</a></li>
              <li><a href="mailto:contact@rapidwebdev.com" className="text-white hover:text-blue-300 transition-colors">Email</a></li>
            </ul>
          </div>
          
          {/* Back to Top Button */}
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <button 
              onClick={scrollToTop}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up">
                <path d="m12 19-7-7 7-7"/><path d="M5 12h14"/>
              </svg>
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CommonHeader;
