// Transforming Agent Card Integration
document.addEventListener('DOMContentLoaded', function() {
  console.log('Agent Card: DOM Content Loaded');
  // Initialize the transforming agent card
  initializeAgentCard();
});

// Also initialize when the window is fully loaded
window.addEventListener('load', function() {
  console.log('Agent Card: Window Loaded');
  // Initialize the transforming agent card
  initializeAgentCard();

  // Check if user is already logged in and show agent card
  if (localStorage.getItem('user_logged_in') === 'true') {
    console.log('Agent Card: User is logged in, showing agent card');
    showAgentCard();
  }
});

// Agent types and their properties
const agentTypes = {
  lee: {
    name: 'Agent Lee',
    avatar: 'assets/mainpage/agentsavatars/agentlee.png',
    borderColor: 'agent-lee',
    buttonColor: 'blue',
    sections: ['home', 'default']
  },
  sales: {
    name: 'Sales Agent',
    avatar: 'assets/mainpage/agentsavatars/salesagent2.png',
    borderColor: 'agent-sales',
    buttonColor: 'purple',
    sections: ['pricing', 'plans']
  },
  resource: {
    name: 'Resource Agent',
    avatar: 'assets/mainpage/agentsavatars/resourseagent.png',
    borderColor: 'agent-resource',
    buttonColor: 'emerald',
    sections: ['learning', 'resources', 'documentation']
  },
  showcase: {
    name: 'Showcase Agent',
    avatar: 'assets/mainpage/agentsavatars/showcaseagent1.png',
    borderColor: 'agent-showcase',
    buttonColor: 'pink',
    sections: ['showcase', 'animations', 'portfolio']
  }
};

// Current agent type
let currentAgentType = 'lee';

// Custom mouse mode state
let customMouseModeActive = false;

// Telegram bot username - can be updated from settings
let telegramBotUsername = '@rapid_web_assistant';

function initializeAgentCard() {
  // Make the agent card draggable
  makeCardDraggable();

  // Connect button events for the agent card
  connectAgentButtons();

  // Set up hash change listener to transform the agent
  setupHashChangeListener();

  // Show agent card after login (if user is logged in)
  if (localStorage.getItem('user_logged_in') === 'true') {
    showAgentCard();
  }

  // Initialize custom mouse functionality
  initializeCustomMouse();
}

/**
 * Initialize custom mouse functionality
 */
function initializeCustomMouse() {
  // Check if custom mouse should be enabled by default
  if (localStorage.getItem('custom_mouse_enabled') === 'true') {
    toggleCustomMouseMode(true);
  }

  // Add global custom mouse object
  window.customMouseMode = {
    active: customMouseModeActive,
    toggle: function() {
      toggleCustomMouseMode(!customMouseModeActive);
      return customMouseModeActive ? 'Custom mouse mode activated' : 'Custom mouse mode deactivated';
    }
  };
}

/**
 * Toggle custom mouse mode
 * @param {boolean} active - Whether to activate or deactivate custom mouse mode
 */
function toggleCustomMouseMode(active) {
  customMouseModeActive = active;
  
  // Update localStorage
  localStorage.setItem('custom_mouse_enabled', active ? 'true' : 'false');
  
  // Apply custom cursor
  if (active) {
    document.body.style.cursor = "pointer";
    // Add custom class to body for additional styling
    document.body.classList.add('custom-mouse-active');
    console.log('Custom mouse mode activated');
  } else {
    document.body.style.cursor = "default";
    document.body.classList.remove('custom-mouse-active');
    console.log('Custom mouse mode deactivated');
  }
  
  // Update star button visual if it exists
  updateStarButtonState();
}

/**
 * Update the star button state based on custom mouse mode
 */
function updateStarButtonState() {
  const starButtons = document.querySelectorAll('.custom-mouse-button');
  starButtons.forEach(button => {
    if (customMouseModeActive) {
      button.classList.add('active');
      button.classList.remove('bg-purple-600');
      button.classList.add('bg-purple-400');
    } else {
      button.classList.remove('active');
      button.classList.remove('bg-purple-400');
      button.classList.add('bg-purple-600');
    }
  });
}

