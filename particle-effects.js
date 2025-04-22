/**
 * Particle Effects System
 * Creates animated particles in the background of the website
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationFrame = null;
    this.isRunning = false;
    this.particleCount = 50;
    this.particleColors = [
      'rgba(59, 130, 246, 0.5)',  // Blue
      'rgba(99, 102, 241, 0.5)',  // Indigo
      'rgba(139, 92, 246, 0.5)',  // Purple
      'rgba(79, 70, 229, 0.5)',   // Indigo darker
      'rgba(16, 185, 129, 0.5)'   // Green
    ];
  }

  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Add canvas to the document
    document.body.appendChild(this.canvas);
    
    // Get context
    this.ctx = this.canvas.getContext('2d');
    
    // Create particles
    this.createParticles();
    
    // Start animation
    this.start();
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 5 + 1,
        color: this.particleColors[Math.floor(Math.random() * this.particleColors.length)],
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }
  
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
      
      // Connect particles that are close to each other
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = 0.2 * (1 - distance / 100);
          this.ctx.stroke();
        }
      }
    }
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  update() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Bounce off edges
      if (p.x < 0 || p.x > this.width) {
        p.speedX *= -1;
      }
      
      if (p.y < 0 || p.y > this.height) {
        p.speedY *= -1;
      }
      
      // Slowly change opacity for twinkling effect
      p.opacity += Math.random() * 0.02 - 0.01;
      p.opacity = Math.max(0.1, Math.min(0.6, p.opacity));
    }
  }
  
  animate() {
    if (!this.isRunning) return;
    
    this.update();
    this.draw();
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Recreate particles to fit new dimensions
    this.createParticles();
  }
}

// Initialize particle system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem();
  particleSystem.init();
  
  // Make it available globally
  window.particleSystem = particleSystem;
});
