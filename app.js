var stage = undefined;
var layer = undefined;

var scale = .2;

$(function() {
    
    // DOCUMENT READY
    console.log("hello");

    //#region

    // API Key:
    // 1005154-143653581dea690e7f4fb94dd
    
    // Example GET:
    // https://pixabay.com/api/?key=1005154-143653581dea690e7f4fb94dd&q=yellow+flowers&image_type=photo

    // Canvas width and height
    var width = 300;
    var height = 400;

    // Create the stage
    stage = new Konva.Stage({
      container: 'konva-container',
      width: width,
      height: height,
    });

    // Create a layer
    layer = new Konva.Layer();

    // add the layer to the stage
    stage.add(layer); 

    /**
     * -----------------------------------------------------------------------------------
     * Stage Events
     * Adapted from https://konvajs.org/docs/select_and_transform/Basic_demo.html
     * -----------------------------------------------------------------------------------
     * Handles Selection / Deselection
     */
    //#region

        // Create a new layer in the Stage for the Transformer
        trLayer = new Konva.Layer();

        stage.add(trLayer);


        // Create a Transformer for the selection
        tr = new Konva.Transformer({
            // nodes: [imgNode],
            rotateAnchorOffset: 30,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            name:"guide"
        });

        // Add the transformer to the Layer
        trLayer.add(tr);

        // add a new feature, lets add ability to draw selection rectangle
        var selectionRectangle = new Konva.Rect({
            fill: 'rgba(121,185,201,0.5)',
            visible: false,
        });

        layer.add(selectionRectangle);

        var x1, y1, x2, y2;
        stage.on('mousedown touchstart', (e) => {

            console.log("mousedown");
            // do nothing if we mousedown on any shape
            if (e.target !== stage) {
                return;
            }
    
            e.evt.preventDefault();
            x1 = stage.getPointerPosition().x;
            y1 = stage.getPointerPosition().y;
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.visible(true);
            selectionRectangle.width(0);
            selectionRectangle.height(0);

        });



        stage.on('mousemove touchmove', (e) => {

            // do nothing if we didn't start selection
            if (!selectionRectangle.visible()) {
                return;
            }

            e.evt.preventDefault();
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.setAttrs({
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
            });
        });


        stage.on('mouseup touchend', (e) => {
            // do nothing if we didn't start selection
            if (!selectionRectangle.visible()) {
                return;
            }
            e.evt.preventDefault();
            // update visibility in timeout, so we can check it in click event
            setTimeout(() => {
                selectionRectangle.visible(false);
            });

            // console.log(stage);

            var shapes = stage.find('.selectable');
            var box = selectionRectangle.getClientRect();
            var selected = shapes.filter((shape) =>
                Konva.Util.haveIntersection(box, shape.getClientRect())
            );

            tr.nodes(selected);
        });


        // clicks should select/deselect shapes
        stage.on('click tap', function (e) {
            // if we are selecting with rect, do nothing
            if (selectionRectangle.visible()) {
                return;
            }

            // if click on empty area - remove all selections
            if (e.target === stage) {
                tr.nodes([]);
                return;
            }

            // do nothing if clicked NOT on our rectangles
            if (!e.target.hasName('selectable')) {
                console.log("Does not have .selectable")
                return;
            }


            console.log("Event target:")
            console.log(e.target);

            // do we pressed shift or ctrl?
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const isSelected = tr.nodes().indexOf(e.target) >= 0;

            if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
            tr.nodes([e.target]);
            } else if (metaPressed && isSelected) {
                // if we pressed keys and node was selected
                // we need to remove it from selection:
                const nodes = tr.nodes().slice(); // use slice to have new copy of array
                // remove node from array
                nodes.splice(nodes.indexOf(e.target), 1);
                    tr.nodes(nodes);
                } else if (metaPressed && !isSelected) {
                // add the node into selection
                const nodes = tr.nodes().concat([e.target]);
                tr.nodes(nodes);
            }
        });
    //#endregion
//#endregion
});

/**
 * GO is clicked
 * Perform a Pixabay search using the text entered in the input
 */

$("#go").on("click", function() {
//#region    
    // Get the search query
    var s = $("#image-search").val();
    // alert(s);

    // Build URL
    var url = "https://pixabay.com/api/?key=1005154-143653581dea690e7f4fb94dd"

    // replace " " with "+", URI encode
    var sQ = encodeURI(s.toLowerCase().replace(/ /g, "+"));

    // API Query Settings
    var settings = {
        "q":sQ,
        "lang":"",
        "id":"",
        "image_type":"vector",
        "orientation":"",
        "category":"",
        "min_width":"",
        "min_height":"",
        "colors":"transparent",
        "editors_choice":"",
        "safesearch":"",
        "order":"",
        "page":"",
        "per_page":"50",
        "callback":"",
        "pretty":""
    }

    // Build URL based on criteria in settings object
    Object.entries(settings).forEach(([key, value]) => {
        if (value == "") {
            return;
        } else {
            url = url + `&${key}=${value}`
        }
    });

    // Send API request
    $.ajax({
        url:url,
        success:function(result) {
            // Parse Pixabay results
           
            // Empty the image results
            $("#image-results").empty();

            // For each hit:
            result.hits.forEach(function(hit) {
                
                // If the image is an SVG
                // if (!hit.type.includes("svg")) {
                //     return;
                // }
                
                // Make DOM object
                var domElem = `
<div class="thumbs">
    <img class="thumb-img" src="${hit.previewURL}" url="${hit.largeImageURL}" props="w=${hit.imageWidth}&h=${hit.imageHeight}" />
</div>
                `
                // Add to DOM
                $("#image-results").append(domElem);


            });
            
            

            
            console.log(result);
        }
    })
    // console.log(url);
//#endregion
});

