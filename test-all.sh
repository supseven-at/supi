#!/usr/bin/env bash

cd $(dirname $0 && pwd)

set -e -u

run-tests () {
    git checkout -- composer.json
    rm -rf composer.lock vendor bin typo3_src
    echo "Loading ${1}"
    composer require --ignore-platform-reqs --ansi -n --no-suggest --no-progress --no-plugins --no-scripts --quiet ${1}
    php ./bin/phpunit -c phpunit.xml
}

run-tests 'typo3/cms:^7'
run-tests 'typo3/cms-fluid:^8 typo3/cms-frontend:^8'
run-tests 'typo3/cms-fluid:^9 typo3/cms-frontend:^9'
run-tests 'typo3/cms-fluid:^10 typo3/cms-frontend:^10'
