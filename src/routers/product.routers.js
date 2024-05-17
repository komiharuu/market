import express from "express";
import Data from "../schemas/product.schema.js";
import Joi from "joi";

const router = express.Router();
const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "상품명을 입력해 주세요.",
  }),
  manager: Joi.string().required().messages({
    "any.required": "담당자를 입력해 주세요.",
  }),
  description: Joi.string().required().messages({
    "any.required": "설명을 입력해 주세요.",
  }),
  password: Joi.string().required().messages({
    "any.required": "비밀번호를 입력해 주세요.",
  }),
  status: Joi.string().valid("FOR_SALE", "SOLD_OUT").messages({
    "any.only": "상품 상태는 [FOR_SALE, SOLD_OUT] 중 하나여야 합니다.",
  }),
});

const PasswordSchema = Joi.object({
  password: Joi.string().required().messages({
    "any.required": "비밀번호를 입력해 주세요.",
  }),
});

// 상품 생성 api
router.post("/products", async (req, res, next) => {
 
    const validation = await productSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    const { name, description, manager, password } = validation;

    const product = new Data({ name, description, manager, password });


    const existingProduct = await Data.findOne({ name }).exec();

    if (existingProduct) {
      if (name === existingProduct.name) {
        return res
          .status(400)
          .json({ status: 400, message: "이미 등록된 상품입니다." });
      }
    }

    // 생성한 상품을  저장하고 생성합니다.
    await product.save();

    return res
      .status(201)
      .json({
        status: "201",
        message: "상품 등록에 성공하였습니다.",
        data: product,
      });
  } );

// 상품 목록 조회 api

router.get("/products", async (req, res) => {
  try {
    const datas = await Data.find({}, "-password") //비밀번호를 제외하고 조회합니다.
      .sort({ updatedAt: -1 }) //최신 순(내림차순)으로 조회합니다.
      .exec();
  

    return res.status(200).json({
      status: 200,
      message: "상품 목록 조회에 성공했습니다.",
      products: datas,
    });
  } catch (err) {
    next(err);
    return res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
    });
  }
});

// 상품 상세 조회 api
router.get("/products/:productId", async (req, res) => {
  // get 안의 id 값을 productId로 하였습니다.

  const { productId } = req.params;
  // 상품 ID를 전달받습니다.
  try {
    const datas = await Data.findById(productId, "-password") // 비밀번호를 제외하고 조회합니다.
      .exec();
    if (!datas) {
      return res
        .status(404)
        .json({ status: 404, message: "상품이 존재하지 않습니다." });
    }

    res.status(200).json({
      status: 200,
      message: "상품 상세 조회에 성공했습니다.",
      data: datas,
    });
  } catch (err) {
    next(err);
    return res.status(500).json({
      status: 500,
      message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
    });
  }
});

// 상품 수정 api

router.put("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  // 상품 ID를 전달받습니다.
  try {
    const validation = await productSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    const { name, description, manager, status, password } = validation;
    // 이름, 설명, 관리자, 상태, 비밀번호가 들어갑니다.

    const product = await Data.findById(productId).exec();
    // 상품의 아이디로 데이터를 찾습니다.

    // 상품을 찾을 수 없으면 404 에러를 반환합니다.
    if (!product) {
      return res
        .status(404)
        .json({ status: 404, message: "상품이 존재하지 않습니다." });
    }

    // 비밀번호 일치 여부를 확인합니다
    if (password !== product.password) {
      return res
        .status(401)
        .json({ status: 401, message: "비밀번호가 일치하지 않습니다." });
    }

    // 수정할 값들을 나타냅니다
    product.name = name;
    product.description = description;
    product.manager = manager;
    product.status = status;
    product.password = password;


    // 상품을 저장합니다.
    await product.save();

    return res
      .status(200)
      .json({
        status: 200,
        message: "상품 수정에 성공했습니다.",
        data: product,
      });
  } catch (err) {
    next(err);
    return res
      .status(500)
      .json({
        error: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
      });
  }
});

//상품 삭제 api

router.delete("/products/:productId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값, 비밀번호를 가져오고 찾는 과정입니다.

  const { productId } = req.params;

  try {
    const validation = await PasswordSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    const { password } = validation;

    const product = await Data.findById(productId).exec();
    if (!product) {
      return res
        .status(404)
        .json({ status: 404, message: "상품이 존재하지 않습니다." });
    }

    // 비밀번호 일치여부를 확인합니다
    if (!password) {
      return res
        .status(400)
        .json({ status: 400, message: "비밀번호를 입력해 주세요." });
    }
    // 비밀번호 일치여부를 확인합니다
    if (password !== product.password) {
      return res
        .status(400)
        .json({ status: 400, message: "비밀번호가 일치하지 않습니다." });
    }

    await product.deleteOne();

    return res
      .status(200)
      .json({
        status: "200",
        message: "상품 삭제에 성공했습니다.",
        data: product,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
      });
  }
});

export default router;
