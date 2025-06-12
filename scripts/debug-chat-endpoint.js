/**
 * Debug script to test chat endpoint accessibility
 * Run this with: node debug-chat-endpoint.js
 */

const https = require("https");
const http = require("http");

const testEndpoints = [
  "http://localhost:5174/.netlify/functions/chat",
  "http://localhost:7000/chat",
  "http://localhost:5174/api/chat",
  "http://localhost:5173/.netlify/functions/chat",
];

async function testEndpoint(url, method = "GET") {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    };

    if (method === "POST") {
      options.headers["Content-Length"] = "2";
    }

    const req = client.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          url,
          method,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200), // First 200 chars
          success: res.statusCode < 500,
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        url,
        method,
        status: "ERROR",
        error: err.message,
        success: false,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        url,
        method,
        status: "TIMEOUT",
        error: "Request timed out",
        success: false,
      });
    });

    if (method === "POST") {
      req.write("{}");
    }

    req.end();
  });
}

async function main() {
  console.log("🔍 Testing Chat Endpoint Accessibility...\n");

  // Test GET requests first (should return 405 Method Not Allowed for our function)
  console.log("📡 Testing GET requests (expecting 405 Method Not Allowed):");
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint, "GET");
    console.log(`  ${result.url}`);
    console.log(`    Status: ${result.status}`);
    console.log(`    Success: ${result.success ? "✅" : "❌"}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    } else if (result.body) {
      console.log(`    Body: ${result.body}`);
    }
    console.log("");
  }

  console.log("\n📨 Testing POST requests (expecting 400/500 without proper body):");
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint, "POST");
    console.log(`  ${result.url}`);
    console.log(`    Status: ${result.status}`);
    console.log(`    Success: ${result.success ? "✅" : "❌"}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    } else if (result.body) {
      console.log(`    Body: ${result.body}`);
    }
    console.log("");
  }

  console.log("🏁 Test completed!");
  console.log("\n💡 Expected results:");
  console.log(
    "  - Working endpoint should return 405 for GET and 400/500 for POST with empty body"
  );
  console.log("  - 404 means the endpoint is not found");
  console.log("  - Connection errors mean the server is not running on that port");
}

main().catch(console.error);
