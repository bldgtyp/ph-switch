// Shared transform expression evaluator using jsep and decimal.js
import jsep from 'jsep';
import { Decimal } from 'decimal.js';

// Configure Decimal.js once for consistent behavior across modules
Decimal.config({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -20,
  toExpPos: 40,
  maxE: 9e15,
  minE: -9e15,
  modulo: Decimal.ROUND_HALF_UP,
});

// Small safe function whitelist
const fnMap: Record<string, (v: Decimal, w?: Decimal) => Decimal> = {
  abs: (v: Decimal) => v.abs(),
  neg: (v: Decimal) => v.neg(),
  sqrt: (v: Decimal) => new Decimal(Math.sqrt(Number(v.toString()))),
  pow: (v: Decimal, w?: Decimal) => v.pow(w || new Decimal(0)),
  min: (v: Decimal, w?: Decimal) => Decimal.min(v, w || v),
  max: (v: Decimal, w?: Decimal) => Decimal.max(v, w || v),
};

export function evaluateTransform(expr: string, xValue: Decimal): Decimal {
  if (!expr || typeof expr !== 'string') {
    throw new Error('Transform expression must be a string');
  }

  if (!/^[0-9a-zA-Z_\s+\-*/().,^%]*$/.test(expr)) {
    throw new Error('Invalid characters in transform expression');
  }

  const normalized = expr.replace(/\^/g, '**');
  const ast = jsep(normalized);

  function evalNode(node: jsep.Expression): Decimal {
    switch (node.type) {
      case 'Literal': {
        // @ts-ignore
        return new Decimal(node.value);
      }
      case 'Identifier': {
        // @ts-ignore
        if (node.name === 'x' || node.name === 'X') return xValue;
        throw new Error(`Unknown identifier: ${node.name}`);
      }
      case 'UnaryExpression': {
        // @ts-ignore
        const arg = evalNode(node.argument);
        // @ts-ignore
        switch (node.operator) {
          case '+':
            return arg;
          case '-':
            return arg.neg();
          default:
            throw new Error(`Unsupported unary operator ${node.operator}`);
        }
      }
      case 'BinaryExpression': {
        // @ts-ignore
        const left = evalNode(node.left);
        // @ts-ignore
        const right = evalNode(node.right);
        // @ts-ignore
        switch (node.operator) {
          case '+':
            return left.add(right);
          case '-':
            return left.sub(right);
          case '*':
            return left.mul(right);
          case '/':
            return left.div(right);
          case '%':
            return new Decimal(
              Number(left.toString()) % Number(right.toString())
            );
          case '**':
            return left.pow(right);
          default:
            throw new Error(`Unsupported binary operator ${node.operator}`);
        }
      }
      case 'CallExpression': {
        // @ts-ignore runtime shapes from jsep may be loose; narrow safely
        const callee: any = (node as any).callee;
        if (
          callee &&
          typeof callee.type === 'string' &&
          callee.type === 'Identifier'
        ) {
          const name = String(callee.name);
          // @ts-ignore
          const args = (node.arguments as any[]).map(evalNode);
          if (name in fnMap) {
            return fnMap[name](args[0], args[1]);
          }
        }
        throw new Error('Unsupported function in transform expression');
      }
      default:
        throw new Error('Unsupported expression in transform');
    }
  }

  return evalNode(ast);
}

// Convenience function for config backfill: evaluate expression with x=1 and return a number if finite
export function evaluateExpressionToNumber(
  expr: string,
  xVal = 1
): number | null {
  try {
    const dec = evaluateTransform(expr, new Decimal(xVal));
    const num = dec.toNumber();
    if (!Number.isFinite(num)) return null;
    return num;
  } catch (e) {
    return null;
  }
}
