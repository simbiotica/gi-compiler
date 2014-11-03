'use strict';

define([
  'backbone',
  'underscore',
  'underscoreString',
  'text!queries/client.pgsql',
  'text!queries/product_mappable.pgsql'
], function(Backbone, _, underscoreString, query, query_mappable){

  var ProductsCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      return data.rows;
    },

    _isMappable: function(id, cb) {

      this.fetch({
        data: {
          q: _.str.sprintf(query_mappable, {id: id})
        },
        success: cb,
        error: function(err) {
          throw err;
        }
      });
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
