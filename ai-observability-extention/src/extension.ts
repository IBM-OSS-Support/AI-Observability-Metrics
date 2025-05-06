import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {

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

async function runInsertCodeTemplateCommand(context: vscode.ExtensionContext) {
    try {
        const platform = os.platform(); // 'win32', 'darwin', or 'linux'

        // Create a terminal and run setup commands
        const terminal = vscode.window.createTerminal('AI Observability Metrics');

        if (platform === 'win32') {
            terminal.sendText('python -m venv myenv');
            terminal.sendText('.\\myenv\\Scripts\\activate');
            terminal.sendText('pip uninstall -y graphsignal python-dotenv requests requests-oauthlib openai');
            terminal.sendText('pip install graphsignal==0.15.1 python-dotenv==1.0.1 requests requests-oauthlib==1.4.0 openai==1.14.0 langchain==0.1.12 langchain-openai==0.0.8 langchain-community==0.0.28');
        } else if (platform === 'darwin' || platform === 'linux') {
            terminal.sendText('python3 -m venv myenv');
            terminal.sendText('source myenv/bin/activate');
            terminal.sendText('pip3 uninstall -y graphsignal python-dotenv requests requests-oauthlib openai');
            terminal.sendText('pip3 install graphsignal==0.15.1 python-dotenv==1.0.1 requests requests-oauthlib==1.4.0 openai==1.14.0 langchain==0.1.12 langchain-openai==0.0.8 langchain-community==0.0.28');
        } else {
            vscode.window.showErrorMessage('Unsupported OS for setup script.');
            return;
        }

        // Docker setup
        terminal.sendText('docker pull ghcr.io/ibm-oss-support/ai_observability_metrics:3.0');
        terminal.show();
        terminal.sendText(
            'docker run --name ai-observability-metrics -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 ghcr.io/ibm-oss-support/ai_observability_metrics:3.0'
        );

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
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error during setup: ${error.message}`);
        } else {
            vscode.window.showErrorMessage(`An unknown error occurred: ${String(error)}`);
        }
    }
}


export function deactivate() {}
