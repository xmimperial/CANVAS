const mongoose = require("mongoose");

const ElementSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },   // text | rect | circle | image | triangle
    fabricData: { type: mongoose.Schema.Types.Mixed }, // Full Fabric.js JSON object
  },
  { _id: false }
);

const DesignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Untitled Design" },
    thumbnail: { type: String, default: "" },         // Base64 preview
    canvasJSON: { type: mongoose.Schema.Types.Mixed }, // Full canvas.toJSON()
    canvasSize: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
    },
    elements: { type: [ElementSchema], default: [] },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Design", DesignSchema);
