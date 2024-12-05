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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    // Check if it's a first install or version update
    vscode.window.showInformationMessage('Running setup for first install or version update...');
    runInsertCodeTemplateCommand(context);
    // Register the command for manual triggering
    const disposable = vscode.commands.registerCommand('rbe.insertCodeTemplate', () => {
        vscode.window.showInformationMessage('Running the "Insert Code Template" command...');
        runInsertCodeTemplateCommand(context);
    });
    context.subscriptions.push(disposable);
}
async function runInsertCodeTemplateCommand(context) {
    try {
        // Create a terminal and run setup commands
        const terminal = vscode.window.createTerminal('AI Observability Metrics');
        // Virtual environment setup
        terminal.sendText('python3 -m venv myenv');
        terminal.sendText('source myenv/bin/activate');
        terminal.sendText('pip3 uninstall -y graphsignal python-dotenv requests requests-oauthlib openai');
        terminal.sendText('pip3 install graphsignal==0.15.1 python-dotenv==1.0.1 requests requests-oauthlib==1.4.0 openai==1.14.0');
        // Docker setup
        terminal.sendText('docker pull ghcr.io/ibm-oss-support/ai_observability_metrics:2.0');
        terminal.show();
        terminal.sendText('docker run --name ai-observability-metrics -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 ghcr.io/ibm-oss-support/ai_observability_metrics:2.0');
        // File copying
        const folder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
        if (!folder) {
            vscode.window.showErrorMessage('No folder is open in the workspace.');
            return;
        }
        const original_ai_observability_metrics_file = path.join(context.extensionPath, 'out', 'ai_observability_metrics.py');
        const original_ai_observability_metrics_app = path.join(context.extensionPath, 'out', 'ai_observability_metrics_app.py');
        const readme = path.join(context.extensionPath, 'out', 'README.md');
        const aitargetpath = path.join(folder, 'ai_observability_metrics.py');
        const appfilepath = path.join(folder, 'ai_observability_metrics_app.py');
        const readmePath = path.join(folder, 'README.md');
        fs.copyFileSync(original_ai_observability_metrics_file, aitargetpath);
        fs.copyFileSync(original_ai_observability_metrics_app, appfilepath);
        fs.copyFileSync(readme, readmePath);
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage('Setup completed successfully!');
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error during setup: ${error.message}`);
        }
        else {
            vscode.window.showErrorMessage(`An unknown error occurred: ${String(error)}`);
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map