/**
 * A Pixabay image is clicked
 * Add the image to the canvas
 */
$(document).on("click", ".thumbs", function() {
    //#region
    var imgURL = $(this).find("img").attr("url");

    var props = $(this).find("img").attr("props");

    var imgW = props.split("&")[0].split("=")[1];
    var imgH = props.split("&")[1].split("=")[1];

    // console.log(imgW, imgH);

    var imgWS = Number(imgW * scale);
    var imgHS = Number(imgH * scale);

    // $("")


    // Calculate PPI

    var rW = 15;
    var rH = 20;

    var ppi = calculatePPI(rW, rH, imgW, imgH);

    console.log(ppi);

    writeData(imgURL, imgH, imgW, imgHS, imgWS, ppi)

    var img = Konva.Image.fromURL(imgURL, function (pix) {
        pix.setAttrs({
            x: 0,
            y: 0,
            scaleX: scale,
            scaleY: scale,
            draggable: true,
            name:"selectable"
        });
        layer.add(pix);

        tr.nodes([pix]);

        pix.on("transform", function() {
            updateText(pix);
            // console.log('transform');
        })

    });


    /**
     * When the user resizes the image...
     * https://konvajs.org/docs/select_and_transform/Transform_Events.html
     */


//#endregion
});

/**
 * Calculate the PPI based on target dimensions
 * @param {Number} w Width in Inches
 * @param {Number} h Height in Inches
 * @param {Number} pw Width in Pixels
 * @param {Number} ph Height in Pixels
 * @returns PPI
 */

function calculatePPI (w, h, pw, ph) {
    //#region

    // PPI formula
    // diagonal = √ (width² + height²) 
    // ppi = diagonal in pixels / diagonal in inches

    var dp = Math.sqrt(Math.pow(pw, 2) + Math.pow(ph, 2));
    var di = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));

    var ppi = dp / di;

    return ppi;
    //#endregion
}

/**
 * Updates the image properties in DOM
 * @param {Konva Image()} pix Image to read the properties from
 */
function updateText(pix) {
    // var lines = [
    //   'x: ' + img.x(),
    //   'y: ' + img.y(),
    //   'rotation: ' + img.rotation(),
    //   'width: ' + img.width(),
    //   'height: ' + img.height(),
    //   'scaleX: ' + img.scaleX(),
    //   'scaleY: ' + img.scaleY(),
    // ]


    $("#imgWS").text(`${pix.width() * pix.scaleY()}`)
    $("#imgHS").text(`${pix.height() * pix.scaleX()}`);





  }

  /**
   * Creates and updates properties 
   * @param {String} imgURL URL to the Image
   * @param {String} imgH Height of large image
   * @param {String} imgW Width of large image
   * @param {String} imgHS Current Height of image
   * @param {String} imgWS Current Width of image
   * @param {String} ppi PPI
   */
  
  function writeData(imgURL, imgH, imgW, imgHS, imgWS, ppi) {
      $("#img-props").empty().append(`
      <div id="img-url" class="img-prop">
        <h3>Image URL</h3>
        <p class="prop" id="imgURL">${imgURL}</p>
      </div>
      <div id="img-og-height" class="img-prop">
        <h3>Original Image Height</h3>
        <p class="prop" id="imgH">${imgH}</p>
      </div>
      <div id="img-og-width" class="img-prop">
        <h3>Original Image Width</h3>
        <p class="prop" id="imgW">${imgW}</p>
      </div> 
      <div id="img-height" class="img-prop">
        <h3>Current Image Height</h3>
        <p class="prop" id="imgHS">${imgHS}</p>
      </div>
      <div id="img-width" class="img-prop">
        <h3>Current Image Width</h3>
        <p class="prop" id="imgWS">${imgWS}</p>
      </div>
      <div id="img-ppi" class="img-prop">
        <h3>Effective PPI</h3>
        <p class="prop" id="ppi">${ppi}</p>
      </div>
      `)
  }


  $("#download").on("click", function() {
    hideGuides(); // The guides and transformer will be visible in the output
    var dataURL = stage.toDataURL({ pixelRatio: 15 });
    downloadURI(dataURL, 'stage.png')
    showGuides();
  });

/**
 * -----------------------------------------------------------------------------------
 * Hide the Guides
 * -----------------------------------------------------------------------------------
 * */
function hideGuides() {
    //#region
        // Hide the guides
        stage.find(".guide").forEach(function(guide) {
            guide.hide();
        })

        // Deselect things
        tr.hide();
    //#endregion
}

/**
 * -----------------------------------------------------------------------------------
 * Show the Guides
 * -----------------------------------------------------------------------------------
 * */
 function showGuides() {
    //#region
        // Hide the guides
        stage.find(".guide").forEach(function(guide) {
            guide.show();
        })

        // Deselect things
        tr.show();
    //#endregion
}

/**
 * -----------------------------------------------------------------------------------
 * Downloads the PNG
 * -----------------------------------------------------------------------------------
 * */
function downloadURI(uri, name) {
    //#region
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
    //#endregion
  }