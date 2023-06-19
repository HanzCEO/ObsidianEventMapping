import { TFile } from 'obsidian';

import { parseDocument } from 'htmlparser2';
import { marked } from 'marked';

import { OEMPlugin } from '../../main';
import { INode } from '../data/node';

marked.use({
	mangle: false,
	headerIds: false
});

export async function writeNode(plugin: OEMPlugin, tfile: TFile, node: INode) {
	const nodes = await structurizeFile(plugin, tfile);
	nodes[String(node.id)] = Object.assign({}, node); // mutate nodes

	// write to file
	const stringified = stringifyNodes(nodes);
	plugin.app.vault.modify(tfile, stringified);
}

export function stringifyNodes(nodes) {
	let final = '';
	for (const key of Object.keys(nodes)) {
		final += `# ${key}\n` +
			Array.from(Object.keys(nodes[key])).map(prop => {
				if (prop == "connections") return '';
				return `${prop}: ${nodes[key][prop]}`;
			}).join('\n');
		final += '\n';
	}
	return final;
}

export async function structurizeFile(plugin: OEMPlugin, tfile: TFile) {
	let vault = plugin.app.vault;

	const fcontent = await vault.read(tfile);
	let root = parseDocument(marked(fcontent));

	let nodes = {};

	let tmp = {};
	for (const child of root.childNodes) {
		if (child.name == "h1") {
			if (tmp.id) {
				nodes[tmp.id] = Object.assign({}, tmp);
			}
			tmp = {};
			tmp.name = child.attribs.id;
		}

		if (child.type == "text") continue;

		if (child.name == "p") {
			let datas = child.children[0].data.split('\n');
			datas.forEach(data => {
				let [key, ...value] = data.split(':');
				value = value.join(':');
				tmp[key] = value.trim();
			});
		}
	}

	if (tmp.id) nodes[tmp.id] = Object.assign({}, tmp);

	return nodes;
}
