"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const dockerode_1 = __importDefault(require("dockerode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
function activate(context) {
    const docker = new dockerode_1.default();
    let disposable = vscode.commands.registerCommand('rbe.startDockerContainer', () => {
        const terminal = vscode.window.createTerminal('Docker Terminal');
        terminal.show();
        // Install dockerode in the terminal
        const installCmd = 'npm install dockerode';
        terminal.sendText(installCmd);
        const composeFilePath = path.join(__dirname, 'docker_files', 'docker-compose.yml');
        const prunecommand = `docker system prune -a -f`;
        terminal.sendText(prunecommand);
        const networkprunecommand = `docker network prune -f`;
        terminal.sendText(networkprunecommand);
        const downCommand = `docker-compose -f ${composeFilePath} down`;
        terminal.sendText(downCommand);
        const upCommand = `docker-compose -f ${composeFilePath} up --build -d`;
        terminal.sendText(upCommand);
        // Run the command in a child process
        (0, child_process_1.exec)(upCommand, { cwd: path.dirname(composeFilePath) }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(`Stderr: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage(`Docker Compose Output: ${stdout}`);
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension_docker.js.map