import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [{
    js: ['src/content/main.ts'],
    matches: ['https://*/*'],
  }],
  web_accessible_resources:[
    {
      resources: ['assets/*.js'],
      matches: ["<all_urls>"]
    }
  ],
  permissions: [
    'sidePanel',
    'contentSettings',
    'tabs'
  ],
  host_permissions: ["<all_urls>"],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
