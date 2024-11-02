/**
 * Task 01: Iterates over an array with async/await
 * Processes all items in parallel using Promise.all
 * @param {Array} array - The array to iterate over
 * @returns {Promise<Array>} - Promise that resolves with processed values
 */
const iterateWithAsyncAwait = async (array) => {
  // Map each value to a promise that resolves after 1 second
  const promises = array.map(async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(value);
    return value;
  });
  // Wait for all promises to resolve in parallel
  return Promise.all(promises);
};

/**
 * Task 02 AND 03: Simulates an API call with timeout and error handling
 * @param {number} timeout - Maximum time to wait for response in milliseconds
 * @returns {Promise<any>} - Promise that resolves with API data
 */
const awaitCall = async (timeout = 1000) => {
  // Create a promise that rejects after timeout period
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeout)
  );

  try {
    // Simulate API call with random success/failure
    const apiPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.5;
        success
          ? resolve({ data: "API response data", timestamp: Date.now() })
          : reject(new Error("API request failed"));
      }, Math.random() * 1000);
    });

    // Race between API call and timeout
    const { data } = await Promise.race([apiPromise, timeoutPromise]);
    console.log("API Response:", data);
    return data;
  } catch ({ message }) {
    // Provide user-friendly error messages
    const errorMessage =
      message === "Request timed out"
        ? "Request took too long to respond"
        : "Unable to fetch data. Please try again later";
    console.log(`Friendly Error Message: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};

/**
 * Helper function to create a delay promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after specified delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Task 03: Chains multiple async functions sequentially
 * Demonstrates how to execute async operations in sequence
 */
const chainedAsyncFunctions = async () => {
  // Define tasks with their delays
  const tasks = [
    { name: "First", delay: 1000 },
    { name: "Second", delay: 1000 },
    { name: "Third", delay: 1000 },
  ];

  // Execute tasks sequentially using for...of
  for (const { name, delay: delayTime } of tasks) {
    await delay(delayTime);
    console.log(`${name} function completed`);
  }
};

/**
 * Task 04: Handles multiple concurrent requests with timeout
 * @param {number} timeout - Maximum time to wait for all requests
 * @returns {Promise<Object>} - Promise that resolves with combined results
 */
const concurrentRequests = async (timeout = 2000) => {
  // Helper function to create a delayed promise
  const createRequest = (name, delay) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(`${name} API Response`), delay)
    );

  // Create multiple concurrent requests
  const requests = {
    request1: createRequest("First", 1000),
    request2: createRequest("Second", 1000),
  };

  try {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Requests timed out")), timeout)
    );

    // Race between all requests completing and timeout
    const [result1, result2] = await Promise.race([
      Promise.all(Object.values(requests)),
      timeoutPromise,
    ]);

    const results = { result1, result2 };
    console.log("Combined Results:", results);
    return results;
  } catch ({ message }) {
    console.log("Error in concurrent requests:", message);
    throw new Error(message);
  }
};

/**
 * Task 05: Fetches data from multiple URLs in parallel with advanced error handling
 * @param {string[]} urls - Array of URLs to fetch from
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout for each request in ms
 * @param {number} options.retries - Number of retry attempts
 * @param {number} options.batchSize - Number of concurrent requests
 * @returns {Promise<Array>} - Promise that resolves with all responses
 */
const parallelCalls = async (
  urls,
  { timeout = 5000, retries = 3, batchSize = 5 } = {}
) => {
  /**
   * Helper function to fetch with timeout and retry logic
   * @param {string} url - URL to fetch
   * @param {number} attempt - Current attempt number
   */
  const fetchWithTimeout = async (url, attempt = 1) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      // Retry logic
      if (attempt < retries) {
        console.log(`Retrying ${url}, attempt ${attempt + 1}`);
        return fetchWithTimeout(url, attempt + 1);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    const results = [];
    // Process URLs in batches to avoid overwhelming the network
    for (const [i, batch] of [
      ...Array(Math.ceil(urls.length / batchSize)),
    ].entries()) {
      const currentBatch = urls.slice(i * batchSize, (i + 1) * batchSize);
      const batchResults = await Promise.all(
        currentBatch.map((url) => fetchWithTimeout(url))
      );
      results.push(...batchResults);
    }

    console.log("All responses:", results);
    return results;
  } catch ({ message }) {
    console.log("Error fetching data:", message);
    throw new Error(message);
  }
};

/**
 * Main function to run all examples
 * Demonstrates the usage of all async functions
 */
const runExamples = async () => {
  try {
    // Task 01: Demonstrate parallel iteration
    console.log("Task 01 - Iterating with Async/Await:");
    await iterateWithAsyncAwait([1, 2, 3, 4, 5]);

    // Task 02 & 03: Demonstrate API call with error handling
    console.log("\nTask 02 & 03 - Awaiting Call with Error Handling:");
    await awaitCall(2000);

    // Task 03: Demonstrate sequential async operations
    console.log("\nTask 03 - Chaining Async Functions:");
    await chainedAsyncFunctions();

    // Task 04: Demonstrate concurrent requests
    console.log("\nTask 04 - Concurrent Requests:");
    await concurrentRequests(3000);

    // Task 05: Demonstrate parallel API calls
    console.log("\nTask 05 - Parallel Calls:");
    const urls = [
      "https://dummyjson.com/recipes",
      "https://dummyjson.com/todos",
      "https://dummyjson.com/quotes",
    ];

    await parallelCalls(urls, {
      timeout: 3000,
      retries: 2,
      batchSize: 2,
    });
  } catch ({ message }) {
    console.error("Error in examples:", message);
  }
};

// Initialize the example execution
runExamples();
