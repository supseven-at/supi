# Supseven User Privacy Interface

## Installation

1. Add the package to the composer manifest: `composer req supseven/supi`.
2. Include the TypoScript file `EXT:supi/Configuration/TypoScript/setup.typoscript`
3. Include into the template with the view helper `<supi:banner />` or the Typoscript cObject `lib.elements.supi`

## Customization

Change/override the properties in `plugin.tx_supi` to customize. The sources for the Javascript and the CSS 
are Typescript and SCSS, which can be included in custom build piplines. 

You can adjust most of the settings via scss variables or css variables. this will fit most of 
the usecases.

## License

[GPL 3.0 or later](LICENSE)
