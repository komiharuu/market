// schemas/todo.schema.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, //필수 요소입니다.
    },
    description: {
      type: String,
      required: true, // 필수 요소입니다.
    },
    manager: {
      type: String, // 필수 요소입니다.
      required: true,
    },
    password: {
      type: String,
      required: true, // 필수 요소입니다.
    },
    status: {
      type: String,
      enum: ["FOR_SALE", "SOLD_OUT"],
      default: "FOR_SALE",
    },
  },
  {
    timestamps: true, // createdAt 및 updatedAt 자동 생성
  },
);

// productSchema를 바탕으로 productschema모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Product", ProductSchema);
