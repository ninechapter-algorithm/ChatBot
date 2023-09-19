export const createLocalStorage = (options) => {
  // 默认缓存时间为7天 以秒为单位
  const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;

  const { expire } = Object.assign({ expire: DEFAULT_CACHE_TIME }, options);

  const set = (key, value) => {
    const storageData = {
      // 存储的值
      value,
      // 过期时间，以毫秒为单位
      expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
    };
    // 将存储数据转换为JSON字符串
    const json = JSON.stringify(storageData);
    // 将存储数据保存到localStorage中
    window.localStorage.setItem(key, json);
  };

  const get = (key) => {
    // 从localStorage中获取存储数据
    const json = window.localStorage.getItem(key);
    if (json) {
      let storageData = null;

      try {
        // 将JSON字符串解析为对象
        storageData = JSON.parse(json);
      } catch {
        // 解析失败时防止出错
      }

      if (storageData) {
        const { value, expire } = storageData;
        if (expire === null || expire >= Date.now()) {
          // 如果数据未过期，则返回存储的值
          return value;
        }
      }

      // 数据已过期或解析失败，移除该存储数据
      remove(key);
      return null;
    }
  };

  const remove = (key) => {
    // 从localStorage中移除指定的存储数据
    window.localStorage.removeItem(key);
  };

  const clear = () => {
    // 清空localStorage中的所有存储数据
    window.localStorage.clear();
  };

  // 返回操作localStorage的方法集合
  return { set, get, remove, clear };
};

// 创建默认过期时间为7天的localStorage实例
export const ls = createLocalStorage();

// 创建永不过期的localStorage实例
export const ss = createLocalStorage({ expire: null });
