$(document).ready(function(){
    buildTiles();

    var zoomIn = new Hammer($("[action=zoom-in]")[0]);
    zoomIn.on("tap", function(){
        zoom("in");
    });

    var panner = new Hammer($(".all-wrapper")[0]);
    panner.get('pan').set({ threshold: 10 });
    panner.on("panmove", function(e){
        pan(e);
    });




    //Detect end of panning and update panner
    var panEnder = new Hammer($(".all-wrapper")[0]);

    panEnder.on("panend", function(e) {
        panEnd(e);
    });

    var zoomOut = new Hammer($("[action=zoom-out]")[0]);
    zoomOut.on("tap", function(){
        zoom("out");
    });

    $("[action=edit-tile]").hammer().on("tap", function(){
        zoom("alltheway");
    });

    var zenLeft = new Hammer($("[direction=left]")[0]);
    zenLeft.on("tap", function(e){
        if($(e.target).hasClass("enabled")){
            slideTile("left");
        }
    });
    var zenRight = new Hammer($("[direction=right]")[0]);
    zenRight.on("tap", function(e){
        if($(e.target).hasClass("enabled")){
            slideTile("right");
        }
    });
    var zenUp = new Hammer($("[direction=up]")[0]);
    zenUp.on("tap", function(e){
        if($(e.target).hasClass("enabled")){
            slideTile("up");
        }
    });
    var zenDown = new Hammer($("[direction=down]")[0]);
    zenDown.on("tap", function(e){
        if($(e.target).hasClass("enabled")){
            slideTile("down");
        }
    });



});

function slideTile(direction){

    var thisX = $(".current-tile").attr("x");
    var thisY = $(".current-tile").attr("y");

    if(direction == "down") {
        showTile(parseInt(thisX), parseInt(thisY) + 1);
    }
    if(direction == "up") {
        showTile(parseInt(thisX), parseInt(thisY) - 1);
    }
    if(direction == "left") {
        showTile(parseInt(thisX) - 1, parseInt(thisY) );
    }
    if(direction == "right") {
        showTile(parseInt(thisX) + 1, parseInt(thisY));
    }


}

var tileWidth = 360;
var tileHeight = 430;
var gridSize = 21;
var ended;

function tapTile(e){

    var target = e.target;

    if($("body").attr("mode") == "aerial" || $("body").attr("mode") == "map") {

        $(".current-tile").removeClass("current-tile");

        $(target).closest(".tile").addClass("current-tile");

        var x = parseInt($(".current-tile").attr("x"));
        var y = parseInt($(".current-tile").attr("y"));

        $("[x="+x+"][y="+y+"]").addClass("current-tile");

        zoom("in","taptile");
    }

    if($("body").attr("mode") == "semi") {
        if($(e.target).closest(".tile").hasClass('current-tile')){
            $("body").toggleClass("zen");
            updateZen();
        } else {
            var x = parseInt($(e.target).closest(".tile").attr("x"));
            var y = parseInt($(e.target).closest(".tile").attr("y"));
            showTile(x,y);

        }
    }

}

function pan(gesture){

    ended = false;

    var currentMode = $("body").attr("mode");

    var currentX = parseInt($(".panner").attr("panx"));
    var currentY = parseInt($(".panner").attr("pany"));

    if(currentMode == "aerial"){
        var newX = currentX + gesture.deltaX * (1/.31);
        var newY = currentY + gesture.deltaY * (1/.31);
        $(".panner").addClass("panning");
        $(".panner").css("transform","translateX("+newX+"px) translateY("+newY+"px)");
    }

    if(currentMode == "map"){
        var newX = currentX + gesture.deltaX * (1/.12);
        var newY = currentY + gesture.deltaY * (1/.12);
        $(".panner").addClass("panning");
        $(".panner").css("transform","translateX("+newX+"px) translateY("+newY+"px)");
    }

}

