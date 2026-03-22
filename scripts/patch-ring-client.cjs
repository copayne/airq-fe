#!/usr/bin/env node
/**
 * Patches ring-client-api rest-client.js to fix TypeError when Ring API
 * returns non-JSON error responses (e.g., "406 Not Acceptable" as plain text).
 *
 * The library uses the 'in' operator on response.body which throws when
 * the body is a string instead of an object.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'ring-client-api', 'lib', 'rest-client.js');

if (!fs.existsSync(filePath)) {
  console.log('[patch-ring-client] ring-client-api not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf-8');
let patched = false;

// Patch 1: Fix 'error' in responseData (line ~253)
const bug1 = "responseError = 'error' in responseData && typeof responseData.error === 'string'";
const fix1 = "responseError = (typeof responseData === 'object' && responseData !== null && 'error' in responseData && typeof responseData.error === 'string')";
if (content.includes(bug1)) {
  content = content.replace(bug1, fix1);
  patched = true;
}

// Patch 2: Fix 'error_description' in responseData (line ~279)
const bug2 = "('error_description' in responseData &&";
const fix2 = "(typeof responseData === 'object' && responseData !== null && 'error_description' in responseData &&";
if (content.includes(bug2)) {
  content = content.replace(bug2, fix2);
  patched = true;
}

if (patched) {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('[patch-ring-client] Successfully patched rest-client.js');
} else {
  console.log('[patch-ring-client] Already patched or code structure changed, skipping');
}
