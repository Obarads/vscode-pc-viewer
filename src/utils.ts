import * as vscode from "vscode";

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function getEditorInfo(){
	const editor = vscode.window.activeTextEditor;
	const resource = editor?.document.uri;

	const pcviewerResource = vscode.workspace.getConfiguration('pcviewer', resource);
	const pointMaxSize = pcviewerResource.get('pointMaxSize');
    const bgColor = pcviewerResource.get('bgColor');
    const pointDefaultSize = pcviewerResource.get('pointDefaultSize');
    const useGridHelper = pcviewerResource.get('useGridHelper');

	return {pointMaxSize, bgColor, pointDefaultSize, useGridHelper};
}