/**
 * Open Telegram chat with the configured bot
 */
function openTelegramChat() {
  // Get the username from settings if available
  const username = telegramBotUsername || '@rapid_web_assistant';
  
  // Open Telegram in new tab
  window.open(`https://t.me/${username.replace('@', '')}`, '_blank');
  console.log(`Opening Telegram chat with ${username}`);
  
  // Announce via agent if available
  if (window.AgentLee && window.AgentLee.speak) {
    window.AgentLee.speak(`Opening Telegram chat with ${username}`);
  } else if (window.EnhancedAgentLee && window.EnhancedAgentLee.agentSpeak) {
    window.EnhancedAgentLee.agentSpeak(`Opening Telegram chat with ${username}`, currentAgentType);
  }
}

/**
 * Connect event listeners to the agent card buttons
 */
function connectAgentButtons() {
  const card = document.getElementById('agent-card');
  if (!card) {
    console.warn('Agent card not found');
    return;
  }

  const listenButton = document.getElementById('agent-listen');
  const stopButton = document.getElementById('agent-stop');
  const sendButton = document.getElementById('agent-send');
  const textarea = document.getElementById('agent-input');
  
  // Connect communication buttons
  const messageButton = card.querySelector('.communication-buttons button:nth-child(1)');
  const phoneButton = card.querySelector('.communication-buttons button:nth-child(2)');
  const telegramButton = card.querySelector('.communication-buttons button:nth-child(3)');
  const customMouseButton = card.querySelector('.communication-buttons button:nth-child(4)');

  if (telegramButton) {
    telegramButton.classList.add('telegram-button');
    telegramButton.addEventListener('click', function() {
      openTelegramChat();
    });
  }

  if (customMouseButton) {
    customMouseButton.classList.add('custom-mouse-button');
    customMouseButton.addEventListener('click', function() {
      toggleCustomMouseMode(!customMouseModeActive);
    });
    
    // Set initial state
    if (customMouseModeActive) {
      customMouseButton.classList.add('active');
      customMouseButton.classList.remove('bg-purple-600');
      customMouseButton.classList.add('bg-purple-400');
    }
  }

  if (listenButton) {
    listenButton.addEventListener('click', function() {
      // Use EnhancedAgentLee if available, otherwise fallback
      if (window.EnhancedAgentLee && window.EnhancedAgentLee.startListening) {
        window.EnhancedAgentLee.startListening();
      } else if (window.AgentLee) {
        window.AgentLee.startListening();
      } else {
        console.warn('Agent Lee not initialized');
      }
    });
  } else {
    console.warn('Listen button not found');
  }

  if (stopButton) {
    stopButton.addEventListener('click', function() {
      try {
        // Stop speech synthesis
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // Stop recognition if using EnhancedAgentLee
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.recognition) {
          window.EnhancedAgentLee.recognition.abort();
        }

        // Stop Agent Lee if available
        if (window.AgentLee) {
          if (window.AgentLee.isListening) {
            window.AgentLee.stopListening();
          }
        }
      } catch (e) {
        console.warn('Failed to stop speech/recognition:', e);
      }
    });
  } else {
    console.warn('Stop button not found');
  }

  if (sendButton && textarea) {
    sendButton.addEventListener('click', function() {
      const text = textarea.value.trim();
      if (text) {
        // Process user input using available methods based on current agent type
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.processUserInput) {
          window.EnhancedAgentLee.processUserInput(text, currentAgentType);
        } else if (window.AgentLee) {
          // Switch agent if possible
          if (window.AgentLee.switchAgent && currentAgentType !== 'lee') {
            window.AgentLee.switchAgent(currentAgentType);
          }
          window.AgentLee.handleCommand(text);
        } else if (window.processUserInput) {
          window.processUserInput(text);
        } else {
          console.warn('No method available to process user input');
        }

        // Clear the textarea
        textarea.value = '';

        // Add message to the messages container
        const messagesContainer = document.getElementById('agent-messages');
        if (messagesContainer) {
          const userMessage = document.createElement('div');
          userMessage.className = 'mb-2 text-right';

          // Use the appropriate color based on agent type
          const bgColorClass = `bg-${agentTypes[currentAgentType].buttonColor}-600`;
          userMessage.innerHTML = `<span class="${bgColorClass} text-white px-2 py-1 rounded-lg inline-block">${text}</span>`;

          messagesContainer.appendChild(userMessage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    });
  } else {
    console.warn('Send button or textarea not found');
  }

  // Connect settings form if card has flippable functionality
  const cardBackSide = card.querySelector('.card-back');
  if (cardBackSide) {
    const telegramUsernameInput = cardBackSide.querySelector('input[name="telegram-username"]');
    if (telegramUsernameInput) {
      // Set initial value
      telegramUsernameInput.value = telegramBotUsername;
      
      // Listen for changes
      telegramUsernameInput.addEventListener('change', function() {
        telegramBotUsername = this.value;
        localStorage.setItem('telegram_bot_username', this.value);
      });
    }
    
    const customMouseCheckbox = cardBackSide.querySelector('input[name="enable-custom-mouse"]');
    if (customMouseCheckbox) {
      // Set initial state
      customMouseCheckbox.checked = customMouseModeActive;
      
      // Listen for changes
      customMouseCheckbox.addEventListener('change', function() {
        toggleCustomMouseMode(this.checked);
      });
    }
  }
}

function connectSalesAgentButtons() {
  const card = document.getElementById('sales-agent-card');
  if (!card) return;

  const listenButton = card.querySelector('button:nth-child(1)');
  const stopButton = card.querySelector('button:nth-child(2)');
  const sendButton = card.querySelector('button:nth-child(3)');
  const textarea = card.querySelector('textarea');
  
  // Connect communication buttons
  const telegramButton = card.querySelector('.communication-buttons button:nth-child(3)');
  const customMouseButton = card.querySelector('.communication-buttons button:nth-child(4)');

  if (telegramButton) {
    telegramButton.classList.add('telegram-button');
    telegramButton.addEventListener('click', function() {
      openTelegramChat();
    });
  }

  if (customMouseButton) {
    customMouseButton.classList.add('custom-mouse-button');
    customMouseButton.addEventListener('click', function() {
      toggleCustomMouseMode(!customMouseModeActive);
    });
    
    // Set initial state
    if (customMouseModeActive) {
      customMouseButton.classList.add('active');
    }
  }

  if (listenButton) {
    listenButton.addEventListener('click', function() {
      if (window.EnhancedAgentLee && window.EnhancedAgentLee.startListening) {
        window.EnhancedAgentLee.startListening();
      } else if (window.AgentLee) {
        window.AgentLee.startListening();
      }
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', function() {
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.recognition) {
          window.EnhancedAgentLee.recognition.abort();
        }
        if (window.AgentLee && window.AgentLee.isListening) {
          window.AgentLee.stopListening();
        }
      } catch (e) {
        console.warn('Failed to stop speech/recognition:', e);
      }
    });
  }

  if (sendButton && textarea) {
    sendButton.addEventListener('click', function() {
      const text = textarea.value.trim();
      if (text) {
        // Process with sales agent type
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.processUserInput) {
          window.EnhancedAgentLee.processUserInput(text, 'sales');
        } else if (window.AgentLee) {
          // Switch to sales agent if possible
          if (window.AgentLee.switchAgent) {
            window.AgentLee.switchAgent('sales');
          }
          window.AgentLee.handleCommand(text);
        }

        textarea.value = '';

        // Add message to the messages container
        const messagesContainer = card.querySelector('.messages-container');
        if (messagesContainer) {
          const userMessage = document.createElement('div');
          userMessage.className = 'mb-2 text-right';
          userMessage.innerHTML = `<span class="bg-purple-600 text-white px-2 py-1 rounded-lg inline-block">${text}</span>`;
          messagesContainer.appendChild(userMessage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    });
  }
}

function connectResourceAgentButtons() {
  const card = document.getElementById('resource-agent-card');
  if (!card) return;

  const listenButton = card.querySelector('button:nth-child(1)');
  const stopButton = card.querySelector('button:nth-child(2)');
  const sendButton = card.querySelector('button:nth-child(3)');
  const textarea = card.querySelector('textarea');
  
  // Connect communication buttons
  const telegramButton = card.querySelector('.communication-buttons button:nth-child(3)');
  const customMouseButton = card.querySelector('.communication-buttons button:nth-child(4)');

  if (telegramButton) {
    telegramButton.classList.add('telegram-button');
    telegramButton.addEventListener('click', function() {
      openTelegramChat();
    });
  }

  if (customMouseButton) {
    customMouseButton.classList.add('custom-mouse-button');
    customMouseButton.addEventListener('click', function() {
      toggleCustomMouseMode(!customMouseModeActive);
    });
    
    // Set initial state
    if (customMouseModeActive) {
      customMouseButton.classList.add('active');
    }
  }

  if (listenButton) {
    listenButton.addEventListener('click', function() {
      if (window.EnhancedAgentLee && window.EnhancedAgentLee.startListening) {
        window.EnhancedAgentLee.startListening();
      } else if (window.AgentLee) {
        window.AgentLee.startListening();
      }
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', function() {
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.recognition) {
          window.EnhancedAgentLee.recognition.abort();
        }
        if (window.AgentLee && window.AgentLee.isListening) {
          window.AgentLee.stopListening();
        }
      } catch (e) {
        console.warn('Failed to stop speech/recognition:', e);
      }
    });
  }

  if (sendButton && textarea) {
    sendButton.addEventListener('click', function() {
      const text = textarea.value.trim();
      if (text) {
        // Process with resource agent type
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.processUserInput) {
          window.EnhancedAgentLee.processUserInput(text, 'resource');
        } else if (window.AgentLee) {
          // Switch to resource agent if possible
          if (window.AgentLee.switchAgent) {
            window.AgentLee.switchAgent('resource');
          }
          window.AgentLee.handleCommand(text);
        }

        textarea.value = '';

        // Add message to the messages container
        const messagesContainer = card.querySelector('.messages-container');
        if (messagesContainer) {
          const userMessage = document.createElement('div');
          userMessage.className = 'mb-2 text-right';
          userMessage.innerHTML = `<span class="bg-emerald-600 text-white px-2 py-1 rounded-lg inline-block">${text}</span>`;
          messagesContainer.appendChild(userMessage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    });
  }
}

function connectShowcaseAgentButtons() {
  const card = document.getElementById('showcase-agent-card');
  if (!card) return;

  const listenButton = card.querySelector('button:nth-child(1)');
  const stopButton = card.querySelector('button:nth-child(2)');
  const sendButton = card.querySelector('button:nth-child(3)');
  const textarea = card.querySelector('textarea');
  
  // Connect communication buttons
  const telegramButton = card.querySelector('.communication-buttons button:nth-child(3)');
  const customMouseButton = card.querySelector('.communication-buttons button:nth-child(4)');

  if (telegramButton) {
    telegramButton.classList.add('telegram-button');
    telegramButton.addEventListener('click', function() {
      openTelegramChat();
    });
  }

  if (customMouseButton) {
    customMouseButton.classList.add('custom-mouse-button');
    customMouseButton.addEventListener('click', function() {
      toggleCustomMouseMode(!customMouseModeActive);
    });
    
    // Set initial state
    if (customMouseModeActive) {
      customMouseButton.classList.add('active');
    }
  }

  if (listenButton) {
    listenButton.addEventListener('click', function() {
      if (window.EnhancedAgentLee && window.EnhancedAgentLee.startListening) {
        window.EnhancedAgentLee.startListening();
      } else if (window.AgentLee) {
        window.AgentLee.startListening();
      }
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', function() {
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.recognition) {
          window.EnhancedAgentLee.recognition.abort();
        }
        if (window.AgentLee && window.AgentLee.isListening) {
          window.AgentLee.stopListening();
        }
      } catch (e) {
        console.warn('Failed to stop speech/recognition:', e);
      }
    });
  }

  if (sendButton && textarea) {
    sendButton.addEventListener('click', function() {
      const text = textarea.value.trim();
      if (text) {
        // Process with showcase agent type
        if (window.EnhancedAgentLee && window.EnhancedAgentLee.processUserInput) {
          window.EnhancedAgentLee.processUserInput(text, 'showcase');
        } else if (window.AgentLee) {
          // Switch to showcase agent if possible
          if (window.AgentLee.switchAgent) {
            window.AgentLee.switchAgent('showcase');
          }
          window.AgentLee.handleCommand(text);
        }

        textarea.value = '';

        // Add message to the messages container
        const messagesContainer = card.querySelector('.messages-container');
        if (messagesContainer) {
          const userMessage = document.createElement('div');
          userMessage.className = 'mb-2 text-right';
          userMessage.innerHTML = `<span class="bg-pink-600 text-white px-2 py-1 rounded-lg inline-block">${text}</span>`;
          messagesContainer.appendChild(userMessage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    });
  }
}

/**
 * Show the agent card if the user is logged in
 */
function showAgentCard() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';

  if (isLoggedIn) {
    const card = document.getElementById('agent-card');
    if (card) {
      card.classList.remove('hidden');
      console.log('Agent card is now visible');

      // Transform the agent based on the current page
      transformAgentBasedOnPage();
      
      // Restore settings from localStorage
      restoreAgentSettings();
    } else {
      console.warn('Agent card element not found');
    }
  }
}

/**
 * Restore agent settings from localStorage
 */
function restoreAgentSettings() {
  // Restore Telegram username
  const savedUsername = localStorage.getItem('telegram_bot_username');
  if (savedUsername) {
    telegramBotUsername = savedUsername;
    
    // Update input if it exists
    const telegramUsernameInput = document.querySelector('input[name="telegram-username"]');
    if (telegramUsernameInput) {
      telegramUsernameInput.value = savedUsername;
    }
  }
  
  // Restore custom mouse setting
  const customMouseEnabled = localStorage.getItem('custom_mouse_enabled') === 'true';
  if (customMouseEnabled !== customMouseModeActive) {
    toggleCustomMouseMode(customMouseEnabled);
  }
}

/**
 * Set up a listener for hash changes to transform the agent
 */
function setupHashChangeListener() {
  // Initial transformation based on current page
  transformAgentBasedOnPage();

  // Add event listener for hash changes
  window.addEventListener('hashchange', function() {
    console.log('Hash changed, transforming agent');
    transformAgentBasedOnPage();
  });
}

/**
 * Transform the agent based on the current page
 */
function transformAgentBasedOnPage() {
  // Get current hash
  const currentHash = window.location.hash.replace('#', '');
  console.log('Current hash:', currentHash);

  // Determine which agent type to show based on the hash
  let newAgentType = 'lee'; // Default to Agent Lee

  if (currentHash === 'pricing') {
    newAgentType = 'sales';
  } else if (currentHash === 'learning') {
    newAgentType = 'resource';
  } else if (currentHash === 'showcase') {
    newAgentType = 'showcase';
  }

  // Only transform if the agent type has changed
  if (newAgentType !== currentAgentType) {
    transformAgent(newAgentType);
  }
}

/**
 * Transform the agent to a new type with animation
 * @param {string} newAgentType - The new agent type (lee, sales, resource, showcase)
 */
function transformAgent(newAgentType) {
  console.log(`Transforming agent from ${currentAgentType} to ${newAgentType}`);

  const card = document.getElementById('agent-card');
  const avatar = document.getElementById('agent-avatar');
  const name = document.getElementById('agent-name');
  const listenButton = document.getElementById('agent-listen');
  const sendButton = document.getElementById('agent-send');

  if (!card || !avatar || !name) {
    console.warn('Required elements not found for transformation');
    return;
  }

  // Start the flip animation
  card.classList.add('card-flip-enter');

  // After a short delay, update the agent properties
  setTimeout(() => {
    // Update the card border color
    // First remove all agent type classes
    Object.values(agentTypes).forEach(agent => {
      card.classList.remove(agent.borderColor);
    });
    // Add the new agent type class
    card.classList.add(agentTypes[newAgentType].borderColor);

    // Update the avatar with fade effect
    avatar.style.opacity = '0';
    setTimeout(() => {
      avatar.src = agentTypes[newAgentType].avatar;
      avatar.alt = agentTypes[newAgentType].name + ' Avatar';
      avatar.style.opacity = '1';
    }, 300);

    // Update the agent name
    name.textContent = agentTypes[newAgentType].name;

    // Update button colors if they exist
    if (listenButton) {
      listenButton.className = `bg-${agentTypes[newAgentType].buttonColor}-600 hover:bg-${agentTypes[newAgentType].buttonColor}-500 text-white py-1 rounded transition-colors duration-300`;
    }

    if (sendButton) {
      sendButton.className = `bg-${agentTypes[newAgentType].buttonColor}-600 hover:bg-${agentTypes[newAgentType].buttonColor}-500 text-white py-1 rounded col-span-2 transition-colors duration-300`;
    }

    // Complete the flip animation
    card.classList.add('card-flip-active');

    // Update the current agent type
    currentAgentType = newAgentType;

    // Announce the agent change if Agent Lee is available
    if (window.AgentLee && window.AgentLee.speak) {
      window.AgentLee.speak(`I am now ${agentTypes[newAgentType].name}, ready to assist you with ${getAgentSpecialty(newAgentType)}.`);
    } else if (window.EnhancedAgentLee && window.EnhancedAgentLee.agentSpeak) {
      window.EnhancedAgentLee.agentSpeak(`I am now ${agentTypes[newAgentType].name}, ready to assist you with ${getAgentSpecialty(newAgentType)}.`, newAgentType);
    }
  }, 300);

  // Reset the animation classes after completion
  setTimeout(() => {
    card.classList.remove('card-flip-enter', 'card-flip-active', 'card-flip-exit');
  }, 1000);
}

/**
 * Get the specialty description for an agent type
 * @param {string} agentType - The agent type
 * @returns {string} The specialty description
 */
function getAgentSpecialty(agentType) {
  switch(agentType) {
    case 'sales':
      return 'pricing and plans';
    case 'resource':
      return 'learning resources and documentation';
    case 'showcase':
      return 'animations and portfolio showcases';
    default:
      return 'general assistance';
  }
}

/**
 * Make the agent card draggable
 */
function makeCardDraggable() {
  const card = document.getElementById('agent-card');
  if (!card) {
    console.warn('Agent card not found for draggable functionality');
    return;
  }

  let isDragging = false;
  let offsetX, offsetY;

  // Make the card header the drag handle
  const cardHeader = card.querySelector('h2');
  if (!cardHeader) {
    console.warn('Card header not found for draggable functionality');
    return;
  }

  cardHeader.style.cursor = 'move';

  cardHeader.addEventListener('mousedown', function(e) {
    isDragging = true;
    offsetX = e.clientX - card.getBoundingClientRect().left;
    offsetY = e.clientY - card.getBoundingClientRect().top;

    // Prevent text selection during drag
    e.preventDefault();

    // Add active dragging class
    card.classList.add('dragging');
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    // Keep the card within the viewport
    const maxX = window.innerWidth - card.offsetWidth;
    const maxY = window.innerHeight - card.offsetHeight;

    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    card.style.left = `${boundedX}px`;
    card.style.top = `${boundedY}px`;
  });

  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      card.classList.remove('dragging');

      // Save the card position to localStorage
      try {
        localStorage.setItem('agent_card_position', JSON.stringify({
          left: card.style.left,
          top: card.style.top
        }));
      } catch (e) {
        console.warn('Failed to save card position:', e);
      }
    }
  });

  // Restore saved position if available
  try {
    const savedPosition = JSON.parse(localStorage.getItem('agent_card_position'));
    if (savedPosition) {
      card.style.left = savedPosition.left;
      card.style.top = savedPosition.top;
    }
  } catch (e) {
    console.warn('Failed to restore card position:', e);
  }
}

