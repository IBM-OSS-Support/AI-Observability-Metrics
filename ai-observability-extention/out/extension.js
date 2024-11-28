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
    let disposable = vscode.commands.registerCommand('rbe.insertCodeTemplate', async () => {
        // install docker
        const terminal = vscode.window.createTerminal('AI observer Terminal');
        terminal.show();
        const virtualenv = 'python3 -m venv myenv';
        terminal.sendText(virtualenv);
        const activate = 'source myenv/bin/activate';
        terminal.sendText(activate);
        const uninstall = 'pip3 uninstall -y graphsignal python-dotenv requests requests-oauthlib openai';
        terminal.sendText(uninstall);
        const pythonInstallCmd = 'pip3 install graphsignal==0.15.1 python-dotenv==1.0.1 requests requests-oauthlib==1.4.0 openai==1.14.0';
        terminal.sendText(pythonInstallCmd);
        const pullImage = 'docker pull --platform linux/amd64 ghcr.io/ibm-developers/ai-observability-metrics:1.0';
        terminal.sendText(pullImage);
        const dockerInstallCmd = 'docker run --name ai-observability-metrics -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 ghcr.io/ibm-developers/ai-observability-metrics:1.0';
        //const dockerInstallCmd = 'docker run --name ai-observability-metrics-docker -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 imagename:latest'
        terminal.sendText(dockerInstallCmd);
        const folder = vscode.workspace.workspaceFolders
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;
        const original_ai_observability_metrics_file = path.join(context.extensionPath, 'out', 'ai_observability_metrics.py');
        const original_ai_observability_metrics_app = path.join(context.extensionPath, 'out', 'ai_observability_metrics_app.py');
        const readme = path.join(context.extensionPath, 'out', 'README.md');
        let appfilepath;
        let aitargetpath;
        let readmePath;
        if (folder) {
            appfilepath = path.join(folder, 'ai_observability_metrics_app.py');
            // copy ai_observability_metrics.py
            aitargetpath = path.join(folder, 'ai_observability_metrics.py');
            // config
            readmePath = path.join(folder, 'README.md');
            // proceed with creating the file...
        }
        else {
            vscode.window.showErrorMessage('No folder is open in the workspace.');
            return;
        }
        fs.copyFileSync(original_ai_observability_metrics_file, aitargetpath);
        fs.copyFileSync(original_ai_observability_metrics_app, appfilepath);
        fs.copyFileSync(readme, readmePath);
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map