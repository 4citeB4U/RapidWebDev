/**
 * Add Gemini settings to Agent Lee settings panel
 */
function addGeminiSettings(settingsPanel) {
  // Create Gemini settings section
  const geminiSection = document.createElement('div');
  geminiSection.className = 'p-4 border-t border-indigo-700';
  
  // Section title
  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'text-xl font-bold mb-4 text-white';
  sectionTitle.textContent = 'Gemini AI Settings';
  geminiSection.appendChild(sectionTitle);
  
  // API Key input
  const apiKeyLabel = document.createElement('label');
  apiKeyLabel.className = 'block text-white mb-2';
  apiKeyLabel.textContent = 'Gemini API Key:';
  geminiSection.appendChild(apiKeyLabel);
  
  const apiKeyInput = document.createElement('input');
  apiKeyInput.type = 'password';
  apiKeyInput.className = 'w-full bg-indigo-800/50 text-white rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500';
  apiKeyInput.placeholder = 'Enter your Gemini API key';
  apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
  geminiSection.appendChild(apiKeyInput);
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2';
  saveButton.textContent = 'Save API Key';
  saveButton.addEventListener('click', () => {
    if (window.AgentLee && window.AgentLee.gemini) {
      window.AgentLee.gemini.setApiKey(apiKeyInput.value);
      showStatusMessage('Gemini API key saved');
    }
  });
  geminiSection.appendChild(saveButton);
  
  // Test button
  const testButton = document.createElement('button');
  testButton.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded';
  testButton.textContent = 'Test Connection';
  testButton.addEventListener('click', async () => {
    if (window.AgentLee && window.AgentLee.gemini) {
      testButton.textContent = 'Testing...';
      testButton.disabled = true;
      
      try {
        const response = await window.AgentLee.gemini.processInput('Hello, can you confirm the connection is working?');
        window.AgentLee.speak('Gemini connection test: ' + response);
        showStatusMessage('Gemini connection successful');
      } catch (error) {
        showStatusMessage('Gemini connection failed: ' + error.message);
      }
      
      testButton.textContent = 'Test Connection';
      testButton.disabled = false;
    }
  });
  geminiSection.appendChild(testButton);
  
  // Fallback toggle
  const fallbackContainer = document.createElement('div');
  fallbackContainer.className = 'mt-4';
  
  const fallbackCheckbox = document.createElement('input');
  fallbackCheckbox.type = 'checkbox';
  fallbackCheckbox.id = 'gemini-fallback';
  fallbackCheckbox.className = 'mr-2';
  fallbackCheckbox.checked = localStorage.getItem('gemini_fallback_enabled') === 'true';
  
  const fallbackLabel = document.createElement('label');
  fallbackLabel.htmlFor = 'gemini-fallback';
  fallbackLabel.className = 'text-white';
  fallbackLabel.textContent = 'Enable fallback to other models if Gemini fails';
  
  fallbackCheckbox.addEventListener('change', () => {
    if (window.AgentLee && window.AgentLee.gemini) {
      window.AgentLee.gemini.setFallbackEnabled(fallbackCheckbox.checked);
    }
  });
  
  fallbackContainer.appendChild(fallbackCheckbox);
  fallbackContainer.appendChild(fallbackLabel);
  geminiSection.appendChild(fallbackContainer);
  
  // Add to settings panel
  settingsPanel.appendChild(geminiSection);
  
  // Helper function to show status message
  function showStatusMessage(message) {
    const statusMessage = document.createElement('div');
    statusMessage.className = 'mt-2 text-green-400';
    statusMessage.textContent = message;
    geminiSection.appendChild(statusMessage);
    
    setTimeout(() => {
      geminiSection.removeChild(statusMessage);
    }, 3000);
  }
}

// Add to existing settings initialization
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AgentLee to be available
  const checkInterval = setInterval(() => {
    if (window.AgentLee && window.AgentLee.initialized) {
      clearInterval(checkInterval);
      
      // Check if settings panel exists or needs to be created
      let settingsPanel = document.getElementById('agent-lee-settings');
      
      if (!settingsPanel) {
        // Create settings panel
        settingsPanel = document.createElement('div');
        settingsPanel.id = 'agent-lee-settings';
        settingsPanel.className = 'fixed z-[10000] right-4 top-20 w-96 rounded-2xl bg-indigo-900/90 shadow-2xl border border-indigo-600 backdrop-blur-md overflow-hidden transition-all hidden';
        document.body.appendChild(settingsPanel);
        
        // Add settings button to Agent Lee
        const settingsButton = document.createElement('button');
        settingsButton.className = 'absolute top-4 right-4 text-white hover:text-blue-300 focus:outline-none';
        settingsButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        `;
        
        settingsButton.addEventListener('click', () => {
          settingsPanel.classList.toggle('hidden');
        });
        
        const agentLeeContainer = document.getElementById('agent-lee-chat');
        if (agentLeeContainer) {
          const header = agentLeeContainer.querySelector('div');
          if (header) {
            header.appendChild(settingsButton);
          }
        }
      }
      
      // Add Gemini settings
      addGeminiSettings(settingsPanel);
    }
  }, 100);
});