const ANSI_CODES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
} as const;

type ColorFn = (text: string) => string;

const createColorFn = (code: string): ColorFn => {
  return (text: string) => {
    // Check if colors are disabled
    if (process.env.NO_COLOR || !process.stdout.isTTY) {
      return text;
    }
    return `${code}${text}${ANSI_CODES.reset}`;
  };
};

export const colors = {
  reset: createColorFn(ANSI_CODES.reset),
  bold: createColorFn(ANSI_CODES.bold),
  dim: createColorFn(ANSI_CODES.dim),
  
  // Foreground colors
  black: createColorFn(ANSI_CODES.black),
  red: createColorFn(ANSI_CODES.red),
  green: createColorFn(ANSI_CODES.green),
  yellow: createColorFn(ANSI_CODES.yellow),
  blue: createColorFn(ANSI_CODES.blue),
  magenta: createColorFn(ANSI_CODES.magenta),
  cyan: createColorFn(ANSI_CODES.cyan),
  white: createColorFn(ANSI_CODES.white),
  gray: createColorFn(ANSI_CODES.gray),
  
  // Background colors
  bgBlack: createColorFn(ANSI_CODES.bgBlack),
  bgRed: createColorFn(ANSI_CODES.bgRed),
  bgGreen: createColorFn(ANSI_CODES.bgGreen),
  bgYellow: createColorFn(ANSI_CODES.bgYellow),
  bgBlue: createColorFn(ANSI_CODES.bgBlue),
  bgMagenta: createColorFn(ANSI_CODES.bgMagenta),
  bgCyan: createColorFn(ANSI_CODES.bgCyan),
  bgWhite: createColorFn(ANSI_CODES.bgWhite),
  
  // Compound styles
  error: createColorFn(ANSI_CODES.bold + ANSI_CODES.red),
  success: createColorFn(ANSI_CODES.bold + ANSI_CODES.green),
  warning: createColorFn(ANSI_CODES.bold + ANSI_CODES.yellow),
  info: createColorFn(ANSI_CODES.bold + ANSI_CODES.cyan),
};