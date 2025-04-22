# Agent Lee Training System

The Agent Lee Training System is a comprehensive solution for enabling one-shot learning and autonomous training capabilities for Agent Lee, the AI assistant in the Rapid Web Development platform.

## Features

### 1. Knowledge Base System
- Structured knowledge storage with categorization
- Persistent storage using IndexedDB
- Knowledge retrieval with confidence scoring

### 2. One-Shot Learning
- Learn from single examples provided by users
- Pattern recognition for identifying teachable moments
- Correction handling for improving responses

### 3. Autonomous Training
- Learn from site content automatically
- Process user interactions for continuous improvement
- Monitor DOM changes to adapt to new content

### 4. Memory Management
- Short-term and long-term memory systems
- Memory consolidation and relevance scoring
- Retrieval of relevant memories for better responses

### 5. Training UI
- Visual training panel for explicit teaching
- Training statistics and analytics
- Learning progress visualization

## Components

The system consists of the following components:

1. **agent-lee-training.js** - Core knowledge base and training functionality
2. **agent-lee-integration.js** - Integration with existing Agent Lee implementation
3. **agent-lee-oneshot.js** - One-shot learning capabilities
4. **agent-lee-memory.js** - Memory management system
5. **agent-lee-autonomous.js** - Autonomous training capabilities
6. **agent-lee-training-system.js** - Main entry point and UI components

## Usage

### User Commands

Users can interact with the training system using the following commands:

- **"Remember that [fact]"** - Store a fact in Agent Lee's knowledge base
- **"When I say [input], you should say [response]"** - Teach a specific response
- **"No, that's incorrect"** - Correct Agent Lee's last response
- **"Learn [topic]"** - Request Agent Lee to learn about a specific topic

### Keyboard Shortcuts

- **Ctrl+Alt+T** - Toggle training panel
- **Ctrl+Alt+S** - Toggle training status display

### Training Panel

The training panel allows you to:

1. Explicitly teach Agent Lee new responses
2. View training statistics
3. Enable/disable autonomous training
4. Reset training data (for testing)

## Implementation Details

### Knowledge Storage

Knowledge is stored in IndexedDB with the following structure:

- **knowledge** - Stores question-answer pairs with categories
- **memories** - Stores interaction memories with relevance scores
- **userPreferences** - Stores user-specific preferences
- **trainingStats** - Stores training statistics and analytics

### Learning Process

1. User input is analyzed for teachable moments
2. Patterns are extracted from the input
3. Responses are stored with confidence scores
4. Memory relevance is updated based on usage and success
5. Periodic consolidation promotes important memories to long-term storage

### Autonomous Training

The system automatically learns from:

1. **Site Content** - Headings, paragraphs, lists, and other content elements
2. **User Interactions** - Questions, corrections, and explicit teachings
3. **DOM Changes** - New content added to the page dynamically

## Extending the System

You can extend the system by:

1. Adding new data sources to `AgentLeeAutonomous.dataSources`
2. Creating new teachable moment patterns in `AgentLeeOneShot.teachablePatterns`
3. Implementing custom memory retrieval strategies in `AgentLeeMemory`

## Troubleshooting

If the training system is not working as expected:

1. Check the browser console for error messages
2. Verify that IndexedDB is available and not blocked
3. Try resetting the training data using the training panel
4. Ensure all script files are properly loaded

## Future Improvements

Planned improvements for the training system:

1. Integration with external knowledge sources
2. Enhanced natural language understanding for better pattern extraction
3. Improved memory consolidation algorithms
4. User-specific knowledge adaptation
5. Export/import functionality for knowledge transfer
