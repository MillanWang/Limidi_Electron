const { exec } = require("child_process");
const sudo = require("electron-sudo");

// Define your PowerShell script
const powershellScript = [
    //
    "echo hey",
    "appcmd list site",
].join(";");

function startLimidiServer(port) {
    // Execute the PowerShell script
    exec(`powershell -command "${powershellScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing PowerShell script: ${error.message}`);
            return;
        }
        console.log(`PowerShell Script Output: ${stdout}`);
    });
}

module.exports = {
    startLimidiServer,
};
