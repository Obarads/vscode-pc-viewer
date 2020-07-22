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
    const backgroundColor = pcviewerResource.get('backgroundColor');
    const pointDefaultSize = pcviewerResource.get('pointDefaultSize');
	const displayGridHelper = pcviewerResource.get('displayGridHelper');
	const pointDefaultColor = pcviewerResource.get('pointDefaultColor');
	const reverseCoordinate = pcviewerResource.get("reverseCoordinate");
	const rotateCoordinate = pcviewerResource.get("rotateCoordinate");
	const viewPoint = pcviewerResource.get("viewPoint");
	const fileNumChannels = pcviewerResource.get("fileNumChannels");

	return {pointMaxSize, backgroundColor, pointDefaultSize, displayGridHelper, pointDefaultColor, reverseCoordinate, rotateCoordinate, viewPoint, fileNumChannels};
}


