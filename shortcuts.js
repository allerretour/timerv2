let keyActions = {}; // Initialize keyActions as an empty object

// Load the keyboard shortcuts from the external JSON file
fetch('shortcuts.json')
    .then(response => response.json())
    .then(data => {
        // Populate keyActions with the data from the JSON file
        keyActions = Object.fromEntries(
            Object.entries(data).map(([key, action]) => {
                return [key, () => window[action]()];
            })
        );

        // Add the keydown event listener once the keyActions are populated
        document.addEventListener("keydown", (event) => {
            if (keyActions[event.key] && !document.activeElement.matches('input, textarea')) {
                event.preventDefault();
                keyActions[event.key]();
            }
        });
    })
    .catch(error => {
        console.error("Failed to load shortcuts.json:", error);
    });

// Gamepad Setup
let gamepadIndex = null;
let gamepadButtonsPressed = new Set();
let gamepadMapping = {}; // Initialize gamepadMapping as empty

// Load the gamepad shortcuts from the external JSON file
fetch('gamepadShortcuts.json')
    .then(response => response.json())
    .then(data => {
        gamepadMapping = data; // Populate gamepadMapping with the data from the JSON file
        window.addEventListener("gamepadconnected", (event) => {
            gamepadIndex = event.gamepad.index;
            console.log("Gamepad connected:", event.gamepad.id);
            requestAnimationFrame(pollGamepad);
        });
    })
    .catch(error => {
        console.error("Failed to load gamepadShortcuts.json:", error);
    });

function pollGamepad() {
    if (gamepadIndex === null) return;
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;

    gamepad.buttons.forEach((button, index) => {
        if (button.pressed && !gamepadButtonsPressed.has(index)) {
            gamepadButtonsPressed.add(index);
            if (gamepadMapping[index]) {
                keyActions[gamepadMapping[index]]?.(); // Trigger the action for this button
            }
        } else if (!button.pressed) {
            gamepadButtonsPressed.delete(index);
        }
    });

    requestAnimationFrame(pollGamepad);
}
