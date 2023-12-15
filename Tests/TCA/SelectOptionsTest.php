<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\TCA;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\TCA\SelectOptions;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\DefaultRestrictionContainer;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\TypoScript\TemplateService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\RootlineUtility;

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
        $rootLine = [['uid' => $pid], ['uid' => 1]];
        $rootlineUtil = $this->createMock(RootlineUtility::class);
        $rootlineUtil->expects(static::once())->method('get')->willReturn($rootLine);

        $templatesUtil = $this->createMock(TemplateService::class);
        $templatesUtil->expects(static::once())->method('runThroughTemplates')->with(static::equalTo($rootLine));
        $templatesUtil->expects(static::once())->method('generateConfig');
        $templatesUtil->setup = [
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

        $languageService = $this->createMock(\TYPO3\CMS\Core\Localization\LanguageService::class);
        $languageService->expects(static::any())->method('sL')->with(static::equalTo('LLL:sec'))->willReturn('Second');

        $GLOBALS['BE_USER'] = $this->createMock(BackendUserAuthentication::class);
        $languageServiceFactory = $this->createMock(LanguageServiceFactory::class);
        $languageServiceFactory
            ->expects(static::once())
            ->method('createFromUserPreferences')
            ->with(self::equalTo($GLOBALS['BE_USER']))
            ->willReturn($languageService);

        GeneralUtility::addInstance(RootlineUtility::class, $rootlineUtil);
        GeneralUtility::addInstance(TemplateService::class, $templatesUtil);

        $subject = new SelectOptions($languageServiceFactory);
        $expected = [
            'row' => [
                'uid' => 3,
                'pid' => $pid,
            ],
            'items' => [
                ['First', 'first'],
                ['Second', 'second'],
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
        $rootLine = [['uid' => $pid], ['uid' => 1]];
        $rootlineUtil = $this->createMock(RootlineUtility::class);
        $rootlineUtil->expects(static::once())->method('get')->willReturn($rootLine);

        $templatesUtil = $this->createMock(TemplateService::class);
        $templatesUtil->expects(static::once())->method('runThroughTemplates')->with(static::equalTo($rootLine));
        $templatesUtil->expects(static::once())->method('generateConfig');
        $templatesUtil->setup = [
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

        $languageService = $this->createMock(\TYPO3\CMS\Core\Localization\LanguageService::class);
        $languageService->expects(static::any())->method('sL')->with(static::equalTo('LLL:sec'))->willReturn('Second');

        $GLOBALS['BE_USER'] = $this->createMock(BackendUserAuthentication::class);
        $languageServiceFactory = $this->createMock(LanguageServiceFactory::class);
        $languageServiceFactory
            ->expects(static::once())
            ->method('createFromUserPreferences')
            ->with(self::equalTo($GLOBALS['BE_USER']))
            ->willReturn($languageService);

        GeneralUtility::addInstance(RootlineUtility::class, $rootlineUtil);
        GeneralUtility::addInstance(TemplateService::class, $templatesUtil);

        $GLOBALS['TCA']['tt_content']['ctrl']['delete'] = false;

        $restrictions = new DefaultRestrictionContainer();

        $res = $this->createMock(\Doctrine\DBAL\Result::class);
        $res->expects(static::any())->method('fetchAssociative')->willReturn(['pid' => $pid]);

        $qb = $this->createMock(QueryBuilder::class);
        $qb->expects(static::any())->method('getRestrictions')->willReturn($restrictions);
        $qb->expects(static::any())->method('from')->willReturn($qb);
        $qb->expects(static::any())->method('where')->willReturn($qb);
        $qb->expects(static::any())->method('andWhere')->willReturn($qb);
        $qb->expects(static::any())->method('execute')->willReturn($res);
        $pool = $this->createMock(ConnectionPool::class);
        $pool->expects(static::any())->method('getQueryBuilderForTable')->willReturn($qb);
        GeneralUtility::addInstance(ConnectionPool::class, $pool);

        $subject = new SelectOptions($languageServiceFactory);
        $expected = [
            'row' => [
                'uid' => 'NEW123',
                'pid' => -$pid,
            ],
            'items' => [
                ['First', 'first'],
                ['Second', 'second'],
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
