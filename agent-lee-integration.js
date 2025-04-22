/**
 * Agent Lee Integration
 * 
 * This module integrates the Agent Lee Training System with the existing Agent Lee implementation.
 * It adds one-shot learning capabilities and autonomous training to Agent Lee.
 */

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Initializing Agent Lee Integration...");
  
  // Initialize the training system
  await AgentLeeTraining.init();
  
  // Extend the AgentLee object with training capabilities
  extendAgentLee();
  
  // Add training UI components
  addTrainingUI();
  
  // Train from site content (if enabled)
  if (localStorage.getItem('agentLeeAutoTrain') !== 'disabled') {
    setTimeout(() => {
      AgentLeeTraining.trainFromSiteContent();
    }, 5000); // Delay to ensure page is fully loaded
  }
  
  console.log("Agent Lee Integration initialized successfully");
});

/**
 * Extend the AgentLee object with training capabilities
 */
function extendAgentLee() {
  // Store the original speak function
  const originalSpeak = window.AgentLee.speak;
  
  // Override the speak function to track responses
  window.AgentLee.speak = function(text, options = {}) {
    // Call the original function
    originalSpeak(text, options);
    
    // Track this response if it's part of a conversation
    if (options.isResponse) {
      AgentLeeTraining.learnFromInteraction(
        options.userInput || '',
        text,
        options.wasSuccessful !== false,
        options.category || 'general'
      );
    }
  };
  
  // Add new training methods to AgentLee
  window.AgentLee.train = function(input, response, category = 'general') {
    return AgentLeeTraining.storeKnowledge(input, response, category);
  };
  
  window.AgentLee.getTrainingStats = function() {
    return AgentLeeTraining.getTrainingStats();
  };
  
  window.AgentLee.resetTraining = function() {
    return AgentLeeTraining.resetTraining();
  };
  
  window.AgentLee.findLearningResponse = function(input) {
    return AgentLeeTraining.findResponse(input);
  };
  
  // Enhance the handleCommand function to use learned responses
  const originalHandleCommand = window.handleCommand;
  
  window.handleCommand = function(text) {
    // First check if we have a learned response
    const learnedResponse = AgentLeeTraining.findResponse(text);
    
    if (learnedResponse && learnedResponse.confidence > 0.6) {
      // Use the learned response
      addMessage(learnedResponse.response, 'agent');
      
      // Track this as a successful response
      AgentLeeTraining.learnFromInteraction(
        text,
        learnedResponse.response,
        true,
        learnedResponse.category
      );
      
      return;
    }
    
    // If no learned response, use the original handler
    originalHandleCommand(text);
  };
}

/**
 * Add training UI components
 */
