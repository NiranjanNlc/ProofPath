import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Dependency rule (spec.md > Components): domain imports nothing outside itself;
// content/persistence adapters import only domain; ui imports domain and the ports only.
const restrict = (patterns, message) => ({
  'no-restricted-imports': ['error', { patterns: [{ group: patterns, message }] }],
});

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    files: ['src/domain/**'],
    rules: restrict(
      ['react', 'react-dom/*', '**/content/*', '**/persistence/*', '**/ui/*', '**/app/*'],
      'domain must stay pure: it imports nothing outside domain/.',
    ),
  },
  {
    files: ['src/content/**', 'src/persistence/**'],
    rules: restrict(['react', '**/ui/*', '**/app/*'], 'adapters may import only domain/.'),
  },
  {
    files: ['src/ui/**'],
    rules: restrict(
      [
        '**/content/static*',
        '**/content/topics/*',
        '**/persistence/localStorage*',
        '**/persistence/memory*',
        '**/app/*',
      ],
      'ui depends on ports only; concrete adapters are wired in app/compositionRoot.ts.',
    ),
  },
  { files: ['*.config.{js,ts}'], languageOptions: { globals: globals.node } },
);
