import { defineConfig, globalIgnores } from 'eslint/config';
import grafanaConfig from '@grafana/eslint-config/flat.js';

export default defineConfig([
  globalIgnores(['dist/']),

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
      'src/Controls/Mapcontols.tsx',
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
    files: [
      'src/Animations/element_step_anim_thresholds.tsx',
      'src/Animations/set_*_init_data.tsx',
      'src/Animations/useSubElementColorAnimations.ts',
      'src/LoadElements/loadModelTypes.ts',
      'src/loadtextures/textures_init_data.tsx',
      'src/subanimthresholds.tsx',
    ],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },

  {
    files: ['src/Controls/Mapcontols.tsx'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  {
    files: ['tests/**/*'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]);
