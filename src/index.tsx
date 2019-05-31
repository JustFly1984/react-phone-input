import * as React from 'react'
import { debounce } from 'ts-debounce'
import * as classnames from 'classnames'

import {
  insertMasks,
  filterRegions,
  deleteAreaCodes,
  getOnlyCountries,
  excludeCountries,
  guessSelectedCountry,
  filterCountriesByValue,
  getProbableCandidateIndex
} from './utils'

import { allCountries } from './country-data'

import Listbox from './listbox'

// import * as flags from './styles/flags.module.css'
// import * as phoneInput from './styles/phone-input.module.css'

import {
  Masks,
  Region,
  Country,
  ExtraProps,
  CountryData,
  Localization
} from './types'

interface OwnProps {
  id?: string;
  value?: string;
  excludeCountries?: string[];
  onlyCountries?: string[];
  preferredCountries?: string[];
  defaultCountry?: string;
  placeholder?: string;
  searchPlaceholder?: string;

  containerClass: string;
  inputClass: string;
  buttonClass: string;
  flagClass: string;
  selectedFlagClass: string;
  phoneInputArrowClass: string;
  phoneInputArrowUpClass: string;
  openDropdownClass: string;
  invalidInputClass: string;

  listboxClass: string;
  searchClass: string;
  hideClass: string;
  listboxDividerClass: string;
  searchEmojiClass: string;
  dropDownBoxClass: string;
  noEntriesMessageClass: string;

  listboxItemClass: string;
  listboxItemIconClass: string;
  listboxItemNameClass: string;
  listboxItemDescClass: string;
  listboxItemActiveClass: string;

  disabled?: boolean;
  autoFormat?: boolean;
  disableAreaCodes?: boolean;
  disableCountryCode?: boolean;
  disableDropdown?: boolean;
  enableLongNumbers?: boolean;
  countryCodeEditable?: boolean;
  enableSearchField?: boolean;
  disableSearchIcon?: boolean;

  regions?: Region | Region[];

  inputExtraProps?: ExtraProps;
  localization?: Localization;
  masks?: Masks;

  isValid? (): boolean;
  onKeyDown? (event: React.KeyboardEvent): void;
  onChange? (value: string, country: CountryData): void;
  onClick? (event: React.MouseEvent, country: CountryData): void;
  onFocus? (event: React.FocusEvent, country: CountryData): void;
  onBlur? (event: React.FocusEvent, country: CountryData): void;
}

interface DefaultProps {
  excludeCountries: string[];
  onlyCountries: string[];
  preferredCountries: string[];
  defaultCountry: string;

  value: string;
  placeholder: string;
  searchPlaceholder: string;
  disabled: boolean;

  containerClass: string;

  autoFormat: boolean;
  disableAreaCodes: boolean;
  isValid (inputNumber: string): boolean;

  disableCountryCode: boolean;
  disableDropdown: boolean;
  enableLongNumbers: boolean;
  countryCodeEditable: boolean;
  enableSearchField: boolean;
  disableSearchIcon: boolean;

  inputExtraProps: ExtraProps;
  localization: Localization;
  masks: Masks;

  onEnterKeyPress (event: React.KeyboardEvent): void;
}

interface State {
  id: string;
  placeholder: string;
  formattedNumber: string;
  defaultCountry: string;
  selectedCountry?: Country;
  freezeSelection: boolean;
}

