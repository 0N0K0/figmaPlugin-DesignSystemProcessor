import { FigmaCollection, FigmaVariable } from '../types';
import { BASELINE_GRID, BASE_FONT_SIZE, SCOPES } from '../constants';
import { generateModeJson, generateVariable } from '../utils';

const modes = ['tight', 'compact', 'loose'];

// Échelles de typographie (multiplicateurs de BASE_FONT_SIZE)
const typographyScales = {
    body: { xs: 0.75, sm: 1, md: 1.25, lg: 2 },
    heading: { xs: 1.25, sm: 2, md: 3, lg: 4, xl: 5 }
};

// Génération des valeurs de typographie avec lineHeight calculée (arrondie au multiple de BASELINE_GRID supérieur)
const baseTypography: Record<string, Record<string, [number, number]>> = {};
for (const [category, sizes] of Object.entries(typographyScales)) {
    baseTypography[category] = {};
    for (const [size, fontScale] of Object.entries(sizes)) {
        const fontSize = BASE_FONT_SIZE * fontScale;
        const lineHeight = Math.ceil(fontSize / BASELINE_GRID) * BASELINE_GRID;
        baseTypography[category][size] = [fontSize, lineHeight];
    }
}

// Échelle d'espacement (multiplicateurs de BASELINE_GRID)
const baseSpacing = { '1:4': 1/4, '1:3': 1/3, '1:2': 1/2, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 };

const config = {
    tight: { 
        minHeight: BASELINE_GRID * 13,
        aliases: {
            maxTypography: 'sm',
            maxSpacing: 4
        }
    },
    compact: { 
        minHeight: BASELINE_GRID * 23,
        aliases: {
            maxTypography: 'md',
            maxSpacing: 6
        }
    },
    loose: { minHeight: BASELINE_GRID * 33, maxHeight: 9999, typography: baseTypography, spacing: baseSpacing },
};

const collection: Record<string, any> = {};

for (const [index, [mode, values]] of Object.entries(config).entries()) {
    collection[mode] = {
        height: { min: generateVariable('number', values.minHeight, [SCOPES.FLOAT.WIDTH_HEIGHT], true) },
        typography: { body: {}, heading: {} },
        spacing: {}
    };
    
    // Max Height
    const previousMode = modes[index - 1];
    if (previousMode) {
        const maxHeight = config[previousMode].minHeight - 1;
        collection[mode].height.max = generateVariable('number', maxHeight, [SCOPES.FLOAT.WIDTH_HEIGHT], true);
    }

    // Typography
    const sizeOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const maxTypoIndex = values.aliases?.maxTypography ? sizeOrder.indexOf(values.aliases.maxTypography) : -1;
    
    for (const [category, sizes] of Object.entries(baseTypography)) {
        for (const [size, [fontSize, lineHeight]] of Object.entries(sizes)) {
            const currentIndex = sizeOrder.indexOf(size);
            const shouldAlias = maxTypoIndex >= 0 && currentIndex > maxTypoIndex;
            
            if (shouldAlias) {
                const aliasTarget = values.aliases.maxTypography;
                collection[mode].typography[category][size] = {
                    fontSize: generateVariable('number', `{typography.${category}.${aliasTarget}.fontSize}`, [SCOPES.FLOAT.FONT_SIZE], false, `typography.${category}.${aliasTarget}.fontSize`, 'Vertical Density'),
                    lineHeight: generateVariable('number', `{typography.${category}.${aliasTarget}.lineHeight}`, [SCOPES.FLOAT.LINE_HEIGHT], false, `typography.${category}.${aliasTarget}.lineHeight`, 'Vertical Density')
                };
            } else {
                collection[mode].typography[category][size] = {
                    fontSize: generateVariable('number', fontSize, [SCOPES.FLOAT.FONT_SIZE]),
                    lineHeight: generateVariable('number', lineHeight, [SCOPES.FLOAT.LINE_HEIGHT])
                };
            }
        }
    }

    // Spacing
    const maxSpacing = values.aliases?.maxSpacing;
    
    for (const [key, multiplier] of Object.entries(baseSpacing)) {
        const numericValue = typeof multiplier === 'number' ? multiplier : parseFloat(key.split(':')[1]) / parseFloat(key.split(':')[0]);
        const shouldAlias = maxSpacing && numericValue > maxSpacing;
        
        if (shouldAlias) {
            const aliasTarget = maxSpacing.toString();
            collection[mode].spacing[key] = generateVariable('number', `{spacing.${aliasTarget}}`, [SCOPES.FLOAT.GAP], false, `spacing.${aliasTarget}`, 'Vertical Density');
        } else {
            collection[mode].spacing[key] = generateVariable('number', multiplier * BASELINE_GRID, [SCOPES.FLOAT.GAP]);
        }
    }
}

const variables: Record<string, string> = {};
modes.forEach(mode => {
    variables[mode] = generateModeJson(mode, collection[mode]);
});

export const verticalDensityCollection: FigmaCollection = {
    name: 'Vertical Density',
    modes: modes,
    variables: variables
};