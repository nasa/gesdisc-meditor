import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target'

export const config: Config = {
  namespace: 'jsoneditor',
  taskQueue: 'async',
  outputTargets: [
    reactOutputTarget({
      componentCorePackage: 'codeeditor',
      proxiesFile: '../codeeditor-react/src/components.ts'
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};
