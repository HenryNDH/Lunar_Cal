const http = require("http");
const url = require("url");
const moonTime = require("moon-time");
const cors = require("cors"); // Import CORS package

const PORT = process.env.PORT || 8080;

/**
 * Sends a JSON response with the given status code and data.
 * @param {http.ServerResponse} res - The HTTP response object.
 * @param {number} statusCode - The HTTP status code to send.
 * @param {object} data - The data object to send as JSON.
 */
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow all origins
    "Access-Control-Allow-Methods": "POST", // Only POST is supported
    "Access-Control-Allow-Headers": "Content-Type", // Allow Content-Type header
  });
  res.end(JSON.stringify(data));
}

/**
 * Handles the /convert-solar-to-lunar endpoint.
 * Converts a Gregorian (solar) date to its moon-time equivalent.
 * @param {object} data - The parsed request body containing year, month, day.
 * @param {http.ServerResponse} res - The HTTP response object.
 */
function handleSolarToLunarConversion(data, res) {
  const { year, month, day } = data;

  // Validate input types
  if (
    typeof year !== "number" ||
    typeof month !== "number" ||
    typeof day !== "number"
  ) {
    sendJsonResponse(res, 400, {
      error: "Invalid input. Please provide year, month, and day as numbers.",
    });
    return;
  }

  // Calculate moon times using the moon-time library
  const moonTimes = moonTime({ year, month, day });

  // Respond with the converted lunar date
  const responseObj = {
    year: moonTimes.year,
    month: moonTimes.month,
    day: moonTimes.day + 1, // Using moonTimes.day directly, assuming it's the intended lunar day
  };

  sendJsonResponse(res, 200, responseObj);
  console.log(`POST /convert-solar-to-lunar processed for date: ${year}-${month}-${day}`);
}

/**
 * Handles the /convert-lunar-to-solar endpoint.
 * Approximates a Gregorian (solar) date from a lunar date.
 * @param {object} data - The parsed request body containing lunarMonth, lunarDay, approximateSolarYear.
 * @param {http.ServerResponse} res - The HTTP response object.
 */
function handleLunarToSolarConversion(data, res) {
  const { lunarMonth, lunarDay, approximateSolarYear } = data;

  // Validate input types
  if (
    typeof lunarMonth !== "number" ||
    typeof lunarDay !== "number" ||
    typeof approximateSolarYear !== "number"
  ) {
    sendJsonResponse(res, 400, {
      error: "Invalid input. Please provide lunarMonth, lunarDay, and approximateSolarYear as numbers.",
    });
    return;
  }

  let foundSolarDate = null;
  // Start searching from January 1st of the approximate solar year
  let currentDate = new Date(approximateSolarYear, 0, 1);

  // Search for up to 400 days to cover more than a full lunar year cycle
  // This is an iterative approximation, not a direct calculation.
  for (let i = 0; i < 400; i++) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();

    const moonTimes = moonTime({
      year: currentYear,
      month: currentMonth,
      day: currentDay,
    });

    // Check if the moon-time equivalent matches the target lunar month and day
    if (moonTimes.month === lunarMonth && moonTimes.day === lunarDay) {
      foundSolarDate = {
        year: currentYear,
        month: currentMonth,
        day: currentDay - 1, // Using currentDay directly, assuming it's the intended solar day
      };
      break; // Found a match, exit loop
    }

    // Move to the next day for the next iteration
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (foundSolarDate) {
    sendJsonResponse(res, 200, foundSolarDate);
    console.log(
      `POST /convert-lunar-to-solar processed. Lunar: ${lunarMonth}-${lunarDay} (approx year ${approximateSolarYear}) -> Solar: ${foundSolarDate.year}-${foundSolarDate.month}-${foundSolarDate.day}`,
    );
  } else {
    sendJsonResponse(res, 404, {
      error: "Could not find a matching solar date within the search range for the given lunar date and approximate year.",
    });
    console.warn(
      `No solar date found for lunar: ${lunarMonth}-${lunarDay} (approx year ${approximateSolarYear})`,
    );
  }
}

/**
 * Main HTTP server request handler.
 * @param {http.IncomingMessage} req - The HTTP request object.
 * @param {http.ServerResponse} res - The HTTP response object.
 */
const server = http.createServer((req, res) => {
  // Apply CORS middleware to allow cross-origin requests
  cors()(req, res, () => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    // Only allow POST requests
    if (req.method === "POST") {
      let bodyChunks = [];

      // Collect data chunks from the request body
      req.on("data", (chunk) => {
        bodyChunks.push(chunk);
      });

      // Process the complete request body when it ends
      req.on("end", () => {
        try {
          const rawBody = Buffer.concat(bodyChunks).toString();
          const data = JSON.parse(rawBody);

          // Route to the appropriate handler based on the URL pathname
          if (pathname === "/convert-solar-to-lunar") {
            handleSolarToLunarConversion(data, res);
          } else if (pathname === "/convert-lunar-to-solar") {
            handleLunarToSolarConversion(data, res);
          } else {
            // Handle unrecognized POST endpoints
            sendJsonResponse(res, 404, {
              error: "Invalid POST endpoint. Supported: /convert-solar-to-lunar, /convert-lunar-to-solar",
            });
            console.log(`Invalid POST endpoint: ${pathname}`);
          }
        } catch (error) {
          // Catch errors during JSON parsing or other processing
          console.error("Error processing POST request:", error);
          sendJsonResponse(res, 400, {
            error: "Invalid JSON or malformed request body.",
          });
        }
      });
    } else {
      // Handle any HTTP methods other than POST
      sendJsonResponse(res, 404, {
        error: "Not Found. Only POST requests are supported.",
      });
      console.log(`Unhandled request method: ${req.method} ${pathname}`);
    }
  });
});

// Start the HTTP server
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
