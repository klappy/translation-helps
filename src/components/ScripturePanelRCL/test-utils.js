export const TEST_TIMEOUT = 5000;

export const waitForOptions = { timeout: TEST_TIMEOUT };
export const slowWaitForOptions = { timeout: TEST_TIMEOUT * 2 };

export async function testCleanup() {
  // No cleanup needed for now; placeholder function.
}
