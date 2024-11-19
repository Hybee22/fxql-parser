export const REGEX = {
  CURRENCY: /^[A-Z]{3}$/,
  NUMBER: /^\d+(\.\d+)?$/,
  WHOLE_NUMBER: /^\d+$/,
  FXQL_STATEMENT: /^([A-Z]{3})-([A-Z]{3})\s*{\s*BUY\s*(\d+\.?\d*)\s*SELL\s*(\d+\.?\d*)\s*CAP\s*(\d+)\s*}$/,
}; 