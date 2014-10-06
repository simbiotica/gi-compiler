'use strict';

define([
  'jquery',
  'underscore',
  'underscoreString',
  'backbone',
  'handlebars',
  'text!templates/header.handlebars'
], function($, _, underscoreString, Backbone, Handlebars, tpl) {

  var HeaderView = Backbone.View.extend({

    el: '#headerView',

    events: {
      'click #printBtn': 'print'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.setTitle, this);
      Backbone.Events.on('Router:map', this.setTitle, this);
      Backbone.Events.on('Router:rank', this.setTitle, this);
    },

    render: function() {
      this.$el.html(this.template({
        title: this.currentTitle,
        table: this.currentParams[0],
        question: this.currentParams[1]
      }));
    },

    setTitle: function(params) {
      this.currentParams = params;

      $.get(this.getUrl(), _.bind(function(data) {
        this.currentTitle = data.rows[0].title;
        this.render();
      }, this));
    },

    getUrl: function() {
      return '//globalintegrity.cartodb.com/api/v2/sql?q=' + this.getQuery();
    },

    getQuery: function() {
      return _.str.sprintf('SELECT projectname AS title FROM export_generic_prod_%(table)s_dp LIMIT 1', {
        table: this.currentParams[0]
      });
    },

    print: function() {
      window.print();
    }

  });

  return HeaderView;

});
