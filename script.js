// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = 'https://teachablemachine.withgoogle.com/models/qv4Jq1JCX/';

let model, webcam, labelContainer, maxPredictions;

let isIos = false; 
// fix when running demo in ios, video will be frozen;
if (window.navigator.userAgent.indexOf('iPhone') > -1 || window.navigator.userAgent.indexOf('iPad') > -1) {
  isIos = true;
}

let isCameraInit = false;
let isCameraOn = false;

const labels = ['Cirrus', 'Cirrocumulus', 'Altostratus', 'Cumulus', 'Cumulonimbus', 'Contrails', 'Orographic', 'Cirrostratus', 'Altocumulus', 'Nimbostratus', 'Stratus', 'Stratcxumulus', 'Mammatus', 'Lenticular'];

window.onload = function() {
    init();
};

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    
    // append elements to the DOM
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement('div'));
        labelContainer.childNodes[i].className = 'label-container';
        labelContainer.childNodes[i].appendChild(document.createElement('p'));
        labelContainer.childNodes[i].appendChild(document.createElement('div'));
        labelContainer.childNodes[i].childNodes[0].className = 'label-text';
        labelContainer.childNodes[i].childNodes[1].className = 'label-bar-container';
        labelContainer.childNodes[i].childNodes[1].appendChild(document.createElement('p'));
        labelContainer.childNodes[i].childNodes[1].appendChild(document.createElement('div'));
        labelContainer.childNodes[i].childNodes[1].childNodes[0].className = 'label-probability';
        labelContainer.childNodes[i].childNodes[1].childNodes[1].className = 'label-bar-fill';
        
        labelContainer.childNodes[i].childNodes[0].innerHTML = labels[i];
        labelContainer.childNodes[i].childNodes[1].childNodes[0].innerHTML = '0.0%';
    }
}

async function startWebcam() {
  if (!isCameraInit) {
    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    // make the webcam as large as possible, but not larger than the canvas
    const width = isIos ? 224 : 450;
    const height = isIos ? 224 : 450;
    webcam = new tmImage.Webcam(width, height, flip); // width, height, flip

    await webcam.setup(); // request access to the webcam

    if (isIos) {
        document.getElementById('webcam-container').appendChild(webcam.webcam); // webcam object needs to be added in any case to make this work on iOS
        // grab video-object in any way you want and set the attributes
        const webCamVideo = document.getElementsByTagName('video')[0];
        webCamVideo.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS buggs otherwise
        webCamVideo.muted = "true";
        webCamVideo.style.width = '100%';
        webCamVideo.style.aspectRatio = '1/1';
    } else {
        document.getElementById("webcam-container").appendChild(webcam.canvas);
    }
    isCameraInit = true;
    isCameraOn = true;
    webcam.play();
    window.requestAnimationFrame(loop);
  } else {
    isCameraOn = true;
  }

}

async function stopWebcam() {
  isCameraOn = false;
}

async function loop() {
    if (isCameraOn) {
      webcam.update(); // update the webcam frame
    }
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    let prediction;
    if (isIos) {
        prediction = await model.predict(webcam.webcam);
    } else {
        prediction = await model.predict(webcam.canvas);
    }
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.childNodes[i].childNodes[0].innerHTML = prediction[i].className;
        labelContainer.childNodes[i].childNodes[1].childNodes[0].innerHTML = (prediction[i].probability.toFixed(2) * 100).toFixed(1) + '%';
        labelContainer.childNodes[i].childNodes[1].childNodes[1].style.width = (prediction[i].probability.toFixed(2) * 100).toFixed(1) + '%';
    }
}