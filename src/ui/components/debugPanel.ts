/**
 * Debug Panel pour afficher les logs
 */

export interface LogMessage {
	timestamp: number;
	level: "info" | "warn" | "error" | "debug";
	message: string;
	data?: any;
}

export class DebugPanel {
	private logs: LogMessage[] = [];
	private panel: HTMLElement | null = null;
	private isVisible = false;

	constructor() {
		this.createPanel();
		this.setupMessageListener();
	}

	private createPanel() {
		// Créer le panel
		this.panel = document.createElement("div");
		this.panel.id = "debug-panel";
		this.panel.className = "debug-panel hidden";

		// Header avec titre et boutons
		const header = document.createElement("div");
		header.className = "debug-panel-header";

		const title = document.createElement("h2");
		title.textContent = "Debug Logs";
		header.appendChild(title);

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "debug-panel-buttons";

		const clearBtn = document.createElement("button");
		clearBtn.innerHTML = '<i class="mdi mdi-refresh"></i>';
		clearBtn.className = "debug-btn icon-btn";
		clearBtn.onclick = () => this.clearLogs();
		buttonsContainer.appendChild(clearBtn);

		const closeBtn = document.createElement("button");
		closeBtn.innerHTML = '<i class="mdi mdi-close"></i>';
		closeBtn.className = "debug-btn icon-btn";
		closeBtn.onclick = () => this.hide();
		buttonsContainer.appendChild(closeBtn);

		header.appendChild(buttonsContainer);
		this.panel.appendChild(header);

		// Container pour les logs
		const logsContainer = document.createElement("div");
		logsContainer.id = "debug-logs-container";
		logsContainer.className = "debug-logs-container";
		this.panel.appendChild(logsContainer);

		// Ajouter au body
		document.body.appendChild(this.panel);
	}

	private setupMessageListener() {
		window.addEventListener("message", (event) => {
			const msg = event.data.pluginMessage;
			if (msg.type === "log") {
				this.addLog(msg.log);
			} else if (msg.type === "clearLogs") {
				this.clearLogs();
			}
		});
	}

	addLog(log: LogMessage) {
		this.logs.push(log);
		this.renderLog(log);
		this.scrollToBottom();
	}

	private renderLog(log: LogMessage) {
		const container = document.getElementById("debug-logs-container");
		if (!container) return;

		const logElement = document.createElement("div");
		logElement.className = `debug-log-entry debug-log-${log.level}`;

		const timestamp = new Date(log.timestamp).toLocaleTimeString();
		const icon = this.getIconForLevel(log.level);

		let content = `<div class="debug-log-time">${timestamp}</div> <span class="debug-log-icon">${icon}</span> <div><span class="debug-log-message">${this.escapeHtml(log.message)}</span></div>`;

		if (log.data !== undefined) {
			content += `<pre class="debug-log-data">${this.escapeHtml(JSON.stringify(log.data, null, 2))}</pre>`;
		}

		logElement.innerHTML = content;
		container.appendChild(logElement);
	}

	private getIconForLevel(level: string): string {
		const icons = {
			info: "ℹ️",
			warn: "⚠️",
			error: "❌",
			debug: "🔍",
		};
		return icons[level as keyof typeof icons] || "📝";
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	private scrollToBottom() {
		const container = document.getElementById("debug-logs-container");
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}

	clearLogs() {
		this.logs = [];
		const container = document.getElementById("debug-logs-container");
		if (container) {
			container.innerHTML = "";
		}
	}

	show() {
		if (this.panel) {
			this.panel.classList.remove("hidden");
			this.isVisible = true;
		}
	}

	hide() {
		if (this.panel) {
			this.panel.classList.add("hidden");
			this.isVisible = false;
		}
	}

	toggle() {
		if (this.isVisible) {
			this.hide();
		} else {
			this.show();
		}
	}
}

// Instance globale
export const debugPanel = new DebugPanel();
