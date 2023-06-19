import * as React from 'react';

import { Square, Usb } from 'lucide-react';
import Draggable from 'react-draggable';
import { MapInteractionCSS } from 'react-map-interaction';

import { writeNode, structurizeFile } from './utils/file';

const DEFAULT_NODE_DETAIL = {
	id: 0,
	title: 'new node',
	description: '',
	position: '0,0'
};

const NodeStyle = {
	padding: '1em',
	background: 'var(--background-primary)',
	border: '1px solid white',
	cursor: 'default'
};

const toolbarStyle = {
	position: 'fixed',
	top: '4rem',
	right: '4rem',
	display: 'flex',
	zIndex: 999,
	background: 'var(--background-primary)',
	border: '1px solid white',
	borderRadius: '5px'
};

const toolButtonStyle = {
	background: 'transparent',
	margin: 0,
	padding: '6px 8px'
};

export const Node = ({children, det, plugin, tfile}) => {
	function updateNodeDetail(e) {
		det.position = `${e.layerX-e.offsetX},${e.layerY-e.offsetY}`;
		writeNode(plugin, tfile, det);
	}

	let [x, y] = det['position']?.split(',').map(x => Number(x.trim()));
	return (
		<Draggable onStop={updateNodeDetail} defaultPosition={{x: x ?? 0, y: y ?? 0}}>
			<div style={NodeStyle}>
				{children}
			</div>
		</Draggable>
	);
};

export const ReactView = ({ plugin, tfile }) => {
	let [panState, changePanState] = React.useState(false);
	let [nodes, setNodes] = React.useState([]);

	function mapmd(e) {
		if (e.shiftKey) return changePanState(false);
		changePanState(true);
	}

	function mapmu(e) {
		changePanState(true);
	}

	function createNode() {
		let det = Object.assign({}, DEFAULT_NODE_DETAIL, {id: nodes.length});
		let newNode = <Node key={det.id} plugin={plugin} tfile={tfile} det={det}><h4>New Node</h4></Node>;
		setNodes(prev => [...prev, newNode]);
		writeNode(plugin, tfile, det);
	}

	React.useEffect(() => {
		(async () => {
			const n = await structurizeFile(plugin, tfile);
			let ls = [];
			for (const key of Object.keys(n)) {
				ls.push(<Node
					key={key}
					plugin={plugin}
					tfile={tfile}
					det={n[key]}>
						<h4>{n[key].title}</h4>
				</Node>);
			}
			setNodes(ls);
		})();
	}, []);
	
	return (
		<div className="maproot" onMouseDown={mapmd} onMouseUp={mapmu} style={{width: '100%', height: '100%'}}>
			<div style={toolbarStyle}>
				<button title="New Square Node" style={toolButtonStyle} onClick={createNode}><Square size={16}/></button>
				<button title="New Connection" style={toolButtonStyle}><Usb size={16}/></button>
			</div>
			<MapInteractionCSS disablePan={panState}>
				{nodes}
			</MapInteractionCSS>
		</div>/**/
	);
};
