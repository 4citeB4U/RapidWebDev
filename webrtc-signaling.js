/**
 * WebRTC Signaling Module
 * Provides WebRTC signaling functionality for audio/video calls
 */

// Configuration
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

// State variables
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let socket = null;
let isInitiator = false;
let isConnected = false;
let onCallStateChangeCallback = null;

// Call states
export const CallState = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

/**
 * Initialize the WebRTC signaling
 * @param {string} signalServerUrl - The signaling server URL
 * @param {Function} onCallStateChange - Callback for call state changes
 * @returns {Promise<void>} - Resolves when initialization is complete
 */
export function initSignaling(signalServerUrl, onCallStateChange = null) {
  return new Promise((resolve, reject) => {
    try {
      // Set callback
      onCallStateChangeCallback = onCallStateChange;
      
      // Create WebSocket connection
      socket = new WebSocket(signalServerUrl);
      
      // Set up WebSocket event handlers
      socket.onopen = () => {
        console.log('WebSocket connection established');
        updateCallState(CallState.IDLE);
        resolve();
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        updateCallState(CallState.DISCONNECTED);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateCallState(CallState.ERROR);
        reject(error);
      };
      
      socket.onmessage = handleSignalingMessage;
    } catch (error) {
      console.error('Failed to initialize signaling:', error);
      updateCallState(CallState.ERROR);
      reject(error);
    }
  });
}

/**
 * Handle signaling messages from the server
 * @param {MessageEvent} event - The message event
 */
function handleSignalingMessage(event) {
  try {
    const message = JSON.parse(event.data);
    console.log('Received signaling message:', message.type);
    
    switch (message.type) {
      case 'offer':
        handleOffer(message.offer);
        break;
      case 'answer':
        handleAnswer(message.answer);
        break;
      case 'ice':
        handleIceCandidate(message.candidate);
        break;
      case 'join':
        handleJoin(message.room, message.isInitiator);
        break;
      case 'leave':
        handleLeave();
        break;
      default:
        console.warn('Unknown signaling message type:', message.type);
    }
  } catch (error) {
    console.error('Failed to handle signaling message:', error);
  }
}

/**
 * Handle an offer from a peer
 * @param {RTCSessionDescriptionInit} offer - The offer
 */
async function handleOffer(offer) {
  try {
    if (!peerConnection) {
      createPeerConnection();
    }
    
    updateCallState(CallState.CONNECTING);
    
    // Set remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer to peer
    sendSignalingMessage({
      type: 'answer',
      answer: peerConnection.localDescription
    });
  } catch (error) {
    console.error('Failed to handle offer:', error);
    updateCallState(CallState.ERROR);
  }
}

/**
 * Handle an answer from a peer
 * @param {RTCSessionDescriptionInit} answer - The answer
 */
async function handleAnswer(answer) {
  try {
    if (!peerConnection) {
      console.warn('Received answer but no peer connection exists');
      return;
    }
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Failed to handle answer:', error);
    updateCallState(CallState.ERROR);
  }
}

/**
 * Handle an ICE candidate from a peer
 * @param {RTCIceCandidateInit} candidate - The ICE candidate
 */
async function handleIceCandidate(candidate) {
  try {
    if (!peerConnection) {
      console.warn('Received ICE candidate but no peer connection exists');
      return;
    }
    
    if (candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (error) {
    console.error('Failed to handle ICE candidate:', error);
  }
}

/**
 * Handle joining a room
 * @param {string} room - The room ID
 * @param {boolean} initiator - Whether this peer is the initiator
 */
function handleJoin(room, initiator) {
  console.log(`Joined room ${room} as ${initiator ? 'initiator' : 'participant'}`);
  isInitiator = initiator;
  
  if (isInitiator) {
    // If we're the initiator, we'll create the offer
    createPeerConnection();
  }
}

/**
 * Handle a peer leaving
 */
function handleLeave() {
  console.log('Peer left the call');
  closePeerConnection();
  updateCallState(CallState.DISCONNECTED);
}

/**
 * Create a new peer connection
 */
function createPeerConnection() {
  try {
    // Close any existing connection
    closePeerConnection();
    
    // Create a new connection
    peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    // Add event handlers
    peerConnection.onicecandidate = handleLocalIceCandidate;
    peerConnection.ontrack = handleRemoteTrack;
    peerConnection.oniceconnectionstatechange = handleIceConnectionStateChange;
    
    // Add local stream if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    console.log('Peer connection created');
  } catch (error) {
    console.error('Failed to create peer connection:', error);
    updateCallState(CallState.ERROR);
  }
}

/**
 * Handle local ICE candidates
 * @param {RTCPeerConnectionIceEvent} event - The ICE event
 */
function handleLocalIceCandidate(event) {
  if (event.candidate) {
    sendSignalingMessage({
      type: 'ice',
      candidate: event.candidate
    });
  }
}

/**
 * Handle remote tracks
 * @param {RTCTrackEvent} event - The track event
 */
function handleRemoteTrack(event) {
  if (event.streams && event.streams[0]) {
    remoteStream = event.streams[0];
    
    // Notify about the new remote stream
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('remoteStreamAvailable', {
        detail: { stream: remoteStream }
      }));
    }
    
    updateCallState(CallState.CONNECTED);
  }
}

