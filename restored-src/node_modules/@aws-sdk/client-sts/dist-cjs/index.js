'use strict';

var STSClient = require('./STSClient');
var smithyClient = require('@smithy/smithy-client');
var middlewareEndpoint = require('@smithy/middleware-endpoint');
var EndpointParameters = require('./endpoint/EndpointParameters');
var schema = require('@smithy/core/schema');
var client = require('@aws-sdk/core/client');
var regionConfigResolver = require('@aws-sdk/region-config-resolver');

let STSServiceException$1 = class STSServiceException extends smithyClient.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, STSServiceException.prototype);
    }
};

let ExpiredTokenException$1 = class ExpiredTokenException extends STSServiceException$1 {
    name = "ExpiredTokenException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ExpiredTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExpiredTokenException.prototype);
    }
};
let MalformedPolicyDocumentException$1 = class MalformedPolicyDocumentException extends STSServiceException$1 {
    name = "MalformedPolicyDocumentException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "MalformedPolicyDocumentException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
    }
};
let PackedPolicyTooLargeException$1 = class PackedPolicyTooLargeException extends STSServiceException$1 {
    name = "PackedPolicyTooLargeException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "PackedPolicyTooLargeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
    }
};
let RegionDisabledException$1 = class RegionDisabledException extends STSServiceException$1 {
    name = "RegionDisabledException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "RegionDisabledException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, RegionDisabledException.prototype);
    }
};
let IDPRejectedClaimException$1 = class IDPRejectedClaimException extends STSServiceException$1 {
    name = "IDPRejectedClaimException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "IDPRejectedClaimException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
    }
};
let InvalidIdentityTokenException$1 = class InvalidIdentityTokenException extends STSServiceException$1 {
    name = "InvalidIdentityTokenException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidIdentityTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
    }
};
let IDPCommunicationErrorException$1 = class IDPCommunicationErrorException extends STSServiceException$1 {
    name = "IDPCommunicationErrorException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "IDPCommunicationErrorException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
    }
};
let InvalidAuthorizationMessageException$1 = class InvalidAuthorizationMessageException extends STSServiceException$1 {
    name = "InvalidAuthorizationMessageException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidAuthorizationMessageException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidAuthorizationMessageException.prototype);
    }
};
let ExpiredTradeInTokenException$1 = class ExpiredTradeInTokenException extends STSServiceException$1 {
    name = "ExpiredTradeInTokenException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ExpiredTradeInTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExpiredTradeInTokenException.prototype);
    }
};
let JWTPayloadSizeExceededException$1 = class JWTPayloadSizeExceededException extends STSServiceException$1 {
    name = "JWTPayloadSizeExceededException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "JWTPayloadSizeExceededException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, JWTPayloadSizeExceededException.prototype);
    }
};
let OutboundWebIdentityFederationDisabledException$1 = class OutboundWebIdentityFederationDisabledException extends STSServiceException$1 {
    name = "OutboundWebIdentityFederationDisabledException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "OutboundWebIdentityFederationDisabledException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, OutboundWebIdentityFederationDisabledException.prototype);
    }
};
let SessionDurationEscalationException$1 = class SessionDurationEscalationException extends STSServiceException$1 {
    name = "SessionDurationEscalationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "SessionDurationEscalationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, SessionDurationEscalationException.prototype);
    }
};

