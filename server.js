const http = require("http");
const url = require("url");
const moonTime = require("moon-time");

const server = http.createServer((req, res) => {
  // Parse request URL to get pathname and query parameters
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Get today's date
  let today = new Date();

  // Calculate moon times for today
  let moonTimes = moonTime({
    year: today.getFullYear(),
    month: today.getMonth() + 1, // JavaScript months are 0-based
    day: today.getDate(),
  });

  // Create a new object with only the desired properties
  let responseObj = {
    year: moonTimes.year,
    month: moonTimes.month,
    day: moonTimes.day,
  };

  // Set response headers
  res.writeHead(200, { "Content-Type": "application/json" });

  // Handle different HTTP methods and paths
  switch (req.method) {
    case "GET":
      if (pathname === "/cal") {
        // Respond with moonTimes if /cal is accessed
        res.end(JSON.stringify(responseObj));
        console.log("GET /cal request processed");
      } else {
        // Default response if path is not recognized
        res.end("Welcome to the Moon API. Use /cal to get moon times.");
        console.log("GET request processed");
      }
      break;
    case "POST":
      // Handle POST request (Create)
      res.end("POST request processed");
      console.log("POST request processed");
      break;
    case "PUT":
      // Handle PUT request (Update)
      res.end("PUT request processed");
      console.log("PUT request processed");
      break;
    case "DELETE":
      // Handle DELETE request (Delete)
      res.end("DELETE request processed");
      console.log("DELETE request processed");
      break;
    default:
      res.statusCode = 404;
      res.end("Invalid request method");
      console.log("Invalid request method");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
