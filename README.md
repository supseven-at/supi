# Super User Privacy Interaction

Install

Add the repository to the composer manifest:

When using the API (will ask for an access token on first run):

```json
{
    "repositories": [
        {"type":  "gitlab", "url": "https://gitlab.sup7.at/supseven/supi"}
    ]
}
```

When using git-clone directly:

```json
{
    "repositories": [
        {"type":  "git", "url": "ssh://git@gitlab.sup7.at:10022/supseven/supi.git"}
    ]
}
```

And run `composer req supseven/supi`
