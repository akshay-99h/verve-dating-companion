type ClassDictionary = Record<string, boolean | null | undefined>
type ClassArray = ClassValue[]
type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassDictionary
  | ClassArray

function flattenClassValue(input: ClassValue, output: string[]) {
  if (!input) {
    return
  }

  if (typeof input === "string" || typeof input === "number") {
    output.push(String(input))
    return
  }

  if (Array.isArray(input)) {
    input.forEach((value) => flattenClassValue(value, output))
    return
  }

  Object.entries(input).forEach(([key, value]) => {
    if (value) {
      output.push(key)
    }
  })
}

export function cn(...inputs: ClassValue[]) {
  const output: string[] = []
  inputs.forEach((input) => flattenClassValue(input, output))
  return output.join(" ")
}
