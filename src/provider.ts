import * as vscode from "vscode";
import { Uri } from "vscode";
import * as path from "path";

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class ContentProvider {
  public constructor(private _context: vscode.ExtensionContext, private panel?: vscode.WebviewPanel) { }

  private getUri(...p: string[]): vscode.Uri {
    const uri = vscode.Uri.file(path.join(this._context.extensionPath, ...p));
    return this.panel.webview.asWebviewUri(uri);
  }
  public setPanel(panel: vscode.WebviewPanel): void {
    this.panel = panel;
  }
  public provideContent(uri: vscode.Uri, state: any): string {
    const docPath = this.panel.webview.asWebviewUri(uri);
    const cspSource = this.panel.webview.cspSource;
    //const nonce = getNonce()
    const scriptUri1 = this.getUri("lib", "three", "three.min.js");
    const scriptUri2 = this.getUri("lib", "three", "stats.min.js");
    const scriptUriL1 = this.getUri("lib", "three", "loaders", "PLYLoader.js");
    const scriptUriL2 = this.getUri("lib", "three", "loaders", "PCDLoader.js");
    const scriptUri4 = this.getUri("lib", "three", "dat.gui.min.js");
    const scriptUri5 = this.getUri("lib", "three", "OrbitControls.js");
    const scriptUri6 = this.getUri("lib", "view.js");
    //const tex = this.getUri("data", "crate.gif");
    //const dply = this.getUri("data", "dolphins.ply");
    //const tex2 = this.getUri("data", "disc.png");

    const head =
    `<head>
    <title>three.js webgl - PLY</title>
    <meta charset="utf-8">
    <style>
    body {
        font-family: Monospace;
        background-color: #0f0;
        color: #f00;
        margin: 0px;
        padding: 0px 0px;
        overflow: hidden;
    }
    </style>
    </head>`;
    const body =
    `<body>
    <script src="${scriptUri1}"></script>
    <script src="${scriptUri2}"></script>
    <script src="${scriptUriL1}"></script>
    <script src="${scriptUriL2}"></script>
    <script src="${scriptUri4}"></script>
    <script src="${scriptUri5}"></script>
    <script>
      var load_path="${docPath}";
    </script>
    <script src="${scriptUri6}"></script>
    </body>`;

    return "<!DOCTYPE html>\n<html dir='ltr' mozdisallowselectionprint>\n" + head + body + "</html>\n";
  }
}