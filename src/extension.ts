import * as vscode from 'vscode';
import { 
	regist_TDEditorProvider
} from './provider';
// import {
// 	regist_ViewerProviderCRE
// } from './test/viewerProvider'


export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor provider
	
	context.subscriptions.push(
		regist_TDEditorProvider(context, "pcviewer.ply.viewer"),
		regist_TDEditorProvider(context, "pcviewer.pcd.viewer"),
		regist_TDEditorProvider(context, "pcviewer.bin.viewer"),
		// regist_TDEditorProvider(context, "pcviewer.obj.viewer"),
		// regist_TDEditorProvider(context, "pcviewer.npy.viewer"),
	);
}