export function ReactPhoneInput (props: OwnProps & DefaultProps): JSX.Element {
  const formatNumber = React.useCallback(
    function formatNumber (text: string, patternArg?: string): string {
      const pattern = props.disableCountryCode && patternArg !== undefined
        ? patternArg.slice(patternArg.indexOf(' ') + 1)
        : patternArg

      if (text.length === 0) {
        return props.disableCountryCode ? '' : '+'
      }

      // for all strings with length less than 3, just return it (1, 2 etc.)
      // also return the same text if the selected country has no fixed format
      if ((text.length > 0 && text.length < 2) || !pattern || !props.autoFormat) {
        return props.disableCountryCode ? text : `+${text}`
      }

      const array: string[] = []
      const src = text.split('')

      // Fill array by pattern
      for (const char of pattern) {
        if (src.length === 0) {
          break
        }

        // char === '.' — insert number from value (text)
        array.push(
          char === '.'
            ? src.shift() as string
            : char
        )
      }

      if (props.enableLongNumbers) {
        array.push(...src)
      }

      /* const pos = array.lastIndexOf('(')

      // Always close brackets
      if (pos !== -1 && !array.includes(')', pos)) {
        array.push(')')
      } */

      return array.join('')
    }, [ props ]
  )

  const incomingCountries = React.useMemo(
    function setIncomingCountries (): Country[] {
      let filteredCountries = allCountries

      if (props.regions !== undefined) {
        filteredCountries = filterRegions(props.regions, filteredCountries)
      }

      if (Object.keys(props.masks).length !== 0) {
        filteredCountries = insertMasks(props.masks, filteredCountries)
      }

      return filteredCountries
    }, [ props.regions, props.masks ]
  )

  const onlyCountries = React.useMemo(
    function setOnlyCountries (): Country[] {
      return excludeCountries(
        getOnlyCountries(
          props.onlyCountries,
          incomingCountries
        ),
        props.excludeCountries.concat(props.preferredCountries)
      )
    }, [ incomingCountries, props.onlyCountries, props.excludeCountries, props.preferredCountries ]
  )

  const [ state, setState ] = React.useState(
    function initState (): State {
      const inputNumber = props.value.replace(/[^\d.]+/g, '') || ''

      let countryGuess: Country | undefined

      if (inputNumber.length > 1) {
        // Country detect by value field
        countryGuess = guessSelectedCountry(
          inputNumber.substring(0, 6),
          incomingCountries,
          props.defaultCountry
        )
      } else if (props.defaultCountry) {
        // Default country
        countryGuess = incomingCountries.find(function find (country): boolean {
          return country.iso2 === props.defaultCountry
        })
      }

      const dialCode = (
        inputNumber.length < 2 &&
        countryGuess !== undefined &&
        !inputNumber.replace(/\D/g, '').startsWith(countryGuess.dialCode)
      ) ? countryGuess.dialCode : ''

      const formattedNumber = (inputNumber === '' && countryGuess === undefined)
        ? ''
        : formatNumber(
          (props.disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
          countryGuess !== undefined && countryGuess.name ? countryGuess.format : undefined
        )

      return {
        id: props.id || Date.now().toString(16),
        placeholder: props.placeholder,
        formattedNumber,
        defaultCountry: props.defaultCountry,
        selectedCountry: countryGuess,
        freezeSelection: false
      }
    }
  )

  const preferredCountries = React.useMemo(
    function setPreferredCountries (): Country[] {
      return incomingCountries.filter(function filter (country): boolean {
        return props.preferredCountries.includes(country.iso2)
      })
    }, [ incomingCountries, props.preferredCountries ]
  )

  // Filter countries by string value
  const [ filter, setFilterOrig ] = React.useState('')

  const filteredOnlyCountries = React.useMemo(
    function filterOnlyCountries (): Country[] {
      const list = props.enableSearchField
        ? filterCountriesByValue(filter, onlyCountries)
        : onlyCountries

      return props.disableAreaCodes
        ? deleteAreaCodes(list)
        : list
    }, [ filter, onlyCountries, props.enableSearchField, props.disableAreaCodes ]
  )

  const filteredPreferredCountries = React.useMemo(
    function filterPreferredCountries (): Country[] {
      const list = props.enableSearchField
        ? filterCountriesByValue(filter, preferredCountries)
        : preferredCountries

      return props.disableAreaCodes
        ? deleteAreaCodes(list)
        : list
    }, [ filter, preferredCountries, props.enableSearchField, props.disableAreaCodes ]
  )

  // Concat filtered countries
  const filteredCountries = React.useMemo(
    function concatFilteredCountries (): Country[] {
      return filteredPreferredCountries.concat(filteredOnlyCountries)
    }, [ filteredPreferredCountries, filteredOnlyCountries ]
  )

  // Hooks for updated props
  const updateDefaultCountry = React.useCallback(
    function updateDefaultCountry (iso2: string, countries: Country[], disableCountryCode: boolean): void {
      const country = countries.find(function find (country): boolean {
        return country.iso2 === iso2
      })

      setState(function setState (state): State {
        return {
          ...state,
          defaultCountry: iso2,
          selectedCountry: country,
          formattedNumber: disableCountryCode || country === undefined ? '' : '+' + country.dialCode
        }
      })
    }, []
  )

  const updateFormattedNumber = React.useCallback(
    function updateFormattedNumber (value: string): void {
      setState(function setState (state): State {
        const { defaultCountry } = state

        let country: Country | undefined

        let inputNumber = value.replace(/\D/g, '')
        let formattedNumber = value

        // if inputNumber does not start with '+', then use default country's dialing prefix,
        // otherwise use logic for finding country based on country prefix.
        if (!value.startsWith('+')) {
          country = incomingCountries.find(function find (country): boolean {
            return country.iso2 === defaultCountry
          }) || state.selectedCountry

          const dialCode = country !== undefined && !inputNumber.startsWith(country.dialCode)
            ? country.dialCode : ''

          formattedNumber = formatNumber(
            (
              props.disableCountryCode
                ? ''
                : dialCode
            ) + inputNumber,
            country ? country.format : undefined
          )
        } else {
          country = guessSelectedCountry(inputNumber.substring(0, 6), incomingCountries, defaultCountry)
          formattedNumber = formatNumber(inputNumber, country.format)
        }

        return {
          ...state,
          selectedCountry: country,
          formattedNumber
        }
      })
    }, [ incomingCountries, props.disableCountryCode, formatNumber ]
  )

  React.useEffect(
    function onChangeDefaultCountry (): void {
      if (props.defaultCountry !== state.defaultCountry) {
        updateDefaultCountry(
          props.defaultCountry,
          incomingCountries,
          props.disableCountryCode
        )
      } else if (props.value !== state.formattedNumber) {
        updateFormattedNumber(props.value)
      }
    }, [ props.defaultCountry ] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const numberInputRef = React.useRef<HTMLInputElement>(null)

  // Put the cursor to the end of the input (usually after a focus event)
  const cursorToEnd = React.useCallback(
    function cursorToEnd (): void {
      const input = numberInputRef.current

      if (input !== null) {
        input.focus()

        const len = input.value.length

        input.setSelectionRange(len, len)
      }
    }, []
  )

  // return country data from state
  const getCountryData = React.useCallback(
    function getCountryData (): CountryData {
      if (state.selectedCountry === undefined) {
        return {
          name: '',
          dialCode: '',
          countryCode: ''
        }
      }

      return {
        name: state.selectedCountry.name || '',
        dialCode: state.selectedCountry.dialCode || '',
        countryCode: state.selectedCountry.iso2 || ''
      }
    }, [ state.selectedCountry ]
  )

  const [ activeIndex, setActiveIndex ] = React.useState(
    function initActiveIndex (): number {
      return state.selectedCountry !== undefined
        ? filteredCountries.indexOf(state.selectedCountry)
        : -1
    }
  )

  const setFilter = React.useCallback(
    function setFilter (value: string): void {
      setActiveIndex(0)
      setFilterOrig(value)
    }, []
  )

  const [ open, setOpen ] = React.useState(false)

  const onDropdownClick = React.useCallback<React.MouseEventHandler>(
    function onDropdownClick (): void {
      setOpen(function setOpen (open): boolean {
        if (props.disabled && !open) {
          return open
        }

        open = !open

        if (state.selectedCountry === undefined) {
          setActiveIndex(-1)
        } else {
          let index = preferredCountries.indexOf(state.selectedCountry)

          if (index !== -1) {
            setActiveIndex(index)
          } else {
            const listCountries = props.disableAreaCodes
              ? deleteAreaCodes(onlyCountries)
              : onlyCountries

            index = listCountries.indexOf(state.selectedCountry)

            setActiveIndex(index + preferredCountries.length)
          }
        }

        return open
      })
    }, [ onlyCountries, preferredCountries, state.selectedCountry, props.disabled, props.disableAreaCodes ]
  )

  const handleInput = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    function handleInput (event): void {
      let selected = state.selectedCountry

      if (!props.countryCodeEditable) {
        const updatedInput = '+' + (selected !== undefined
          ? selected.dialCode
          : '')

        if (event.target.value.length < updatedInput.length) {
          return
        }
      }

      // before entering the number in new format, lets check if the dial code now matches some other country
      const inputNumber = event.target.value.replace(/\D/g, '')

      // Does not exceed 15 digit phone number limit
      if (inputNumber.length > 15) return

      // if the input is the same as before, must be some special key like enter etc.
      if (event.target.value === state.formattedNumber) return

      event.preventDefault()

      let freezeSelection = state.freezeSelection
      let formattedNumber = props.disableCountryCode ? '' : '+'

      if (event.target.value.length > 0) {
        // we don't need to send the whole number to guess the country... only the first 6 characters are enough
        // the guess country function can then use memoization much more effectively since the set of input it
        // gets has drastically reduced
        if (
          state.freezeSelection === false ||
          selected === undefined ||
          selected.dialCode.length > inputNumber.length
        ) {
          selected = guessSelectedCountry(inputNumber.substring(0, 6), incomingCountries, state.defaultCountry)
          freezeSelection = false
        }

        // remove all non numerals from the input
        formattedNumber = formatNumber(inputNumber, selected.format)

        selected = selected.dialCode
          ? selected
          : state.selectedCountry
      }

      let caretPosition = event.target.selectionStart || 0

      const oldFormattedText = state.formattedNumber

      const diff = formattedNumber.length - oldFormattedText.length

      setState(function setState (state): State {
        if (diff > 0) {
          caretPosition = caretPosition - diff
        }

        const lastChar = formattedNumber.charAt(formattedNumber.length - 1)

        if (numberInputRef.current !== null) {
          if (lastChar === ')') {
            numberInputRef.current.setSelectionRange(formattedNumber.length - 1, formattedNumber.length - 1)
          } else if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
            numberInputRef.current.setSelectionRange(caretPosition, caretPosition)
          }
        }

        if (props.onChange instanceof Function) {
          props.onChange(
            formattedNumber,
            getCountryData()
          )
        }

        return {
          ...state,
          formattedNumber,
          freezeSelection,
          selectedCountry: selected,
        }
      })
    }, [ incomingCountries, state, props, formatNumber, getCountryData ]
  )

  const handleInputClick = React.useCallback<React.MouseEventHandler>(
    function handleInputClick (event): void {
      setOpen(function setOpen (): boolean {
        setFilterOrig('')
        return false
      })

      if (props.onClick instanceof Function) {
        props.onClick(event, getCountryData())
      }
    }, [ props, getCountryData ]
  )

  const onSelect = React.useCallback(
    function onSelect (country: Country): void {
      setState(function setState (state): State {
        const unformattedNumber = state.formattedNumber
          .replace(/[ ()-]/g, '')

        const newNumber = unformattedNumber.length > 1 && state.selectedCountry !== undefined
          ? unformattedNumber.replace(state.selectedCountry.dialCode, country.dialCode)
          : country.dialCode

        const formattedNumber = formatNumber(newNumber.replace(/\D/g, ''), country.format)

        if (props.onChange instanceof Function) {
          props.onChange(
            formattedNumber.replace(/\D+/g, ''),
            getCountryData()
          )
        }

        setOpen(false)
        setFilterOrig('')

        window.setTimeout(cursorToEnd, 0)

        return {
          ...state,
          selectedCountry: country,
          freezeSelection: true,
          formattedNumber
        }
      })
    }, [ props, formatNumber, getCountryData, cursorToEnd ]
  )

  const handleInputFocus = React.useCallback<React.FocusEventHandler>(
    function handleInputFocus (event): void {
      // if the input is blank, insert dial code of the selected country
      if (numberInputRef.current !== null) {
        if (
          numberInputRef.current.value === '+' &&
          props.disableCountryCode === false
        ) {
          setState(function setState (state): State {
            if (state.selectedCountry !== undefined) {
              const formattedNumber = '+' + state.selectedCountry.dialCode

              return {
                ...state,
                formattedNumber
              }
            }

            return state
          })
        }
      }

      setState(function setState (state): State {
        return { ...state, placeholder: '' }
      })

      if (props.onFocus instanceof Function) {
        props.onFocus(event, getCountryData())
      }

      window.setTimeout(cursorToEnd, 10)
    }, [ props, getCountryData, cursorToEnd ]
  )

  const handleInputBlur = React.useCallback<React.FocusEventHandler<HTMLInputElement>>(
    function handleInputBlur (event): void {
      if (event.target.value === '') {
        setState(function setState (state): State {
          return {
            ...state,
            placeholder: props.placeholder
          }
        })
      }

      if (props.onBlur instanceof Function) {
        props.onBlur(event, getCountryData())
      }
    }, [ props, getCountryData ]
  )

  // Jump to searched country
  const [ , setSearch ] = React.useState('')

  const searchCountry = React.useCallback(
    function searchCountry (): void {
      setSearch(function setSearch (search): string {
        setActiveIndex(
          getProbableCandidateIndex(search, filteredCountries)
        )
        return ''
      })
    }, [ filteredCountries ]
  )

  const debouncedQueryStingSearcher = React.useMemo(
    function updateSearcher (): () => void {
      return debounce(searchCountry, 250, { isImmediate: false })
    }, [ searchCountry ]
  )

  const rootRef = React.useRef<HTMLDivElement>(null)

  const onBlur = React.useCallback<React.FocusEventHandler>(
    function onBlur (event): void {
      if (rootRef.current !== null && !rootRef.current.contains(event.relatedTarget as Node)) {
        setOpen(false)
        setFilterOrig('')
      }
    }, []
  )

  const onKeyDown = React.useCallback<React.KeyboardEventHandler>(
    function onKeyDown (event): void {
      if (!open || props.disabled) {
        return
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
        case 'Escape':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Backspace':
          event.preventDefault()
          break

        default:
          break
      }

      switch (event.key) {
        case 'ArrowDown':
          setActiveIndex(function setActiveIndex (index): number {
            return (index + 1) % filteredCountries.length
          })
          break

        case 'ArrowUp':
          setActiveIndex(function setActiveIndex (index): number {
            return (index - 1 + filteredCountries.length) % filteredCountries.length
          })
          break

        case 'Enter':
          setActiveIndex(function setActiveIndex (index): number {
            onSelect(filteredCountries[index])
            return index
          })
          break

        case 'Escape':
          setOpen(function setOpen (): boolean {
            window.setTimeout(cursorToEnd, 0)
            setFilterOrig('')
            return false
          })
          break

        case 'Backspace':
          setSearch(function setSearch (search): string {
            debouncedQueryStingSearcher()
            return search.slice(0, -1)
          })
          break

        default: {
          const key = event.key.toLowerCase()
          if (key.length === 1 && /[ a-z]/.test(key)) {
            setSearch(function setSearch (search): string {
              debouncedQueryStingSearcher()
              return search + key
            })
          }
          break
        }
      }
    }, [ open, filteredCountries, props.disabled, cursorToEnd, onSelect, debouncedQueryStingSearcher ]
  )

  const handleInputKeyDown = React.useCallback<React.KeyboardEventHandler>(
    function handleInputKeyDown (event): void {
      if (event.key === 'Enter') {
        props.onEnterKeyPress(event)
      }

      if (props.onKeyDown instanceof Function) {
        props.onKeyDown(event)
      }
    }, [ props ]
  )

  return (
    <div className={props.containerClass} >
      <div // eslint-disable-line jsx-a11y/no-static-element-interactions
        className={
          classnames(props.buttonClass, {
            [props.openDropdownClass]: open
          })
        }
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        ref={rootRef}
      >
        <button
          aria-haspopup='listbox'
          aria-expanded={open}
          aria-label={state.selectedCountry ? `${state.selectedCountry.name}: + ${state.selectedCountry.dialCode}` : ''}
          className={props.selectedFlagClass}
          disabled={props.disableDropdown}
          onClick={onDropdownClick}
          type='button'
        >
          <div
            role='img'
            aria-hidden
            className={
              classnames(
                props.flagClass,
                state.selectedCountry !== undefined
                  ? state.selectedCountry.iso2
                  : undefined
              )
            }
          />

          {
            props.disableDropdown || (
              <div
                role='img'
                aria-hidden
                className={
                  classnames(
                    props.phoneInputArrowClass, {
                      [props.phoneInputArrowUpClass]: open
                    }
                  )
                }
              />
            )
          }
        </button>

        <Listbox
          id={state.id}
          open={open}
          filter={filter}
          activeIndex={activeIndex}
          localization={props.localization}
          preferredLength={filteredPreferredCountries.length}
          filteredCountries={filteredCountries}
          enableSearchField={props.enableSearchField}
          disableSearchIcon={props.disableSearchIcon}
          disableAreaCodes={props.disableAreaCodes}
          searchPlaceholder={props.searchPlaceholder}

          listboxClass={props.listboxClass}
          searchClass={props.searchClass}
          hideClass={props.hideClass}
          listboxDividerClass={props.listboxDividerClass}
          searchEmojiClass={props.searchEmojiClass}
          dropDownBoxClass={props.dropDownBoxClass}
          noEntriesMessageClass={props.noEntriesMessageClass}

          flagClass={props.flagClass}
          listboxItemClass={props.listboxItemClass}
          listboxItemIconClass={props.listboxItemIconClass}
          listboxItemNameClass={props.listboxItemNameClass}
          listboxItemDescClass={props.listboxItemDescClass}
          listboxItemActiveClass={props.listboxItemActiveClass}
          setFilter={setFilter}
          onSelect={onSelect}
        />
      </div>

      <input
        id={state.id}
        type='tel'
        ref={numberInputRef}
        value={state.formattedNumber}
        disabled={props.disabled}
        placeholder={state.placeholder}
        className={
          classnames(
            props.inputClass, {
              [props.invalidInputClass]: !props.isValid(state.formattedNumber.replace(/\D/g, ''))
            }
          )
        }
        onKeyDown={handleInputKeyDown}
        onChange={handleInput}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        {...props.inputExtraProps}
      />
    </div>
  )
}

ReactPhoneInput.defaultProps = {
  excludeCountries: [],
  onlyCountries: [],
  preferredCountries: [],
  defaultCountry: '',

  value: '',
  placeholder: '+1 (702) 123-4567',
  searchPlaceholder: 'search',
  disabled: false,

  autoFormat: true,
  disableAreaCodes: false,

  isValid (inputNumber: string): boolean {
    return allCountries.some(function some (country): boolean {
      return inputNumber.startsWith(country.dialCode) || country.dialCode.startsWith(inputNumber)
    })
  },

  disableCountryCode: false,
  disableDropdown: false,
  enableLongNumbers: false,
  countryCodeEditable: true,
  enableSearchField: false,
  disableSearchIcon: false,

  inputExtraProps: {},
  localization: {},
  masks: {},

  onEnterKeyPress (): void {}
}

export default ReactPhoneInput
