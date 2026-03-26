export function constructMessage(module: string, message: string, brakets: "[]" | "()" | "  " = "[]") {
  return `${brakets[0]}${module}${brakets[1]} ${message}`;
}