const _A = "Arn";
const _AKI = "AccessKeyId";
const _AP = "AssumedPrincipal";
const _AR = "AssumeRole";
const _ARI = "AssumedRoleId";
const _ARR = "AssumeRoleRequest";
const _ARRs = "AssumeRoleResponse";
const _ARRss = "AssumeRootRequest";
const _ARRssu = "AssumeRootResponse";
const _ARU = "AssumedRoleUser";
const _ARWSAML = "AssumeRoleWithSAML";
const _ARWSAMLR = "AssumeRoleWithSAMLRequest";
const _ARWSAMLRs = "AssumeRoleWithSAMLResponse";
const _ARWWI = "AssumeRoleWithWebIdentity";
const _ARWWIR = "AssumeRoleWithWebIdentityRequest";
const _ARWWIRs = "AssumeRoleWithWebIdentityResponse";
const _ARs = "AssumeRoot";
const _Ac = "Account";
const _Au = "Audience";
const _C = "Credentials";
const _CA = "ContextAssertion";
const _DAM = "DecodeAuthorizationMessage";
const _DAMR = "DecodeAuthorizationMessageRequest";
const _DAMRe = "DecodeAuthorizationMessageResponse";
const _DM = "DecodedMessage";
const _DS = "DurationSeconds";
const _E = "Expiration";
const _EI = "ExternalId";
const _EM = "EncodedMessage";
const _ETE = "ExpiredTokenException";
const _ETITE = "ExpiredTradeInTokenException";
const _FU = "FederatedUser";
const _FUI = "FederatedUserId";
const _GAKI = "GetAccessKeyInfo";
const _GAKIR = "GetAccessKeyInfoRequest";
const _GAKIRe = "GetAccessKeyInfoResponse";
const _GCI = "GetCallerIdentity";
const _GCIR = "GetCallerIdentityRequest";
const _GCIRe = "GetCallerIdentityResponse";
const _GDAT = "GetDelegatedAccessToken";
const _GDATR = "GetDelegatedAccessTokenRequest";
const _GDATRe = "GetDelegatedAccessTokenResponse";
const _GFT = "GetFederationToken";
const _GFTR = "GetFederationTokenRequest";
const _GFTRe = "GetFederationTokenResponse";
const _GST = "GetSessionToken";
const _GSTR = "GetSessionTokenRequest";
const _GSTRe = "GetSessionTokenResponse";
const _GWIT = "GetWebIdentityToken";
const _GWITR = "GetWebIdentityTokenRequest";
const _GWITRe = "GetWebIdentityTokenResponse";
const _I = "Issuer";
const _IAME = "InvalidAuthorizationMessageException";
const _IDPCEE = "IDPCommunicationErrorException";
const _IDPRCE = "IDPRejectedClaimException";
const _IITE = "InvalidIdentityTokenException";
const _JWTPSEE = "JWTPayloadSizeExceededException";
const _K = "Key";
const _MPDE = "MalformedPolicyDocumentException";
const _N = "Name";
const _NQ = "NameQualifier";
const _OWIFDE = "OutboundWebIdentityFederationDisabledException";
const _P = "Policy";
const _PA = "PolicyArns";
const _PAr = "PrincipalArn";
const _PAro = "ProviderArn";
const _PC = "ProvidedContexts";
const _PCLT = "ProvidedContextsListType";
const _PCr = "ProvidedContext";
const _PDT = "PolicyDescriptorType";
const _PI = "ProviderId";
const _PPS = "PackedPolicySize";
const _PPTLE = "PackedPolicyTooLargeException";
const _Pr = "Provider";
const _RA = "RoleArn";
const _RDE = "RegionDisabledException";
const _RSN = "RoleSessionName";
const _S = "Subject";
const _SA = "SigningAlgorithm";
const _SAK = "SecretAccessKey";
const _SAMLA = "SAMLAssertion";
const _SAMLAT = "SAMLAssertionType";
const _SDEE = "SessionDurationEscalationException";
const _SFWIT = "SubjectFromWebIdentityToken";
const _SI = "SourceIdentity";
const _SN = "SerialNumber";
const _ST = "SubjectType";
const _STe = "SessionToken";
const _T = "Tags";
const _TC = "TokenCode";
const _TIT = "TradeInToken";
const _TP = "TargetPrincipal";
const _TPA = "TaskPolicyArn";
const _TTK = "TransitiveTagKeys";
const _Ta = "Tag";
const _UI = "UserId";
const _V = "Value";
const _WIT = "WebIdentityToken";
const _a = "arn";
const _aKST = "accessKeySecretType";
const _aQE = "awsQueryError";
const _c = "client";
const _cTT = "clientTokenType";
const _e = "error";
const _hE = "httpError";
const _m = "message";
const _pDLT = "policyDescriptorListType";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
const _tITT = "tradeInTokenType";
const _tLT = "tagListType";
const _wITT = "webIdentityTokenType";
const n0 = "com.amazonaws.sts";
var accessKeySecretType = [0, n0, _aKST, 8, 0];
var clientTokenType = [0, n0, _cTT, 8, 0];
var SAMLAssertionType = [0, n0, _SAMLAT, 8, 0];
var tradeInTokenType = [0, n0, _tITT, 8, 0];
var webIdentityTokenType = [0, n0, _wITT, 8, 0];
var AssumedRoleUser = [3, n0, _ARU, 0, [_ARI, _A], [0, 0]];
var AssumeRoleRequest = [
    3,
    n0,
    _ARR,
    0,
    [_RA, _RSN, _PA, _P, _DS, _T, _TTK, _EI, _SN, _TC, _SI, _PC],
    [0, 0, () => policyDescriptorListType, 0, 1, () => tagListType, 64 | 0, 0, 0, 0, 0, () => ProvidedContextsListType],
];
var AssumeRoleResponse = [
    3,
    n0,
    _ARRs,
    0,
    [_C, _ARU, _PPS, _SI],
    [[() => Credentials, 0], () => AssumedRoleUser, 1, 0],
];
var AssumeRoleWithSAMLRequest = [
    3,
    n0,
    _ARWSAMLR,
    0,
    [_RA, _PAr, _SAMLA, _PA, _P, _DS],
    [0, 0, [() => SAMLAssertionType, 0], () => policyDescriptorListType, 0, 1],
];
var AssumeRoleWithSAMLResponse = [
    3,
    n0,
    _ARWSAMLRs,
    0,
    [_C, _ARU, _PPS, _S, _ST, _I, _Au, _NQ, _SI],
    [[() => Credentials, 0], () => AssumedRoleUser, 1, 0, 0, 0, 0, 0, 0],
];
var AssumeRoleWithWebIdentityRequest = [
    3,
    n0,
    _ARWWIR,
    0,
    [_RA, _RSN, _WIT, _PI, _PA, _P, _DS],
    [0, 0, [() => clientTokenType, 0], 0, () => policyDescriptorListType, 0, 1],
];
var AssumeRoleWithWebIdentityResponse = [
    3,
    n0,
    _ARWWIRs,
    0,
    [_C, _SFWIT, _ARU, _PPS, _Pr, _Au, _SI],
    [[() => Credentials, 0], 0, () => AssumedRoleUser, 1, 0, 0, 0],
];
var AssumeRootRequest = [
    3,
    n0,
    _ARRss,
    0,
    [_TP, _TPA, _DS],
    [0, () => PolicyDescriptorType, 1],
];
var AssumeRootResponse = [3, n0, _ARRssu, 0, [_C, _SI], [[() => Credentials, 0], 0]];
var Credentials = [
    3,
    n0,
    _C,
    0,
    [_AKI, _SAK, _STe, _E],
    [0, [() => accessKeySecretType, 0], 0, 4],
];
var DecodeAuthorizationMessageRequest = [3, n0, _DAMR, 0, [_EM], [0]];
var DecodeAuthorizationMessageResponse = [3, n0, _DAMRe, 0, [_DM], [0]];
var ExpiredTokenException = [
    -3,
    n0,
    _ETE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`ExpiredTokenException`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ExpiredTokenException, ExpiredTokenException$1);
