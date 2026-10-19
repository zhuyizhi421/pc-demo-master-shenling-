/**
 * 将数字转换为字符串,并确保小数点后最多保留 scale 位小数
 * @param num 输入数字
 * @param scale 小数位数
 * @returns 格式化后的字符串
 */
function formatNumber(num: number, scale: number): string {
  return num.toFixed(scale);
}

/**
 * 将字符串转换为数字,并处理精度问题
 * @param numStr 输入数字字符串
 * @returns 转换后的数字
 */
function parseNumber(numStr: string): number {
  return parseFloat(numStr);
}

/**
 * 加法运算,处理精度问题
 * @param a 加数1
 * @param b 加数2
 * @returns 求和结果
 */
function add(a: number, b: number): number {
  const aStr = formatNumber(a, 10);
  const bStr = formatNumber(b, 10);
  const result = parseFloat(aStr) + parseFloat(bStr);
  return parseNumber(formatNumber(result, 10));
}

/**
 * 减法运算,处理精度问题
 * @param a 被减数
 * @param b 减数
 * @returns 差值
 */
function subtract(a: number, b: number): number {
  const aStr = formatNumber(a, 10);
  const bStr = formatNumber(b, 10);
  const result = parseFloat(aStr) - parseFloat(bStr);
  return parseNumber(formatNumber(result, 10));
}

/**
 * 乘法运算,处理精度问题
 * @param a 乘数1
 * @param b 乘数2
 * @returns 积
 */
function multiply(a: number, b: number): number {
  const aStr = formatNumber(a, 10);
  const bStr = formatNumber(b, 10);
  const result = parseFloat(aStr) * parseFloat(bStr);
  return parseNumber(formatNumber(result, 10));
}

/**
 * 除法运算,处理精度问题
 * @param a 被除数
 * @param b 除数
 * @returns 商
 */
function divide(a: number, b: number): number {
  const aStr = formatNumber(a, 10);
  const bStr = formatNumber(b, 10);
  const result = parseFloat(aStr) / parseFloat(bStr);
  return parseNumber(formatNumber(result, 10));
}

export default {
  add,
  subtract,
  multiply,
  divide,
};
