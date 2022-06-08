#!/usr/bin/env bash

BASE_DIR="$(cd "$(dirname $0)" && pwd)"
cd "${BASE_DIR}"

set -eu -o pipefail

COMBOS='8.7,7.2,10,:^7
8.7,7.3,10,:^7
8.7,7.4,16,:^7

9.5,7.2,10,:^8
9.5,7.3,10,:^8
9.5,7.4,16,:^8

10.4,7.2,10,:^8
10.4,7.3,10,:^8
10.4,7.4,16,:^8

11.5,7.4,16,:^8
11.5,8.0,16,:^9
11.5,8.1,16,:^9
'

C_HOME="$(composer global config home -q)"
C_CACHE="$(composer global config cache-dir -q)"
Y_CACHE="$(dirname "$(yarn cache dir)")"

single_docker_cmd() {
    docker run --rm -it \
        -u "$(id -u):$(id -g)" \
        -v "${C_HOME}:/var/lib/composer" -e COMPOSER_HOME=/var/lib/composer \
        -v "${C_CACHE}:/var/cache/composer" -e COMPOSER_CACHE_DIR=/var/cache/composer \
        -v "${Y_CACHE}:/var/cache/yarn" -e YARN_CACHE_FOLDER=/var/cache/yarn \
        -v "${BASE_DIR}:/build" -w /build \
        garfieldius/typo3-ci:php${1} bash -e -c "${2}"
}

run_test() {
    echo "Testing ${1} with PHP ${2}"
    git checkout -- composer.json
    jq 'del(.require)' composer.json | jq 'del(.["require-dev"])' > c.json
    rm -rf composer.lock vendor bin typo3_src typo3 index.php composer.json
    mv c.json composer.json

    IMG_TAG="${2}-node${5}"

    single_docker_cmd "${IMG_TAG}" "composer require -q --ansi -n --no-progress --no-plugins --no-scripts ${3}"
    single_docker_cmd "${IMG_TAG}" "composer require -q --dev --ansi -n --no-progress --no-plugins --no-scripts -W mikey179/vfsstream phpunit/phpunit${4}"
    single_docker_cmd "${IMG_TAG}" 'php ./bin/phpunit --bootstrap vendor/autoload.php Tests'

    git checkout -- composer.json composer.lock
}

run_legacy() {
    run_test "${1}" "${2}" "'typo3/cms:^${1}'" ":^${3}" "10"
}

run_current() {
    run_test "${1}" "${2}" "'typo3/cms-backend:^${1}' 'typo3/cms-core:^${1}' 'typo3/cms-extbase:^${1}' 'typo3/cms-fluid:^${1}' 'typo3/cms-frontend:^${1}'" "${3:-:*}" "${4}"
}

# Test legacy version
run_legacy "7.6" "7.2" "7"

# Full matrix for newer
for COMBO in $(echo ${COMBOS}); do
    IFS=',' read -r -a PARTS <<< "${COMBO}"
    run_current "${PARTS[0]}" "${PARTS[1]}" "${PARTS[3]}" "${PARTS[2]}"
done
