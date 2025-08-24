export interface Currency {
  code: string
  symbol: string
  name: string
  decimals: number
}

export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimals: 2,
  },
}

export const DEFAULT_CURRENCY = 'USD'

export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  options: {
    showCode?: boolean
    compact?: boolean
  } = {}
): string => {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
  const { showCode = false, compact = false } = options

  if (compact && amount >= 1000000) {
    const millions = amount / 1000000
    return `${currency.symbol}${millions.toFixed(1)}M`
  } else if (compact && amount >= 1000) {
    const thousands = amount / 1000
    return `${currency.symbol}${thousands.toFixed(1)}K`
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount)

  return showCode 
    ? `${currency.symbol}${formatted} ${currency.code}`
    : `${currency.symbol}${formatted}`
}

export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

// Hook to get organization's currency setting
export const useOrganizationCurrency = (): string => {
  // For now, return default. In a real app, this would come from the organization settings
  return DEFAULT_CURRENCY
}