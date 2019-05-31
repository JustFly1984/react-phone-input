# Getting Started

## Install @react-google-maps/api

```bash
npm install --save @react-pone-input/input
# or
yarn add @react-pone-input/input
```

```js static
import '@react-phone-input/input/lib/styles/flag.css'
import '@react-phone-input/input/lib/styles/phone-input.css'

import ReactPhoneInput from '@react-phone-input/input'

class MyComponents extends Component {
  render() {
     return (
      <ReactPhoneInput
        flagClass={"ReactPhoneInput__flag"}
        containerClass={"ReactPhoneInput__container"}
        inputClass={"ReactPhoneInput__input"}
        buttonClass={"ReactPhoneInput__button"}
        selectedFlagClass={"ReactPhoneInput__selectedFlag"}
        phoneInputArrowClass={"ReactPhoneInput__phoneInputArrow"}
        phoneInputArrowUpClass={"ReactPhoneInput__phoneInputArrowUp"}
        openDropdownClass={"ReactPhoneInput__openDropdown"}
        invalidInputClass={"ReactPhoneInput__invalidInput"}

        listboxClass={"ReactPhoneInput__listbox"}
        searchClass={"ReactPhoneInput__search"}
        hideClass={"ReactPhoneInput__hide"}
        listboxDividerClass={"ReactPhoneInput__listboxDivider"}
        searchEmojiClass={"ReactPhoneInput__searchEmoji"}
        dropDownBoxClass={"ReactPhoneInput__dropDownBox"}
        noEntriesMessageClass={"ReactPhoneInput__noEntriesMessage"}

        listboxItemClass={"ReactPhoneInput__listboxItem"}
        listboxItemIconClass={"ReactPhoneInput__listboxItemIcon"}
        listboxItemNameClass={"ReactPhoneInput__listboxItemName"}
        listboxItemDescClass={"ReactPhoneInput__listboxItemDesc"}
        listboxItemActiveClass={"ReactPhoneInput__listboxItemActive"}
      />
     )
  }
}
```
