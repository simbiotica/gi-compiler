define([
  'jquery',
  'selectize',
  'underscore',
  'backbone',
  'handlebars',
  'collections/Questions',
  'text!templates/toolbar.handlebars'
], function($, selectize, _, Backbone, Handlebars, QuestionsCollection, tpl) {

  'use strict';

  var QuestionToolbarView = Backbone.View.extend({

    el: '#questionToolbarView',

    options: {
      selectize: {
        plugins: ['remove_button']
      }
    },

    template: Handlebars.compile(tpl),

    collection: new QuestionsCollection(),

    initialize: function() {
      this.showData();
    },

    setListeners: function() {},

    render: function() {
      this.$el.html(this.template())
        .find('select').selectize(this.options.selectize);
    },

    empty: function() {
      this.$el.html('');
    },

    showData: function() {
      this.empty();

      $.when(
        this.getQuestions()
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    getQuestions: function() {
      var deferred = new $.Deferred();

      this.collection.getAll(function() {
        deferred.resolve();
      });

      deferred.promise();
    }

  });

  return QuestionToolbarView;

});
