//We should add comments on the code - to explain what it is doing and how it achieves that goal

// The CameraVideoPageController is a class that controls the camera 
// video page.  This class provides a some useful methods you will
// need to call:
//     cameraVideoPage.displayMessage(message, timeout):
//         Causes a short message string to be displayed on the
//         page for a brief period.  Useful for showing quick
//         notifications to the user.  message is a plain string.
//         timeout is option and denotes the length of time in msec
//         to show the message for.
//     cameraVideoPage.setHeadsUpDisplayHTML(html):
//         This will set or update the heads-up-display with the
//         text given in the html argument.  Usually this should 
//         just be a string with text and line breaks (<br />).

// Initialise the camera video page and callback to our 
// cameraVideoPageInitialised() function when ready.
var cameraVideoPage = new CameraVideoPageController(cameraVideoPageInitialised);

// You may need to create variables to store state.
//// Variables for the height of the smartphone camera from the ground, height of the object, distance between smartphone and the object, respectively.
var camera_height, height, distance;
var n = 10, numset=0;
// Variable absolute and beta have empty brackets because they are integers updated from the sensors(?). Beta is the angle between the ground and 
var absolute = [], beta=[];
var base_angle, apex_angle;
var complete = false;
// Creates variables used to store the orientation of the device

// This function will be called when the camera video page
// is intialised and ready to be used.
function cameraVideoPageInitialised(){
    // Step 1: Check for and intialise deviceMotion
	window.addEventListener("deviceorientation", (function(event){
		beta.push(event.beta);
		if(numset<n){numset++;}else{beta.shift();}
		display(beta, camera_height, distance, height);	
	}), true);	
}
 
// This function is called by a button to set the height of phone from the
// ground, in metres.
function setCameraHeightValue(){
    // Step 3: Set camera height
    // check if input is a number and is positive
    // display on screen using the displayMessage method
	var invalid = true;
	while(invalid){
		camera_height = prompt("Please enter the height of this phone in metres:");	
		if(camera_height === null){
			camera_height=undefined; return;
		}
		invalid = (camera_height<=0 || camera_height === undefined || isNaN(camera_height));
		if(invalid){
			cameraVideoPage.displayMessage("Height must be a positive number");
		}
	}
	cameraVideoPage.displayMessage("The height has been set to "+camera_height+" metres");
	if(complete){
		cameraVideoPage.displayMessage("Correcting height and revising estimations ...");
		distance = calc_distance(camera_height, base_angle);
		height = calc_height(camera_height,base_angle, apex_angle);
		display(beta, camera_height, distance,height);
	}
}
    
// This function is called by a button to set the angle to the base of
// the object being measured.  It uses the current smoothed tilt angle.
function setBaseTiltAngle(){
	if(camera_height===undefined){
		alert("You need to set the camera height first.");
		setCameraHeightValue();
	}
	if(camera_height===undefined){
		return;
	}else if(camera_height>0){
		// Step 4: Record tilt angle 
		// display on screen using the displayMessage method
		base_angle = avg(beta);
		if(base_angle>90){
			cameraVideoPage.displayMessage("Base of object must be lower than eye level.");
		}else if(base_angle<0){
			cameraVideoPage.displayMessage("Phone cannot be upside down.");
		}else{
			cameraVideoPage.displayMessage("Base angle set at "+base_angle.toFixed(1)+" degrees");
			distance = calc_distance(camera_height, base_angle);
			cameraVideoPage.displayMessage("You are approximately "+distance.toFixed(2)+" metres away from the object");
			cameraVideoPage.displayMessage("You can now set the apex angle to complete height estimation.");
		}
	}
}

// This function is called by a button to set the angle to the apex of
// the object being measured.  It uses the current smoothed tilt angle.
function setApexTiltAngle(){
    // Step 4: Record tilt angle 
    // display on screen using the displayMessage method
	
	if(distance===undefined){
		cameraVideoPage.displayMessage("Please set the base angle first.");
	}else{
		apex_angle = avg(beta);
		if(apex_angle<0) {cameraVideoPage.displayMessage("Phone cannot be upside down.");}
		else{
			cameraVideoPage.displayMessage("Apex angle set at "+apex_angle.toFixed(1)+" degrees");
			height = calc_height(camera_height,base_angle, apex_angle);
			cameraVideoPage.displayMessage("The object is estimated to be "+height.toFixed(2)+" metres tall");
			complete = true;
		}
	}
}

// You may need to write several other functions.
//This function finds the average of an array
//In this code, it is being used to smooth the beta angles, allowing for more accurate measurements
function avg(arr){
	var sum = 0;
	for(var i=0; i<arr.length; i++){
		sum+=arr[i];
	}
	return sum/arr.length;
}

//This function updates the headsUpDisplay overlay that is continuously shown to the user, with the important values, 
//such as angle, height of camera and calculated values such as distance and height of object
function display(beta, camera_height, distance,estimated_height){
	var display_string = [];
	display_string.push("Angle: "+disp(avg(beta),"°", 1));
	display_string.push("Height of camera: "+disp(camera_height,"m",2));
	display_string.push("Distance from object: "+disp(distance, "m",2));
	display_string.push("Height of object: "+disp(height, "m",2));
	cameraVideoPage.setHeadsUpDisplayHTML(display_string.join("<br/>"));	
}

//This performs string formatting on a value: Adds the unit and 
//rounds the number to a specified number of decimal places. Returns unknown if value is undefined or NaN
function disp(value, unit, precision){
	if(value===undefined || isNaN(value)){return "Unknown";}
	else{return parseFloat(value).toFixed(precision)+unit;}
}

//This function calculates the distance of an object given the height of sensor relative to the base of the object,
// and the base angle (orientation of the sensor when pointing to the base of the object)
function calc_distance(sensor_height, b_angle){return sensor_height*Math.tan(b_angle*Math.PI/180);}

//This function estimates the height of the object given the relative height of the sensor, 
//and the angles the phone makes with the horizontal when it points to the base and apex of the object
function calc_height(sensor_height,b_angle, top_angle){
	//Inputs:
	//	sensor_height = The height of the sensor relative to the base of the object
	//	base_angle = The angle the phone makes with the horizontal, screen up, 
	//				 when it's camera directly points to the base of the object
	//	top_angle = Same as base_angle, except the phone points to the apex of the object instead of the base
	
	//Output: The estimated height of the object
	var dist = calc_distance(sensor_height, b_angle);
	return parseFloat(sensor_height)+parseFloat(dist*Math.tan(Math.PI*(top_angle-90)/180));
}
