/****
 * File containing helper functions
 *
 */

function newElementNS(tag, attr){
 elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function newElement(tag, attr){
 elem = document.createElement(tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function clearElem(elem){
  while(elem.firstChild){
    elem.removeChild(elem.lastChild);
  }
}
// Global variables width, height and radius need to be set before invoking this function
function displayCanvas(canvas, canvas2, dtm, inputIndex, stateIndex, path) {
  const fillDefault = "#ffe4c4";
  const fillActive = "#adff2f";
  const color = "black";
  const strokeWidth = "3px";

  const pathSetting = path === "rej" ? "reject_path" : "states";
  const str = dtm["input"][inputIndex][pathSetting][stateIndex][0];
  const activeCellIndex = dtm["input"][inputIndex][pathSetting][stateIndex][1];
  const currentState = dtm["input"][inputIndex][pathSetting][stateIndex][2];

  const startX = 10;
  const startY = 10;
  const cellWidth = 60;
  const cellHeight = 60;
  const textOffsetY = cellHeight / 2 + 5; // Adjust for text vertical alignment
  const fontSize = "20px"; // Increased font size for better visibility

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
      ["rx", "10"],
      ["stroke", color],
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
      ["fill", "#000"],
      ["font-size", fontSize], // Increased font size
      ["font-family", "Arial, sans-serif"],
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
    ["rx", "10"],
    ["stroke", color],
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
    ["fill", "#000"],
    ["font-size", fontSize], // Increased font size
    ["font-family", "Arial, sans-serif"],
  ]);
  textElem.textContent = currentState;
  canvas2.appendChild(textElem);
}
