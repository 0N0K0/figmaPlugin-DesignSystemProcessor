import {
	capitalizeFirstLetter,
	splitWords,
	toCamelCase,
	toPascalCase,
} from "../../common/utils/textUtils";
import { FormData, getFormData } from "../utils/formData";

// List of button IDs corresponding to different actions
const btns = [
	"brand-colors",
	"feedback-colors",
	"neutral-colors",
	"palettes",
	"themes",
	"layout-guide",
	"radius",
	"font-sizes",
	"font-families",
	"typography",
	"text-datas",
	"images-datas",
	"datas",
	"elevations-effects",
	"all",
];

// Helper function to manage colors for a specific color family
function manageColors(
	colorFamily: string,
	formData: FormData,
): Record<string, string> {
	const colors: Record<string, string> = {};
	Object.entries(formData).forEach(([key, value]) => {
		if (
			key.startsWith(colorFamily) &&
			!key.endsWith("-label") &&
			typeof value === "string" &&
			value.startsWith("#")
		) {
			const labelKey = `${key}-label`;
			const colorName = formData[labelKey] || key;
			if (
				colorName &&
				typeof colorName === "string" &&
				colorName.trim() !== ""
			) {
				colors[colorName.trim()] = value;
			}
		}
	});
	return colors;
}

function manageCoreThemes(
	colorFamily: string,
	formData: FormData,
): Record<string, Record<string, number>> {
	const coreThemes: Record<string, Record<string, number>> = {};
	Object.entries(formData).forEach(([key, value]) => {
		if (
			key.startsWith(colorFamily) &&
			(key.endsWith("-light") ||
				key.endsWith("-main") ||
				key.endsWith("-dark")) &&
			typeof value === "number"
		) {
			const labelKey = `${key}-label`;
			const colorName = formData[labelKey] || key;
			if (
				colorName &&
				typeof colorName === "string" &&
				colorName.trim() !== ""
			) {
				const [_, shadeName] = splitWords(key);
				const colorCCName = toCamelCase(colorName);
				if (!coreThemes[colorCCName]) coreThemes[colorCCName] = {};
				coreThemes[colorCCName][toCamelCase(shadeName)] = value;
			}
		}
	});
	return coreThemes;
}

export function attachButtonListeners() {
	// Attach handlers for all buttons using the map
	btns.forEach((key) => {
		const btn = document.getElementById(`generate-${key}-btn`);
		if (btn) {
			btn.addEventListener("click", async () => {
				const formData = getFormData();

				// Handle Color Families
				const colorsData: Record<string, Record<string, string>> = {};
				for (const colorFamily of ["brand", "feedback"]) {
					colorsData[colorFamily] = manageColors(colorFamily, formData);
				}

				// Handle Neutral Colors
				const neutralColors: Record<string, number | Record<string, number>> = {
					greyHue: formData["greyHue"] as number,
				};
				for (const [property, keys] of Object.entries({
					Text: ["Secondary", "Disabled", "Hovered", "Selected", "Focused"],
					Background: ["Disabled", "Hovered", "Selected", "Focused"],
				})) {
					for (const key of keys) {
						if (!neutralColors[property]) neutralColors[property] = {};
						(neutralColors[property] as Record<string, number>)[key] = formData[
							`neutral${property}${key}Op`
						] as number;
					}
				}

				// Handle Themes
				const themes: Record<string, string> = {};
				for (const key of [
					"Enabled",
					"Disabled",
					"Hovered",
					"Selected",
					"Focused",
					"Border",
				]) {
					themes[key.toLowerCase()] = formData[`theme${key}Op`] as string;
				}
				const brandCoreThemes = manageCoreThemes("brand", formData);
				const feedbackCoreThemes = manageCoreThemes("feedback", formData);

				// Handle Layout Guide
				const layoutGuide: Record<string, string> = {};
				for (const key of [
					"minColumnWidth",
					"gutter",
					"horizontalBodyPadding",
					"baselineGrid",
					"minViewportHeight",
					"horizontalMainPadding",
					"maxContentHeight",
					"offsetHeight",
				]) {
					layoutGuide[key] = formData[key] as string;
				}

				// Handle Radius
				const radius: Record<string, string> = {};
				for (const key of ["XS", "SM", "MD", "LG", "XL", "2XL"]) {
					radius[key] = formData[`radius${key}`] as string;
				}

				// Handle Typography
				const baseFontSize = formData["baseFontSize"] as number;
				const fontFamilies: Record<string, string> = {};
				for (const key of ["body", "meta", "interface", "accent", "tech"]) {
					fontFamilies[key] = formData[`${key}FontFamily`] as string;
				}

				// Handle Text Datas
				let textDatasList: Record<string, any>[] = [];
				const textDatasFiles = formData["textDatasFile"] as unknown as
					| FileList
					| File
					| undefined;
				if (textDatasFiles) {
					try {
						const filesToProcess =
							textDatasFiles instanceof FileList
								? Array.prototype.slice.call(textDatasFiles)
								: [textDatasFiles];

						for (const file of filesToProcess) {
							const jsonText = await file.text();
							const textData = JSON.parse(jsonText);
							textDatasList.push(textData);
						}
					} catch (error) {
						console.error("Failed to parse JSON file:", error);
					}
				}

				// Handle Images Datas
				let imagesDatasList: Array<{ name: string; data: ArrayBuffer }> = [];
				const imagesDatasFiles = formData["imagesDatasFile"] as unknown as
					| FileList
					| File
					| undefined;
				if (imagesDatasFiles) {
					try {
						const filesToProcess =
							imagesDatasFiles instanceof FileList
								? Array.prototype.slice.call(imagesDatasFiles)
								: [imagesDatasFiles];

						for (const file of filesToProcess) {
							const arrayBuffer = await file.arrayBuffer();
							imagesDatasList.push({
								name: file.name,
								data: arrayBuffer,
							});
						}
					} catch (error) {
						console.error("Failed to process image files:", error);
					}
				}

				// Send message to plugin
				parent.postMessage(
					{
						pluginMessage: {
							type: `generate${toPascalCase(key)}`,
							datas: {
								colorsData,
								neutralColors,
								themes,
								brandCoreThemes,
								feedbackCoreThemes,
								layoutGuide,
								radius,
								baseFontSize,
								fontFamilies,
								textDatasList,
								imagesDatasList,
							},
						},
					},
					"*",
				);
			});
		}
	});
}
