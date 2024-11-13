import * as vscode from 'vscode';
import Docker from 'dockerode';
import { exec } from 'child_process';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function activate(context: vscode.ExtensionContext) {
    const docker = new Docker();

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
        exec(upCommand, { cwd: path.dirname(composeFilePath) }, (error, stdout, stderr) => {
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

export function deactivate() {}
