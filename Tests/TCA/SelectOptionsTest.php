<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\TCA;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\TCA\SelectOptions;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManager;

/**
 * Test the select options helper
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SelectOptionsTest extends TestCase
{
    public function testGetFromExistingRecords(): void
    {
        $pid = 2;
        $setup = [
            'plugin.' => [
                'tx_supi.' => [
                    'settings.' => [
                        'services.' => [
                            'first.' => [
                                'label' => 'First',
                            ],
                            'second.' => [
                                'label' => 'LLL:sec',
                            ],
                            'third.' => [
                                'label'    => 'Third',
                                'internal' => 1,
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $configMgr = $this->createMock(ConfigurationManager::class);
        $configMgr->expects($this->once())
            ->method('getConfiguration')
            ->with(self::equalTo(ConfigurationManager::CONFIGURATION_TYPE_FULL_TYPOSCRIPT))
            ->willReturn($setup);

        $languageService = $this->createMock(\TYPO3\CMS\Core\Localization\LanguageService::class);
        $languageService->expects(static::any())->method('sL')->with(static::equalTo('LLL:sec'))->willReturn('Second');

        $GLOBALS['BE_USER'] = $this->createMock(BackendUserAuthentication::class);
        $languageServiceFactory = $this->createMock(LanguageServiceFactory::class);
        $languageServiceFactory
            ->expects(static::once())
            ->method('createFromUserPreferences')
            ->with(self::equalTo($GLOBALS['BE_USER']))
            ->willReturn($languageService);

        $subject = new SelectOptions($languageServiceFactory, $configMgr);
        $expected = [
            'row' => [
                'uid' => 3,
                'pid' => $pid,
            ],
            'items' => [
                ['label' => 'First', 'value' => 'first'],
                ['label' => 'Second', 'value' => 'second'],
            ],
        ];
        $actual = [
            'row' => [
                'uid' => 3,
                'pid' => $pid,
            ],
        ];
        $subject->addServices($actual);

        static::assertSame($expected, $actual);
    }

    public function testGetFromNewRecords(): void
    {
        $pid = 2;
        $setup = [
            'plugin.' => [
                'tx_supi.' => [
                    'settings.' => [
                        'services.' => [
                            'first.' => [
                                'label' => 'First',
                            ],
                            'second.' => [
                                'label' => 'LLL:sec',
                            ],
                            'third.' => [
                                'label'    => 'Third',
                                'internal' => 1,
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $configMgr = $this->createMock(ConfigurationManager::class);
        $configMgr->expects($this->once())
            ->method('getConfiguration')
            ->with(self::equalTo(ConfigurationManager::CONFIGURATION_TYPE_FULL_TYPOSCRIPT))
            ->willReturn($setup);

        $languageService = $this->createMock(\TYPO3\CMS\Core\Localization\LanguageService::class);
        $languageService->expects(static::any())->method('sL')->with(static::equalTo('LLL:sec'))->willReturn('Second');

        $GLOBALS['BE_USER'] = $this->createMock(BackendUserAuthentication::class);
        $languageServiceFactory = $this->createMock(LanguageServiceFactory::class);
        $languageServiceFactory
            ->expects(static::once())
            ->method('createFromUserPreferences')
            ->with(self::equalTo($GLOBALS['BE_USER']))
            ->willReturn($languageService);

        $GLOBALS['TCA']['tt_content']['ctrl']['delete'] = false;

        $subject = new SelectOptions($languageServiceFactory, $configMgr);
        $expected = [
            'row' => [
                'uid' => 'NEW123',
                'pid' => -$pid,
            ],
            'items' => [
                ['label' => 'First', 'value' => 'first'],
                ['label' => 'Second', 'value' => 'second'],
            ],
        ];
        $actual = [
            'row' => [
                'uid' => 'NEW123',
                'pid' => -$pid,
            ],
        ];
        $subject->addServices($actual);

        static::assertSame($expected, $actual);
    }
}
