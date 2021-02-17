#!/usr/bin/env bash

BASE_DIR="$(cd $(dirname $0) && pwd)"
cd "${BASE_DIR}"

set -e -u

PHPs='7.2-node10
7.3-node12
7.4-node14';

TYPO3s='9.5
10.4'

C_HOME="$(composer global config home -q)"
C_CACHE="$(composer global config cache-dir -q)"

cd ${BASE_DIR}

single_docker_cmd() {
    docker run --rm -it \
        -u $(id -u):$(id -g) \
        -v "${C_HOME}:/var/lib/composer" -e COMPOSER_HOME=/var/lib/composer \
        -v "${C_CACHE}:/var/cache/composer" -e COMPOSER_CACHE_DIR=/var/cache/composer \
        -v ${BASE_DIR}:/build -w /build \
        garfieldius/typo3-ci:php${1} bash -e -c "${2}"
}

run_test() {
    echo "Testing ${1} with PHP ${2}"
    git checkout -- composer.json
    jq 'del(.require)' composer.json | jq 'del(.["require-dev"])' > c.json
    rm -rf composer.lock vendor bin typo3_src typo3 index.php composer.json
    mv c.json composer.json

    single_docker_cmd "${2}" "composer require --ansi -n --no-progress --no-plugins --no-scripts 'typo3/cms-core:^${1}' 'typo3/cms-extbase:^${1}' 'typo3/cms-fluid:^${1}' 'typo3/cms-frontend:^${1}'"
    single_docker_cmd "${2}" "composer require --dev --ansi -n --no-progress --no-plugins --no-scripts phpunit/phpunit"
    single_docker_cmd "${2}" 'php ./bin/phpunit -c phpunit.xml'
}

# Full matrix for newer
for t3 in ${TYPO3s}; do
    for php in ${PHPs}; do
        run_test "${t3}" "${php}"
    done
done
