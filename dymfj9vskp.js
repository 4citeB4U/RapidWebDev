// Agent Card Component
class AgentCard {
  constructor(agent, position = { top: '100px', left: '50px' }) {
    this.agent = agent;
    this.position = position;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.messages = [];
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.cardElement = null;
  }

  // Create the card HTML
  createCardHTML() {
    const { id, name, avatar, description, color, accentColor, secondaryColor } = this.agent;
    
    return `
      <div id="agent-${id}-card" class="agent-card" style="display: block; top: ${this.position.top}; left: ${this.position.left}; border-color: ${color};">
        <!-- Card Header -->
        <div class="card-header" id="${id}-drag-handle">
          <div class="avatar">${avatar}</div>
          <div class="agent-details">
            <h3 style="color: ${accentColor}">${name}</h3>
            <p style="color: ${secondaryColor}">${description}</p>
          </div>
        </div>
        
        <!-- Content Area - Will be filled by specific agent implementations -->
        <div id="${id}-content-area" class="content-area"></div>
        
        <!-- Chat Area -->
        <div class="chat-area" id="${id}-chat-messages">
          <div class="empty-chat" id="${id}-empty-message">
            Send a message to ${name}
          </div>
          <!-- Messages will be added here dynamically -->
        </div>
        
        <!-- Message Input -->
        <textarea 
          class="message-input" 
          id="${id}-message-input" 
          rows="2" 
          placeholder="Type your message..."></textarea>
        
        <!-- Control Buttons -->
        <div class="control-row">
          <button class="control-button send-btn" id="${id}-send-button" style="background-color: ${color};">
            <span class="btn-icon">📤</span> Send
          </button>
          <button class="control-button listen-btn" id="${id}-listen-button" style="background-color: #16a34a;">
            <span class="btn-icon">🎤</span> Listen
          </button>
        </div>
        <div class="control-row">
          <button class="control-button stop-btn" id="${id}-stop-button" style="background-color: #dc2626;">
            <span class="btn-icon">🛑</span> Stop
          </button>
          <button class="control-button done-btn" id="${id}-done-button" style="background-color: #2563eb;">
            <span class="btn-icon">✓</span> Done
          </button>
        </div>
      </div>
    `;
  }

  // Render the card to the DOM
  render(parentElement) {
    // Create the card element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.createCardHTML();
    this.cardElement = tempDiv.firstElementChild;
    
    // Append to parent
    parentElement.appendChild(this.cardElement);
    
    // Initialize event listeners
    this.initEventListeners();
    
    return this.cardElement;
  }

  // Initialize event listeners
  initEventListeners() {
    const { id } = this.agent;
    
    // Get elements
    const dragHandle = document.getElementById(`${id}-drag-handle`);
    const sendButton = document.getElementById(`${id}-send-button`);
    const listenButton = document.getElementById(`${id}-listen-button`);
    const stopButton = document.getElementById(`${id}-stop-button`);
    const doneButton = document.getElementById(`${id}-done-button`);
    const messageInput = document.getElementById(`${id}-message-input`);
    
    // Make the card draggable
    if (dragHandle) {
      dragHandle.addEventListener('mousedown', this.handleDragStart.bind(this));
      document.addEventListener('mousemove', this.handleDragMove.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));
    }
    
    // Send message on button click
    if (sendButton) {
      sendButton.addEventListener('click', this.handleSend.bind(this));
    }
    
