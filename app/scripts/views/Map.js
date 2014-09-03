define([
  'backbone'
], function(Backbone) {

  'use strict';

  var MapView = Backbone.View.extend({

    options: {
      map: {
        zoom: 3,
        center: [0, 0]
      }
    },

    el: '#mapView',

    initialize: function() {
      this.setMap();
    },

    setMap: function() {
      this.map = L.map(this.el, this.options.map);
    }

  });

  return MapView;

});
