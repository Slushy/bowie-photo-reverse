var imageContainer, canvas, ctx, imageInfo, convertButton, downloadLink, downloadFileName, loadingLabel;
// each pixel's r,g,b,a datum are stored in separate sequential array elements
var PIXEL_LENGTH = 4;
var RED = 0;
var GREEN = 1;
var BLUE = 2;
var ALPHA = 3;

// The pixel count between colors
var DEFAULT_PIXEL_COLOR_SPLIT = 100;
var DEFAULT_PIXEL_COLUMN_COUNT = 3456;
var MAGIC_PIXEL_NUMBER = DEFAULT_PIXEL_COLUMN_COUNT / DEFAULT_PIXEL_COLOR_SPLIT

/** Loads the bowie image canvas with the image once an image is selected */
function onImageSelected(e) {
    if (!e.target.files || !e.target.files.length) return;

    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            imageInfo.innerText = 'width = ' + img.width + 'px, height = ' + img.height + 'px';
            convertButton.style.display = 'inline-block';
            downloadLink.style.display = 'none';
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);

    // Sets the name of the file for download
    setDownloadFileName(e.target.value);
}

function setDownloadFileName(imagePath) {
    var startIndex = (imagePath.indexOf('\\') >= 0 ? imagePath.lastIndexOf('\\') : imagePath.lastIndexOf('/'));
    var filename = imagePath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    // remove extension too
    filename = filename.substring(0, filename.lastIndexOf('.'))
    downloadFileName = filename + '_grayscale.jpg';
}

/** Removes the bowie filter of the current image in the canvas */
function convertCurrentImage() {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // Creates the size of the split between blue and red for this canvas size
    var colorSplit = Math.floor(canvas.width / MAGIC_PIXEL_NUMBER);
    var blueColorSplit = colorSplit
    var redColorSplit = colorSplit * 2;

    var rowWidth = canvas.width * PIXEL_LENGTH;

    // Helpful function to get a specific column row rgba index of a linear array
    var getColorIdx = (col, row, color) => {
        col = Math.min(col, canvas.width - 1);
        row = Math.min(row, canvas.height - 1);
        return (row * rowWidth) + (col * PIXEL_LENGTH) + color;
    }    

    // Loop over every pixel of the image
    for (var col = 0; col < canvas.width; col++) {
        for (var row = 0; row < canvas.height; row++) {
            // Pull the red and blue pixel from different location on the bowie image
            var red = imageData.data[getColorIdx(col + redColorSplit, row, RED)];
            var blue = imageData.data[getColorIdx(col + blueColorSplit, row, BLUE)];

            // Green & alpha pixel locations don't change between images
            var green = imageData.data[getColorIdx(col, row, GREEN)];
            
            // The first part of the bowie images are weird, so this just
            // sets it to the smooth gray color seen around the edges
            if (col <= redColorSplit) {
                green = blue = red;
            }

            // Set the pixel rgb value to the converted gray scale value
            // https://en.wikipedia.org/wiki/Grayscale
            var grayScale = (red * 0.3) + (green * 0.59) + (blue * 0.11);
            imageData.data[getColorIdx(col, row, RED)] = grayScale;
            imageData.data[getColorIdx(col, row, GREEN)] = grayScale;
            imageData.data[getColorIdx(col, row, BLUE)] = grayScale;
        }
    }

    // Update the image canvas with the new converted one
    ctx.putImageData(imageData, 0, 0);

    // Update the download link
    canvas.toBlob(function (blob) {
        downloadLink.setAttribute('download', downloadFileName);
        downloadLink.setAttribute('href', URL.createObjectURL(blob));
        downloadLink.style.display = 'block';
        loadingLabel.style.display = 'none';
    });
}

/** Hooks up event listeners once window has loaded */
window.onload = () => {
    var imageSelector = document.getElementById('bowieImageSelector');
    imageSelector.addEventListener('change', onImageSelected, false);

    // Assigns the container elements
    imageContainer = document.getElementById('bowieImageContainer');
    canvas = imageContainer.querySelector('canvas');
    ctx = canvas.getContext('2d');
    imageInfo = imageContainer.querySelector('.image-info');
    downloadLink = imageContainer.querySelector('a');
    convertButton = imageContainer.querySelector('button');
    loadingLabel = imageContainer.querySelector('label');

    convertButton.addEventListener('click', () => {
        loadingLabel.style.display = 'block';
        convertButton.style.display = 'none';

        // Allow DOM update before conversion
        window.setTimeout(convertCurrentImage, 10);
    });
};
