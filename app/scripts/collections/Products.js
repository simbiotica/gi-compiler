'use strict';

define([
  'backbone',
  'underscore',
  'underscoreString',
  'text!queries/client.pgsql'
], function(Backbone, _, underscoreString, query){

  var ProductsCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      return data.rows;
    },

    getByClient: function(id, callback) {

      Backbone.Events.trigger('collection:fetch');

      this.fetch({
        data: {
          q: _.str.sprintf(query, {id: id})
        },
        success: callback,
        error: function(err) {
          throw err;
        }
      });
    }

  });

  return ProductsCollection;

});
