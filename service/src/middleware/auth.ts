import { isNotEmptyString } from "../utils/is";

// 身份验证中间件
const auth = async (req, res, next) => {
  // 获取环境变量中AUTH_SECRET_KEY的值
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
  // 如果AUTH_SECRET_KEY是非空字符串
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      // 获取请求头
      const Authorization = req.header("Authorization");
      // 检查请求头中的Authroization字段是否存在且于AUTH_SECRET_KEY匹配
      if (
        !Authorization ||
        Authorization.replace("Bearer ", "").trim() !== AUTH_SECRET_KEY.trim()
      ) {
        // 不存在或不匹配 则返回错误信息
        throw new Error("Error: 无访问权限 | No access rights");
      }
      // 验证通过 则继续下一步处理
      next();
    } catch (error) {
      res.send({
        status: "Unauthorized",
        message: error.message ?? "Please authenticate.",
        data: null,
      });
    }
  } else {
    // 如果是空值 则无需验证 继续下一步处理
    next();
  }
};

export { auth };