/**
 * Handle ICE connection state changes
 */
function handleIceConnectionStateChange() {
  if (!peerConnection) return;
  
  console.log('ICE connection state:', peerConnection.iceConnectionState);
  
  switch (peerConnection.iceConnectionState) {
    case 'connected':
    case 'completed':
      isConnected = true;
      updateCallState(CallState.CONNECTED);
      break;
    case 'disconnected':
    case 'failed':
    case 'closed':
      isConnected = false;
      updateCallState(CallState.DISCONNECTED);
      break;
  }
}

/**
 * Close the peer connection
 */
function closePeerConnection() {
  if (peerConnection) {
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.oniceconnectionstatechange = null;
    peerConnection.close();
    peerConnection = null;
  }
  
  isConnected = false;
}

/**
 * Send a signaling message to the server
 * @param {Object} message - The message to send
 */
function sendSignalingMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn('Cannot send signaling message: WebSocket not open');
  }
}

/**
 * Update the call state and notify listeners
 * @param {string} state - The new call state
 */
function updateCallState(state) {
  if (onCallStateChangeCallback) {
    onCallStateChangeCallback(state);
  }
  
  // Dispatch event for other listeners
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('callStateChange', {
      detail: { state }
    }));
  }
}

/**
 * Initiate a call
 * @param {HTMLMediaElement} localVideoElement - The local video element
 * @param {HTMLMediaElement} remoteVideoElement - The remote video element
 * @param {boolean} videoEnabled - Whether video is enabled
 * @returns {Promise<void>} - Resolves when the call is initiated
 */
export async function initiateCall(localVideoElement, remoteVideoElement, videoEnabled = false) {
  try {
    updateCallState(CallState.CONNECTING);
    
    // Get local media stream
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoEnabled
    });
    
    // Display local stream
    if (localVideoElement) {
      localVideoElement.srcObject = localStream;
    }
    
    // Create peer connection if it doesn't exist
    if (!peerConnection) {
      createPeerConnection();
    }
    
    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    sendSignalingMessage({
      type: 'offer',
      offer: peerConnection.localDescription
    });
    
    // Set up remote video element
    if (remoteVideoElement) {
      remoteVideoElement.onloadedmetadata = () => {
        remoteVideoElement.play().catch(console.error);
      };
      
      // If we already have a remote stream, set it
      if (remoteStream) {
        remoteVideoElement.srcObject = remoteStream;
      }
    }
  } catch (error) {
    console.error('Failed to initiate call:', error);
    updateCallState(CallState.ERROR);
    throw error;
  }
}

/**
 * Answer an incoming call
 * @param {HTMLMediaElement} localVideoElement - The local video element
 * @param {HTMLMediaElement} remoteVideoElement - The remote video element
 * @param {boolean} videoEnabled - Whether video is enabled
 * @returns {Promise<void>} - Resolves when the call is answered
 */
export async function answerCall(localVideoElement, remoteVideoElement, videoEnabled = false) {
  try {
    // Get local media stream
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoEnabled
    });
    
    // Display local stream
    if (localVideoElement) {
      localVideoElement.srcObject = localStream;
    }
    
    // Add tracks to peer connection
    if (peerConnection) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    // Set up remote video element
    if (remoteVideoElement) {
      remoteVideoElement.onloadedmetadata = () => {
        remoteVideoElement.play().catch(console.error);
      };
      
      // If we already have a remote stream, set it
      if (remoteStream) {
        remoteVideoElement.srcObject = remoteStream;
      }
    }
  } catch (error) {
    console.error('Failed to answer call:', error);
    updateCallState(CallState.ERROR);
    throw error;
  }
}

/**
 * End the current call
 */
export function endCall() {
  // Stop local stream tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // Close peer connection
  closePeerConnection();
  
  // Send leave message
  sendSignalingMessage({
    type: 'leave'
  });
  
  updateCallState(CallState.IDLE);
}

/**
 * Join a call room
 * @param {string} roomId - The room ID to join
 */
export function joinRoom(roomId) {
  sendSignalingMessage({
    type: 'join',
    room: roomId
  });
}

/**
 * Mute or unmute the local audio
 * @param {boolean} muted - Whether to mute the audio
 */
export function muteAudio(muted) {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
  }
}

/**
 * Enable or disable the local video
 * @param {boolean} enabled - Whether to enable the video
 */
export function enableVideo(enabled) {
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
}

/**
 * Check if the call is connected
 * @returns {boolean} - Whether the call is connected
 */
export function isCallConnected() {
  return isConnected;
}

/**
 * Get the current call state
 * @returns {string} - The current call state
 */
export function getCallState() {
  if (!peerConnection) return CallState.IDLE;
  
  if (isConnected) return CallState.CONNECTED;
  
  if (peerConnection.iceConnectionState === 'checking' || 
      peerConnection.iceConnectionState === 'new') {
    return CallState.CONNECTING;
  }
  
  if (peerConnection.iceConnectionState === 'disconnected' || 
      peerConnection.iceConnectionState === 'failed' || 
      peerConnection.iceConnectionState === 'closed') {
    return CallState.DISCONNECTED;
  }
  
  return CallState.IDLE;
}
