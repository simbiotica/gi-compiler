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
      mapId: 'map',
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
      this.$title = $('#mapTitle');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:map', this.setLayer, this);
      Backbone.Events.on('Router:map', this.setTitle, this);
    },

    createMap: function() {
      this.map = L.map(this.options.mapId, this.options.map);
      L.tileLayer(this.options.tileUrl).addTo(this.map);
      this.map.invalidateSize();
    },

    setTitle: function(params) {
      this.currentParams = params;

      $.get(this.getUrl(), _.bind(function(data) {
        this.$title.text(data.rows[0].title);
      }, this));
    },

    getUrl: function() {
      return '//globalintegrity.cartodb.com/api/v1/sql?q=' + this.getQuery();
    },

    getQuery: function() {
      return _.str.sprintf('SELECT aspecttext AS title FROM export_generic_prod_%(table)s_dp WHERE export_generic_prod_%(table)s_dp.aspectid=\'%(question)s\' LIMIT 1', {
        table: this.currentParams[0],
        question: this.currentParams[1]
      });
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

      if (this.layer) {
        this.layer.setSQL(query);
        this.layer.setCartoCSS(styles);
      } else {
        this.options.cartodb.sublayers = [{
          sql: query,
          cartocss: styles
        }];

        cartodb.createLayer(this.map, this.options.cartodb)
          .addTo(this.map)
          .on('done', _.bind(function(layer) {
            this.layer = layer.getSubLayer(0);
          }, this))
          .on('error', function(err) {
            throw 'some error occurred: ' + err;
          });
      }
    }

  });

  return MapView;

});
