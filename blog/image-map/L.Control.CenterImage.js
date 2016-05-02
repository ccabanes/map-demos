L.Control.CenterImage = L.Control.extend({
  options: {
    position: 'topright',
  },

  onAdd: function (map) {
    var className = 'leaflet-control-zoom-center-icon', container, content = '';
    container = L.DomUtil.create('div', 'leaflet-bar');
    className += 'center-icon';
    this._createButton(this.options.title, className, content, container, this.toggleFullScreen, this);
    

    return this._container;
  },

  _onClick: function (e) {
    map.eachLayer(function (layer) {
      layer.bindPopup('Hello');
    });
  }, 

  _createButton: function (title, className, content, container, fn, context) {
    this.link = L.DomUtil.create('a', className, container);
    this.link.href = '#';
    this.link.title = title;
    this.link.innerHTML = content;

    L.DomEvent
      .addListener(this.link, 'click', L.DomEvent.stopPropagation)
      .addListener(this.link, 'click', L.DomEvent.preventDefault)
      .addListener(this.link, 'click', fn, context);
    
    L.DomEvent
      .addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
      .addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
      .addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
    
    L.DomEvent
      .addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
      .addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
      .addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

    return this.link;

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.CenterImage();
        this.addControl(this.positionControl);
    }
});

L.control.centerImage = function (options) {
    return new L.Control.CenterImage(options);
};
