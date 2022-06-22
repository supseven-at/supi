
.PHONY: build
build: vendor/autoload.php Build/node_modules/.yarn-integrity

frontend: Resources/Public/Css/Supi.css Resources/Public/JavaScript/Supi.js

fix: vendor/autoload.php Build/node_modules/.yarn-integrity
	bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff
	cd Build && ./node_modules/.bin/prettier --write .

lint: vendor/autoload.php Build/node_modules/.yarn-integrity
	@bin/php-cs-fixer fix --config=.php-cs-fixer.php --diff --dry-run
	cd Build && ./node_modules/.bin/prettier --check .

test: vendor/autoload.php
	@bin/phpunit --bootstrap vendor/autoload.php Tests/

.PHONY: clean
clean:
	@rm -f vendor/autoload.php .php_cs.cache Resources/Public/Css/Supi.css Resources/Public/JavaScript/Supi.js

.PHONY: clobber
clobber: clean
	@rm -rf vendor bin

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
