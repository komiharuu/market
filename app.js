import express from "express";
import connect from "./src/schemas/index.js";
import ProductRouter from "./src/routers/product.routers.js";
import errorHandlerMiddleware from "./src/middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hello world!" });
});

app.use("/api", ProductRouter);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
