export function capitalizeFirstLetter(str: string): string {
	if (str.length === 0) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Split text into words regardless of format (spaces, snake_case, camelCase, kebab-case, UPPER_SNAKE_CASE, backslash-separated)
 */
export function splitWords(text: string): string[] {
	return text
		.replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase -> separate
		.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // PascalCase -> separate
		.replace(/[_\-\\\/]+/g, " ") // snake_case, kebab-case, backslash, forward slash -> spaces
		.split(/\s+/)
		.filter((word) => word.length > 0);
}

export function toPascalCase(text: string): string {
	return splitWords(text)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

export function toCamelCase(text: string): string {
	const words = splitWords(text);
	if (words.length === 0) return text;
	return words
		.map((word, i) => {
			if (i === 0) return word.toLowerCase();
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join("");
}

export function toSnakeCase(text: string): string {
	return splitWords(text).join("_").toLowerCase();
}

export function toUpperSnakeCase(text: string): string {
	return splitWords(text).join("_").toUpperCase();
}

export function toKebabCase(text: string): string {
	return splitWords(text).join("-").toLowerCase();
}

export function toNameSpaceCase(text: string): string {
	return splitWords(text)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("\\");
}

export function toPathCase(text: string): string {
	return splitWords(text).join("/").toLowerCase();
}
