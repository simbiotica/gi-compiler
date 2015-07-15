define([
  'backbone',
  'underscore',
  'underscoreString',
  'text!queries/notes.pgsql'
], function(Backbone, _, underscoreString, QUERY) {

  'use strict';

  var NotesCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      return _.map(data.rows, function(note) {
        return {
          aspectid: note.aspectid,
          targetid: note.targetid,
          notetitle1: note.notetitle1,
          notedata1: note.notedata1.replace(/(<[\/]?[^>]+>)/ig, ' '),
          notetitle2: note.notetitle2,
          notedata2: note.notedata2.replace(/([\/]?[^>]+>)/ig, ' '),
        }
      });
    },

    getNotes: function(question, target, callback) {
      var all= '';

      if(!question && !target) {
        all = '1 = 1';
      }

      var opts = {
        data: {
          q: _.str.sprintf(QUERY, {
            question: question,
            target: target,
            all: all
          })
        },
        success: callback,
        error: function(response, err) {
          throw err.responseText;
        }
      };

      this.fetch(opts);
    }

  });

  return NotesCollection;

});
