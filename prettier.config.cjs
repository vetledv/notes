/** @type {import("prettier").Config} */
module.exports = {
	plugins: [require.resolve('@ianvs/prettier-plugin-sort-imports'), require.resolve('prettier-plugin-tailwindcss')],
	useTabs: true,
	jsxSingleQuote: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 120,
	bracketSameLine: true,
	semi: false,
	importOrder: [
		'^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
		'^(next/(.*)$)|^(next$)',
		'<THIRD_PARTY_MODULES>',
		'',
		'^types$',
		'^[./]',
		'^~/(.*)$'
	],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy']
}
