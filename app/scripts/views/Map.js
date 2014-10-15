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
      colorsPath: ['#078D00', '#68D037', '#FFFFA9', '#FF9E00', '#FF1500'],
      tileUrl: 'https://cartocdn_{s}.global.ssl.fastly.net/base-dark/{z}/{x}/{y}.png',
      cartodb: {
        user_name: 'globalintegrity',
        type: 'cartodb',
        sublayers: []
      }
    },

    el: '#mapView',

    events: {
      'click input' : 'loadToolbar',
      'click #expand' : 'expandTitle',
      'click #contract' : 'contractTitle'
    },

    initialize: function() {
      this.$title = $('#mapTitle');
      this.$legend = $('#mapLegend');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:map', this.setLayer, this);
      Backbone.Events.on('Router:embedMap', this.setLayer, this);
      //Backbone.Events.on('Toolbar:submit', this.setLayer, this);
    },

    expandTitle: function(e) {
      e.preventDefault();
      var text = this.completeTitle + ' <a id=\'contract\' href=\'#\'>[<span class=\'bold\'>x</span>]</a>';
      this.$title.html(text);
    },

    contractTitle: function(e) {
      e.preventDefault();
      this.$title.html(this.title);
    },

    loadToolbar: function() {
      Backbone.Events.trigger('toggleToolbar');
    },

    createMap: function() {
      this.map = L.map(this.options.mapId, this.options.map);
      L.tileLayer(this.options.tileUrl).addTo(this.map);
    },

    setTitle: function() {
      var deferred = new $.Deferred();

      $.get(this.getUrl(), _.bind(function(data) {

        this.title = data.rows[0].title;

        if (this.title.length > 225) {
          var text = _.str.chop(this.title, 225);

          text[0] += '... <a id=\'expand\' href=\'#\'>[...]</a>';
          this.completeTitle = this.title;
          this.title = text[0];
        }
        this.$title.html(this.title);
        deferred.resolve();
      }, this));

      return deferred.promise();
    },

    getUrl: function() {
      return '//globalintegrity.cartodb.com/api/v2/sql?q=' + this.getQuery();
    },

    getQuery: function() {
      return _.str.sprintf('SELECT aspecttext AS title FROM export_generic_prod_%(table)s_dp WHERE export_generic_prod_%(table)s_dp.aspectid=\'%(question)s\' LIMIT 1', {
        table: this.currentParams[0],
        question: this.currentParams[1]
      });
    },

    setLayer: function(params) {

      if (params[1]) {

        var query = _.str.sprintf(QUERY, {
          table: params[0],
          answer: params[1]
        });

        this.currentParams = params;

        $.when(
          this.setTitle(),
          this.getCartoCSS()
        )
        .then(_.bind(function(title, styles) {

          if (!this.map) {
            this.createMap();
          }

          if (this.layer) {
            this.layer.setSQL(query);
            this.layer.setCartoCSS(styles);
            this.layer.show();
            this.setLegend();
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
      }
    },

    setInfowindow: function() {
      this.infowindow = cdb.vis.Vis.addInfowindow(this.map, this.layer, this.options.cartodb.sublayers[0].interactivity, {
        infowindowTemplate: INFOWINDOW_TEMPLATE
      });
    },

    setLegend: function() {
      var dataArr = [],
          legend;

      $.get(this.getLegendUrl(), _.bind(function(data) {

        dataArr = _.map(data.rows, function(d, i) {
          return {
            name: d.choice +','+ d.criteria,
            value: this.options.colorsPath[i]
          };
        }, this);

        if (data.rows[0].criteria === '') {

          legend = new cdb.geo.ui.Legend({
            type: 'custom',
            data: [
              { name: '76 - 100', value: this.options.colorsPath[0]},
              { name: '51 - 75', value: this.options.colorsPath[1]},
              { name: '26 - 50', value: this.options.colorsPath[2]},
              { name: '0 - 25', value: this.options.colorsPath[3]}
            ]
          });

        } else {
          legend = new cdb.geo.ui.Legend({
            type: 'custom',
            data: dataArr
          });
        }

        this.$legend.html(legend.render().$el);

      }, this));
    },

    getCartoCSS: function() {
      var deferred = new $.Deferred();
      var colorsArr = [];

      $.get(this.getLegendUrl(), _.bind(function(data) {
        colorsArr = _.map(data.rows, function(d, i) {
          return _.str.sprintf('#export_generic_prod_%(table)s_meta[answer=\'%(criteria)s\'] {polygon-fill: %(color)s;}', {
            table: this.currentParams[0],
            criteria: (d.criteria === '') ? d.answerscore : d.criteria,
            color: this.options.colorsPath[i]
          });
        }, this);

        return deferred.resolve(_.str.sprintf(CARTOCSS, {
          table: this.currentParams[0],
          colors: colorsArr.join(' ')
        }));

      }, this));

      return deferred.promise();
    },

    getLegendUrl: function() {
      return '//globalintegrity.cartodb.com/api/v2/sql?q=' + this.getLegendQuery();
    },

    getLegendQuery: function() {

      return _.str.sprintf('SELECT export_generic_prod_%(table)s_meta.choice, export_generic_prod_%(table)s_meta.score, export_generic_prod_%(table)s_meta.criteria FROM export_generic_prod_%(table)s_meta WHERE aspectid=\'%(question)s\'', {
        table: this.currentParams[0],
        question: this.currentParams[1]
      });
    }

  });

  return MapView;
});
