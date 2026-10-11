// Chart colours. Validated with the dataviz palette checker (adjacent-pair CVD
// ΔE 9.1, normal-vision ΔE 22.9 on a white surface). Aqua and yellow sit below
// 3:1 contrast, so every chart that uses them also ships a legend and a table.
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'] as const
export const SEQUENTIAL = '#2a78d6' // single hue for magnitude
export const SEQUENTIAL_MUTED = '#9ec5f4'
export const INK = { primary: '#111827', secondary: '#52514e', muted: '#898781' }
export const CHROME = { grid: '#e1e0d9', axis: '#c3c2b7', surface: '#ffffff' }

export const GENDER_ORDER = ['FEMALE', 'MALE', 'NON_BINARY', 'UNDISCLOSED'] as const
/** Colour follows the entity: a gender keeps its slot even if a filter removes others. */
export const GENDER_COLOR: Record<string, string> = {
  FEMALE: SERIES[0],
  MALE: SERIES[1],
  NON_BINARY: SERIES[2],
  UNDISCLOSED: SERIES[3],
}
