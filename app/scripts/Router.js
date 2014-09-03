define([
  'underscore',
  'backbone'
], function(_, Backbone) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '': 'welcome',
      'error': 'error',
      'questions(/:table)': 'questions',
      'map(/:table)(/:project)(/:question)': 'map',
      'rank(/:table)(/:project)(/:question)': 'rank',
      '*any': 'notFound'
    },

    pages: {
      welcome: $('#welcomePage'),
      error: $('#errorPage'),
      question: $('#questionPage'),
      map: $('#mapPage'),
      rank: $('#rankPage')
    },

    welcome: function() {
      this.activePage('welcome');
    },

    error: function() {
      this.activePage('error');
    },

    notFound: function() {
      this.navigate('error', true);
    },

    questions: function(table) {
      if (!this.validateTable(table)) {
        return this.navigate('error', true);
      }

      this.activePage('question');
    },

    map: function(table, project, question) {
      if (!this.validateTable(table) || !project || !question) {
        return this.navigate('error', true);
      }

      this.activePage('map');
    },

    rank: function(table, project, question) {
      if (!this.validateTable(table) || !project || !question) {
        return this.navigate('error', true);
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

      this.pages[currentPage].addClass('is-active');
    }

  });

  return Router;

});
