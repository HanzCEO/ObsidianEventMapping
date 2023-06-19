import { FileView, WorkspaceLeaf, TFile } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactView } from "./src/ReactView";
import { createRoot } from "react-dom/client";
import { OEMPlugin } from './main';

export const VIEW_TYPE_NAME = "event-mapping-view";

export class EMView extends FileView {
	plugin: OEMPlugin;
	Rroot: any;
	
	constructor(leaf: WorkspaceLeaf, plugin: OEMPlugin) {
		super(leaf);

		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_NAME;
	}

	getDisplayText() {
		return "Event mapping view";
	}

	async onLoadFile(file: TFile) {
		this.Rroot = createRoot(this.containerEl.children[1]);
		this.Rroot.render(
			<ReactView plugin={this.plugin} tfile={file} />
		);
	}

	async onClose() {
		this.Rroot.unmount();
	}
}
