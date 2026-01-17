const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const isWatch = process.argv.includes("--watch");

/**
 * Plugin esbuild pour générer le HTML avec TypeScript
 */
const generateHtmlPlugin = {
	name: "generate-html",
	setup(build) {
		build.onEnd(async () => {
			try {
				const outputPath = path.join(__dirname, "dist/ui.html");
				const scssPath = path.join(__dirname, "src/ui/styles/ui.scss");

				// Lire/Compiler le CSS (SCSS si présent)
				let css = "";
				if (fs.existsSync(scssPath)) {
					try {
						const sass = require("sass");
						const result = sass.compile(scssPath, { style: "compressed" });
						css = result.css.toString ? result.css.toString() : result.css;
						console.log("✅ SCSS compiled successfully");
					} catch (err) {
						console.error("❌ SCSS compilation failed:", err?.message || err);
					}
				} else {
					console.warn(`⚠️ SCSS file not found: ${scssPath}`);
				}

				// Lire le JS compilé de l'UI
				const uiJsPath = path.join(__dirname, ".tmp/ui-bundle.js");
				const js = fs.existsSync(uiJsPath)
					? fs.readFileSync(uiJsPath, "utf8")
					: "";

				// Charger le module de génération HTML compilé
				const { HtmlBuilder } = require("./.tmp/ui/builders/HtmlBuilder.js");
				const { TABS } = require("./.tmp/ui/constants/index.js");

				// Générer le HTML
				const html = HtmlBuilder.buildFullHtml(TABS, css, js);

				// Écrire le fichier final
				fs.writeFileSync(outputPath, html, "utf8");

				// Copier manifest.json dans dist
				const manifestSrc = path.join(__dirname, "src/manifest.json");
				const manifestDest = path.join(__dirname, "dist/manifest.json");
				fs.copyFileSync(manifestSrc, manifestDest);

				// Nettoyer le dossier temporaire
				const tmpDir = path.join(__dirname, ".tmp");
				if (fs.existsSync(tmpDir)) {
					fs.rmSync(tmpDir, { recursive: true, force: true });
				}

				console.log("✅ UI HTML generated from TypeScript");
				console.log("✅ manifest.json copied to dist");
				console.log("✅ .tmp directory cleaned");
			} catch (error) {
				console.error("❌ Failed to generate HTML:", error);
			}
		});
	},
};

// Options de build pour le plugin principal
const pluginBuildOptions = {
	entryPoints: ["src/main/index.ts"],
	bundle: true,
	outfile: "dist/code.js",
	platform: "node",
	target: "es2017",
	logLevel: "info",
	external: [],
	minify: !isWatch,
	sourcemap: isWatch ? "inline" : false,
	format: "iife",
	define: {
		"process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
	},
};

// Options de build pour les modules UI (pour la génération HTML)
const uiModulesBuildOptions = {
	entryPoints: [
		"src/ui/types/index.ts",
		"src/ui/constants/index.ts",
		"src/ui/builders/HtmlBuilder.ts",
	],
	bundle: true,
	outdir: ".tmp/ui",
	platform: "node",
	target: "es2020",
	format: "cjs",
	logLevel: "info",
	splitting: false,
};

// Options de build pour le script UI (navigateur)
const uiBundleOptions = {
	entryPoints: ["src/ui/main.ts"],
	bundle: true,
	outfile: ".tmp/ui-bundle.js",
	platform: "browser",
	target: "es2020",
	logLevel: "info",
	minify: !isWatch,
	sourcemap: isWatch ? "inline" : false,
	format: "iife",
};

async function build() {
	try {
		if (isWatch) {
			// En mode watch, compiler tout et regarder les changements
			const pluginContext = await esbuild.context({
				...pluginBuildOptions,
				plugins: [generateHtmlPlugin],
			});
			const uiModulesContext = await esbuild.context(uiModulesBuildOptions);
			const uiBundleContext = await esbuild.context(uiBundleOptions);

			await Promise.all([
				pluginContext.watch(),
				uiModulesContext.watch(),
				uiBundleContext.watch(),
			]);

			console.log("👀 Watching for changes...");
		} else {
			// Build séquentiel pour la génération HTML
			console.log("🔨 Building UI modules...");
			await esbuild.build(uiModulesBuildOptions);

			console.log("🔨 Building UI bundle...");
			await esbuild.build(uiBundleOptions);

			console.log("🔨 Building plugin and generating HTML...");
			await esbuild.build({
				...pluginBuildOptions,
				plugins: [generateHtmlPlugin],
			});

			console.log("✅ Build completed successfully!");
		}
	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}

build();
