<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/range.css">
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <title>5 Most frquent color getter</title>
</head>
<body>
  <div class="container">
    <div class="appContainer">
      <div class="imagePanel">
        <canvas class="imageCropPreview"></canvas>
        <img class="imagePreview" src="">
      </div>
      <div class="controlsPanel">
        <input type="button" name="selectImage" value="Select image" onclick="ui.openSelectFilesWindow()" />
      	<input type="file" id="file" name="upload" style="display:none" onchange="ui.handleSelectedFile(event)" />
        <input type="radio" name="mode" value="entire image" onclick="ui.changeCalcMode(event)"/> Entire image
        <input type="radio" name="mode" value="selected area" onclick="ui.changeCalcMode(event)"/> Selected area
        <div class="toleranceControl">
          <label>Tolerance: </label><input type="range" min="1" max="30" value="1" class="toleranceSlider" >
        </div>
      </div>
      <div class="colorsPanel">

      </div>
      <input type="button" name="getColors" value="Get 5 most dominant colors" onclick="ui.getFrequentColors()" />
    </div>
    <div class="imageCropControlsContainer">
      <div class="imageCropControls imageCropControlsHidden">
        <input class="cropSizeControl" type="button" name="x1" value="1" onclick='ui.changeCropSize("1")'/>
      	<input class="cropSizeControl" type="button" name="x2/3" value="2/3" onclick='ui.changeCropSize("2/3")' />
    	  <input class="cropSizeControl" type="button" name="x1/2" value="1/2" onclick='ui.changeCropSize("1/2")' />
    	  <input class="cropSizeControl" type="button" name="x1/4" value="1/4" onclick='ui.changeCropSize("1/4")' />
      </div>
    </div>
  </div>

  <script src="js/ui.js"></script>
</body>
</html>
