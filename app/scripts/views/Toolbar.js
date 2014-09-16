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
      'change #toggleCriteria': 'setCriteria',
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
          table: this.table,
          targets: this.targetsCollection.toJSON(),
          questions: this.questionsCollection.toJSON()
        }))
        .find('select').selectize(this.options.selectize);

      this.setCriteria();
    },

    empty: function() {
      this.$el.html('');
    },

    onSubmit: function() {
      var params = this.$el.find('form').serializeArray();
      var result = {};

      _.each(params, function(p) {
        if (!result[p.name]) {
          result[p.name] = _.pluck(_.where(params, {name: p.name}), 'value');
        }
      });

      _.each(result, function(value, key) {
        if (typeof value === 'object' && value.length === 1) {
          result[key] = value[0];
        }
      });

      Backbone.Events.trigger('Toolbar:submit', result);

      return false;
    },

    showData: function(params) {
      this.empty();
      this.table = params[0];

      $.when(
        this.getTargets(params[0]),
        this.getQuestions(params[0])
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
    },

    setCriteria: function(e) {
      var $criteria = $('#toggleCriteria');
      if (e) {
        localStorage.setItem('GICompilerCriteria', $criteria.prop('checked'));
      }
      $criteria.prop('checked', !!(localStorage.getItem('GICompilerCriteria') === 'true'));
    }

  });

  return ToolbarView;

});
