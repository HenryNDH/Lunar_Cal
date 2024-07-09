const http = require("http");
const moonTime = require("moon-time");

const server = http.createServer((req, res) => {
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

  // Send responseObj as JSON
  res.end(JSON.stringify(responseObj));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
