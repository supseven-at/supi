
.PHONY: build
build: vendor/autoload.php Build/node_modules/.yarn-integrity

frontend: Build/node_modules/.yarn-integrity
	@cd Build && yarn gulp

fix: vendor/autoload.php
	@bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff

lint: vendor/autoload.php
	@bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff --dry-run

test: vendor/autoload.php
	@bin/phpunit --bootstrap vendor/autoload.php Tests/

.PHONY: clean
clean:
	@rm -f vendor/autoload.php .php_cs.cache

.PHONY: clobber
clobber: clean
	@rm -rf vendor bin

vendor/autoload.php:
	@composer install --ignore-platform-reqs --no-plugins --no-scripts && touch vendor/autoload.php

Build/node_modules/.yarn-integrity:
	@cd Build && yarn install --frozen-lockfile --prefer-offline && touch node_modules/.yarn-integrity
