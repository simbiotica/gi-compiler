define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!cartocss/styles.carto.css',
  'text!queries/map.pgsql',
  'text!templates/infowindow.handlebars'
], function(_, underscoreString, Backbone, CARTOCSS, QUERY, INFOWINDOW_TEMPLATE) {

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
      this.$legend = $('#mapLegend');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:map', this.setLayer, this);
    },

    createMap: function() {
      this.map = L.map(this.options.mapId, this.options.map);
      L.tileLayer(this.options.tileUrl).addTo(this.map);
    },

    setTitle: function() {
      var deferred = new $.Deferred();

      $.get(this.getUrl(), _.bind(function(data) {
        this.$title.text(data.rows[0].title);
        deferred.resolve();
      }, this));

      return deferred.promise();
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

      this.currentParams = params;

      $.when(this.setTitle()).then(_.bind(function() {

        if (!this.map) {
          this.createMap();
        }

        if (this.layer) {
          this.layer.setSQL(query);
          this.layer.setCartoCSS(styles);
        } else {
          this.options.cartodb.sublayers = [{
            sql: query,
            cartocss: styles,
            interactivity: 'name, answerscore, project, value'
          }];

          cartodb.createLayer(this.map, this.options.cartodb)
            .addTo(this.map)
            .on('done', _.bind(function(layer) {
              this.layer = layer.getSubLayer(0);
              this.setInfowindow();
              this.setLegend();
            }, this))
            .on('error', function(err) {
              throw 'some error occurred: ' + err;
            });
        }

      }, this));

    },

    setInfowindow: function() {
      this.infowindow = cdb.vis.Vis.addInfowindow(this.map, this.layer, this.options.cartodb.sublayers[0].interactivity, {
        infowindowTemplate: INFOWINDOW_TEMPLATE
      });
    },

    setLegend: function() {
      var legend = new cdb.geo.ui.Legend({
        type: 'custom',
        data: [{
          name: 'Yes, administrative units accounting for all expenditures are presented.',
          value: '#136400'
        }, {
          name: 'No, expenditures are not presented by administrative unit.',
          value: '#850200'
        }, {
          name: 'Yes, administrative units accounting for at least two-thirds of, but not all, expenditures are presented.',
          value: '#FFA300'
        }]
      });

      // var stackedLegend = new cdb.geo.ui.Legend.Stacked({
      //   legends: [simpleLegend]
      // });

      this.$legend.html(legend.render().$el);
    }

  });

  return MapView;

});
