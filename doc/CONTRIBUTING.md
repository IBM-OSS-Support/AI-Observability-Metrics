
## How to Contribute

Contributions are essential for keeping this extension great. We try to keep it as easy as possible to contribute changes and we are open to suggestions for making it even easier. There are only a few guidelines that we need contributors to follow

## Development

### Installation Prerequisites:

  * latest [Visual Studio Code](https://code.visualstudio.com/)
  * Docker:  installed [for Mac](https://docs.docker.com/desktop/install/mac-install/)
  * Python3: If not already installed, run `brew install python3`. After completion, run `pip3 -V`ensure successful installation.

  ### Steps
1. Fork and clone this repository
```
git clone  https://github.com/IBM-OSS-Support/AI-Observability-Metrics.git
```

2. Change to the directory:
```bash
  $ cd AI-Observability-Metrics
```
3. Install the NPM dependencies:

**add here**

4. To run the extension, open the Debugging tab in VSCode.

5. Select and run 'Launch Extension' at the top left:

### Build the extension

You can package the extension as a *.vsix archive:
  ```bash
  $ npx @vscode/vsce package
  ```

It will generate a vscode-granite-`<version>`.vsix

You can then install it in VS Code by following these [instructions](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

### Submitting Code

If you're looking to contribute code, please follow these guidelines:

1. **Fork the repository** and create your feature branch (`git checkout -b feature-name`).
2. **Write clear, concise commit messages.**
3. **Commit and sign your commit (with the -s flag)**
4. **Make sure your code adheres to the project's coding standards** (e.g., code formatting, naming conventions).
5. **Submit a pull request** with a description of what you've done. If it’s a bug fix, explain the bug and how your change addresses it.

### Reviewing Pull Requests

We welcome pull requests from the community! When reviewing pull requests:

1. **Be respectful and constructive** in your comments.
2. **Ensure code is well-tested** and follows the project’s guidelines.
3. **Check that the pull request addresses the issue or feature request** fully and correctly.

### Reporting Issues

If you find a bug or something that seems wrong, please report it! When submitting an issue:

1. **Provide a clear description of the issue.**
2. **Include steps to reproduce the issue** (if applicable).
3. **Include your environment details**, such as the operating system, version of the project you're using, etc.

## Getting Started

If you want to get started with local development, follow the link 
[setup.md](setup.md).