    // Send message on Enter key (without Shift)
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
    }
    
    // Listen button
    if (listenButton) {
      listenButton.addEventListener('click', this.startListening.bind(this));
    }
    
    // Stop button
    if (stopButton) {
      stopButton.addEventListener('click', this.stopSpeaking.bind(this));
    }
    
    // Done button
    if (doneButton) {
      doneButton.addEventListener('click', this.handleDone.bind(this));
    }
  }

  // Drag start handler
  handleDragStart(e) {
    const { id } = this.agent;
    const card = document.getElementById(`agent-${id}-card`);
    
    this.isDragging = true;
    this.offsetX = e.clientX - card.getBoundingClientRect().left;
    this.offsetY = e.clientY - card.getBoundingClientRect().top;
    card.style.cursor = 'grabbing';
  }

  // Drag move handler
  handleDragMove(e) {
    if (!this.isDragging) return;
    
    const { id } = this.agent;
    const card = document.getElementById(`agent-${id}-card`);
    
    card.style.left = `${e.clientX - this.offsetX}px`;
    card.style.top = `${e.clientY - this.offsetY}px`;
  }

  // Drag end handler
  handleDragEnd() {
    const { id } = this.agent;
    const card = document.getElementById(`agent-${id}-card`);
    
    this.isDragging = false;
    card.style.cursor = 'default';
  }

  // Send message handler
  handleSend() {
    const { id } = this.agent;
    const messageInput = document.getElementById(`${id}-message-input`);
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    messageInput.value = '';
    
    // Process with WebLLM or fallback to simulated response
    this.processMessage(message);
  }

  // Process message with WebLLM or fallback
  async processMessage(message) {
    const { behavior } = this.agent;
    
    try {
      let response;
      
      if (window.webllm && window.webllm.initialized) {
        // Process with WebLLM
        response = await window.webllm.processMessage(message, {
          agentId: this.agent.id,
          agentName: this.agent.name,
          agentRole: this.agent.role,
          previousMessages: this.messages
        });
      } else {
        // Fallback to simulated response
        response = behavior.greeting || "I'm here to help. What can I do for you?";
      }
      
      // Add agent message
      this.addMessage(response, 'agent');
      
      // Speak the response
      this.speak(response);
    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage("I'm sorry, I encountered an error processing your message. Please try again.", 'agent');
    }
  }

  // Add message to chat
  addMessage(text, sender) {
    const { id } = this.agent;
    const chatMessages = document.getElementById(`${id}-chat-messages`);
    const emptyMessage = document.getElementById(`${id}-empty-message`);
    
    // Hide empty message
    if (emptyMessage) {
      emptyMessage.style.display = 'none';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'agent-message');
    messageElement.textContent = text;
    
    // Add to chat
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store message
    this.messages.push({
      text,
      sender,
      timestamp: new Date().toISOString()
    });
    
    // Save to localStorage
    this.saveMessages();
    
    // Check for chat master badge
    if (this.messages.length >= 10 && typeof window.awardBadge === 'function') {
      window.awardBadge('chatMaster');
    }
  }

  // Save messages to localStorage
  saveMessages() {
    const { id } = this.agent;
    localStorage.setItem(`${id}-messages`, JSON.stringify(this.messages));
  }

  // Load messages from localStorage
  loadMessages() {
    const { id } = this.agent;
    const savedMessages = localStorage.getItem(`${id}-messages`);
    
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
      
      // Display messages
      const chatMessages = document.getElementById(`${id}-chat-messages`);
      const emptyMessage = document.getElementById(`${id}-empty-message`);
      
      if (this.messages.length > 0 && emptyMessage) {
        emptyMessage.style.display = 'none';
      }
      
      this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(message.sender === 'user' ? 'user-message' : 'agent-message');
        messageElement.textContent = message.text;
        
        chatMessages.appendChild(messageElement);
      });
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Start listening for speech
  startListening() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.addMessage("Speech recognition is not supported in your browser.", 'agent');
      return;
    }
    
    const { id } = this.agent;
    const listenButton = document.getElementById(`${id}-listen-button`);
    
    // Create recognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.agent.defaultVoice.lang || 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    // Update UI
    this.isListening = true;
    if (listenButton) {
      listenButton.textContent = '🎤 Listening...';
      listenButton.style.backgroundColor = '#dc2626';
    }
    
    // Handle result
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const messageInput = document.getElementById(`${id}-message-input`);
      
      if (messageInput) {
        messageInput.value = transcript;
      }
      
      this.handleSend();
    };
    
    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
      if (listenButton) {
        listenButton.textContent = '🎤 Listen';
        listenButton.style.backgroundColor = '#16a34a';
      }
    };
    
    // Handle error
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (listenButton) {
        listenButton.textContent = '🎤 Listen';
        listenButton.style.backgroundColor = '#16a34a';
      }
    };
    
    // Start recognition
    this.recognition.start();
  }

  // Speak text
  speak(text) {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    // Stop any current speech
    this.stopSpeaking();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.name === this.agent.defaultVoice.name) || voices[0];
    
    utterance.voice = voice;
    utterance.lang = this.agent.defaultVoice.lang || 'en-US';
    utterance.rate = this.agent.defaultVoice.rate || 1.0;
    utterance.pitch = this.agent.defaultVoice.pitch || 1.0;
    
    // Update UI
    this.isSpeaking = true;
    
    // Handle end
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    
    // Speak
    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Handle done button
  handleDone() {
    const { id } = this.agent;
    const card = document.getElementById(`agent-${id}-card`);
    
    if (card) {
      card.style.display = 'none';
    }
  }

  // Send welcome message
  sendWelcomeMessage() {
    const { behavior } = this.agent;
    
    if (behavior && behavior.greeting) {
      setTimeout(() => {
        this.addMessage(behavior.greeting, 'agent');
        this.speak(behavior.greeting);
      }, 1000);
    }
  }

  // Export chat history
  exportChatHistory() {
    const { id, name } = this.agent;
    
    // Create export object
    const exportData = {
      agent: {
        id,
        name,
        role: this.agent.role
      },
      messages: this.messages,
      exportDate: new Date().toISOString()
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${id}-chat-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentCard;
} else {
  // For browser use
  window.AgentCard = AgentCard;
}
