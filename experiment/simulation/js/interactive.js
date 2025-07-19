/**
 * Interactive Manual Tracing for NDTM Simulation
 * Extension for manual interaction with the NDTM
 */

// States for interactive mode - now supporting parallel paths
let expectedStateLeft = "";
let expectedWriteLeft = "";
let expectedMoveLeft = "";
let expectedStateRight = "";
let expectedWriteRight = "";
let expectedMoveRight = "";
let attemptCount = 0;
let showingHint = false;
let interactiveModeEnabled = true;

/**
 * Applies the best move automatically for the current path
 */
function applyBestMove() {
  if (currentTurn === "left") {
    const currPath = "states";
    
    if (leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      return;
    }
    
    // Apply the next step automatically for left path
    leftStateIndex++;
    leftInputPointer = leftStateIndex;
    refreshInput();
    refreshCanvas();
    
    // Add step to the trace
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex - 1];
    const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex];
    
    let str = `✓ Auto Move: State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, "left");
    
    // Check if we've reached the end of left path
    if (leftStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Accepting Path Complete!",
        text: "The accepting path has reached its final state.",
        icon: "success",
        button: "OK",
      });
    }
  } else {
    const currPath = "reject_path";
    
    if (rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      return;
    }
    
    // Apply the next step automatically for right path
    rightStateIndex++;
    rightInputPointer = rightStateIndex;
    refreshInput();
    refreshCanvas();
    
    // Add step to the trace
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex - 1];
    const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex];
    
    let str = `✓ Auto Move: State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, "right");
    
    // Check if we've reached the end of right path
    if (rightStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Rejecting Path Complete!",
        text: "The rejecting path has reached its final state.",
        icon: "error",
        button: "OK",
      });
    }
  }
  
  // Switch turn after making a move
  currentTurn = currentTurn === "left" ? "right" : "left";
  updateTurnIndicator();
  
  // Update choices for the next step
  updateInteractiveChoices();
}

/**
 * Updates the available choices for the user based on current tape symbol
 */
