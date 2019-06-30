<?php
class Image{
  // The path where images would be saved to
  private $savePath;

  private $image;

  // Either jps or png
  private $imageFormat;

  private $imageWidth;
  private $imageHeight;

  // When scaling down this would be the size of either width or height depending on which is bigger
  private $maxSize = 150;



  public function __construct($imagePath){
    $format = exif_imagetype($imagePath);
    if($format==2){
      // if it's a jpg image
      $this->imageFormat = 'jpg';
      $this->savePath = dirname(__FILE__).'/../images/testImage.jpg';
    }elseif($format==3){
      // if it's a png image
      $this->imageFormat = 'png';
      $this->savePath = dirname(__FILE__).'/../images/testImage.png';
    }
    $imageSize = GetImageSize($imagePath);
    $this->imageWidth = floor($imageSize[0]);
    $this->imageHeight = floor($imageSize[1]);
    if($this->imageFormat=='jpg'){
      $this->image = imagecreatefromjpeg($imagePath);
    }else if($this->imageFormat=='png'){
      $this->image = imagecreatefrompng($imagePath);
    }
  }

  /* Receives left, top, width, and height values and crops the image accordingly.
  It also updates the class variables "imageWidth" and "imageHeight" accordingly */
  public function cropImage($cropLeft, $cropTop, $cropWidth, $cropHeight){
    $newImage = imagecreatetruecolor($cropWidth, $cropHeight);
		imagecopyresampled($newImage, $this->image, 0, 0, $cropLeft, $cropTop, $cropWidth, $cropHeight, $cropWidth, $cropHeight);
    if($this->imageFormat == 'jpg'){
      imagejpeg($newImage, $this->savePath);
      $this->image = imagecreatefromjpeg($this->savePath);
    }else if($this->imageFormat == 'png'){
      imagepng($newImage, $this->savePath);
      $this->image = imagecreatefrompng($this->savePath);
    }
    $this->imageWidth = floor($cropWidth);
    $this->imageHeight = floor($cropHeight);
  }

  /* Scales image down if possible, limiting it to a size no bigger than $this->maxSize^2
  It also updates the class variables "imageWidth" and "imageHeight" accordingly */
  public function scaleImageDown(){
    if($this->imageWidth > $this->maxSize || $this->imageHeight > $this->maxSize){
      if($this->imageWidth > $this->imageHeight){
        $newWidth = $this->maxSize;
        $ratio = $this->imageWidth / $this->maxSize;
        $newHeight = $this->imageHeight / $ratio;
      }else{
        $newHeight = $this->maxSize;
        $ratio = $this->imageHeight / $this->maxSize;
        $newWidth = $this->imageWidth / $ratio;
      }
      $newImage = imagecreatetruecolor($newWidth, $newHeight);
      imagecopyresampled($newImage, $this->image, 0, 0, 0, 0, $newWidth, $newHeight, $this->imageWidth, $this->imageHeight);
      if($this->imageFormat == 'jpg'){
        imagejpeg($newImage, $this->savePath);
        $this->image = imagecreatefromjpeg($this->savePath);
      }else if($this->imageFormat == 'png'){
        imagepng($newImage, $this->savePath);
        $this->image = imagecreatefrompng($this->savePath);
      }
      $this->imageWidth = floor($newWidth);
      $this->imageHeight = floor($newHeight);
    }
  }

  /* This method Receives x and y values and a tolerance value
  and returns the hex value of the color at that position
  when tolerance has the value of 1 it means the app would analyze the colors very percisely
  and treat each color value seperately,
  bigger values cause the app to treat close color values as the same value when analyze the image*/
  public function getHexColorAtXY($x, $y, $tolerance){

    $colorIndex = imagecolorat($this->image, $x, $y);
    $rgbAssoc = imagecolorsforindex($this->image, $colorIndex);

    $redBellow = floor($rgbAssoc['red'] / $tolerance) * $tolerance;
    $redAbove = ceil($rgbAssoc['red'] / $tolerance) * $tolerance;
    $red = (($rgbAssoc['red'] - $redBellow)<($redAbove-$rgbAssoc['red'])) ? $redBellow : $redAbove;

    $greenBellow = floor($rgbAssoc['green'] / $tolerance) * $tolerance;
    $greenAbove = ceil($rgbAssoc['green'] / $tolerance) * $tolerance;
    $green = (($rgbAssoc['green'] - $greenBellow)<($greenAbove-$rgbAssoc['green'])) ? $greenBellow : $greenAbove;

    $blueBellow = floor($rgbAssoc['blue'] / $tolerance) * $tolerance;
    $blueAbove = ceil($rgbAssoc['blue']  /$tolerance) * $tolerance;
    $blue = (($rgbAssoc['blue'] - $blueBellow)<($blueAbove-$rgbAssoc['blue'])) ? $blueBellow : $blueAbove;

    /* get hex value of color by first getting hex values of red green and blue
    and then concatenating them.
    0 is concatenated in the evaluation in case the hex value is of one digit */
    $redHex = substr("0".dechex($red), -2);
    $greenHex = substr("0".dechex($green), -2);
    $blueHex = substr("0".dechex($blue), -2);

    return $redHex.$greenHex.$blueHex;
  }

  /* Receives a number and returns an associative array of that length of the form:
     [color=>percentage] of the most frequent colors in the image */
  public function getMostFrequentColors($numColorsToReturn, $tolerance){
    $pixelsCounted = 0;

    /* This associative array would hold how many times each color appears in the image
    the color values in hex would be the keys and the values would be the number of occurrences */
    $hexColors = [];

    for ($y=0; $y < $this->imageHeight; $y++){
      for ($x=0; $x < $this->imageWidth; $x++){
        $pixelsCounted++;

        $colorHexAtXY = $this->getHexColorAtXY($x, $y, $tolerance);

        if(!isset($hexColors[$colorHexAtXY])){
					$hexColors[$colorHexAtXY] = 1;
				}else{
					$hexColors[$colorHexAtXY]++;
				}
      }
    }

    /* Sort the array in reverse order (so that most frequent colors would appear first),
    while maintaining index association */
    arsort($hexColors, SORT_NUMERIC);

    /* Slice of the array according to $numColorsToReturn and create a return array
     of the form [color=>percentage], and return that array */
    if($numColorsToReturn > 0){
    	$slicedArray = [];
			$slicedArray = array_slice($hexColors, 0, $numColorsToReturn, true);
      $returnedArray = [];
      foreach ($slicedArray as $color => $occurences){
				$returnedArray[$color] = (float)$occurences/$pixelsCounted;
			}
      return $returnedArray;
		}else{
			return 0;
		}
  }

}
?>
