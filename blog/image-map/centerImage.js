//Declare global variables
var center_image;

//Create a control to increase the opacity value. This makes the image more opaque.
L.Control.centerImage = L.Control.extend({
    options: {
        position: 'topright'
    },
    setOpacityLayer: function (layer) {
            opacity_layer = layer;
    },
    onAdd: function () {
        
        var center_image_div = L.DomUtil.create('div', 'center_image_div');

        L.DomEvent.addListener(center_image_div, 'click', L.DomEvent.stopPropagation)
            .addListener(center_image_div, 'click', L.DomEvent.preventDefault)
            .addListener(center_image_div, 'click', function () { centerOnImage() });
        
        return center_image_div;
    }, 

    function centerOnImage() {
    
    //When you double-click on the control, do not zoom.
    map.eachLayer(function (layer) {
        layer.bindPopup('Hello');
    });    

}
});