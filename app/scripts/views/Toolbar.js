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
        plugins: ['remove_button'],
        onChange: function(values) {
          _.each(values, _.bind(function(val) {
            if (val === 'all') {
              this.close();
              _.each(values, _.bind(function(v){
                if (v !== 'all') {
                  this.removeItem(v);
                }
              }, this));
            }
          }, this));
        }
      },
      questions: {
        plugins: ['remove_button'],
        render: {
          item: function(item, escape) {
            return (item.text ? '<div><span class=\'id\'>' + escape(item.text.slice(0, 3)) + '</span></div>' : '');
          }
        },
        onChange: function(values) {
          _.each(values, _.bind(function(val) {
            if (val === 'all') {
              this.close();
              _.each(values, _.bind(function(v){
                if (v !== 'all') {
                  this.removeItem(v);
                }
              }, this));
            }
          }, this));
        }
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
      Backbone.Events.on('Router:questions', this.setLocation, this);
      Backbone.Events.on('Router:map', this.setLocation, this);
      Backbone.Events.on('toggleToolbar', this.toggle, this);
    },

    setupSelects: function() {
      var $target = $('select[name=\'targets\']').selectize(this.options.selectize),
        $checkbox = $('input[type=\'checkbox\'');

      if (this.location === 'map') {

        _.extend(this.options.questions, {maxItems: 1, allowEmptyOption: false});

        var $question = $('select[name=\'questions\']').selectize(this.options.questions);

        $target[0].selectize.disable();

        $question[0].selectize.removeOption('all');
        $question.attr('required', 'required');

        $checkbox.parent().css('display', 'none');

      } else {

        $target[0].selectize.enable();
        $checkbox.removeAttr('disabled');

        if (this.options.questions.maxItems) {
          delete this.options.questions.maxItems;
        }

        $('select[name=\'questions\']').selectize(this.options.questions);
      }
    },

    render: function() {
      this.$el.html(this.template({
          table: this.table,
          targets: this.targetsCollection.toJSON(),
          questions: this.questionsCollection.toJSON()
        }));

      this.setupSelects();

      this.setCriteria();
    },

    toggle: function() {
      this.$el.toggleClass('is-hidden');
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

      if (this.location === 'map') {
        window.router.navigate('#map/' + result.table + '/' + result.questions, {trigger : true});
      } else {
        Backbone.Events.trigger('Toolbar:submit', result);
      }

      return false;
    },

    setLocation: function(params) {
      var hasthtag = window.location.hash;
      var url = hasthtag.split('/');

      this.location = url[0].slice(1, url[0].length);

      this.$el.addClass('is-hidden');
      $('#mapView').removeClass('is-hidden');

      this.showData(params);

      if (url.length !== 3) {
        this.$el.removeClass('is-hidden');
        $('#mapView').addClass('is-hidden');
      }
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
      $criteria.prop('checked', localStorage.getItem('GICompilerCriteria') === 'true');
      Backbone.Events.trigger('criteria:change');
    }

  });

  return ToolbarView;

});
