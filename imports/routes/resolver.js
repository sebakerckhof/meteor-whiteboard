import { ApiV1 } from './api';
import { Images } from '../api/whiteboards/images';

/**
 * Resolve returns the image to be entered in the mail HTML
 */
ApiV1.addRoute('resolve', {
    post: function () {

        let params;
        if(this.bodyParams.params){
            params = JSON.parse(this.bodyParams.params || {});
        }
        if(!params || !params._id){
            return {
                statusCode: 403,
                body: {status: 'fail', message: 'Invalid request'}
            };
        }

        const image = Images.findOne({whiteboard:params._id},{sort:{uploadedAt:-1}});
        if(!image || !image.isUploaded()){
            return {
                statusCode: 404,
                body: {status: 'fail', message: 'Not found'}
            };
        }

        const path = image.url();
        const result = `<img src="${Meteor.absoluteUrl(path.slice(1))}"/>`;

        return {
            statusCode: 200,
            body: {
                body:result
            }
        };
    }
});