# Super User Privacy Interaction

## Installation

Add the repository to the composer manifest:

When using the API (needs an access token):

```json
{
    "repositories": [
        {"type": "gitlab", "url": "https://gitlab.sup7.at/supseven/supi"}
    ],
    "config": {
        "gitlab-domains": [ "gitlab.sup7.at" ]
    }
}
```

When using git-clone directly (needs rsa keys):

```json
{
    "repositories": [
        {"type": "git", "url": "ssh://git@gitlab.sup7.at:10022/supseven/supi.git"}
    ]
}
```

And run `composer req supseven/supi`. Use `composer req supseven/supi:dev-master` when making changes.
