/* ==========================================================================
   GLOBAL VARIABLES & CONFIGURATION
   ========================================================================== */
const input = document.getElementById('cmdInput');
const output = document.getElementById('terminal-output');
const promptText = document.getElementById('prompt-text');

// View Containers (for switching screens)
const viewTerminal = document.getElementById('view-terminal');
const viewIrc = document.getElementById('view-irc');
const chatOutput = document.getElementById('chat-output');

// Sidebar Elements
const btnIrc = document.getElementById('btn-irc');

// System State
let state = 'SHELL'; // SHELL, LOGIN_USER, LOGIN_PASS, REGISTER_USER, REGISTER_PASS
let currentUser = "guest";
let tempUser = ""; 

// Fake File System Data
const fileSystem = {
    "readme.txt": "Welcome to 0xShell v1.0.\nWARNING: Authorized use only.",
    "targets.list": "192.168.1.45 [VULNERABLE]\n10.0.2.15 [SECURE]\n172.16.0.1 [PENDING]\nYAZAR_ZAFER_BASAR [TERMINATED]",
    "payload.sh": "#!/bin/bash\nrm -rf / --no-preserve-root",
    "encrypted.dat": "RW5jcnlwdGVkIERhdGEgLSDoIG5vdCB0b3VjaA==",
    "notes.txt": "To do: Crack the admin hash."
};

/* ==========================================================================
   TERMINAL INPUT HANDLING
   ========================================================================== */

// Helper: Print to terminal
function print(text, isError = false, isHtml = false) {
    const div = document.createElement('div');
    if (isHtml) div.innerHTML = text;
    else div.textContent = text;
    
    if (isError) div.style.color = 'red';
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

// Event Listener: Handle "Enter" key
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const cmd = input.value.trim();
        
        // Hide password in history
        let displayCmd = (state.includes('PASS')) ? '******' : cmd;
        
        print(promptText.textContent + displayCmd); 
        processCommand(cmd);
        input.value = '';
    }
});

/* ==========================================================================
   COMMAND PROCESSING
   ========================================================================== */

function processCommand(rawCmd) {
    // 1. STANDARD SHELL MODE
    if (state === 'SHELL') {
        const args = rawCmd.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                print("COMMANDS:");
                print("  ls        - List directory contents");
                print("  cat [file]- Display file content");
                print("  login     - Access existing account");
                print("  register  - Create new 0xShell identity");
                print("  scan      - Network vulnerability scan");
                print("  matrix    - Visual data flow");
                print("  whoami    - Display current user");
                print("  theme     - Change UI color [red/green]");
                print("  logout    - End session");
                break;

            // --- FILE SYSTEM COMMANDS ---
            case 'ls':
                const files = Object.keys(fileSystem).join('   ');
                print(files);
                break;

            case 'cat':
                const fileName = args[1];
                if (!fileName) {
                    print("Usage: cat [filename]");
                } else if (fileSystem[fileName]) {
                    print(fileSystem[fileName]);
                } else {
                    print(`cat: ${fileName}: No such file or directory`, true);
                }
                break;

            // --- SYSTEM COMMANDS ---
            case 'sudo':
                if (currentUser === 'root') {
                    print("You are already root.");
                } else {
                    print(`[sudo] password for ${currentUser}: `);
                    setTimeout(() => {
                        print(`${currentUser} is not in the sudoers file. This incident will be reported.`, true);
                    }, 800);
                }
                break;
            
            case 'matrix':
                runMatrixEffect();
                break;

            case 'scan':
                runFakeScan();
                break;

            case 'whoami':
                print(currentUser);
                break;

            case 'date':
                print(new Date().toString());
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            case 'theme':
                changeTheme(args[1]);
                break;

            case 'about':
                print("Redirecting...");
                window.location.href = "https://0xshellaboutpage.netlify.app/";
                break;

            // --- AUTH COMMANDS ---
            case 'login':
                if(currentUser !== "guest") print("Already logged in.");
                else { state = 'LOGIN_USER'; promptText.textContent = "username: "; }
                break;

            case 'register':
                if(currentUser !== "guest") print("Logout first.");
                else { state = 'REGISTER_USER'; promptText.textContent = "new_user: "; }
                break;
            
            case 'logout':
                performLogout();
                break;

            case '':
                break;

            default:
                print(`bash: ${cmd}: command not found`, true);
        }
    } 
    // 2. LOGIN FLOW
    else if (state === 'LOGIN_USER') {
        tempUser = rawCmd;
        state = 'LOGIN_PASS';
        promptText.textContent = "password: ";
        input.type = "password";
    } 
    else if (state === 'LOGIN_PASS') {
        const storedPass = localStorage.getItem('0x_' + tempUser);
        if (storedPass === rawCmd) {
            currentUser = tempUser;
            print("ACCESS GRANTED.");
            unlockFeatures();
        } else {
            print("ACCESS DENIED: Incorrect credentials.", true);
        }
        resetShell();
    }
    // 3. REGISTER FLOW
    else if (state === 'REGISTER_USER') {
        tempUser = rawCmd;
        if(localStorage.getItem('0x_' + tempUser)) {
            print("Error: User already exists.", true);
            resetShell();
        } else {
            state = 'REGISTER_PASS';
            promptText.textContent = "new_pass: ";
            input.type = "password";
        }
    }
    else if (state === 'REGISTER_PASS') {
        localStorage.setItem('0x_' + tempUser, rawCmd);
        print(`Identity '${tempUser}' created. Please login.`);
        resetShell();
    }
}

