import angular from 'angular';

import template from './drawingpane.html';
//
import '../../paper-full';

import './drawingpane.scss';

/**
 * The drawingpane component has a canvas and adjustable options to draw on the canvas
 */
class DrawingPane {
    constructor() {
        'ngInject';

        this.colors = ['#F44336','#2196F3','#8BC34A'];
        this.sizes = [1,3,5,8,10];

        this.selectedColor = this.colors[0];
        this.selectedSize = this.sizes[1];
    }
}

const name = 'drawingPane';

// create a module
export default angular
  .module(name, [])
  .directive(name, function () {
      return {
          restrict: 'E',
          scope:{},
          template,
          bindToController:{
              onNewPath:'&'
          },
          controller:DrawingPane,
          controllerAs:'$ctrl',
          link: function postLink(scope, element, attrs, ctrl) {
              var path;
              var drag = false;
              var canvas = element[0].querySelector('canvas');

              function mouseUp(event) {
                  //Clear Mouse Drag Flag
                  drag = false;
                  path.simplify(10);

                  const bb = _.pick(path.bounds,['x','y','width','height']);

                  if(bb.width !== 0 || bb.height !== 0){
                      const p = path.exportSVG();

                      ctrl.onNewPath({
                          d:p.getAttribute('d'),
                          color:p.getAttribute('stroke'),
                          size:parseInt(p.getAttribute('stroke-width')),
                          bb
                      });
                  }

                  path.remove();
              }

              function mouseDrag(event) {
                  if (drag) {
                      path.add(new paper.Point(event.layerX, event.layerY));
                      path.smooth();
                  }
              }

              function mouseDown(event) {
                  //Set  flag to detect mouse drag
                  drag = true;
                  path = new paper.Path();
                  path.strokeColor = ctrl.selectedColor;
                  path.strokeWidth = ctrl.selectedSize;
                  path.add(new paper.Point(event.layerX, event.layerY));
              }

              function initPaper() {
                  paper.install(window);
                  paper.setup(canvas);
              }

              canvas.addEventListener('mousedown', mouseDown);
              canvas.addEventListener('mouseup', mouseUp);
              canvas.addEventListener('mousemove', mouseDrag);

              initPaper();

          }
      }
  });