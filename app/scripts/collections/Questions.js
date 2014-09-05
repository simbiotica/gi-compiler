define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!queries/questions.pgsql'
], function(_, underscoreString, Backbone, QUERY) {

  'use strict';

  var QuestionsCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v1/sql',

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
          q: _.str.sprintf(QUERY, {table: table })
        },
        success: callback,
        error: function(response, err) {
          throw err.responseText;
        }
      });
    }

  });

  return QuestionsCollection;

});
