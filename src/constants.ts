import packageJson from "../package.json";

/** Semver from package.json — single source of truth for the version string. */
export const VERSION: string = packageJson.version;

export const CHARACTER_LIMIT = 25000;

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const DEFAULT_OFFSET = 0;

export const MAX_TRAITS_PER_QUERY = 10;

export const RSID_PATTERN = /^rs\d+$/;

export const GENOTYPE_PATTERN = /^[ACGT]{2}$/i;

