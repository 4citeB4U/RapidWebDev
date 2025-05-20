/**
 * Agent Lee Training System
 * 
 * This is the main entry point for the Agent Lee Training System.
 * It loads all the necessary components and integrates them with the existing Agent Lee implementation.
 */

// Load order is important to ensure proper initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing Agent Lee Training System...");
  
  // Load the training system components in the correct order
  loadScript('agent-lee-training.js')
    .then(() => loadScript('agent-lee-integration.js'))
    .then(() => loadScript('agent-lee-oneshot.js'))
    .then(() => loadScript('agent-lee-memory.js'))
    .then(() => loadScript('agent-lee-autonomous.js'))
    .then(() => {
      console.log("Agent Lee Training System loaded successfully");
      
      // Initialize the training system UI
      initTrainingSystemUI();
    })
    .catch(error => {
      console.error("Error loading Agent Lee Training System:", error);
    });
});

/**
 * Load a script dynamically
 * @param {string} src - Script source
 * @returns {Promise} - Promise that resolves when the script is loaded
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
}

/**
 * Initialize the training system UI
 */
function initTrainingSystemUI() {
  // Add training system status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'agent-lee-training-status';
  statusIndicator.className = 'fixed bottom-4 left-4 bg-indigo-900/90 backdrop-blur-md border border-indigo-700 rounded-xl shadow-xl p-3 z-50 text-white text-xs hidden';
  
  statusIndicator.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
      <span>Agent Lee Training System: Active</span>
    </div>
    <div class="mt-1 text-blue-300">
      <span id="knowledge-count">0</span> knowledge items | 
      <span id="memory-count">0</span> memories
    </div>
  `;
  
  document.body.appendChild(statusIndicator);
  
  // Add keyboard shortcut to toggle status indicator (Ctrl+Alt+S)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 's') {
      statusIndicator.classList.toggle('hidden');
      
      // Update stats when shown
      if (!statusIndicator.classList.contains('hidden')) {
        updateTrainingStats();
      }
    }
  });
  
  // Update stats periodically when visible
  setInterval(() => {
    if (!statusIndicator.classList.contains('hidden')) {
      updateTrainingStats();
    }
  }, 5000);
  
  // Add training progress bar
  const progressBar = document.createElement('div');
  progressBar.id = 'agent-lee-learning-progress';
  progressBar.className = 'fixed bottom-0 left-0 w-full h-1 bg-transparent z-50';
  
  progressBar.innerHTML = `
    <div id="learning-progress-bar" class="h-full bg-blue-600 w-0 transition-all duration-1000"></div>
  `;
  
  document.body.appendChild(progressBar);
  
  // Initialize progress bar
  updateLearningProgress();
  
  // Update progress bar periodically
  setInterval(updateLearningProgress, 60000); // Every minute
}

/**
 * Update training statistics display
 */
function updateTrainingStats() {
  if (!window.AgentLee || !window.AgentLeeTraining || !window.AgentLee.memory) return;
  
  const knowledgeCount = document.getElementById('knowledge-count');
  const memoryCount = document.getElementById('memory-count');
  
  if (knowledgeCount && memoryCount) {
    const stats = window.AgentLee.getTrainingStats();
    const memoryStats = window.AgentLee.memory.getStats();
    
    knowledgeCount.textContent = stats.knowledgeItems;
    memoryCount.textContent = memoryStats.totalCount;
  }
}

/**
 * Update learning progress bar
 */
function updateLearningProgress() {
  if (!window.AgentLee || !window.AgentLeeTraining) return;
  
  const progressBar = document.getElementById('learning-progress-bar');
  
  if (progressBar) {
    const stats = window.AgentLee.getTrainingStats();
    
    // Calculate progress based on knowledge items (max target is 1000)
    const progress = Math.min(100, (stats.knowledgeItems / 1000) * 100);
    
    progressBar.style.width = `${progress}%`;
    
    // Change color based on progress
    if (progress < 30) {
      progressBar.className = 'h-full bg-blue-600 transition-all duration-1000';
    } else if (progress < 70) {
      progressBar.className = 'h-full bg-green-500 transition-all duration-1000';
    } else {
      progressBar.className = 'h-full bg-purple-600 transition-all duration-1000';
    }
  }
}
