import { rateLimit } from "express-rate-limit";
import { isNotEmptyString } from "../utils/is";

// 获取环境变量中MAX_REQUEST_PER_HOUR的值
const MAX_REQUEST_PER_HOUR = process.env.MAX_REQUEST_PER_HOUR;

// 检查MAX_REQUEST_PER_HOUR是否为非空字符串且可以转换为数字
// 0 表示无限制
const maxCount =
  isNotEmptyString(MAX_REQUEST_PER_HOUR) && !isNaN(Number(MAX_REQUEST_PER_HOUR))
    ? parseInt(MAX_REQUEST_PER_HOUR)
    : 0;

// 创建限流器
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 一小时内的最大访问次数
  max: maxCount,
  statusCode: 200, // 200表示成功 但返回消息为"Too many request from this IP in 1 hour"
  message: async (req, res) => {
    res.send({
      status: "Fail",
      message: "Too many request from this IP in 1 hour",
      data: null,
    });
  },
});

export { limiter };
