import { defineConfig } from 'eslint/config';
import grafanaConfig from '@grafana/eslint-config/flat.js';

export default defineConfig([
  ...grafanaConfig,

  {
    rules: {
      'react/prop-types': 'off',
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },

  {
    files: [
      'src/LoadElements/**/*.{ts,tsx}',
      'src/LoadCameras/**/*.{ts,tsx}',
      'src/LoadLights/**/*.{ts,tsx}',
      'src/Materials/**/*.{ts,tsx}',
      'src/scene3d.tsx',
    ],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },

  {
    files: ['tests/**/*'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]);
