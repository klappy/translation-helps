/**
 * Test script to verify chat endpoint with proper payload
 */

const http = require("http");

async function testChatEndpoint() {
  const testPayload = {
    message: "What is this verse about?",
    context: {
      reference: {
        book: "gen",
        chapter: 1,
        verse: 1,
        organization: "unfoldingWord",
        language: "en",
        citation: "gen 1:1",
      },
      resources: {
        scripture: "In the beginning God created the heavens and the earth.",
        translationNotes: [
          {
            id: 1,
            quote: "In the beginning",
            text: "This refers to the absolute beginning of time and creation.",
            occurrence: "1",
            tags: "",
            supportReference: "",
            reference: "1:1",
          },
        ],
        translationQuestions: [],
        translationWords: [],
        translationWordLinks: [],
      },
      metadata: {
        timestamp: new Date().toISOString(),
        contextSize: 0,
      },
    },
    chatHistory: [],
    timestamp: new Date().toISOString(),
  };

  const postData = JSON.stringify(testPayload);

  const options = {
    hostname: "localhost",
    port: 5174,
    path: "/.netlify/functions/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
    timeout: 10000,
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("🧪 Testing Chat Endpoint with Real Payload...\n");

  try {
    const result = await testChatEndpoint();
    console.log(`Status: ${result.status}`);
    console.log(`Success: ${result.status === 200 ? "✅" : "❌"}`);

    if (result.body.error) {
      console.log(`Error: ${result.body.error}`);
      if (result.body.details) {
        console.log(`Details: ${result.body.details}`);
      }
    } else if (result.body.response) {
      console.log(`Response: ${result.body.response.substring(0, 200)}...`);
      console.log(`Metadata: ${JSON.stringify(result.body.metadata, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  console.log("\n🏁 Test completed!");
}

main().catch(console.error);