/**
 * Add an agent response to the message container
 * @param {string} text - The response text
 * @param {string} agentType - The agent type (lee, sales, resource, showcase)
 */
function addAgentResponse(text, agentType = 'lee') {
  // Get the messages container
  const messagesContainer = document.getElementById('agent-messages');
  if (!messagesContainer) {
    console.warn('Messages container not found');
    return;
  }

  // Determine the background color class based on agent type
  let bgColorClass;

  switch(agentType) {
    case 'sales':
      bgColorClass = 'bg-purple-500';
      break;
    case 'resource':
      bgColorClass = 'bg-emerald-500';
      break;
    case 'showcase':
      bgColorClass = 'bg-pink-500';
      break;
    default: // 'lee'
      bgColorClass = 'bg-blue-500';
  }

  // Create and add the agent message
  const agentMessage = document.createElement('div');
  agentMessage.className = 'mb-2 text-left';
  agentMessage.innerHTML = `<span class="${bgColorClass} text-white px-2 py-1 rounded-lg inline-block">${text}</span>`;
  messagesContainer.appendChild(agentMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // If the agent type is different from the current one, transform the agent
  if (agentType !== currentAgentType) {
    transformAgent(agentType);
  }
}

// Override the speech functions to also display messages in the agent cards
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Agent Lee to be initialized
  const checkInterval = setInterval(() => {
    if (window.AgentLee) {
      clearInterval(checkInterval);

      // Store the original speak function
      const originalSpeak = window.AgentLee.speak;

      // Override the speak function
      window.AgentLee.speak = function(text, options = {}) {
        // Call the original function
        originalSpeak.call(this, text, options);

        // Add the response to the appropriate agent card
        addAgentResponse(text, this.currentAgent);
      };
    }

    // Also check for EnhancedAgentLee
    if (window.EnhancedAgentLee && window.EnhancedAgentLee.agentSpeak) {
      clearInterval(checkInterval);

      // Store the original agentSpeak function
      const originalAgentSpeak = window.EnhancedAgentLee.agentSpeak;

      // Override the agentSpeak function
      window.EnhancedAgentLee.agentSpeak = async function(text, agentType = 'lee') {
        // Call the original function
        await originalAgentSpeak.call(this, text, agentType);

        // Add the response to the appropriate agent card
        addAgentResponse(text, agentType);
      };
    }
  }, 100);
});

