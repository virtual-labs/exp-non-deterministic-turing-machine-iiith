/**
 * Mode Switcher - Handles switching between Easy and Hard modes for NDTM
 */

// Global mode state
let currentMode = 'hard'; // Start with hard mode (current functionality)

/**
 * Initialize mode switcher
 */
function initializeModeSwitch() {
  const easyTab = document.getElementById('easy_mode_tab');
  const hardTab = document.getElementById('hard_mode_tab');
  
  if (!easyTab || !hardTab) {
    console.error('Mode tabs not found');
    return;
  }
  
  // Add event listeners
  easyTab.addEventListener('click', () => {
    switchToMode('easy');
  });
  hardTab.addEventListener('click', () => {
    switchToMode('hard');
  });
  
  // Initialize with hard mode (current setup)
  switchToMode('hard');
}

/**
 * Switch to the specified mode
 */
function switchToMode(mode) {
  const easyTab = document.getElementById('easy_mode_tab');
  const hardTab = document.getElementById('hard_mode_tab');
  const experimentPanel = document.querySelector('.experiment-panel');
  const transitionTableContainer = document.querySelector('.transition-table-container');
  
  // Update current mode
  currentMode = mode;
  
  // Update tab styles
  if (mode === 'easy') {
    easyTab.classList.add('active');
    hardTab.classList.remove('active');
    experimentPanel.classList.add('easy-mode');
    experimentPanel.classList.remove('hard-mode');
  } else {
    hardTab.classList.add('active');
    easyTab.classList.remove('active');
    experimentPanel.classList.add('hard-mode');
    experimentPanel.classList.remove('easy-mode');
  }
  
  // Update transition table for easy mode
  if (mode === 'easy') {
    transitionTableContainer.classList.add('easy-mode');
    convertTransitionTableToButtons();
    updateClickableTransitions();
  } else {
    transitionTableContainer.classList.remove('easy-mode');
    restoreOriginalTransitionTable();
  }
}

/**
 * Convert transition table cells to buttons for easy mode
 */
function convertTransitionTableToButtons() {
  const table = document.getElementById('transition_table');
  if (!table) return;
  
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    if (rowIndex === 0) return; // Skip header row
    
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, cellIndex) => {
      if (cellIndex === 0) return; // Skip state column
      
      // Store original content
      if (!cell.dataset.originalContent) {
        cell.dataset.originalContent = cell.innerHTML;
      }
      
      // Clear cell and split original content into individual moves
      cell.innerHTML = '';
      const original = cell.dataset.originalContent.trim();
      
      // Split by comma, but handle "e," and "(q1,X,R)" patterns correctly
      const moves = [];
      if (original) {
        // Split by comma and process each part
        const parts = original.split(',').map(p => p.trim());
        let currentMove = '';
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          
          if (part === 'e') {
            // Handle standalone "e" 
            if (currentMove) {
              moves.push(currentMove);
              currentMove = '';
            }
            moves.push('e');
          } else if (part.startsWith('(') && !part.endsWith(')')) {
            // Start of a parenthesized move
            currentMove = part;
          } else if (!part.startsWith('(') && part.endsWith(')')) {
            // End of a parenthesized move
            currentMove += ',' + part;
            moves.push(currentMove);
            currentMove = '';
          } else if (currentMove) {
            // Middle part of a parenthesized move
            currentMove += ',' + part;
          } else {
            // Complete move in one part
            moves.push(part);
          }
        }
        
        // Add any remaining move
        if (currentMove) {
          moves.push(currentMove);
        }
      }
      
      moves.forEach(moveText => {
        if (moveText.trim()) {
          const button = document.createElement('button');
          button.innerHTML = moveText;
          button.disabled = true; // Initially disabled
          button.onclick = () => handleTransitionClick(button);
          cell.appendChild(button);
        }
      });
    });
  });
}

/**
 * Restore original transition table for hard mode
 */
function restoreOriginalTransitionTable() {
  const table = document.getElementById('transition_table');
  if (!table) return;
  
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    if (rowIndex === 0) return; // Skip header row
    
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, cellIndex) => {
      if (cellIndex === 0) return; // Skip state column
      
      if (cell.dataset.originalContent) {
        cell.innerHTML = cell.dataset.originalContent;
      }
    });
  });
}

/**
 * Update which transitions are clickable based on current state
 */
function updateClickableTransitions() {
  if (currentMode !== 'easy') return;
  
  const table = document.getElementById('transition_table');
  if (!table) return;
  
  // Get current states for both paths
  const leftState = getCurrentState('left');
  const rightState = getCurrentState('right');
  const currentTurn = window.currentTurn || 'left';
  const activeState = currentTurn === 'left' ? leftState : rightState;
  
  // Reset all buttons
  const buttons = table.querySelectorAll('button');
  buttons.forEach(button => {
    button.disabled = true;
    button.classList.remove('clickable', 'correct-choice');
  });
  
  if (!activeState) return;
  
  // Find the row for the current state
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    if (rowIndex === 0) return; // Skip header
    
    const stateCell = row.querySelector('td:first-child');
    if (stateCell && stateCell.textContent.trim() === activeState) {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, cellIndex) => {
        if (cellIndex === 0) return; // Skip state column
        // Enable all buttons in this cell
        const buttons = cell.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.innerHTML.trim() !== '') {
            button.disabled = false;
            button.classList.add('clickable');
          }
        });
      });
    }
  });
}

