import { converter, formatHex8 } from "culori";
import {
	SHADE_STEPS,
	OPACITIES_STEPS,
} from "../../common/constants/colorConstants";
import {
	generateGreyShades,
	generateShades,
} from "../../common/utils/colorUtils";
import type { SectionConfig, TabConfig, InputConfig } from "../types";
import { toCamelCase, toKebabCase } from "../../common/utils/textUtils";

// Générer les options d'opacité avec color indicators
const neutralOpacityOptions = OPACITIES_STEPS.map((opacity) => {
	// Gris avec luminosité 50
	const greyShade = generateGreyShades(SHADE_STEPS)[50];
	const greyShadeRGB = converter("rgb")(greyShade);
	if (!greyShadeRGB) {
		return { value: opacity, label: String(opacity) };
	} else {
		greyShadeRGB.alpha = opacity / 1000;
		return {
			value: opacity,
			label: String(opacity),
			color: formatHex8(greyShadeRGB),
		};
	}
});
const colorOpacityOptions = OPACITIES_STEPS.map((opacity) => {
	const shade =
		generateShades("#0DB9F2").find((s) => s.step === 300)?.color || "#0DB9F2";
	const shadeRGB = converter("rgb")(shade);
	if (!shadeRGB) {
		return { value: opacity, label: String(opacity) };
	}
	shadeRGB.alpha = opacity / 1000;
	return {
		value: opacity,
		label: String(opacity),
		color: formatHex8(shadeRGB),
	};
});

/**
 * Helper functions for creating common configuration objects
 */

// Generate button factory
const btn = (label: string): InputConfig => {
	return {
		id: `${toKebabCase(label)}-btn`,
		type: "button",
		label,
		action: toCamelCase(label),
		class: "generate-btn",
	};
};

// Number input factory
const numInput = (
	id: string,
	label: string,
	defaultValue: number,
	min = 0,
	max?: number,
): InputConfig => ({
	id,
	label,
	type: "number",
	defaultValue,
	min,
	...(max !== undefined && { max }),
});

// Text input factory
const textInput = (
	id: string,
	label: string,
	defaultValue: string,
): InputConfig => ({
	id,
	label,
	type: "text",
	defaultValue,
});

// Custom selector factory
const selector = (
	id: string,
	label: string,
	defaultValue: number,
	options: typeof neutralOpacityOptions | typeof colorOpacityOptions,
): InputConfig => ({
	id,
	label,
	type: "customSelector",
	defaultValue,
	options,
});

// File input factory
const fileInput = (
	id: string,
	label: string,
	accept: string,
	imagePreview = false,
): InputConfig => ({
	id,
	label,
	type: "file",
	accept,
	multiple: true,
	fileList: true,
	...(imagePreview && { imagePreview }),
});

// Color collection factory
const colorCollection = (
	id: string,
	maxColors: number,
	initialColors: Array<{
		inputId: string;
		label: string;
		defaultColor: string;
	}>,
) => ({
	id,
	maxColors,
	initialColors,
});

/**
 * Tab configurations
 */

