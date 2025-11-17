/**
 * Simplified Interactive Manual Tracing for NDTM Simulation
 * Focuses on parallel path functionality
 */

// Simplified interactive mode variables
let interactiveModeEnabled = true;

/**
 * Shows a hint for the current path
 */
function showHintForCurrentPath() {
  const pathName = currentTurn === "left" ? "Accepting Path" : "Rejecting Path";
  
  swal({
    title: "Hint",
    text: `It's time to make a move for the ${pathName}. Check the transition table for available options.`,
    icon: "info",
    button: "OK",
  });
}

/**
 * Applies the best move for the current path (from main.js)
 * This function is defined in main.js as applyBestMoveForCurrentPath()
 */
function applyBestMoveWrapper() {
  if (typeof applyBestMoveForCurrentPath === 'function') {
    applyBestMoveForCurrentPath();
  } else {
    // Fallback implementation
    swal({
      title: "Auto Move",
      text: `Auto move functionality is being prepared for the ${currentTurn === "left" ? "accepting" : "rejecting"} path.`,
      icon: "info",
      button: "OK",
    });
  }
}

/**
 * Initialize interactive features when the page loads
 */
document.addEventListener("DOMContentLoaded", function() {
  // Show hint button
  const showHintButton = document.getElementById("show_hint");
  if (showHintButton) {
    showHintButton.addEventListener("click", showHintForCurrentPath);
  }

  // Note: Apply best move button is handled in main.js to avoid duplicate event listeners
});
