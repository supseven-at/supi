#!/usr/bin/env bash

cd $(dirname $0 && pwd)

set -e -u

PHPS='7.2
7.3
7.4';

C_HOME="$(composer global config home -q)"
C_CACHE="$(composer global config cache-dir -q)"
BASE_DIR="$(cd $(dirname $0) && pwd)"

run-tests () {
    for php in ${PHPS}; do
        echo "Testing ${1} with PHP ${php}"
        docker run --rm -t -d --name test-supi \
            -v "${C_HOME}:/var/lib/composer" -e COMPOSER_HOME=/var/lib/composer \
            -v "${C_CACHE}:/var/cache/composer" -e COMPOSER_CACHE_DIR=/var/cache/composer \
            -v ${BASE_DIR}:/opt/build -w /opt/build \
            garfieldius/typo3-ci:php${php}-node12 sh -c 'sleep 86400'

        docker exec -it test-supi sh -c "git checkout -- composer.json"
        docker exec -it test-supi sh -c "rm -rf composer.lock vendor bin typo3_src"
        docker exec -it test-supi sh -c "composer require --ignore-platform-reqs --ansi -n --no-suggest --no-progress --no-plugins --no-scripts --quiet ${1}"
        docker exec -it test-supi sh -c "composer require --ignore-platform-reqs --dev --ansi -n --no-suggest --no-progress --no-plugins --no-scripts --quiet  phpunit/phpunit"
        docker exec -it test-supi sh -c "php ./bin/phpunit -c phpunit.xml"

        docker rm -f test-supi
    done
}

run-tests 'typo3/cms:^7'
run-tests 'typo3/cms-fluid:^8 typo3/cms-frontend:^8'
run-tests 'typo3/cms-fluid:^9 typo3/cms-frontend:^9'
run-tests 'typo3/cms-fluid:^10 typo3/cms-frontend:^10'
