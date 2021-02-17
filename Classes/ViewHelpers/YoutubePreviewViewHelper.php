<?php
declare(strict_types=1);
namespace Supseven\Supi\ViewHelpers;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithRenderStatic;

class YoutubePreviewViewHelper extends AbstractViewHelper
{
    use CompileWithRenderStatic;

    protected $escapeOutput = false;

    protected $escapeChildren = false;

    public function initializeArguments()
    {
        $this->registerArgument('video', FileInterface::class, '', true);
        $this->registerArgument('as', 'string', '', false, 'preview');
    }

    public static function renderStatic(array $arguments, \Closure $renderChildrenClosure, RenderingContextInterface $renderingContext)
    {
        $videoId = $arguments['video']->getContents();
        $temporaryFolder = Environment::getPublicPath() . '/fileadmin';
        $fileId = '/user_upload/youtube_' . md5($videoId) . '.jpg';
        $temporaryFileName = $temporaryFolder . $fileId;
        $content = '';

        if (!file_exists($temporaryFileName)) {
            $tryNames = ['maxresdefault.jpg', 'mqdefault.jpg', '0.jpg'];

            foreach ($tryNames as $tryName) {
                $previewImage = GeneralUtility::getUrl(sprintf('https://img.youtube.com/vi/%s/%s', $videoId, $tryName));

                if ($previewImage) {
                    GeneralUtility::mkdir_deep(dirname($temporaryFileName));
                    GeneralUtility::writeFile($temporaryFileName, $previewImage, true);
                    break;
                }
            }
        }

        if (file_exists($temporaryFileName)) {
            $file = ResourceFactory::getInstance()->getDefaultStorage()->getFile($fileId);
            $renderingContext->getVariableProvider()->add($arguments['as'], $file);
            $content = (string)$renderChildrenClosure();
            $renderingContext->getVariableProvider()->remove($arguments['as']);
        }

        return $content;
    }
}
