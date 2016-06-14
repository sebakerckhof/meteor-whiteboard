import { ApiV1 } from './api';
import { Whiteboards } from '../api/whiteboards/whiteboards';

/**
 * Activate is called when the mail is send.
 * This locks the whiteboard, so no further changes can be made to it.
 */
ApiV1.addRoute('activate', {
    post: function () {
        debugger;
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

        const updated = Whiteboards.update({_id:params._id},{$set:{locked:true}});
        return {
            statusCode: 200
        };
    }
});