const http = require("http");
const url = require("url");
const mongoose = require("mongoose");
let moonTime = require("moon-time");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://user01:user01@cluster0.ubsxqxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

// Define schema and model
const Schema = mongoose.Schema;
const calSchema = new Schema({
  day: Number,
  month: Number,
  desc: String,
});
const Calendar = mongoose.model("lunar_cals", calSchema);

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse request URL to get pathname and query parameters
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Set response headers
  res.writeHead(200, { "Content-Type": "application/json" });

  // Handle different HTTP methods and paths
  switch (req.method) {
    case "GET":
      if (pathname === "/cal") {
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
        // Respond with moonTimes if /cal is accessed
        res.end(JSON.stringify(responseObj));
        console.log("GET /cal request processed");
      } else if (pathname === "/all") {
        // Fetch all documents from Calendar collection
        Calendar.find()
          .then((documents) => {
            res.end(JSON.stringify(documents));
            console.log("GET /all request processed");
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            res.statusCode = 500;
            res.end("Error fetching data");
          });
      } else {
        // Default response if path is not recognized
        res.end(
          "Welcome to the Moon API. Use /cal to get moon times. Use /all to fetch data"
        );
        console.log("GET request processed");
      }
      break;
    case "POST":
      if (pathname === "/all") {
        let body = [];

        req.on("data", (chunk) => {
          body.push(chunk);
        });

        req.on("end", () => {
          // Parse the incoming data
          body = Buffer.concat(body).toString();
          const data = JSON.parse(body);

          // Create a new calendar entry
          const newEntry = new Calendar({
            day: data.day,
            month: data.month,
            desc: data.desc,
          });

          // Save the new entry to the database
          newEntry
            .save()
            .then(() => {
              res.end("New calendar entry added successfully");
              console.log("POST /all request processed");
            })
            .catch((error) => {
              console.error("Error saving data:", error);
              res.statusCode = 500;
              res.end("Error saving data");
            });
        });
      } else {
        res.statusCode = 404;
        res.end("Invalid endpoint for POST request");
      }
      break;
    case "DELETE":
      if (pathname === "/delete") {
        let body = [];

        req.on("data", (chunk) => {
          body.push(chunk);
        });

        req.on("end", () => {
          // Parse the incoming data
          body = Buffer.concat(body).toString();
          const data = JSON.parse(body);

          // Check if day and month are provided in the request body
          if (data.day && data.month) {
            // Use deleteMany to delete documents matching the day and month
            Calendar.deleteMany({ day: data.day, month: data.month })
              .then((result) => {
                res.end(`Deleted ${result.deletedCount} documents`);
                console.log("DELETE /delete request processed");
              })
              .catch((error) => {
                console.error("Error deleting documents:", error);
                res.statusCode = 500;
                res.end("Error deleting documents");
              });
          } else {
            res.statusCode = 400;
            res.end("Missing 'day' or 'month' in request body");
          }
        });
      } else {
        res.statusCode = 404;
        res.end("Invalid endpoint for DELETE request");
      }
      break;
    default:
      res.statusCode = 404;
      res.end("Invalid request method");
      console.log("Invalid request method");
  }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
