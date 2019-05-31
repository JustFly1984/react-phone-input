export type CountryName = string;
export type Region = 'america' | 'europe' | 'asia' | 'oceania' | 'africa' | 'north-america' | 'south-america' | 'central-america' | 'carribean' | 'european-union' | 'ex-ussr' | 'middle-east' | 'north-africa'
export type Regions = Region[];
export type Iso2 = string;
export type DialCode = string;
export type Format = string;
export type Priority = number;
export type AreaCodes = string[]

export type RawCountry = [CountryName, Regions, Iso2, DialCode, Format?, Priority?, AreaCodes?]

export type RawCountries = RawCountry[]

export interface Country {
  name: CountryName;
  regions: Regions;
  iso2: Iso2;
  dialCode: DialCode;
  format?: Format;
  priority?: Priority;
  hasAreaCodes?: boolean;
  isAreaCode?: boolean;
}

export interface CountryData {
  name: string;
  dialCode: string;
  countryCode: string;
}

export interface ExtraProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Localization {
  [key: string]: string | undefined;
}

export interface Masks {
  [key: string]: string | undefined;
}