// Reset state to default SHELL
function resetShell() {
    state = 'SHELL';
    const displayUser = currentUser === "guest" ? "root" : currentUser;
    promptText.textContent = `${displayUser}@0xshell > `;
    input.type = "text";
    input.focus();
}

/* ==========================================================================
   FEATURE FUNCTIONS (Visuals & Logic)
   ========================================================================== */

function changeTheme(color) {
    let hex = "#0077ff"; // Default Blue
    if(color === 'red') hex = "#ff3333";
    if(color === 'green') hex = "#00ff00";
    
    document.body.style.color = hex;
    document.querySelector('.sidebar').style.borderRightColor = hex;
    input.style.color = hex;
    
    // Update links
    const links = document.querySelectorAll('a');
    links.forEach(l => l.style.color = hex);
    
    print(`Theme updated to ${color || 'blue'}.`);
}

function runFakeScan() {
    print("Initializing network probe...");
    input.disabled = true; 
    
    let count = 0;
    const max = 4;
    
    const interval = setInterval(() => {
        count++;
        const ip = `192.168.0.${Math.floor(Math.random() * 255)}`;
        const isVuln = Math.random() > 0.7;
        const status = isVuln ? "[VULNERABLE]" : "[SECURE]";
        const color = isVuln ? "red" : "green";
        
        print(`Scanning ${ip} ... <span style="color:${color}">${status}</span>`, false, true);

        if (count >= max) {
            clearInterval(interval);
            print("Scan complete. Targets identified.");
            input.disabled = false;
            input.focus();
        }
    }, 600);
}

function runMatrixEffect() {
    input.disabled = true;
    print("Initiating Matrix protocol...", false);
    
    let rows = 0;
    const maxRows = 20; 
    
    const matrixInterval = setInterval(() => {
        let line = "";
        for(let i = 0; i < 50; i++) {
            line += Math.random() > 0.5 ? "0" : "1 ";
        }
        
        const div = document.createElement('div');
        div.textContent = line;
        div.style.color = "#0077ff";
        div.style.textShadow = "0 0 5px #0077ff";
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;

        rows++;
        if(rows >= maxRows) {
            clearInterval(matrixInterval);
            input.disabled = false;
            input.focus();
            print("Matrix disconnected.");
        }
    }, 100);
}

/* ==========================================================================
   SYSTEM LOGIC (Auth, Sidebar, IRC)
   ========================================================================== */

function unlockFeatures() {
    // Unlock IRC Button
    btnIrc.classList.remove('disabled');
    btnIrc.classList.add('active-link');
    btnIrc.textContent = "IRC [LIVE]";
    
    // Add Click Handler
    btnIrc.onclick = function() {
        viewTerminal.classList.remove('view-active');
        viewTerminal.classList.add('view-hidden');
        
        viewIrc.classList.remove('view-hidden');
        viewIrc.classList.add('view-active');
        
        startBots();
    };
}

function performLogout() {
    currentUser = "guest";
    
    // Reset IRC Button
    btnIrc.classList.add('disabled');
    btnIrc.classList.remove('active-link');
    btnIrc.textContent = "IRC [OFFLINE]";
    btnIrc.onclick = null;
    
    // Force switch back to Terminal
    viewIrc.classList.add('view-hidden');
    viewIrc.classList.remove('view-active');
    
    viewTerminal.classList.remove('view-hidden');
    viewTerminal.classList.add('view-active');
    
    print("Session terminated.");
    resetShell();
}

/* ==========================================================================
   IRC BOT LOGIC
   ========================================================================== */

let botInterval;
const botNames = ['Neon_Ghost', 'Root_Slayer', 'Aykin_Soft', 'System_Daemon'];
const botMessages = [
    "Anyone seen the new CVE?",
    "Scanning subnet 192.168.0.x...",
    "Target acquired.",
    "Did you flush the logs?",
    "Uploading payload... 89%",
    "Alert: Node 4 went offline."
];

function startBots() {
    if(botInterval) return; // Prevent double intervals
    
    addChat("System", "Connected to #shadow_ops server.", "user-system");
    
    botInterval = setInterval(() => {
        const user = botNames[Math.floor(Math.random() * botNames.length)];
        const msg = botMessages[Math.floor(Math.random() * botMessages.length)];
        
        let cls = 'user-bot';
        if (user === 'Root_Slayer') cls = 'user-admin';
        
        addChat(user, msg, cls);
    }, 3000);
}

function addChat(user, text, cls) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.innerHTML = `<span class="timestamp">[${time}]</span><span class="${cls}">&lt;${user}&gt;</span> ${text}`;
    chatOutput.appendChild(div);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}