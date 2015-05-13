<?php namespace App\Services;

use File;
use Log;

class Image {
	/**
     * Instance of the Imagine package
     * @var Imagine\Gd\Imagine
     */
	protected $imagine;

    /**
     * Type of library used by the service
     * @var string
     */
    protected $library;

    /**
     * Initialize the image service
     * @return void
     */
    public function __construct()
    {
    	if ( ! $this->imagine)
    	{
    		$this->library = 'imagick';

            // Now create the instance
    		if     ($this->library == 'imagick') $this->imagine = new \Imagine\Imagick\Imagine();
    		elseif ($this->library == 'gmagick') $this->imagine = new \Imagine\Gmagick\Imagine();
    		elseif ($this->library == 'gd')      $this->imagine = new \Imagine\Gd\Imagine();
    		else                                 $this->imagine = new \Imagine\Gd\Imagine();
    	}
    }

    /**
	 * Resize an image
	 * @param  string  $url
	 * @param  integer $width
	 * @param  integer $height
	 * @param  boolean $crop
	 * @return string
	 */

    public function compress($url)
    {
        $url = $_SERVER['DOCUMENT_ROOT'].$url;
        if(filesize($url) > 2000000) $this->imagine->open($url)->save($url, array('quality' => 50));
    }

    public function resize($url, $width = 100, $height = null, $crop = false, $quality = 90)
    {
    	if ($url)
    	{
        // URL info
    		$info = pathinfo($url);

        // The size
    		if ( ! $height) $height = $width;

        // Quality
    		//$quality = Config::get('image.quality', $quality);

        // Directories and file names
    		$fileName       = $info['basename'];
    		$sourceDirPath  = $_SERVER['DOCUMENT_ROOT'] . $info['dirname'];
    		$sourceFilePath = $sourceDirPath . '/' . $fileName;
    		$targetDirName  = $width . 'x' . $height . ($crop ? '_crop' : '');
    		$targetDirPath  = $sourceDirPath . '/' . $targetDirName . '/';
    		$targetFilePath = $targetDirPath . $fileName;
    		$targetUrl      = asset($info['dirname'] . '/' . $targetDirName . '/' . $fileName);

        // Create directory if missing
    		try
    		{
            // Create dir if missing
    			if ( ! File::isDirectory($targetDirPath) and $targetDirPath) @File::makeDirectory($targetDirPath);

            // Set the size
    			$size = new \Imagine\Image\Box($width, $height);

            // Now the mode
    			$mode = $crop ? \Imagine\Image\ImageInterface::THUMBNAIL_OUTBOUND : \Imagine\Image\ImageInterface::THUMBNAIL_INSET;

    			if ( ! File::exists($targetFilePath) or (File::lastModified($targetFilePath) < File::lastModified($sourceFilePath)))
    			{
    				$this->imagine->open($sourceFilePath)
    				->thumbnail($size, $mode)
    				->save($targetFilePath, array('quality' => $quality));
    			}
    		}
    		catch (\Exception $e)
    		{
                error_log($e->getMessage());
    			Log::error('[IMAGE SERVICE] Failed to resize image "' . $url . '" [' . $e->getMessage() . ']');
    		}

    		return $targetUrl;
    	}
    }

	/**
	* Helper for creating thumbs
	* @param string $url
	* @param integer $width
	* @param integer $height
	* @return string
	*/
	public function thumb($url, $width, $height = null)
	{
		return $this->resize($url, $width, $height, true);
	}
}