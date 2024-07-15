const mongoose = require("mongoose");
let Schema = mongoose.Schema;

mongoose.connect(
  "mongodb+srv://henry:henry@henrydb.vesmmxr.mongodb.net/?retryWrites=true&w=majority&appName=HenryDB"
);

let calSchema = new Schema({
  day: Number,
  month: Number,
  desc: String,
});

let Calendar = mongoose.model("lunar_cals", calSchema);

let Holiday = new Calendar({
  day: 1,
  month: 1,
  desc: "Tet Am Lich",
});

Holiday.save()
  .then(() => {
    console.log("The New Cal was saved to the Lunar_Cal collection");
    process.exit();
  })
  .catch((err) => {
    console.log("There was an error saving the New Cal");
    process.exit();
  });
