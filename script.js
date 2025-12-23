/* -------------------------------------------------------------------------
   GLOBAL VARIABLES & SETUP
------------------------------------------------------------------------- */
const input = document.getElementById('cmdInput');
const output = document.getElementById('terminal-output');
const promptText = document.getElementById('prompt-text');

// Screen Elements for toggling
const terminalScreen = document.getElementById('terminal-interface');
const ircScreen = document.getElementById('irc-interface');
const chatOutput = document.getElementById('chat-output');

let state = 'SHELL'; // States: SHELL, LOGIN_USER, LOGIN_PASS, REGISTER_USER, REGISTER_PASS

/* -------------------------------------------------------------------------
   TERMINAL LOGIC (Typing & Commands)
------------------------------------------------------------------------- */

// Function to print text to the main terminal
function print(text, isError = false) {
    const div = document.createElement('div');
    div.textContent = text;
    if (isError) div.style.color = 'red';
    output.appendChild(div);
    output.scrollTop = output.scrollHeight; // Auto-scroll
}

// Listen for "Enter" key in the terminal input
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const cmd = input.value.trim();
        // If typing a password, show asterisks in history instead of the text
        const displayCmd = (state === 'LOGIN_PASS' || state === 'REGISTER_PASS') ? '******' : cmd;
        
        print(promptText.textContent + displayCmd); 
        processCommand(cmd);
        input.value = '';
    }
});

function processCommand(cmd) {
    // 1. NORMAL TERMINAL MODE
    if (state === 'SHELL') {
        switch (cmd.toLowerCase()) {
            case 'help':
                print("AVAILABLE COMMANDS:");
                print("  login     - Access existing account");
                print("  register  - Create new 0xShell identity");
                print("  clear     - Clear terminal screen");
                print("  about     - Visit the about page");
                break;
            
            case 'login':
                state = 'LOGIN_USER';
                promptText.textContent = "username: ";
                break;

            case 'register':
                state = 'REGISTER_USER';
                promptText.textContent = "new_user: ";
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            case 'about':
                print("Redirecting...");
                window.location.href = "https://0xshellaboutpage.netlify.app/";
                break;

            case '':
                break;

            default:
                print(`bash: ${cmd}: command not found`, true);
        }
    } 
    // 2. LOGIN SEQUENCE
    else if (state === 'LOGIN_USER') {
        state = 'LOGIN_PASS';
        promptText.textContent = "password: ";
        input.type = "password"; // Hide password
    } 
    else if (state === 'LOGIN_PASS') {
        print("Verifying hash...");
        setTimeout(() => {
            print("ACCESS GRANTED.");
            print("Welcome back, user.");
            
            // UNLOCK THE SIDEBAR HERE
            unlockSidebar();
            
            resetShell();
        }, 800);
    }
    // 3. REGISTER SEQUENCE
    else if (state === 'REGISTER_USER') {
        state = 'REGISTER_PASS';
        promptText.textContent = "new_pass: ";
        input.type = "password";
    }
    else if (state === 'REGISTER_PASS') {
        print("Allocating memory blocks...");
        setTimeout(() => {
            print("Identity created successfully.");
            resetShell();
        }, 800);
    }
}

function resetShell() {
    state = 'SHELL';
    promptText.textContent = "root@0xshell > ";
    input.type = "text";
    input.focus();
}

/* -------------------------------------------------------------------------
   SIDEBAR & IRC LOGIC
------------------------------------------------------------------------- */

function unlockSidebar() {
    // Select the second list item (IRC)
    const ircTab = document.querySelector('.sidebar li:nth-child(2)'); 
    
    // Style it to look active
    ircTab.classList.remove('disabled');
    ircTab.textContent = "IRC [LIVE]";
    ircTab.style.cursor = "pointer";
    ircTab.style.textShadow = "0 0 8px #00ff00"; // Green glow
    ircTab.style.color = "#00ff00";

    // Add click event to switch screens
    ircTab.addEventListener('click', () => {
        terminalScreen.classList.add('hidden'); // Hide terminal
        ircScreen.classList.remove('hidden');   // Show IRC
        startChatBots(); // Turn on the bots
    });
}

// Bot Configuration
const botNames = ['aykin_soft', 'Root_Slayer', 'NullByte', 'System_Daemon', 'V0id'];
const botMessages = [
    "Anyone seen the new CVE for the kernel?",
    "Scanning subnet 192.168.0.x... found 3 open ports.",
    "Target is using a weak handshake. Cracking now.",
    "Did you flush the logs? They are tracing the proxy.",
    "Uploading payload... 89% complete.",
    "Alert: Node 4 went offline.",
    "Just bypass the firewall using port 8080.",
    "Lol, who left the admin password as 'admin123'?",
    "Encryption keys generated.",
    "Signal strength dropping. Rerouting through Tokyo server."
];

let chatInterval;

function startChatBots() {
    if (chatInterval) return; // Prevent multiple intervals running at once

    // Initial Welcome Message
    addChatMessage("System", "Connected to #shadow_ops server.", "user-system");

    // Loop to post messages
    chatInterval = setInterval(() => {
        const randomUser = botNames[Math.floor(Math.random() * botNames.length)];
        const randomMsg = botMessages[Math.floor(Math.random() * botMessages.length)];
        
        // Color logic
        let userClass = 'user-bot';
        if (randomUser === 'Root_Slayer') userClass = 'user-admin';
        
        addChatMessage(randomUser, randomMsg, userClass);
    }, 3000); // New message every 3 seconds
}

function addChatMessage(user, text, cssClass) {
    const time = new Date();
    const timeStr = `[${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}]`;

    const line = document.createElement('div');
    line.className = 'chat-msg';
    
    line.innerHTML = `
        <span class="timestamp">${timeStr}</span>
        <span class="username ${cssClass}">&lt;${user}&gt;</span>
        <span class="message">${text}</span>
    `;

    chatOutput.appendChild(line);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Auto-scroll to bottom
}