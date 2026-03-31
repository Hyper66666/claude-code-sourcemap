/*! @azure/msal-common v15.13.1 2025-10-29 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function isCloudInstanceDiscoveryErrorResponse(response) {
    return (response.hasOwnProperty("error") &&
        response.hasOwnProperty("error_description"));
}

export { isCloudInstanceDiscoveryErrorResponse };
//# sourceMappingURL=CloudInstanceDiscoveryErrorResponse.mjs.map