function addTrainingUI() {
  // Create training panel
  const trainingPanel = document.createElement('div');
  trainingPanel.id = 'agent-lee-training-panel';
  trainingPanel.className = 'fixed top-4 right-4 bg-indigo-900/90 backdrop-blur-md border border-indigo-700 rounded-xl shadow-xl p-4 z-50 hidden';
  trainingPanel.style.width = '400px';
  
  trainingPanel.innerHTML = `
    <div class="flex justify-between items-center mb-4 border-b border-indigo-800 pb-2">
      <h3 class="text-white font-bold text-lg">Agent Lee Training</h3>
      <button id="close-training-panel" class="text-blue-300 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="mb-4">
      <div class="text-white text-sm font-medium mb-2">Teach Agent Lee</div>
      <input id="training-input" type="text" placeholder="When user says..." 
        class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <textarea id="training-response" placeholder="Agent Lee should respond..."
        class="w-full bg-indigo-800/50 text-white placeholder-blue-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"></textarea>
      <div class="flex items-center mb-2">
        <label class="text-white text-sm mr-2">Category:</label>
        <select id="training-category" 
          class="bg-indigo-800/50 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="general">General</option>
          <option value="navigation">Navigation</option>
          <option value="pricing">Pricing</option>
          <option value="learning">Learning</option>
          <option value="showcase">Showcase</option>
          <option value="faq">FAQ</option>
        </select>
      </div>
      <button id="save-training" 
        class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 w-full transition-all duration-200">
        Teach Agent Lee
      </button>
    </div>
    
    <div class="mb-4 border-t border-indigo-800 pt-4">
      <div class="text-white text-sm font-medium mb-2">Training Statistics</div>
      <div id="training-stats" class="text-blue-300 text-xs space-y-1">
        Loading statistics...
      </div>
    </div>
    
    <div class="border-t border-indigo-800 pt-4">
      <div class="flex items-center justify-between mb-2">
        <div class="text-white text-sm font-medium">Auto-Training</div>
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" id="auto-train-toggle" class="sr-only peer">
          <div class="relative w-11 h-6 bg-indigo-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      <button id="reset-training" 
        class="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 w-full transition-all duration-200 mt-4">
        Reset Training Data
      </button>
    </div>
  `;
  
  document.body.appendChild(trainingPanel);
  
  // Add training button to Agent Lee UI
  const agentLeeUI = document.getElementById('agent-lee-assistant');
  
  if (agentLeeUI) {
    const quickActionsContainer = agentLeeUI.querySelector('.flex.flex-wrap.gap-2');
    
    if (quickActionsContainer) {
      const trainingButton = document.createElement('button');
      trainingButton.id = 'training-button';
      trainingButton.className = 'quick-action bg-indigo-700 hover:bg-indigo-600 text-white text-xs py-1 px-3 rounded-full transition-all';
      trainingButton.innerHTML = '🧠 Train';
      
      quickActionsContainer.appendChild(trainingButton);
      
      // Add event listener
      trainingButton.addEventListener('click', () => {
        document.getElementById('agent-lee-training-panel').classList.toggle('hidden');
        updateTrainingStats();
      });
    }
  }
  
  // Add keyboard shortcut (Ctrl+Alt+T)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 't') {
      document.getElementById('agent-lee-training-panel').classList.toggle('hidden');
      updateTrainingStats();
    }
  });
  
  // Add event listeners for training panel
  document.getElementById('close-training-panel').addEventListener('click', () => {
    document.getElementById('agent-lee-training-panel').classList.add('hidden');
  });
  
  document.getElementById('save-training').addEventListener('click', () => {
    const input = document.getElementById('training-input').value.trim();
    const response = document.getElementById('training-response').value.trim();
    const category = document.getElementById('training-category').value;
    
    if (input && response) {
      AgentLee.train(input, response, category);
      
      // Clear inputs
      document.getElementById('training-input').value = '';
      document.getElementById('training-response').value = '';
      
      // Update stats
      updateTrainingStats();
      
      // Show confirmation
      alert('Agent Lee has learned this response!');
    } else {
      alert('Please enter both input and response');
    }
  });
  
  document.getElementById('reset-training').addEventListener('click', () => {
    AgentLee.resetTraining();
    updateTrainingStats();
  });
  
  // Set up auto-train toggle
  const autoTrainToggle = document.getElementById('auto-train-toggle');
  autoTrainToggle.checked = localStorage.getItem('agentLeeAutoTrain') !== 'disabled';
  
  autoTrainToggle.addEventListener('change', () => {
    if (autoTrainToggle.checked) {
      localStorage.removeItem('agentLeeAutoTrain');
      AgentLeeTraining.trainFromSiteContent();
    } else {
      localStorage.setItem('agentLeeAutoTrain', 'disabled');
    }
  });
  
  // Initial stats update
  updateTrainingStats();
}

/**
 * Update training statistics display
 */
function updateTrainingStats() {
  const statsContainer = document.getElementById('training-stats');
  const stats = AgentLee.getTrainingStats();
  
  statsContainer.innerHTML = `
    <div><span class="text-white">Total Interactions:</span> ${stats.totalInteractions}</div>
    <div><span class="text-white">Success Rate:</span> ${stats.successRate}</div>
    <div><span class="text-white">Knowledge Items:</span> ${stats.knowledgeItems}</div>
    <div><span class="text-white">Growth Rate:</span> ${stats.growthRate}</div>
    <div class="mt-2"><span class="text-white">Categories:</span></div>
  `;
  
  // Add category breakdown
  Object.entries(stats.categoryCounts).forEach(([category, count]) => {
    if (category !== 'trainingStats' && count > 0) {
      const categoryElement = document.createElement('div');
      categoryElement.className = 'ml-2';
      categoryElement.innerHTML = `<span class="text-white">${category}:</span> ${count}`;
      statsContainer.appendChild(categoryElement);
    }
  });
}

// Add visual learning indicator
function addLearningIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'learning-indicator';
  indicator.className = 'fixed bottom-4 left-4 bg-blue-600 text-white text-xs py-1 px-3 rounded-full opacity-0 transition-opacity duration-500';
  indicator.textContent = 'Learning...';
  
  document.body.appendChild(indicator);
  
  // Show indicator when learning happens
  const originalLearnFromInteraction = AgentLeeTraining.learnFromInteraction;
  
  AgentLeeTraining.learnFromInteraction = function(input, response, wasSuccessful, category) {
    // Call original function
    const result = originalLearnFromInteraction.call(this, input, response, wasSuccessful, category);
    
    // Show indicator
    const indicator = document.getElementById('learning-indicator');
    indicator.style.opacity = '1';
    
    // Hide after 2 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
    
    return result;
  };
}

// Call to add the learning indicator
addLearningIndicator();
