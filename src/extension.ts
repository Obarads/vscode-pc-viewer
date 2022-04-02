import * as vscode from 'vscode';
import {
	registTDEditorProvider
} from './provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		registTDEditorProvider(context, "pcviewer.ply.viewer"),
		registTDEditorProvider(context, "pcviewer.pcd.viewer"),
		registTDEditorProvider(context, "pcviewer.bin.viewer"),
		registTDEditorProvider(context, "pcviewer.obj.viewer"),
		registTDEditorProvider(context, "pcviewer.xyz.viewer"),
	);
}



