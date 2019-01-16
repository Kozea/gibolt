import { parse as qsParse, stringify as qsStringify } from 'qs'

const defaultOptions = { strictNullHandling: true }

export const parse = (str, options = defaultOptions) => qsParse(str, options)

export const stringify = (str, options = defaultOptions) =>
  qsStringify(str, options)
