define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!cartocss/styles.carto.css',
  'text!queries/map.pgsql'
], function(_, underscoreString, Backbone, CARTOCSS, QUERY) {

  'use strict';

  var MapView = Backbone.View.extend({

    options: {
      map: {
        zoom: 3,
        center: [0, 0]
      },
      tileUrl: 'https://cartocdn_{s}.global.ssl.fastly.net/base-dark/{z}/{x}/{y}.png',
      cartodb: {
        user_name: 'globalintegrity',
        type: 'cartodb',
        sublayers: []
      }
    },

    el: '#mapView',

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:map', this.setLayer, this);
    },

    createMap: function() {
      this.map = L.map(this.el, this.options.map);
      L.tileLayer(this.options.tileUrl).addTo(this.map);
    },

    setLayer: function(params) {
      var query = _.str.sprintf(QUERY, {
        table: params[0],
        answer: params[1]
      });

      var styles = _.str.sprintf(CARTOCSS, {
        table: params.table
      });

      if (!this.map) {
        this.createMap();
      }

      // if (this.layer) {
      //   console.log(this.layer);
      //   this.layer.setSQL(query);
      //   this.layer.setCartoCSS(styles);
      // } else {
      //   this.options.cartodb.sublayers = [{
      //     sql: query,
      //     cartocss: styles
      //   }];

      //   console.log(this.map);

      //   cartodb.createLayer(this.map, this.options.cartodb)
      //     .addTo(this.map)
      //     .on('done', _.bind(function(layer) {
      //       this.layer = layer.getSubLayer(0);
      //     }, this))
      //     .on('error', function(err) {
      //       throw 'some error occurred: ' + err;
      //     });
      // }

      var query = 'SELECT * FROM idea_countries';

      var layerOptions = {
        user_name: 'simbiotica',
        type: 'cartodb',
        sublayers: [{
          sql: query,
          cartocss: '#countries_to_draw{polygon-fill: #015A74; polygon-opacity: 0.7; line-color: #015A74; line-width: 1; line-opacity: 1;}'
        }]
      };

      cartodb.createLayer(this.map, layerOptions)
        .on('done', function(layer) {
          console.log('====== DONE ????????');
        })
        .addTo(this.map);
    }

  });

  return MapView;

});
