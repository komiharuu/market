export default function (err, req, res, next) {
  console.error(err);

  // Joi 검증에서 에러가 발생하면, 클라이언트에게 에러 메시지를 전달합니다.
  if (err.name === "ValidationError") {
    return res.status(400).json({ errorMessage: err.message });
  }

  // 그 외의 에러가 발생하면, 서버 에러로 처리합니다.
  return res
    .status(500)
    .json({ errorMessage: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요." });
}
