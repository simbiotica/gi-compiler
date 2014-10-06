define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!queries/targets.pgsql'
], function(_, underscoreString, Backbone, QUERY) {

  'use strict';

  var TargetsCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      this.on('request', function() {
        Backbone.Events.trigger('collection:fetch');
      });
      this.on('sync', function() {
        Backbone.Events.trigger('collection:done');
      });
    },

    parse: function(data) {
      return data.rows;
    },

    getByTable: function(table, callback) {
      this.fetch({
        data: {
          q: _.str.sprintf(QUERY, {table: table})
        },
        success: callback,
        error: function(response, err) {
          Backbone.Events.trigger('collection:done');
          Backbone.Events.trigger('data:error', 'No data available.');
          throw err.responseText;
        }
      });
    }

  });

  return TargetsCollection;

});
