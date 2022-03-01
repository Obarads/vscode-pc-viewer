import * as vscode from 'vscode';
import {
	registTDEditorProvider
} from './provider';
// import {
// 	regist_ViewerProviderCRE
// } from './test/viewerProvider'

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor provider

	context.subscriptions.push(
		registTDEditorProvider(context, "pcviewer.ply.viewer"),
		registTDEditorProvider(context, "pcviewer.pcd.viewer"),
		registTDEditorProvider(context, "pcviewer.bin.viewer"),
		// registTDEditorProvider(context, "pcviewer.obj.viewer"),
		// registTDEditorProvider(context, "pcviewer.npy.viewer"),
	);
}



