'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      scenarios: [
        {
          name: 'ember-3.0',
          npm: {
            devDependencies: {
              'ember-source': '~3.0.0'
            }
          }
        },
        {
          name: 'ember-3.1',
          npm: {
            devDependencies: {
              'ember-source': '~3.1.0'
            }
          }
        },
        {
          name: 'ember-3.2',
          npm: {
            devDependencies: {
              'ember-source': '~3.2.0'
            }
          }
        },
        {
          name: 'ember-3.3',
          npm: {
            devDependencies: {
              'ember-source': '~3.3.0'
            }
          }
        },
        {
          name: 'ember-3.4',
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        },
        {
          name: 'ember-default-with-jquery',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1'
            }
          }
        }
      ]
    };
  });
};
