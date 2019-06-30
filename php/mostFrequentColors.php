<?php
require_once(dirname(__FILE__).'/image.php');

$errors = 0;
$errorMessage = '';

/* This app initially previews a default image and has the option to upload other images
so we check whether a calculation was requested for the default image or an uploaded image
and we set the $imagePath accordingly */
if(isset($_POST['calcForDefaultImage'])){
  if($_POST['calcForDefaultImage']=='true'){
    $imagePath = '../images/default.jpg';
  }
}else{
  $tempFilename = $_FILES['file']['tmp_name'];
  if(isset($tempFilename) && strlen($tempFilename)>0){
    if(!move_uploaded_file($tempFilename, '../images/'.$_FILES['file']['name'])){
      $errors = 1;
      $errorMessage = "Error: unvalid upload file";
    }else{
      $imagePath = '../images/'.$_FILES['file']['name'];
    }
  }else{
    $errors = 1;
    $errorMessage = "Error: file is not set";
  }
}


/* This app has two calcModes ,
"entire image" - getting the 5 most frequent colors from an entire image
"selected area" -  getting the 5 most frequent colors from an area of an image selected by the user. */
$calcMode = $_POST['calcMode'];

/* This app has an option to analyze colors based on tolerance.
when tolerance has the value of 1 it means the app would analyze the colors very percisely
and treat each color value seperately
bigger values cause the app to treat close color values as the same value when analyze the image */
$tolerance = $_POST['tolerance'];

/* If $calcMode is set to "selectedArea" we get the crop properties of the selected area" */
if($calcMode == 'selected area'){
  $cropWidth = $_POST['cropWidth'];
  $cropHeight = $_POST['cropHeight'];
  $cropLeft = $_POST['cropLeft'];
  $cropTop = $_POST['cropTop'];
}

if(!$errors){
  $image = new Image($imagePath);
  /* If calcMode is "selected area" we are interested only in a portion of the image,
  as selected by the user  */
  if($calcMode == 'selected area'){
    $image->cropImage($cropLeft, $cropTop, $cropWidth, $cropHeight);
  }
  /* We can scale the image down because we only want to most frequent colors  */
  $image->scaleImageDown();
  $frequentColors = $image->getMostFrequentColors(5, $tolerance);
}


if(!$errors){
  $returnArray = [
    'success'=> 'true',
    'frequentColors'=> $frequentColors
  ];
  echo json_encode($returnArray);
}else{
  $returnArray = [
    'success'=> 'false',
    'errorMessage'=> $errorMessage
  ];
}
?>