var ExpiredTradeInTokenException = [
    -3,
    n0,
    _ETITE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`ExpiredTradeInTokenException`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ExpiredTradeInTokenException, ExpiredTradeInTokenException$1);
var FederatedUser = [3, n0, _FU, 0, [_FUI, _A], [0, 0]];
var GetAccessKeyInfoRequest = [3, n0, _GAKIR, 0, [_AKI], [0]];
var GetAccessKeyInfoResponse = [3, n0, _GAKIRe, 0, [_Ac], [0]];
var GetCallerIdentityRequest = [3, n0, _GCIR, 0, [], []];
var GetCallerIdentityResponse = [3, n0, _GCIRe, 0, [_UI, _Ac, _A], [0, 0, 0]];
var GetDelegatedAccessTokenRequest = [
    3,
    n0,
    _GDATR,
    0,
    [_TIT],
    [[() => tradeInTokenType, 0]],
];
var GetDelegatedAccessTokenResponse = [
    3,
    n0,
    _GDATRe,
    0,
    [_C, _PPS, _AP],
    [[() => Credentials, 0], 1, 0],
];
var GetFederationTokenRequest = [
    3,
    n0,
    _GFTR,
    0,
    [_N, _P, _PA, _DS, _T],
    [0, 0, () => policyDescriptorListType, 1, () => tagListType],
];
var GetFederationTokenResponse = [
    3,
    n0,
    _GFTRe,
    0,
    [_C, _FU, _PPS],
    [[() => Credentials, 0], () => FederatedUser, 1],
];
var GetSessionTokenRequest = [3, n0, _GSTR, 0, [_DS, _SN, _TC], [1, 0, 0]];
var GetSessionTokenResponse = [3, n0, _GSTRe, 0, [_C], [[() => Credentials, 0]]];
var GetWebIdentityTokenRequest = [
    3,
    n0,
    _GWITR,
    0,
    [_Au, _DS, _SA, _T],
    [64 | 0, 1, 0, () => tagListType],
];
var GetWebIdentityTokenResponse = [
    3,
    n0,
    _GWITRe,
    0,
    [_WIT, _E],
    [[() => webIdentityTokenType, 0], 4],
];
var IDPCommunicationErrorException = [
    -3,
    n0,
    _IDPCEE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`IDPCommunicationError`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(IDPCommunicationErrorException, IDPCommunicationErrorException$1);
var IDPRejectedClaimException = [
    -3,
    n0,
    _IDPRCE,
    {
        [_e]: _c,
        [_hE]: 403,
        [_aQE]: [`IDPRejectedClaim`, 403],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(IDPRejectedClaimException, IDPRejectedClaimException$1);
var InvalidAuthorizationMessageException = [
    -3,
    n0,
    _IAME,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`InvalidAuthorizationMessageException`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InvalidAuthorizationMessageException, InvalidAuthorizationMessageException$1);
var InvalidIdentityTokenException = [
    -3,
    n0,
    _IITE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`InvalidIdentityToken`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InvalidIdentityTokenException, InvalidIdentityTokenException$1);
var JWTPayloadSizeExceededException = [
    -3,
    n0,
    _JWTPSEE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`JWTPayloadSizeExceededException`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(JWTPayloadSizeExceededException, JWTPayloadSizeExceededException$1);
var MalformedPolicyDocumentException = [
    -3,
    n0,
    _MPDE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`MalformedPolicyDocument`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(MalformedPolicyDocumentException, MalformedPolicyDocumentException$1);
var OutboundWebIdentityFederationDisabledException = [
    -3,
    n0,
    _OWIFDE,
    {
        [_e]: _c,
        [_hE]: 403,
        [_aQE]: [`OutboundWebIdentityFederationDisabledException`, 403],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(OutboundWebIdentityFederationDisabledException, OutboundWebIdentityFederationDisabledException$1);
var PackedPolicyTooLargeException = [
    -3,
    n0,
    _PPTLE,
    {
        [_e]: _c,
        [_hE]: 400,
        [_aQE]: [`PackedPolicyTooLarge`, 400],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(PackedPolicyTooLargeException, PackedPolicyTooLargeException$1);
var PolicyDescriptorType = [3, n0, _PDT, 0, [_a], [0]];
var ProvidedContext = [3, n0, _PCr, 0, [_PAro, _CA], [0, 0]];
var RegionDisabledException = [
    -3,
    n0,
    _RDE,
    {
        [_e]: _c,
        [_hE]: 403,
        [_aQE]: [`RegionDisabledException`, 403],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(RegionDisabledException, RegionDisabledException$1);
var SessionDurationEscalationException = [
    -3,
    n0,
    _SDEE,
    {
        [_e]: _c,
        [_hE]: 403,
        [_aQE]: [`SessionDurationEscalationException`, 403],
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(SessionDurationEscalationException, SessionDurationEscalationException$1);
var Tag = [3, n0, _Ta, 0, [_K, _V], [0, 0]];
var STSServiceException = [-3, _s, "STSServiceException", 0, [], []];
schema.TypeRegistry.for(_s).registerError(STSServiceException, STSServiceException$1);
var policyDescriptorListType = [1, n0, _pDLT, 0, () => PolicyDescriptorType];
var ProvidedContextsListType = [1, n0, _PCLT, 0, () => ProvidedContext];
var tagListType = [1, n0, _tLT, 0, () => Tag];
var AssumeRole = [9, n0, _AR, 0, () => AssumeRoleRequest, () => AssumeRoleResponse];
var AssumeRoleWithSAML = [
    9,
    n0,
    _ARWSAML,
    0,
    () => AssumeRoleWithSAMLRequest,
    () => AssumeRoleWithSAMLResponse,
];
var AssumeRoleWithWebIdentity = [
    9,
    n0,
    _ARWWI,
    0,
    () => AssumeRoleWithWebIdentityRequest,
    () => AssumeRoleWithWebIdentityResponse,
];
var AssumeRoot = [9, n0, _ARs, 0, () => AssumeRootRequest, () => AssumeRootResponse];
var DecodeAuthorizationMessage = [
    9,
    n0,
    _DAM,
    0,
    () => DecodeAuthorizationMessageRequest,
    () => DecodeAuthorizationMessageResponse,
];
var GetAccessKeyInfo = [
    9,
    n0,
    _GAKI,
    0,
    () => GetAccessKeyInfoRequest,
    () => GetAccessKeyInfoResponse,
];
var GetCallerIdentity = [
    9,
    n0,
    _GCI,
    0,
    () => GetCallerIdentityRequest,
    () => GetCallerIdentityResponse,
];
var GetDelegatedAccessToken = [
    9,
    n0,
    _GDAT,
    0,
    () => GetDelegatedAccessTokenRequest,
    () => GetDelegatedAccessTokenResponse,
];
var GetFederationToken = [
    9,
    n0,
    _GFT,
    0,
    () => GetFederationTokenRequest,
    () => GetFederationTokenResponse,
];
var GetSessionToken = [
    9,
    n0,
    _GST,
    0,
    () => GetSessionTokenRequest,
    () => GetSessionTokenResponse,
];
var GetWebIdentityToken = [
    9,
    n0,
    _GWIT,
    0,
    () => GetWebIdentityTokenRequest,
    () => GetWebIdentityTokenResponse,
];

class AssumeRoleCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "AssumeRole", {})
    .n("STSClient", "AssumeRoleCommand")
    .sc(AssumeRole)
    .build() {
}

class AssumeRoleWithSAMLCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithSAML", {})
    .n("STSClient", "AssumeRoleWithSAMLCommand")
    .sc(AssumeRoleWithSAML)
    .build() {
}

class AssumeRoleWithWebIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithWebIdentity", {})
    .n("STSClient", "AssumeRoleWithWebIdentityCommand")
    .sc(AssumeRoleWithWebIdentity)
    .build() {
}

class AssumeRootCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "AssumeRoot", {})
    .n("STSClient", "AssumeRootCommand")
    .sc(AssumeRoot)
    .build() {
}

class DecodeAuthorizationMessageCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "DecodeAuthorizationMessage", {})
    .n("STSClient", "DecodeAuthorizationMessageCommand")
    .sc(DecodeAuthorizationMessage)
    .build() {
}

class GetAccessKeyInfoCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetAccessKeyInfo", {})
    .n("STSClient", "GetAccessKeyInfoCommand")
    .sc(GetAccessKeyInfo)
    .build() {
}

class GetCallerIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetCallerIdentity", {})
    .n("STSClient", "GetCallerIdentityCommand")
    .sc(GetCallerIdentity)
    .build() {
}

class GetDelegatedAccessTokenCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetDelegatedAccessToken", {})
    .n("STSClient", "GetDelegatedAccessTokenCommand")
    .sc(GetDelegatedAccessToken)
    .build() {
}

class GetFederationTokenCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetFederationToken", {})
    .n("STSClient", "GetFederationTokenCommand")
    .sc(GetFederationToken)
    .build() {
}

class GetSessionTokenCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetSessionToken", {})
    .n("STSClient", "GetSessionTokenCommand")
    .sc(GetSessionToken)
    .build() {
}

class GetWebIdentityTokenCommand extends smithyClient.Command
    .classBuilder()
    .ep(EndpointParameters.commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSecurityTokenServiceV20110615", "GetWebIdentityToken", {})
    .n("STSClient", "GetWebIdentityTokenCommand")
    .sc(GetWebIdentityToken)
    .build() {
}

const commands = {
    AssumeRoleCommand,
    AssumeRoleWithSAMLCommand,
    AssumeRoleWithWebIdentityCommand,
    AssumeRootCommand,
    DecodeAuthorizationMessageCommand,
    GetAccessKeyInfoCommand,
    GetCallerIdentityCommand,
    GetDelegatedAccessTokenCommand,
    GetFederationTokenCommand,
    GetSessionTokenCommand,
    GetWebIdentityTokenCommand,
};
class STS extends STSClient.STSClient {
}
smithyClient.createAggregatedClient(commands, STS);

const getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
    if (typeof assumedRoleUser?.Arn === "string") {
        const arnComponents = assumedRoleUser.Arn.split(":");
        if (arnComponents.length > 4 && arnComponents[4] !== "") {
            return arnComponents[4];
        }
    }
    return undefined;
};
const resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
    const region = typeof _region === "function" ? await _region() : _region;
    const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
    const stsDefaultRegion = await regionConfigResolver.stsRegionDefaultResolver(loaderConfig)();
    credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
    return region ?? parentRegion ?? stsDefaultRegion;
};
const getDefaultRoleAssumer$1 = (stsOptions, STSClient) => {
    let stsClient;
    let closureSourceCreds;
    return async (sourceCreds, params) => {
        closureSourceCreds = sourceCreds;
        if (!stsClient) {
            const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId, } = stsOptions;
            const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
                logger,
                profile,
            });
            const isCompatibleRequestHandler = !isH2(requestHandler);
            stsClient = new STSClient({
                ...stsOptions,
                userAgentAppId,
                profile,
                credentialDefaultProvider: () => async () => closureSourceCreds,
                region: resolvedRegion,
                requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
                logger: logger,
            });
        }
        const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
        if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
            throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
        }
        const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
        const credentials = {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken,
            expiration: Credentials.Expiration,
            ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
            ...(accountId && { accountId }),
        };
        client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
        return credentials;
    };
};
const getDefaultRoleAssumerWithWebIdentity$1 = (stsOptions, STSClient) => {
    let stsClient;
    return async (params) => {
        if (!stsClient) {
            const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId, } = stsOptions;
            const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
                logger,
                profile,
            });
            const isCompatibleRequestHandler = !isH2(requestHandler);
            stsClient = new STSClient({
                ...stsOptions,
                userAgentAppId,
                profile,
                region: resolvedRegion,
                requestHandler: isCompatibleRequestHandler ? requestHandler : undefined,
                logger: logger,
            });
        }
        const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
        if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) {
            throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
        }
        const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
        const credentials = {
            accessKeyId: Credentials.AccessKeyId,
            secretAccessKey: Credentials.SecretAccessKey,
            sessionToken: Credentials.SessionToken,
            expiration: Credentials.Expiration,
            ...(Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope }),
            ...(accountId && { accountId }),
        };
        if (accountId) {
            client.setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
        }
        client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
        return credentials;
    };
};
const isH2 = (requestHandler) => {
    return requestHandler?.metadata?.handlerProtocol === "h2";
};

