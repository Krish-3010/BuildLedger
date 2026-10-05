class BigDecimal {
  constructor(val) {
    if (val instanceof BigDecimal) {
      this.n = val.n;
      this.scale = val.scale;
      return;
    }
    const s = String(val).trim();
    if (!/^-?\d+(\.\d+)?$/.test(s)) {
      throw new Error("Invalid number format");
    }
    const parts = s.split('.');
    this.scale = parts[1] ? parts[1].length : 0;
    const str = parts[0] + (parts[1] || '');
    this.n = BigInt(str);
  }

  static alignScale(a, b) {
    const maxScale = Math.max(a.scale, b.scale);
    const nA = a.n * (10n ** BigInt(maxScale - a.scale));
    const nB = b.n * (10n ** BigInt(maxScale - b.scale));
    return { nA, nB, scale: maxScale };
  }

  add(other) {
    const { nA, nB, scale } = BigDecimal.alignScale(this, other);
    const res = new BigDecimal("0");
    res.n = nA + nB;
    res.scale = scale;
    return res;
  }

  sub(other) {
    const { nA, nB, scale } = BigDecimal.alignScale(this, other);
    const res = new BigDecimal("0");
    res.n = nA - nB;
    res.scale = scale;
    return res;
  }

  mul(other) {
    const res = new BigDecimal("0");
    res.n = this.n * other.n;
    res.scale = this.scale + other.scale;
    return res;
  }

  div(other, precision = 10) {
    if (other.n === 0n) {
      throw new Error("Division by zero");
    }
    const res = new BigDecimal("0");
    const targetScale = this.scale + precision;
    const extraScale = targetScale >= other.scale ? targetScale - other.scale : 0;
    const num = this.n * (10n ** BigInt(extraScale));
    res.n = num / other.n;
    res.scale = precision;
    return res;
  }

  toString() {
    let sign = this.n < 0n ? "-" : "";
    let absN = this.n < 0n ? -this.n : this.n;
    let str = absN.toString();

    if (this.scale === 0) {
      return sign + str;
    }

    if (str.length <= this.scale) {
      str = str.padStart(this.scale + 1, "0");
    }

    const intPart = str.slice(0, str.length - this.scale);
    let fracPart = str.slice(str.length - this.scale);

    fracPart = fracPart.replace(/0+$/, "");
    if (fracPart.length === 0) {
      return sign + intPart;
    }

    return sign + intPart + "." + fracPart;
  }
}

export function safeEvaluate(expr) {
  if (!expr || typeof expr !== 'string') return "";
  
  const cleanExpr = expr.trim();
  if (!cleanExpr) return "";

  const tokens = [];
  let i = 0;

  while (i < cleanExpr.length) {
    const char = cleanExpr[i];

    if (char === ' ') {
      i++;
      continue;
    }

    if (['+', '*', '/'].includes(char) || (char === '-' && i > 0 && !['+', '-', '*', '/'].includes(cleanExpr[i - 1]))) {
      tokens.push(char);
      i++;
    } else if (char === '-' && (i === 0 || ['+', '-', '*', '/'].includes(cleanExpr[i - 1]))) {
      let numStr = '-';
      i++;
      while (i < cleanExpr.length && (/\d|\./).test(cleanExpr[i])) {
        numStr += cleanExpr[i];
        i++;
      }
      if (numStr === '-') throw new Error("Invalid expression");
      tokens.push(new BigDecimal(numStr));
    } else if ((/\d|\./).test(char)) {
      let numStr = '';
      while (i < cleanExpr.length && (/\d|\./).test(cleanExpr[i])) {
        numStr += cleanExpr[i];
        i++;
      }
      tokens.push(new BigDecimal(numStr));
    } else {
      throw new Error("Invalid character in expression");
    }
  }

  if (tokens.length === 0) return "";
  
  // First pass: Multiplication and Division
  const pass1 = [];
  let idx = 0;
  while (idx < tokens.length) {
    const token = tokens[idx];
    if (token === '*' || token === '/') {
      const prevNum = pass1.pop();
      const nextNum = tokens[idx + 1];
      if (!prevNum || !(prevNum instanceof BigDecimal) || !nextNum || !(nextNum instanceof BigDecimal)) {
        throw new Error("Invalid operator placement");
      }
      const result = token === '*' ? prevNum.mul(nextNum) : prevNum.div(nextNum);
      pass1.push(result);
      idx += 2;
    } else {
      pass1.push(token);
      idx++;
    }
  }

  // Second pass: Addition and Subtraction
  if (pass1.length === 0) return "";
  let result = pass1[0];
  if (!(result instanceof BigDecimal)) throw new Error("Invalid start token");

  idx = 1;
  while (idx < pass1.length) {
    const op = pass1[idx];
    const nextNum = pass1[idx + 1];
    if (!nextNum || !(nextNum instanceof BigDecimal)) {
      throw new Error("Invalid operator placement");
    }
    if (op === '+') {
      result = result.add(nextNum);
    } else if (op === '-') {
      result = result.sub(nextNum);
    } else {
      throw new Error("Unexpected operator");
    }
    idx += 2;
  }

  return result.toString();
}
