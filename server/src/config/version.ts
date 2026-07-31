import { readFileSync } from 'node:fs'

interface PackageJson {
  version?: string
}

const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as PackageJson

/** Application version sourced from the server package.json. */
export const APP_VERSION = packageJson.version ?? '0.0.0'
