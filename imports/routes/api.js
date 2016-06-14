import { Restivus } from 'meteor/nimble:restivus';

/**
 * Initialize the REST API
 */
export const ApiV1 = new Restivus({
    version: 'v1',
    useDefaultAuth: true,
    prettyJson: true,
    enableCors: true
});
