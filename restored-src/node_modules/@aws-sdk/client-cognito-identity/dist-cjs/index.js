'use strict';

var middlewareHostHeader = require('@aws-sdk/middleware-host-header');
var middlewareLogger = require('@aws-sdk/middleware-logger');
var middlewareRecursionDetection = require('@aws-sdk/middleware-recursion-detection');
var middlewareUserAgent = require('@aws-sdk/middleware-user-agent');
var configResolver = require('@smithy/config-resolver');
var core = require('@smithy/core');
var schema = require('@smithy/core/schema');
var middlewareContentLength = require('@smithy/middleware-content-length');
var middlewareEndpoint = require('@smithy/middleware-endpoint');
var middlewareRetry = require('@smithy/middleware-retry');
var smithyClient = require('@smithy/smithy-client');
var httpAuthSchemeProvider = require('./auth/httpAuthSchemeProvider');
var runtimeConfig = require('./runtimeConfig');
var regionConfigResolver = require('@aws-sdk/region-config-resolver');
var protocolHttp = require('@smithy/protocol-http');

const resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "cognito-identity",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};

const getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme(httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            }
            else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes() {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
            return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
            _credentials = credentials;
        },
        credentials() {
            return _credentials;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
    };
};

const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(regionConfigResolver.getAwsRegionExtensionConfiguration(runtimeConfig), smithyClient.getDefaultExtensionConfiguration(runtimeConfig), protocolHttp.getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, regionConfigResolver.resolveAwsRegionExtensionConfiguration(extensionConfiguration), smithyClient.resolveDefaultRuntimeConfig(extensionConfiguration), protocolHttp.resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

class CognitoIdentityClient extends smithyClient.Client {
    config;
    constructor(...[configuration]) {
        const _config_0 = runtimeConfig.getRuntimeConfig(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = resolveClientEndpointParameters(_config_0);
        const _config_2 = middlewareUserAgent.resolveUserAgentConfig(_config_1);
        const _config_3 = middlewareRetry.resolveRetryConfig(_config_2);
        const _config_4 = configResolver.resolveRegionConfig(_config_3);
        const _config_5 = middlewareHostHeader.resolveHostHeaderConfig(_config_4);
        const _config_6 = middlewareEndpoint.resolveEndpointConfig(_config_5);
        const _config_7 = httpAuthSchemeProvider.resolveHttpAuthSchemeConfig(_config_6);
        const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
        this.config = _config_8;
        this.middlewareStack.use(schema.getSchemaSerdePlugin(this.config));
        this.middlewareStack.use(middlewareUserAgent.getUserAgentPlugin(this.config));
        this.middlewareStack.use(middlewareRetry.getRetryPlugin(this.config));
        this.middlewareStack.use(middlewareContentLength.getContentLengthPlugin(this.config));
        this.middlewareStack.use(middlewareHostHeader.getHostHeaderPlugin(this.config));
        this.middlewareStack.use(middlewareLogger.getLoggerPlugin(this.config));
        this.middlewareStack.use(middlewareRecursionDetection.getRecursionDetectionPlugin(this.config));
        this.middlewareStack.use(core.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
            httpAuthSchemeParametersProvider: httpAuthSchemeProvider.defaultCognitoIdentityHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new core.DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
            }),
        }));
        this.middlewareStack.use(core.getHttpSigningPlugin(this.config));
    }
    destroy() {
        super.destroy();
    }
}

let CognitoIdentityServiceException$1 = class CognitoIdentityServiceException extends smithyClient.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, CognitoIdentityServiceException.prototype);
    }
};

