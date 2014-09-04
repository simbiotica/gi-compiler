define([
  'jquery',
  'selectize',
  'underscore',
  'backbone',
  'handlebars',
  'collections/Targets',
  'collections/Questions',
  'text!templates/toolbar.handlebars'
], function($, selectize, _, Backbone, Handlebars, TargetsCollection, QuestionsCollection, tpl) {

  'use strict';

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    options: {
      selectize: {
        plugins: ['remove_button']
      }
    },

    events: {
      'submit form': 'onSubmit'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.targetsCollection = new TargetsCollection();
      this.questionsCollection = new QuestionsCollection();

      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.showData, this);
    },

    render: function() {
      this.$el.html(this.template({
          targets: this.targetsCollection.toJSON(),
          questions: this.questionsCollection.toJSON()
        }))
        .find('select').selectize(this.options.selectize);
    },

    empty: function() {
      this.$el.html('');
    },

    onSubmit: function() {
      var params = this.$el.find('form').serializeArray();
      var result = _.object(_.pluck(params, 'name'), _.pluck(params, 'value'));
      Backbone.Events.trigger('Toolbar:submit', result);
      return false;
    },

    showData: function(routes) {
      this.empty();

      $.when(
        this.getTargets(routes.table),
        this.getQuestions(routes.table)
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    getTargets: function(table) {
      var deferred = new $.Deferred();

      this.targetsCollection.getByTable(table, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

    getQuestions: function(table) {
      var deferred = new $.Deferred();

      this.questionsCollection.getByTable(table, function() {
        deferred.resolve();
      });

      return deferred.promise();
    }

  });

  return ToolbarView;

});
