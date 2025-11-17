/****
 * File containing helper functions
 *
 */

/**
 * Creates a new SVG element with the specified attributes
 */
function newElementNS(tag, attr) {
  elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  attr.forEach(function(item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

/**
 * Creates a new HTML element with the specified attributes
 */
function newElement(tag, attr) {
  elem = document.createElement(tag);
  attr.forEach(function(item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

/**
 * Removes all child elements from the specified element
 */
function clearElem(elem) {
  while(elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

/**
 * Displays the NDTM tape and state visualization on the canvases
 * Canvas1 shows the tape cells, Canvas2 shows the current state
 */
function displayCanvas(canvas, canvas2, ndtm, inputIndex, stateIndex, path) {
  const fillDefault = "#ede9fe"; // Light violet background
  const fillActive = "#c4b5fd"; // Active cell violet
  const borderColor = "#8b5cf6"; // Violet border
  const strokeWidth = "2px";

  const pathSetting = path === "rej" ? "reject_path" : "states";
  const str = ndtm["input"][inputIndex][pathSetting][stateIndex][0];
  const activeCellIndex = ndtm["input"][inputIndex][pathSetting][stateIndex][1];
  const currentState = ndtm["input"][inputIndex][pathSetting][stateIndex][2];

  const startX = 10;
  const startY = 10;
  const cellWidth = 40; // Reduced from 60 to fit better
  const cellHeight = 40; // Reduced from 60 to fit better
  const textOffsetY = cellHeight / 2 + 5; // Adjust for text vertical alignment
  const fontSize = "16px"; // Reduced from 22px for smaller cells

  // Clear existing elements from the canvases
  clearElem(canvas);
  clearElem(canvas2);

  // Draw cells on canvas1
  for (let cellIndex = 0; cellIndex < str.length; ++cellIndex) {
    const isActive = cellIndex === activeCellIndex;

    // Create the rectangle for each cell
    const cell = newElementNS("rect", [
      ["id", "state_rect_" + cellIndex],
      ["x", startX + cellIndex * cellWidth],
      ["y", startY],
      ["width", cellWidth],
      ["height", cellHeight],
      ["rx", "8"], // Smoother corners
      ["stroke", borderColor],
      ["fill", isActive ? fillActive : fillDefault],
      ["stroke-width", strokeWidth],
    ]);
    canvas.appendChild(cell);

    // Create the text for each cell, centered within the rectangle
    const cellText = newElementNS("text", [
      ["id", "cell_text_" + cellIndex],
      ["x", startX + cellIndex * cellWidth + cellWidth / 2], // Center horizontally
      ["y", startY + textOffsetY], // Center vertically
      ["text-anchor", "middle"], // Align text horizontally
      ["dominant-baseline", "middle"], // Align text vertically
      ["fill", "#4c1d95"], // Dark violet text
      ["font-size", fontSize], // Increased font size
      ["font-family", "Inter, sans-serif"],
      ["font-weight", isActive ? "600" : "500"], // Bold for active cell
    ]);
    cellText.textContent = str[cellIndex];
    canvas.appendChild(cellText);
  }

  // Draw current state on canvas2
  const state = newElementNS("rect", [
    ["id", "state_rect"],
    ["x", "10"],
    ["y", "10"],
    ["width", cellWidth],
    ["height", cellHeight],
    ["rx", "8"], // Matching corner radius
    ["stroke", borderColor],
    ["fill", fillDefault],
    ["stroke-width", strokeWidth],
  ]);
  canvas2.appendChild(state);

  // Add text for the current state, centered within the rectangle
  const textElem = newElementNS("text", [
    ["id", "state_text"],
    ["x", 10 + cellWidth / 2], // Center horizontally
    ["y", 10 + textOffsetY], // Center vertically
    ["text-anchor", "middle"],
    ["dominant-baseline", "middle"],
    ["fill", "#4c1d95"], // Dark violet text
    ["font-size", fontSize], // Matching font size
    ["font-family", "Inter, sans-serif"],
    ["font-weight", "600"], // Bold state text
  ]);
  textElem.textContent = currentState;
  canvas2.appendChild(textElem);
}

/**
 * Displays the input string with proper highlighting for the current position
 */
function displayInput(container, ndtm, inputIndex, stateIndex, path) {
  const pathSetting = path === "rej" ? "reject_path" : "states";
  
  if (stateIndex >= 0 && stateIndex < ndtm["input"][inputIndex][pathSetting].length) {
    const currentState = ndtm["input"][inputIndex][pathSetting][stateIndex];
    const inputString = currentState[0]; // The tape contents
    const currentPosition = currentState[1]; // Current head position
    
    // Clear the container
    clearElem(container);
    
    // Create spans for each character
    for (let i = 0; i < inputString.length; i++) {
      const span = newElement("span", [
        ["id", `text_${path}_${i}`],
        ["class", i === currentPosition ? "input-char active" : "input-char"],
      ]);
      
      const text = document.createTextNode(inputString[i]);
      span.appendChild(text);
      container.appendChild(span);
    }
  }
}
