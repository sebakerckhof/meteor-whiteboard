import { ApiV1 } from './api';
import { Whiteboards } from '../api/whiteboards/whiteboards';

/**
 * Activate is called when the mail is send.
 * This locks the whiteboard, so no further changes can be made to it.
 */
ApiV1.addRoute('activate', {
    post: function () {
        const _id = this.bodyParams.id;
        const updated = Whiteboards.update({_id},{$set:{locked:true}});
        return {
            statusCode: 200
        };
    }
});