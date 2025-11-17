## Getting Started

1. **Open the Simulation**: Launch the Non-Deterministic Turing Machine vlization in your web browser
2. **Choose Your Mode**: Select between **Hard Mode** (manual control with dropdowns) or **Easy Mode** (interactive button selection)
3. **Review the Interface**: The simulation displays parallel paths (Accepting and Rejecting), NDTM description, shared input string, and dual execution traces

## Understanding the Interface

### Dual-Path Visualization
- **Left Panel**: "Accepting Path" - shows the computation path that leads to acceptance
- **Right Panel**: "Rejecting Path" - displays alternative paths that lead to rejection
- **Center Area**: Shared NDTM description, input string, and transition table
- **Side Panels**: Step-by-step execution traces for both paths

### Mode Selection
- **Hard Mode**: Manual selection using dropdown menus for next state, write symbol, and move direction
- **Easy Mode**: Interactive transition table with clickable buttons for available moves

### Main Controls
- **Change NDTM**: Switch between different non-deterministic Turing machine configurations
- **Change Input**: Select from predefined input strings to test both accepting and rejecting scenarios
- **Previous Step**: Go back to the previous configuration in the current execution path
- **Apply Best Move**: Automatically select the optimal next transition for the current path

## Step-by-Step Procedure

### Step 1: Select NDTM and Input
1. Use **Change NDTM** to choose a machine (e.g., "Check if input is balanced")
2. Use **Change Input** to select a test string
3. Review the NDTM description and examine the transition table showing multiple possible transitions

### Step 2: Understanding Non-Determinism
1. **Observe Multiple Choices**: Notice how some state-symbol combinations have multiple possible transitions
2. **Parallel Execution**: Watch both accepting and rejecting paths develop simultaneously
3. **Branch Points**: Identify where the computation paths diverge due to different transition choices

### Step 3: Hard Mode Operation
1. **Manual Selection**: Use dropdown menus to choose:
   - **Next State**: Select from available destination states
   - **Write Symbol**: Choose what symbol to write on the tape
   - **Move Direction**: Pick Left (L), Right (R), or Stay (S)
2. **Apply Move**: Click "Apply Move" to execute the selected transition
3. **Path Switching**: The interface alternates between controlling accepting and rejecting paths

### Step 4: Easy Mode Operation
1. **Interactive Transitions**: Click directly on transition buttons in the table
2. **Visual Guidance**: Available transitions are highlighted and clickable
3. **Immediate Feedback**: Selected transitions are applied instantly to the current path

### Step 5: Exploring Both Paths
1. **Accepting Path Analysis**: 
   - Observe how the machine reaches a HALT state through correct non-deterministic choices
   - Note the final tape configuration for accepted strings
2. **Rejecting Path Analysis**:
   - See how alternative choices lead to rejection or infinite loops
   - Understand why certain paths fail to reach acceptance

### Step 6: Transition Table Navigation
- **Multiple Options**: Each cell may contain several transitions separated by commas
- **Format**: Transitions shown as "(state,symbol,direction)" or "e" for epsilon/empty
- **Interactive Elements**: In Easy Mode, transitions become clickable buttons

## Interactive Features

### Parallel Visualization
- **Synchronized Input**: Both paths process the same input string
- **Independent States**: Each path maintains its own state, tape head position, and tape content
- **Visual Indicators**: Current active path is highlighted to show which execution you're controlling

### Step Traces
- **Left Trace**: Complete history of accepting path configurations [tape, position, state]
- **Right Trace**: Complete history of rejecting path configurations
- **Navigation**: Click on previous steps to review earlier configurations

### Non-Deterministic Choice Points
- **Branch Visualization**: Clear indication when multiple transitions are possible
- **Choice Consequences**: See immediate results of different non-deterministic selections
- **Path Comparison**: Compare how different choices affect the computation outcome

## Understanding NDTM Behavior

- **Non-Deterministic Choices**: Multiple valid transitions from the same state with the same input symbol
- **Acceptance Condition**: String is accepted if ANY computation path reaches an accepting state
- **Rejection Analysis**: All paths must fail for the string to be rejected
- **Parallel Exploration**: Visualize how NDTMs explore multiple computational possibilities simultaneously
- **Computational Power**: Understand how non-determinism provides additional computational capabilities compared to DTMs

- **Equivalence of Statements**: The statement "problems solvable by NDTMs in polynomial time" is essentially equivalent to "problems verifiable by DTM’s in polynomial time".
    - Why? If an NDTM can solve a problem in polynomial time, it means there is a polynomial sized computation path where the NDTM guesses the correct solution. This directly implies that if we were to provide this guessed solution to a deterministic Turing Machine, it could verify the correctness of this solution in polynomial time, placing the problem in NP.
- **Fundamental Nature of NP**: The class NP is defined based on this verification capability. The fact that an NDTM can solve a problem in polynomial time is essentially the same as saying that a solution to the problem can be verified in polynomial time because the NDTM's ability to 'solve' the problem hinges on its capability to non-deterministically *always* 'traverse' the right solution path.