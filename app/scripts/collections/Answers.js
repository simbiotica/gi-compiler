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
      return _.map(_.groupBy(data.rows, 'father'), function(group) {
        return {
          id: group[0].father,
          text: group[0].fatherdescription,
          answer: _.map(group, function(r) {
            return {
              id: r.aspectid,
              text: r.aspecttext,
              value: r.answervalue,
              score: r.answerscore,
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
    },

    getByTargetAndQuestion: function(target, question, callback) {
      this.fetch({
        data: {
          q: _.str.sprintf(QUERY, {target: target, question: question})
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