function updateInteractiveChoices() {
  if (currentTurn === "left") {
    const currPath = "states";
    
    if (leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      return;
    }
    
    // Get current state information
    const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex];
    const currentStateId = currentState[2]; // e.g., "q0"
    const currentSymbol = currentState[0][currentState[1]]; // Current symbol under the head
    
    // Get next state information to determine expected values
    const nextState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex + 1];
    expectedStateLeft = nextState[2];
    expectedWriteLeft = nextState[0][currentState[1]];
    
    // Determine expected direction
    if (currentState[1] > nextState[1]) {
      expectedMoveLeft = "L";
    } else if (currentState[1] < nextState[1]) {
      expectedMoveLeft = "R";
    } else {
      expectedMoveLeft = "S";
    }
  } else {
    const currPath = "reject_path";
    
    if (rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      return;
    }
    
    // Get current state information
    const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex];
    const currentStateId = currentState[2]; // e.g., "q0"
    const currentSymbol = currentState[0][currentState[1]]; // Current symbol under the head
    
    // Get next state information to determine expected values
    const nextState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex + 1];
    expectedStateRight = nextState[2];
    expectedWriteRight = nextState[0][currentState[1]];
    
    // Determine expected direction
    if (currentState[1] > nextState[1]) {
      expectedMoveRight = "L";
    } else if (currentState[1] < nextState[1]) {
      expectedMoveRight = "R";
    } else {
      expectedMoveRight = "S";
    }
  }
  if (currentState[1] < nextState[1]) {
    expectedMove = "R";
  } else if (currentState[1] > nextState[1]) {
    expectedMove = "L";
  } else {
    expectedMove = "S"; // Stay in place
  }
  
  // Reset DOM elements
  const interactiveControls = document.getElementById("interactive_controls");
  if (!interactiveControls) {
    createInteractiveControls();
    return; // The function will be called again after controls are created
  }
  
  // Get and clear existing options
  const stateSelect = document.getElementById("state_select");
  const writeSelect = document.getElementById("write_select");
  const moveSelect = document.getElementById("move_select");
  const hintButton = document.getElementById("show_hint");
  const bestMoveButton = document.getElementById("best_move");
  
  if (!stateSelect || !writeSelect || !moveSelect) {
    return;
  }
  
  stateSelect.innerHTML = "";
  writeSelect.innerHTML = "";
  moveSelect.innerHTML = "";
  
  // Add a blank default option first
  const defaultStateOption = document.createElement("option");
  defaultStateOption.value = "";
  defaultStateOption.textContent = "-- Select Next State --";
  stateSelect.appendChild(defaultStateOption);
  
  const defaultWriteOption = document.createElement("option");
  defaultWriteOption.value = "";
  defaultWriteOption.textContent = "-- Select Symbol to Write --";
  writeSelect.appendChild(defaultWriteOption);
  
  const defaultMoveOption = document.createElement("option");
  defaultMoveOption.value = "";
  defaultMoveOption.textContent = "-- Select Move Direction --";
  moveSelect.appendChild(defaultMoveOption);
  
  // Show current state and symbol information
  const currentInfoDiv = document.getElementById("current_state_info");
  if (currentInfoDiv) {
    currentInfoDiv.innerHTML = `
      <div><strong>Current State:</strong> ${currentStateId}</div>
      <div><strong>Reading Symbol:</strong> "${currentSymbol}"</div>
      <div class="ndtm-note">Note: NDTM may have multiple possible moves</div>
    `;
  }
  
  // Add all possible states
  const allStates = Object.keys(ndtm[ndtmIndex]["transition"]);
  allStates.forEach(state => {
    const stateOption = document.createElement("option");
    stateOption.value = state;
    stateOption.textContent = state;
    stateSelect.appendChild(stateOption);
  });
  
  // Add all possible symbols
  const alphabet = ["0", "1", "X", "Y", "S"];
  alphabet.forEach(symbol => {
    const writeOption = document.createElement("option");
    writeOption.value = symbol;
    writeOption.textContent = symbol;
    writeSelect.appendChild(writeOption);
  });
  
  // Add all possible directions
  const directions = [
    { value: "R", text: "Right" },
    { value: "L", text: "Left" },
    { value: "S", text: "Stay" }
  ];
  
  directions.forEach(dir => {
    const moveOption = document.createElement("option");
    moveOption.value = dir.value;
    moveOption.textContent = dir.text;
    moveSelect.appendChild(moveOption);
  });
  
  // Reset attempt count when updating choices
  attemptCount = 0;
  showingHint = false;
  
  // Enable all controls
  document.getElementById("apply_move").disabled = false;
  if (hintButton) hintButton.disabled = false;
  if (bestMoveButton) bestMoveButton.disabled = false;
}

/**
 * Applies the user-selected move in interactive mode
 */
