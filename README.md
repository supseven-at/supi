# Supseven User Privacy Interface

## Installation

1. Add the package to the composer manifest: `composer req supseven/supi`.
2. Include the TypoScript file `EXT:supi/Configuration/TypoScript/setup.typoscript`
3. Include into the template with Typoscript cObject `lib.elements.supi`

## Integration

Make every javascript a template by changing the `type` property to `application/supi` and add a data attribute
named `data-supi-cookies` containing a list of the cookies it uses.

```html
<-- eg: for Google Analytics -->
<script type="application/supi" data-supi-cookies="_ga">[google analytics snippet]</script>
```

The cookies in the data attribute must also be configured in TypoScript by adding them to the `names` property
in the corect section.

## Customization

Change/override the properties in `plugin.tx_supi` to customize. The sources for the Javascript and the CSS
are Typescript and SCSS, which can be included in custom build piplines.

You can adjust most of the settings via scss variables or css variables. this will fit most of
the usecases.

## License

[GPL 3.0 or later](LICENSE)
