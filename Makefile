
RELEASE_VERSION ?= $(git tag -l | sort -V | tail -n 1)
PREV_VERSION = $(shell php .github/helper/find-previous-version.php $(RELEASE_VERSION))

.PHONY: build
build: vendor/autoload.php Build/node_modules/.yarn-integrity

.PHONY: frontend
frontend: Resources/Public/Css/Supi.css Resources/Public/JavaScript/Supi.js

.PHONY: fix
fix: vendor/autoload.php Build/node_modules/.yarn-integrity
	vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
	cd Build && ./node_modules/.bin/prettier --write .

.PHONY: lint
lint: vendor/autoload.php Build/node_modules/.yarn-integrity
	vendor/bin/php-cs-fixer check --config=.php-cs-fixer.php --diff
	cd Build && ./node_modules/.bin/prettier --check .

.PHONY: test
test: vendor/autoload.php
	vendor/bin/phpunit --configuration phpunit.xml

.PHONY: clean
clean:
	@rm -rf vendor/autoload.php .php-cs-fixer.cache .phpunit.result.cache .phpunit.cache Resources/Public/Css/Supi.css Resources/Public/JavaScript/Supi.js

.PHONY: clobber
clobber: clean
	@rm -rf vendor bin release

.PHONY: release
release: release/supi.zip release/changelog.md release/ter_notes.md ## Create release artifact

Resources/Public/JavaScript/Supi.js: Build/node_modules/.yarn-integrity $(wildcard Build/Src/**/*.ts)
	rm -f Resources/Public/JavaScript/Supi.js
	cd Build && ./node_modules/.bin/gulp Frontend:JS

Resources/Public/Css/Supi.css: Build/node_modules/.yarn-integrity $(wildcard Build/Src/**/*.scss)
	rm -f Resources/Public/Css/Supi.css
	cd Build && ./node_modules/.bin/gulp Frontend:SCSS

vendor/autoload.php:
	composer install --ignore-platform-reqs --no-plugins --no-scripts && touch vendor/autoload.php

Build/node_modules/.yarn-integrity: Build/package.json Build/yarn.lock
	cd Build && yarn install --frozen-lockfile --prefer-offline && touch node_modules/.yarn-integrity

release/changelog.md:
	mkdir -p release
	git log --format='* %h %s' $(PREV_VERSION)..$(RELEASE_VERSION) > release/changelog.md

release/ter_notes.md:
	mkdir -p release
	git log --format='* %s' $(PREV_VERSION)..$(RELEASE_VERSION) | sed -r 's/\[\S+\] //' > release/ter_notes.md

release/supi.zip:
	mkdir -p release/supi
	cp -a Classes Configuration Documentation Resources composer.json ext_emconf.php LICENSE README.rst release/supi
	php .github/helper/set-version.php $(RELEASE_VERSION) release/supi
	cd release && zip -r supi.zip supi
