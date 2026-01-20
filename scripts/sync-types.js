#!/usr/bin/env node
/* global console, process */

/**
 * Script to sync SDK types from node_modules to public folder
 * This ensures types are always up-to-date with the installed package version
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const require = createRequire(import.meta.url);

const SDK_PACKAGE = "@salla.sa/embedded-sdk";
const TYPES_DEST = "public/types/salla-embedded-sdk.d.ts";

try {
  const nodeModulesPath = join(rootDir, "node_modules");
  let packagePath;

  // First try pnpm structure (most common)
  const pnpmPath = join(nodeModulesPath, ".pnpm");
  if (existsSync(pnpmPath)) {
    const entries = readdirSync(pnpmPath);
    const packageNameEscaped = SDK_PACKAGE.replace(/\//g, "+");
    // Collect all matching packages and find the one with types file
    const candidates = [];
    for (const entry of entries) {
      if (entry.startsWith(packageNameEscaped + "@")) {
        const candidatePath = join(
          pnpmPath,
          entry,
          "node_modules",
          SDK_PACKAGE,
          "package.json",
        );
        if (existsSync(candidatePath)) {
          candidates.push(candidatePath);
        }
      }
    }
    // Try each candidate and use the first one that has a types file
    for (const candidatePath of candidates) {
      const packageJson = JSON.parse(readFileSync(candidatePath, "utf-8"));
      const packageDir = dirname(candidatePath);
      let typesPath = packageJson.types || packageJson.typings;
      if (!typesPath && packageJson.exports && packageJson.exports["."]) {
        typesPath = packageJson.exports["."].types;
      }
      if (typesPath) {
        const typesSourcePath = resolve(packageDir, typesPath);
        if (existsSync(typesSourcePath)) {
          packagePath = candidatePath;
          break;
        }
      }
    }
    // If no package with types found, use the last one (likely the latest version)
    if (!packagePath && candidates.length > 0) {
      packagePath = candidates[candidates.length - 1];
    }
  }

  // Fallback to standard node_modules structure
  if (!packagePath) {
    packagePath = join(nodeModulesPath, SDK_PACKAGE, "package.json");
    if (!existsSync(packagePath)) {
      // Try require.resolve as last resort
      try {
        packagePath = require.resolve(`${SDK_PACKAGE}/package.json`);
      } catch (e) {
        // Ignore
      }
    }
  }

  if (!existsSync(packagePath)) {
    throw new Error(`Could not find ${SDK_PACKAGE} package.json`);
  }

  // Read package.json to find types path
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  const packageDir = dirname(packagePath);

  // Get types path from package.json
  let typesPath = packageJson.types || packageJson.typings;
  if (!typesPath && packageJson.exports && packageJson.exports["."]) {
    typesPath = packageJson.exports["."].types;
  }

  if (!typesPath) {
    throw new Error(`No types field found in ${SDK_PACKAGE} package.json`);
  }

  // Resolve types file path relative to package directory
  const typesSourcePath = resolve(packageDir, typesPath);

  if (!existsSync(typesSourcePath)) {
    // Types file doesn't exist in package - check if we have a cached version
    const destPath = join(rootDir, TYPES_DEST);
    if (existsSync(destPath)) {
      console.log(
        `⚠ Types file not found in package, using existing cached version at ${TYPES_DEST}`,
      );
      console.log(
        `  If you need to update types, ensure ${SDK_PACKAGE} includes dist/types/index.d.ts`,
      );
      process.exit(0);
    } else {
      throw new Error(
        `Types file not found at ${typesSourcePath} and no cached version exists`,
      );
    }
  }

  // Read the types file
  const typesContent = readFileSync(typesSourcePath, "utf-8");

  // Ensure destination directory exists
  const destDir = join(rootDir, dirname(TYPES_DEST));
  mkdirSync(destDir, { recursive: true });

  // Write to public folder
  const destPath = join(rootDir, TYPES_DEST);
  writeFileSync(destPath, typesContent, "utf-8");

  console.log(`✓ Synced types from ${SDK_PACKAGE} to ${TYPES_DEST}`);
} catch (error) {
  console.error(`✗ Failed to sync types: ${error.message}`);
  // Don't exit with error if types file already exists (allows builds to continue)
  const destPath = join(rootDir, TYPES_DEST);
  if (existsSync(destPath)) {
    console.log(`  Continuing with existing types file at ${TYPES_DEST}`);
    process.exit(0);
  }
  process.exit(1);
}
