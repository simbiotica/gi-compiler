define([
  'underscore',
  'backbone'
], function(_, Backbone) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '': 'welcome',
      'error': 'error',
      'client/:id': 'client',
      'questions(/:table)': 'questions',
      'map(/:table)(/:answer)': 'map',
      'rank(/:table)(/:answer)': 'rank',
      '*any': 'notFound'
    },

    pages: {
      welcome: $('#welcomePage'),
      error: $('#errorPage'),
      client: $('#clientPage'),
      questions: $('#questionPage'),
      map: $('#mapPage'),
      rank: $('#rankPage'),
      notFound: $('#notFoundPage')
    },

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      this.on('route', function(routeName, params) {
        if (routeName === 'questions' && this.validateTable(params[0])) {
          Backbone.Events.trigger('Router:' + routeName, params);
        } else if (this.validateTable(params[0]) || params[1]) {
          Backbone.Events.trigger('Router:' + routeName, params);
        }
      });

      Backbone.Events.on('data:error', function() {
        this.activePage('error');
      }, this);
    },

    welcome: function() {
      this.activePage('welcome');
    },

    error: function() {
      this.activePage('error');
    },

    notFound: function() {
      this.activePage('notFound');
    },

    client: function(id) {
      if (!this.validateTable(id)) {
        return this.activePage('error');
      }

      this.activePage('client');
    },

    questions: function(table) {
      if (!this.validateTable(table)) {
        return this.activePage('error');
      }

      this.activePage('questions');
    },

    map: function(table) {
      if (!this.validateTable(table)) {
        return this.activePage('error');
      }

      this.activePage('map');
    },

    rank: function(table, answer) {
      if (!this.validateTable(table) || !answer) {
        return this.activePage('error');
      }

      this.activePage('rank');
    },

    validateTable: function(table) {
      return !!(table && _.isFinite(Number(table)));
    },

    activePage: function(currentPage) {
      _.each(this.pages, function(page) {
        page.removeClass('is-active');
      });

      Backbone.Events.trigger('setCurrent', currentPage);
      this.pages[currentPage].addClass('is-active');
    }

  });

  return Router;

});
