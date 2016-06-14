import angular from 'angular';

import template from './renderpane.html';

import './renderpane.scss';

/**
 * The render pane component renders a path collection to SVG
 */
class RenderPane {
    constructor() {
        'ngInject';
    }
}

const name = 'renderPane';

// create a module
export default angular.module(name, [])
    .component(name, {
        bindings: {
            highlight:'<',
            paths:'<',
            onSelect:'&'
        },
        template,
        controller:RenderPane
    });