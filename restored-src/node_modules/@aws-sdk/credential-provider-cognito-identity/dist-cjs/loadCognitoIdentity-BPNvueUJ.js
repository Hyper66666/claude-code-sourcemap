'use strict';

var clientCognitoIdentity = require('@aws-sdk/client-cognito-identity');



Object.defineProperty(exports, "CognitoIdentityClient", {
	enumerable: true,
	get: function () { return clientCognitoIdentity.CognitoIdentityClient; }
});
Object.defineProperty(exports, "GetCredentialsForIdentityCommand", {
	enumerable: true,
	get: function () { return clientCognitoIdentity.GetCredentialsForIdentityCommand; }
});
Object.defineProperty(exports, "GetIdCommand", {
	enumerable: true,
	get: function () { return clientCognitoIdentity.GetIdCommand; }
});
