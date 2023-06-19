import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { EMView, VIEW_TYPE_NAME } from './view';

interface OEMSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: OEMSettings = {
	mySetting: 'default'
}

export default class OEMPlugin extends Plugin {
	settings: OEMSettings;

	async onload() {
		await this.loadSettings();
		
		this.registerView(
			VIEW_TYPE_NAME,
			(leaf) => new EMView(leaf, this)
		);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'open-event-mapping-view-command',
			name: 'Switch to event mapping view',
			callback: (editor: Editor, view: MarkdownView) => {
				this.toggleView();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async toggleView() {
		const mapView = this.app.workspace.getActiveViewOfType(EMView);
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (mapView != null) {
			// Switch to markdown
			this.setMarkdownView(mapView.leaf);
		} else if (mdView != null) {
			this.setMapView(mdView.leaf);
		}
	}

	async setMarkdownView(leaf: WorkspaceLeaf) {
		await leaf.setViewState(
			{
				type: 'markdown',
				state: leaf.view.getState(),
				popstate: true
			} as ViewState,
			{ focus: true }
		);
	}

	async setMapView(leaf: WorkspaceLeaf) {
		await leaf.setViewState(
			{
				type: VIEW_TYPE_NAME,
				state: leaf.view.getState(),
				popstate: true
			} as ViewState
		);
	}
}

/*class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}*/

class SettingTab extends PluginSettingTab {
	plugin: OEMPlugin;

	constructor(app: App, plugin: OEMPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
