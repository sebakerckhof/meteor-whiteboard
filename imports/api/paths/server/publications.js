/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Whiteboards } from '../../whiteboards/whiteboards';
import { Paths } from '../paths.js';

Meteor.publish("paths", function (whiteboard) {
  check(whiteboard,String);
  return Paths.find({whiteboard},{fields:{_id:1,whiteboard:1,color:1,size:1,d:1}});
});