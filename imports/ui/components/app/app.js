import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import ngSanitize from 'angular-sanitize';

import { Meteor } from 'meteor/meteor';

import template from './app.html';
import Whiteboard from '../whiteboard/whiteboard';
import { Whiteboards } from '../../../api/whiteboards/whiteboards';

/**
 * Main app entrypoint
 * This will create a new, blank whiteboard if no whiteboard is given in the url
 */
class App{
    constructor($location,$mdToast,$reactive,$scope) {
        'ngInject';
        $reactive(this).attach($scope);

        this.id = $location.search().id;

        if(!this.id){
            this.call('whiteboards.create',(err,id) => {
                if(err){
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Error while creating new whiteboard')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }else{
                    this.id = id;
                }

            });
        }
    }
}

const name = 'whiteboardApp';

// create a module
export default angular.module(name, [
    angularMeteor,
    ngMaterial,
    ngSanitize,
    Whiteboard.name
]).component(name, {
        template,
        controller: App
    })
    .config(configureIcons)
    .config(configureLocation);

/**
 * Configure the material item packs
 * @param $mdIconProvider
 */
function configureIcons($mdIconProvider) {
    'ngInject';

    const iconPath =  '/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/';

    $mdIconProvider
        .iconSet('editor',
            iconPath + 'svg-sprite-editor.svg')
        .iconSet('action',
            iconPath + 'svg-sprite-action.svg')
        .iconSet('content',
            iconPath + 'svg-sprite-content.svg')
        .iconSet('image',
            iconPath + 'svg-sprite-image.svg');
}


/**
 * Enable HTML5 location history
 * @param $locationProvider
 */
function configureLocation($locationProvider) {
    'ngInject';
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}

