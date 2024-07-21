const mongoose = require("mongoose");
let Schema = mongoose.Schema;

mongoose.connect(
  "mongodb+srv://user01:user01@cluster0.ubsxqxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

let calSchema = new Schema({
  day: Number,
  month: Number,
  desc: String,
});

let Calendar = mongoose.model("lunar_cals", calSchema);

let Holiday = new Calendar({
  day: 2,
  month: 2,
  desc: "Tet Gieng",
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