function applyInteractiveMove() {
  const currPath = path_state === "rej" ? "reject_path" : "states";
  
  if (stateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
    return;
  }
  
  const selectedState = document.getElementById("state_select").value;
  const selectedWrite = document.getElementById("write_select").value;
  const selectedMove = document.getElementById("move_select").value;
  
  // Validate that all selections have been made
  if (!selectedState || !selectedWrite || !selectedMove) {
    swal({
      title: "Incomplete Move",
      text: "Please select a next state, write symbol, and move direction to continue.",
      icon: "warning",
      button: {
        text: "OK",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    return;
  }
  
  // Get current state information
  const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];
  const currentStateId = currentState[2]; // e.g., "q0"
  const currentSymbol = currentState[0][currentState[1]]; // Current symbol under the head
  
  // Get next state information for the expected values
  const nextState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex + 1];
  
  // Check if the selection matches the expected next step
  const isCorrect = (
    selectedState === expectedState &&
    selectedWrite === expectedWrite &&
    selectedMove === expectedMove
  );
  
  // Increment attempt count
  attemptCount++;
  
  if (isCorrect) {
    // If correct, proceed to the next step
    stateIndex++;
    inputPointer = stateIndex;
    refreshInput();
    refreshCanvas();
    
    // Add step to the trace with a success indicator
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex - 1];
    const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];
    
    let str = `✓ Correct! State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, 'correct');
    
    // Show success message with different messages based on attempt count
    let successMsg = "Great job! That's the correct move.";
    if (attemptCount === 1) {
      successMsg += " You got it on the first try!";
    }
    
    swal({
      title: "Correct Move!",
      text: successMsg,
      icon: "success",
      button: {
        text: "Continue",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    
    // Check if we've reached the end
    if (stateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      // Final state reached - determine acceptance or rejection
      setTimeout(() => {
        if (path_state === "acc") {
          swal({
            title: "Path Accepts!",
            text: "Congratulations! You've successfully traced through the NDTM, and this path accepts the input string.",
            icon: "success",
            button: {
              text: "Continue",
              className: "swal-button--confirm"
            },
            className: "gradient-modal"
          });
        } else {
          swal({
            title: "Path Rejects",
            text: "You've successfully traced through the NDTM, but this path rejects the input string.",
            icon: "error",
            button: {
              text: "Continue",
              className: "swal-button--confirm"
            },
            className: "gradient-modal"
          });
        }
      }, 1000);
    } else {
      // Update choices for the next step
      updateInteractiveChoices();
    }
  } else {
    // If incorrect, show error message with guidance
    let errorMessage = "That's not the correct move. ";
    
    // Create a detailed explanation of what went wrong
    let incorrectItems = [];
    if (selectedState !== expectedState) {
      incorrectItems.push(`Next state should be ${expectedState}`);
    }
    if (selectedWrite !== expectedWrite) {
      incorrectItems.push(`Write symbol should be ${expectedWrite}`);
    }
    if (selectedMove !== expectedMove) {
      incorrectItems.push(`Move direction should be ${expectedMove === "R" ? "Right" : expectedMove === "L" ? "Left" : "Stay"}`);
    }
    
    // Add step to the trace with an error indicator
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];
    let str = `✗ Incorrect: State: ${prevState[2]} → ${selectedState}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${selectedWrite}", `;
    str += selectedMove === "R" ? "Move Right" : selectedMove === "L" ? "Move Left" : "Stay";
    
    addToStack(str, 'incorrect');
    
  // Check if the move is valid in NDTM but not the current path
  const possibleTransitions = ndtm[ndtmIndex]["transition"][currentStateId][currentSymbol] || [];
  let userTransition = `(${selectedState},${selectedWrite},${selectedMove})`;
  let isValidNDTMMove = false;
  
  for (let i = 0; i < possibleTransitions.length; i++) {
    const transition = possibleTransitions[i].trim();
    if (transition.includes(userTransition)) {
      isValidNDTMMove = true;
      break;
    }
  }
  
  // If it's a valid NDTM move but not in current path, show special message
  if (isValidNDTMMove && !isCorrect) {
    swal({
      title: "Valid Alternative Path",
      text: "Your move is a valid NDTM transition, but we're following a specific computation path. In a non-deterministic TM, multiple paths can be valid, but we need to follow this particular one for the demonstration.",
      icon: "info",
      button: {
        text: "Try Again",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    
    // Don't count this as an attempt since it's valid in NDTM context
    attemptCount--;
    return;
  }
  
  // On first attempt, don't show the correct answer
  if (attemptCount === 1) {
    errorMessage += "Try again!";
    
    swal({
      title: "Incorrect Move",
      text: errorMessage,
      icon: "warning",
      button: {
        text: "Try Again",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
  } 
  // On second attempt, give a hint
  else if (attemptCount === 2) {
    errorMessage += "Here's a hint: " + incorrectItems[0];
    
    swal({
      title: "Still Incorrect",
      text: errorMessage,
      icon: "warning",
      button: {
        text: "Try Once More",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    }
    // On third attempt, show the correct answer
    else {
      let correctAnswer = `The correct move is: <br><br>`;
      correctAnswer += `• Next State: ${expectedState}<br>`;
      correctAnswer += `• Write Symbol: ${expectedWrite}<br>`;
      correctAnswer += `• Move Direction: ${expectedMove === "R" ? "Right" : expectedMove === "L" ? "Left" : "Stay"}<br><br>`;
      correctAnswer += `Let's apply the correct move and continue.`;
      
      swal({
        title: "Learning Opportunity",
        content: {
          element: "div",
          attributes: {
            innerHTML: correctAnswer
          }
        },
        icon: "info",
        button: {
          text: "Apply Correct Move",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      }).then(() => {
        // Automatically advance with the correct move
        stateIndex++;
        inputPointer = stateIndex;
        refreshInput();
        refreshCanvas();
        
        // Add the correct step to the trace
        const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex - 1];
        const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];
        
        let str = `✓ Correction: State: ${prevState[2]} → ${currState[2]}, `;
        str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
        
        if (prevState[1] > currState[1]) {
          str += "Move Left";
        } else if (prevState[1] < currState[1]) {
          str += "Move Right";
        } else {
          str += "Stay";
        }
        
        addToStack(str, 'auto-correction');
        
        // Reset attempt count
        attemptCount = 0;
        
        // Update for the next step
        if (stateIndex < ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
          updateInteractiveChoices();
        }
      });
    }
  }
}

/**
 * Creates interactive controls if they don't exist
 */
function createInteractiveControls() {
  // Check if controls already exist
  if (document.getElementById("interactive_controls")) {
    return;
  }
  
  // Create the interactive controls container
  const interactiveControls = document.createElement("div");
  interactiveControls.id = "interactive_controls";
  interactiveControls.className = "interactive-controls";
  interactiveControls.style.display = "block";
  
  // Add current state info section
  interactiveControls.innerHTML = `
    <h4>Manual NDTM Control</h4>
    
    <div id="current_state_info" class="current-state-info">
      <!-- Will be populated dynamically -->
    </div>
    
    <div class="control-row">
      <div class="control-group">
        <label for="state_select">Next State:</label>
        <select id="state_select"></select>
      </div>
      <div class="control-group">
        <label for="write_select">Write Symbol:</label>
        <select id="write_select"></select>
      </div>
      <div class="control-group">
        <label for="move_select">Move Direction:</label>
        <select id="move_select"></select>
      </div>
    </div>
    
    <div class="button-row">
      <button id="apply_move" class="button green">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        Apply Move
      </button>
      <button id="show_hint" class="button blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        Show Hint
      </button>
      <button id="best_move_inner" class="button purple">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Apply Best Move
      </button>
    </div>
  `;
  
  // Add the interactive controls after the transition table
  const transitionTableContainer = document.querySelector(".transition-table-container");
  transitionTableContainer.parentNode.insertBefore(interactiveControls, transitionTableContainer.nextSibling);
  
  // Add event listeners for the buttons
  document.getElementById("apply_move").addEventListener("click", applyInteractiveMove);
  document.getElementById("show_hint").addEventListener("click", showHint);
  document.getElementById("best_move_inner").addEventListener("click", applyBestMove);
  
  // Initialize the interactive controls
  updateInteractiveChoices();
}

/**
 * Shows a hint for the current step
 */
function showHint() {
  if (showingHint) return;
  
  showingHint = true;
  
  // Determine which hint to show based on attempt count
  let hintText = "";
  const currPath = path_state === "rej" ? "reject_path" : "states";
  
  if (attemptCount === 0) {
    // Basic hint on first click
    hintText = `Look at the current state and symbol, then check the transition table to find the correct move.`;
  } else {
    // More specific hint after attempts
    const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];
    const currentStateId = currentState[2];
    const currentSymbol = currentState[0][currentState[1]];
    
    hintText = `When in state ${currentStateId} reading symbol "${currentSymbol}", the NDTM should `;
    
    // Give progressively more detailed hints
    if (attemptCount === 1) {
      hintText += `move to state ${expectedState}.`;
    } else {
      hintText += `move to state ${expectedState}, write "${expectedWrite}", and move ${expectedMove === "R" ? "Right" : expectedMove === "L" ? "Left" : "Stay"}.`;
    }
  }
  
  swal({
    title: "Hint",
    content: {
      element: "div",
      attributes: {
        innerHTML: hintText
      }
    },
    icon: "info",
    button: {
      text: "Got It",
      className: "swal-button--confirm"
    },
    className: "gradient-modal"
  });
}

/**
 * Toggles between interactive and automatic mode
 */
function toggleInteractiveMode() {
  interactiveModeEnabled = !interactiveModeEnabled;
  
  const interactiveControls = document.getElementById("interactive_controls");
  const toggleButton = document.getElementById("toggle_mode");
  
  if (!interactiveControls || !toggleButton) return;
  
  if (interactiveModeEnabled) {
    interactiveControls.classList.remove("disabled");
    toggleButton.textContent = "Disable Interactive Mode";
    toggleButton.className = "button red";
    document.getElementById("next").disabled = true;
    updateInteractiveChoices();
  } else {
    interactiveControls.classList.add("disabled");
    toggleButton.textContent = "Enable Interactive Mode";
    toggleButton.className = "button green";
    document.getElementById("next").disabled = false;
  }
}

/**
 * Enhanced version of addToStack that adds styling based on message type
 */
function addToStack(str, type = 'normal') {
  const stack = document.getElementById("stack_list");
  const listElem = document.createElement("li");
  
  // Add class based on message type
  if (type === 'auto') {
    listElem.className = 'auto-move';
  } else if (type === 'correct') {
    listElem.className = 'correct-move';
  } else if (type === 'incorrect') {
    listElem.className = 'incorrect-move';
  } else if (type === 'auto-correction') {
    listElem.className = 'auto-correction';
  }
  
  const textNode = document.createTextNode(str);
  listElem.appendChild(textNode);
  stack.appendChild(listElem);
  
  // Auto-scroll to bottom of the steps list
  const traceContainer = document.querySelector(".trace-container");
  if (traceContainer) {
    traceContainer.scrollTop = traceContainer.scrollHeight;
  }
}

// Initialize interactive mode when the window loads
window.addEventListener("load", function() {
  // Create the interactive controls
  createInteractiveControls();
  
  // Disable the next button since we'll handle it with manual input
  const nextButton = document.getElementById("next");
  nextButton.disabled = true;
  nextButton.onclick = null; // Will be handled by interactive controls
  
  // Initialize with manual mode
  updateInteractiveChoices();
  
  // Add keyboard shortcuts for interactive mode
  document.addEventListener("keydown", function(event) {
    if (!event.repeat) {
      if (event.key === "Enter") {
        // Apply move with Enter
        document.getElementById("apply_move")?.click();
        event.preventDefault();
      } else if (event.key === "h" || event.key === "H") {
        // Show hint with H key
        document.getElementById("show_hint")?.click();
        event.preventDefault();
      } else if (event.key === "b" || event.key === "B") {
        // Apply best move with B key
        document.getElementById("best_move_inner")?.click();
        event.preventDefault();
      }
    }
  });
  
  // Show welcome message for first-time users
  setTimeout(() => {
    swal({
      title: "Welcome to Interactive NDTM Simulation!",
      text: "You control the NDTM simulation step by step. Choose the next state, write symbol, and move direction at each step. Don't worry about making mistakes - they're part of learning! If you get stuck, you can use the 'Show Hint' or 'Apply Best Move' buttons in the interactive controls section.",
      icon: "info",
      button: {
        text: "Let's Start!",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
  }, 500);
});
