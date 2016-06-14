import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Images } from './images';

export const Whiteboards = new Mongo.Collection('whiteboards');

/**
 * A whiteboard gets locked when the activation url is called, that way a whiteboard can not be modified after it's send
 */
Whiteboards.schema = new SimpleSchema({
    locked: {
        type:Boolean,
        defaultValue:false
    }
});

Whiteboards.before.insert(function (userId, doc) {
    doc.locked = false;
});

Whiteboards.after.remove(function(userId,doc){
    Images.remove({whiteboard:doc._id});
});

/**
 * All whiteboard operations happen through methods, so deny all collection methods
 */
Whiteboards.deny({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, docs, fields, modifier) {
       return true;
    },
    remove: function (userId, docs) {
        return true;
    },
});
