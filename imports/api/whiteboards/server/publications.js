/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';


import { Whiteboards } from '../whiteboards';
import { Images } from '../images';
import { Paths } from '../../paths/paths';

Meteor.publish("whiteboard", function (id) {
  check(id,String);

  const whiteboard = Whiteboards.findOne(id);

  if(!whiteboard || whiteboard.locked){
    throw new Meteor.Error(403,"Invalid whiteboard");
  }

  return [
      Whiteboards.find(id,{fields:{_id:1}}),
      Images.find({whiteboard:id},{sort:{uploadedAt:-1},limit:1}),
      Paths.find({whiteboard:id},{fields:{_id:1,whiteboard:1,color:1,size:1,d:1}})
  ];
});
