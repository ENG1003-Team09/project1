/*
 *
 * Assignment 1 web app
 * 
 * Copyright (c) 2016  Monash University
 *
 * Written by Michael Wybrow
 *
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
*/


function CameraVideoPageController(callback)
{
    var self = this;

    this.initialisationCallback = callback;
    
    // Workaround a bug where the map canvas sometimes doesn't get
    // the correct height: Delay setup of video for a tenth of a second.
    setTimeout(initialiseCamera, 100);

    self.setHeadsUpDisplayHTML = function(htmlString)
    {
        if (typeof(htmlString) == 'number')
        {
            // If argument is a number, convert to a string.
            htmlString = htmlString.toString();
        }
        
        if (typeof(htmlString) != 'string')
        {
            console.log("setHeadsUpDisplayHTML: Argument is not a string.");
            return;
        }

        if (htmlString.length == 0)
        {
            console.log("setHeadsUpDisplayHTML: Given an empty string.");
            return;
        }

        document.getElementById("hud").innerHTML = htmlString;
    }

    self.displayMessage = function(message, timeout)
    {
        if (timeout === undefined)
        {
            // Timeout argument not specifed, use default.
            timeout = 1000;
        }     

        if (typeof(message) == 'number')
        {
            // If argument is a number, convert to a string.
            message = message.toString();
        }

        if (typeof(message) != 'string')
        {
            console.log("displayMessage: Argument is not a string.");
            return;
        }

        if (message.length == 0)
        {
            console.log("displayMessage: Given an empty string.");
            return;
        }

        var snackbarContainer = document.getElementById('toast');
        var data = {
            message: message,
            timeout: timeout
        };
        if (snackbarContainer && snackbarContainer.hasOwnProperty("MaterialSnackbar"))             
        {
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }             
    };

    function initialiseCamera()
    {
        var videoContainer = document.getElementById("video-container");
        videoContainer.innerHTML = '<video autoplay class="bg-video"></video>' + 
            '<object class="crosshairs" type="image/svg+xml" data="crosshairs.svg"></object>';
        
        // Support different browsers
        navigator.getUserMedia = navigator.getUserMedia || 
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia || 
                                 navigator.msGetUserMedia;
    
        if (typeof MediaStreamTrack !== 'undefined')
        {
            MediaStreamTrack.getSources(gotSources);
        }
        else
        {
            self.displayMessage("Camera not supported");
        }
        
        if (self.initialisationCallback)
        {
            self.initialisationCallback();
        }
    }
    
    function successCallback(stream)
    {
        window.stream = stream; // make stream available to console
        var videoElement = document.querySelector("video");    
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();
    }

    function errorCallback(error)
    {
        self.displayMessage("Camera permission error");
        console.log("navigator.getUserMedia error: ", error);
    }

    function sourceSelected(videoSource)
    {
        if (!!window.stream)
        {
            videoElement.src = null;
            window.stream.stop();
        }

        var constraints = {
            video: {
                optional: [{sourceId: videoSource}]
            },
            audio: false
        };

        navigator.getUserMedia(constraints, successCallback, errorCallback);
    }
   
    
    function gotSources(sourceInfos)
    {
        var videoSource = null;

        for (var i = 0; i != sourceInfos.length; ++i)
        {
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'video')
            {
                videoSource = sourceInfo.id;
            }
            else
            {
                console.log('Some other kind of source: ', sourceInfo);
            }    
        }

        sourceSelected(videoSource);
    }
}