function panEnd(gesture){

    $(".panner").removeClass("panning");

    var currentMode = $("body").attr("mode");

    if(!ended && currentMode == "aerial") {
        var currentX = parseInt($(".panner").attr("panx"));
        var currentY = parseInt($(".panner").attr("pany"));
        var newX = currentX + gesture.deltaX * (1/.31);
        var newY = currentY + gesture.deltaY * (1/.31);
        $(".panner").attr("pany",newY).attr("panx",newX);
    }

    if(!ended && currentMode == "map") {
        var currentX = parseInt($(".panner").attr("panx"));
        var currentY = parseInt($(".panner").attr("pany"));
        var newX = currentX + gesture.deltaX * (1/.12);
        var newY = currentY + gesture.deltaY * (1/.12);
        $(".panner").attr("pany",newY).attr("panx",newX);
    }

    ended = true;
    panning = false;
}


function zoom(direction, method){

    var currentMode = $("body").attr("mode");
    var newMode;

    if(direction == "alltheway") {
        newMode = "edit";
        $("body").attr("mode",newMode);
        $("body").attr("mode",newMode);
        return;
    }

    if(currentMode == "edit") {
        if(direction == "out") {
            newMode = "semi";
            $(".selected-element").removeClass("selected-element");
        }
        $("body").attr("mode",newMode);
    }

    // Aerial to Semi
    if(currentMode == "aerial" || currentMode == "map") {

        if(direction == "in") {

            if(currentMode == "aerial"){
                newMode = "semi";
            } else {
                newMode = "aerial"
            }

            var panX = parseInt($(".panner").attr("panx"));
            var panY = parseInt($(".panner").attr("pany"));

            var gridWidth = parseInt($(".tile-grid").width());
            var gridHeight = parseInt($(".tile-grid").height());

            var centerX = gridWidth/2 - panX;
            var centerY = gridHeight/2 - panY;

            var minDelta = 1000000000000000;
            var closestTile;

            $(".zoomer .tile").each(function(){
                var tileCenterX = parseInt($(this).attr("x")) * tileWidth + tileWidth/2;
                var tileCenterY = parseInt($(this).attr("y")) * tileHeight + tileHeight/2;

                var deltaX = Math.abs(centerX - tileCenterX);
                var deltaY = Math.abs(centerY - tileCenterY);

                var totalDelta = deltaX + deltaY;

                if(totalDelta < minDelta) {
                    minDelta = totalDelta;
                    closestTile = $(this);

                }

            });


            if(method == "taptile") {

            } else {

                $(".current-tile").removeClass("current-tile");

                var x = parseInt(closestTile.attr("x"));
                var y = parseInt(closestTile.attr("y"));

                $("[x="+x+"][y="+y+"]").addClass("current-tile");
            }


            var thisX = $(".current-tile").attr("x");
            var thisY = $(".current-tile").attr("y");

            var left = tileWidth * ((gridSize-1)/2-thisX);
            var top =  tileHeight * ((gridSize-1)/2-thisY)

            var time = 300;

            if(parseInt($(".panner").attr("panx")) == left && parseInt($(".panner").attr("pany")) == top  ) {
                time = 0;
            }

            panToSelected();

            setTimeout(function(){
                $(".panner").addClass("not-animating");
                $("body").attr("mode",newMode);
            },time);

            setTimeout(function(){
                $(".panner").removeClass("not-animating");
            },600);

        } else {
            newMode = "map";
            $("body").attr("mode",newMode);
        }
    }

    // SEMI MODE
    if(currentMode == "semi") {
        if(direction == "in") {
            newMode = "edit";
            $("body").attr("mode",newMode);
        } else {
            newMode = "aerial";
            $("body").attr("mode",newMode);
            var jam = $(".current-tile");
            $(".current-tile").removeClass("current-tile");
            setTimeout(function(){
                jam.addClass("current-tile");
            },200);
        }
    }



}

function panToSelected(){

    var thisX = $(".current-tile").attr("x");
    var thisY = $(".current-tile").attr("y");

    var left = tileWidth * ((gridSize-1)/2-thisX);
    var top =  tileHeight * ((gridSize-1)/2-thisY)

    $(".panner").css("transform","translateX(" + left + "px) translateY("+ top +"px)");
    $(".panner").attr("panx",left).attr("pany",top);
}

