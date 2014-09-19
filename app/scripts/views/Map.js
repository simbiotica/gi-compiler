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
      colors: ['#136400', '#FFA300', '#850200', '#FF0000', '#00FF00'],
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

      // var styles = _.str.sprintf(CARTOCSS, {
      //   table: params.table
      // });

      this.currentParams = params;

      console.log(this.getCartoCSS());

      $.when(this.setTitle()).then(_.bind(function() {

        if (!this.map) {
          this.createMap();
        }

        if (this.layer) {
          this.layer.setSQL(query);
          this.layer.setCartoCSS(this.getCartoCSS());
        } else {
          this.options.cartodb.sublayers = [{
            sql: query,
            cartocss: this.getCartoCSS(),
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
      var dataArr = [],
          legend,
          colors = this.options.colors;

      $.get(this.getLegendUrl(), _.bind(function(data) {

        // _.each(data.rows, _.bind(function(d, i) {
        //   dataArr.push({
        //     name: d.choice +','+ d.criteria,
        //     value: colors[i]
        //   });
        // }, this));

        dataArr = _.map(data.rows, function(d, i) {
          return {
            name: d.choice +','+ d.criteria,
            value: colors[i]
          };
        }, this);

        legend = new cdb.geo.ui.Legend({
          type: 'custom',
          data: dataArr
        });

        this.$legend.html(legend.render().$el);
      }, this));
    },

    getLegendUrl: function() {
      return '//globalintegrity.cartodb.com/api/v1/sql?q=' + this.getLegendQuery();
    },

    getLegendQuery: function() {
      return _.str.sprintf('SELECT choice, score, criteria FROM export_generic_prod_%(table)s_meta WHERE aspectid=\'%(question)s\'', {
        table: this.currentParams[0],
        question: this.currentParams[1]
      });

      //return 'SELECT choice, score, criteria FROM export_generic_prod_107_meta WHERE aspectid=\'Q8904\'';
    },

    getCartoCSS: function() {
      return _.str.sprintf(CARTOCSS, {
        table: this.currentParams[0],
        colors: '#export_generic_prod_107_dp[answer="Yes, administrative units accounting for all expenditures are presented."] {polygon-fill: #136400;}'
      });
    }

  });

  return MapView;

});
