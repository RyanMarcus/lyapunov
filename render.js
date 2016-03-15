/*
  Copyright 2016 Ryan Marcus

  This file is part of ryan-frac-gen.

  ryan-frac-gen is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  ryan-frac-gen is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var maximumWidth = 500;
var maxiumumHeigh = 250;

function doRender() {

    var iterations = 0;
    var generate = Module.cwrap('generateFractal', 'number',
				['number', 'number', 'number',
				 'number', 'number', 'number',
				 'number', 'number', 'number']);


    var randomize = Module.cwrap('randomizeSequence', null);
    randomize();

    var canvas  = document.getElementById("fract");
    var context = canvas.getContext("2d");    
    
    var viewportWidth = Math.min(canvas.width, maximumWidth);
    //var viewportHeight = 450;
    var viewportHeight = viewportWidth/2;
    
    // create a viewport array on the javascript side,
    // allocate it on the heap, and store a pointer to it
    var viewportSize = viewportWidth * viewportHeight * 4;
    
    var viewportAddr = Module._malloc(viewportSize);
    var iterAddr = Module._malloc(viewportSize);


    
    // create a view of the data

    var viewport = new Float32Array(Module.HEAPF32.buffer, viewportAddr, viewportSize);
    var iterview = new Float32Array(Module.HEAPF32.buffer, iterAddr, viewportSize);

    for (var i = 0; i < viewportWidth * viewportHeight; i++) {
	viewport[i] = 0.0;
     	iterview[i] = 0.5;
    }

    
    var prevImg = context.createImageData(viewportWidth, viewportHeight);
    var partialRender = function () {
	// call the function.
	iterations += generate(2.5, 3.2, 1.0, 0.6, viewportWidth, viewportHeight, viewportAddr, iterAddr, iterations);



	

	var negMults = [255, 150, 25];
	var posMults = [40, 176, 255];


	// scaling version... way too slow...
	//var imageData = context.createImageData(canvas.width, canvas.height);
	//
	//for (var y = 0; y < canvas.height; y++) {
	//    var imgY = Math.round((y / canvas.height) * viewportHeight);
	//    for (var x = 0; x < canvas.width; x++) {
	// 	var imgX = Math.round((x / canvas.width) * viewportWidth);
	// 
	// 	var vi = imgY*viewportWidth + imgX;
	// 	var i = y*canvas.width + x;
	// 	
	// 	var mults = (viewport[vi] < 0 ? negMults : posMults);
	// 	var d = (viewport[vi] < 0 ? Math.max(.2, 1 - Math.abs(viewport[vi])) : 1 - viewport[vi]);
	// 	
	// 	//d = Math.pow(d, 0.8);
	// 	imageData.data[i*4 + 0] = d * mults[0];
	// 	imageData.data[i*4 + 1] = d * mults[1];
	// 	imageData.data[i*4 + 2] = d * mults[2];
	// 	imageData.data[i*4 + 3] = 255;
	// 	
	// 	imageData.data[i*4 + 0] = (imageData.data[i*4 + 0] + prevImg.data[i*4 + 0]) / 2;
	// 	imageData.data[i*4 + 1] = (imageData.data[i*4 + 1] + prevImg.data[i*4 + 1]) / 2;
	// 	imageData.data[i*4 + 2] = (imageData.data[i*4 + 2] + prevImg.data[i*4 + 2]) / 2;
	// 	
	//    }
	//}

	var imageData = context.createImageData(viewportWidth, viewportHeight);
	for (var i = 0; i < viewportWidth*viewportHeight; i++) {
	    var mults = (viewport[i] < 0 ? negMults : posMults);
	    var d = (viewport[i] < 0 ? Math.max(.2, 1 - Math.abs(viewport[i])) : 1 - viewport[i]);
	    
	    imageData.data[i*4 + 0] = d * mults[0];
	    imageData.data[i*4 + 1] = d * mults[1];
	    imageData.data[i*4 + 2] = d * mults[2];
	    imageData.data[i*4 + 3] = 255;
	    
	    imageData.data[i*4 + 0] = (0.5*imageData.data[i*4 + 0] + 0.5*prevImg.data[i*4 + 0]);
	    imageData.data[i*4 + 1] = (0.5*imageData.data[i*4 + 1] + 0.5*prevImg.data[i*4 + 1]);
	    imageData.data[i*4 + 2] = (0.5*imageData.data[i*4 + 2] + 0.5*prevImg.data[i*4 + 2]);
	}


	context.putImageData(imageData, 0, 0);

	if (window.innerWidth > viewportWidth) {


	    var newCanvas = $("<canvas>")
		    .attr("width", imageData.width)
		    .attr("height", imageData.height)[0];
	    
	    newCanvas.getContext("2d").putImageData(imageData, 0, 0);


	    canvas.width = window.innerWidth;
	    context.drawImage(newCanvas, 0, 0, canvas.width, canvas.height);
	}
	prevImg = imageData;
    };


    var steps = 30;
    for (var t = 0; t < steps; t++) {
	setTimeout(partialRender, (t/steps) * 2500 + 1000);
    }
    //setTimeout(blur, 6500);


}

var Module = {'onRuntimeInitialized': doRender };

function fixCanvasSize() {

    var canvas  = document.getElementById("fract");
    var context = canvas.getContext("2d"); 
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var newCanvas = $("<canvas>")
	    .attr("width", imageData.width)
	    .attr("height", imageData.height)[0];
    
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);


    canvas.width = window.innerWidth;
    context.drawImage(newCanvas, 0, 0, canvas.width, canvas.height);
}



/*function blur() {
    Caman("#fract", function () {
	console.log("blur!");
	this.processKernel("Gauss Blur", [
	    0.039206,0.039798,0.039997,0.039798,0.039206,
	    0.039798,0.040399,0.040601,0.040399,0.039798,
	    0.039997,0.040601,0.040804,0.040601,0.039997,
	    0.039798,0.040399,0.040601,0.040399,0.039798,
	    0.039206,0.039798,0.039997,0.039798,0.039206,
	    
	]);


	this.render();

    });
    
}*/


var labels = ["programmer","amateur hacker","machine learner","model trainer","python charmer","java drinker","avid valgrind user","still upset about hg","neural network backpropagater","vinyl record owner","head-fi'er","phd student","researcher","computer scientist","fully gdb dependent","agile, like a cheetah","los alamos national laboratory","brandeis university","university of arizona","hp vertica","hubspot","occasional gym-goer","feminist","long-time pandora subscriber","math enthusiast","database normalizer","big-o calculator","nodejs dev","angular controller","jquery hater","css novice","webfont curious","extremely color-blind","judith butler reader","bell hooks is my jam","sci-fi lover","eclipse user","wanna-be emacs guru","ruby polisher","c guy","x86 spinner","gpgpu accelerator", "go-pher", "sql querier", "npm installer","list comprehender","javascripter", "arch linux user","haskell aspirer","lisp processor","scheme-er","django user","flask-er","express fan","async promiser","data encoder","data decoder"];
var index = 0;


// thanks stackoverflow... http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// how is this not built in?
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
    }

    return array;
}

shuffle(labels);


function rotateText() {
    $("#textDesc").text(labels[index]);
    index = (index + 1) % labels.length;
}

$(document).ready(() =>  {
    var canvas = document.getElementById("fract");
    canvas.width = Math.min(window.innerWidth, maximumWidth);
    canvas.height = window.innerHeight;

    setInterval(rotateText, 2000);

    $(window).resize(fixCanvasSize);
    
});



