var stage = undefined;


$(function() {
    // DOCUMENT READY
    console.log("hello");


    // API Key:
    // 1005154-143653581dea690e7f4fb94dd
    
    // Example GET:
    // https://pixabay.com/api/?key=1005154-143653581dea690e7f4fb94dd&q=yellow+flowers&image_type=photo

    var width = 300;
    var height = 400;

    stage = new Konva.Stage({
      container: 'konva-container',
      width: width,
      height: height,
    });

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // add the shape to the layer
    layer.add(circle);

    // add the layer to the stage
    stage.add(layer); 


});

$("#go").on("click", function() {
    
    // Get the search query
    var s = $("#image-search").val();
    // alert(s);

    // Build URL
    var url = "https://pixabay.com/api/?key=1005154-143653581dea690e7f4fb94dd"

    // replace " " with "+", URI encode
    var sQ = encodeURI(s.toLowerCase().replace(/ /g, "+"));

    // var q = url + sQ;

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
                if (!hit.type.includes("svg")) {
                    return;
                }
                
                // Make DOM object
                var domElem = `
<div class="thumbs">
    <img class="thumb-img" src="${hit.previewURL}" />
</div>
                `
                // Add to DOM
                $("#image-results").append(domElem);


            });
            
            

            
            console.log(result);
        }
    })
    // console.log(url);

});