
RELEASE_VERSION ?= $(git tag -l | sort -V | tail -n 1)
PREV_VERSION = $(shell php .github/helper/find-previous-version.php $(RELEASE_VERSION))

.PHONY: build
build: vendor/autoload.php Build/node_modules/.yarn-integrity

.PHONY: frontend
frontend: Resources/Public/Css/Supi.css Resources/Public/JavaScript/Supi.js

.PHONY: fix
fix: vendor/autoload.php Build/node_modules
	vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
	cd Build && yarn format

.PHONY: lint
lint: vendor/autoload.php Build/node_modules
	vendor/bin/php-cs-fixer check --config=.php-cs-fixer.php --diff
	cd Build && yarn lint

.PHONY: test
test: vendor/autoload.php
	vendor/bin/phpunit --configuration phpunit.xml

.PHONY: clean
clean:
	@rm -rf vendor/autoload.php .php-cs-fixer.cache .phpunit.result.cache .phpunit.cache Resources/Public/Css/Supi.css Resources/Public/Css/Supi.css.map Resources/Public/Css/Supi.js Resources/Public/JavaScript/Supi.js Resources/Public/JavaScript/Supi.js.map

.PHONY: docs
docs: ## Render documentation as static HTML
	docker run --rm --pull always -v $(CURDIR):/project -it ghcr.io/typo3-documentation/render-guides:latest run /project/Documentation --output=/project/Documentation-GENERATED-temp

.PHONY: docs-watch
docs-watch: ## Render documentation and start live-reload server on http://0.0.0.0:8080
	docker run --rm --pull always -v $(CURDIR):/project -p 8080:8080 -it ghcr.io/typo3-documentation/render-guides:latest run /project/Documentation --watch --host=0.0.0.0 --port=8080

.PHONY: clobber
clobber: clean
	@rm -rf vendor bin release Build/node_modules

.PHONY: release
release: release/supi.zip release/changelog.md release/ter_notes.md ## Create release artifact

Resources/Public/JavaScript/Supi.js Resources/Public/Css/Supi.css: Build/node_modules $(shell find Build/Src -type f)
	cd Build && yarn build

vendor/autoload.php:
	composer install --ignore-platform-reqs --no-plugins --no-scripts && touch vendor/autoload.php

Build/node_modules: Build/package.json Build/yarn.lock
	cd Build && yarn install && touch node_modules

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
