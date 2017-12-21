
/** Removes the bowie filter of the current image in the canvas */
function populateCanvasContainer(canvasContainer, image) {
    var canvas = canvasContainer.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var imageInfo = canvasContainer.querySelector('.image-info');
    var button = canvasContainer.querySelector('button');

    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            imageInfo.innerText = 'width = ' + img.width + 'px, height = ' + img.height + 'px';
            button.style.display = 'block';
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(image);
}

/** Removes the bowie filter of the current image in the canvas */
function onConvert(e) {
    alert("Convert image selected");
}

/** Hooks up event listeners once window has loaded */
window.onload = () => {
    var imageSelector = document.getElementById('bowieImageSelector');
    imageSelector.addEventListener('change', (e) => {
        populateCanvasContainer(bowieImageContainer, e.target.files[0]);
    }, false);

    var bowieImageContainer = document.getElementById('bowieImageContainer');

    var convertButton = document.getElementById('convertButton');
    convertButton.addEventListener('click', onConvert);
};
