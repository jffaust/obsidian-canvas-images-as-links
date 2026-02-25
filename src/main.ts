import { ItemView, Plugin, TFile, WorkspaceLeaf } from "obsidian";

interface CanvasNodeData {
	id: string;
	type: string;
	file?: string;
	link?: string;
	[key: string]: any;
}

export default class CanvasImageLinkPlugin extends Plugin {
	async onload() {
		// Register the double-click event on the window to capture clicks in the canvas
		this.registerDomEvent(
			window,
			"dblclick",
			this.handleDblClick.bind(this),
		);
	}

	async handleDblClick(evt: MouseEvent) {
		const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
		if (canvasView?.getViewType() === "canvas") {
			const canvas = (canvasView as any).canvas;
			// Get all currently selected nodes
			const selection = Array.from(canvas.selection);

			if (selection.length !== 1) {
				return;
			}
			const node = selection[0] as CanvasNodeData;
			let link = "";
			if ("unknownData" in node) {
				if ("link" in node.unknownData) {
					link = node.unknownData.link;
					console.log("Link found on node:", link);
					window.open(link);
					return;
				}
			}
		}
	}
}
