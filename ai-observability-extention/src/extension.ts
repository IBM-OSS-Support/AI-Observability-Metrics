import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
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
        
        const pythonInstallCmd = 'pip3 install graphsignal==0.15.1 python-dotenv==1.0.1 requests requests-oauthlib==1.4.0 openai==1.14.0'
        terminal.sendText(pythonInstallCmd);
        const pullImage = 'docker pull ibmcom/db2';
        terminal.sendText(pullImage);
        const dockerInstallCmd = 'docker run -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 imagename:latest';
        terminal.sendText(dockerInstallCmd);

      
        const folder = vscode.workspace.workspaceFolders
                        ? vscode.workspace.workspaceFolders[0].uri.fsPath
                        : undefined;
        
        const original_ai_observer_file = path.join(context.extensionPath, 'out', 'ai_observer.py');
        const original_ai_observer_app = path.join(context.extensionPath, 'out', 'ai_observer_app.py');
        const readme = path.join(context.extensionPath, 'out', 'README.md');


        let appfilepath: string | undefined;
        let aitargetpath: string | undefined;
        let readmePath: string | undefined;
        if (folder) {
            appfilepath = path.join(folder, 'ai_observer_app.py');
            // copy ai_observer.py
            aitargetpath = path.join(folder, 'ai_observer.py');
            // config
            readmePath = path.join(folder, 'README.md');
            // proceed with creating the file...
        } else {
            vscode.window.showErrorMessage('No folder is open in the workspace.');
            return;
        }

        fs.copyFileSync(original_ai_observer_file, aitargetpath);
        fs.copyFileSync(original_ai_observer_app, appfilepath);
        fs.copyFileSync(readme, readmePath);
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
        
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