const getCustomizableStsClientCtor = (baseCtor, customizations) => {
    if (!customizations)
        return baseCtor;
    else
        return class CustomizableSTSClient extends baseCtor {
            constructor(config) {
                super(config);
                for (const customization of customizations) {
                    this.middlewareStack.use(customization);
                }
            }
        };
};
const getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumer$1(stsOptions, getCustomizableStsClientCtor(STSClient.STSClient, stsPlugins));
const getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity$1(stsOptions, getCustomizableStsClientCtor(STSClient.STSClient, stsPlugins));
const decorateDefaultCredentialProvider = (provider) => (input) => provider({
    roleAssumer: getDefaultRoleAssumer(input),
    roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(input),
    ...input,
});

Object.defineProperty(exports, "$Command", {
    enumerable: true,
    get: function () { return smithyClient.Command; }
});
exports.AssumeRoleCommand = AssumeRoleCommand;
exports.AssumeRoleWithSAMLCommand = AssumeRoleWithSAMLCommand;
exports.AssumeRoleWithWebIdentityCommand = AssumeRoleWithWebIdentityCommand;
exports.AssumeRootCommand = AssumeRootCommand;
exports.DecodeAuthorizationMessageCommand = DecodeAuthorizationMessageCommand;
exports.ExpiredTokenException = ExpiredTokenException$1;
exports.ExpiredTradeInTokenException = ExpiredTradeInTokenException$1;
exports.GetAccessKeyInfoCommand = GetAccessKeyInfoCommand;
exports.GetCallerIdentityCommand = GetCallerIdentityCommand;
exports.GetDelegatedAccessTokenCommand = GetDelegatedAccessTokenCommand;
exports.GetFederationTokenCommand = GetFederationTokenCommand;
exports.GetSessionTokenCommand = GetSessionTokenCommand;
exports.GetWebIdentityTokenCommand = GetWebIdentityTokenCommand;
exports.IDPCommunicationErrorException = IDPCommunicationErrorException$1;
exports.IDPRejectedClaimException = IDPRejectedClaimException$1;
exports.InvalidAuthorizationMessageException = InvalidAuthorizationMessageException$1;
exports.InvalidIdentityTokenException = InvalidIdentityTokenException$1;
exports.JWTPayloadSizeExceededException = JWTPayloadSizeExceededException$1;
exports.MalformedPolicyDocumentException = MalformedPolicyDocumentException$1;
exports.OutboundWebIdentityFederationDisabledException = OutboundWebIdentityFederationDisabledException$1;
exports.PackedPolicyTooLargeException = PackedPolicyTooLargeException$1;
exports.RegionDisabledException = RegionDisabledException$1;
exports.STS = STS;
exports.STSServiceException = STSServiceException$1;
exports.SessionDurationEscalationException = SessionDurationEscalationException$1;
exports.decorateDefaultCredentialProvider = decorateDefaultCredentialProvider;
exports.getDefaultRoleAssumer = getDefaultRoleAssumer;
exports.getDefaultRoleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity;
Object.keys(STSClient).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () { return STSClient[k]; }
    });
});
