import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from './utils';
import { getEditorInfo } from './utils';

export const getViewer = (uri: vscode.Uri, webview: vscode.Webview, context: vscode.ExtensionContext): any => {
    // Local path to script and css for the webview
    const docPath = webview.asWebviewUri(uri);
    const threeJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'three.min.js')
    ));
    const orbitControlsJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'OrbitControls.js')
    ));
    const datGuiJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'dat.gui.min.js')
    ));
    const girdhelperJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'gridhelper.js')
    ));
    const plyLoaderJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'loaders', 'PLYLoader.js')
    ));
    const pcdLoaderJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'loaders', 'PCDLoader.js')
    ));
    const statsJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'three', 'stats.min.js')
    ));
    const objectsJS = webview.asWebviewUri(vscode.Uri.file(
        path.join(context.extensionPath, 'lib', 'objects.js')
    ));

    const {
        pointMaxSize,
        backgroundColor,
        pointDefaultSize,
        displayGridHelper,
        gridSize,
        autoGridSize,
        pointDefaultColor,
        reverseCoordinate,
        rotateCoordinate,
        viewPoint,
        fileNumChannels
    } = getEditorInfo();

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
    #axes {
        width: 150px;
        height: 150px;
        background-color: transparent; /* or transparent; will show through only if renderer alpha: true */
        border: none; /* or none; */
        margin: 0;
        padding: 0px;
        position: absolute;
        left: 20px;
        bottom: 20px;
        z-index: 100;
    }
    </style>
    </head>`;
    const body =
        `<body>
    <div id="axes">
    </div>
    <div id="view">
    </div>
    <script src="${threeJS}"></script>
    <script src="${orbitControlsJS}"></script>
    <script src="${datGuiJS}"></script>
    <script src="${plyLoaderJS}"></script>
    <script src="${pcdLoaderJS}"></script>
    <script src="${girdhelperJS}"></script>
    <script src="${statsJS}"></script>
    <script>
        const loadPath="${docPath}";
        const pointMaxSize = "${pointMaxSize}";
        const backgroundColor = "${backgroundColor}";
        const pointDefaultSize = ${pointDefaultSize};
        const displayGridHelper = ${displayGridHelper};
        const gridSize = [${gridSize}];
        const autoGridSize = ${autoGridSize};
        const pointDefaultColor = "${pointDefaultColor}";
        const reverseCoordinate = [${reverseCoordinate}];
        const rotateCoordinate = [${rotateCoordinate}];
        const viewPoint = ${viewPoint};
        const fileNumChannels = ${fileNumChannels};
    </script>
    <script src="${objectsJS}"></script>
    </body>`;

    return "<!DOCTYPE html>\n<html dir='ltr' mozdisallowselectionprint>\n" + head + body + "</html>\n";
};