let InternalErrorException$1 = class InternalErrorException extends CognitoIdentityServiceException$1 {
    name = "InternalErrorException";
    $fault = "server";
    constructor(opts) {
        super({
            name: "InternalErrorException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalErrorException.prototype);
    }
};
let InvalidParameterException$1 = class InvalidParameterException extends CognitoIdentityServiceException$1 {
    name = "InvalidParameterException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidParameterException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidParameterException.prototype);
    }
};
let LimitExceededException$1 = class LimitExceededException extends CognitoIdentityServiceException$1 {
    name = "LimitExceededException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "LimitExceededException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, LimitExceededException.prototype);
    }
};
let NotAuthorizedException$1 = class NotAuthorizedException extends CognitoIdentityServiceException$1 {
    name = "NotAuthorizedException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "NotAuthorizedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, NotAuthorizedException.prototype);
    }
};
let ResourceConflictException$1 = class ResourceConflictException extends CognitoIdentityServiceException$1 {
    name = "ResourceConflictException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceConflictException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceConflictException.prototype);
    }
};
let TooManyRequestsException$1 = class TooManyRequestsException extends CognitoIdentityServiceException$1 {
    name = "TooManyRequestsException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "TooManyRequestsException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
};
let ResourceNotFoundException$1 = class ResourceNotFoundException extends CognitoIdentityServiceException$1 {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceNotFoundException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
};
let ExternalServiceException$1 = class ExternalServiceException extends CognitoIdentityServiceException$1 {
    name = "ExternalServiceException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ExternalServiceException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExternalServiceException.prototype);
    }
};
let InvalidIdentityPoolConfigurationException$1 = class InvalidIdentityPoolConfigurationException extends CognitoIdentityServiceException$1 {
    name = "InvalidIdentityPoolConfigurationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "InvalidIdentityPoolConfigurationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidIdentityPoolConfigurationException.prototype);
    }
};
let DeveloperUserAlreadyRegisteredException$1 = class DeveloperUserAlreadyRegisteredException extends CognitoIdentityServiceException$1 {
    name = "DeveloperUserAlreadyRegisteredException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "DeveloperUserAlreadyRegisteredException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, DeveloperUserAlreadyRegisteredException.prototype);
    }
};
let ConcurrentModificationException$1 = class ConcurrentModificationException extends CognitoIdentityServiceException$1 {
    name = "ConcurrentModificationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ConcurrentModificationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ConcurrentModificationException.prototype);
    }
};