var project;
var limits = {};
limits.maxX = -100000000000;
limits.minX = 100000000000;
limits.maxY = -100000000000;
limits.minY = 100000000000;

function buildTiles(){

    var projectName = window.localStorage.getItem('project') || "yams";

    if(projectName == "yams"){
        project = yams;
    } else if (projectName == "atkins"){
        project = atkins;
    } else if (projectName == "comic"){
        project = comic;
    } else if (projectName == "wedding"){
        project = wedding;
    } else if (projectName == "sandwiches"){
        project = sandwiches;
    } else if (projectName == "onedirection"){
        project = onedirection;
    } else {
        project = atkins;
    }

    $(".all-wrapper").css("background-color",project.background);
    $(".top-ui").css("background-color",project.titlecolor || project.background);

    $("[action=zoom-in]").css("background-color",project.titlecolor);
    $(".top-ui").find(".title").text(project.title);
    document.title = project.title;

    for(var i = 0; i < gridSize; i++){
        for(var j = 0; j < gridSize; j++){


            for(var key in project.tiles){
                var yamtile = project.tiles[key];
                if(yamtile.x + 11 == i && yamtile.y + 11 == j){

                    var tile = $("<div class='tile'><div class='tile-working-area'></div>");
                    tile.attr("x",i).attr("y",j);

                    var top = j * tileHeight
                    tile.css("top", top + "px");
                    var left = i * tileWidth;
                    tile.css("left", left + "px");
                    tile.css("height", tileHeight + "px");
                    tile.css("width", tileWidth + "px");
                    $(".tile-grid").append(tile);
                    tile.find(".tile-working-area").css("background-image","url("+yamtile.img+")");


                    if(left < limits.minX) {
                        limits.minX = left;
                    }
                    if(left > limits.maxX) {
                        limits.maxX = left;
                    }
                    if(top < limits.minY) {
                        limits.minY= top;
                    }
                    if(top > limits.maxY) {
                        limits.maxY = top;
                    }


                    var mc = new Hammer(tile[0]);
                        mc.on("tap",function(e){
                           tapTile(e);
                           if($("body").attr("mode") == "edit" && e.target.tagName == "H1"){
                               $(e.target).toggleClass("selected-element");
                           }
                           if($("body").attr("mode") == "semi" && e.target.tagName == "H1"){
                               $(e.target).addClass("selected-element");
                               zoom("alltheway");
                           }
                           if($("body").attr("mode") == "edit" && e.target.tagName != "H1"){
                               $(".selected-element").removeClass("selected-element");
                           }
                       });
                     }
                  }



              }

        }


    $(".tile-grid").css("height",parseInt(tileHeight * gridSize) + "px");
    $(".tile-grid").css("width",parseInt(tileWidth * gridSize) + "px");

    // :(
    setTimeout(function(){
        setMiddle((gridSize-1) / 2,(gridSize-1) / 2);
    },1)

    buildSwiper();

    startTile((gridSize-1)/2 + project.startX,((gridSize-1)/2) + project.startY);

    var r = parseInt(project.titlecolor.slice(1,3),16);
    var g = parseInt(project.titlecolor.slice(3,5),16);
    var b = parseInt(project.titlecolor.slice(5,7),16);

    var avg = (r + b + g ) / 3;
    var lightness = 100 * avg/255;

    if(lightness < 40){
        $(".zen-indicator").addClass("dark");
    } else {
        $(".zen-indicator").addClass("light");
    }


}

