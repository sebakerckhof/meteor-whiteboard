import '/imports/startup/client';

import angular from 'angular';

import { Meteor } from 'meteor/meteor';

import WhiteboardApp from '../imports/ui/components/app/app';

function onReady() {
    angular.bootstrap(document.body, [
        WhiteboardApp.name
    ], {
        strictDi: true
    });
}

if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
} else {
    angular.element(document).ready(onReady);
}