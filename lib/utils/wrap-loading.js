const ora = require('ora');

/**
 * 为异步函数包裹加载动画
 * @param fn 执行的函数
 * @param message 提示信息
 * @returns {Promise<*>}
 */
async function wrapLoading(fn, message = 'loading...') {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn();
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, please try again!');
  }
}

module.exports = wrapLoading;
