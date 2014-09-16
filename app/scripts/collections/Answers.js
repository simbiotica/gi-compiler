define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!queries/answers.pgsql'
], function(_, underscoreString, Backbone, QUERY) {

  'use strict';

  var AnswersCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v1/sql',

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      this.on('request', function() {
        Backbone.Events.trigger('collection:fetch');
      });
      this.on('sync', function() {
        Backbone.Events.trigger('collection:done');
      });
    },

    parse: function(data) {
      var result = _.map(_.groupBy(data.rows, 'father'), function(group) {
        return {
          id: group[0].father,
          text: group[0].fatherdescription,
          answers: _.map(group, function(r) {
            return {
              id: r.aspectid,
              text: r.aspecttext,
              value: r.answervalue,
              score: r.answerscore,
              target: r.targetname,
              targetId: r.targetid,
              criterias: _.compact(_.map(r.criterias, function(c) {
                var criteria = c.split('|');
                if (criteria[0] !== '' && criteria[1] !== '') {
                  return {
                    key: criteria[0],
                    value: criteria[1]
                  };
                }
              }))
            };
          })
        };
      });
      return result;
    },

    getByTargetAndQuestion: function(params, callback) {
      var targets = (typeof params.targets === 'object') ? _.map(params.targets, function(t) {
        return _.str.sprintf('\'%s\'', t);
      }).toString() : _.str.sprintf('\'%s\'', params.targets);
      var questions = (typeof params.questions === 'object') ? _.map(params.questions, function(q) {
        return _.str.sprintf('\'%s\'', q);
      }).toString() : _.str.sprintf('\'%s\'', params.questions);
      var query = _.str.sprintf(QUERY, {
        table: params.table,
        targets: (params.targets) ?  'AND targetid IN (' + targets + ')' : '',
        questions: (params.questions) ? 'AND criterias.aspectid IN (' + questions + ')' : ''
      });

      this.fetch({
        data: {
          q: query
        },
        success: callback,
        error: function(response, err) {
          throw err.responseText;
        }
      });
    }

  });

  return AnswersCollection;

});
