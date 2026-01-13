/**
 * Access Control Utility (SPEC-DEBUG-001 TAG-003 TASK-005)
 *
 * Controls access to debug console based on environment
 * REQ-U-001: Debug Console is only accessible in development mode
 * REQ-W-001: System must not display Debug Console in production builds
 */

/**
 * Check if debug console is accessible
 * Uses import.meta.env.DEV which is true only in development mode
 */
export function isDebugConsoleAccessible(): boolean {
  // Vite provides import.meta.env.DEV which is true in development
  // This is automatically replaced during build
  return import.meta.env.DEV;
}

/**
 * Get debug console visibility
 * @returns true if debug console should be visible
 */
export function getDebugConsoleVisibility(): boolean {
  return isDebugConsoleAccessible();
}

/**
 * Assert that debug console is accessible (for development checks)
 * @throws Error if called in production
 */
export function assertDebugAccessible(): void {
  if (!isDebugConsoleAccessible()) {
    throw new Error('Debug Console is not accessible in production mode');
  }
}