/**
 * Handle transition button click in easy mode
 */
function handleTransitionClick(button) {
  if (currentMode !== 'easy') return;
  
  // Get the transition details from the button text
  let transitionText = button.innerHTML.trim();
  
  // Handle "e" (empty) moves - these are invalid/non-existent transitions
  if (transitionText === 'e') {
    swal({ 
      title: "Invalid Move!", 
      text: "This represents an empty transition (no valid move exists).", 
      icon: "warning", 
      button: "Try Again" 
    });
    return;
  }
  
  // Remove surrounding parentheses if present
  transitionText = transitionText.startsWith('(') && transitionText.endsWith(')')
    ? transitionText.slice(1, -1)
    : transitionText;
  if (!transitionText) return;
  
  // Parse the transition: nextState, writeSymbol, direction
  const parts = transitionText.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    const nextState = parts[0];
    const writeSymbol = parts[1];
    const direction = parts[2];
    // Validate this is the correct move before applying
    if (isCorrectTransition(nextState, writeSymbol, direction)) {
      // Apply this transition
      applyEasyModeTransition(nextState, writeSymbol, direction, button);
    } else {
      swal({ title: "Incorrect Move!", text: "This is not the correct transition.", icon: "warning", button: "Try Again" });
    }
  }
}

/**
 * Check if a transition is correct for the current state
 */
function isCorrectTransition(nextState, writeSymbol, direction) {
  const currentTurn = window.currentTurn || 'left';
  
  if (currentTurn === 'left') {
    const currPath = "states";
    if (typeof leftStateIndex === 'undefined' || !window.ndtm || window.ndtmIndex === undefined || window.inputIndex === undefined) {
      return false;
    }
    
    if (leftStateIndex >= window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath].length - 1) {
      return false; // Path already complete
    }
    
    const currentState = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][leftStateIndex];
    const nextStateData = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][leftStateIndex + 1];
    const expectedState = nextStateData[2];
    const expectedWrite = nextStateData[0][currentState[1]];
    
    let expectedMove = "S";
    const currentPos = currentState[1];
    const nextPos = nextStateData[1];
    if (currentPos > nextPos) expectedMove = "L";
    else if (currentPos < nextPos) expectedMove = "R";
    
    return nextState === expectedState && writeSymbol === expectedWrite && direction === expectedMove;
  } else {
    const currPath = "reject_path";
    if (typeof rightStateIndex === 'undefined' || !window.ndtm || window.ndtmIndex === undefined || window.inputIndex === undefined) {
      return false;
    }
    
    if (rightStateIndex >= window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath].length - 1) {
      return false; // Path already complete
    }
    
    const currentState = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][rightStateIndex];
    const nextStateData = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][rightStateIndex + 1];
    const expectedState = nextStateData[2];
    const expectedWrite = nextStateData[0][currentState[1]];
    
    let expectedMove = "S";
    const currentPos = currentState[1];
    const nextPos = nextStateData[1];
    if (currentPos > nextPos) expectedMove = "L";
    else if (currentPos < nextPos) expectedMove = "R";
    
    return nextState === expectedState && writeSymbol === expectedWrite && direction === expectedMove;
  }
}

/**
 * Apply a transition in easy mode
 */
function applyEasyModeTransition(nextState, writeSymbol, direction, clickedButton) {
  // Mark the clicked button as chosen
  const button = clickedButton;
  if (button) {
    // Disable all buttons
    document.querySelectorAll('#transition_table button').forEach(btn => { btn.classList.remove('clickable'); btn.disabled = true; });
    // Highlight this button as the correct choice
    button.classList.add('correct-choice');
  }
  
  // Use existing manual move logic
  const currentTurn = window.currentTurn || 'left';
  
  // Set the values as if they were selected in dropdowns
  window.selectedState = nextState;
  window.selectedSymbol = writeSymbol;
  window.selectedDirection = direction;
  
  // Apply the move using existing logic
  if (typeof applyManualMove === 'function') {
    applyManualMove();
  } else {
    console.error('applyManualMove function not found');
  }
  
  // Update clickable transitions for next turn
  setTimeout(() => {
    updateClickableTransitions();
  }, 100);
}

/**
 * Get current state for a specific path
 */
function getCurrentState(path) {
  // Try to get from the global state indices
  if (path === 'left' && typeof leftStateIndex !== 'undefined' && window.ndtm && window.ndtmIndex !== undefined && window.inputIndex !== undefined) {
    const currPath = "states";
    if (leftStateIndex < window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath].length) {
      const currentStateData = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][leftStateIndex];
      return currentStateData[2]; // Current state
    }
  }
  
  if (path === 'right' && typeof rightStateIndex !== 'undefined' && window.ndtm && window.ndtmIndex !== undefined && window.inputIndex !== undefined) {
    const currPath = "reject_path";
    if (rightStateIndex < window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath].length) {
      const currentStateData = window.ndtm[window.ndtmIndex]["input"][window.inputIndex][currPath][rightStateIndex];
      return currentStateData[2]; // Current state
    }
  }
  
  // Fallback to initial state
  return window.ndtm?.[window.ndtmIndex]?.start_state || 'q0';
}

/**
 * Override the original transition table update to support easy mode
 */
function updateTransitionTableForEasyMode() {
  if (currentMode === 'easy') {
    updateClickableTransitions();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeModeSwitch();
});
