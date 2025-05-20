/**
 * Agent Integration System
 * Handles integration between different agent systems and components
 */

// Initialize the agent integration system
function initAgentIntegration() {
  console.log('Initializing Agent Integration System...');
  
  // Connect agents to each other
  connectAgents();
  
  // Set up event listeners for agent communication
  setupAgentEventListeners();
  
  console.log('Agent Integration System initialized');
}

// Connect agents to each other
function connectAgents() {
  // Connect Agent Lee to other agents
  if (window.AgentLee) {
    console.log('Connecting Agent Lee to other agents...');
    
    // Connect to Agent Tim
    if (window.AgentTim) {
      window.AgentLee.connectToAgent('tim', window.AgentTim);
    }
    
    // Connect to Agent Leonard
    if (window.AgentLeonard) {
      window.AgentLee.connectToAgent('leonard', window.AgentLeonard);
    }
    
    // Connect to Agent Nicole
    if (window.AgentNicole) {
      window.AgentLee.connectToAgent('nicole', window.AgentNicole);
    }
  }
}

// Set up event listeners for agent communication
function setupAgentEventListeners() {
  // Listen for agent messages
  window.addEventListener('agent-message', (event) => {
    const { from, to, message } = event.detail;
    
    console.log(`Agent message from ${from} to ${to}: ${message}`);
    
    // Route message to appropriate agent
    routeAgentMessage(from, to, message);
  });
  
  // Listen for agent status changes
  window.addEventListener('agent-status-change', (event) => {
    const { agent, status } = event.detail;
    
    console.log(`Agent ${agent} status changed to ${status}`);
    
    // Update agent status indicators
    updateAgentStatusIndicator(agent, status);
  });
}

// Route message to appropriate agent
function routeAgentMessage(from, to, message) {
  switch (to) {
    case 'lee':
      if (window.AgentLee) {
        window.AgentLee.receiveMessage(from, message);
      }
      break;
    case 'tim':
      if (window.AgentTim) {
        window.AgentTim.receiveMessage(from, message);
      }
      break;
    case 'leonard':
      if (window.AgentLeonard) {
        window.AgentLeonard.receiveMessage(from, message);
      }
      break;
    case 'nicole':
      if (window.AgentNicole) {
        window.AgentNicole.receiveMessage(from, message);
      }
      break;
    case 'all':
      // Broadcast to all agents
      if (window.AgentLee) {
        window.AgentLee.receiveMessage(from, message);
      }
      if (window.AgentTim) {
        window.AgentTim.receiveMessage(from, message);
      }
      if (window.AgentLeonard) {
        window.AgentLeonard.receiveMessage(from, message);
      }
      if (window.AgentNicole) {
        window.AgentNicole.receiveMessage(from, message);
      }
      break;
    default:
      console.warn(`Unknown agent: ${to}`);
  }
}

// Update agent status indicator
function updateAgentStatusIndicator(agent, status) {
  const statusIndicator = document.querySelector(`.agent-${agent}-status`);
  
  if (statusIndicator) {
    // Remove all status classes
    statusIndicator.classList.remove('status-online', 'status-busy', 'status-away', 'status-offline');
    
    // Add appropriate status class
    statusIndicator.classList.add(`status-${status}`);
    
    // Update tooltip
    statusIndicator.setAttribute('title', `${agent.charAt(0).toUpperCase() + agent.slice(1)} is ${status}`);
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAgentIntegration);