//Add the swipe listener to handle swiping in semi mode
var panning = false;
function buildSwiper(){

    var swiper = new Hammer($(".all-wrapper")[0]);
    swiper.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    swiper.get('pan').set({ threshold: 30 });

    swiper.on("panleft panright panup pandown", function(ev) {
        var enough = false;

        if(Math.abs(ev.deltaX) > 30 || Math.abs(ev.deltaY) > 30){
            enough = true;
        }

        if(enough && $("body").attr("mode") == "semi" && panning == false) {

            var thisX = $(".current-tile").attr("x");
            var thisY = $(".current-tile").attr("y");

            var cantgo = true;
            var direction;

            if(ev.type == "pandown") {
                direction = "down";
                if($(".tile[x="+thisX+"][y="+(parseInt(thisY)-1)+"]").length > 0){
                    showTile(parseInt(thisX), parseInt(thisY) - 1);
                    cantgo = false;
                }
            }
            if(ev.type == "panup") {
                    direction = "up";
                if($(".tile[x="+thisX+"][y="+(parseInt(thisY)+1)+"]").length > 0){
                    showTile(parseInt(thisX), parseInt(thisY) + 1);
                    cantgo = false;

                }
            }
            if(ev.type == "panleft") {
                direction = "left";
                if($(".tile[x="+(parseInt(thisX)+1)+"][y="+thisY+"]").length > 0){
                    showTile(parseInt(thisX) + 1, parseInt(thisY));
                    cantgo = false;

                }
           }
            if(ev.type == "panright") {
                    direction = "right";
                if($(".tile[x="+(parseInt(thisX)-1)+"][y="+thisY+"]").length > 0){
                    showTile(parseInt(thisX) - 1, parseInt(thisY));
                    cantgo = false;
                }
           }

           if(cantgo){
               $(".tile[x="+thisX+"][y="+thisY+"]").attr("wobble",direction);
               setTimeout(function(){
                   $("[wobble]").removeAttr("wobble");
                   $(".current-tile").width($(".current-tile").width());
               },450);

           }
           panning = true;
       }
    });
}

function startTile(x,y){

    x++;
    y++;

    $(".current-tile").removeClass("current-tile");

    $("[x="+x+"][y="+y+"]").addClass("current-tile");



    $("[x="+x+"][y="+y+"]").each(function(){

        $(this)[0].classList.add("current-tile");
    });

    panToSelected();

    setTimeout(function(){
        $(".panner").removeClass("not-animating");
    },300);

    if(project.startZoom == "semi"){
        setTimeout(function(){
            zoom("in");
        },300);
    }
}


function setMiddle(x,y){
    var heightX = ($(".all-wrapper").height() - tileHeight) / 2;
    var xDelta = -1 * ( x * tileWidth);
    var yDelta = -1 * ((y * tileHeight) - heightX);
    $(".tile-grid").css("transform","translateX("+xDelta+"px) translateY("+yDelta+"px)");
}


function showTile(x,y){
    var currentX = $(".current-tile").attr("x");
    var currentY = $(".current-tile").attr("y");

    var deltaX = currentX - x;
    var deltaY = currentY - y;

    var currentPanX = parseInt($(".panner").attr("panx"));
    var currentPanY = parseInt($(".panner").attr("pany"));

    var newPanX = currentPanX + ((deltaX * tileWidth));
    var newPanY = currentPanY + ((deltaY * tileHeight));

    $(".current-tile").removeClass("current-tile");
    $("[x="+x+"][y="+y+"]").addClass("current-tile");

    $(".panner").attr("panx",newPanX).attr("pany",newPanY);
    $(".panner").css("transform","translateX("+newPanX+"px) translateY("+newPanY+"px)");



    updateZen();
}


function updateZen(){

    var x = parseInt($(".current-tile").attr("x"));
    var y = parseInt($(".current-tile").attr("y"));

    $(".zen-indicator [direction]").removeClass("enabled");

    $(".zen-indicator").removeClass("fadeout");
    $(".zen-indicator").width($(".zen-indicator").width());
    $(".zen-indicator").addClass("fadeout");

    if($("[x="+(x+1)+"][y="+y+"]").length == 1){
        $(".zen-indicator [direction=right]").addClass("enabled");
    }
    if($("[x="+(x-1)+"][y="+y+"]").length == 1){
        $(".zen-indicator [direction=left]").addClass("enabled");
    }
    if($("[x="+x+"][y="+(y+1)+"]").length == 1){
        $(".zen-indicator [direction=down]").addClass("enabled");
    }
    if($("[x="+x+"][y="+(y-1)+"]").length == 1){
        $(".zen-indicator [direction=up]").addClass("enabled");
    }
}

function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
