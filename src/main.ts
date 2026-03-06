import { App, ItemView, Modal, Plugin, Setting } from "obsidian";

interface NodeUnknownData {
	type?: string;
	link?: string;
}

interface CanvasNodeData {
	containerEl: HTMLElement;
	unknownData: NodeUnknownData;
	setData(data: Partial<NodeUnknownData>): void;
}

interface CanvasData {
	nodes: Map<string, CanvasNodeData>;
	selection: Set<CanvasNodeData>;
}

interface CanvasViewData extends ItemView {
	canvas: CanvasData;
}

export default class CanvasImageLinkPlugin extends Plugin {
	async onload() {
		// Register the double-click event on the window to capture clicks in the canvas
		this.registerDomEvent(
			window,
			"dblclick",
			this.tryOpenSelectedNodeLink.bind(this),
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				console.debug(
					"Layout changed, updating canvas node indicators...",
				);
				const canvasView = this.app.workspace.getLeavesOfType(
					"canvas",
				)[0]?.view as CanvasViewData | undefined;
				if (!canvasView) return;

				const canvas = canvasView.canvas;
				canvas.nodes.forEach((node: CanvasNodeData) => {
					updateCanvasNodeLinkLabel(node);
				});
			}),
		);

		this.registerEvent(
			this.app.workspace.on("canvas:node-menu", (menu, node) => {
				if (!isValidNodeType(node)) return;

				menu.addItem((item) => {
					item.setTitle("Set link")
						.setIcon("link")
						.onClick(() => {
							new EditLinkModal(this.app, node).open();
						});
				});

				const link = getNodeLink(node);
				if (link) {
					menu.addItem((item) => {
						item.setTitle("Open link")
							.setIcon("external-link")
							.onClick(() => {
								window.open(sanitizeLink(link));
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
					new EditLinkModal(this.app, node).open();
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
			window.open(sanitizeLink(link));
		}
	}

	getSelectedCanvasNode(): CanvasNodeData | null {
		const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
		if (canvasView?.getViewType() === "canvas") {
			const canvas = (canvasView as CanvasViewData).canvas;
			// Get all currently selected nodes
			const selection = Array.from(canvas.selection);

			if (selection.length !== 1) {
				return null;
			}
			const node = selection[0];
			return node || null;
		}
		return null;
	}
}

function updateCanvasNodeLinkLabel(node: CanvasNodeData, link?: string) {
	if (!link) {
		link = getNodeLink(node);
	}

	if (!node.containerEl) return;

	const nodeEl = node.containerEl.parentElement;
	if (!nodeEl) return;

	let indicatorEl = nodeEl.querySelector<HTMLElement>(".canvas-link-label");

	if (indicatorEl && (!link || link === "")) {
		indicatorEl.remove();
		return;
	}

	if (!indicatorEl) {
		indicatorEl = document.createElement("div");
		nodeEl.appendChild(indicatorEl);
	}
	indicatorEl.classList.add("canvas-link-label");
	indicatorEl.setText(link); // Or an icon/shortened URL

	// Style it to appear at the bottom
	Object.assign(indicatorEl.style, {
		position: "absolute",
		bottom: "-25px",
		left: "0%",
		fontSize: "var(--font-ui-medium)",
		color: "var(--canvas-card-label-color)",
		transform: "scale(var(--zoom-multiplier))",
		transformOrigin: "bottom left",
		whiteSpace: "nowrap",
	});
}

function isValidNodeType(node: unknown): node is CanvasNodeData {
	if (!node || typeof node !== "object") return false;
	const n = node as CanvasNodeData;
	return n.unknownData?.type === "file" || "file" in n;
}

function getNodeLink(node: CanvasNodeData): string {
	if ("unknownData" in node) {
		if ("link" in node.unknownData) {
			return node.unknownData.link || "";
		}
	}
	return "";
}

function sanitizeLink(link: string): string {
	if (/^[a-z][a-z0-9+.-]*:/i.test(link)) {
		return link;
	}
	return `https://${link}`;
}

class EditLinkModal extends Modal {
	constructor(app: App, node: CanvasNodeData) {
		super(app);
		this.setTitle("Set node link");
		this.modalEl.addClass("canvas-node-link-modal");

		let link = getNodeLink(node);

		const onSubmit = () => {
			this.close();
			node.setData({ link });
			updateCanvasNodeLinkLabel(node, link);
		};

		new Setting(this.contentEl).setName("Link").addText((text) => {
			text.setValue(link).onChange((value) => {
				link = value;
			});
			text.inputEl.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					onSubmit();
				}
			});
		});

		new Setting(this.contentEl).addButton((btn) =>
			btn.setButtonText("Submit").setCta().onClick(onSubmit),
		);
	}
}
