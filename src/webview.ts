import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from './utils';
import { getEditorInfo } from './utils';

export const getViewer = (uri: vscode.Uri, webview: vscode.Webview, context: vscode.ExtensionContext): any => {
	// Local path to script and css for the webview
	const docPath = webview.asWebviewUri(uri);
	const s_three = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'three', 'three.min.js')
	));
	const s_oc = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'three', 'OrbitControls.js')
	));
	const s_gui = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'three', 'dat.gui.min.js')
	));
	const s_plyl = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'three', 'loaders', 'PLYLoader.js')
	));
	const s_pcdl = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'three', 'loaders', 'PCDLoader.js')
	));
	const s_view = webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'lib', 'view.js')
	));

	const {pointMaxSize, bgColor, pointDefaultSize, useGridHelper} = getEditorInfo();

	// Use a nonce to whitelist which scripts can be run
	// const nonce = getNonce();

	const head =
	`<head>
	<title>three.js webgl - PLY</title>
	<meta charset="utf-8">
	<style>
	body {
		font-family: Monospace;
		background-color: #2e2e2e;
		color: #f00;
		margin: 0px;
		padding: 0px 0px;
		overflow: hidden;
	}
	</style>
	</head>`;
	const body =
	`<body>
	<div id="view">
	</div>
	<script src="${s_three}"></script>
	<script src="${s_pcdl}"></script>
	<script src="${s_plyl}"></script>
	<script src="${s_gui}"></script>
	<script src="${s_oc}"></script>
	<script>
		var load_path="${docPath}";
		const point_max_size = "${pointMaxSize}";
		const bg_color = "${bgColor}";
		const point_default_size = ${pointDefaultSize};
		const use_gridhelper = ${useGridHelper};
	</script>
	<script src="${s_view}"></script>
	</body>`;

	return "<!DOCTYPE html>\n<html dir='ltr' mozdisallowselectionprint>\n" + head + body + "</html>\n";
}
//
// ViewerProviderCE
//
