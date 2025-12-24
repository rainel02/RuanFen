/// <reference types="vite/client" />

interface Window {
  VANTA: any
}

declare var VANTA: any;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly MODE: 'development' | 'production' | 'test'
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}