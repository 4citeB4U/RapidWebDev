/**
 * Scroll Animation Effects
 * 
 * This script creates random animation effects for images as the user scrolls
 * through the page. Images will appear with different animations like bounce,
 * fade, slide, etc.
 */

// Available animation effects
const animationEffects = [
  {
    name: 'fade',
    className: 'scroll-fade-in',
    cssAnimation: `
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .scroll-fade-in {
        animation: fadeIn 1s ease forwards;
        opacity: 0;
      }
    `
  },
  {
    name: 'bounce',
    className: 'scroll-bounce',
    cssAnimation: `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-30px); }
        60% { transform: translateY(-15px); }
      }
      .scroll-bounce {
        animation: bounce 1s ease forwards;
      }
    `
  },
  {
    name: 'slide-left',
    className: 'scroll-slide-left',
    cssAnimation: `
      @keyframes slideLeft {
        0% { transform: translateX(-100px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      .scroll-slide-left {
        animation: slideLeft 1s ease forwards;
        opacity: 0;
      }
    `
  },
  {
    name: 'slide-right',
    className: 'scroll-slide-right',
    cssAnimation: `
      @keyframes slideRight {
        0% { transform: translateX(100px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      .scroll-slide-right {
        animation: slideRight 1s ease forwards;
        opacity: 0;
      }
    `
  },
  {
    name: 'zoom',
    className: 'scroll-zoom',
    cssAnimation: `
      @keyframes zoom {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .scroll-zoom {
        animation: zoom 1s ease forwards;
        opacity: 0;
      }
    `
  },
  {
    name: 'rotate',
    className: 'scroll-rotate',
    cssAnimation: `
      @keyframes rotate {
        0% { transform: rotate(-180deg) scale(0.7); opacity: 0; }
        100% { transform: rotate(0) scale(1); opacity: 1; }
      }
      .scroll-rotate {
        animation: rotate 1s ease forwards;
        opacity: 0;
      }
    `
  },
  {
    name: 'flip',
    className: 'scroll-flip',
    cssAnimation: `
      @keyframes flip {
        0% { transform: perspective(400px) rotateY(90deg); opacity: 0; }
        100% { transform: perspective(400px) rotateY(0); opacity: 1; }
      }
      .scroll-flip {
        animation: flip 1s ease forwards;
        opacity: 0;
        backface-visibility: hidden;
      }
    `
  },
  {
    name: 'elastic',
    className: 'scroll-elastic',
    cssAnimation: `
      @keyframes elastic {
        0% { transform: scale(0); }
        60% { transform: scale(1.1); }
        80% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      .scroll-elastic {
        animation: elastic 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }
    `
  }
];

// Image paths for main page and learning center page
const imageData = {
  mainPage: [
    './assets/mainpage/frontpage4.png',
    './assets/mainpage/frontpage5.png',
    './assets/mainpage/mainpageimage1.png',
    './assets/mainpage/mainpageimage 2.png'
  ],
  learningPage: [
    './assets/learningpage/learningcenterpage2.png',
    './assets/learningpage/learningcenterpage3.png',
    './assets/learningpage/learningpage5.png'
  ]
};

// Create and append style element with animation CSS
function injectAnimationStyles() {
  const styleElement = document.createElement('style');
  let allStyles = '';
  
  // Add all animation styles
  animationEffects.forEach(effect => {
    allStyles += effect.cssAnimation;
  });
  
  // Add additional styles for the floating images
  allStyles += `
    .scroll-animation-image {
      position: absolute;
      z-index: 10;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 300px;
      max-height: 200px;
      object-fit: cover;
      opacity: 0;
      pointer-events: none;
    }
    
    .scroll-animation-container {
      position: relative;
      overflow: hidden;
    }
  `;
  
  styleElement.textContent = allStyles;
  document.head.appendChild(styleElement);
}

// Get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random position within container
function getRandomPosition(container) {
  const containerRect = container.getBoundingClientRect();
  const maxX = containerRect.width - 300; // Accounting for image max-width
  const maxY = containerRect.height - 200; // Accounting for image max-height
  
  return {
    x: Math.max(20, Math.floor(Math.random() * maxX)),
    y: Math.max(20, Math.floor(Math.random() * maxY))
  };
}

// Create and animate an image
function createAnimatedImage(container, imageSrc, effect) {
  // Create image element
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = 'Showcase image';
  img.className = `scroll-animation-image ${effect.className}`;
  
  // Set random position
  const position = getRandomPosition(container);
  img.style.left = `${position.x}px`;
  img.style.top = `${position.y}px`;
  
  // Add to container
  container.appendChild(img);
  
  // Remove after animation completes (plus some extra time to view)
  setTimeout(() => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      container.removeChild(img);
    }, 500);
  }, 4000);
}

// Initialize scroll animation
function initScrollAnimation() {
  // Inject CSS animations
  injectAnimationStyles();
  
  // Determine which page we're on
  const isLearningPage = window.location.href.includes('learning') || 
                         document.querySelector('h1')?.textContent.includes('Learning Center');
  
  // Select the appropriate images
  const images = isLearningPage ? imageData.learningPage : imageData.mainPage;
  
  // Find containers where we'll add the animated images
  const containers = document.querySelectorAll('section');
  if (!containers.length) return;
  
  // Add scroll-animation-container class to all sections
  containers.forEach(container => {
    container.classList.add('scroll-animation-container');
  });
  
  // Track scroll position to prevent too many animations
  let lastScrollPosition = window.scrollY;
  let scrollThreshold = 300; // Minimum scroll distance before triggering new animation
  let animationCooldown = false;
  
  // Scroll event listener
  window.addEventListener('scroll', () => {
    const currentScrollPosition = window.scrollY;
    const scrollDistance = Math.abs(currentScrollPosition - lastScrollPosition);
    
    // Only trigger animation if we've scrolled enough and not in cooldown
    if (scrollDistance > scrollThreshold && !animationCooldown) {
      // Get visible containers
      const visibleContainers = Array.from(containers).filter(container => {
        const rect = container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
      
      if (visibleContainers.length) {
        // Select random container, image, and effect
        const container = getRandomItem(visibleContainers);
        const imageSrc = getRandomItem(images);
        const effect = getRandomItem(animationEffects);
        
        // Create and animate the image
        createAnimatedImage(container, imageSrc, effect);
        
        // Update last scroll position
        lastScrollPosition = currentScrollPosition;
        
        // Set cooldown to prevent too many animations
        animationCooldown = true;
        setTimeout(() => {
          animationCooldown = false;
        }, 1000);
      }
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initScrollAnimation);

// Also initialize when React components mount
if (typeof window !== 'undefined') {
  // For React apps, we need to reinitialize when components mount
  // This will be called from the React components
  window.initScrollAnimation = initScrollAnimation;
}
