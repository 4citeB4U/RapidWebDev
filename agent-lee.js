/**
 * Agent Lee - AI Assistant System
 *
 * Features:
 * - Voice synthesis and recognition
 * - Client-side memory storage
 * - Learning from user interactions
 * - Automatic agent switching based on page section
 * - Gemini 2.5 Pro integration for AI processing
 */

class AgentLee {
  constructor() {
    // Core properties
    this.initialized = false;
    this.visible = false;
    this.isListening = false;
    this.memories = [];
    this.currentAgent = 'lee'; // Default agent
    this.currentSection = 'default';

    // User information
    this.user = {
      isLoggedIn: false,
      name: '',
      email: '',
      permissions: ['cookies']
    };

    // Add dependencies property to track loaded modules
    this.dependencies = {
      gemini: false,
      memory: false,
      training: false,
      enhanced: false
    };

    // Agent definitions
    this.agents = {
      lee: {
        name: 'Agent Lee',
        avatar: 'assets/mainpage/agentsavatars/agentlee.png',
        voice: 'Emma',
        sections: ['default', 'home']
      },
      sales: {
        name: 'Sales Agent',
        avatar: 'assets/mainpage/agentsavatars/salesagent2.png',
        voice: 'David',
        sections: ['pricing', 'plans']
      },
      resource: {
        name: 'Resource Agent',
        avatar: 'assets/mainpage/agentsavatars/resourseagent.png',
        voice: 'Zira',
        sections: ['learning', 'resources', 'documentation']
      },
      showcase: {
        name: 'Showcase Agent',
        avatar: 'assets/mainpage/agentsavatars/showcaseagent1.png',
        voice: 'Mark',
        sections: ['portfolio', 'showcase', 'animations']
      }
    };

    // Speech synthesis
    this.synth = window.speechSynthesis;
    this.recognition = null;

    // DOM elements (will be set during initialization)
    this.container = null;
    this.chatLog = null;
    this.micButton = null;
    this.toggleButton = null;
    this.agentAvatar = null;
    this.agentName = null;

    // Audio elements
    this.introAudio = new Audio('assets/agent-lee-intro.mp3');
    this.introAudio.volume = 1;
    this.introAudio.preload = 'auto';

    // Bind methods to this instance
    this.init = this.init.bind(this);
    this.speak = this.speak.bind(this);
    this.listen = this.listen.bind(this);
    this.stopListening = this.stopListening.bind(this);
    this.toggle = this.toggle.bind(this);
    this.addMemory = this.addMemory.bind(this);
    this.handleCommand = this.handleCommand.bind(this);
    this.switchAgent = this.switchAgent.bind(this);
    this.stopAllAudio = this.stopAllAudio.bind(this);
    this.detectCurrentSection = this.detectCurrentSection.bind(this);
  }

  /**
   * Initialize Agent Lee
   */
  init() {
    if (this.initialized) return;

    // Load user information from localStorage
    this.loadUserInfo();

    // Create UI
    this.createUI();
    
    // Create control panel
    this.createControlPanel();

    // Load memories from localStorage
    this.loadMemories();

    // Initialize speech recognition if available
    this.initSpeechRecognition();

    // Add event listeners
    this.addEventListeners();

    // Load dependencies
    this.loadDependencies();

    // Mark as initialized
    this.initialized = true;

    // Play intro audio when page is visible
    document.addEventListener('DOMContentLoaded', () => {
      const startAudio = () => {
        if (document.visibilityState === 'visible') {
          this.introAudio.play().catch(e => console.error('Audio play failed:', e));
          document.removeEventListener('visibilitychange', startAudio);
        }
      };
      document.addEventListener('visibilitychange', startAudio);
      startAudio();
    });

    // Set up scroll detection for agent switching
    window.addEventListener('scroll', this.detectCurrentSection);

    // Initial section detection
    setTimeout(this.detectCurrentSection, 1000);

    // Show Agent Lee immediately on the landing page
    setTimeout(() => {
      // Make Agent Lee visible
      this.visible = true;
      const body = document.getElementById('lee-body');
      if (body) {
        body.classList.remove('hidden');
      }

      // Provide a welcome message with username if available
      setTimeout(() => {
        if (this.user.isLoggedIn && this.user.name) {
          this.speak(`Welcome back to Rapid Web Development, ${this.user.name}! I am Agent Lee, your AI assistant. How can I help you today?`);
        } else {
          this.speak('Welcome to Rapid Web Development! I am Agent Lee, your AI assistant. How can I help you today?');
        }
      }, 1500);
    }, 2000);

    // Log initialization
    console.log('Agent Lee initialized');
  }

