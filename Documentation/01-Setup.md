# Installation

Use composer add the package as a dependency: `composer require supseven/supi`

Then add the Typoscript to the setup:

```typo3_typoscript
# Old style
<INCLUDE_TYPOSCRIPT: source="FILE:supi/Configuration/TypoScript/setup.typoscript">

# New style
@import "FILE:supi/Configuration/TypoScript/setup.typoscript";
```

The banner and the content elements are now available in both backend and
frontend.

# Setup

## Typoscript

All setup

## CSS

## Integrate into custom frontend build

First, remove the Typoscript that includes the pre-built assets:

```typo3_typoscript
page {
    includeJS.supi >
    includeCSS.supi >
}
```

### CSS / CSS

Include the pre-built file `supi/Resources/Public/Css/Supi.css` or include the
source scss from the Build/Src folder:

```scss
// Set custom variables
$supi-font-size: 1.2rem;
// Include the styles and default variables
@import "../supi/Build/Src/Scss/Supi";
```

### JS / TS

Include the pre-built file `supi/Resources/Public/JavaScript/Supi.js` or load
the Supi class from the Build/Src folder
and instantiate it:

```ts
// Import supi
import { Supi } from "../supi/Build/Src/JavaScript/Supi"

// on load
const initSupi = (): void => {
    // instantiate, keeping a variable with it is optional
    (window as any).supi = new Supi();
    // Make sure its run only once
    window.removeEventListener("load", initSupi);
};
window.addEventListener("load", initSupi);
```
