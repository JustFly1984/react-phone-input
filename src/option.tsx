import * as React from 'react'
import classnames from 'classnames'

import { Country, Localization } from './types'

function getDropdownCountryName (country: Country, localization: Localization): string {
  return localization[country.name] ||
    localization[country.iso2] ||
    country.name
}

interface OwnProps {
  id: string;
  active: boolean;
  country: Country;

  flagClass: string;
  listboxItemClass: string;
  listboxItemIconClass: string;
  listboxItemNameClass: string;
  listboxItemDescClass: string;
  listboxItemActiveClass: string;

  localization: Localization;
  onSelect (country: Country): void;
}

function scrollToElement (element: HTMLElement | null): void {
  if (element !== null && element.parentElement !== null) {
    const parent = element.parentElement

    if (
      parent.offsetTop + parent.scrollTop > element.offsetTop ||
      parent.offsetTop + parent.scrollTop + parent.offsetHeight < element.offsetTop + element.offsetHeight
    ) {
      parent.scrollTop = element.offsetTop + element.offsetHeight / 2 - parent.offsetHeight / 2 - parent.offsetTop
    }
  }
}

function onKeyDown (): void {}

function Option (props: OwnProps): JSX.Element {
  const itemRef = React.useRef<HTMLLIElement>(null)

  React.useEffect(
    function onActivate (): void {
      if (props.active) {
        scrollToElement(itemRef.current)
      }
    }, [ props.active ]
  )

  const onClick = React.useCallback<React.MouseEventHandler>(
    function onClick (): void {
      props.onSelect(props.country)
    }, [ props ]
  )

  return (
    <li
      id={props.id}
      ref={itemRef}
      role='option'
      aria-selected={props.active}
      className={
        classnames(
          props.listboxItemClass, {
            [props.listboxItemActiveClass]: props.active
          }
        )
      }
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <div
        className={
          classnames(
            props.flagClass,
            props.listboxItemIconClass,
            props.country.iso2
          )
        }
      />

      <span className={props.listboxItemNameClass}>
        {
          getDropdownCountryName(props.country, props.localization)
        }
      </span>

      <span className={props.listboxItemDescClass}>
        {'+' + props.country.dialCode}
      </span>
    </li>
  )
}

export default React.memo(Option)
