import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Whiteboards } from './whiteboards';
import { Paths } from '../paths/paths';
import { Images } from './images';

//XXX: SVG2PNG is not compatible with node 0.10, so as long as Meteor 1.4 isn't out we do the conversion on the client side and upload the image
//export const save = new ValidatedMethod({
//  name: 'whiteboards.save',
//  validate: new SimpleSchema({
//    id: { type: String },
//  }).validator(),
//  run: async function({id}) {
//    const svg2png = require("svg2png");
//
//    const whiteboard = Whiteboards.findOne(id,{fields:{locked:1}});
//
//    if (!whiteboard) {
//      throw new Meteor.Error(404, 'Cannot find this whiteboard');
//    }
//
//    if (whiteboard.locked) {
//      throw new Meteor.Error(403, 'Can not save a locked whiteboard');
//    }
//
//    Whiteboards.update(id,{$set:{savedAt:new Date()}});
//
//    this.unblock();
//
//    const svg = renderSVG(id);
//    const sourceBuffer = new Buffer(svg);
//    const outputBuffer = await svg2png(sourceBuffer, { width: 300 });
//    return Images.insert(outputBuffer);
//    return true;
//  },
//});

export const create = new ValidatedMethod({
  name: 'whiteboards.create',
  validate(){},
  run() {
    return Whiteboards.insert({});
  },
});


export const clean = new ValidatedMethod({
  name: 'whiteboards.clean',
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run({ id }) {
    const whiteboard = Whiteboards.findOne(id,{fields:{locked:1}});

    if (!whiteboard) {
      throw new Meteor.Error(404, 'Cannot find this whiteboard');
    }

    if (whiteboard.locked) {
      throw new Meteor.Error(403, 'Can not edit a locked whiteboard');
    }

   Paths.direct.remove({whiteboard:id});
  },
});


const WHITEBOARD_METHODS = [
  clean,
  create,
  //save
].map(method => method.name);

if (Meteor.isServer) {
  DDPRateLimiter.addRule({
    name(name) {
      return WHITEBOARD_METHODS.indexOf(name) > -1;
    },

    connectionId() { return true; },
  }, 5, 1000);
}