'use strict';

require.config({

  paths: {
    jquery: '../../bower_components/jquery/dist/jquery',
    selectize: '../../bower_components/selectize/dist/js/standalone/selectize',
    underscore: '../../bower_components/underscore/underscore',
    backbone: '../../bower_components/backbone/backbone',
    handlebars: '../../bower_components/handlebars/handlebars',
    text: '../../bower_components/requirejs-text/text',
    underscoreString: '../../bower_components/underscore.string/lib/underscore.string',
    spin: '../../bower_components/spinjs/spin'
  },

  shim: {
    jquery: {
      exports: '$'
    },
    selectize: {
      deps: ['jquery'],
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    underscoreString: {
      deps: ['underscore'],
      exports: '_'
    },
    spin: {
      exports: 'Spinner'
    }
  }

});


require([
  'underscore',
  'backbone',
  'Router',
  'views/Spin',
  'views/Map',
  'views/Toolbar',
  'views/Result',
  'views/Rank'
], function(_, Backbone, Router, SpinView, MapView, ToolbarView, ResultView, RankView) {

  window.Notifications = _.extend(Backbone.Events);

  new SpinView();
  new MapView();
  new ToolbarView();
  new ResultView();
  new RankView();

  new Router();

  Backbone.history.start();

});
