import { ItemView, Plugin, TFile, WorkspaceLeaf } from "obsidian";

interface CanvasNodeData {
	id: string;
	type: string;
	file?: string;
	link?: string;
	[key: string]: any;
}

interface CanvasData {
	nodes: CanvasNodeData[];
	edges: any[];
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
		console.log("Canvas Image Links: Double-click detected", evt);

		const target = evt.target as HTMLElement;

		// Check if the target is within a canvas node
		const canvasNode = target.closest(".canvas-node");
		if (!canvasNode) {
			return;
		}

		// Check if the active view is a Canvas view
		const view = this.app.workspace.getActiveViewOfType(ItemView);
		if (!view || view.getViewType() !== "canvas") {
			return;
		}

		// Get the node ID from the DOM
		const nodeId = canvasNode.getAttribute("data-id");
		if (!nodeId) {
			return;
		}

		// Get the file associated with the view
		// We cast to any because CanvasView is not explicitly exported with a file property in the public API
		let file = (view as any).file as TFile;

		if (!file) {
			// Fallback to active file if view.file is not available
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				file = activeFile;
			} else {
				return;
			}
		}

		// Read the file content to get the latest data (handling manual edits)
		const content = await this.app.vault.read(file);
		let canvasData: CanvasData;
		try {
			canvasData = JSON.parse(content);
		} catch (e) {
			console.error("Canvas Image Links: Failed to parse canvas data", e);
			return;
		}

		// Find the node in the data
		// The JSON Canvas spec puts nodes in a "nodes" array
		if (!canvasData.nodes) {
			return;
		}

		const node = canvasData.nodes.find((n) => n.id === nodeId);
		if (node && node.link) {
			const link = node.link;

			// Prevent default behavior (e.g., zooming or editing)
			evt.preventDefault();
			evt.stopPropagation();

			// Open the link
			if (link.startsWith("http://") || link.startsWith("https://")) {
				window.open(link);
			} else if (link.startsWith("obsidian://")) {
				window.open(link);
			} else if (link.startsWith("mailto:")) {
				window.open(link);
			} else {
				// Heuristic for "example.com" style URLs without protocol
				// If it has a dot, no spaces, and no common file extension, maybe it's a website?
				// Actually, "example.com" is a valid filename in Obsidian.
				// But "google.com" is almost certainly a website.
				// Let's check if it has a TLD-like structure.
				// This is a bit aggressive but matches the user's "example.com" case.
				const isDomainLike =
					/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/.test(link);

				if (isDomainLike) {
					window.open("https://" + link);
				} else {
					this.app.workspace.openLinkText(link, file.path);
				}
			}
		}
	}
}