const _ACF = "AllowClassicFlow";
const _AI = "AccountId";
const _AKI = "AccessKeyId";
const _ARR = "AmbiguousRoleResolution";
const _AUI = "AllowUnauthenticatedIdentities";
const _C = "Credentials";
const _CD = "CreationDate";
const _CI = "ClientId";
const _CIP = "CognitoIdentityProvider";
const _CIPI = "CreateIdentityPoolInput";
const _CIPL = "CognitoIdentityProviderList";
const _CIPo = "CognitoIdentityProviders";
const _CIPr = "CreateIdentityPool";
const _CME = "ConcurrentModificationException";
const _CRA = "CustomRoleArn";
const _Cl = "Claim";
const _DI = "DeleteIdentities";
const _DII = "DeleteIdentitiesInput";
const _DIIe = "DescribeIdentityInput";
const _DIP = "DeleteIdentityPool";
const _DIPI = "DeleteIdentityPoolInput";
const _DIPIe = "DescribeIdentityPoolInput";
const _DIPe = "DescribeIdentityPool";
const _DIR = "DeleteIdentitiesResponse";
const _DIe = "DescribeIdentity";
const _DPN = "DeveloperProviderName";
const _DUARE = "DeveloperUserAlreadyRegisteredException";
const _DUI = "DeveloperUserIdentifier";
const _DUIL = "DeveloperUserIdentifierList";
const _DUIe = "DestinationUserIdentifier";
const _E = "Expiration";
const _EC = "ErrorCode";
const _ESE = "ExternalServiceException";
const _GCFI = "GetCredentialsForIdentity";
const _GCFII = "GetCredentialsForIdentityInput";
const _GCFIR = "GetCredentialsForIdentityResponse";
const _GI = "GetId";
const _GII = "GetIdInput";
const _GIPR = "GetIdentityPoolRoles";
const _GIPRI = "GetIdentityPoolRolesInput";
const _GIPRR = "GetIdentityPoolRolesResponse";
const _GIR = "GetIdResponse";
const _GOIT = "GetOpenIdToken";
const _GOITFDI = "GetOpenIdTokenForDeveloperIdentity";
const _GOITFDII = "GetOpenIdTokenForDeveloperIdentityInput";
const _GOITFDIR = "GetOpenIdTokenForDeveloperIdentityResponse";
const _GOITI = "GetOpenIdTokenInput";
const _GOITR = "GetOpenIdTokenResponse";
const _GPTAM = "GetPrincipalTagAttributeMap";
const _GPTAMI = "GetPrincipalTagAttributeMapInput";
const _GPTAMR = "GetPrincipalTagAttributeMapResponse";
const _HD = "HideDisabled";
const _I = "Identities";
const _ID = "IdentityDescription";
const _IEE = "InternalErrorException";
const _II = "IdentityId";
const _IIPCE = "InvalidIdentityPoolConfigurationException";
const _IITD = "IdentityIdsToDelete";
const _IL = "IdentitiesList";
const _IP = "IdentityPool";
const _IPE = "InvalidParameterException";
const _IPI = "IdentityPoolId";
const _IPL = "IdentityPoolsList";
const _IPN = "IdentityPoolName";
const _IPNd = "IdentityProviderName";
const _IPSD = "IdentityPoolShortDescription";
const _IPT = "IdentityProviderToken";
const _IPTd = "IdentityPoolTags";
const _IPd = "IdentityPools";
const _L = "Logins";
const _LDI = "LookupDeveloperIdentity";
const _LDII = "LookupDeveloperIdentityInput";
const _LDIR = "LookupDeveloperIdentityResponse";
const _LEE = "LimitExceededException";
const _LI = "ListIdentities";
const _LII = "ListIdentitiesInput";
const _LIP = "ListIdentityPools";
const _LIPI = "ListIdentityPoolsInput";
const _LIPR = "ListIdentityPoolsResponse";
const _LIR = "ListIdentitiesResponse";
const _LM = "LoginsMap";
const _LMD = "LastModifiedDate";
const _LTFR = "ListTagsForResource";
const _LTFRI = "ListTagsForResourceInput";
const _LTFRR = "ListTagsForResourceResponse";
const _LTR = "LoginsToRemove";
const _MDI = "MergeDeveloperIdentities";
const _MDII = "MergeDeveloperIdentitiesInput";
const _MDIR = "MergeDeveloperIdentitiesResponse";
const _MR = "MaxResults";
const _MRL = "MappingRulesList";
const _MRa = "MappingRule";
const _MT = "MatchType";
const _NAE = "NotAuthorizedException";
const _NT = "NextToken";
const _OICPARN = "OpenIdConnectProviderARNs";
const _OIDCT = "OIDCToken";
const _PN = "ProviderName";
const _PT = "PrincipalTags";
const _R = "Roles";
const _RA = "ResourceArn";
const _RARN = "RoleARN";
const _RC = "RulesConfiguration";
const _RCE = "ResourceConflictException";
const _RCT = "RulesConfigurationType";
const _RM = "RoleMappings";
const _RMM = "RoleMappingMap";
const _RMo = "RoleMapping";
const _RNFE = "ResourceNotFoundException";
const _Ru = "Rules";
const _SIPR = "SetIdentityPoolRoles";
const _SIPRI = "SetIdentityPoolRolesInput";
const _SK = "SecretKey";
const _SKS = "SecretKeyString";
const _SLP = "SupportedLoginProviders";
const _SPARN = "SamlProviderARNs";
const _SPTAM = "SetPrincipalTagAttributeMap";
const _SPTAMI = "SetPrincipalTagAttributeMapInput";
const _SPTAMR = "SetPrincipalTagAttributeMapResponse";
const _SSTC = "ServerSideTokenCheck";
const _ST = "SessionToken";
const _SUI = "SourceUserIdentifier";
const _T = "Token";
const _TD = "TokenDuration";
const _TK = "TagKeys";
const _TMRE = "TooManyRequestsException";
const _TR = "TagResource";
const _TRI = "TagResourceInput";
const _TRR = "TagResourceResponse";
const _Ta = "Tags";
const _Ty = "Type";
const _UD = "UseDefaults";
const _UDI = "UnlinkDeveloperIdentity";
const _UDII = "UnlinkDeveloperIdentityInput";
const _UI = "UnlinkIdentity";
const _UII = "UnprocessedIdentityIds";
const _UIIL = "UnprocessedIdentityIdList";
const _UIIn = "UnlinkIdentityInput";
const _UIInp = "UnprocessedIdentityId";
const _UIP = "UpdateIdentityPool";
const _UR = "UntagResource";
const _URI = "UntagResourceInput";
const _URR = "UntagResourceResponse";
const _V = "Value";
const _c = "client";
const _e = "error";
const _hE = "httpError";
const _m = "message";
const _s = "server";
const _sm = "smithy.ts.sdk.synthetic.com.amazonaws.cognitoidentity";
const n0 = "com.amazonaws.cognitoidentity";
var IdentityProviderToken = [0, n0, _IPT, 8, 0];
var OIDCToken = [0, n0, _OIDCT, 8, 0];
var SecretKeyString = [0, n0, _SKS, 8, 0];
var CognitoIdentityProvider = [3, n0, _CIP, 0, [_PN, _CI, _SSTC], [0, 0, 2]];
var ConcurrentModificationException = [
    -3,
    n0,
    _CME,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ConcurrentModificationException, ConcurrentModificationException$1);