  /**
   * Load user information from localStorage
   */
  loadUserInfo() {
    if (localStorage.getItem('user_logged_in') === 'true') {
      this.user.isLoggedIn = true;
      this.user.name = localStorage.getItem('user_name') || '';
      this.user.email = localStorage.getItem('user_email') || '';
      this.user.permissions = JSON.parse(localStorage.getItem('user_permissions') || '["cookies"]');

      // Update the user name display if it exists
      this.updateUserNameDisplay();

      console.log('Agent Lee loaded user info:', this.user);
    }
  }

  /**
   * Update the user name display in the UI
   */
  updateUserNameDisplay() {
    if (this.userNameDisplay) {
      if (this.user.isLoggedIn && this.user.name) {
        this.userNameDisplay.textContent = `Hello, ${this.user.name}`;
        this.userNameDisplay.classList.remove('hidden');
      } else {
        this.userNameDisplay.textContent = '';
        this.userNameDisplay.classList.add('hidden');
      }
    }
  }

  /**
   * Create the UI for Agent Lee
   */
  createUI() {
    // Create main container - positioned on the top left
    this.container = document.createElement('div');
    this.container.id = 'agent-lee-chat';
    this.container.className = 'fixed z-[9999] left-4 top-4 w-[640px] rounded-2xl bg-indigo-900/90 shadow-2xl border border-indigo-600 backdrop-blur-md overflow-hidden transition-all';
    
    // Increase font sizes and padding for bigger UI
    this.container.style.fontSize = '1.5rem';
    this.container.style.lineHeight = '1.75';
    
    // Add draggable attribute and cursor style
    this.container.style.cursor = 'move';
    this.container.setAttribute('draggable', 'false'); // Prevent default drag behavior
    
    // Add drag functionality
    let isDragging = false;
    let offsetX, offsetY;
    
    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - this.container.getBoundingClientRect().left;
      offsetY = e.clientY - this.container.getBoundingClientRect().top;
      this.container.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      this.container.style.left = `${x}px`;
      this.container.style.top = `${y}px`;
      this.container.style.transform = 'none'; // Remove the transform when dragging
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.container.style.transition = 'all 0.3s ease';
    });
    
    // Create header
    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 p-6 border-b border-indigo-700';
    header.id = 'agent-lee-header'; // Add ID for drag handle

    // Create agent avatar and name - larger for the new size
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'flex items-center gap-5';

    this.agentAvatar = document.createElement('img');
    this.agentAvatar.src = this.agents[this.currentAgent].avatar;
    this.agentAvatar.alt = this.agents[this.currentAgent].name;
    this.agentAvatar.className = 'w-24 h-24 rounded-full border-4 border-blue-400 shadow-lg';

    const nameContainer = document.createElement('div');

    this.agentName = document.createElement('h3');
    this.agentName.className = 'text-blue-100 font-bold text-lg';
    this.agentName.textContent = this.agents[this.currentAgent].name;

    const agentRole = document.createElement('p');
    agentRole.className = 'text-blue-400 text-xs';
    agentRole.textContent = 'Your AI Web Guide';

    // Add user name display if logged in
    this.userNameDisplay = document.createElement('p');
    this.userNameDisplay.className = 'text-green-300 text-xs mt-1';
    if (this.user.isLoggedIn && this.user.name) {
      this.userNameDisplay.textContent = `Hello, ${this.user.name}`;
    } else {
      this.userNameDisplay.textContent = '';
    }

    nameContainer.appendChild(this.agentName);
    nameContainer.appendChild(agentRole);
    nameContainer.appendChild(this.userNameDisplay);

    avatarContainer.appendChild(this.agentAvatar);
    avatarContainer.appendChild(nameContainer);

    // Add toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'toggle-lee';
    this.toggleButton.className = 'ml-auto text-indigo-300 hover:text-white';
    this.toggleButton.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;

    // Add elements to header
    header.appendChild(avatarContainer);
    header.appendChild(this.toggleButton);

    // Create body with larger height
    const body = document.createElement('div');
    body.id = 'lee-body';
    body.className = 'p-6 max-h-[600px] overflow-y-auto';

    // Create chat log
    this.chatLog = document.createElement('div');
    this.chatLog.id = 'lee-log';
    this.chatLog.className = 'space-y-4 mb-6';

    // Create input area with larger elements
    const inputArea = document.createElement('div');
    inputArea.className = 'flex items-center gap-4 p-6 border-t border-indigo-700';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'lee-input';
    textInput.className = 'flex-1 bg-indigo-800/50 text-white rounded px-5 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500';
    textInput.placeholder = 'Ask Agent Lee...';

    // Create larger control buttons
    this.stopTalkingButton = document.createElement('button');
    this.stopTalkingButton.id = 'lee-stop-talking';
    this.stopTalkingButton.className = 'bg-red-600 hover:bg-red-500 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-red-500';
    this.stopTalkingButton.innerHTML = `
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
      </svg>
    `;

    this.listenButton = document.createElement('button');
    this.listenButton.id = 'lee-listen';
    this.listenButton.className = 'bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500';
    this.listenButton.innerHTML = `
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
      </svg>
    `;

    this.respondButton = document.createElement('button');
    this.respondButton.id = 'lee-respond';
    this.respondButton.className = 'bg-green-600 hover:bg-green-500 text-white rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-green-500';
    this.respondButton.innerHTML = `
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
    `;

    // Add elements to input area
    inputArea.appendChild(textInput);
    inputArea.appendChild(this.stopTalkingButton);
    inputArea.appendChild(this.listenButton);
    inputArea.appendChild(this.respondButton);

    // Add elements to body
    body.appendChild(this.chatLog);
    body.appendChild(inputArea);

    // Add elements to container
    this.container.appendChild(header);
    this.container.appendChild(body);
    this.container.appendChild(inputArea);

    // Add container to document
    document.body.appendChild(this.container);

    // Create control panel in top right
    this.createControlPanel();

    // No initial greeting message - wait for user to initiate conversation
  }

  /**
   * Create a control panel in the top right with Telegram, call, and mouse animation buttons
   */
  createControlPanel() {
    // Create control panel container
    const controlPanel = document.createElement('div');
    controlPanel.id = 'agent-lee-control-panel';
    controlPanel.className = 'fixed z-[9999] top-20 right-4 bg-indigo-900/90 backdrop-blur-md border border-indigo-600 rounded-xl p-3 flex gap-3';
    
    // Create call button
    const callButton = document.createElement('button');
    callButton.id = 'call-button';
    callButton.className = 'bg-green-600 hover:bg-green-500 text-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-green-500';
    callButton.title = 'Voice Call';
    callButton.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"/>
      </svg>
    `;
    
    // Create mouse animation button
    const mouseAnimButton = document.createElement('button');
    mouseAnimButton.id = 'mouse-anim-button';
    mouseAnimButton.className = 'bg-purple-600 hover:bg-purple-500 text-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-purple-500';
    mouseAnimButton.title = 'Toggle Mouse Animation';
    mouseAnimButton.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4zm7-13.93C7.05 1.56 4 4.92 4 9h7V1.07z"/>
      </svg>
    `;
    
    // Create Telegram button
    const telegramButton = document.createElement('button');
    telegramButton.id = 'telegram-button';
    telegramButton.className = 'bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500';
    telegramButton.title = 'Chat on Telegram';
    telegramButton.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.196-2.783 5.056-4.564c.223-.198-.054-.308-.335-.112l-6.24 3.93-2.69-.918c-.585-.187-.594-.585.122-.866l10.5-4.043c.485-.18.911.112.75.658z"/>
      </svg>
    `;

    // Add buttons to control panel
    controlPanel.appendChild(telegramButton);
    controlPanel.appendChild(callButton);
    controlPanel.appendChild(mouseAnimButton);

    // Make control panel draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    controlPanel.addEventListener('mousedown', (e) => {
      if (e.target === controlPanel) {
        isDragging = true;
        offsetX = e.clientX - controlPanel.getBoundingClientRect().left;
        offsetY = e.clientY - controlPanel.getBoundingClientRect().top;
        controlPanel.style.cursor = 'grabbing';
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      controlPanel.style.left = `${x}px`;
      controlPanel.style.top = `${y}px`;
      controlPanel.style.right = 'auto'; // Remove right positioning when dragging
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        controlPanel.style.cursor = 'grab';
      }
    });

    // Add event listeners for the buttons
    telegramButton.addEventListener('click', () => {
      const telegramLink = typeof window.generateTelegramLink === 'function'
        ? window.generateTelegramLink('Lee2912bot')
        : 'https://t.me/Lee2912bot';
      window.open(telegramLink, '_blank');
    });

    callButton.addEventListener('click', () => {
      this.speak("Initiating voice call feature. This feature is coming soon.");
    });

    mouseAnimButton.addEventListener('click', () => {
      this.speak("Toggling mouse animation feature. This feature is coming soon.");
    });

    // Add control panel to document
    document.body.appendChild(controlPanel);
  }

  /**
   * Initialize speech recognition
   */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.addMessage('System', 'Speech recognition is not supported in this browser.');
      if (this.micButton) {
        this.micButton.disabled = true;
        this.micButton.classList.add('opacity-50');
      }
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.micButton) {
        this.micButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
          </svg>
        `;
      }
      // No message about listening
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.micButton) {
        this.micButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        `;
      }
    };

    this.recognition.onerror = (event) => {
      this.addMessage('System', `Error: ${event.error}`);
      this.isListening = false;
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.addMessage('You', transcript);
      this.handleCommand(transcript);
    };
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Toggle button
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', this.toggle);
    }

    // Mic button
    if (this.micButton) {
      this.micButton.addEventListener('click', () => {
        if (this.isListening) {
          this.stopListening();
        } else {
          this.listen();
        }
      });
    }

    // Text input
    const textInput = document.getElementById('lee-input');
    if (textInput) {
      textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = textInput.value.trim();
          if (text) {
            this.addMessage('You', text);
            this.handleCommand(text);
            textInput.value = '';
          }
        }
      });
    }

    // Add drag functionality
    this.addDragFunctionality();
  }

  /**
   * Toggle Agent Lee visibility
   */
  toggle() {
    const body = document.getElementById('lee-body');
    if (body) {
      body.classList.toggle('hidden');
      this.visible = !body.classList.contains('hidden');
    }
  }

  /**
   * Speak text using the current agent's voice
   * @param {string} text - The text to speak
   */
  speak(text) {
    // Stop all other audio
    this.stopAllAudio();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Get agent voice preference
    const agent = this.agents[this.currentAgent];
    const voiceName = agent ? agent.voice : 'Emma';

    // Set voice
    const voices = this.synth.getVoices();
    utterance.voice = voices.find(v => v.name.includes(voiceName)) || voices[0];

    // Set other properties
    utterance.rate = 1;
    utterance.pitch = 1;

    // Speak
    this.synth.speak(utterance);

    // Add message to chat log
    this.addMessage(agent.name, text);
  }

  /**
   * Start listening for voice commands
   */
  listen() {
    if (!this.recognition) {
      this.addMessage('System', 'Speech recognition is not available.');
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      this.addMessage('System', `Could not start listening: ${e.message}`);
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Load dependencies
   */
  loadDependencies() {
    // Load Gemini integration
    this.loadScript('agent-lee-gemini.js', () => {
      this.dependencies.gemini = true;
      console.log('Gemini integration loaded');
    });

    // Load other dependencies if not already loaded
    if (!window.AgentLeeMemory) {
      this.loadScript('agent-lee-memory.js', () => {
        this.dependencies.memory = true;
        console.log('Memory management loaded');
      });
    }

    if (!window.AgentLeeTraining) {
      this.loadScript('agent-lee-training.js', () => {
        this.dependencies.training = true;
        console.log('Training system loaded');
      });
    }

    // Load settings UI
    this.loadScript('agent-lee-settings.js', () => {
      console.log('Settings UI loaded');
    });
  }

  /**
   * Load a script dynamically
   * @param {string} src - Script source
   * @param {Function} callback - Callback function
   */
  loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    script.onerror = (error) => {
      console.error(`Failed to load ${src}:`, error);
    };
    document.head.appendChild(script);
  }

  /**
   * Handle user command
   * @param {string} command - The user command
   */
  async handleCommand(command) {
    // This will be enhanced by the Gemini integration
    // Convert to lowercase for easier matching
    const lowerCommand = command.toLowerCase();

    // Simple command handling
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      if (this.user.isLoggedIn && this.user.name) {
        this.speak('Hello ' + this.user.name + '! How can I help you today?');
      } else {
        this.speak('Hello! How can I help you today?');
      }
    }
    else if (lowerCommand.includes('who are you')) {
      this.speak(`I am ${this.agents[this.currentAgent].name}, your AI assistant. I can help you navigate this website and answer your questions.`);
    }
    // Login-related commands
    else if (lowerCommand.includes('login') || lowerCommand.includes('sign in')) {
      if (this.user.isLoggedIn) {
        this.speak('You are already logged in as ' + this.user.name + '.');
      } else {
        this.speak('Opening the login form for you.');
        if (typeof showLoginModal === 'function') {
          showLoginModal();
        }
      }
    }
    else if (lowerCommand.includes('logout') || lowerCommand.includes('sign out')) {
      if (this.user.isLoggedIn) {
        this.speak('Logging you out now.');
        if (window.UserLogin) {
          window.UserLogin.logout();
          // Update our user info
          setTimeout(() => this.loadUserInfo(), 500);
        }
      } else {
        this.speak('You are not currently logged in.');
      }
    }
    else if (lowerCommand.includes('my name') || lowerCommand.includes('who am i')) {
      if (this.user.isLoggedIn && this.user.name) {
        this.speak('Your name is ' + this.user.name + '. I remember you!');
      } else {
        this.speak('I don\'t know your name yet. Please log in so I can remember you.');
      }
    }
    // Navigation commands
    else if (lowerCommand.includes('scroll') || lowerCommand.includes('go to')) {
      // Handle navigation commands
      if (lowerCommand.includes('top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.speak('Scrolling to the top of the page.');
      }
      else if (lowerCommand.includes('bottom')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        this.speak('Scrolling to the bottom of the page.');
      }
      else if (lowerCommand.includes('about')) {
        this.scrollToSection('about');
      }
      else if (lowerCommand.includes('portfolio')) {
        this.scrollToSection('portfolio');
      }
      else if (lowerCommand.includes('pricing')) {
        this.scrollToSection('pricing');
      }
      else if (lowerCommand.includes('contact')) {
        this.scrollToSection('contact');
      }
      else {
        this.speak('I\'m not sure where to scroll to. You can ask me to scroll to specific sections like "about" or "pricing".');
      }
    }
    else if (lowerCommand.includes('thank')) {
      this.speak('You\'re welcome! Is there anything else I can help with?');
    }
    else {
      // Add the command as a memory for learning
      this.addMemory(command);

      // Default response
      this.speak('I\'m still learning how to respond to that. Is there something specific about the website you\'d like to know?');
    }
  }

  /**
   * Scroll to a specific section
   * @param {string} sectionId - The ID of the section to scroll to
   */
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      this.speak(`Scrolling to the ${sectionId} section.`);

      // Detect section change after scrolling
      setTimeout(this.detectCurrentSection, 1000);
    } else {
      this.speak(`I couldn't find the ${sectionId} section.`);
    }
  }

  /**
   * Detect the current section and switch agent if needed
   */
  detectCurrentSection() {
    // Get all sections
    const sections = document.querySelectorAll('section[id], div[id]');

    // Find the section that's most visible in the viewport
    let mostVisibleSection = null;
    let maxVisibility = 0;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the section is visible
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const visibility = visibleHeight > 0 ? visibleHeight / section.offsetHeight : 0;

      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisibleSection = section;
      }
    });

    // If we found a visible section, check if we need to switch agents
    if (mostVisibleSection && mostVisibleSection.id) {
      const sectionId = mostVisibleSection.id.toLowerCase();

      // Find the appropriate agent for this section
      let agentForSection = 'lee'; // Default

      Object.keys(this.agents).forEach(agentKey => {
        const agent = this.agents[agentKey];
        if (agent.sections.some(section => sectionId.includes(section))) {
          agentForSection = agentKey;
        }
      });

      // Switch agent if needed
      if (agentForSection !== this.currentAgent) {
        this.switchAgent(agentForSection, true);
      }
    }
  }

  /**
   * Switch to a different agent
   * @param {string} agentKey - The key of the agent to switch to
   * @param {boolean} silent - Whether to announce the switch
   */
  switchAgent(agentKey, silent = false) {
    if (!this.agents[agentKey] || agentKey === this.currentAgent) return;

    // Update current agent
    this.currentAgent = agentKey;

    // Update UI
    if (this.agentAvatar) {
      this.agentAvatar.src = this.agents[agentKey].avatar;
      this.agentAvatar.alt = this.agents[agentKey].name;
    }

    if (this.agentName) {
      this.agentName.textContent = this.agents[agentKey].name;
    }

    // Announce the switch if not silent
    if (!silent) {
      this.speak(`I'm now ${this.agents[agentKey].name}. How can I help you?`);
    }
  }

  /**
   * Add a message to the chat log
   * @param {string} sender - The sender of the message
   * @param {string} text - The message text
   */
  addMessage(sender, text) {
    if (!this.chatLog) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'p-2 rounded';

    if (sender === 'You') {
      messageElement.className += ' bg-blue-800/50 ml-4';
    } else if (sender === 'System') {
      messageElement.className += ' bg-gray-800/50 text-gray-300 text-sm italic';
    } else {
      messageElement.className += ' bg-indigo-800/50';
    }

    messageElement.innerHTML = `
      <p class="text-xs text-blue-300 font-bold">${sender}</p>
      <p class="text-white">${text}</p>
    `;

    this.chatLog.appendChild(messageElement);
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  /**
   * Add a memory to learn from user interactions
   * @param {string} text - The text to remember
   */
  addMemory(text) {
    // Don't add empty memories
    if (!text.trim()) return;

    // Add to memories array
    this.memories.push({
      text,
      timestamp: new Date().toISOString()
    });

    // Save to localStorage
    this.saveMemories();

    // Log for debugging
    console.log('Memory added:', text);
  }

  /**
   * Save memories to localStorage
   */
  saveMemories() {
    try {
      localStorage.setItem('agent-lee-memories', JSON.stringify(this.memories));
    } catch (e) {
      console.error('Failed to save memories:', e);
    }
  }

  /**
   * Load memories from localStorage
   */
  loadMemories() {
    try {
      const savedMemories = localStorage.getItem('agent-lee-memories');
      if (savedMemories) {
        this.memories = JSON.parse(savedMemories);
      }
    } catch (e) {
      console.error('Failed to load memories:', e);
    }
  }

  /**
   * Stop all audio except Agent Lee
   */
  stopAllAudio() {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio !== this.introAudio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  /**
   * Make the Agent Lee UI draggable
   */
  addDragFunctionality() {
    const container = this.container;
    const header = document.getElementById('agent-lee-header');
    
    if (!container || !header) return;
    
    let isDragging = false;
    let offsetX, offsetY;
    
    // Mouse down event on the header starts the drag
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      
      // Calculate the offset from the mouse position to the container's top-left corner
      const rect = container.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      // Change cursor during drag
      container.style.cursor = 'grabbing';
      
      // Prevent text selection during drag
      e.preventDefault();
    });
    
    // Mouse move event updates the position
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      // Calculate new position
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      
      // Apply new position
      container.style.right = 'auto';
      container.style.bottom = 'auto';
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
    });
    
    // Mouse up event ends the drag
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'move';
      }
    });
    
    // Mouse leave event also ends the drag
    document.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'move';
      }
    });
  }
}

// Create and initialize Agent Lee
const agentLee = new AgentLee();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  agentLee.init();
});

// Override default audio behavior
const originalPlay = HTMLAudioElement.prototype.play;
HTMLAudioElement.prototype.play = function() {
  if (!this.src.includes('agent-lee-intro.mp3')) {
    return Promise.reject('Unauthorized audio');
  }
  return originalPlay.call(this);
};

// Export for global access
window.AgentLee = agentLee;











