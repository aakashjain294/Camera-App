// let video = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let recDiv = recordBtn.querySelector("div");
let capBtn = document.querySelector("#capture");
let capDiv = capBtn.querySelector("div");
let body = document.querySelector("body");
let isRecording = false;
let mediaRecorder;
let chunks = [];
let appliedFilter;
let filters = document.querySelectorAll(".filter");
let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;
let zoomInBtn = document.querySelector(".zoom-in");
let zoomOutBtn = document.querySelector(".zoom-out");
let galleryBtn = document.querySelector("#gallery");
// Gallery page functionality
galleryBtn.addEventListener("click", function (e) {
    // localhost:5500/index.html =>localhost:5500/gallery.html //isse hm connect kr rhe hai gallery page ko index wale page se
    location.assign("gallery.html");
});
// giving functionality to zoom in and zoom out btn-----------------------------------
zoomInBtn.addEventListener("click", function (e) {
    if (currZoom < maxZoom) {
        currZoom = currZoom + 0.1;
        // console.log(currZoom);
    }
    video.style.transform = `scale(${currZoom})`;
});
zoomOutBtn.addEventListener("click", function (e) {
    if (currZoom > minZoom) {
        currZoom = currZoom - 0.1;
        // console.log(currZoom);
    }
    video.style.transform = `scale(${currZoom})`;
});

// giving functionality to filters-----------------------------------
for (let i = 0; i < filters.length; i++) {
    filters[i].addEventListener("click", function (e) {
        removeFilter();
        appliedFilter = e.currentTarget.style.backgroundColor;
        let div = document.createElement("div");
        div.style.backgroundColor = appliedFilter;
        div.classList.add("filter-div");
        body.append(div);
    });
}
// instead of this we are making a recording btn which will handle both the works
// startBtn.addEventListener("click", function () {
//     // isse recording start ho
//     mediaRecorder.start();
// });
// stopBtn.addEventListener("click", function () {
//     // isse recording stop ho
//     mediaRecorder.stop();
// });

// record Button--------------------------------
recordBtn.addEventListener("click", function (e) {
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recDiv.classList.remove("record-animation");
    } else {
        mediaRecorder.start();
        appliedFilter = ""; // color remove krna hai video on krte hi
        removeFilter(); // UI se bhi remove krna hai color ko video On hote hi
        currZoom = 1;
        video.style.transform = `scale(${currZoom})`;
        isRecording = true;
        recDiv.classList.add("record-animation");

    }
});
// capture Button--------------------------------
capBtn.addEventListener("click", function () {
    if (isRecording) {
        return;
    }
    capDiv.classList.add("capture-animation");
    setTimeout(function (e) {
        capDiv.classList.remove("capture-animation")
    }, 1000)
    //jo bhiimage screen pr dikhra hai usse save krna hai
    let canvas = document.createElement("canvas");//image hm canvas ke through bnayenge video tag pass krke tool mei just kike  image tag.
    canvas.width = video.videoWidth;//hmare canvas ka size hmari video ke resolution ke equal hona chahiye
    canvas.height = video.videoHeight;
    let tool = canvas.getContext("2d");// here we are making 2d image of our video captured at particular keyframe
    tool.translate(canvas.width / 2, canvas.height / 2);// shifting origin of canvas from (0,0)i.e top left corner to middle of the image
    tool.scale(currZoom, currZoom);// yahan middle se zoom kr rhe hai jaise video mei hota hai
    tool.translate(-canvas.width / 2, -canvas.height / 2);// image draw krne ke liye wapis (0,0) pr jaa rhe hai
    tool.drawImage(video, 0, 0);//giving video tag to tool as to draw image 
    // yahan hm image mei filter daal rhe hai, ek rectangle bnakr pure canvas ki height or width pr bnakr 
    if (appliedFilter) {
        tool.fillStyle = appliedFilter;
        tool.fillRect(0, 0, canvas.height, canvas.width);
    }
    let link = canvas.toDataURL();//here we are making the url of our image drawn by our tool
    addMedia(link, "image"); //for image we will save this data url in db

    // let a = document.createElement("a");//for downloading the image we are moaking the anchor tag
    // a.href = link;//giving link to anchor tag which will download as sson as clicked on the capture btn
    // a.download = "img.png";//default name given to the  image
    // a.click();
    // a.remove();
    // canvas.remove();
});

//NAVIGATOR is a browser object that will take permisions for mediadevices like video and audio from user and this function will act as promise, if this promise return allowed from browser then it will be accepted and our camera and mic in form of the object called mediaStream then this mediaStream will be passed into the srcObject (as srcObject accepts only objects having video and audio in it) hence then it will open our camera and mic , otherwise it will be rejected and gives error message.

//-------------- Navigator -> taking permissions for video and audio storing video chunks and downloading--------------------------------
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener("dataavailable", function (e) { //dataavailable collects all the chunks or part of video in given by mediarecorder and we store them in the array called chunks  
        chunks.push(e.data);//storing our small parts of recorded videos
    });

    mediaRecorder.addEventListener("stop", function (e) {
        let blob = new Blob(chunks, { type: "video/mp4" }); // blob is a large binary file and here it storing our whole chunks array that is having the recorded parts or pieces and type will be "mp4"
        chunks = [];
        addMedia(blob, "video");//for video we will save this blob object in db

        // let a = document.createElement("a"); //we know that anchor(a) tag used to dowload things so here we are making our anchor tag to download the recorded video
        // let url = window.URL.createObjectURL(blob); //anchor tag takes only the links for dowloading so here we are generating link of our recorded video , saved in blob
        // a.href = url; // giving link to anchor tag for downloading
        // a.download = "camVideo.mp4"; //gave name to our file which is supposed to download
        // a.click(); //as soon as we stop our recording it will start downloading
        // a.remove(); // after dowloading we have to remove the anchor tag
    });


    video.srcObject = mediaStream;


}).catch(function (err) {
    console.log(err);
});

function removeFilter() {
    let Filter = document.querySelector(".filter-div");
    if (Filter) {
        Filter.remove();
    }
}