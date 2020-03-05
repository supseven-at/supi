#!/usr/bin/env bash

cd $(dirname $0 && pwd)

set -e -u

PHPs='7.2
7.3
7.4';

TYPO3s='typo3/cms-core:^8.7 typo3/cms-extbase:^8.7 typo3/cms-fluid:^8.7 typo3/cms-frontend:^8.7
typo3/cms-core:^9.5 typo3/cms-extbase:^9.5 typo3/cms-fluid:^9.5 typo3/cms-frontend:^9.5
typo3/cms-core:^10 typo3/cms-extbase:^10 typo3/cms-fluid:^10 typo3/cms-frontend:^10'

C_HOME="$(composer global config home -q)"
C_CACHE="$(composer global config cache-dir -q)"
BASE_DIR="$(cd $(dirname $0) && pwd)"

cd ${BASE_DIR}

single_docker_cmd() {
    docker run --rm -it \
        -v "${C_HOME}:/var/lib/composer" -e COMPOSER_HOME=/var/lib/composer \
        -v "${C_CACHE}:/var/cache/composer" -e COMPOSER_CACHE_DIR=/var/cache/composer \
        -v ${BASE_DIR}:/opt/build -w /opt/build \
        garfieldius/typo3-ci:php${1}-node12 sh -c "${2}"
}

run_test() {
    echo "Testing ${1} with PHP ${2}"
    git checkout -- composer.json
    cat composer.json | jq 'del(.require)' > composer.json
    rm -rf composer.lock vendor bin typo3_src typo3 index.php

    single_docker_cmd "${2}" "composer require --ansi -n --no-suggest --no-progress -vv --no-plugins --no-scripts ${1}"
    single_docker_cmd "${2}" 'php ./bin/phpunit -c phpunit.xml'
}

# Only PHP for v7
run_test "typo3/cms:^7.6" "7.2"

# Full matrix for newer
for t3 in ${TYPO3s}; do
    for php in ${PHPs}; do
        run_test "${t3}" "${php}"
    done
done

git checkout -- composer.json composer.lock
rm -rf composer.lock vendor bin typo3_src typo3 index.php
