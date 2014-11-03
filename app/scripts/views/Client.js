'use strict';

define([
  'backbone',
  'underscore',
  'handlebars',
  'collections/Products',
  'text!templates/client.handlebars'
], function(Backbone, _, Handlebars, ProductsCollection, tpl) {

  var ClientView = Backbone.View.extend({

    el: '#clientPage',
    
    template: Handlebars.compile(tpl),

    collection: new ProductsCollection(),

    initialize: function() {
      this._setListeners();
    },

    _setListeners: function() {
      Backbone.Events.on('Router:client', this._getProducts, this);
    },

    _getProducts: function(id) {
      this.collection.getByClient(id[0], _.bind(function() {
        Backbone.Events.trigger('collection:done');
        this._render();
      }, this));

      localStorage.setItem('client', id[0]);
    },

    _render: function() {
      $('.layout-header').addClass('is-hidden');

      this.$el.html(this.template({
        client: this.collection.at(0) ? this.collection.at(0).toJSON().client : null,
        products: this.collection.toJSON()
      }));
    }

  });

  return ClientView;

});