var CreateIdentityPoolInput = [
    3,
    n0,
    _CIPI,
    0,
    [_IPN, _AUI, _ACF, _SLP, _DPN, _OICPARN, _CIPo, _SPARN, _IPTd],
    [0, 2, 2, 128 | 0, 0, 64 | 0, () => CognitoIdentityProviderList, 64 | 0, 128 | 0],
];
var Credentials = [
    3,
    n0,
    _C,
    0,
    [_AKI, _SK, _ST, _E],
    [0, [() => SecretKeyString, 0], 0, 4],
];
var DeleteIdentitiesInput = [3, n0, _DII, 0, [_IITD], [64 | 0]];
var DeleteIdentitiesResponse = [
    3,
    n0,
    _DIR,
    0,
    [_UII],
    [() => UnprocessedIdentityIdList],
];
var DeleteIdentityPoolInput = [3, n0, _DIPI, 0, [_IPI], [0]];
var DescribeIdentityInput = [3, n0, _DIIe, 0, [_II], [0]];
var DescribeIdentityPoolInput = [3, n0, _DIPIe, 0, [_IPI], [0]];
var DeveloperUserAlreadyRegisteredException = [
    -3,
    n0,
    _DUARE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(DeveloperUserAlreadyRegisteredException, DeveloperUserAlreadyRegisteredException$1);
var ExternalServiceException = [
    -3,
    n0,
    _ESE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ExternalServiceException, ExternalServiceException$1);
var GetCredentialsForIdentityInput = [
    3,
    n0,
    _GCFII,
    0,
    [_II, _L, _CRA],
    [0, [() => LoginsMap, 0], 0],
];
var GetCredentialsForIdentityResponse = [
    3,
    n0,
    _GCFIR,
    0,
    [_II, _C],
    [0, [() => Credentials, 0]],
];
var GetIdentityPoolRolesInput = [3, n0, _GIPRI, 0, [_IPI], [0]];
var GetIdentityPoolRolesResponse = [
    3,
    n0,
    _GIPRR,
    0,
    [_IPI, _R, _RM],
    [0, 128 | 0, () => RoleMappingMap],
];
var GetIdInput = [3, n0, _GII, 0, [_AI, _IPI, _L], [0, 0, [() => LoginsMap, 0]]];
var GetIdResponse = [3, n0, _GIR, 0, [_II], [0]];
var GetOpenIdTokenForDeveloperIdentityInput = [
    3,
    n0,
    _GOITFDII,
    0,
    [_IPI, _II, _L, _PT, _TD],
    [0, 0, [() => LoginsMap, 0], 128 | 0, 1],
];
var GetOpenIdTokenForDeveloperIdentityResponse = [
    3,
    n0,
    _GOITFDIR,
    0,
    [_II, _T],
    [0, [() => OIDCToken, 0]],
];
var GetOpenIdTokenInput = [3, n0, _GOITI, 0, [_II, _L], [0, [() => LoginsMap, 0]]];
var GetOpenIdTokenResponse = [3, n0, _GOITR, 0, [_II, _T], [0, [() => OIDCToken, 0]]];
var GetPrincipalTagAttributeMapInput = [3, n0, _GPTAMI, 0, [_IPI, _IPNd], [0, 0]];
var GetPrincipalTagAttributeMapResponse = [
    3,
    n0,
    _GPTAMR,
    0,
    [_IPI, _IPNd, _UD, _PT],
    [0, 0, 2, 128 | 0],
];
var IdentityDescription = [3, n0, _ID, 0, [_II, _L, _CD, _LMD], [0, 64 | 0, 4, 4]];
var IdentityPool = [
    3,
    n0,
    _IP,
    0,
    [_IPI, _IPN, _AUI, _ACF, _SLP, _DPN, _OICPARN, _CIPo, _SPARN, _IPTd],
    [0, 0, 2, 2, 128 | 0, 0, 64 | 0, () => CognitoIdentityProviderList, 64 | 0, 128 | 0],
];
var IdentityPoolShortDescription = [3, n0, _IPSD, 0, [_IPI, _IPN], [0, 0]];
var InternalErrorException = [
    -3,
    n0,
    _IEE,
    {
        [_e]: _s,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InternalErrorException, InternalErrorException$1);
var InvalidIdentityPoolConfigurationException = [
    -3,
    n0,
    _IIPCE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InvalidIdentityPoolConfigurationException, InvalidIdentityPoolConfigurationException$1);
var InvalidParameterException = [
    -3,
    n0,
    _IPE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InvalidParameterException, InvalidParameterException$1);
var LimitExceededException = [
    -3,
    n0,
    _LEE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(LimitExceededException, LimitExceededException$1);
var ListIdentitiesInput = [3, n0, _LII, 0, [_IPI, _MR, _NT, _HD], [0, 1, 0, 2]];
var ListIdentitiesResponse = [
    3,
    n0,
    _LIR,
    0,
    [_IPI, _I, _NT],
    [0, () => IdentitiesList, 0],
];
var ListIdentityPoolsInput = [3, n0, _LIPI, 0, [_MR, _NT], [1, 0]];
var ListIdentityPoolsResponse = [
    3,
    n0,
    _LIPR,
    0,
    [_IPd, _NT],
    [() => IdentityPoolsList, 0],
];
var ListTagsForResourceInput = [3, n0, _LTFRI, 0, [_RA], [0]];
var ListTagsForResourceResponse = [3, n0, _LTFRR, 0, [_Ta], [128 | 0]];
var LookupDeveloperIdentityInput = [
    3,
    n0,
    _LDII,
    0,
    [_IPI, _II, _DUI, _MR, _NT],
    [0, 0, 0, 1, 0],
];
var LookupDeveloperIdentityResponse = [
    3,
    n0,
    _LDIR,
    0,
    [_II, _DUIL, _NT],
    [0, 64 | 0, 0],
];
var MappingRule = [3, n0, _MRa, 0, [_Cl, _MT, _V, _RARN], [0, 0, 0, 0]];
var MergeDeveloperIdentitiesInput = [
    3,
    n0,
    _MDII,
    0,
    [_SUI, _DUIe, _DPN, _IPI],
    [0, 0, 0, 0],
];
var MergeDeveloperIdentitiesResponse = [3, n0, _MDIR, 0, [_II], [0]];
var NotAuthorizedException = [
    -3,
    n0,
    _NAE,
    {
        [_e]: _c,
        [_hE]: 403,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(NotAuthorizedException, NotAuthorizedException$1);
var ResourceConflictException = [
    -3,
    n0,
    _RCE,
    {
        [_e]: _c,
        [_hE]: 409,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ResourceConflictException, ResourceConflictException$1);
var ResourceNotFoundException = [
    -3,
    n0,
    _RNFE,
    {
        [_e]: _c,
        [_hE]: 404,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ResourceNotFoundException, ResourceNotFoundException$1);
var RoleMapping = [
    3,
    n0,
    _RMo,
    0,
    [_Ty, _ARR, _RC],
    [0, 0, () => RulesConfigurationType],
];
var RulesConfigurationType = [3, n0, _RCT, 0, [_Ru], [() => MappingRulesList]];
var SetIdentityPoolRolesInput = [
    3,
    n0,
    _SIPRI,
    0,
    [_IPI, _R, _RM],
    [0, 128 | 0, () => RoleMappingMap],
];
var SetPrincipalTagAttributeMapInput = [
    3,
    n0,
    _SPTAMI,
    0,
    [_IPI, _IPNd, _UD, _PT],
    [0, 0, 2, 128 | 0],
];
var SetPrincipalTagAttributeMapResponse = [
    3,
    n0,
    _SPTAMR,
    0,
    [_IPI, _IPNd, _UD, _PT],
    [0, 0, 2, 128 | 0],
];
var TagResourceInput = [3, n0, _TRI, 0, [_RA, _Ta], [0, 128 | 0]];
var TagResourceResponse = [3, n0, _TRR, 0, [], []];
var TooManyRequestsException = [
    -3,
    n0,
    _TMRE,
    {
        [_e]: _c,
        [_hE]: 429,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(TooManyRequestsException, TooManyRequestsException$1);
var UnlinkDeveloperIdentityInput = [
    3,
    n0,
    _UDII,
    0,
    [_II, _IPI, _DPN, _DUI],
    [0, 0, 0, 0],
];
var UnlinkIdentityInput = [
    3,
    n0,
    _UIIn,
    0,
    [_II, _L, _LTR],
    [0, [() => LoginsMap, 0], 64 | 0],
];
var UnprocessedIdentityId = [3, n0, _UIInp, 0, [_II, _EC], [0, 0]];
var UntagResourceInput = [3, n0, _URI, 0, [_RA, _TK], [0, 64 | 0]];
var UntagResourceResponse = [3, n0, _URR, 0, [], []];
var __Unit = "unit";
var CognitoIdentityServiceException = [-3, _sm, "CognitoIdentityServiceException", 0, [], []];
schema.TypeRegistry.for(_sm).registerError(CognitoIdentityServiceException, CognitoIdentityServiceException$1);
var CognitoIdentityProviderList = [1, n0, _CIPL, 0, () => CognitoIdentityProvider];
var IdentitiesList = [1, n0, _IL, 0, () => IdentityDescription];
var IdentityPoolsList = [1, n0, _IPL, 0, () => IdentityPoolShortDescription];
var MappingRulesList = [1, n0, _MRL, 0, () => MappingRule];
var UnprocessedIdentityIdList = [1, n0, _UIIL, 0, () => UnprocessedIdentityId];
var LoginsMap = [2, n0, _LM, 0, [0, 0], [() => IdentityProviderToken, 0]];
var RoleMappingMap = [2, n0, _RMM, 0, 0, () => RoleMapping];
var CreateIdentityPool = [
    9,
    n0,
    _CIPr,
    0,
    () => CreateIdentityPoolInput,
    () => IdentityPool,
];
var DeleteIdentities = [
    9,
    n0,
    _DI,
    0,
    () => DeleteIdentitiesInput,
    () => DeleteIdentitiesResponse,
];
var DeleteIdentityPool = [9, n0, _DIP, 0, () => DeleteIdentityPoolInput, () => __Unit];
var DescribeIdentity = [
    9,
    n0,
    _DIe,
    0,
    () => DescribeIdentityInput,
    () => IdentityDescription,
];
var DescribeIdentityPool = [
    9,
    n0,
    _DIPe,
    0,
    () => DescribeIdentityPoolInput,
    () => IdentityPool,
];
var GetCredentialsForIdentity = [
    9,
    n0,
    _GCFI,
    0,
    () => GetCredentialsForIdentityInput,
    () => GetCredentialsForIdentityResponse,
];
var GetId = [9, n0, _GI, 0, () => GetIdInput, () => GetIdResponse];
var GetIdentityPoolRoles = [
    9,
    n0,
    _GIPR,
    0,
    () => GetIdentityPoolRolesInput,
    () => GetIdentityPoolRolesResponse,
];
var GetOpenIdToken = [
    9,
    n0,
    _GOIT,
    0,
    () => GetOpenIdTokenInput,
    () => GetOpenIdTokenResponse,
];
var GetOpenIdTokenForDeveloperIdentity = [
    9,
    n0,
    _GOITFDI,
    0,
    () => GetOpenIdTokenForDeveloperIdentityInput,
    () => GetOpenIdTokenForDeveloperIdentityResponse,
];
var GetPrincipalTagAttributeMap = [
    9,
    n0,
    _GPTAM,
    0,
    () => GetPrincipalTagAttributeMapInput,
    () => GetPrincipalTagAttributeMapResponse,
];
var ListIdentities = [
    9,
    n0,
    _LI,
    0,
    () => ListIdentitiesInput,
    () => ListIdentitiesResponse,
];
var ListIdentityPools = [
    9,
    n0,
    _LIP,
    0,
    () => ListIdentityPoolsInput,
    () => ListIdentityPoolsResponse,
];
var ListTagsForResource = [
    9,
    n0,
    _LTFR,
    0,
    () => ListTagsForResourceInput,
    () => ListTagsForResourceResponse,
];
var LookupDeveloperIdentity = [
    9,
    n0,
    _LDI,
    0,
    () => LookupDeveloperIdentityInput,
    () => LookupDeveloperIdentityResponse,
];
var MergeDeveloperIdentities = [
    9,
    n0,
    _MDI,
    0,
    () => MergeDeveloperIdentitiesInput,
    () => MergeDeveloperIdentitiesResponse,
];
var SetIdentityPoolRoles = [
    9,
    n0,
    _SIPR,
    0,
    () => SetIdentityPoolRolesInput,
    () => __Unit,
];
var SetPrincipalTagAttributeMap = [
    9,
    n0,
    _SPTAM,
    0,
    () => SetPrincipalTagAttributeMapInput,
    () => SetPrincipalTagAttributeMapResponse,
];
var TagResource = [9, n0, _TR, 0, () => TagResourceInput, () => TagResourceResponse];
var UnlinkDeveloperIdentity = [
    9,
    n0,
    _UDI,
    0,
    () => UnlinkDeveloperIdentityInput,
    () => __Unit,
];
var UnlinkIdentity = [9, n0, _UI, 0, () => UnlinkIdentityInput, () => __Unit];
var UntagResource = [
    9,
    n0,
    _UR,
    0,
    () => UntagResourceInput,
    () => UntagResourceResponse,
];
var UpdateIdentityPool = [9, n0, _UIP, 0, () => IdentityPool, () => IdentityPool];

class CreateIdentityPoolCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "CreateIdentityPool", {})
    .n("CognitoIdentityClient", "CreateIdentityPoolCommand")
    .sc(CreateIdentityPool)
    .build() {
}

class DeleteIdentitiesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "DeleteIdentities", {})
    .n("CognitoIdentityClient", "DeleteIdentitiesCommand")
    .sc(DeleteIdentities)
    .build() {
}

class DeleteIdentityPoolCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "DeleteIdentityPool", {})
    .n("CognitoIdentityClient", "DeleteIdentityPoolCommand")
    .sc(DeleteIdentityPool)
    .build() {
}

class DescribeIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "DescribeIdentity", {})
    .n("CognitoIdentityClient", "DescribeIdentityCommand")
    .sc(DescribeIdentity)
    .build() {
}

class DescribeIdentityPoolCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "DescribeIdentityPool", {})
    .n("CognitoIdentityClient", "DescribeIdentityPoolCommand")
    .sc(DescribeIdentityPool)
    .build() {
}

class GetCredentialsForIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetCredentialsForIdentity", {})
    .n("CognitoIdentityClient", "GetCredentialsForIdentityCommand")
    .sc(GetCredentialsForIdentity)
    .build() {
}

class GetIdCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetId", {})
    .n("CognitoIdentityClient", "GetIdCommand")
    .sc(GetId)
    .build() {
}

class GetIdentityPoolRolesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetIdentityPoolRoles", {})
    .n("CognitoIdentityClient", "GetIdentityPoolRolesCommand")
    .sc(GetIdentityPoolRoles)
    .build() {
}

class GetOpenIdTokenCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetOpenIdToken", {})
    .n("CognitoIdentityClient", "GetOpenIdTokenCommand")
    .sc(GetOpenIdToken)
    .build() {
}

class GetOpenIdTokenForDeveloperIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetOpenIdTokenForDeveloperIdentity", {})
    .n("CognitoIdentityClient", "GetOpenIdTokenForDeveloperIdentityCommand")
    .sc(GetOpenIdTokenForDeveloperIdentity)
    .build() {
}

class GetPrincipalTagAttributeMapCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "GetPrincipalTagAttributeMap", {})
    .n("CognitoIdentityClient", "GetPrincipalTagAttributeMapCommand")
    .sc(GetPrincipalTagAttributeMap)
    .build() {
}

class ListIdentitiesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "ListIdentities", {})
    .n("CognitoIdentityClient", "ListIdentitiesCommand")
    .sc(ListIdentities)
    .build() {
}

class ListIdentityPoolsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "ListIdentityPools", {})
    .n("CognitoIdentityClient", "ListIdentityPoolsCommand")
    .sc(ListIdentityPools)
    .build() {
}

class ListTagsForResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "ListTagsForResource", {})
    .n("CognitoIdentityClient", "ListTagsForResourceCommand")
    .sc(ListTagsForResource)
    .build() {
}

class LookupDeveloperIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "LookupDeveloperIdentity", {})
    .n("CognitoIdentityClient", "LookupDeveloperIdentityCommand")
    .sc(LookupDeveloperIdentity)
    .build() {
}

class MergeDeveloperIdentitiesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "MergeDeveloperIdentities", {})
    .n("CognitoIdentityClient", "MergeDeveloperIdentitiesCommand")
    .sc(MergeDeveloperIdentities)
    .build() {
}

class SetIdentityPoolRolesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "SetIdentityPoolRoles", {})
    .n("CognitoIdentityClient", "SetIdentityPoolRolesCommand")
    .sc(SetIdentityPoolRoles)
    .build() {
}

class SetPrincipalTagAttributeMapCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "SetPrincipalTagAttributeMap", {})
    .n("CognitoIdentityClient", "SetPrincipalTagAttributeMapCommand")
    .sc(SetPrincipalTagAttributeMap)
    .build() {
}

class TagResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "TagResource", {})
    .n("CognitoIdentityClient", "TagResourceCommand")
    .sc(TagResource)
    .build() {
}

class UnlinkDeveloperIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "UnlinkDeveloperIdentity", {})
    .n("CognitoIdentityClient", "UnlinkDeveloperIdentityCommand")
    .sc(UnlinkDeveloperIdentity)
    .build() {
}

class UnlinkIdentityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "UnlinkIdentity", {})
    .n("CognitoIdentityClient", "UnlinkIdentityCommand")
    .sc(UnlinkIdentity)
    .build() {
}

class UntagResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "UntagResource", {})
    .n("CognitoIdentityClient", "UntagResourceCommand")
    .sc(UntagResource)
    .build() {
}

class UpdateIdentityPoolCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSCognitoIdentityService", "UpdateIdentityPool", {})
    .n("CognitoIdentityClient", "UpdateIdentityPoolCommand")
    .sc(UpdateIdentityPool)
    .build() {
}

const commands = {
    CreateIdentityPoolCommand,
    DeleteIdentitiesCommand,
    DeleteIdentityPoolCommand,
    DescribeIdentityCommand,
    DescribeIdentityPoolCommand,
    GetCredentialsForIdentityCommand,
    GetIdCommand,
    GetIdentityPoolRolesCommand,
    GetOpenIdTokenCommand,
    GetOpenIdTokenForDeveloperIdentityCommand,
    GetPrincipalTagAttributeMapCommand,
    ListIdentitiesCommand,
    ListIdentityPoolsCommand,
    ListTagsForResourceCommand,
    LookupDeveloperIdentityCommand,
    MergeDeveloperIdentitiesCommand,
    SetIdentityPoolRolesCommand,
    SetPrincipalTagAttributeMapCommand,
    TagResourceCommand,
    UnlinkDeveloperIdentityCommand,
    UnlinkIdentityCommand,
    UntagResourceCommand,
    UpdateIdentityPoolCommand,
};
class CognitoIdentity extends CognitoIdentityClient {
}
smithyClient.createAggregatedClient(commands, CognitoIdentity);

