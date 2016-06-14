import { ApiV1 } from './api';
import { Images } from '../api/whiteboards/images';

/**
 * Resolve returns the image to be entered in the mail HTML
 */
ApiV1.addRoute('resolve', {
    post: function () {
        debugger;
        const whiteboard = this.bodyParams.id;
        if(!whiteboard){
            return {
                statusCode: 403,
                body: {status: 'fail', message: 'Invalid request'}
            };
        }

        const image = Images.findOne({whiteboard},{sort:{uploadedAt:-1}});
        if(!image || !image.isUploaded()){
            return {
                statusCode: 404,
                body: {status: 'fail', message: 'Not found'}
            };
        }

        const result = `<img src="${Meteor.absoluteUrl(image.url({store:'images'}).slice(1))}"/>`;

        return {
            statusCode: 200,
            body: result
        };
    }
});