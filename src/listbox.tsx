import * as React from 'react'
import classnames from 'classnames'

import Option from './option'

import { Country, Localization } from './types'

interface OwnProps {
  id: string;
  open: boolean;
  filter: string;

  enableSearchField: boolean;
  disableSearchIcon: boolean;
  disableAreaCodes: boolean;

  searchPlaceholder?: string;
  localization: Localization;

  listboxClass: string;
  searchClass: string;
  hideClass: string;
  listboxDividerClass: string;
  searchEmojiClass: string;
  dropDownBoxClass: string;
  noEntriesMessageClass: string;

  flagClass: string;
  listboxItemClass: string;
  listboxItemIconClass: string;
  listboxItemNameClass: string;
  listboxItemDescClass: string;
  listboxItemActiveClass: string;

  preferredLength: number;
  filteredCountries: Country[];
  activeIndex: number;

  setFilter (value: string): void;
  onSelect (country: Country): void;
}

export default function Listbox (props: OwnProps): JSX.Element {
  const countryDropdownList = React.useMemo(
    function setCountryDropdownList (): JSX.Element[] {
      let countryDropdownList = props.filteredCountries.map(function mapper (country, index): JSX.Element {
        const active = props.activeIndex === index
        const id = `${props.id}-option-${index}`

        return (
          <Option
            id={id}
            key={index}
            active={props.open && active}
            flagClass={props.flagClass}
            listboxItemClass={props.listboxItemClass}
            listboxItemIconClass={props.listboxItemIconClass}
            listboxItemNameClass={props.listboxItemNameClass}
            listboxItemDescClass={props.listboxItemDescClass}
            listboxItemActiveClass={props.listboxItemActiveClass}
            country={country}
            localization={props.localization}
            onSelect={props.onSelect}
          />
        )
      })

      // let's insert a dashed line in between preffered countries and the rest
      if (props.preferredLength > 0 && props.preferredLength !== props.filteredCountries.length) {
        const dashedLi = (<li key={'dashes'} className={props.listboxDividerClass} />)

        countryDropdownList.splice(props.preferredLength, 0, dashedLi)
      }

      return countryDropdownList
    }, [ props ]
  )

  const ref = React.useRef<HTMLUListElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(
    function onMount (): void {
      if (props.open) {
        if (inputRef.current !== null) {
          inputRef.current.focus()
        } else if (ref.current !== null) {
          ref.current.focus()
        }
      }
    }, [ props.open ]
  )

  const onKeyDown = React.useCallback<React.KeyboardEventHandler>(
    function onKeyDown (event): void {
      switch (event.key) {
        case 'Enter':
        case 'Escape':
        case 'ArrowUp':
        case 'ArrowDown':
          break

        default:
          event.stopPropagation()
          break
      }
    }, []
  )

  const onChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    function onChange ({ target: { value } }): void {
      props.setFilter(value)
    }, [ props ]
  )

  return (
    <div
      className={
        classnames(
          props.listboxClass, {
            [props.hideClass]: !props.open
          }
        )
      }
    >
      {
        props.enableSearchField && (
          <div
            role='combobox'
            aria-controls={`${props.id}-listbox`}
            aria-haspopup='listbox'
            aria-expanded
            className={props.searchClass}
          >
            {
              props.disableSearchIcon || (
                <span
                  role='img'
                  aria-label='Magnifying glass'
                  className={props.searchEmojiClass}
                >
                  &#128270;
                </span>
              )
            }

            <input
              ref={inputRef}
              id={`${props.id}-search`}
              aria-autocomplete='list'
              aria-controls={`${props.id}-listbox`}
              aria-activedescendant={
                props.activeIndex !== -1
                  ? `${props.id}-option-${props.activeIndex}`
                  : undefined
              }
              className={props.searchClass}
              type='search'
              value={props.filter}
              placeholder={props.searchPlaceholder}
              onKeyDown={onKeyDown}
              onChange={onChange}
            />
          </div>
        )
      }

      <ul // eslint-disable-line jsx-a11y/aria-activedescendant-has-tabindex
        ref={ref}
        role='listbox'
        id={`${props.id}-listbox`}
        tabIndex={props.enableSearchField ? -1 : 0}
        aria-activedescendant={
          !props.enableSearchField && props.activeIndex !== -1
            ? `${props.id}-option-${props.activeIndex}`
            : undefined
        }
        className={props.dropDownBoxClass}
      >
        {
          countryDropdownList.length > 0
            ? countryDropdownList
            : (
              <li className={props.noEntriesMessageClass}>
                <span>No entries to show.</span>
              </li>
            )
        }
      </ul>
    </div>
  )
}