const paginateListIdentityPools = core.createPaginator(CognitoIdentityClient, ListIdentityPoolsCommand, "NextToken", "NextToken", "MaxResults");

const AmbiguousRoleResolutionType = {
    AUTHENTICATED_ROLE: "AuthenticatedRole",
    DENY: "Deny",
};
const ErrorCode = {
    ACCESS_DENIED: "AccessDenied",
    INTERNAL_SERVER_ERROR: "InternalServerError",
};
const MappingRuleMatchType = {
    CONTAINS: "Contains",
    EQUALS: "Equals",
    NOT_EQUAL: "NotEqual",
    STARTS_WITH: "StartsWith",
};
const RoleMappingType = {
    RULES: "Rules",
    TOKEN: "Token",
};

Object.defineProperty(exports, "$Command", {
    enumerable: true,
    get: function () { return smithyClient.Command; }
});
Object.defineProperty(exports, "__Client", {
    enumerable: true,
    get: function () { return smithyClient.Client; }
});
exports.AmbiguousRoleResolutionType = AmbiguousRoleResolutionType;
exports.CognitoIdentity = CognitoIdentity;
exports.CognitoIdentityClient = CognitoIdentityClient;
exports.CognitoIdentityServiceException = CognitoIdentityServiceException$1;
exports.ConcurrentModificationException = ConcurrentModificationException$1;
exports.CreateIdentityPoolCommand = CreateIdentityPoolCommand;
exports.DeleteIdentitiesCommand = DeleteIdentitiesCommand;
exports.DeleteIdentityPoolCommand = DeleteIdentityPoolCommand;
exports.DescribeIdentityCommand = DescribeIdentityCommand;
exports.DescribeIdentityPoolCommand = DescribeIdentityPoolCommand;
exports.DeveloperUserAlreadyRegisteredException = DeveloperUserAlreadyRegisteredException$1;
exports.ErrorCode = ErrorCode;
exports.ExternalServiceException = ExternalServiceException$1;
exports.GetCredentialsForIdentityCommand = GetCredentialsForIdentityCommand;
exports.GetIdCommand = GetIdCommand;
exports.GetIdentityPoolRolesCommand = GetIdentityPoolRolesCommand;
exports.GetOpenIdTokenCommand = GetOpenIdTokenCommand;
exports.GetOpenIdTokenForDeveloperIdentityCommand = GetOpenIdTokenForDeveloperIdentityCommand;
exports.GetPrincipalTagAttributeMapCommand = GetPrincipalTagAttributeMapCommand;
exports.InternalErrorException = InternalErrorException$1;
exports.InvalidIdentityPoolConfigurationException = InvalidIdentityPoolConfigurationException$1;
exports.InvalidParameterException = InvalidParameterException$1;
exports.LimitExceededException = LimitExceededException$1;
exports.ListIdentitiesCommand = ListIdentitiesCommand;
exports.ListIdentityPoolsCommand = ListIdentityPoolsCommand;
exports.ListTagsForResourceCommand = ListTagsForResourceCommand;
exports.LookupDeveloperIdentityCommand = LookupDeveloperIdentityCommand;
exports.MappingRuleMatchType = MappingRuleMatchType;
exports.MergeDeveloperIdentitiesCommand = MergeDeveloperIdentitiesCommand;
exports.NotAuthorizedException = NotAuthorizedException$1;
exports.ResourceConflictException = ResourceConflictException$1;
exports.ResourceNotFoundException = ResourceNotFoundException$1;
exports.RoleMappingType = RoleMappingType;
exports.SetIdentityPoolRolesCommand = SetIdentityPoolRolesCommand;
exports.SetPrincipalTagAttributeMapCommand = SetPrincipalTagAttributeMapCommand;
exports.TagResourceCommand = TagResourceCommand;
exports.TooManyRequestsException = TooManyRequestsException$1;
exports.UnlinkDeveloperIdentityCommand = UnlinkDeveloperIdentityCommand;
exports.UnlinkIdentityCommand = UnlinkIdentityCommand;
exports.UntagResourceCommand = UntagResourceCommand;
exports.UpdateIdentityPoolCommand = UpdateIdentityPoolCommand;
exports.paginateListIdentityPools = paginateListIdentityPools;
