import { FS } from 'meteor/cfs:base-package';
import { Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Whiteboards } from './whiteboards';

export const Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})],
  filter: {
    allow: {
      contentTypes: ['image/*'],
      extensions: ['png']
    }
  }
});

if(Meteor.isServer){
  Images.files.after.insert(function(userId,doc){
    Images.remove({
      _id:{ne:doc._id},
      whiteboard:doc.whiteboard
    });
  });
}


Images.allow({
  insert:function(userId,doc){
    if(Meteor.isServer){
      const whiteboard = Whiteboards.findOne({_id:doc.whiteboard},{fields:{locked:1}});
      if(!whiteboard || whiteboard.locked){
        return false;
      }
      return true;
    }else{
      return true;
    }
  },
  update:function(userId, doc, fields, modifier){
    if(Meteor.isServer){
      const whiteboard = Whiteboards.findOne({_id:doc.whiteboard},{fields:{locked:1}});
      if(!whiteboard || whiteboard.locked){
        return false;
      }
    }
    return fields.indexOf('whiteboard') === -1;
  },
  remove:function(){return false},
  download: function(userId, fileObj) {
    return true
  }
});