// Add a global function to manually show all agent cards for testing
window.showAllAgentCards = function() {
  console.log('Manually showing all agent cards');
  const agentCards = document.querySelectorAll('.agent-card');
  agentCards.forEach(card => {
    card.classList.remove('hidden');
    console.log(`Showing card: ${card.id}`);
  });
  return `Showed ${agentCards.length} agent cards`;
};

// Add a global function to manually show a specific agent card for testing
window.showAgentCard = function(cardType) {
  const cardId = `${cardType}-agent-card`;
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.remove('hidden');
    console.log(`Showing card: ${cardId}`);
    return `Showed ${cardId}`;
  } else {
    console.warn(`Card not found: ${cardId}`);
    return `Card not found: ${cardId}`;
  }
};

// Export Telegram and custom mouse functions to global scope
window.openTelegramChat = openTelegramChat;
window.customMouseMode = {
  active: customMouseModeActive,
  toggle: function() {
    toggleCustomMouseMode(!customMouseModeActive);
    return customMouseModeActive ? 'Custom mouse mode activated' : 'Custom mouse mode deactivated';
  }
};

// Add CSS for card flipping animations and custom mouse mode
(function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .card-flip-enter {
      animation: flip-enter 0.3s forwards;
    }
    .card-flip-active {
      animation: flip-active 0.3s forwards;
    }
    .card-flip-exit {
      animation: flip-exit 0.3s forwards;
    }
    .dragging {
      opacity: 0.8;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }
    .custom-mouse-active * {
      cursor: pointer !important;
    }
    .telegram-button:hover {
      transform: scale(1.1);
      transition: transform 0.2s;
    }
    .custom-mouse-button.active {
      animation: pulse 1.5s infinite;
    }
    @keyframes flip-enter {
      from { transform: rotateY(0deg); }
      to { transform: rotateY(90deg); }
    }
    @keyframes flip-active {
      from { transform: rotateY(90deg); }
      to { transform: rotateY(180deg); }
    }
    @keyframes flip-exit {
      from { transform: rotateY(180deg); }
      to { transform: rotateY(0deg); }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
})();