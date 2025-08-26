const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubmissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", SubmissionSchema);
