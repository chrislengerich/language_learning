// ==UserScript==
// @name         Tingxie Reader 
// @include      https://translate.google.com/*
// @include      http://translate.google.com/*
// @version      0.1
// @extension_id	ifjmolgbefhbldkmcjkellbopinimbli

function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

var nextWordPause = 4000; 
var mouseDownPause = 200; 

var shuffle = function(array) {
  console.log(array.length); 
  for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
  console.log(array); 
  return array;
}

// speak in vocabulary terms  
var speakDefs = function(defs, index) { 
  if (index < defs.length) { 
    simulate(defs[index],"mousedown"); 
    // mitigate a race condition
    setTimeout(function() {simulate(defs[index],"mouseup");}, mouseDownPause); 
    setTimeout(function() {speakDefs(defs, index+1);}, nextWordPause); 
  }
}

var running = false; 

var runTingXie = function(words, index) { 
  if (index == 0 && running) {  
    return null; 
  } 
  running = true; 
  if (index < words.length) { 
    running = true; 
    var defs = words.filter(":eq(" + index + ")").find(".goog-toolbar-button.goog-inline-block.trans-listen-button"); 
    console.log(words.filter(":eq(" + index + ")")); 
    console.log(defs.length); 
    speakDefs(defs,0); 
    setTimeout(function() { runTingXie(words, index+1);}, 2*nextWordPause); 
  } else { 
    running = false; 
  }  
}; 

$(document).ready ( function(){

// flyout the vocabulary list
simulate($(".jfk-button.jfk-button-standard.jfk-button-narrow.pb-sw")[0],"mousedown"); 
simulate($(".jfk-button.jfk-button-standard.jfk-button-narrow.pb-sw")[0],"mouseup"); 

// after the vocab list is populated by the AJAX call, then get the review words 
var words; 
setTimeout(function(){ 
  var button = $('<div></div>', {"class":"goog-inline-block goog-toolbar-button goog-toolbar-button-checked", "aria-pressed":"true", "role":"button", "tabindex":"0", "style":"-webkit-user-select: none;"}); 
  button.append($('<div></div>', {"class":"goog-inline-block goog-toolbar-button-outer-box"}).append($('<div class="goog-inline-block goog-toolbar-butoon-inner-box">听写 by 李睿</div>'))); 
  $('div#pb-tool').append(button[0]); 
  button.bind("click",function() { 
    words = $(".nolabel");
    words = shuffle(words); 
    runTingXie(words,0); }); 
  }, 1000); 
}); 

