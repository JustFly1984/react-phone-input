import memoize from './memoize'

import { Country, Region, Masks } from './types'

// Countries array methods
export function deleteAreaCodes (filteredCountries: Country[]): Country[] {
  return filteredCountries.filter(function filter (country): boolean {
    return country.isAreaCode !== true
  })
}

export function filterRegions (regions: Region | Region[], filteredCountries: Country[]): Country[] {
  if (typeof regions === 'string') {
    return filteredCountries.filter(function filter (country): boolean {
      return country.regions.includes(regions)
    })
  }

  // Regions is array
  return filteredCountries.filter(function filter (country): boolean {
    for (const region of regions) {
      if (country.regions.includes(region)) {
        return true
      }
    }

    return false
  })
}

export function insertMasks (masks: Masks, filteredCountries: Country[]): Country[] {
  let count = Object.keys(masks).length

  for (let i = 0; i < filteredCountries.length && count > 0; ++i) {
    const country = filteredCountries[i]
    const mask = masks[country.iso2]

    if (mask !== undefined) {
      country.format = mask
      --count
    }
  }

  return filteredCountries
}

export function getOnlyCountries (onlyCountriesArray: string[], filteredCountries: Country[]): Country[] {
  if (onlyCountriesArray.length === 0) return filteredCountries

  return filteredCountries.filter(function filter (country): boolean {
    return onlyCountriesArray.includes(country.iso2)
  })
}

export function excludeCountries (selectedCountries: Country[], excludedCountries: string[]): Country[] {
  if (excludedCountries.length === 0) return selectedCountries

  return selectedCountries.filter(function filter (country): boolean {
    return excludedCountries.includes(country.iso2) === false
  })
}

export const getProbableCandidateIndex = memoize(
  function getProbableCandidate (queryString: string, onlyCountries: Country[]): number {
    if (queryString.length === 0) {
      return -1
    }

    queryString = queryString.toLowerCase()

    // don't include the preferred countries in search
    return onlyCountries.findIndex(function findIndex (country): boolean {
      return country.name.toLowerCase().startsWith(queryString)
    })
  }
)

export const guessSelectedCountry = memoize(
  function guessSelectedCountry (inputNumber: string, onlyCountries: Country[], defaultCountry: string): Country {
    const secondBestGuess: Country = onlyCountries.find(function find (country): boolean {
      return country.iso2 === defaultCountry
    }) || { name: '', regions: [], iso2: '', dialCode: '' }

    if (inputNumber.trim() === '') {
      return secondBestGuess
    }

    let res: Country = {
      name: '',
      regions: [],
      iso2: '',
      dialCode: '',
      priority: 10001
    }

    for (const item of onlyCountries) {
      if (inputNumber.startsWith(item.dialCode)) {
        if (item.dialCode.length > res.dialCode.length) {
          res = item
        } else if (
          item.dialCode.length === res.dialCode.length &&
          item.priority !== undefined && res.priority !== undefined &&
          item.priority < res.priority
        ) {
          res = item
        }
      }
    }

    if (res.name.length > 0) {
      return res
    }

    return secondBestGuess
  }
)

export function filterCountriesByValue (search: string, countries: Country[]): Country[] {
  search = search.trim().toLowerCase()

  return countries.filter(function filter ({ name, iso2, dialCode }): boolean {
    return `${name}|${iso2}|+${dialCode}`.toLowerCase().includes(search)
  })
}
