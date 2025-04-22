import React from 'react';
import CommonHeader from './CommonHeader';
import CommonFooter from './CommonFooter';

const NavigationDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 text-white">
      {/* Sticky Phone Number */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-lg animate-pulse">
        <div className="bg-blue-500 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone text-white animate-bounce">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <span className="font-bold text-xl pr-2">
          414-367-6211
        </span>
      </div>

      {/* Header */}
      <header className="py-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-white">
                <path d="M12 3a6 6 0 0 0 9 9 6 6 0 0 1-9 9 6 6 0 0 1-9-9 6 6 0 0 0 9-9Z"/><path d="M6 6h.01"/><path d="M18 18h.01"/>
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold">Rapid Web Development</h1>
          </div>
          <div className="flex gap-3">
            <button className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right transform rotate-180">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
              Back
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
              Contact Us
            </button>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Navigation <span className="text-blue-400">Components Demo</span>
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            This page demonstrates the CommonHeader and CommonFooter components that can be used across the website for consistent navigation.
          </p>
        </div>
      </header>

      {/* Common Header Navigation */}
      <CommonHeader />

      {/* Main Content Area */}
      <main className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-blue-400">
                <path d="M12 3a6 6 0 0 0 9 9 6 6 0 0 1-9 9 6 6 0 0 1-9-9 6 6 0 0 0 9-9Z"/><path d="M6 6h.01"/><path d="M18 18h.01"/>
              </svg>
              Navigation Components
            </h2>
            
            <div className="bg-indigo-800/30 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">CommonHeader Component</h3>
              <p className="text-blue-200 mb-4">
                The CommonHeader component provides a consistent navigation experience across all pages of the website. 
                It includes links to main sections, resources, contact information, and a "Back to Top" button.
              </p>
              <p className="text-blue-200">
                This component is designed to be sticky at the top of the page, making navigation accessible at all times.
              </p>
            </div>
            
            <div className="bg-indigo-800/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">CommonFooter Component</h3>
              <p className="text-blue-200 mb-4">
                The CommonFooter component provides comprehensive navigation and contact information at the bottom of each page.
                It includes links to all main sections, resources, and contact details.
              </p>
              <p className="text-blue-200">
                This component helps users find important information and navigate the site even when they've scrolled to the bottom of a page.
              </p>
            </div>
          </section>
          
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">How to Use These Components</h2>
            <div className="bg-indigo-800/30 rounded-xl p-6">
              <p className="text-blue-200 mb-4">To use these components in your React application:</p>
              <pre className="bg-indigo-900/50 p-4 rounded-lg overflow-x-auto text-blue-100">
                <code>{`import CommonHeader from './CommonHeader';
import CommonFooter from './CommonFooter';

function YourPage() {
  return (
    <>
      <CommonHeader />
      {/* Your page content here */}
      <CommonFooter />
    </>
  );
}`}</code>
              </pre>
            </div>
          </section>
          
          {/* Add some space to demonstrate scrolling */}
          <div className="h-[500px] flex items-center justify-center bg-indigo-800/30 rounded-xl">
            <p className="text-xl text-blue-200">Scroll down to see the footer</p>
          </div>
        </div>
      </main>

      {/* Common Footer */}
      <CommonFooter />
    </div>
  );
};

export default NavigationDemo;
