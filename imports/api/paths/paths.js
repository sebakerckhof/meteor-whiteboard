import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Whiteboards } from '../whiteboards/whiteboards';
import { Match } from 'meteor/check'

export const Paths = new Mongo.Collection('paths');

if(Meteor.isServer){
  Paths._ensureIndex({whiteboard:1});
}

Paths.before.insert(function(userId,doc){
  doc.createdAt = new Date();
  if(Meteor.isServer){
    const id = doc._id;
    Paths.schema.clean(doc);
    doc._id = id;
  }
});

Paths.allow({
  insert: function (userId, doc) {
    return (Match.test(doc,Paths.schema)
      && !!Whiteboards.find({_id:doc.whiteboard,locked:false},{limit:1}).count());
  },
  update: function (userId, doc, fields, modifier) {
    return false;
  },
  remove: function (userId, doc) {
    return !!Whiteboards.find({_id:doc.whiteboard,locked:false},{limit:1}).count();
  }
});

Paths.schema = new SimpleSchema({
  whiteboard: { type: String },
  d:{type:String},
  color:{type:String,defaultValue:'black'},
  size:{type:Number,defaultValue:1},
  createdAt:{
    type:Date
  },
  bb:{
    type:Object
  },
  "bb.x":{
    type:Number,
    decimal:true,
    autoValue:function(){
      return Math.round(this.value * 10) / 10;
    }
  },
  "bb.y":{
    type:Number,
    decimal:true,
    autoValue:function(){
      return Math.round(this.value * 10) / 10;
    }
  },
  "bb.width":{
    type:Number,
    decimal:true,
    autoValue:function(){
      return Math.round(this.value * 10) / 10;
    }
  },
  "bb.height":{
    type:Number,
    decimal:true,
    autoValue:function(){
      return Math.round(this.value * 10) / 10;
    }
  }
});