export const TABS: TabConfig[] = [
	{
		id: "palette",
		title: "Palette",
		sections: [
			{
				title: "Palette Generator",
				paletteGenerator: true,
			},
			{
				title: "Brand",
				colorCollection: colorCollection("brand", 10, [
					{ inputId: "brand01", label: "Core", defaultColor: "#0DB9F2" },
					{ inputId: "brand02", label: "Support", defaultColor: "#4DB2A1" },
					{ inputId: "brand03", label: "Accent", defaultColor: "#A68659" },
				]),
				inputs: [btn("Generate Brand Colors")],
			},
			{
				title: "Feedback",
				colorCollection: colorCollection("feedback", 10, [
					{ inputId: "feedback01", label: "Info", defaultColor: "#00b899" },
					{ inputId: "feedback02", label: "Success", defaultColor: "#a9c800" },
					{ inputId: "feedback03", label: "Warning", defaultColor: "#e87d00" },
					{ inputId: "feedback04", label: "Error", defaultColor: "#de3f26" },
				]),
				inputs: [btn("Generate Feedback Colors")],
			},
			{
				title: "Neutral",
				subsections: [
					{
						colorSelectors: [
							{ inputId: "greyHue", label: "Grey Hue", editableLabel: false },
						],
					},
					{
						title: "Text opacities",
						inputs: [
							selector(
								"neutralTextSecondaryOp",
								"Secondary",
								700,
								neutralOpacityOptions,
							),
							selector(
								"neutralTextDisabledOp",
								"Disabled",
								300,
								neutralOpacityOptions,
							),
							selector(
								"neutralTextHoveredOp",
								"Hovered",
								400,
								neutralOpacityOptions,
							),
							selector(
								"neutralTextSelectedOp",
								"Selected",
								500,
								neutralOpacityOptions,
							),
							selector(
								"neutralTextFocusedOp",
								"Focused",
								500,
								neutralOpacityOptions,
							),
						],
					},
					{
						title: "Background opacities",
						inputs: [
							selector(
								"neutralBgActiveOp",
								"Active",
								600,
								neutralOpacityOptions,
							),
							selector(
								"neutralBgDisabledOp",
								"Disabled",
								100,
								neutralOpacityOptions,
							),
							selector(
								"neutralBgHoveredOp",
								"Hovered",
								200,
								neutralOpacityOptions,
							),
							selector(
								"neutralBgSelectedOp",
								"Selected",
								300,
								neutralOpacityOptions,
							),
							selector(
								"neutralBgFocusedOp",
								"Focused",
								300,
								neutralOpacityOptions,
							),
						],
					},
				],
				inputs: [btn("Generate Neutral Colors")],
			},

			{
				inputs: [btn("Generate Palettes")],
			},
		],
	},
	{
		id: "themes",
		title: "Themes",
		sections: [
			{
				title: "Themes Background Opacities",
				inputs: [
					selector("themeEnabledOp", "Enabled", 200, colorOpacityOptions),
					selector("themeDisabledOp", "Disabled", 100, colorOpacityOptions),
					selector("themeHoveredOp", "Hovered", 50, colorOpacityOptions),
					selector("themeSelectedOp", "Selected", 150, colorOpacityOptions),
					selector("themeFocusedOp", "Focused", 300, colorOpacityOptions),
				],
			},
			{
				inputs: [selector("themeBorderOp", "Border", 500, colorOpacityOptions)],
			},
			{
				inputs: [btn("Generate Themes")],
			},
		],
	},
	{
		id: "layout",
		title: "Layout guide",
		sections: [
			{
				title: "Grid Settings",
				inputs: [
					numInput("minColumnWidth", "Min Column Width", 96),
					numInput("gutter", "Gutter", 16),
					numInput("horizontalBodyPadding", "Horizontal Body Padding", 32),
					numInput("baselineGrid", "Baseline Grid", 24),
					numInput("minViewportHeight", "Min Viewport Height", 312),
				],
			},
			{
				title: "Content Settings",
				inputs: [
					numInput("horizontalMainPadding", "Horizontal Main Padding", 0),
					numInput("maxContentHeight", "Max Content Height", 1080),
					numInput("offsetHeight", "Offset Height", 96),
				],
			},
			{
				inputs: [btn("Generate Layout Guide")],
			},
		],
	},
	{
		id: "radius",
		title: "Radius",
		sections: [
			{
				inputs: [
					numInput("radiusXS", "xs", 2),
					numInput("radiusSM", "sm", 4),
					numInput("radiusMD", "md", 8),
					numInput("radiusLG", "lg", 16),
					numInput("radiusXL", "xl", 24),
					numInput("radius2XL", "2xl", 32),
					btn("Generate Radius"),
				],
			},
		],
	},
	{
		id: "typography",
		title: "Typography",
		sections: [
			{
				inputs: [
					numInput("baseFontSize", "Base Font Size", 16, 8, 32),
					btn("Generate Font Sizes"),
				],
			},
			{
				title: "Font Families",
				inputs: [
					textInput("bodyFontFamily", "Body", "Roboto"),
					textInput("metaFontFamily", "Meta", "Roboto"),
					textInput("interfaceFontFamily", "Interface", "Roboto Condensed"),
					textInput("accentFontFamily", "Accent", "Parisienne"),
					textInput("techFontFamily", "Tech", "Roboto Mono"),
					btn("Generate Font Families"),
				],
			},
			{
				inputs: [btn("Generate Typography")],
			},
		],
	},
	{
		id: "datas",
		title: "Datas",
		sections: [
			{
				inputs: [
					fileInput("textDatasFile", "Text", "application/json"),
					btn("Generate Text Datas"),
				],
			},
			{
				inputs: [
					fileInput("imagesDatasFile", "Images", "image/*", true),
					btn("Generate Images Datas"),
				],
			},
			{
				inputs: [btn("Generate Datas")],
			},
		],
	},
	{
		id: "effects",
		title: "Effects",
		sections: [
			{
				inputs: [btn("Generate Elevations Effects")],
			},
		],
	},
];

// Rétro-compatibilité: exporter les sections à plat
export const SECTIONS: SectionConfig[] = TABS.flatMap((tab) => tab.sections);
