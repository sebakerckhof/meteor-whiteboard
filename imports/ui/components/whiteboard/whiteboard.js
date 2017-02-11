import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';

import { Meteor } from 'meteor/meteor';

import template from './whiteboard.html';
import { Paths } from '../../../api/paths/paths';
import { Whiteboards } from '../../../api/whiteboards/whiteboards';
import { Images } from '../../../api/whiteboards/images';

import drawingPane from '../drawingpane/drawingpane';
import renderPane from '../renderpane/renderpane';

import './whiteboard.scss';


function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * A whiteboard consists of 2 panes:
 *  one containing a canvas for drawing new paths
 *  and one that renders the already drawn paths as an SVG
 *
 * Since email clients don't always support SVG images, we convert to PNG and upload this image upon saving
 */
class Whiteboard {
  constructor($scope, $reactive, $mdDialog, $mdToast, $element) {
    'ngInject';
    $reactive(this).attach($scope);

    this.$mdToast = $mdToast;
    this.$element = $element;
    this.$scope = $scope;

    this.eraseMode = false;
    this.loading = true;
    this.saving = false;
    this.changed = false;


    /*
     * Set up subscriptions and query data
     */
    this.autorun(() => {
      this.whiteboard = Whiteboards.findOne(this.getReactively('whiteboardId'));
    });

    this.autorun(() => {
      this.image  = Images.findOne({whiteboard:this.getReactively('whiteboardId')});
    });

    this.helpers({
      paths: () => Paths.find({whiteboard: this.getReactively('whiteboardId')}, {sort: {createdAt: 1}})
    });

    this.subscribe('whiteboard', () => [this.getReactively('whiteboardId')], {
      onStart: () => {
        this.loading = true;
      },
      onReady: () => {
        this.loading = false;
      },
      onError: () => {
        this.loading = false;
        $mdDialog.show(
            $mdDialog.alert()
                .clickOutsideToClose(false)
                .title('Error')
                .textContent('Could not load whiteboard.')
                .ariaLabel('error')
                .ok('Ok')
        );
      }
    });
  }

  /*
   * In erase mode, we hide the drawing pane
   */
  toggleMode() {
    this.eraseMode = !this.eraseMode;
  }

  savePath(d, color, size, bb) {
    const record = {
      whiteboard: this.whiteboard._id,
      d,
      color,
      size,
      bb
    };
    Paths.insert(record);
    this.changed = true;
  }

  removePath(id) {
    Paths.remove(id);
    this.changed = true;
  }

  /**
   * Quick hack since we can't convert on the server in node 0.10 and email clients don't render svg images :(
   * @private
   */
  _createPng() {
    return new Promise((res, rej) => {
      const svg = this.$element[0].querySelector("render-pane > svg");
      const bb = svg.getBBox();

      const AR = bb.width / (bb.height || 1);
      svg.setAttribute('viewBox',`${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
      svg.setAttribute('preserveAspectRatio','xMinYMin meet');

      const svgData = new XMLSerializer().serializeToString(svg);

      svg.removeAttribute('viewBox');
      svg.removeAttribute('preserveAspectRatio');

      const canvas = document.createElement("canvas");

      const maxEdge = 400;//XXX: randomly chosen...
      canvas.width = Math.min(maxEdge,maxEdge * AR);
      canvas.height = Math.min(maxEdge,maxEdge / AR);

      const ctx = canvas.getContext("2d");

      const img = document.createElement("img");
      img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        res(canvas.toDataURL("image/png"));
      };

      img.onerror = function(err) {
        rej(err)
      }
    });
  }

  save() {
    if(this.saving) return;

    if(!this.changed){
      Mixmax.done({_id: this.whiteboard._id});
      return;
    }

    this.saving = true;
    this
        ._createPng()
        .then(png => new Promise((res, rej)=> {
              const fsFile = new FS.File(png);
              fsFile.whiteboard = this.whiteboard._id;
              Images.insert(fsFile, (err, id) => {
                if (err) rej(err)
                else res(id);
              });
            }))
        .then(file => new Promise((res,rej) => {
              file.on('uploaded',()=>{res(file)});
              file.on('error',rej);
            }))
        .then((file) => new Promise(res => {
              const check = () => {
                if(file.hasStored('images')){
                  res();
                }else{
                  setTimeout(check,500);
                }
              };
              check();
            }))
        .then(() => {
              this.$scope.$apply(()=>{
                this.saving = false;
                this.changed = false;
              });
              Mixmax.done({_id: this.whiteboard._id});
            })
        .catch(err => {
          this.saving = false;
          this.$mdToast.show(
              this.$mdToast.simple()
                  .textContent(`Error while saving the whiteboard: ${err}`)
                  .position('top right')
                  .hideDelay(3000)
          );
        });


    //We can't convert on the server ATM
    //this.call('whiteboards.save',{id:this.whiteboard._id},err => {
    //    this.saving = false;
    //    if(err){
    //        this.$mdToast.show(
    //            this.$mdToast.simple()
    //                .textContent('Error while saving the whiteboard to an image')
    //                .position('top right')
    //                .hideDelay(3000)
    //        );
    //    }else{
    //        Mixmax.done({_id:this.whiteboard._id});
    //    }
    //});
  }
}

const name = 'whiteboard';

// create a module
export default angular.module(name, [
      angularMeteor,
      ngMaterial,
      drawingPane.name,
      renderPane.name
    ])
    .component(name, {
      bindings: {
        whiteboardId: '<',
      },
      template,
      controller: Whiteboard
    });