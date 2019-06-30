class UI{
  constructor(){
    //this.sitePath =  "http://willwill.vangus.cloud/frequentColors/";
		this.sitePath = "http://localhost/frequentColors/";

    /* This app has two modes,
    "entire image" - getting the 5 most frequent colors from an entire image
    "selected area" -  getting the 5 most frequent colors from an area of an image.
    the default is "entire image". */
    this.calcMode = 'entire image';
    document.querySelector('input[value="entire image"]').checked = true;

    /* This app has an option to analyze colors based on tolerance.
    tolerance is initially set to 1
    setting the tolerance to 1 means the app would analyze the colors percisely
    increasing the tolerance means the app would analyze two close color values as the same value */
    document.querySelector('.toleranceSlider').value = 1;

    /* This app uses HTML5 canvas to render the image selected,
    canvas was choosed because it's nessecarry for rendering the selected crop area
    in case the app is set to "selected area mode " */
    this.canvas = document.querySelector('canvas');

    /* If calcMode is set to "selected area" user is able to change selected area
    by dragging the selected area around */
    this.canvas.addEventListener('mousedown',(e)=>{
      if(this.calcMode == 'selected area'){
        this.dragSelectedArea(e);
      }
		});

    /* When calcMode is set to "selected area" we want mounse to indicate that dragging is possible */
    this.canvas.addEventListener('mouseover',(e)=>{
      if(this.calcMode == 'selected area'){
        document.body.style.cursor = 'move';
      }
		});

    this.defaultImagePath = this.sitePath+'images/default.jpg'

    this.allowedFormats = /(\.jpg|\.jpeg|\.png)$/i;

    /* Image width and height of selected image */
    this.imageWidth = null;
    this.imageHeight = null;

    /* If the calcMode is set to "selected area" these 4 class variables indicate the properties
    of the selected area */
    this.cropLeft = null;
    this.cropTop = null;
    this.cropWidth = null;
    this.ctopTop = null;


    // When the app starts no image was selected yet so show the default image
    this.imageSelected = '';
    const imagePreview = document.querySelector('.imagePreview');
    imagePreview.setAttribute('src',this.defaultImagePath);
    const img = new Image();
    img.onload = ()=>{
      this.imageWidth = img.width;
      this.imageHeight = img.height;
      this.renderCanvas(imagePreview);
      this.getFrequentColors();
    }
    img.src = this.defaultImagePath;
	}


  openSelectFilesWindow(){
    document.querySelector('input[type="file"]').click();
  }


  /* Handles a file selected by user,
  then calls the render method to show it on the canvas. */
  handleSelectedFile(event){
    const file = event.target.files[0];
    // Varify file is either jpg or png
    if(file.name.match(this.allowedFormats)){
      this.imageSelected = file;
      // Every time the user selects a new image reset calcMode to "entire image" mode
      document.querySelector('input[value="entire image"]').checked = true;
      this.calcMode = 'entire image';

      /* Use FileReader to get image data */
      const reader = new FileReader();
      reader.onload = (e)=>{
        const url = e.target.result;
        let img = new Image();
        img.onload = ()=>{
          /* In order to render an image on a canvas an img element is needed from which to render
          so there is a hidden one with class "imagePreview" for that purpose.
          se we set it's src attribute here */
          const imagePreview = document.querySelector('.imagePreview');
          imagePreview.setAttribute('src',url);

          const imageWidth = img.width;
          const imageHeight = img.height;

          /* Set the class variables for the image selected */
          this.imageWidth = imageWidth;
          this.imageHeight = imageHeight;

          /* Show image on canvas */
          this.renderCanvas();
        }
        img.src = url;
      }
      reader.readAsDataURL(file);

      /* We don't want to see the analyze results of a previous image  */
      const colorsPanel = document.querySelector('.colorsPanel');
      colorsPanel.classList.add('hidden');
    }
  }

  /* This method renders the image to the canvas.
  if calcMode is set to "selected area" it also renders the currently selected area */
  renderCanvas(imageElement){
    const style = getComputedStyle(document.querySelector('.imagePanel'),'borderWidth');
    const imagePanelBorderWidth = parseInt(style.getPropertyValue('border-left-width'));
    const imagePanelWidth = document.querySelector('.imagePanel').offsetWidth-imagePanelBorderWidth*2;
    const ratio = this.imageWidth / imagePanelWidth;
    const canvasWidth = imagePanelWidth;
    const canvasHeight = this.imageHeight/ratio;
    const imagePreview = document.querySelector('.imagePreview');
    this.canvas.setAttribute('width',canvasWidth);
		this.canvas.setAttribute('height',canvasHeight);
    let ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    /* If calcMode is set to "selected area" show the full image semi opeque,
    so that a fully opeque selected portion of that image could be shown on top of that portion
    of the semi opeque background to indicate the selected area to the user */
    if(this.calcMode=='selected area'){
      ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(imagePreview, 0, 0, this.imageWidth, this.imageHeight, 0, 0, canvasWidth, canvasHeight);

    if(this.calcMode=='selected area'){
      ctx.globalAlpha = 1;
      ctx.drawImage(imagePreview, this.cropLeft, this.cropTop, this.cropWidth, this.cropHeight, this.cropLeft/ratio, this.cropTop/ratio, this.cropWidth/ratio, this.cropHeight/ratio);
    }
  }

  /* This method handles changing the calcMode */
  changeCalcMode(event){
    const calcMode = event.target.value;
    this.calcMode = calcMode;
    /* If calcMode was set to "selected area" set initial crop properties and show crop control panel*/
    if(calcMode=='selected area'){
      this.cropLeft = 0;
      this.cropTop = 0;
      /* Set a default crop size */
      this.changeCropSize('1/2');
      document.querySelector('.imageCropControls').classList.add('imageCropControlsVisible');
      document.querySelector('.imageCropControls').classList.remove('imageCropControlsHidden');
    }else if(calcMode == 'entire image'){
      /* If calcMode was set to "entire image hide crop control panel" */
      document.body.style.cursor = 'initial';
      document.querySelector('.imageCropControls').classList.add('imageCropControlsHidden');
      document.querySelector('.imageCropControls').classList.remove('imageCropControlsVisible');
    }
    this.renderCanvas();
  }


  /* Calculate new crop size based on cropScale value,
  update crop class variables and render canvas to apply changes */
  changeCropSize(cropScale){
  		let mul = 0;
  		let div = 0;
  		let newCropWidth = 0;
  		let newCropHeight = 0;
  		switch(cropScale){
  			case '1':
  				mul = 1;
  				div = 1;
  				break;
  			case '2/3':
  				mul = 2;
  				div = 3;
  				break;
  			case '1/2':
  				mul = 1;
  				div = 2;
  				break;
  			case '1/4':
  				mul = 1;
  				div = 4;
  				break;
  		}
  		if(this.imageWidth>this.imageHeight){
  			newCropWidth = (this.imageHeight*mul)/div;
  			newCropHeight = newCropWidth;
  		}else{
  			newCropHeight = (this.imageWidth*mul)/div;
  			newCropWidth = newCropHeight;
  		}
      /* If the new crop width causes part of the crop square to move out of the image area
      then set the crop left so that the crop square sticks to the right border of the image */
      if(this.cropLeft+newCropWidth>this.imageWidth){
        this.cropLeft = this.imageWidth - newCropWidth;
      }
      /* If the new crop height causes part of the crop square to move out of the image area
      then set the crop top so that the crop square sticks to the bottom border of the image */
      if(this.cropTop+newCropHeight>this.imageHeight){
        this.cropTop = this.imageHeight - newCropHeight;
      }
  		this.cropWidth = newCropWidth;
  		this.cropHeight = newCropHeight;
  		this.renderCanvas();
  	}

    /* This method handles dragging the crop area when calcMode is set to "selected area" */
    dragSelectedArea(e){
      const imagePanelWidth = document.querySelector('.imagePanel').offsetWidth;
      const style = getComputedStyle(document.querySelector('.imagePanel'),'borderWidth');
      const imagePanelBorderWidth = parseInt(style.getPropertyValue('border-left-width'));

      const ratio = this.imageWidth / imagePanelWidth;
		  const canvasRect = this.canvas.getBoundingClientRect();

		  const canvasCropWidth = this.cropWidth/ratio;
		  const canvasCropHeight = this.cropHeight/ratio;
		  let canvasCropLeft = this.cropLeft/ratio;
	  	let canvasCropTop = this.cropTop/ratio;

		  const cropRect = {
		  	left : canvasRect.left + canvasCropLeft,
		  	top: canvasRect.top + canvasCropTop,
		  	right: canvasRect.left + canvasCropLeft + canvasCropWidth,
		  	bottom: canvasRect.top + canvasCropTop + canvasCropHeight
	  	}

      /* The offset between where the user mouse downed and the top and left edges of
      the selected area */
	  	const offsetX = e.pageX - cropRect.left;
	  	const offsetY = e.pageY - cropRect.top;

      /* This function is triggered by the event listener bellow
      (when user mouse downs inside the selected area) and it handles the actually movement
      of the selected area */
	  	const drag = (moveEvent)=>{

        /* When user mouse steps out of the selected area stop dragging */
		  	if((moveEvent.pageX  > canvasRect.right) || (moveEvent.pageX < canvasRect.left) ||
		  	(moveEvent.pageY - window.scrollY > canvasRect.bottom) || (moveEvent.pageY - window.scrollY < canvasRect.top)){
			  	document.removeEventListener('mousemove', drag);
			  	document.removeEventListener('mouseup', stopDrag);
			  }

        /* Calculate new crop left and top */
		  	let newCanvasCropLeft = moveEvent.pageX - offsetX - canvasRect.left;
		  	let newCanvasCropTop = moveEvent.pageY - offsetY - canvasRect.top;

        /* If crop stays inside the horizontal bounderies of the image
        update crop left */
		  	if((canvasRect.left + newCanvasCropLeft + canvasCropWidth < canvasRect.right)&&
		  	(newCanvasCropLeft>0)){
			  	canvasCropLeft = newCanvasCropLeft;
			  	this.cropLeft = newCanvasCropLeft*ratio;
		  	}else{
          /* If crop doesn't stay inside the horizontal edge of the image
          set crop left to the maximum value possible so that it sticks to the left edge */
			  	if(canvasRect.left + newCanvasCropLeft + canvasCropWidth >= canvasRect.right){
			  		canvasCropLeft = canvasRect.right - canvasRect.left - canvasCropWidth + (imagePanelBorderWidth*2);
				  	this.cropLeft = canvasCropLeft*ratio;
			  	}
          /* If the new crop left is negative set it to 0 so that the selected area sticks
          to the right edge */
			  	if(newCanvasCropLeft<=0){
			  		canvasCropLeft = 0;
				  	this.cropLeft = 0;
			  	}
			  }
        /* If crop stays inside the vertical bounderies of the image
        update crop top */
		  	if((canvasRect.top + newCanvasCropTop + canvasCropHeight < canvasRect.bottom)&&
		  	(newCanvasCropTop>0)){
			  	canvasCropTop = newCanvasCropTop;
			  	this.cropTop = newCanvasCropTop*ratio;
		  	}else{
          /* If crop doesn't stay inside the vertical edge of the image
          set crop top to the maximum value possible so that it sticks to the bottom edge of the image*/
			  if(canvasRect.top + newCanvasCropTop + canvasCropHeight >= canvasRect.bottom){
					  canvasCropTop = canvasRect.bottom - canvasRect.top - canvasCropHeight + (imagePanelBorderWidth*2);
				  	this.cropTop = canvasCropTop*ratio;
			  	}
          /* if the new crop top is negative set it to 0 so that crap sticks to the top edge */
			  	if(newCanvasCropTop<=0){
				  	canvasCropTop = 0;
				  	this.cropTop = 0;
				  }
			  }
			  this.renderCanvas();
		  }

      /* When user mouse ups after dragging, stop mouse dragging
         and remove all event listeners*/
      let stopDrag = ()=>{
		  	document.removeEventListener('mousemove', drag);
		  	document.removeEventListener('mouseup', stopDrag);
		  }

      /* If user mouse downs inside the selected area start dragging
      and set another event listener for when the user mouse ups, to stop mouse dragging */
	  	if(e.pageX > cropRect.left && e.pageX < cropRect.right
	  	&& e.pageY - window.scrollY > cropRect.top && e.pageY - window.scrollY < cropRect.bottom){
			  document.addEventListener('mousemove', drag);
		  	document.addEventListener('mouseup', stopDrag);
		  }
    }

    /* This method takes hex value of color and converts it to HSL value and returns
    a HSL value in a form of an object {h:value,s:value,l:value} */
    hexToHSL(hex){
      const hexAsArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

      let r = parseInt(hexAsArray[1], 16);
      let g = parseInt(hexAsArray[2], 16);
      let b = parseInt(hexAsArray[3], 16);

      r /= 255, g /= 255, b /= 255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h,s,l = (max + min)/2;

      if(max == min){
        h = s = 0; // achromatic
      }else{
        const d = max - min;
        s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
        switch(max){
          case r: h = (g - b)/d + (g < b ? 6 : 0); break;
          case g: h = (b - r)/d + 2; break;
          case b: h = (r - g)/d + 4; break;
        }
        h /= 6;
      }

      s = s*100;
      s = Math.round(s);
      l = l*100;
      l = Math.round(l);
      h = Math.round(360*h);

      const colorInHSL = {h:h,s:s,l:l};
      return colorInHSL;
    }

    /* This sends a file to the server along with other options and expects to get from the
    server a json object that contains the analyze results */
    getFrequentColors(){
      const tolerance = document.querySelector('.toleranceSlider').value;
      let formData = new FormData();
      if(this.imageSelected != ''){
        formData.set('file',this.imageSelected);
      }else{
        formData.set('calcForDefaultImage','true');
      }
		  formData.set('calcMode',this.calcMode);
      formData.set('tolerance',tolerance);

      /* If calcMode is set to "selected area" we send the crop properties of the area
      selected to the server */
      if(this.calcMode=='selected area'){
        formData.set('cropLeft',this.cropLeft);
        formData.set('cropTop',this.cropTop);
        formData.set('cropWidth',this.cropWidth);
        formData.set('cropHeight',this.cropHeight);
      }

  		let options = {
  			method: 'POST',
  			body: formData
  		};

  		fetch(this.sitePath+'php/mostFrequentColors.php', options).then(res=>{
  			res.json().then(data=>{
          /* Because the associative array of the most frequent colors retured by the
          server is converted to an object we need to make an array out of it and sort it */
          const colorsObj = data.frequentColors;
          let colorsArray = Object.keys(colorsObj).map(function(color){
            return {"color":color, "percent":colorsObj[color]};
          });
          colorsArray.sort((a,b)=>{
            if( a.percent < b.percent ){
              return 1;
            }
            if( a.percent > b.percent ){
              return -1;
            }
            return 0;
          });

          const colorsPanel = document.querySelector('.colorsPanel');
          colorsPanel.innerHTML = '';
          colorsPanel.classList.remove('hidden');
          // We take the sorted array and show the colors
          colorsArray.forEach(color=>{
            const div = document.createElement("div");
            div.classList.add('color');
            div.style.backgroundColor = "#"+color.color;
            const colorInHSL = this.hexToHSL(color.color);
            const lightness = colorInHSL['l'];
            if(lightness<50){
              div.style.color = "#ffffff";
            }else if(lightness>=50){
              div.style.color = "#000000";
            }
            const html = `<div class="colorHexValue">#${color.color}</div>
            <div class="percent">${color.percent}%</div>`;
            div.innerHTML = html;
            colorsPanel.appendChild(div);
          });
  			});
  		});
    }


}

const ui = new UI();
