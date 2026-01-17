import { converter, formatHex8 } from "culori";
import {
	SHADE_STEPS,
	OPACITIES_STEPS,
} from "../../common/constants/colorConstants";
import {
	generateGreyShades,
	generateShades,
} from "../../common/utils/colorUtils";
import type { SectionConfig, TabConfig } from "../types";

// Génération des options d'opacité
const opacityOptions = [];
for (const opacity of OPACITIES_STEPS) {
	opacityOptions.push({ value: opacity, label: String(opacity) });
}

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

const shadeOptions = [];
for (const shade of SHADE_STEPS) {
	shadeOptions.push({ value: shade, label: String(shade) });
}

/**
 * @TODO Optimiser la structure des sections et tabs
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
				colorCollection: {
					id: "brand",
					maxColors: 10,
					initialColors: [
						{ inputId: "brand01", label: "Core", defaultColor: "#0DB9F2" },
						{ inputId: "brand02", label: "Support", defaultColor: "#4DB2A1" },
						{ inputId: "brand03", label: "Accent", defaultColor: "#A68659" },
					],
				},
				inputs: [
					{
						id: "generate-brand-colors-btn",
						type: "button",
						label: "Generate Brand Colors",
						action: "generateBrandColors",
						class: "generate-btn",
					},
				],
			},
			{
				title: "Feedback",
				colorCollection: {
					id: "feedback",
					maxColors: 10,
					initialColors: [
						{ inputId: "feedback01", label: "Info", defaultColor: "#00b899" },
						{
							inputId: "feedback02",
							label: "Success",
							defaultColor: "#a9c800",
						},
						{
							inputId: "feedback03",
							label: "Warning",
							defaultColor: "#e87d00",
						},
						{ inputId: "feedback04", label: "Error", defaultColor: "#de3f26" },
					],
				},
				inputs: [
					{
						id: "generate-feedback-colors-btn",
						type: "button",
						label: "Generate Feedback Colors",
						action: "generateFeedbackColors",
						class: "generate-btn",
					},
				],
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
							{
								id: "neutralTextSecondaryOp",
								label: "Secondary",
								type: "customSelector",
								defaultValue: 700,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralTextDisabledOp",
								label: "Disabled",
								type: "customSelector",
								defaultValue: 300,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralTextHoveredOp",
								label: "Hovered",
								type: "customSelector",
								defaultValue: 400,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralTextSelectedOp",
								label: "Selected",
								type: "customSelector",
								defaultValue: 500,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralTextFocusedOp",
								label: "Focused",
								type: "customSelector",
								defaultValue: 500,
								options: neutralOpacityOptions,
							},
						],
					},
					{
						title: "Background opacities",
						inputs: [
							{
								id: "neutralBgActiveOp",
								label: "Active",
								type: "customSelector",
								defaultValue: 600,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralBgDisabledOp",
								label: "Disabled",
								type: "customSelector",
								defaultValue: 100,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralBgHoveredOp",
								label: "Hovered",
								type: "customSelector",
								defaultValue: 200,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralBgSelectedOp",
								label: "Selected",
								type: "customSelector",
								defaultValue: 300,
								options: neutralOpacityOptions,
							},
							{
								id: "neutralBgFocusedOp",
								label: "Focused",
								type: "customSelector",
								defaultValue: 300,
								options: neutralOpacityOptions,
							},
						],
					},
				],
				inputs: [
					{
						id: "generate-neutral-colors-btn",
						type: "button",
						label: "Generate Neutral Colors",
						action: "generateNeutralColors",
						class: "generate-btn",
					},
				],
			},

			{
				inputs: [
					{
						id: "generate-palettes-btn",
						type: "button",
						label: "Generate Palettes",
						action: "generatePalettes",
						class: "generate-btn",
					},
				],
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
					{
						id: "themeEnabledOp",
						label: "Enabled",
						type: "customSelector",
						defaultValue: 200,
						options: colorOpacityOptions,
					},
					{
						id: "themeDisabledOp",
						label: "Disabled",
						type: "customSelector",
						defaultValue: 100,
						options: colorOpacityOptions,
					},
					{
						id: "themeHoveredOp",
						label: "Hovered",
						type: "customSelector",
						defaultValue: 50,
						options: colorOpacityOptions,
					},
					{
						id: "themeSelectedOp",
						label: "Selected",
						type: "customSelector",
						defaultValue: 150,
						options: colorOpacityOptions,
					},
					{
						id: "themeFocusedOp",
						label: "Focused",
						type: "customSelector",
						defaultValue: 300,
						options: colorOpacityOptions,
					},
				],
			},
			{
				inputs: [
					{
						id: "themeBorderOp",
						label: "Border",
						type: "customSelector",
						defaultValue: 500,
						options: colorOpacityOptions,
					},
				],
			},
			{
				inputs: [
					{
						id: "generate-themes-btn",
						type: "button",
						label: "Generate Themes",
						action: "generateThemes",
						class: "generate-btn",
					},
				],
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
					{
						id: "minColumnWidth",
						label: "Min Column Width",
						type: "number",
						defaultValue: 96,
						min: 0,
					},
					{
						id: "gutter",
						label: "Gutter",
						type: "number",
						defaultValue: 16,
						min: 0,
					},
					{
						id: "horizontalBodyPadding",
						label: "Horizontal Body Padding",
						type: "number",
						defaultValue: 32,
						min: 0,
					},
					{
						id: "baselineGrid",
						label: "Baseline Grid",
						type: "number",
						defaultValue: 24,
						min: 0,
					},
					{
						id: "minViewportHeight",
						label: "Min Viewport Height",
						type: "number",
						defaultValue: 312,
						min: 0,
					},
				],
			},
			{
				title: "Content Settings",
				inputs: [
					{
						id: "horizontalMainPadding",
						label: "Horizontal Main Padding",
						type: "number",
						defaultValue: 0,
						min: 0,
					},
					{
						id: "maxContentHeight",
						label: "Max Content Height",
						type: "number",
						defaultValue: 1080,
						min: 0,
					},
					{
						id: "offsetHeight",
						label: "Offset Height",
						type: "number",
						defaultValue: 96,
						min: 0,
					},
				],
			},
			{
				inputs: [
					{
						id: "generate-layout-guide-btn",
						type: "button",
						label: "Generate Layout Guide",
						action: "generateLayoutGuide",
						class: "generate-btn",
					},
				],
			},
		],
	},
	{
		id: "radius",
		title: "Radius",
		sections: [
			{
				inputs: [
					{
						id: "radiusXS",
						label: "xs",
						type: "number",
						defaultValue: 2,
						min: 0,
					},

					{
						id: "radiusSM",
						label: "sm",
						type: "number",
						defaultValue: 4,
						min: 0,
					},
					{
						id: "radiusMD",
						label: "md",
						type: "number",
						defaultValue: 8,
						min: 0,
					},
					{
						id: "radiusLG",
						label: "lg",
						type: "number",
						defaultValue: 16,
						min: 0,
					},
					{
						id: "radiusXL",
						label: "xl",
						type: "number",
						defaultValue: 24,
						min: 0,
					},
					{
						id: "radius2XL",
						label: "2xl",
						type: "number",
						defaultValue: 32,
						min: 0,
					},
					{
						id: "generate-radius-btn",
						type: "button",
						label: "Generate Radius",
						action: "generateRadius",
						class: "generate-btn",
					},
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
					{
						id: "baseFontSize",
						label: "Base Font Size",
						type: "number",
						defaultValue: 16,
						min: 8,
						max: 32,
					},
					{
						id: "generate-font-sizes-btn",
						type: "button",
						label: "Generate Font Sizes",
						action: "generateFontSizes",
						class: "generate-btn",
					},
				],
			},
			{
				title: "Font Families",
				inputs: [
					{
						id: "bodyFontFamily",
						label: "Body",
						type: "text",
						defaultValue: "Roboto",
					},
					{
						id: "metaFontFamily",
						label: "Meta",
						type: "text",
						defaultValue: "Roboto",
					},
					{
						id: "interfaceFontFamily",
						label: "Interface",
						type: "text",
						defaultValue: "Roboto Condensed",
					},
					{
						id: "accentFontFamily",
						label: "Accent",
						type: "text",
						defaultValue: "Parisienne",
					},
					{
						id: "techFontFamily",
						label: "Tech",
						type: "text",
						defaultValue: "Roboto Mono",
					},
					{
						id: "generate-font-families-btn",
						type: "button",
						label: "Generate Font Families",
						action: "generateFontFamilies",
						class: "generate-btn",
					},
				],
			},
			{
				inputs: [
					{
						id: "generate-typography-btn",
						type: "button",
						label: "Generate Typography",
						action: "generateTypography",
						class: "generate-btn",
					},
				],
			},
		],
	},
	{
		id: "datas",
		title: "Datas",
		sections: [
			{
				inputs: [
					{
						id: "textDatasFile",
						label: "Text",
						type: "file",
						accept: "application/json",
						multiple: true,
						fileList: true,
					},
					{
						id: "generate-text-datas-btn",
						type: "button",
						label: "Generate Text Datas",
						action: "generateTextDatas",
						class: "generate-btn",
					},
				],
			},
			{
				inputs: [
					{
						id: "imagesDatasFile",
						label: "Images",
						type: "file",
						accept: "image/*",
						multiple: true,
						fileList: true,
						imagePreview: true,
					},
					{
						id: "generate-images-datas-btn",
						type: "button",
						label: "Generate Images Datas",
						action: "generateImagesDatas",
						class: "generate-btn",
					},
				],
			},
			{
				inputs: [
					{
						id: "generate-datas-btn",
						type: "button",
						label: "Generate Datas",
						action: "generateDatas",
						class: "generate-btn",
					},
				],
			},
		],
	},
	{
		id: "effects",
		title: "Effects",
		sections: [
			{
				inputs: [
					{
						id: "generate-elevations-btn",
						type: "button",
						label: "Generate Elevations Effects",
						action: "generateElevations",
						class: "generate-btn",
					},
				],
			},
		],
	},
];

// Rétro-compatibilité: exporter les sections à plat
export const SECTIONS: SectionConfig[] = TABS.flatMap((tab) => tab.sections);
