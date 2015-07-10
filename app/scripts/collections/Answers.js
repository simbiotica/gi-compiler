define([
  'underscore',
  'underscoreString',
  'backbone',
  'text!queries/answers.pgsql',
  'text!queries/answers_notes.pgsql'
], function(_, underscoreString, Backbone, QUERY, QUERY_NOTES) {

  'use strict';

  var AnswersCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

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
        var questions = _.groupBy(_.map(group, function(r) {
          return {
            id: r.aspectid,
            text: r.aspecttext,
            value: r.answervalue,
            score: r.answerscore === 'null' ? null : r.answerscore,
            table: r.datatype.toLowerCase() === 'table' ? true : null,
            target: r.targetname,
            targetId: r.targetid,
            comments: r.answercomments,
            sources: r.answersourcedescription,
            criterias: _.compact(_.map(r.criterias, function(c) {
              if (c) {
                var criteria = c.split('|');
                if (criteria[0] !== '' && criteria[1] !== '') {
                  return {
                    key: criteria[0],
                    value: criteria[1]
                  };
                }
              }
            }))
          };
        }), 'id');

        return {
          id: group[0].father,
          text: group[0].fatherdescription,
          questions: _.map(questions, function(q) {
            return {
              id: q[0].id,
              text: q[0].text,
              criterias: q[0].criterias,
              answers: q
            };
          })
        };
      });
      return result;
    },

    getByTargetAndQuestion: function(params, callback) {
      var query;
      var targets = (typeof params.targets === 'object') ? _.map(params.targets, function(t) {
        return _.str.sprintf('\'%s\'', t);
      }).toString() : _.str.sprintf('\'%s\'', params.targets);

      var questions = (typeof params.questions === 'object') ? _.map(params.questions, function(q) {
        return _.str.sprintf('\'%s\'', q);
      }).toString() : _.str.sprintf('\'%s\'', params.questions);

      if (params.table === '107') {
        query = _.str.sprintf(QUERY_NOTES, {
          table: params.table,
          targets: (params.targets && params.targets !== 'all') ?  _.str.sprintf('AND dnorm.targetid IN (%s)', targets) : '',
          questions: (params.questions && params.questions !== 'all') ? _.str.sprintf('AND criterias.aspectid IN (%s)', questions) : '',
          notes_targets: _.str.sprintf('AND n.targetid IN (%s)', targets),
          notes_questions: _.str.sprintf('AND n.aspectid IN (%s)', questions),
        });
      } else {
        query = _.str.sprintf(QUERY, {
          table: params.table,
          targets: (params.targets && params.targets !== 'all') ?  _.str.sprintf('AND dnorm.targetid IN (%s)', targets) : '',
          questions: (params.questions && params.questions !== 'all') ? _.str.sprintf('AND criterias.aspectid IN (%s)', questions) : ''
        });
      }



      this.fetch({
        data: {
          q: query
        },
        success: callback,
        error: function(response, err) {
          Backbone.Events.trigger('collection:done');
          Backbone.Events.trigger('data:error', 'No data available.');
          throw err.responseText;
        }
      });
    }

  });

  return AnswersCollection;

});
