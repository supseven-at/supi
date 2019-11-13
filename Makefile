
.PHONY: build
build: vendor/autoload.php

fix: vendor/autoload.php
	@bin/php-cs-fixer fix --config=.php_cs --diff -vvv

lint: vendor/autoload.php
	@bin/php-cs-fixer fix --config=.php_cs --diff -vvv --dry-run

test: vendor/autoload.php
	@bin/phpunit -c phpunit.xml

.PHONY: clean
clean:
	@rm -f vendor/autoload.php .php_cs.cache

.PHONY: clobber
clobber: clean
	@rm -rf vendor bin

vendor/autoload.php:
	@composer install
