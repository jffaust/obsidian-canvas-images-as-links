import { App, ItemView, Modal, Plugin, Setting } from "obsidian";
import { CanvasNode } from "obsidian-typings";

export default class CanvasImageLinkPlugin extends Plugin {
	async onload() {
		// Register the double-click event on the window to capture clicks in the canvas
		this.registerDomEvent(
			window,
			"dblclick",
			this.tryOpenSelectedNodeLink.bind(this),
		);

		this.registerEvent(
			this.app.workspace.on("canvas:node-menu", (menu, node) => {
				if (!isValidNodeType(node)) return;

				menu.addItem((item) => {
					item.setTitle("Set link")
						.setIcon("link")
						.onClick(() => {
							new SampleModal(this.app, node).open();
						});
				});

				const link = getNodeLink(node);
				if (link) {
					menu.addItem((item) => {
						item.setTitle("Open link")
							.setIcon("external-link")
							.onClick(() => {
								window.open(link);
							});
					});
				}
			}),
		);

		this.addCommand({
			id: "canvas-set-node-link",
			name: "Set link of selected canvas node",
			checkCallback: (checking: boolean) => {
				const node = this.getSelectedCanvasNode();
				if (!node) return false;
				if (!isValidNodeType(node)) return false;

				if (!checking) {
					new SampleModal(this.app, node).open();
				}
				return true;
			},
		});
	}

	tryOpenSelectedNodeLink() {
		const node = this.getSelectedCanvasNode();
		if (!node) return;
		if (!isValidNodeType(node)) return;

		let link = getNodeLink(node);
		if (link) {
			window.open(link);
		}
	}

	getSelectedCanvasNode(): any | null {
		const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
		if (canvasView?.getViewType() === "canvas") {
			const canvas = (canvasView as any).canvas;
			// Get all currently selected nodes
			const selection = Array.from(canvas.selection);

			if (selection.length !== 1) {
				return null;
			}
			const node = selection[0];
			return node;
		}
		return null;
	}
}

function isValidNodeType(node: any): boolean {
	return node?.unknownData?.type === "file" || "file" in node;
}

function getNodeLink(node: any): string {
	if ("unknownData" in node) {
		if ("link" in node.unknownData) {
			return node.unknownData.link;
		}
	}
	return "";
}

class SampleModal extends Modal {
	constructor(app: App, node: any) {
		super(app);
		this.setTitle("Set node link");
		this.modalEl.addClass("canvas-node-link-modal");

		let link = getNodeLink(node);
		new Setting(this.contentEl).setName("Link").addText((text) =>
			text.setValue(link).onChange((value) => {
				link = value;
			}),
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					node.setData({ link });
				}),
		);
	}
}
