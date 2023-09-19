import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export const useMobile = () => {
  // 使用breakpointsTailwind作为断点对象
  const breakpoints = useBreakpoints(breakpointsTailwind);
  // 判断当前设备是否为移动设备
  const isMobile = breakpoints.smaller("sm");

  // 返回移动设备的判断结果
  return { isMobile };
};
