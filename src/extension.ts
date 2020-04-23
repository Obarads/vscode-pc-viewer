// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";
import { ContentProvider } from './provider';

const viewType = "pcviewer.panel";

interface PreviewPanel {
    panel: vscode.WebviewPanel;
    resource: vscode.Uri;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const openedPanels: PreviewPanel[] = [];
    const provider = new ContentProvider(context);

    const revealIfAlreadyOpened = (uri: vscode.Uri): boolean => {
        const opened = openedPanels.find(panel => panel.resource.fsPath === uri.fsPath);
        if (!opened)
            return false;
        opened.panel.reveal(opened.panel.viewColumn);
        return true;
    };

    const registerPanel = (preview: PreviewPanel): void => {
        let watcher;
        if (preview.resource.scheme === "file") {
            watcher = vscode.workspace.createFileSystemWatcher(preview.resource.fsPath);
            watcher.onDidDelete(() => preview.panel.title += " [deleted from disk]");
            watcher.onDidChange(() => preview.panel.webview.postMessage("reload"));
        }
        preview.panel.onDidDispose(() => {
            openedPanels.splice(openedPanels.indexOf(preview), 1);
            watcher?.dispose();
        });
        openedPanels.push(preview);
    };

    const creater = async (uri: vscode.Uri) => { 
        if (!revealIfAlreadyOpened(uri)) {
            registerPanel(createPreview(context, uri, provider));
        }
    };

    const previewAndCloseSrcDoc = async (document: vscode.TextDocument): Promise<void> => {
        if (document.languageId === "ply" || document.languageId === "pcd") {
            await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
            await creater(document.uri);
        }
    };

    const openedEvent = vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        previewAndCloseSrcDoc(document);
    });

    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(viewType, {
            async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: any) {
                const resource = vscode.Uri.parse(state.resource.fsPath);
                panel.title = panel.title || getPreviewTitle(resource);
                panel.webview.options = getWebviewOptions(context, resource);
                provider.setPanel(panel);
                panel.webview.html = provider.provideContent(resource, state);
                registerPanel({ panel, resource });
            }
        });
    }

    // If a file is already opened when load workspace.
    if (vscode.window.activeTextEditor) {
        previewAndCloseSrcDoc(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(openedEvent);
}

function createPreview(context: vscode.ExtensionContext, uri: vscode.Uri, provider: ContentProvider): PreviewPanel {
    const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.Active;
    const panel = vscode.window.createWebviewPanel(
        viewType,
        getPreviewTitle(uri),
        column,
        getWebviewOptions(context, uri)
    );
    provider.setPanel(panel);
    panel.webview.html = provider.provideContent(uri, { resource: uri });
    return { panel, resource: uri };
}

function getPreviewTitle(uri: vscode.Uri): string {
    return path.basename(uri.fsPath);
}

function getWebviewOptions(context: vscode.ExtensionContext, uri: vscode.Uri) {
    return {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: getLocalResourceRoots(context, uri)
    };
}

function getLocalResourceRoots(context: vscode.ExtensionContext, resource: vscode.Uri): vscode.Uri[] {
    const baseRoots = [vscode.Uri.file(context.extensionPath)];
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    if (folder) {
        return baseRoots.concat(folder.uri);
    }

    if (!resource.scheme || resource.scheme === "file") {
        return baseRoots.concat(vscode.Uri.file(path.dirname(resource.fsPath)));
    }

    return baseRoots;
}

export function deactivate() {}