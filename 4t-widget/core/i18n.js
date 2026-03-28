export const resolveField = (field, lang) =>
  typeof field === 'string' ? field
  : field?.[lang] ?? field?.['en'] ?? ''

export const getString = (locale, key) => locale?.[key] ?? key
