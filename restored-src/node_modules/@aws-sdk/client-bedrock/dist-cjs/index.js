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
        defaultSigningName: "bedrock",
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
    let _token = runtimeConfig.token;
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
        setToken(token) {
            _token = token;
        },
        token() {
            return _token;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
        token: config.token(),
    };
};

const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(regionConfigResolver.getAwsRegionExtensionConfiguration(runtimeConfig), smithyClient.getDefaultExtensionConfiguration(runtimeConfig), protocolHttp.getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, regionConfigResolver.resolveAwsRegionExtensionConfiguration(extensionConfiguration), smithyClient.resolveDefaultRuntimeConfig(extensionConfiguration), protocolHttp.resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

class BedrockClient extends smithyClient.Client {
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
            httpAuthSchemeParametersProvider: httpAuthSchemeProvider.defaultBedrockHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new core.DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
                "smithy.api#httpBearerAuth": config.token,
            }),
        }));
        this.middlewareStack.use(core.getHttpSigningPlugin(this.config));
    }
    destroy() {
        super.destroy();
    }
}

let BedrockServiceException$1 = class BedrockServiceException extends smithyClient.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, BedrockServiceException.prototype);
    }
};

let AccessDeniedException$1 = class AccessDeniedException extends BedrockServiceException$1 {
    name = "AccessDeniedException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "AccessDeniedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AccessDeniedException.prototype);
    }
};
let InternalServerException$1 = class InternalServerException extends BedrockServiceException$1 {
    name = "InternalServerException";
    $fault = "server";
    constructor(opts) {
        super({
            name: "InternalServerException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalServerException.prototype);
    }
};
let ResourceNotFoundException$1 = class ResourceNotFoundException extends BedrockServiceException$1 {
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
let ThrottlingException$1 = class ThrottlingException extends BedrockServiceException$1 {
    name = "ThrottlingException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ThrottlingException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ThrottlingException.prototype);
    }
};
let ValidationException$1 = class ValidationException extends BedrockServiceException$1 {
    name = "ValidationException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ValidationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ValidationException.prototype);
    }
};
let ConflictException$1 = class ConflictException extends BedrockServiceException$1 {
    name = "ConflictException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ConflictException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ConflictException.prototype);
    }
};
let ServiceQuotaExceededException$1 = class ServiceQuotaExceededException extends BedrockServiceException$1 {
    name = "ServiceQuotaExceededException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ServiceQuotaExceededException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ServiceQuotaExceededException.prototype);
    }
};
let TooManyTagsException$1 = class TooManyTagsException extends BedrockServiceException$1 {
    name = "TooManyTagsException";
    $fault = "client";
    resourceName;
    constructor(opts) {
        super({
            name: "TooManyTagsException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, TooManyTagsException.prototype);
        this.resourceName = opts.resourceName;
    }
};
let ResourceInUseException$1 = class ResourceInUseException extends BedrockServiceException$1 {
    name = "ResourceInUseException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceInUseException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceInUseException.prototype);
    }
};
let ServiceUnavailableException$1 = class ServiceUnavailableException extends BedrockServiceException$1 {
    name = "ServiceUnavailableException";
    $fault = "server";
    constructor(opts) {
        super({
            name: "ServiceUnavailableException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, ServiceUnavailableException.prototype);
    }
};

const _AA = "AgreementAvailability";
const _ADE = "AccessDeniedException";
const _AEC = "AutomatedEvaluationConfig";
const _AECM = "AutomatedEvaluationCustomMetrics";
const _AECMC = "AutomatedEvaluationCustomMetricConfig";
const _AECMS = "AutomatedEvaluationCustomMetricSource";
const _ARCDSL = "AutomatedReasoningCheckDifferenceScenarioList";
const _ARCF = "AutomatedReasoningCheckFinding";
const _ARCFL = "AutomatedReasoningCheckFindingList";
const _ARCIF = "AutomatedReasoningCheckImpossibleFinding";
const _ARCIFu = "AutomatedReasoningCheckInvalidFinding";
const _ARCITR = "AutomatedReasoningCheckInputTextReference";
const _ARCITRL = "AutomatedReasoningCheckInputTextReferenceList";
const _ARCLW = "AutomatedReasoningCheckLogicWarning";
const _ARCNTF = "AutomatedReasoningCheckNoTranslationsFinding";
const _ARCR = "AutomatedReasoningCheckRule";
const _ARCRL = "AutomatedReasoningCheckRuleList";
const _ARCS = "AutomatedReasoningCheckScenario";
const _ARCSF = "AutomatedReasoningCheckSatisfiableFinding";
const _ARCT = "AutomatedReasoningCheckTranslation";
const _ARCTAF = "AutomatedReasoningCheckTranslationAmbiguousFinding";
const _ARCTCF = "AutomatedReasoningCheckTooComplexFinding";
const _ARCTL = "AutomatedReasoningCheckTranslationList";
const _ARCTO = "AutomatedReasoningCheckTranslationOption";
const _ARCTOL = "AutomatedReasoningCheckTranslationOptionList";
const _ARCVF = "AutomatedReasoningCheckValidFinding";
const _ARLS = "AutomatedReasoningLogicStatement";
const _ARLSC = "AutomatedReasoningLogicStatementContent";
const _ARLSL = "AutomatedReasoningLogicStatementList";
const _ARNLSC = "AutomatedReasoningNaturalLanguageStatementContent";
const _ARPA = "AutomatedReasoningPolicyAnnotation";
const _ARPAFNL = "AutomatedReasoningPolicyAnnotationFeedbackNaturalLanguage";
const _ARPAIC = "AutomatedReasoningPolicyAnnotationIngestContent";
const _ARPAL = "AutomatedReasoningPolicyAnnotationList";
const _ARPARA = "AutomatedReasoningPolicyAddRuleAnnotation";
const _ARPARFNLA = "AutomatedReasoningPolicyAddRuleFromNaturalLanguageAnnotation";
const _ARPARM = "AutomatedReasoningPolicyAddRuleMutation";
const _ARPARNL = "AutomatedReasoningPolicyAnnotationRuleNaturalLanguage";
const _ARPATA = "AutomatedReasoningPolicyAddTypeAnnotation";
const _ARPATM = "AutomatedReasoningPolicyAddTypeMutation";
const _ARPATV = "AutomatedReasoningPolicyAddTypeValue";
const _ARPAVA = "AutomatedReasoningPolicyAddVariableAnnotation";
const _ARPAVM = "AutomatedReasoningPolicyAddVariableMutation";
const _ARPBDB = "AutomatedReasoningPolicyBuildDocumentBlob";
const _ARPBDD = "AutomatedReasoningPolicyBuildDocumentDescription";
const _ARPBDN = "AutomatedReasoningPolicyBuildDocumentName";
const _ARPBL = "AutomatedReasoningPolicyBuildLog";
const _ARPBLE = "AutomatedReasoningPolicyBuildLogEntry";
const _ARPBLEL = "AutomatedReasoningPolicyBuildLogEntryList";
const _ARPBRA = "AutomatedReasoningPolicyBuildResultAssets";
const _ARPBS = "AutomatedReasoningPolicyBuildStep";
const _ARPBSC = "AutomatedReasoningPolicyBuildStepContext";
const _ARPBSL = "AutomatedReasoningPolicyBuildStepList";
const _ARPBSM = "AutomatedReasoningPolicyBuildStepMessage";
const _ARPBSML = "AutomatedReasoningPolicyBuildStepMessageList";
const _ARPBWD = "AutomatedReasoningPolicyBuildWorkflowDocument";
const _ARPBWDL = "AutomatedReasoningPolicyBuildWorkflowDocumentList";
const _ARPBWRC = "AutomatedReasoningPolicyBuildWorkflowRepairContent";
const _ARPBWS = "AutomatedReasoningPolicyBuildWorkflowSource";
const _ARPBWSu = "AutomatedReasoningPolicyBuildWorkflowSummary";
const _ARPBWSut = "AutomatedReasoningPolicyBuildWorkflowSummaries";
const _ARPD = "AutomatedReasoningPolicyDescription";
const _ARPDE = "AutomatedReasoningPolicyDefinitionElement";
const _ARPDQR = "AutomatedReasoningPolicyDefinitionQualityReport";
const _ARPDR = "AutomatedReasoningPolicyDefinitionRule";
const _ARPDRA = "AutomatedReasoningPolicyDeleteRuleAnnotation";
const _ARPDRAE = "AutomatedReasoningPolicyDefinitionRuleAlternateExpression";
const _ARPDRE = "AutomatedReasoningPolicyDefinitionRuleExpression";
const _ARPDRL = "AutomatedReasoningPolicyDefinitionRuleList";
const _ARPDRM = "AutomatedReasoningPolicyDeleteRuleMutation";
const _ARPDRS = "AutomatedReasoningPolicyDisjointRuleSet";
const _ARPDRSL = "AutomatedReasoningPolicyDisjointRuleSetList";
const _ARPDT = "AutomatedReasoningPolicyDefinitionType";
const _ARPDTA = "AutomatedReasoningPolicyDeleteTypeAnnotation";
const _ARPDTD = "AutomatedReasoningPolicyDefinitionTypeDescription";
const _ARPDTL = "AutomatedReasoningPolicyDefinitionTypeList";
const _ARPDTM = "AutomatedReasoningPolicyDeleteTypeMutation";
const _ARPDTN = "AutomatedReasoningPolicyDefinitionTypeName";
const _ARPDTNL = "AutomatedReasoningPolicyDefinitionTypeNameList";
const _ARPDTV = "AutomatedReasoningPolicyDefinitionTypeValue";
const _ARPDTVD = "AutomatedReasoningPolicyDefinitionTypeValueDescription";
const _ARPDTVL = "AutomatedReasoningPolicyDefinitionTypeValueList";
const _ARPDTVP = "AutomatedReasoningPolicyDefinitionTypeValuePair";
const _ARPDTVPL = "AutomatedReasoningPolicyDefinitionTypeValuePairList";
const _ARPDTVu = "AutomatedReasoningPolicyDeleteTypeValue";
const _ARPDV = "AutomatedReasoningPolicyDefinitionVariable";
const _ARPDVA = "AutomatedReasoningPolicyDeleteVariableAnnotation";
const _ARPDVD = "AutomatedReasoningPolicyDefinitionVariableDescription";
const _ARPDVL = "AutomatedReasoningPolicyDefinitionVariableList";
const _ARPDVM = "AutomatedReasoningPolicyDeleteVariableMutation";
const _ARPDVN = "AutomatedReasoningPolicyDefinitionVariableName";
const _ARPDVNL = "AutomatedReasoningPolicyDefinitionVariableNameList";
const _ARPDu = "AutomatedReasoningPolicyDefinition";
const _ARPGTC = "AutomatedReasoningPolicyGeneratedTestCase";
const _ARPGTCL = "AutomatedReasoningPolicyGeneratedTestCaseList";
const _ARPGTCu = "AutomatedReasoningPolicyGeneratedTestCases";
const _ARPICA = "AutomatedReasoningPolicyIngestContentAnnotation";
const _ARPM = "AutomatedReasoningPolicyMutation";
const _ARPN = "AutomatedReasoningPolicyName";
const _ARPP = "AutomatedReasoningPolicyPlanning";
const _ARPS = "AutomatedReasoningPolicyScenario";
const _ARPSAE = "AutomatedReasoningPolicyScenarioAlternateExpression";
const _ARPSE = "AutomatedReasoningPolicyScenarioExpression";
const _ARPSu = "AutomatedReasoningPolicySummary";
const _ARPSut = "AutomatedReasoningPolicySummaries";
const _ARPTC = "AutomatedReasoningPolicyTestCase";
const _ARPTCL = "AutomatedReasoningPolicyTestCaseList";
const _ARPTGC = "AutomatedReasoningPolicyTestGuardContent";
const _ARPTL = "AutomatedReasoningPolicyTestList";
const _ARPTQC = "AutomatedReasoningPolicyTestQueryContent";
const _ARPTR = "AutomatedReasoningPolicyTestResult";
const _ARPTVA = "AutomatedReasoningPolicyTypeValueAnnotation";
const _ARPTVAL = "AutomatedReasoningPolicyTypeValueAnnotationList";
const _ARPUFRFA = "AutomatedReasoningPolicyUpdateFromRuleFeedbackAnnotation";
const _ARPUFSFA = "AutomatedReasoningPolicyUpdateFromScenarioFeedbackAnnotation";
const _ARPURA = "AutomatedReasoningPolicyUpdateRuleAnnotation";
const _ARPURM = "AutomatedReasoningPolicyUpdateRuleMutation";
const _ARPUTA = "AutomatedReasoningPolicyUpdateTypeAnnotation";
const _ARPUTM = "AutomatedReasoningPolicyUpdateTypeMutation";
const _ARPUTV = "AutomatedReasoningPolicyUpdateTypeValue";
const _ARPUVA = "AutomatedReasoningPolicyUpdateVariableAnnotation";
const _ARPUVM = "AutomatedReasoningPolicyUpdateVariableMutation";
const _ARPWTC = "AutomatedReasoningPolicyWorkflowTypeContent";
const _BCB = "ByteContentBlob";
const _BCD = "ByteContentDoc";
const _BDEJ = "BatchDeleteEvaluationJob";
const _BDEJE = "BatchDeleteEvaluationJobError";
const _BDEJEa = "BatchDeleteEvaluationJobErrors";
const _BDEJI = "BatchDeleteEvaluationJobItem";
const _BDEJIa = "BatchDeleteEvaluationJobItems";
const _BDEJR = "BatchDeleteEvaluationJobRequest";
const _BDEJRa = "BatchDeleteEvaluationJobResponse";
const _BEM = "BedrockEvaluatorModel";
const _BEMe = "BedrockEvaluatorModels";
const _CARP = "CreateAutomatedReasoningPolicy";
const _CARPBW = "CancelAutomatedReasoningPolicyBuildWorkflow";
const _CARPBWR = "CancelAutomatedReasoningPolicyBuildWorkflowRequest";
const _CARPBWRa = "CancelAutomatedReasoningPolicyBuildWorkflowResponse";
const _CARPR = "CreateAutomatedReasoningPolicyRequest";
const _CARPRr = "CreateAutomatedReasoningPolicyResponse";
const _CARPTC = "CreateAutomatedReasoningPolicyTestCase";
const _CARPTCR = "CreateAutomatedReasoningPolicyTestCaseRequest";
const _CARPTCRr = "CreateAutomatedReasoningPolicyTestCaseResponse";
const _CARPV = "CreateAutomatedReasoningPolicyVersion";
const _CARPVR = "CreateAutomatedReasoningPolicyVersionRequest";
const _CARPVRr = "CreateAutomatedReasoningPolicyVersionResponse";
const _CC = "CustomizationConfig";
const _CCM = "CreateCustomModel";
const _CCMD = "CreateCustomModelDeployment";
const _CCMDR = "CreateCustomModelDeploymentRequest";
const _CCMDRr = "CreateCustomModelDeploymentResponse";
const _CCMR = "CreateCustomModelRequest";
const _CCMRr = "CreateCustomModelResponse";
const _CE = "ConflictException";
const _CEJ = "CreateEvaluationJob";
const _CEJR = "CreateEvaluationJobRequest";
const _CEJRr = "CreateEvaluationJobResponse";
const _CFMA = "CreateFoundationModelAgreement";
const _CFMAR = "CreateFoundationModelAgreementRequest";
const _CFMARr = "CreateFoundationModelAgreementResponse";
const _CG = "CreateGuardrail";
const _CGR = "CreateGuardrailRequest";
const _CGRr = "CreateGuardrailResponse";
const _CGV = "CreateGuardrailVersion";
const _CGVR = "CreateGuardrailVersionRequest";
const _CGVRr = "CreateGuardrailVersionResponse";
const _CIP = "CreateInferenceProfile";
const _CIPR = "CreateInferenceProfileRequest";
const _CIPRr = "CreateInferenceProfileResponse";
const _CMBEM = "CustomMetricBedrockEvaluatorModel";
const _CMBEMu = "CustomMetricBedrockEvaluatorModels";
const _CMCJ = "CreateModelCopyJob";
const _CMCJR = "CreateModelCopyJobRequest";
const _CMCJRr = "CreateModelCopyJobResponse";
const _CMCJRre = "CreateModelCustomizationJobRequest";
const _CMCJRrea = "CreateModelCustomizationJobResponse";
const _CMCJr = "CreateModelCustomizationJob";
const _CMD = "CustomMetricDefinition";
const _CMDS = "CustomModelDeploymentSummary";
const _CMDSL = "CustomModelDeploymentSummaryList";
const _CMEMC = "CustomMetricEvaluatorModelConfig";
const _CMIJ = "CreateModelImportJob";
const _CMIJR = "CreateModelImportJobRequest";
const _CMIJRr = "CreateModelImportJobResponse";
const _CMIJRre = "CreateModelInvocationJobRequest";
const _CMIJRrea = "CreateModelInvocationJobResponse";
const _CMIJr = "CreateModelInvocationJob";
const _CMME = "CreateMarketplaceModelEndpoint";
const _CMMER = "CreateMarketplaceModelEndpointRequest";
const _CMMERr = "CreateMarketplaceModelEndpointResponse";
const _CMS = "CustomModelSummary";
const _CMSL = "CustomModelSummaryList";
const _CMU = "CustomModelUnits";
const _CPMT = "CreateProvisionedModelThroughput";
const _CPMTR = "CreateProvisionedModelThroughputRequest";
const _CPMTRr = "CreateProvisionedModelThroughputResponse";
const _CPR = "CreatePromptRouter";
const _CPRR = "CreatePromptRouterRequest";
const _CPRRr = "CreatePromptRouterResponse";
const _CWC = "CloudWatchConfig";
const _DARP = "DeleteAutomatedReasoningPolicy";
const _DARPBW = "DeleteAutomatedReasoningPolicyBuildWorkflow";
const _DARPBWR = "DeleteAutomatedReasoningPolicyBuildWorkflowRequest";
const _DARPBWRe = "DeleteAutomatedReasoningPolicyBuildWorkflowResponse";
const _DARPR = "DeleteAutomatedReasoningPolicyRequest";
const _DARPRe = "DeleteAutomatedReasoningPolicyResponse";
const _DARPTC = "DeleteAutomatedReasoningPolicyTestCase";
const _DARPTCR = "DeleteAutomatedReasoningPolicyTestCaseRequest";
const _DARPTCRe = "DeleteAutomatedReasoningPolicyTestCaseResponse";
const _DC = "DistillationConfig";
const _DCM = "DeleteCustomModel";
const _DCMD = "DeleteCustomModelDeployment";
const _DCMDR = "DeleteCustomModelDeploymentRequest";
const _DCMDRe = "DeleteCustomModelDeploymentResponse";
const _DCMR = "DeleteCustomModelRequest";
const _DCMRe = "DeleteCustomModelResponse";
const _DFMA = "DeleteFoundationModelAgreement";
const _DFMAR = "DeleteFoundationModelAgreementRequest";
const _DFMARe = "DeleteFoundationModelAgreementResponse";
const _DG = "DeleteGuardrail";
const _DGR = "DeleteGuardrailRequest";
const _DGRe = "DeleteGuardrailResponse";
const _DIM = "DeleteImportedModel";
const _DIMR = "DeleteImportedModelRequest";
const _DIMRe = "DeleteImportedModelResponse";
const _DIP = "DeleteInferenceProfile";
const _DIPR = "DeleteInferenceProfileRequest";
const _DIPRe = "DeleteInferenceProfileResponse";
const _DMILC = "DeleteModelInvocationLoggingConfiguration";
const _DMILCR = "DeleteModelInvocationLoggingConfigurationRequest";
const _DMILCRe = "DeleteModelInvocationLoggingConfigurationResponse";
const _DMME = "DeleteMarketplaceModelEndpoint";
const _DMMER = "DeleteMarketplaceModelEndpointRequest";
const _DMMERe = "DeleteMarketplaceModelEndpointResponse";
const _DMMERer = "DeregisterMarketplaceModelEndpointRequest";
const _DMMERere = "DeregisterMarketplaceModelEndpointResponse";
const _DMMEe = "DeregisterMarketplaceModelEndpoint";
const _DPD = "DataProcessingDetails";
const _DPMT = "DeleteProvisionedModelThroughput";
const _DPMTR = "DeleteProvisionedModelThroughputRequest";
const _DPMTRe = "DeleteProvisionedModelThroughputResponse";
const _DPR = "DimensionalPriceRate";
const _DPRR = "DeletePromptRouterRequest";
const _DPRRe = "DeletePromptRouterResponse";
const _DPRe = "DeletePromptRouter";
const _EARPV = "ExportAutomatedReasoningPolicyVersion";
const _EARPVR = "ExportAutomatedReasoningPolicyVersionRequest";
const _EARPVRx = "ExportAutomatedReasoningPolicyVersionResponse";
const _EBM = "EvaluationBedrockModel";
const _EC = "EndpointConfig";
const _ECv = "EvaluationConfig";
const _ED = "EvaluationDataset";
const _EDL = "EvaluationDatasetLocation";
const _EDMC = "EvaluationDatasetMetricConfig";
const _EDMCv = "EvaluationDatasetMetricConfigs";
const _EDN = "EvaluationDatasetName";
const _EIC = "EvaluationInferenceConfig";
const _EICS = "EvaluationInferenceConfigSummary";
const _EJD = "EvaluationJobDescription";
const _EJI = "EvaluationJobIdentifier";
const _EJIv = "EvaluationJobIdentifiers";
const _EMC = "EvaluationModelConfigs";
const _EMCS = "EvaluationModelConfigSummary";
const _EMCv = "EvaluationModelConfig";
const _EMCva = "EvaluatorModelConfig";
const _EMD = "EvaluationMetricDescription";
const _EMIP = "EvaluationModelInferenceParams";
const _EMN = "EvaluationMetricName";
const _EMNv = "EvaluationMetricNames";
const _EODC = "EvaluationOutputDataConfig";
const _EPIS = "EvaluationPrecomputedInferenceSource";
const _EPRAGSC = "EvaluationPrecomputedRetrieveAndGenerateSourceConfig";
const _EPRSC = "EvaluationPrecomputedRetrieveSourceConfig";
const _EPRSCv = "EvaluationPrecomputedRagSourceConfig";
const _ERCS = "EvaluationRagConfigSummary";
const _ES = "EvaluationSummary";
const _ESGC = "ExternalSourcesGenerationConfiguration";
const _ESRAGC = "ExternalSourcesRetrieveAndGenerateConfiguration";
const _ESv = "EvaluationSummaries";
const _ESx = "ExternalSource";
const _ESxt = "ExternalSources";
const _FA = "FilterAttribute";
const _FFR = "FieldForReranking";
const _FFRi = "FieldsForReranking";
const _FMD = "FoundationModelDetails";
const _FML = "FoundationModelLifecycle";
const _FMS = "FoundationModelSummary";
const _FMSL = "FoundationModelSummaryList";
const _GARP = "GuardrailAutomatedReasoningPolicy";
const _GARPA = "GetAutomatedReasoningPolicyAnnotations";
const _GARPAR = "GetAutomatedReasoningPolicyAnnotationsRequest";
const _GARPARe = "GetAutomatedReasoningPolicyAnnotationsResponse";
const _GARPBW = "GetAutomatedReasoningPolicyBuildWorkflow";
const _GARPBWR = "GetAutomatedReasoningPolicyBuildWorkflowRequest";
const _GARPBWRA = "GetAutomatedReasoningPolicyBuildWorkflowResultAssets";
const _GARPBWRAR = "GetAutomatedReasoningPolicyBuildWorkflowResultAssetsRequest";
const _GARPBWRARe = "GetAutomatedReasoningPolicyBuildWorkflowResultAssetsResponse";
const _GARPBWRe = "GetAutomatedReasoningPolicyBuildWorkflowResponse";
const _GARPC = "GuardrailAutomatedReasoningPolicyConfig";
const _GARPNS = "GetAutomatedReasoningPolicyNextScenario";
const _GARPNSR = "GetAutomatedReasoningPolicyNextScenarioRequest";
const _GARPNSRe = "GetAutomatedReasoningPolicyNextScenarioResponse";
const _GARPR = "GetAutomatedReasoningPolicyRequest";
const _GARPRe = "GetAutomatedReasoningPolicyResponse";
const _GARPTC = "GetAutomatedReasoningPolicyTestCase";
const _GARPTCR = "GetAutomatedReasoningPolicyTestCaseRequest";
const _GARPTCRe = "GetAutomatedReasoningPolicyTestCaseResponse";
const _GARPTR = "GetAutomatedReasoningPolicyTestResult";
const _GARPTRR = "GetAutomatedReasoningPolicyTestResultRequest";
const _GARPTRRe = "GetAutomatedReasoningPolicyTestResultResponse";
const _GARPe = "GetAutomatedReasoningPolicy";
const _GBM = "GuardrailBlockedMessaging";
const _GC = "GenerationConfiguration";
const _GCF = "GuardrailContentFilter";
const _GCFA = "GuardrailContentFilterAction";
const _GCFC = "GuardrailContentFilterConfig";
const _GCFCu = "GuardrailContentFiltersConfig";
const _GCFT = "GuardrailContentFiltersTier";
const _GCFTC = "GuardrailContentFiltersTierConfig";
const _GCFTN = "GuardrailContentFiltersTierName";
const _GCFu = "GuardrailContentFilters";
const _GCGA = "GuardrailContextualGroundingAction";
const _GCGF = "GuardrailContextualGroundingFilter";
const _GCGFC = "GuardrailContextualGroundingFilterConfig";
const _GCGFCu = "GuardrailContextualGroundingFiltersConfig";
const _GCGFu = "GuardrailContextualGroundingFilters";
const _GCGP = "GuardrailContextualGroundingPolicy";
const _GCGPC = "GuardrailContextualGroundingPolicyConfig";
const _GCM = "GetCustomModel";
const _GCMD = "GetCustomModelDeployment";
const _GCMDR = "GetCustomModelDeploymentRequest";
const _GCMDRe = "GetCustomModelDeploymentResponse";
const _GCMR = "GetCustomModelRequest";
const _GCMRe = "GetCustomModelResponse";
const _GCP = "GuardrailContentPolicy";
const _GCPC = "GuardrailContentPolicyConfig";
const _GCRC = "GuardrailCrossRegionConfig";
const _GCRD = "GuardrailCrossRegionDetails";
const _GCu = "GuardrailConfiguration";
const _GD = "GuardrailDescription";
const _GEJ = "GetEvaluationJob";
const _GEJR = "GetEvaluationJobRequest";
const _GEJRe = "GetEvaluationJobResponse";
const _GFM = "GetFoundationModel";
const _GFMA = "GetFoundationModelAvailability";
const _GFMAR = "GetFoundationModelAvailabilityRequest";
const _GFMARe = "GetFoundationModelAvailabilityResponse";
const _GFMR = "GetFoundationModelRequest";
const _GFMRe = "GetFoundationModelResponse";
const _GFR = "GuardrailFailureRecommendation";
const _GFRu = "GuardrailFailureRecommendations";
const _GG = "GetGuardrail";
const _GGR = "GetGuardrailRequest";
const _GGRe = "GetGuardrailResponse";
const _GIM = "GetImportedModel";
const _GIMR = "GetImportedModelRequest";
const _GIMRe = "GetImportedModelResponse";
const _GIP = "GetInferenceProfile";
const _GIPR = "GetInferenceProfileRequest";
const _GIPRe = "GetInferenceProfileResponse";
const _GM = "GuardrailModality";
const _GMCJ = "GetModelCopyJob";
const _GMCJR = "GetModelCopyJobRequest";
const _GMCJRe = "GetModelCopyJobResponse";
const _GMCJRet = "GetModelCustomizationJobRequest";
const _GMCJReto = "GetModelCustomizationJobResponse";
const _GMCJe = "GetModelCustomizationJob";
const _GMIJ = "GetModelImportJob";
const _GMIJR = "GetModelImportJobRequest";
const _GMIJRe = "GetModelImportJobResponse";
const _GMIJRet = "GetModelInvocationJobRequest";
const _GMIJReto = "GetModelInvocationJobResponse";
const _GMIJe = "GetModelInvocationJob";
const _GMILC = "GetModelInvocationLoggingConfiguration";
const _GMILCR = "GetModelInvocationLoggingConfigurationRequest";
const _GMILCRe = "GetModelInvocationLoggingConfigurationResponse";
const _GMME = "GetMarketplaceModelEndpoint";
const _GMMER = "GetMarketplaceModelEndpointRequest";
const _GMMERe = "GetMarketplaceModelEndpointResponse";
const _GMW = "GuardrailManagedWords";
const _GMWC = "GuardrailManagedWordsConfig";
const _GMWL = "GuardrailManagedWordLists";
const _GMWLC = "GuardrailManagedWordListsConfig";
const _GMu = "GuardrailModalities";
const _GN = "GuardrailName";
const _GPE = "GuardrailPiiEntity";
const _GPEC = "GuardrailPiiEntityConfig";
const _GPECu = "GuardrailPiiEntitiesConfig";
const _GPEu = "GuardrailPiiEntities";
const _GPMT = "GetProvisionedModelThroughput";
const _GPMTR = "GetProvisionedModelThroughputRequest";
const _GPMTRe = "GetProvisionedModelThroughputResponse";
const _GPR = "GetPromptRouter";
const _GPRR = "GetPromptRouterRequest";
const _GPRRe = "GetPromptRouterResponse";
const _GR = "GuardrailRegex";
const _GRC = "GuardrailRegexConfig";
const _GRCu = "GuardrailRegexesConfig";
const _GRu = "GuardrailRegexes";
const _GS = "GuardrailSummary";
const _GSIP = "GuardrailSensitiveInformationPolicy";
const _GSIPC = "GuardrailSensitiveInformationPolicyConfig";
const _GSR = "GuardrailStatusReason";
const _GSRu = "GuardrailStatusReasons";
const _GSu = "GuardrailSummaries";
const _GT = "GuardrailTopic";
const _GTA = "GuardrailTopicAction";
const _GTC = "GuardrailTopicConfig";
const _GTCu = "GuardrailTopicsConfig";
const _GTD = "GuardrailTopicDefinition";
const _GTE = "GuardrailTopicExample";
const _GTEu = "GuardrailTopicExamples";
const _GTN = "GuardrailTopicName";
const _GTP = "GuardrailTopicPolicy";
const _GTPC = "GuardrailTopicPolicyConfig";
const _GTT = "GuardrailTopicsTier";
const _GTTC = "GuardrailTopicsTierConfig";
const _GTTN = "GuardrailTopicsTierName";
const _GTu = "GuardrailTopics";
const _GUCFMA = "GetUseCaseForModelAccess";
const _GUCFMAR = "GetUseCaseForModelAccessRequest";
const _GUCFMARe = "GetUseCaseForModelAccessResponse";
const _GW = "GuardrailWord";
const _GWA = "GuardrailWordAction";
const _GWC = "GuardrailWordConfig";
const _GWCu = "GuardrailWordsConfig";
const _GWP = "GuardrailWordPolicy";
const _GWPC = "GuardrailWordPolicyConfig";
const _GWu = "GuardrailWords";
const _HEC = "HumanEvaluationConfig";
const _HECM = "HumanEvaluationCustomMetric";
const _HECMu = "HumanEvaluationCustomMetrics";
const _HTI = "HumanTaskInstructions";
const _HWC = "HumanWorkflowConfig";
const _I = "Identifier";
const _IFC = "ImplicitFilterConfiguration";
const _ILC = "InvocationLogsConfig";
const _ILS = "InvocationLogSource";
const _IMS = "ImportedModelSummary";
const _IMSL = "ImportedModelSummaryList";
const _IPD = "InferenceProfileDescription";
const _IPM = "InferenceProfileModel";
const _IPMS = "InferenceProfileModelSource";
const _IPMn = "InferenceProfileModels";
const _IPS = "InferenceProfileSummary";
const _IPSn = "InferenceProfileSummaries";
const _ISE = "InternalServerException";
const _KBC = "KnowledgeBaseConfig";
const _KBRAGC = "KnowledgeBaseRetrieveAndGenerateConfiguration";
const _KBRC = "KnowledgeBaseRetrievalConfiguration";
const _KBVSC = "KnowledgeBaseVectorSearchConfiguration";
const _KIC = "KbInferenceConfig";
const _LARP = "ListAutomatedReasoningPolicies";
const _LARPBW = "ListAutomatedReasoningPolicyBuildWorkflows";
const _LARPBWR = "ListAutomatedReasoningPolicyBuildWorkflowsRequest";
const _LARPBWRi = "ListAutomatedReasoningPolicyBuildWorkflowsResponse";
const _LARPR = "ListAutomatedReasoningPoliciesRequest";
const _LARPRi = "ListAutomatedReasoningPoliciesResponse";
const _LARPTC = "ListAutomatedReasoningPolicyTestCases";
const _LARPTCR = "ListAutomatedReasoningPolicyTestCasesRequest";
const _LARPTCRi = "ListAutomatedReasoningPolicyTestCasesResponse";
const _LARPTR = "ListAutomatedReasoningPolicyTestResults";
const _LARPTRR = "ListAutomatedReasoningPolicyTestResultsRequest";
const _LARPTRRi = "ListAutomatedReasoningPolicyTestResultsResponse";
const _LC = "LoggingConfig";
const _LCM = "ListCustomModels";
const _LCMD = "ListCustomModelDeployments";
const _LCMDR = "ListCustomModelDeploymentsRequest";
const _LCMDRi = "ListCustomModelDeploymentsResponse";
const _LCMR = "ListCustomModelsRequest";
const _LCMRi = "ListCustomModelsResponse";
const _LEJ = "ListEvaluationJobs";
const _LEJR = "ListEvaluationJobsRequest";
const _LEJRi = "ListEvaluationJobsResponse";
const _LFM = "ListFoundationModels";
const _LFMAO = "ListFoundationModelAgreementOffers";
const _LFMAOR = "ListFoundationModelAgreementOffersRequest";
const _LFMAORi = "ListFoundationModelAgreementOffersResponse";
const _LFMR = "ListFoundationModelsRequest";
const _LFMRi = "ListFoundationModelsResponse";
const _LG = "ListGuardrails";
const _LGR = "ListGuardrailsRequest";
const _LGRi = "ListGuardrailsResponse";
const _LIM = "ListImportedModels";
const _LIMR = "ListImportedModelsRequest";
const _LIMRi = "ListImportedModelsResponse";
const _LIP = "ListInferenceProfiles";
const _LIPR = "ListInferenceProfilesRequest";
const _LIPRi = "ListInferenceProfilesResponse";
const _LMCJ = "ListModelCopyJobs";
const _LMCJR = "ListModelCopyJobsRequest";
const _LMCJRi = "ListModelCopyJobsResponse";
const _LMCJRis = "ListModelCustomizationJobsRequest";
const _LMCJRist = "ListModelCustomizationJobsResponse";
const _LMCJi = "ListModelCustomizationJobs";
const _LMIJ = "ListModelImportJobs";
const _LMIJR = "ListModelImportJobsRequest";
const _LMIJRi = "ListModelImportJobsResponse";
const _LMIJRis = "ListModelInvocationJobsRequest";
const _LMIJRist = "ListModelInvocationJobsResponse";
const _LMIJi = "ListModelInvocationJobs";
const _LMME = "ListMarketplaceModelEndpoints";
const _LMMER = "ListMarketplaceModelEndpointsRequest";
const _LMMERi = "ListMarketplaceModelEndpointsResponse";
const _LPMT = "ListProvisionedModelThroughputs";
const _LPMTR = "ListProvisionedModelThroughputsRequest";
const _LPMTRi = "ListProvisionedModelThroughputsResponse";
const _LPR = "ListPromptRouters";
const _LPRR = "ListPromptRoutersRequest";
const _LPRRi = "ListPromptRoutersResponse";
const _LT = "LegalTerm";
const _LTFR = "ListTagsForResource";
const _LTFRR = "ListTagsForResourceRequest";
const _LTFRRi = "ListTagsForResourceResponse";
const _M = "Message";
const _MAS = "MetadataAttributeSchema";
const _MASL = "MetadataAttributeSchemaList";
const _MCFR = "MetadataConfigurationForReranking";
const _MCJS = "ModelCopyJobSummary";
const _MCJSo = "ModelCustomizationJobSummary";
const _MCJSod = "ModelCopyJobSummaries";
const _MCJSode = "ModelCustomizationJobSummaries";
const _MDS = "ModelDataSource";
const _MIJIDC = "ModelInvocationJobInputDataConfig";
const _MIJODC = "ModelInvocationJobOutputDataConfig";
const _MIJS = "ModelImportJobSummary";
const _MIJSIDC = "ModelInvocationJobS3InputDataConfig";
const _MIJSODC = "ModelInvocationJobS3OutputDataConfig";
const _MIJSo = "ModelInvocationJobSummary";
const _MIJSod = "ModelImportJobSummaries";
const _MIJSode = "ModelInvocationJobSummaries";
const _MME = "MarketplaceModelEndpoint";
const _MMES = "MarketplaceModelEndpointSummary";
const _MMESa = "MarketplaceModelEndpointSummaries";
const _MN = "MetricName";
const _O = "Offer";
const _OC = "OrchestrationConfiguration";
const _ODC = "OutputDataConfig";
const _Of = "Offers";
const _PC = "PerformanceConfiguration";
const _PMILC = "PutModelInvocationLoggingConfiguration";
const _PMILCR = "PutModelInvocationLoggingConfigurationRequest";
const _PMILCRu = "PutModelInvocationLoggingConfigurationResponse";
const _PMS = "ProvisionedModelSummary";
const _PMSr = "ProvisionedModelSummaries";
const _PRD = "PromptRouterDescription";
const _PRS = "PromptRouterSummary";
const _PRSr = "PromptRouterSummaries";
const _PRTM = "PromptRouterTargetModel";
const _PRTMr = "PromptRouterTargetModels";
const _PT = "PricingTerm";
const _PTr = "PromptTemplate";
const _PUCFMA = "PutUseCaseForModelAccess";
const _PUCFMAR = "PutUseCaseForModelAccessRequest";
const _PUCFMARu = "PutUseCaseForModelAccessResponse";
const _QTC = "QueryTransformationConfiguration";
const _RAGC = "RetrieveAndGenerateConfiguration";
const _RAGCo = "RAGConfig";
const _RC = "RetrieveConfig";
const _RCa = "RagConfigs";
const _RCat = "RateCard";
const _RCo = "RoutingCriteria";
const _RF = "RetrievalFilter";
const _RFL = "RetrievalFilterList";
const _RIUE = "ResourceInUseException";
const _RMBF = "RequestMetadataBaseFilters";
const _RMF = "RequestMetadataFilters";
const _RMFL = "RequestMetadataFiltersList";
const _RMM = "RequestMetadataMap";
const _RMME = "RegisterMarketplaceModelEndpoint";
const _RMMER = "RegisterMarketplaceModelEndpointRequest";
const _RMMERe = "RegisterMarketplaceModelEndpointResponse";
const _RMSMC = "RerankingMetadataSelectiveModeConfiguration";
const _RNFE = "ResourceNotFoundException";
const _RS = "RatingScale";
const _RSI = "RatingScaleItem";
const _RSIV = "RatingScaleItemValue";
const _SARPBW = "StartAutomatedReasoningPolicyBuildWorkflow";
const _SARPBWR = "StartAutomatedReasoningPolicyBuildWorkflowRequest";
const _SARPBWRt = "StartAutomatedReasoningPolicyBuildWorkflowResponse";
const _SARPTW = "StartAutomatedReasoningPolicyTestWorkflow";
const _SARPTWR = "StartAutomatedReasoningPolicyTestWorkflowRequest";
const _SARPTWRt = "StartAutomatedReasoningPolicyTestWorkflowResponse";
const _SC = "S3Config";
const _SD = "StatusDetails";
const _SDS = "S3DataSource";
const _SEJ = "StopEvaluationJob";
const _SEJR = "StopEvaluationJobRequest";
const _SEJRt = "StopEvaluationJobResponse";
const _SMCJ = "StopModelCustomizationJob";
const _SMCJR = "StopModelCustomizationJobRequest";
const _SMCJRt = "StopModelCustomizationJobResponse";
const _SME = "SageMakerEndpoint";
const _SMIJ = "StopModelInvocationJob";
const _SMIJR = "StopModelInvocationJobRequest";
const _SMIJRt = "StopModelInvocationJobResponse";
const _SOD = "S3ObjectDoc";
const _SQEE = "ServiceQuotaExceededException";
const _ST = "SupportTerm";
const _SUE = "ServiceUnavailableException";
const _T = "Tag";
const _TD = "TermDetails";
const _TDC = "TrainingDataConfig";
const _TDr = "TrainingDetails";
const _TE = "ThrottlingException";
const _TIC = "TextInferenceConfig";
const _TL = "TagList";
const _TM = "TrainingMetrics";
const _TMC = "TeacherModelConfig";
const _TMTE = "TooManyTagsException";
const _TPT = "TextPromptTemplate";
const _TR = "TagResource";
const _TRR = "TagResourceRequest";
const _TRRa = "TagResourceResponse";
const _UARP = "UpdateAutomatedReasoningPolicy";
const _UARPA = "UpdateAutomatedReasoningPolicyAnnotations";
const _UARPAR = "UpdateAutomatedReasoningPolicyAnnotationsRequest";
const _UARPARp = "UpdateAutomatedReasoningPolicyAnnotationsResponse";
const _UARPR = "UpdateAutomatedReasoningPolicyRequest";
const _UARPRp = "UpdateAutomatedReasoningPolicyResponse";
const _UARPTC = "UpdateAutomatedReasoningPolicyTestCase";
const _UARPTCR = "UpdateAutomatedReasoningPolicyTestCaseRequest";
const _UARPTCRp = "UpdateAutomatedReasoningPolicyTestCaseResponse";
const _UG = "UpdateGuardrail";
const _UGR = "UpdateGuardrailRequest";
const _UGRp = "UpdateGuardrailResponse";
const _UMME = "UpdateMarketplaceModelEndpoint";
const _UMMER = "UpdateMarketplaceModelEndpointRequest";
const _UMMERp = "UpdateMarketplaceModelEndpointResponse";
const _UPMT = "UpdateProvisionedModelThroughput";
const _UPMTR = "UpdateProvisionedModelThroughputRequest";
const _UPMTRp = "UpdateProvisionedModelThroughputResponse";
const _UR = "UntagResource";
const _URR = "UntagResourceRequest";
const _URRn = "UntagResourceResponse";
const _V = "Validator";
const _VC = "VpcConfig";
const _VD = "ValidationDetails";
const _VDC = "ValidationDataConfig";
const _VE = "ValidationException";
const _VM = "ValidatorMetric";
const _VMa = "ValidationMetrics";
const _VSBRC = "VectorSearchBedrockRerankingConfiguration";
const _VSBRMC = "VectorSearchBedrockRerankingModelConfiguration";
const _VSRC = "VectorSearchRerankingConfiguration";
const _VT = "ValidityTerm";
const _Va = "Validators";
const _a = "annotation";
const _aA = "agreementAvailability";
const _aAn = "andAll";
const _aD = "agreementDuration";
const _aE = "alternateExpression";
const _aEc = "acceptEula";
const _aMRF = "additionalModelRequestFields";
const _aR = "addRule";
const _aRFNL = "addRuleFromNaturalLanguage";
const _aRP = "automatedReasoningPolicy";
const _aRPBWS = "automatedReasoningPolicyBuildWorkflowSummaries";
const _aRPC = "automatedReasoningPolicyConfig";
const _aRPS = "automatedReasoningPolicySummaries";
const _aS = "authorizationStatus";
const _aSH = "annotationSetHash";
const _aT = "applicationType";
const _aTE = "applicationTypeEquals";
const _aTFR = "aggregatedTestFindingsResult";
const _aTV = "addTypeValue";
const _aTd = "addType";
const _aTs = "assetType";
const _aV = "addVariable";
const _ac = "action";
const _an = "annotations";
const _ar = "arn";
const _au = "automated";
const _bC = "byteContent";
const _bCT = "byCustomizationType";
const _bEM = "bedrockEvaluatorModels";
const _bIM = "blockedInputMessaging";
const _bIT = "byInferenceType";
const _bKBI = "bedrockKnowledgeBaseIdentifiers";
const _bL = "buildLog";
const _bM = "bedrockModel";
const _bMA = "baseModelArn";
const _bMAE = "baseModelArnEquals";
const _bMI = "baseModelIdentifier";
const _bMIe = "bedrockModelIdentifiers";
const _bMN = "baseModelName";
const _bN = "bucketName";
const _bOM = "blockedOutputsMessaging";
const _bOMy = "byOutputModality";
const _bP = "byProvider";
const _bRC = "bedrockRerankingConfiguration";
const _bS = "buildSteps";
const _bWA = "buildWorkflowAssets";
const _bWI = "buildWorkflowId";
const _bWT = "buildWorkflowType";
const _c = "client";
const _cA = "createdAt";
const _cAr = "createdAfter";
const _cB = "createdBefore";
const _cC = "customizationConfig";
const _cD = "commitmentDuration";
const _cEKI = "customerEncryptionKeyId";
const _cET = "commitmentExpirationTime";
const _cF = "copyFrom";
const _cFS = "claimsFalseScenario";
const _cGP = "contextualGroundingPolicy";
const _cGPC = "contextualGroundingPolicyConfig";
const _cM = "customMetrics";
const _cMA = "customModelArn";
const _cMC = "customMetricConfig";
const _cMD = "customMetricDefinition";
const _cMDA = "customModelDeploymentArn";
const _cMDI = "customModelDeploymentIdentifier";
const _cMDN = "customModelDeploymentName";
const _cMEMI = "customMetricsEvaluatorModelIdentifiers";
const _cMKKI = "customModelKmsKeyId";
const _cMN = "customModelName";
const _cMT = "customModelTags";
const _cMU = "customModelUnits";
const _cMUPMC = "customModelUnitsPerModelCopy";
const _cMUV = "customModelUnitsVersion";
const _cP = "contentPolicy";
const _cPC = "contentPolicyConfig";
const _cR = "contradictingRules";
const _cRC = "crossRegionConfig";
const _cRD = "crossRegionDetails";
const _cRT = "clientRequestToken";
const _cRo = "conflictingRules";
const _cS = "customizationsSupported";
const _cT = "confidenceThreshold";
const _cTA = "creationTimeAfter";
const _cTB = "creationTimeBefore";
const _cTS = "claimsTrueScenario";
const _cTo = "contentType";
const _cTr = "creationTime";
const _cTu = "customizationType";
const _cWC = "cloudWatchConfig";
const _cl = "claims";
const _co = "confidence";
const _cod = "code";
const _con = "context";
const _cont = "content";
const _d = "description";
const _dC = "distillationConfig";
const _dCT = "documentContentType";
const _dD = "documentDescription";
const _dH = "definitionHash";
const _dL = "datasetLocation";
const _dMA = "desiredModelArn";
const _dMC = "datasetMetricConfigs";
const _dMI = "desiredModelId";
const _dMU = "desiredModelUnits";
const _dN = "documentName";
const _dPD = "dataProcessingDetails";
const _dPMN = "desiredProvisionedModelName";
const _dR = "deleteRule";
const _dRS = "disjointRuleSets";
const _dS = "differenceScenarios";
const _dT = "deleteType";
const _dTV = "deleteTypeValue";
const _dV = "deleteVariable";
const _da = "data";
const _dat = "dataset";
const _de = "definition";
const _di = "dimension";
const _do = "document";
const _doc = "documents";
const _e = "error";
const _eA = "endpointArn";
const _eAFR = "expectedAggregatedFindingsResult";
const _eAn = "entitlementAvailability";
const _eC = "evaluationConfig";
const _eCn = "endpointConfig";
const _eDDE = "embeddingDataDeliveryEnabled";
const _eI = "endpointIdentifier";
const _eJ = "evaluationJobs";
const _eM = "errorMessage";
const _eMC = "evaluatorModelConfig";
const _eMI = "evaluatorModelIdentifiers";
const _eN = "endpointName";
const _eR = "expectedResult";
const _eRx = "executionRole";
const _eS = "endpointStatus";
const _eSC = "externalSourcesConfiguration";
const _eSM = "endpointStatusMessage";
const _eT = "endTime";
const _eTT = "evaluationTaskTypes";
const _en = "entries";
const _ena = "enabled";
const _eq = "equals";
const _er = "errors";
const _ex = "expression";
const _exa = "examples";
const _f = "feedback";
const _fC = "filtersConfig";
const _fD = "formData";
const _fDA = "flowDefinitionArn";
const _fM = "fallbackModel";
const _fMA = "foundationModelArn";
const _fMAE = "foundationModelArnEquals";
const _fMa = "failureMessage";
const _fMai = "failureMessages";
const _fN = "fieldName";
const _fR = "failureRecommendations";
const _fTE = "fieldsToExclude";
const _fTI = "fieldsToInclude";
const _fV = "floatValue";
const _fi = "filters";
const _fil = "filter";
const _fo = "force";
const _g = "guardrails";
const _gA = "guardrailArn";
const _gC = "guardContent";
const _gCe = "generationConfiguration";
const _gCu = "guardrailConfiguration";
const _gI = "guardrailId";
const _gIu = "guardrailIdentifier";
const _gPA = "guardrailProfileArn";
const _gPI = "guardrailProfileIdentifier";
const _gPIu = "guardrailProfileId";
const _gT = "greaterThan";
const _gTC = "generatedTestCases";
const _gTOE = "greaterThanOrEquals";
const _gV = "guardrailVersion";
const _h = "human";
const _hE = "httpError";
const _hH = "httpHeader";
const _hP = "hyperParameters";
const _hQ = "httpQuery";
const _hWC = "humanWorkflowConfig";
const _ht = "http";
const _i = "id";
const _iA = "inputAction";
const _iC = "inferenceConfig";
const _iCS = "inferenceConfigSummary";
const _iCn = "ingestContent";
const _iDC = "inputDataConfig";
const _iDDE = "imageDataDeliveryEnabled";
const _iE = "inputEnabled";
const _iFC = "implicitFilterConfiguration";
const _iIC = "initialInstanceCount";
const _iJS = "invocationJobSummaries";
const _iLC = "invocationLogsConfig";
const _iLS = "invocationLogSource";
const _iM = "inputModalities";
const _iMA = "importedModelArn";
const _iMKKA = "importedModelKmsKeyArn";
const _iMKKI = "importedModelKmsKeyId";
const _iMN = "importedModelName";
const _iMT = "importedModelTags";
const _iO = "isOwned";
const _iP = "inferenceParams";
const _iPA = "inferenceProfileArn";
const _iPI = "inferenceProfileIdentifier";
const _iPIn = "inferenceProfileId";
const _iPN = "inferenceProfileName";
const _iPS = "inferenceProfileSummaries";
const _iS = "instructSupported";
const _iSI = "inferenceSourceIdentifier";
const _iSn = "inputStrength";
const _iT = "instanceType";
const _iTS = "inferenceTypesSupported";
const _iTd = "idempotencyToken";
const _id = "identifier";
const _im = "impossible";
const _in = "instructions";
const _in_ = "in";
const _inv = "invalid";
const _jA = "jobArn";
const _jD = "jobDescription";
const _jET = "jobExpirationTime";
const _jI = "jobIdentifier";
const _jIo = "jobIdentifiers";
const _jN = "jobName";
const _jS = "jobStatus";
const _jSo = "jobSummaries";
const _jT = "jobTags";
const _jTo = "jobType";
const _k = "key";
const _kBC = "knowledgeBaseConfiguration";
const _kBCn = "knowledgeBaseConfig";
const _kBI = "knowledgeBaseId";
const _kBRC = "knowledgeBaseRetrievalConfiguration";
const _kEK = "kmsEncryptionKey";
const _kIC = "kbInferenceConfig";
const _kKA = "kmsKeyArn";
const _kKI = "kmsKeyId";
const _kP = "keyPrefix";
const _l = "logic";
const _lC = "loggingConfig";
const _lCi = "listContains";
const _lDDSC = "largeDataDeliveryS3Config";
const _lGN = "logGroupName";
const _lMT = "lastModifiedTime";
const _lT = "legalTerm";
const _lTOE = "lessThanOrEquals";
const _lTe = "lessThan";
const _lUA = "lastUpdatedAt";
const _lUASH = "lastUpdatedAnnotationSetHash";
const _lUDH = "lastUpdatedDefinitionHash";
const _lW = "logicWarning";
const _la = "latency";
const _m = "message";
const _mA = "modelArn";
const _mAE = "modelArnEquals";
const _mAe = "metadataAttributes";
const _mAo = "modelArchitecture";
const _mC = "modelConfiguration";
const _mCJS = "modelCopyJobSummaries";
const _mCJSo = "modelCustomizationJobSummaries";
const _mCS = "modelConfigSummary";
const _mCe = "metadataConfiguration";
const _mD = "modelDetails";
const _mDN = "modelDeploymentName";
const _mDS = "modelDataSource";
const _mDSo = "modelDeploymentSummaries";
const _mI = "modelIdentifier";
const _mIJS = "modelImportJobSummaries";
const _mIo = "modelId";
const _mIod = "modelIdentifiers";
const _mKKA = "modelKmsKeyArn";
const _mKKI = "modelKmsKeyId";
const _mL = "modelLifecycle";
const _mME = "marketplaceModelEndpoint";
const _mMEa = "marketplaceModelEndpoints";
const _mN = "modelName";
const _mNe = "metricNames";
const _mR = "maxResults";
const _mRLFI = "maxResponseLengthForInference";
const _mS = "modelSource";
const _mSC = "modelSourceConfig";
const _mSE = "modelSourceEquals";
const _mSI = "modelSourceIdentifier";
const _mSo = "modelStatus";
const _mSod = "modelSummaries";
const _mT = "messageType";
const _mTa = "maxTokens";
const _mTo = "modelTags";
const _mU = "modelUnits";
const _mWL = "managedWordLists";
const _mWLC = "managedWordListsConfig";
const _me = "messages";
const _mo = "models";
const _mu = "mutation";
const _n = "name";
const _nC = "nameContains";
const _nE = "notEquals";
const _nI = "notIn";
const _nL = "naturalLanguage";
const _nN = "newName";
const _nOR = "numberOfResults";
const _nORR = "numberOfRerankedResults";
const _nT = "nextToken";
const _nTo = "noTranslations";
const _nV = "newValue";
const _o = "options";
const _oA = "outputAction";
const _oAI = "ownerAccountId";
const _oAr = "orAll";
const _oC = "orchestrationConfiguration";
const _oDC = "outputDataConfig";
const _oE = "outputEnabled";
const _oI = "offerId";
const _oM = "outputModalities";
const _oMA = "outputModelArn";
const _oMKKA = "outputModelKmsKeyArn";
const _oMN = "outputModelName";
const _oMNC = "outputModelNameContains";
const _oS = "outputStrength";
const _oST = "overrideSearchType";
const _oT = "offerToken";
const _oTf = "offerType";
const _of = "offers";
const _p = "premises";
const _pA = "policyArn";
const _pC = "performanceConfig";
const _pD = "policyDefinition";
const _pDR = "policyDefinitionRule";
const _pDT = "policyDefinitionType";
const _pDV = "policyDefinitionVariable";
const _pE = "priorElement";
const _pEC = "piiEntitiesConfig";
const _pEi = "piiEntities";
const _pI = "policyId";
const _pIS = "precomputedInferenceSource";
const _pISI = "precomputedInferenceSourceIdentifiers";
const _pMA = "provisionedModelArn";
const _pMI = "provisionedModelId";
const _pMN = "provisionedModelName";
const _pMS = "provisionedModelSummaries";
const _pN = "providerName";
const _pRA = "promptRouterArn";
const _pRAo = "policyRepairAssets";
const _pRN = "promptRouterName";
const _pRS = "promptRouterSummaries";
const _pRSC = "precomputedRagSourceConfig";
const _pRSI = "precomputedRagSourceIdentifiers";
const _pT = "promptTemplate";
const _pVA = "policyVersionArn";
const _pa = "pattern";
const _pl = "planning";
const _po = "policies";
const _pr = "price";
const _qC = "queryContent";
const _qR = "qualityReport";
const _qTC = "queryTransformationConfiguration";
const _r = "rule";
const _rA = "roleArn";
const _rAGC = "retrieveAndGenerateConfig";
const _rAGSC = "retrieveAndGenerateSourceConfig";
const _rARN = "resourceARN";
const _rAe = "regionAvailability";
const _rC = "ruleCount";
const _rCS = "ragConfigSummary";
const _rCa = "rateCard";
const _rCag = "ragConfigs";
const _rCe = "regexesConfig";
const _rCer = "rerankingConfiguration";
const _rCet = "retrievalConfiguration";
const _rCetr = "retrieveConfig";
const _rCo = "routingCriteria";
const _rI = "ruleId";
const _rIa = "ragIdentifiers";
const _rIu = "ruleIds";
const _rM = "ratingMethod";
const _rMF = "requestMetadataFilters";
const _rN = "resourceName";
const _rPD = "refundPolicyDescription";
const _rQD = "responseQualityDifference";
const _rS = "ratingScale";
const _rSC = "retrieveSourceConfig";
const _rSI = "ragSourceIdentifier";
const _rSS = "responseStreamingSupported";
const _re = "regexes";
const _ru = "rules";
const _s = "status";
const _sAE = "sourceAccountEquals";
const _sAI = "sourceAccountId";
const _sB = "sortBy";
const _sBO = "s3BucketOwner";
const _sC = "s3Config";
const _sCo = "sourceContent";
const _sCt = "stringContains";
const _sD = "statusDetails";
const _sDS = "s3DataSource";
const _sE = "scenarioExpression";
const _sEKI = "s3EncryptionKeyId";
const _sEt = "statusEquals";
const _sGI = "securityGroupIds";
const _sI = "subnetIds";
const _sIDC = "s3InputDataConfig";
const _sIF = "s3InputFormat";
const _sIP = "sensitiveInformationPolicy";
const _sIPC = "sensitiveInformationPolicyConfig";
const _sL = "s3Location";
const _sM = "statusMessage";
const _sMA = "sourceModelArn";
const _sMAE = "sourceModelArnEquals";
const _sMC = "selectiveModeConfiguration";
const _sMN = "sourceModelName";
const _sMa = "sageMaker";
const _sMe = "selectionMode";
const _sO = "sortOrder";
const _sODC = "s3OutputDataConfig";
const _sR = "supportingRules";
const _sRt = "statusReasons";
const _sS = "stopSequences";
const _sT = "sourceType";
const _sTA = "submitTimeAfter";
const _sTB = "submitTimeBefore";
const _sTu = "submitTime";
const _sTup = "supportTerm";
const _sU = "s3Uri";
const _sV = "stringValue";
const _sW = "startsWith";
const _sa = "satisfiable";
const _sc = "scenario";
const _se = "server";
const _sm = "smithy.ts.sdk.synthetic.com.amazonaws.bedrock";
const _so = "sources";
const _st = "statements";
const _t = "translation";
const _tA = "translationAmbiguous";
const _tC = "typeCount";
const _tCI = "testCaseId";
const _tCIe = "testCaseIds";
const _tCe = "testCase";
const _tCes = "testCases";
const _tCi = "tierConfig";
const _tCo = "topicsConfig";
const _tCoo = "tooComplex";
const _tD = "termDetails";
const _tDC = "trainingDataConfig";
const _tDDE = "textDataDeliveryEnabled";
const _tDIH = "timeoutDurationInHours";
const _tDr = "trainingDetails";
const _tE = "typeEquals";
const _tF = "testFindings";
const _tIC = "textInferenceConfig";
const _tK = "tagKeys";
const _tL = "trainingLoss";
const _tM = "trainingMetrics";
const _tMA = "targetModelArn";
const _tMC = "teacherModelConfig";
const _tMI = "teacherModelIdentifier";
const _tMKKA = "targetModelKmsKeyArn";
const _tMN = "targetModelName";
const _tMNC = "targetModelNameContains";
const _tMT = "targetModelTags";
const _tN = "typeName";
const _tNi = "tierName";
const _tP = "topicPolicy";
const _tPC = "topicPolicyConfig";
const _tPT = "textPromptTemplate";
const _tPo = "topP";
const _tR = "testResult";
const _tRR = "testRunResult";
const _tRS = "testRunStatus";
const _tRe = "testResults";
const _tT = "taskType";
const _ta = "tags";
const _te = "text";
const _tem = "temperature";
const _th = "threshold";
const _ti = "tier";
const _to = "topics";
const _tr = "translations";
const _ty = "type";
const _typ = "types";
const _u = "unit";
const _uA = "updatedAt";
const _uBPT = "usageBasedPricingTerm";
const _uC = "untranslatedClaims";
const _uFRF = "updateFromRulesFeedback";
const _uFSF = "updateFromScenarioFeedback";
const _uP = "untranslatedPremises";
const _uPR = "usePromptResponse";
const _uR = "updateRule";
const _uT = "unusedTypes";
const _uTV = "unusedTypeValues";
const _uTVp = "updateTypeValue";
const _uTp = "updateType";
const _uV = "unusedVariables";
const _uVp = "updateVariable";
const _ur = "url";
const _uri = "uri";
const _v = "values";
const _vC = "variableCount";
const _vCp = "vpcConfig";
const _vD = "validationDetails";
const _vDC = "validationDataConfig";
const _vDDE = "videoDataDeliveryEnabled";
const _vL = "validationLoss";
const _vM = "validationMetrics";
const _vN = "valueName";
const _vSC = "vectorSearchConfiguration";
const _vT = "validityTerm";
const _va = "value";
const _val = "validators";
const _vali = "valid";
const _var = "variable";
const _vari = "variables";
const _ve = "version";
const _vp = "vpc";
const _w = "words";
const _wC = "workflowContent";
const _wCo = "wordsConfig";
const _wP = "wordPolicy";
const _wPC = "wordPolicyConfig";
const _xact = "x-amz-client-token";
const n0 = "com.amazonaws.bedrock";
var AutomatedReasoningLogicStatementContent = [0, n0, _ARLSC, 8, 0];
var AutomatedReasoningNaturalLanguageStatementContent = [0, n0, _ARNLSC, 8, 0];
var AutomatedReasoningPolicyAnnotationFeedbackNaturalLanguage = [0, n0, _ARPAFNL, 8, 0];
var AutomatedReasoningPolicyAnnotationIngestContent = [0, n0, _ARPAIC, 8, 0];
var AutomatedReasoningPolicyAnnotationRuleNaturalLanguage = [0, n0, _ARPARNL, 8, 0];
var AutomatedReasoningPolicyBuildDocumentBlob = [0, n0, _ARPBDB, 8, 21];
var AutomatedReasoningPolicyBuildDocumentDescription = [0, n0, _ARPBDD, 8, 0];
var AutomatedReasoningPolicyBuildDocumentName = [0, n0, _ARPBDN, 8, 0];
var AutomatedReasoningPolicyDefinitionRuleAlternateExpression = [0, n0, _ARPDRAE, 8, 0];
var AutomatedReasoningPolicyDefinitionRuleExpression = [0, n0, _ARPDRE, 8, 0];
var AutomatedReasoningPolicyDefinitionTypeDescription = [0, n0, _ARPDTD, 8, 0];
var AutomatedReasoningPolicyDefinitionTypeName = [0, n0, _ARPDTN, 8, 0];
var AutomatedReasoningPolicyDefinitionTypeValueDescription = [0, n0, _ARPDTVD, 8, 0];
var AutomatedReasoningPolicyDefinitionVariableDescription = [0, n0, _ARPDVD, 8, 0];
var AutomatedReasoningPolicyDefinitionVariableName = [0, n0, _ARPDVN, 8, 0];
var AutomatedReasoningPolicyDescription = [0, n0, _ARPD, 8, 0];
var AutomatedReasoningPolicyName = [0, n0, _ARPN, 8, 0];
var AutomatedReasoningPolicyScenarioAlternateExpression = [0, n0, _ARPSAE, 8, 0];
var AutomatedReasoningPolicyScenarioExpression = [0, n0, _ARPSE, 8, 0];
var AutomatedReasoningPolicyTestGuardContent = [0, n0, _ARPTGC, 8, 0];
var AutomatedReasoningPolicyTestQueryContent = [0, n0, _ARPTQC, 8, 0];
var ByteContentBlob = [0, n0, _BCB, 8, 21];
var EvaluationDatasetName = [0, n0, _EDN, 8, 0];
var EvaluationJobDescription = [0, n0, _EJD, 8, 0];
var EvaluationJobIdentifier = [0, n0, _EJI, 8, 0];
var EvaluationMetricDescription = [0, n0, _EMD, 8, 0];
var EvaluationMetricName = [0, n0, _EMN, 8, 0];
var EvaluationModelInferenceParams = [0, n0, _EMIP, 8, 0];
var GuardrailBlockedMessaging = [0, n0, _GBM, 8, 0];
var GuardrailContentFilterAction$1 = [0, n0, _GCFA, 8, 0];
var GuardrailContentFiltersTierName$1 = [0, n0, _GCFTN, 8, 0];
var GuardrailContextualGroundingAction$1 = [0, n0, _GCGA, 8, 0];
var GuardrailDescription = [0, n0, _GD, 8, 0];
var GuardrailFailureRecommendation = [0, n0, _GFR, 8, 0];
var GuardrailModality$1 = [0, n0, _GM, 8, 0];
var GuardrailName = [0, n0, _GN, 8, 0];
var GuardrailStatusReason = [0, n0, _GSR, 8, 0];
var GuardrailTopicAction$1 = [0, n0, _GTA, 8, 0];
var GuardrailTopicDefinition = [0, n0, _GTD, 8, 0];
var GuardrailTopicExample = [0, n0, _GTE, 8, 0];
var GuardrailTopicName = [0, n0, _GTN, 8, 0];
var GuardrailTopicsTierName$1 = [0, n0, _GTTN, 8, 0];
var GuardrailWordAction$1 = [0, n0, _GWA, 8, 0];
var HumanTaskInstructions = [0, n0, _HTI, 8, 0];
var Identifier = [0, n0, _I, 8, 0];
var InferenceProfileDescription = [0, n0, _IPD, 8, 0];
var Message = [0, n0, _M, 8, 0];
var MetricName = [0, n0, _MN, 8, 0];
var PromptRouterDescription = [0, n0, _PRD, 8, 0];
var TextPromptTemplate = [0, n0, _TPT, 8, 0];
var AccessDeniedException = [
    -3,
    n0,
    _ADE,
    {
        [_e]: _c,
        [_hE]: 403,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(AccessDeniedException, AccessDeniedException$1);
var AgreementAvailability = [3, n0, _AA, 0, [_s, _eM], [0, 0]];
var AutomatedEvaluationConfig = [
    3,
    n0,
    _AEC,
    0,
    [_dMC, _eMC, _cMC],
    [
        [() => EvaluationDatasetMetricConfigs, 0],
        () => EvaluatorModelConfig,
        [() => AutomatedEvaluationCustomMetricConfig, 0],
    ],
];
var AutomatedEvaluationCustomMetricConfig = [
    3,
    n0,
    _AECMC,
    0,
    [_cM, _eMC],
    [[() => AutomatedEvaluationCustomMetrics, 0], () => CustomMetricEvaluatorModelConfig],
];
var AutomatedReasoningCheckImpossibleFinding = [
    3,
    n0,
    _ARCIF,
    0,
    [_t, _cR, _lW],
    [
        [() => AutomatedReasoningCheckTranslation, 0],
        () => AutomatedReasoningCheckRuleList,
        [() => AutomatedReasoningCheckLogicWarning, 0],
    ],
];
var AutomatedReasoningCheckInputTextReference = [
    3,
    n0,
    _ARCITR,
    0,
    [_te],
    [[() => AutomatedReasoningNaturalLanguageStatementContent, 0]],
];
var AutomatedReasoningCheckInvalidFinding = [
    3,
    n0,
    _ARCIFu,
    0,
    [_t, _cR, _lW],
    [
        [() => AutomatedReasoningCheckTranslation, 0],
        () => AutomatedReasoningCheckRuleList,
        [() => AutomatedReasoningCheckLogicWarning, 0],
    ],
];
var AutomatedReasoningCheckLogicWarning = [
    3,
    n0,
    _ARCLW,
    0,
    [_ty, _p, _cl],
    [0, [() => AutomatedReasoningLogicStatementList, 0], [() => AutomatedReasoningLogicStatementList, 0]],
];
var AutomatedReasoningCheckNoTranslationsFinding = [3, n0, _ARCNTF, 0, [], []];
var AutomatedReasoningCheckRule = [3, n0, _ARCR, 0, [_i, _pVA], [0, 0]];
var AutomatedReasoningCheckSatisfiableFinding = [
    3,
    n0,
    _ARCSF,
    0,
    [_t, _cTS, _cFS, _lW],
    [
        [() => AutomatedReasoningCheckTranslation, 0],
        [() => AutomatedReasoningCheckScenario, 0],
        [() => AutomatedReasoningCheckScenario, 0],
        [() => AutomatedReasoningCheckLogicWarning, 0],
    ],
];
var AutomatedReasoningCheckScenario = [
    3,
    n0,
    _ARCS,
    0,
    [_st],
    [[() => AutomatedReasoningLogicStatementList, 0]],
];
var AutomatedReasoningCheckTooComplexFinding = [3, n0, _ARCTCF, 0, [], []];
var AutomatedReasoningCheckTranslation = [
    3,
    n0,
    _ARCT,
    0,
    [_p, _cl, _uP, _uC, _co],
    [
        [() => AutomatedReasoningLogicStatementList, 0],
        [() => AutomatedReasoningLogicStatementList, 0],
        [() => AutomatedReasoningCheckInputTextReferenceList, 0],
        [() => AutomatedReasoningCheckInputTextReferenceList, 0],
        1,
    ],
];
var AutomatedReasoningCheckTranslationAmbiguousFinding = [
    3,
    n0,
    _ARCTAF,
    0,
    [_o, _dS],
    [
        [() => AutomatedReasoningCheckTranslationOptionList, 0],
        [() => AutomatedReasoningCheckDifferenceScenarioList, 0],
    ],
];
var AutomatedReasoningCheckTranslationOption = [
    3,
    n0,
    _ARCTO,
    0,
    [_tr],
    [[() => AutomatedReasoningCheckTranslationList, 0]],
];
var AutomatedReasoningCheckValidFinding = [
    3,
    n0,
    _ARCVF,
    0,
    [_t, _cTS, _sR, _lW],
    [
        [() => AutomatedReasoningCheckTranslation, 0],
        [() => AutomatedReasoningCheckScenario, 0],
        () => AutomatedReasoningCheckRuleList,
        [() => AutomatedReasoningCheckLogicWarning, 0],
    ],
];
var AutomatedReasoningLogicStatement = [
    3,
    n0,
    _ARLS,
    0,
    [_l, _nL],
    [
        [() => AutomatedReasoningLogicStatementContent, 0],
        [() => AutomatedReasoningNaturalLanguageStatementContent, 0],
    ],
];
var AutomatedReasoningPolicyAddRuleAnnotation = [
    3,
    n0,
    _ARPARA,
    0,
    [_ex],
    [[() => AutomatedReasoningPolicyDefinitionRuleExpression, 0]],
];
var AutomatedReasoningPolicyAddRuleFromNaturalLanguageAnnotation = [
    3,
    n0,
    _ARPARFNLA,
    0,
    [_nL],
    [[() => AutomatedReasoningPolicyAnnotationRuleNaturalLanguage, 0]],
];
var AutomatedReasoningPolicyAddRuleMutation = [
    3,
    n0,
    _ARPARM,
    0,
    [_r],
    [[() => AutomatedReasoningPolicyDefinitionRule, 0]],
];
var AutomatedReasoningPolicyAddTypeAnnotation = [
    3,
    n0,
    _ARPATA,
    0,
    [_n, _d, _v],
    [
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeDescription, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeValueList, 0],
    ],
];
var AutomatedReasoningPolicyAddTypeMutation = [
    3,
    n0,
    _ARPATM,
    0,
    [_ty],
    [[() => AutomatedReasoningPolicyDefinitionType, 0]],
];
var AutomatedReasoningPolicyAddTypeValue = [
    3,
    n0,
    _ARPATV,
    0,
    [_va, _d],
    [0, [() => AutomatedReasoningPolicyDefinitionTypeValueDescription, 0]],
];
var AutomatedReasoningPolicyAddVariableAnnotation = [
    3,
    n0,
    _ARPAVA,
    0,
    [_n, _ty, _d],
    [
        [() => AutomatedReasoningPolicyDefinitionVariableName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableDescription, 0],
    ],
];
var AutomatedReasoningPolicyAddVariableMutation = [
    3,
    n0,
    _ARPAVM,
    0,
    [_var],
    [[() => AutomatedReasoningPolicyDefinitionVariable, 0]],
];
var AutomatedReasoningPolicyBuildLog = [
    3,
    n0,
    _ARPBL,
    0,
    [_en],
    [[() => AutomatedReasoningPolicyBuildLogEntryList, 0]],
];
var AutomatedReasoningPolicyBuildLogEntry = [
    3,
    n0,
    _ARPBLE,
    0,
    [_a, _s, _bS],
    [[() => AutomatedReasoningPolicyAnnotation, 0], 0, [() => AutomatedReasoningPolicyBuildStepList, 0]],
];
var AutomatedReasoningPolicyBuildStep = [
    3,
    n0,
    _ARPBS,
    0,
    [_con, _pE, _me],
    [
        [() => AutomatedReasoningPolicyBuildStepContext, 0],
        [() => AutomatedReasoningPolicyDefinitionElement, 0],
        () => AutomatedReasoningPolicyBuildStepMessageList,
    ],
];
var AutomatedReasoningPolicyBuildStepMessage = [3, n0, _ARPBSM, 0, [_m, _mT], [0, 0]];
var AutomatedReasoningPolicyBuildWorkflowDocument = [
    3,
    n0,
    _ARPBWD,
    0,
    [_do, _dCT, _dN, _dD],
    [
        [() => AutomatedReasoningPolicyBuildDocumentBlob, 0],
        0,
        [() => AutomatedReasoningPolicyBuildDocumentName, 0],
        [() => AutomatedReasoningPolicyBuildDocumentDescription, 0],
    ],
];
var AutomatedReasoningPolicyBuildWorkflowRepairContent = [
    3,
    n0,
    _ARPBWRC,
    0,
    [_an],
    [[() => AutomatedReasoningPolicyAnnotationList, 0]],
];
var AutomatedReasoningPolicyBuildWorkflowSource = [
    3,
    n0,
    _ARPBWS,
    0,
    [_pD, _wC],
    [
        [() => AutomatedReasoningPolicyDefinition, 0],
        [() => AutomatedReasoningPolicyWorkflowTypeContent, 0],
    ],
];
var AutomatedReasoningPolicyBuildWorkflowSummary = [
    3,
    n0,
    _ARPBWSu,
    0,
    [_pA, _bWI, _s, _bWT, _cA, _uA],
    [0, 0, 0, 0, 5, 5],
];
var AutomatedReasoningPolicyDefinition = [
    3,
    n0,
    _ARPDu,
    0,
    [_ve, _typ, _ru, _vari],
    [
        0,
        [() => AutomatedReasoningPolicyDefinitionTypeList, 0],
        [() => AutomatedReasoningPolicyDefinitionRuleList, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableList, 0],
    ],
];
var AutomatedReasoningPolicyDefinitionQualityReport = [
    3,
    n0,
    _ARPDQR,
    0,
    [_tC, _vC, _rC, _uT, _uTV, _uV, _cRo, _dRS],
    [
        1,
        1,
        1,
        [() => AutomatedReasoningPolicyDefinitionTypeNameList, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeValuePairList, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableNameList, 0],
        64 | 0,
        [() => AutomatedReasoningPolicyDisjointRuleSetList, 0],
    ],
];
var AutomatedReasoningPolicyDefinitionRule = [
    3,
    n0,
    _ARPDR,
    0,
    [_i, _ex, _aE],
    [
        0,
        [() => AutomatedReasoningPolicyDefinitionRuleExpression, 0],
        [() => AutomatedReasoningPolicyDefinitionRuleAlternateExpression, 0],
    ],
];
var AutomatedReasoningPolicyDefinitionType = [
    3,
    n0,
    _ARPDT,
    0,
    [_n, _d, _v],
    [
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeDescription, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeValueList, 0],
    ],
];
var AutomatedReasoningPolicyDefinitionTypeValue = [
    3,
    n0,
    _ARPDTV,
    0,
    [_va, _d],
    [0, [() => AutomatedReasoningPolicyDefinitionTypeValueDescription, 0]],
];
var AutomatedReasoningPolicyDefinitionTypeValuePair = [
    3,
    n0,
    _ARPDTVP,
    0,
    [_tN, _vN],
    [[() => AutomatedReasoningPolicyDefinitionTypeName, 0], 0],
];
var AutomatedReasoningPolicyDefinitionVariable = [
    3,
    n0,
    _ARPDV,
    0,
    [_n, _ty, _d],
    [
        [() => AutomatedReasoningPolicyDefinitionVariableName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableDescription, 0],
    ],
];
var AutomatedReasoningPolicyDeleteRuleAnnotation = [3, n0, _ARPDRA, 0, [_rI], [0]];
var AutomatedReasoningPolicyDeleteRuleMutation = [3, n0, _ARPDRM, 0, [_i], [0]];
var AutomatedReasoningPolicyDeleteTypeAnnotation = [
    3,
    n0,
    _ARPDTA,
    0,
    [_n],
    [[() => AutomatedReasoningPolicyDefinitionTypeName, 0]],
];
var AutomatedReasoningPolicyDeleteTypeMutation = [
    3,
    n0,
    _ARPDTM,
    0,
    [_n],
    [[() => AutomatedReasoningPolicyDefinitionTypeName, 0]],
];
var AutomatedReasoningPolicyDeleteTypeValue = [3, n0, _ARPDTVu, 0, [_va], [0]];
var AutomatedReasoningPolicyDeleteVariableAnnotation = [
    3,
    n0,
    _ARPDVA,
    0,
    [_n],
    [[() => AutomatedReasoningPolicyDefinitionVariableName, 0]],
];
var AutomatedReasoningPolicyDeleteVariableMutation = [
    3,
    n0,
    _ARPDVM,
    0,
    [_n],
    [[() => AutomatedReasoningPolicyDefinitionVariableName, 0]],
];
var AutomatedReasoningPolicyDisjointRuleSet = [
    3,
    n0,
    _ARPDRS,
    0,
    [_vari, _ru],
    [[() => AutomatedReasoningPolicyDefinitionVariableNameList, 0], 64 | 0],
];
var AutomatedReasoningPolicyGeneratedTestCase = [
    3,
    n0,
    _ARPGTC,
    0,
    [_qC, _gC, _eAFR],
    [[() => AutomatedReasoningPolicyTestQueryContent, 0], [() => AutomatedReasoningPolicyTestGuardContent, 0], 0],
];
var AutomatedReasoningPolicyGeneratedTestCases = [
    3,
    n0,
    _ARPGTCu,
    0,
    [_gTC],
    [[() => AutomatedReasoningPolicyGeneratedTestCaseList, 0]],
];
var AutomatedReasoningPolicyIngestContentAnnotation = [
    3,
    n0,
    _ARPICA,
    0,
    [_cont],
    [[() => AutomatedReasoningPolicyAnnotationIngestContent, 0]],
];
var AutomatedReasoningPolicyPlanning = [3, n0, _ARPP, 0, [], []];
var AutomatedReasoningPolicyScenario = [
    3,
    n0,
    _ARPS,
    0,
    [_ex, _aE, _rIu, _eR],
    [
        [() => AutomatedReasoningPolicyScenarioExpression, 0],
        [() => AutomatedReasoningPolicyScenarioAlternateExpression, 0],
        64 | 0,
        0,
    ],
];
var AutomatedReasoningPolicySummary = [
    3,
    n0,
    _ARPSu,
    0,
    [_pA, _n, _d, _ve, _pI, _cA, _uA],
    [0, [() => AutomatedReasoningPolicyName, 0], [() => AutomatedReasoningPolicyDescription, 0], 0, 0, 5, 5],
];
var AutomatedReasoningPolicyTestCase = [
    3,
    n0,
    _ARPTC,
    0,
    [_tCI, _gC, _qC, _eAFR, _cA, _uA, _cT],
    [
        0,
        [() => AutomatedReasoningPolicyTestGuardContent, 0],
        [() => AutomatedReasoningPolicyTestQueryContent, 0],
        0,
        5,
        5,
        1,
    ],
];
var AutomatedReasoningPolicyTestResult = [
    3,
    n0,
    _ARPTR,
    0,
    [_tCe, _pA, _tRS, _tF, _tRR, _aTFR, _uA],
    [[() => AutomatedReasoningPolicyTestCase, 0], 0, 0, [() => AutomatedReasoningCheckFindingList, 0], 0, 0, 5],
];
var AutomatedReasoningPolicyUpdateFromRuleFeedbackAnnotation = [
    3,
    n0,
    _ARPUFRFA,
    0,
    [_rIu, _f],
    [64 | 0, [() => AutomatedReasoningPolicyAnnotationFeedbackNaturalLanguage, 0]],
];
var AutomatedReasoningPolicyUpdateFromScenarioFeedbackAnnotation = [
    3,
    n0,
    _ARPUFSFA,
    0,
    [_rIu, _sE, _f],
    [
        64 | 0,
        [() => AutomatedReasoningPolicyScenarioExpression, 0],
        [() => AutomatedReasoningPolicyAnnotationFeedbackNaturalLanguage, 0],
    ],
];
var AutomatedReasoningPolicyUpdateRuleAnnotation = [
    3,
    n0,
    _ARPURA,
    0,
    [_rI, _ex],
    [0, [() => AutomatedReasoningPolicyDefinitionRuleExpression, 0]],
];
var AutomatedReasoningPolicyUpdateRuleMutation = [
    3,
    n0,
    _ARPURM,
    0,
    [_r],
    [[() => AutomatedReasoningPolicyDefinitionRule, 0]],
];
var AutomatedReasoningPolicyUpdateTypeAnnotation = [
    3,
    n0,
    _ARPUTA,
    0,
    [_n, _nN, _d, _v],
    [
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
        [() => AutomatedReasoningPolicyDefinitionTypeDescription, 0],
        [() => AutomatedReasoningPolicyTypeValueAnnotationList, 0],
    ],
];
var AutomatedReasoningPolicyUpdateTypeMutation = [
    3,
    n0,
    _ARPUTM,
    0,
    [_ty],
    [[() => AutomatedReasoningPolicyDefinitionType, 0]],
];
var AutomatedReasoningPolicyUpdateTypeValue = [
    3,
    n0,
    _ARPUTV,
    0,
    [_va, _nV, _d],
    [0, 0, [() => AutomatedReasoningPolicyDefinitionTypeValueDescription, 0]],
];
var AutomatedReasoningPolicyUpdateVariableAnnotation = [
    3,
    n0,
    _ARPUVA,
    0,
    [_n, _nN, _d],
    [
        [() => AutomatedReasoningPolicyDefinitionVariableName, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableName, 0],
        [() => AutomatedReasoningPolicyDefinitionVariableDescription, 0],
    ],
];
var AutomatedReasoningPolicyUpdateVariableMutation = [
    3,
    n0,
    _ARPUVM,
    0,
    [_var],
    [[() => AutomatedReasoningPolicyDefinitionVariable, 0]],
];
var BatchDeleteEvaluationJobError = [
    3,
    n0,
    _BDEJE,
    0,
    [_jI, _cod, _m],
    [[() => EvaluationJobIdentifier, 0], 0, 0],
];
var BatchDeleteEvaluationJobItem = [
    3,
    n0,
    _BDEJI,
    0,
    [_jI, _jS],
    [[() => EvaluationJobIdentifier, 0], 0],
];
var BatchDeleteEvaluationJobRequest = [
    3,
    n0,
    _BDEJR,
    0,
    [_jIo],
    [[() => EvaluationJobIdentifiers, 0]],
];
var BatchDeleteEvaluationJobResponse = [
    3,
    n0,
    _BDEJRa,
    0,
    [_er, _eJ],
    [
        [() => BatchDeleteEvaluationJobErrors, 0],
        [() => BatchDeleteEvaluationJobItems, 0],
    ],
];
var BedrockEvaluatorModel = [3, n0, _BEM, 0, [_mI], [0]];
var ByteContentDoc = [
    3,
    n0,
    _BCD,
    0,
    [_id, _cTo, _da],
    [[() => Identifier, 0], 0, [() => ByteContentBlob, 0]],
];
var CancelAutomatedReasoningPolicyBuildWorkflowRequest = [
    3,
    n0,
    _CARPBWR,
    0,
    [_pA, _bWI],
    [
        [0, 1],
        [0, 1],
    ],
];
var CancelAutomatedReasoningPolicyBuildWorkflowResponse = [3, n0, _CARPBWRa, 0, [], []];
var CloudWatchConfig = [3, n0, _CWC, 0, [_lGN, _rA, _lDDSC], [0, 0, () => S3Config]];
var ConflictException = [
    -3,
    n0,
    _CE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ConflictException, ConflictException$1);
var CreateAutomatedReasoningPolicyRequest = [
    3,
    n0,
    _CARPR,
    0,
    [_n, _d, _cRT, _pD, _kKI, _ta],
    [
        [() => AutomatedReasoningPolicyName, 0],
        [() => AutomatedReasoningPolicyDescription, 0],
        [0, 4],
        [() => AutomatedReasoningPolicyDefinition, 0],
        0,
        () => TagList,
    ],
];
var CreateAutomatedReasoningPolicyResponse = [
    3,
    n0,
    _CARPRr,
    0,
    [_pA, _ve, _n, _d, _dH, _cA, _uA],
    [0, 0, [() => AutomatedReasoningPolicyName, 0], [() => AutomatedReasoningPolicyDescription, 0], 0, 5, 5],
];
var CreateAutomatedReasoningPolicyTestCaseRequest = [
    3,
    n0,
    _CARPTCR,
    0,
    [_pA, _gC, _qC, _eAFR, _cRT, _cT],
    [
        [0, 1],
        [() => AutomatedReasoningPolicyTestGuardContent, 0],
        [() => AutomatedReasoningPolicyTestQueryContent, 0],
        0,
        [0, 4],
        1,
    ],
];
var CreateAutomatedReasoningPolicyTestCaseResponse = [
    3,
    n0,
    _CARPTCRr,
    0,
    [_pA, _tCI],
    [0, 0],
];
var CreateAutomatedReasoningPolicyVersionRequest = [
    3,
    n0,
    _CARPVR,
    0,
    [_pA, _cRT, _lUDH, _ta],
    [[0, 1], [0, 4], 0, () => TagList],
];
var CreateAutomatedReasoningPolicyVersionResponse = [
    3,
    n0,
    _CARPVRr,
    0,
    [_pA, _ve, _n, _d, _dH, _cA],
    [0, 0, [() => AutomatedReasoningPolicyName, 0], [() => AutomatedReasoningPolicyDescription, 0], 0, 5],
];
var CreateCustomModelDeploymentRequest = [
    3,
    n0,
    _CCMDR,
    0,
    [_mDN, _mA, _d, _ta, _cRT],
    [0, 0, 0, () => TagList, [0, 4]],
];
var CreateCustomModelDeploymentResponse = [3, n0, _CCMDRr, 0, [_cMDA], [0]];
var CreateCustomModelRequest = [
    3,
    n0,
    _CCMR,
    0,
    [_mN, _mSC, _mKKA, _rA, _mTo, _cRT],
    [0, () => ModelDataSource, 0, 0, () => TagList, [0, 4]],
];
var CreateCustomModelResponse = [3, n0, _CCMRr, 0, [_mA], [0]];
var CreateEvaluationJobRequest = [
    3,
    n0,
    _CEJR,
    0,
    [_jN, _jD, _cRT, _rA, _cEKI, _jT, _aT, _eC, _iC, _oDC],
    [
        0,
        [() => EvaluationJobDescription, 0],
        [0, 4],
        0,
        0,
        () => TagList,
        0,
        [() => EvaluationConfig, 0],
        [() => EvaluationInferenceConfig, 0],
        () => EvaluationOutputDataConfig,
    ],
];
var CreateEvaluationJobResponse = [3, n0, _CEJRr, 0, [_jA], [0]];
var CreateFoundationModelAgreementRequest = [3, n0, _CFMAR, 0, [_oT, _mIo], [0, 0]];
var CreateFoundationModelAgreementResponse = [3, n0, _CFMARr, 0, [_mIo], [0]];
var CreateGuardrailRequest = [
    3,
    n0,
    _CGR,
    0,
    [_n, _d, _tPC, _cPC, _wPC, _sIPC, _cGPC, _aRPC, _cRC, _bIM, _bOM, _kKI, _ta, _cRT],
    [
        [() => GuardrailName, 0],
        [() => GuardrailDescription, 0],
        [() => GuardrailTopicPolicyConfig, 0],
        [() => GuardrailContentPolicyConfig, 0],
        [() => GuardrailWordPolicyConfig, 0],
        () => GuardrailSensitiveInformationPolicyConfig,
        [() => GuardrailContextualGroundingPolicyConfig, 0],
        () => GuardrailAutomatedReasoningPolicyConfig,
        () => GuardrailCrossRegionConfig,
        [() => GuardrailBlockedMessaging, 0],
        [() => GuardrailBlockedMessaging, 0],
        0,
        () => TagList,
        [0, 4],
    ],
];
var CreateGuardrailResponse = [3, n0, _CGRr, 0, [_gI, _gA, _ve, _cA], [0, 0, 0, 5]];
var CreateGuardrailVersionRequest = [
    3,
    n0,
    _CGVR,
    0,
    [_gIu, _d, _cRT],
    [
        [0, 1],
        [() => GuardrailDescription, 0],
        [0, 4],
    ],
];
var CreateGuardrailVersionResponse = [3, n0, _CGVRr, 0, [_gI, _ve], [0, 0]];
var CreateInferenceProfileRequest = [
    3,
    n0,
    _CIPR,
    0,
    [_iPN, _d, _cRT, _mS, _ta],
    [0, [() => InferenceProfileDescription, 0], [0, 4], () => InferenceProfileModelSource, () => TagList],
];
var CreateInferenceProfileResponse = [3, n0, _CIPRr, 0, [_iPA, _s], [0, 0]];
var CreateMarketplaceModelEndpointRequest = [
    3,
    n0,
    _CMMER,
    0,
    [_mSI, _eCn, _aEc, _eN, _cRT, _ta],
    [0, () => EndpointConfig, 2, 0, [0, 4], () => TagList],
];
var CreateMarketplaceModelEndpointResponse = [
    3,
    n0,
    _CMMERr,
    0,
    [_mME],
    [() => MarketplaceModelEndpoint],
];
var CreateModelCopyJobRequest = [
    3,
    n0,
    _CMCJR,
    0,
    [_sMA, _tMN, _mKKI, _tMT, _cRT],
    [0, 0, 0, () => TagList, [0, 4]],
];
var CreateModelCopyJobResponse = [3, n0, _CMCJRr, 0, [_jA], [0]];
var CreateModelCustomizationJobRequest = [
    3,
    n0,
    _CMCJRre,
    0,
    [_jN, _cMN, _rA, _cRT, _bMI, _cTu, _cMKKI, _jT, _cMT, _tDC, _vDC, _oDC, _hP, _vCp, _cC],
    [
        0,
        0,
        0,
        [0, 4],
        0,
        0,
        0,
        () => TagList,
        () => TagList,
        [() => TrainingDataConfig, 0],
        () => ValidationDataConfig,
        () => OutputDataConfig,
        128 | 0,
        () => VpcConfig,
        () => CustomizationConfig,
    ],
];
var CreateModelCustomizationJobResponse = [3, n0, _CMCJRrea, 0, [_jA], [0]];
var CreateModelImportJobRequest = [
    3,
    n0,
    _CMIJR,
    0,
    [_jN, _iMN, _rA, _mDS, _jT, _iMT, _cRT, _vCp, _iMKKI],
    [0, 0, 0, () => ModelDataSource, () => TagList, () => TagList, 0, () => VpcConfig, 0],
];
var CreateModelImportJobResponse = [3, n0, _CMIJRr, 0, [_jA], [0]];
var CreateModelInvocationJobRequest = [
    3,
    n0,
    _CMIJRre,
    0,
    [_jN, _rA, _cRT, _mIo, _iDC, _oDC, _vCp, _tDIH, _ta],
    [
        0,
        0,
        [0, 4],
        0,
        () => ModelInvocationJobInputDataConfig,
        () => ModelInvocationJobOutputDataConfig,
        () => VpcConfig,
        1,
        () => TagList,
    ],
];
var CreateModelInvocationJobResponse = [3, n0, _CMIJRrea, 0, [_jA], [0]];
var CreatePromptRouterRequest = [
    3,
    n0,
    _CPRR,
    0,
    [_cRT, _pRN, _mo, _d, _rCo, _fM, _ta],
    [
        [0, 4],
        0,
        () => PromptRouterTargetModels,
        [() => PromptRouterDescription, 0],
        () => RoutingCriteria,
        () => PromptRouterTargetModel,
        () => TagList,
    ],
];
var CreatePromptRouterResponse = [3, n0, _CPRRr, 0, [_pRA], [0]];
var CreateProvisionedModelThroughputRequest = [
    3,
    n0,
    _CPMTR,
    0,
    [_cRT, _mU, _pMN, _mIo, _cD, _ta],
    [[0, 4], 1, 0, 0, 0, () => TagList],
];
var CreateProvisionedModelThroughputResponse = [3, n0, _CPMTRr, 0, [_pMA], [0]];
var CustomMetricBedrockEvaluatorModel = [3, n0, _CMBEM, 0, [_mI], [0]];
var CustomMetricDefinition = [
    3,
    n0,
    _CMD,
    8,
    [_n, _in, _rS],
    [[() => MetricName, 0], 0, () => RatingScale],
];
var CustomMetricEvaluatorModelConfig = [
    3,
    n0,
    _CMEMC,
    0,
    [_bEM],
    [() => CustomMetricBedrockEvaluatorModels],
];
var CustomModelDeploymentSummary = [
    3,
    n0,
    _CMDS,
    0,
    [_cMDA, _cMDN, _mA, _cA, _s, _lUA, _fMa],
    [0, 0, 0, 5, 0, 5, 0],
];
var CustomModelSummary = [
    3,
    n0,
    _CMS,
    0,
    [_mA, _mN, _cTr, _bMA, _bMN, _cTu, _oAI, _mSo],
    [0, 0, 5, 0, 0, 0, 0, 0],
];
var CustomModelUnits = [3, n0, _CMU, 0, [_cMUPMC, _cMUV], [1, 0]];
var DataProcessingDetails = [3, n0, _DPD, 0, [_s, _cTr, _lMT], [0, 5, 5]];
var DeleteAutomatedReasoningPolicyBuildWorkflowRequest = [
    3,
    n0,
    _DARPBWR,
    0,
    [_pA, _bWI, _lUA],
    [
        [0, 1],
        [0, 1],
        [
            5,
            {
                [_hQ]: _uA,
            },
        ],
    ],
];
var DeleteAutomatedReasoningPolicyBuildWorkflowResponse = [3, n0, _DARPBWRe, 0, [], []];
var DeleteAutomatedReasoningPolicyRequest = [
    3,
    n0,
    _DARPR,
    0,
    [_pA, _fo],
    [
        [0, 1],
        [
            2,
            {
                [_hQ]: _fo,
            },
        ],
    ],
];
var DeleteAutomatedReasoningPolicyResponse = [3, n0, _DARPRe, 0, [], []];
var DeleteAutomatedReasoningPolicyTestCaseRequest = [
    3,
    n0,
    _DARPTCR,
    0,
    [_pA, _tCI, _lUA],
    [
        [0, 1],
        [0, 1],
        [
            5,
            {
                [_hQ]: _uA,
            },
        ],
    ],
];
var DeleteAutomatedReasoningPolicyTestCaseResponse = [3, n0, _DARPTCRe, 0, [], []];
var DeleteCustomModelDeploymentRequest = [3, n0, _DCMDR, 0, [_cMDI], [[0, 1]]];
var DeleteCustomModelDeploymentResponse = [3, n0, _DCMDRe, 0, [], []];
var DeleteCustomModelRequest = [3, n0, _DCMR, 0, [_mI], [[0, 1]]];
var DeleteCustomModelResponse = [3, n0, _DCMRe, 0, [], []];
var DeleteFoundationModelAgreementRequest = [3, n0, _DFMAR, 0, [_mIo], [0]];
var DeleteFoundationModelAgreementResponse = [3, n0, _DFMARe, 0, [], []];
var DeleteGuardrailRequest = [
    3,
    n0,
    _DGR,
    0,
    [_gIu, _gV],
    [
        [0, 1],
        [
            0,
            {
                [_hQ]: _gV,
            },
        ],
    ],
];
var DeleteGuardrailResponse = [3, n0, _DGRe, 0, [], []];
var DeleteImportedModelRequest = [3, n0, _DIMR, 0, [_mI], [[0, 1]]];
var DeleteImportedModelResponse = [3, n0, _DIMRe, 0, [], []];
var DeleteInferenceProfileRequest = [3, n0, _DIPR, 0, [_iPI], [[0, 1]]];
var DeleteInferenceProfileResponse = [3, n0, _DIPRe, 0, [], []];
var DeleteMarketplaceModelEndpointRequest = [3, n0, _DMMER, 0, [_eA], [[0, 1]]];
var DeleteMarketplaceModelEndpointResponse = [3, n0, _DMMERe, 0, [], []];
var DeleteModelInvocationLoggingConfigurationRequest = [3, n0, _DMILCR, 0, [], []];
var DeleteModelInvocationLoggingConfigurationResponse = [3, n0, _DMILCRe, 0, [], []];
var DeletePromptRouterRequest = [3, n0, _DPRR, 0, [_pRA], [[0, 1]]];
var DeletePromptRouterResponse = [3, n0, _DPRRe, 0, [], []];
var DeleteProvisionedModelThroughputRequest = [3, n0, _DPMTR, 0, [_pMI], [[0, 1]]];
var DeleteProvisionedModelThroughputResponse = [3, n0, _DPMTRe, 0, [], []];
var DeregisterMarketplaceModelEndpointRequest = [3, n0, _DMMERer, 0, [_eA], [[0, 1]]];
var DeregisterMarketplaceModelEndpointResponse = [3, n0, _DMMERere, 0, [], []];
var DimensionalPriceRate = [3, n0, _DPR, 0, [_di, _pr, _d, _u], [0, 0, 0, 0]];
var DistillationConfig = [3, n0, _DC, 0, [_tMC], [() => TeacherModelConfig]];
var EvaluationBedrockModel = [
    3,
    n0,
    _EBM,
    0,
    [_mI, _iP, _pC],
    [0, [() => EvaluationModelInferenceParams, 0], () => PerformanceConfiguration],
];
var EvaluationDataset = [
    3,
    n0,
    _ED,
    0,
    [_n, _dL],
    [[() => EvaluationDatasetName, 0], () => EvaluationDatasetLocation],
];
var EvaluationDatasetMetricConfig = [
    3,
    n0,
    _EDMC,
    0,
    [_tT, _dat, _mNe],
    [0, [() => EvaluationDataset, 0], [() => EvaluationMetricNames, 0]],
];
var EvaluationInferenceConfigSummary = [
    3,
    n0,
    _EICS,
    0,
    [_mCS, _rCS],
    [() => EvaluationModelConfigSummary, () => EvaluationRagConfigSummary],
];
var EvaluationModelConfigSummary = [3, n0, _EMCS, 0, [_bMIe, _pISI], [64 | 0, 64 | 0]];
var EvaluationOutputDataConfig = [3, n0, _EODC, 0, [_sU], [0]];
var EvaluationPrecomputedInferenceSource = [3, n0, _EPIS, 0, [_iSI], [0]];
var EvaluationPrecomputedRetrieveAndGenerateSourceConfig = [
    3,
    n0,
    _EPRAGSC,
    0,
    [_rSI],
    [0],
];
var EvaluationPrecomputedRetrieveSourceConfig = [3, n0, _EPRSC, 0, [_rSI], [0]];
var EvaluationRagConfigSummary = [3, n0, _ERCS, 0, [_bKBI, _pRSI], [64 | 0, 64 | 0]];
var EvaluationSummary = [
    3,
    n0,
    _ES,
    0,
    [_jA, _jN, _s, _cTr, _jTo, _eTT, _mIod, _rIa, _eMI, _cMEMI, _iCS, _aT],
    [0, 0, 0, 5, 0, 64 | 0, 64 | 0, 64 | 0, 64 | 0, 64 | 0, () => EvaluationInferenceConfigSummary, 0],
];
var ExportAutomatedReasoningPolicyVersionRequest = [3, n0, _EARPVR, 0, [_pA], [[0, 1]]];
var ExportAutomatedReasoningPolicyVersionResponse = [
    3,
    n0,
    _EARPVRx,
    0,
    [_pD],
    [[() => AutomatedReasoningPolicyDefinition, 16]],
];
var ExternalSource = [
    3,
    n0,
    _ESx,
    0,
    [_sT, _sL, _bC],
    [0, () => S3ObjectDoc, [() => ByteContentDoc, 0]],
];
var ExternalSourcesGenerationConfiguration = [
    3,
    n0,
    _ESGC,
    0,
    [_pT, _gCu, _kIC, _aMRF],
    [[() => PromptTemplate, 0], () => GuardrailConfiguration, () => KbInferenceConfig, 128 | 15],
];
var ExternalSourcesRetrieveAndGenerateConfiguration = [
    3,
    n0,
    _ESRAGC,
    0,
    [_mA, _so, _gCe],
    [0, [() => ExternalSources, 0], [() => ExternalSourcesGenerationConfiguration, 0]],
];
var FieldForReranking = [3, n0, _FFR, 0, [_fN], [0]];
var FilterAttribute = [3, n0, _FA, 0, [_k, _va], [0, 15]];
var FoundationModelDetails = [
    3,
    n0,
    _FMD,
    0,
    [_mA, _mIo, _mN, _pN, _iM, _oM, _rSS, _cS, _iTS, _mL],
    [0, 0, 0, 0, 64 | 0, 64 | 0, 2, 64 | 0, 64 | 0, () => FoundationModelLifecycle],
];
var FoundationModelLifecycle = [3, n0, _FML, 0, [_s], [0]];
var FoundationModelSummary = [
    3,
    n0,
    _FMS,
    0,
    [_mA, _mIo, _mN, _pN, _iM, _oM, _rSS, _cS, _iTS, _mL],
    [0, 0, 0, 0, 64 | 0, 64 | 0, 2, 64 | 0, 64 | 0, () => FoundationModelLifecycle],
];
var GenerationConfiguration = [
    3,
    n0,
    _GC,
    0,
    [_pT, _gCu, _kIC, _aMRF],
    [[() => PromptTemplate, 0], () => GuardrailConfiguration, () => KbInferenceConfig, 128 | 15],
];
var GetAutomatedReasoningPolicyAnnotationsRequest = [
    3,
    n0,
    _GARPAR,
    0,
    [_pA, _bWI],
    [
        [0, 1],
        [0, 1],
    ],
];
var GetAutomatedReasoningPolicyAnnotationsResponse = [
    3,
    n0,
    _GARPARe,
    0,
    [_pA, _n, _bWI, _an, _aSH, _uA],
    [0, [() => AutomatedReasoningPolicyName, 0], 0, [() => AutomatedReasoningPolicyAnnotationList, 0], 0, 5],
];
var GetAutomatedReasoningPolicyBuildWorkflowRequest = [
    3,
    n0,
    _GARPBWR,
    0,
    [_pA, _bWI],
    [
        [0, 1],
        [0, 1],
    ],
];
var GetAutomatedReasoningPolicyBuildWorkflowResponse = [
    3,
    n0,
    _GARPBWRe,
    0,
    [_pA, _bWI, _s, _bWT, _dN, _dCT, _dD, _cA, _uA],
    [
        0,
        0,
        0,
        0,
        [() => AutomatedReasoningPolicyBuildDocumentName, 0],
        0,
        [() => AutomatedReasoningPolicyBuildDocumentDescription, 0],
        5,
        5,
    ],
];
var GetAutomatedReasoningPolicyBuildWorkflowResultAssetsRequest = [
    3,
    n0,
    _GARPBWRAR,
    0,
    [_pA, _bWI, _aTs],
    [
        [0, 1],
        [0, 1],
        [
            0,
            {
                [_hQ]: _aTs,
            },
        ],
    ],
];
var GetAutomatedReasoningPolicyBuildWorkflowResultAssetsResponse = [
    3,
    n0,
    _GARPBWRARe,
    0,
    [_pA, _bWI, _bWA],
    [0, 0, [() => AutomatedReasoningPolicyBuildResultAssets, 0]],
];
var GetAutomatedReasoningPolicyNextScenarioRequest = [
    3,
    n0,
    _GARPNSR,
    0,
    [_pA, _bWI],
    [
        [0, 1],
        [0, 1],
    ],
];
var GetAutomatedReasoningPolicyNextScenarioResponse = [
    3,
    n0,
    _GARPNSRe,
    0,
    [_pA, _sc],
    [0, [() => AutomatedReasoningPolicyScenario, 0]],
];
var GetAutomatedReasoningPolicyRequest = [3, n0, _GARPR, 0, [_pA], [[0, 1]]];
var GetAutomatedReasoningPolicyResponse = [
    3,
    n0,
    _GARPRe,
    0,
    [_pA, _n, _ve, _pI, _d, _dH, _kKA, _cA, _uA],
    [0, [() => AutomatedReasoningPolicyName, 0], 0, 0, [() => AutomatedReasoningPolicyDescription, 0], 0, 0, 5, 5],
];
var GetAutomatedReasoningPolicyTestCaseRequest = [
    3,
    n0,
    _GARPTCR,
    0,
    [_pA, _tCI],
    [
        [0, 1],
        [0, 1],
    ],
];
var GetAutomatedReasoningPolicyTestCaseResponse = [
    3,
    n0,
    _GARPTCRe,
    0,
    [_pA, _tCe],
    [0, [() => AutomatedReasoningPolicyTestCase, 0]],
];
var GetAutomatedReasoningPolicyTestResultRequest = [
    3,
    n0,
    _GARPTRR,
    0,
    [_pA, _bWI, _tCI],
    [
        [0, 1],
        [0, 1],
        [0, 1],
    ],
];
var GetAutomatedReasoningPolicyTestResultResponse = [
    3,
    n0,
    _GARPTRRe,
    0,
    [_tR],
    [[() => AutomatedReasoningPolicyTestResult, 0]],
];
var GetCustomModelDeploymentRequest = [3, n0, _GCMDR, 0, [_cMDI], [[0, 1]]];
var GetCustomModelDeploymentResponse = [
    3,
    n0,
    _GCMDRe,
    0,
    [_cMDA, _mDN, _mA, _cA, _s, _d, _fMa, _lUA],
    [0, 0, 0, 5, 0, 0, 0, 5],
];
var GetCustomModelRequest = [3, n0, _GCMR, 0, [_mI], [[0, 1]]];
var GetCustomModelResponse = [
    3,
    n0,
    _GCMRe,
    0,
    [_mA, _mN, _jN, _jA, _bMA, _cTu, _mKKA, _hP, _tDC, _vDC, _oDC, _tM, _vM, _cTr, _cC, _mSo, _fMa],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        128 | 0,
        [() => TrainingDataConfig, 0],
        () => ValidationDataConfig,
        () => OutputDataConfig,
        () => TrainingMetrics,
        () => ValidationMetrics,
        5,
        () => CustomizationConfig,
        0,
        0,
    ],
];
var GetEvaluationJobRequest = [
    3,
    n0,
    _GEJR,
    0,
    [_jI],
    [[() => EvaluationJobIdentifier, 1]],
];
var GetEvaluationJobResponse = [
    3,
    n0,
    _GEJRe,
    0,
    [_jN, _s, _jA, _jD, _rA, _cEKI, _jTo, _aT, _eC, _iC, _oDC, _cTr, _lMT, _fMai],
    [
        0,
        0,
        0,
        [() => EvaluationJobDescription, 0],
        0,
        0,
        0,
        0,
        [() => EvaluationConfig, 0],
        [() => EvaluationInferenceConfig, 0],
        () => EvaluationOutputDataConfig,
        5,
        5,
        64 | 0,
    ],
];
var GetFoundationModelAvailabilityRequest = [3, n0, _GFMAR, 0, [_mIo], [[0, 1]]];
var GetFoundationModelAvailabilityResponse = [
    3,
    n0,
    _GFMARe,
    0,
    [_mIo, _aA, _aS, _eAn, _rAe],
    [0, () => AgreementAvailability, 0, 0, 0],
];
var GetFoundationModelRequest = [3, n0, _GFMR, 0, [_mI], [[0, 1]]];
var GetFoundationModelResponse = [
    3,
    n0,
    _GFMRe,
    0,
    [_mD],
    [() => FoundationModelDetails],
];
var GetGuardrailRequest = [
    3,
    n0,
    _GGR,
    0,
    [_gIu, _gV],
    [
        [0, 1],
        [
            0,
            {
                [_hQ]: _gV,
            },
        ],
    ],
];
var GetGuardrailResponse = [
    3,
    n0,
    _GGRe,
    0,
    [_n, _d, _gI, _gA, _ve, _s, _tP, _cP, _wP, _sIP, _cGP, _aRP, _cRD, _cA, _uA, _sRt, _fR, _bIM, _bOM, _kKA],
    [
        [() => GuardrailName, 0],
        [() => GuardrailDescription, 0],
        0,
        0,
        0,
        0,
        [() => GuardrailTopicPolicy, 0],
        [() => GuardrailContentPolicy, 0],
        [() => GuardrailWordPolicy, 0],
        () => GuardrailSensitiveInformationPolicy,
        [() => GuardrailContextualGroundingPolicy, 0],
        () => GuardrailAutomatedReasoningPolicy,
        () => GuardrailCrossRegionDetails,
        5,
        5,
        [() => GuardrailStatusReasons, 0],
        [() => GuardrailFailureRecommendations, 0],
        [() => GuardrailBlockedMessaging, 0],
        [() => GuardrailBlockedMessaging, 0],
        0,
    ],
];
var GetImportedModelRequest = [3, n0, _GIMR, 0, [_mI], [[0, 1]]];
var GetImportedModelResponse = [
    3,
    n0,
    _GIMRe,
    0,
    [_mA, _mN, _jN, _jA, _mDS, _cTr, _mAo, _mKKA, _iS, _cMU],
    [0, 0, 0, 0, () => ModelDataSource, 5, 0, 0, 2, () => CustomModelUnits],
];
var GetInferenceProfileRequest = [3, n0, _GIPR, 0, [_iPI], [[0, 1]]];
var GetInferenceProfileResponse = [
    3,
    n0,
    _GIPRe,
    0,
    [_iPN, _d, _cA, _uA, _iPA, _mo, _iPIn, _s, _ty],
    [0, [() => InferenceProfileDescription, 0], 5, 5, 0, () => InferenceProfileModels, 0, 0, 0],
];
var GetMarketplaceModelEndpointRequest = [3, n0, _GMMER, 0, [_eA], [[0, 1]]];
var GetMarketplaceModelEndpointResponse = [
    3,
    n0,
    _GMMERe,
    0,
    [_mME],
    [() => MarketplaceModelEndpoint],
];
var GetModelCopyJobRequest = [3, n0, _GMCJR, 0, [_jA], [[0, 1]]];
var GetModelCopyJobResponse = [
    3,
    n0,
    _GMCJRe,
    0,
    [_jA, _s, _cTr, _tMA, _tMN, _sAI, _sMA, _tMKKA, _tMT, _fMa, _sMN],
    [0, 0, 5, 0, 0, 0, 0, 0, () => TagList, 0, 0],
];
var GetModelCustomizationJobRequest = [3, n0, _GMCJRet, 0, [_jI], [[0, 1]]];
var GetModelCustomizationJobResponse = [
    3,
    n0,
    _GMCJReto,
    0,
    [
        _jA,
        _jN,
        _oMN,
        _oMA,
        _cRT,
        _rA,
        _s,
        _sD,
        _fMa,
        _cTr,
        _lMT,
        _eT,
        _bMA,
        _hP,
        _tDC,
        _vDC,
        _oDC,
        _cTu,
        _oMKKA,
        _tM,
        _vM,
        _vCp,
        _cC,
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        () => StatusDetails,
        0,
        5,
        5,
        5,
        0,
        128 | 0,
        [() => TrainingDataConfig, 0],
        () => ValidationDataConfig,
        () => OutputDataConfig,
        0,
        0,
        () => TrainingMetrics,
        () => ValidationMetrics,
        () => VpcConfig,
        () => CustomizationConfig,
    ],
];
var GetModelImportJobRequest = [3, n0, _GMIJR, 0, [_jI], [[0, 1]]];
var GetModelImportJobResponse = [
    3,
    n0,
    _GMIJRe,
    0,
    [_jA, _jN, _iMN, _iMA, _rA, _mDS, _s, _fMa, _cTr, _lMT, _eT, _vCp, _iMKKA],
    [0, 0, 0, 0, 0, () => ModelDataSource, 0, 0, 5, 5, 5, () => VpcConfig, 0],
];
var GetModelInvocationJobRequest = [3, n0, _GMIJRet, 0, [_jI], [[0, 1]]];
var GetModelInvocationJobResponse = [
    3,
    n0,
    _GMIJReto,
    0,
    [_jA, _jN, _mIo, _cRT, _rA, _s, _m, _sTu, _lMT, _eT, _iDC, _oDC, _vCp, _tDIH, _jET],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        [() => Message, 0],
        5,
        5,
        5,
        () => ModelInvocationJobInputDataConfig,
        () => ModelInvocationJobOutputDataConfig,
        () => VpcConfig,
        1,
        5,
    ],
];
var GetModelInvocationLoggingConfigurationRequest = [3, n0, _GMILCR, 0, [], []];
var GetModelInvocationLoggingConfigurationResponse = [
    3,
    n0,
    _GMILCRe,
    0,
    [_lC],
    [() => LoggingConfig],
];
var GetPromptRouterRequest = [3, n0, _GPRR, 0, [_pRA], [[0, 1]]];
var GetPromptRouterResponse = [
    3,
    n0,
    _GPRRe,
    0,
    [_pRN, _rCo, _d, _cA, _uA, _pRA, _mo, _fM, _s, _ty],
    [
        0,
        () => RoutingCriteria,
        [() => PromptRouterDescription, 0],
        5,
        5,
        0,
        () => PromptRouterTargetModels,
        () => PromptRouterTargetModel,
        0,
        0,
    ],
];
var GetProvisionedModelThroughputRequest = [3, n0, _GPMTR, 0, [_pMI], [[0, 1]]];
var GetProvisionedModelThroughputResponse = [
    3,
    n0,
    _GPMTRe,
    0,
    [_mU, _dMU, _pMN, _pMA, _mA, _dMA, _fMA, _s, _cTr, _lMT, _fMa, _cD, _cET],
    [1, 1, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5],
];
var GetUseCaseForModelAccessRequest = [3, n0, _GUCFMAR, 0, [], []];
var GetUseCaseForModelAccessResponse = [3, n0, _GUCFMARe, 0, [_fD], [21]];
var GuardrailAutomatedReasoningPolicy = [3, n0, _GARP, 0, [_po, _cT], [64 | 0, 1]];
var GuardrailAutomatedReasoningPolicyConfig = [3, n0, _GARPC, 0, [_po, _cT], [64 | 0, 1]];
var GuardrailConfiguration = [3, n0, _GCu, 0, [_gI, _gV], [0, 0]];
var GuardrailContentFilter = [
    3,
    n0,
    _GCF,
    0,
    [_ty, _iSn, _oS, _iM, _oM, _iA, _oA, _iE, _oE],
    [
        0,
        0,
        0,
        [() => GuardrailModalities, 0],
        [() => GuardrailModalities, 0],
        [() => GuardrailContentFilterAction$1, 0],
        [() => GuardrailContentFilterAction$1, 0],
        2,
        2,
    ],
];
var GuardrailContentFilterConfig = [
    3,
    n0,
    _GCFC,
    0,
    [_ty, _iSn, _oS, _iM, _oM, _iA, _oA, _iE, _oE],
    [
        0,
        0,
        0,
        [() => GuardrailModalities, 0],
        [() => GuardrailModalities, 0],
        [() => GuardrailContentFilterAction$1, 0],
        [() => GuardrailContentFilterAction$1, 0],
        2,
        2,
    ],
];
var GuardrailContentFiltersTier = [
    3,
    n0,
    _GCFT,
    0,
    [_tNi],
    [[() => GuardrailContentFiltersTierName$1, 0]],
];
var GuardrailContentFiltersTierConfig = [
    3,
    n0,
    _GCFTC,
    0,
    [_tNi],
    [[() => GuardrailContentFiltersTierName$1, 0]],
];
var GuardrailContentPolicy = [
    3,
    n0,
    _GCP,
    0,
    [_fi, _ti],
    [
        [() => GuardrailContentFilters, 0],
        [() => GuardrailContentFiltersTier, 0],
    ],
];
var GuardrailContentPolicyConfig = [
    3,
    n0,
    _GCPC,
    0,
    [_fC, _tCi],
    [
        [() => GuardrailContentFiltersConfig, 0],
        [() => GuardrailContentFiltersTierConfig, 0],
    ],
];
var GuardrailContextualGroundingFilter = [
    3,
    n0,
    _GCGF,
    0,
    [_ty, _th, _ac, _ena],
    [0, 1, [() => GuardrailContextualGroundingAction$1, 0], 2],
];
var GuardrailContextualGroundingFilterConfig = [
    3,
    n0,
    _GCGFC,
    0,
    [_ty, _th, _ac, _ena],
    [0, 1, [() => GuardrailContextualGroundingAction$1, 0], 2],
];
var GuardrailContextualGroundingPolicy = [
    3,
    n0,
    _GCGP,
    0,
    [_fi],
    [[() => GuardrailContextualGroundingFilters, 0]],
];
var GuardrailContextualGroundingPolicyConfig = [
    3,
    n0,
    _GCGPC,
    0,
    [_fC],
    [[() => GuardrailContextualGroundingFiltersConfig, 0]],
];
var GuardrailCrossRegionConfig = [3, n0, _GCRC, 0, [_gPI], [0]];
var GuardrailCrossRegionDetails = [3, n0, _GCRD, 0, [_gPIu, _gPA], [0, 0]];
var GuardrailManagedWords = [
    3,
    n0,
    _GMW,
    0,
    [_ty, _iA, _oA, _iE, _oE],
    [0, [() => GuardrailWordAction$1, 0], [() => GuardrailWordAction$1, 0], 2, 2],
];
var GuardrailManagedWordsConfig = [
    3,
    n0,
    _GMWC,
    0,
    [_ty, _iA, _oA, _iE, _oE],
    [0, [() => GuardrailWordAction$1, 0], [() => GuardrailWordAction$1, 0], 2, 2],
];
var GuardrailPiiEntity = [
    3,
    n0,
    _GPE,
    0,
    [_ty, _ac, _iA, _oA, _iE, _oE],
    [0, 0, 0, 0, 2, 2],
];
var GuardrailPiiEntityConfig = [
    3,
    n0,
    _GPEC,
    0,
    [_ty, _ac, _iA, _oA, _iE, _oE],
    [0, 0, 0, 0, 2, 2],
];
var GuardrailRegex = [
    3,
    n0,
    _GR,
    0,
    [_n, _d, _pa, _ac, _iA, _oA, _iE, _oE],
    [0, 0, 0, 0, 0, 0, 2, 2],
];
var GuardrailRegexConfig = [
    3,
    n0,
    _GRC,
    0,
    [_n, _d, _pa, _ac, _iA, _oA, _iE, _oE],
    [0, 0, 0, 0, 0, 0, 2, 2],
];
var GuardrailSensitiveInformationPolicy = [
    3,
    n0,
    _GSIP,
    0,
    [_pEi, _re],
    [() => GuardrailPiiEntities, () => GuardrailRegexes],
];
var GuardrailSensitiveInformationPolicyConfig = [
    3,
    n0,
    _GSIPC,
    0,
    [_pEC, _rCe],
    [() => GuardrailPiiEntitiesConfig, () => GuardrailRegexesConfig],
];
var GuardrailSummary = [
    3,
    n0,
    _GS,
    0,
    [_i, _ar, _s, _n, _d, _ve, _cA, _uA, _cRD],
    [0, 0, 0, [() => GuardrailName, 0], [() => GuardrailDescription, 0], 0, 5, 5, () => GuardrailCrossRegionDetails],
];
var GuardrailTopic = [
    3,
    n0,
    _GT,
    0,
    [_n, _de, _exa, _ty, _iA, _oA, _iE, _oE],
    [
        [() => GuardrailTopicName, 0],
        [() => GuardrailTopicDefinition, 0],
        [() => GuardrailTopicExamples, 0],
        0,
        [() => GuardrailTopicAction$1, 0],
        [() => GuardrailTopicAction$1, 0],
        2,
        2,
    ],
];
var GuardrailTopicConfig = [
    3,
    n0,
    _GTC,
    0,
    [_n, _de, _exa, _ty, _iA, _oA, _iE, _oE],
    [
        [() => GuardrailTopicName, 0],
        [() => GuardrailTopicDefinition, 0],
        [() => GuardrailTopicExamples, 0],
        0,
        [() => GuardrailTopicAction$1, 0],
        [() => GuardrailTopicAction$1, 0],
        2,
        2,
    ],
];
var GuardrailTopicPolicy = [
    3,
    n0,
    _GTP,
    0,
    [_to, _ti],
    [
        [() => GuardrailTopics, 0],
        [() => GuardrailTopicsTier, 0],
    ],
];
var GuardrailTopicPolicyConfig = [
    3,
    n0,
    _GTPC,
    0,
    [_tCo, _tCi],
    [
        [() => GuardrailTopicsConfig, 0],
        [() => GuardrailTopicsTierConfig, 0],
    ],
];
var GuardrailTopicsTier = [3, n0, _GTT, 0, [_tNi], [[() => GuardrailTopicsTierName$1, 0]]];
var GuardrailTopicsTierConfig = [
    3,
    n0,
    _GTTC,
    0,
    [_tNi],
    [[() => GuardrailTopicsTierName$1, 0]],
];
var GuardrailWord = [
    3,
    n0,
    _GW,
    0,
    [_te, _iA, _oA, _iE, _oE],
    [0, [() => GuardrailWordAction$1, 0], [() => GuardrailWordAction$1, 0], 2, 2],
];
var GuardrailWordConfig = [
    3,
    n0,
    _GWC,
    0,
    [_te, _iA, _oA, _iE, _oE],
    [0, [() => GuardrailWordAction$1, 0], [() => GuardrailWordAction$1, 0], 2, 2],
];
var GuardrailWordPolicy = [
    3,
    n0,
    _GWP,
    0,
    [_w, _mWL],
    [
        [() => GuardrailWords, 0],
        [() => GuardrailManagedWordLists, 0],
    ],
];
var GuardrailWordPolicyConfig = [
    3,
    n0,
    _GWPC,
    0,
    [_wCo, _mWLC],
    [
        [() => GuardrailWordsConfig, 0],
        [() => GuardrailManagedWordListsConfig, 0],
    ],
];
var HumanEvaluationConfig = [
    3,
    n0,
    _HEC,
    0,
    [_hWC, _cM, _dMC],
    [
        [() => HumanWorkflowConfig, 0],
        [() => HumanEvaluationCustomMetrics, 0],
        [() => EvaluationDatasetMetricConfigs, 0],
    ],
];
var HumanEvaluationCustomMetric = [
    3,
    n0,
    _HECM,
    0,
    [_n, _d, _rM],
    [[() => EvaluationMetricName, 0], [() => EvaluationMetricDescription, 0], 0],
];
var HumanWorkflowConfig = [
    3,
    n0,
    _HWC,
    0,
    [_fDA, _in],
    [0, [() => HumanTaskInstructions, 0]],
];
var ImplicitFilterConfiguration = [
    3,
    n0,
    _IFC,
    0,
    [_mAe, _mA],
    [[() => MetadataAttributeSchemaList, 0], 0],
];
var ImportedModelSummary = [3, n0, _IMS, 0, [_mA, _mN, _cTr, _iS, _mAo], [0, 0, 5, 2, 0]];
var InferenceProfileModel = [3, n0, _IPM, 0, [_mA], [0]];
var InferenceProfileSummary = [
    3,
    n0,
    _IPS,
    0,
    [_iPN, _d, _cA, _uA, _iPA, _mo, _iPIn, _s, _ty],
    [0, [() => InferenceProfileDescription, 0], 5, 5, 0, () => InferenceProfileModels, 0, 0, 0],
];
var InternalServerException = [
    -3,
    n0,
    _ISE,
    {
        [_e]: _se,
        [_hE]: 500,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(InternalServerException, InternalServerException$1);
var InvocationLogsConfig = [
    3,
    n0,
    _ILC,
    0,
    [_uPR, _iLS, _rMF],
    [2, () => InvocationLogSource, [() => RequestMetadataFilters, 0]],
];
var KbInferenceConfig = [3, n0, _KIC, 0, [_tIC], [() => TextInferenceConfig]];
var KnowledgeBaseRetrievalConfiguration = [
    3,
    n0,
    _KBRC,
    0,
    [_vSC],
    [[() => KnowledgeBaseVectorSearchConfiguration, 0]],
];
var KnowledgeBaseRetrieveAndGenerateConfiguration = [
    3,
    n0,
    _KBRAGC,
    0,
    [_kBI, _mA, _rCet, _gCe, _oC],
    [
        0,
        0,
        [() => KnowledgeBaseRetrievalConfiguration, 0],
        [() => GenerationConfiguration, 0],
        () => OrchestrationConfiguration,
    ],
];
var KnowledgeBaseVectorSearchConfiguration = [
    3,
    n0,
    _KBVSC,
    0,
    [_nOR, _oST, _fil, _iFC, _rCer],
    [
        1,
        0,
        [() => RetrievalFilter, 0],
        [() => ImplicitFilterConfiguration, 0],
        [() => VectorSearchRerankingConfiguration, 0],
    ],
];
var LegalTerm = [3, n0, _LT, 0, [_ur], [0]];
var ListAutomatedReasoningPoliciesRequest = [
    3,
    n0,
    _LARPR,
    0,
    [_pA, _nT, _mR],
    [
        [
            0,
            {
                [_hQ]: _pA,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
    ],
];
var ListAutomatedReasoningPoliciesResponse = [
    3,
    n0,
    _LARPRi,
    0,
    [_aRPS, _nT],
    [[() => AutomatedReasoningPolicySummaries, 0], 0],
];
var ListAutomatedReasoningPolicyBuildWorkflowsRequest = [
    3,
    n0,
    _LARPBWR,
    0,
    [_pA, _nT, _mR],
    [
        [0, 1],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
    ],
];
var ListAutomatedReasoningPolicyBuildWorkflowsResponse = [
    3,
    n0,
    _LARPBWRi,
    0,
    [_aRPBWS, _nT],
    [() => AutomatedReasoningPolicyBuildWorkflowSummaries, 0],
];
var ListAutomatedReasoningPolicyTestCasesRequest = [
    3,
    n0,
    _LARPTCR,
    0,
    [_pA, _nT, _mR],
    [
        [0, 1],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
    ],
];
var ListAutomatedReasoningPolicyTestCasesResponse = [
    3,
    n0,
    _LARPTCRi,
    0,
    [_tCes, _nT],
    [[() => AutomatedReasoningPolicyTestCaseList, 0], 0],
];
var ListAutomatedReasoningPolicyTestResultsRequest = [
    3,
    n0,
    _LARPTRR,
    0,
    [_pA, _bWI, _nT, _mR],
    [
        [0, 1],
        [0, 1],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
    ],
];
var ListAutomatedReasoningPolicyTestResultsResponse = [
    3,
    n0,
    _LARPTRRi,
    0,
    [_tRe, _nT],
    [[() => AutomatedReasoningPolicyTestList, 0], 0],
];
var ListCustomModelDeploymentsRequest = [
    3,
    n0,
    _LCMDR,
    0,
    [_cB, _cAr, _nC, _mR, _nT, _sB, _sO, _sEt, _mAE],
    [
        [
            5,
            {
                [_hQ]: _cB,
            },
        ],
        [
            5,
            {
                [_hQ]: _cAr,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _mAE,
            },
        ],
    ],
];
var ListCustomModelDeploymentsResponse = [
    3,
    n0,
    _LCMDRi,
    0,
    [_nT, _mDSo],
    [0, () => CustomModelDeploymentSummaryList],
];
var ListCustomModelsRequest = [
    3,
    n0,
    _LCMR,
    0,
    [_cTB, _cTA, _nC, _bMAE, _fMAE, _mR, _nT, _sB, _sO, _iO, _mSo],
    [
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            0,
            {
                [_hQ]: _bMAE,
            },
        ],
        [
            0,
            {
                [_hQ]: _fMAE,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
        [
            2,
            {
                [_hQ]: _iO,
            },
        ],
        [
            0,
            {
                [_hQ]: _mSo,
            },
        ],
    ],
];
var ListCustomModelsResponse = [
    3,
    n0,
    _LCMRi,
    0,
    [_nT, _mSod],
    [0, () => CustomModelSummaryList],
];
var ListEvaluationJobsRequest = [
    3,
    n0,
    _LEJR,
    0,
    [_cTA, _cTB, _sEt, _aTE, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _aTE,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListEvaluationJobsResponse = [
    3,
    n0,
    _LEJRi,
    0,
    [_nT, _jSo],
    [0, () => EvaluationSummaries],
];
var ListFoundationModelAgreementOffersRequest = [
    3,
    n0,
    _LFMAOR,
    0,
    [_mIo, _oTf],
    [
        [0, 1],
        [
            0,
            {
                [_hQ]: _oTf,
            },
        ],
    ],
];
var ListFoundationModelAgreementOffersResponse = [
    3,
    n0,
    _LFMAORi,
    0,
    [_mIo, _of],
    [0, () => Offers],
];
var ListFoundationModelsRequest = [
    3,
    n0,
    _LFMR,
    0,
    [_bP, _bCT, _bOMy, _bIT],
    [
        [
            0,
            {
                [_hQ]: _bP,
            },
        ],
        [
            0,
            {
                [_hQ]: _bCT,
            },
        ],
        [
            0,
            {
                [_hQ]: _bOMy,
            },
        ],
        [
            0,
            {
                [_hQ]: _bIT,
            },
        ],
    ],
];
var ListFoundationModelsResponse = [
    3,
    n0,
    _LFMRi,
    0,
    [_mSod],
    [() => FoundationModelSummaryList],
];
var ListGuardrailsRequest = [
    3,
    n0,
    _LGR,
    0,
    [_gIu, _mR, _nT],
    [
        [
            0,
            {
                [_hQ]: _gIu,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
    ],
];
var ListGuardrailsResponse = [
    3,
    n0,
    _LGRi,
    0,
    [_g, _nT],
    [[() => GuardrailSummaries, 0], 0],
];
var ListImportedModelsRequest = [
    3,
    n0,
    _LIMR,
    0,
    [_cTB, _cTA, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListImportedModelsResponse = [
    3,
    n0,
    _LIMRi,
    0,
    [_nT, _mSod],
    [0, () => ImportedModelSummaryList],
];
var ListInferenceProfilesRequest = [
    3,
    n0,
    _LIPR,
    0,
    [_mR, _nT, _tE],
    [
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _ty,
            },
        ],
    ],
];
var ListInferenceProfilesResponse = [
    3,
    n0,
    _LIPRi,
    0,
    [_iPS, _nT],
    [[() => InferenceProfileSummaries, 0], 0],
];
var ListMarketplaceModelEndpointsRequest = [
    3,
    n0,
    _LMMER,
    0,
    [_mR, _nT, _mSE],
    [
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _mSI,
            },
        ],
    ],
];
var ListMarketplaceModelEndpointsResponse = [
    3,
    n0,
    _LMMERi,
    0,
    [_mMEa, _nT],
    [() => MarketplaceModelEndpointSummaries, 0],
];
var ListModelCopyJobsRequest = [
    3,
    n0,
    _LMCJR,
    0,
    [_cTA, _cTB, _sEt, _sAE, _sMAE, _tMNC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _sAE,
            },
        ],
        [
            0,
            {
                [_hQ]: _sMAE,
            },
        ],
        [
            0,
            {
                [_hQ]: _oMNC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListModelCopyJobsResponse = [
    3,
    n0,
    _LMCJRi,
    0,
    [_nT, _mCJS],
    [0, () => ModelCopyJobSummaries],
];
var ListModelCustomizationJobsRequest = [
    3,
    n0,
    _LMCJRis,
    0,
    [_cTA, _cTB, _sEt, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListModelCustomizationJobsResponse = [
    3,
    n0,
    _LMCJRist,
    0,
    [_nT, _mCJSo],
    [0, () => ModelCustomizationJobSummaries],
];
var ListModelImportJobsRequest = [
    3,
    n0,
    _LMIJR,
    0,
    [_cTA, _cTB, _sEt, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListModelImportJobsResponse = [
    3,
    n0,
    _LMIJRi,
    0,
    [_nT, _mIJS],
    [0, () => ModelImportJobSummaries],
];
var ListModelInvocationJobsRequest = [
    3,
    n0,
    _LMIJRis,
    0,
    [_sTA, _sTB, _sEt, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _sTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _sTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListModelInvocationJobsResponse = [
    3,
    n0,
    _LMIJRist,
    0,
    [_nT, _iJS],
    [0, [() => ModelInvocationJobSummaries, 0]],
];
var ListPromptRoutersRequest = [
    3,
    n0,
    _LPRR,
    0,
    [_mR, _nT, _ty],
    [
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _ty,
            },
        ],
    ],
];
var ListPromptRoutersResponse = [
    3,
    n0,
    _LPRRi,
    0,
    [_pRS, _nT],
    [[() => PromptRouterSummaries, 0], 0],
];
var ListProvisionedModelThroughputsRequest = [
    3,
    n0,
    _LPMTR,
    0,
    [_cTA, _cTB, _sEt, _mAE, _nC, _mR, _nT, _sB, _sO],
    [
        [
            5,
            {
                [_hQ]: _cTA,
            },
        ],
        [
            5,
            {
                [_hQ]: _cTB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sEt,
            },
        ],
        [
            0,
            {
                [_hQ]: _mAE,
            },
        ],
        [
            0,
            {
                [_hQ]: _nC,
            },
        ],
        [
            1,
            {
                [_hQ]: _mR,
            },
        ],
        [
            0,
            {
                [_hQ]: _nT,
            },
        ],
        [
            0,
            {
                [_hQ]: _sB,
            },
        ],
        [
            0,
            {
                [_hQ]: _sO,
            },
        ],
    ],
];
var ListProvisionedModelThroughputsResponse = [
    3,
    n0,
    _LPMTRi,
    0,
    [_nT, _pMS],
    [0, () => ProvisionedModelSummaries],
];
var ListTagsForResourceRequest = [3, n0, _LTFRR, 0, [_rARN], [0]];
var ListTagsForResourceResponse = [3, n0, _LTFRRi, 0, [_ta], [() => TagList]];
var LoggingConfig = [
    3,
    n0,
    _LC,
    0,
    [_cWC, _sC, _tDDE, _iDDE, _eDDE, _vDDE],
    [() => CloudWatchConfig, () => S3Config, 2, 2, 2, 2],
];
var MarketplaceModelEndpoint = [
    3,
    n0,
    _MME,
    0,
    [_eA, _mSI, _s, _sM, _cA, _uA, _eCn, _eS, _eSM],
    [0, 0, 0, 0, 5, 5, () => EndpointConfig, 0, 0],
];
var MarketplaceModelEndpointSummary = [
    3,
    n0,
    _MMES,
    0,
    [_eA, _mSI, _s, _sM, _cA, _uA],
    [0, 0, 0, 0, 5, 5],
];
var MetadataAttributeSchema = [3, n0, _MAS, 8, [_k, _ty, _d], [0, 0, 0]];
var MetadataConfigurationForReranking = [
    3,
    n0,
    _MCFR,
    0,
    [_sMe, _sMC],
    [0, [() => RerankingMetadataSelectiveModeConfiguration, 0]],
];
var ModelCopyJobSummary = [
    3,
    n0,
    _MCJS,
    0,
    [_jA, _s, _cTr, _tMA, _tMN, _sAI, _sMA, _tMKKA, _tMT, _fMa, _sMN],
    [0, 0, 5, 0, 0, 0, 0, 0, () => TagList, 0, 0],
];
var ModelCustomizationJobSummary = [
    3,
    n0,
    _MCJSo,
    0,
    [_jA, _bMA, _jN, _s, _sD, _lMT, _cTr, _eT, _cMA, _cMN, _cTu],
    [0, 0, 0, 0, () => StatusDetails, 5, 5, 5, 0, 0, 0],
];
var ModelImportJobSummary = [
    3,
    n0,
    _MIJS,
    0,
    [_jA, _jN, _s, _lMT, _cTr, _eT, _iMA, _iMN],
    [0, 0, 0, 5, 5, 5, 0, 0],
];
var ModelInvocationJobS3InputDataConfig = [
    3,
    n0,
    _MIJSIDC,
    0,
    [_sIF, _sU, _sBO],
    [0, 0, 0],
];
var ModelInvocationJobS3OutputDataConfig = [
    3,
    n0,
    _MIJSODC,
    0,
    [_sU, _sEKI, _sBO],
    [0, 0, 0],
];
var ModelInvocationJobSummary = [
    3,
    n0,
    _MIJSo,
    0,
    [_jA, _jN, _mIo, _cRT, _rA, _s, _m, _sTu, _lMT, _eT, _iDC, _oDC, _vCp, _tDIH, _jET],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        [() => Message, 0],
        5,
        5,
        5,
        () => ModelInvocationJobInputDataConfig,
        () => ModelInvocationJobOutputDataConfig,
        () => VpcConfig,
        1,
        5,
    ],
];
var Offer = [3, n0, _O, 0, [_oI, _oT, _tD], [0, 0, () => TermDetails]];
var OrchestrationConfiguration = [
    3,
    n0,
    _OC,
    0,
    [_qTC],
    [() => QueryTransformationConfiguration],
];
var OutputDataConfig = [3, n0, _ODC, 0, [_sU], [0]];
var PerformanceConfiguration = [3, n0, _PC, 0, [_la], [0]];
var PricingTerm = [3, n0, _PT, 0, [_rCa], [() => RateCard]];
var PromptRouterSummary = [
    3,
    n0,
    _PRS,
    0,
    [_pRN, _rCo, _d, _cA, _uA, _pRA, _mo, _fM, _s, _ty],
    [
        0,
        () => RoutingCriteria,
        [() => PromptRouterDescription, 0],
        5,
        5,
        0,
        () => PromptRouterTargetModels,
        () => PromptRouterTargetModel,
        0,
        0,
    ],
];
var PromptRouterTargetModel = [3, n0, _PRTM, 0, [_mA], [0]];
var PromptTemplate = [3, n0, _PTr, 0, [_tPT], [[() => TextPromptTemplate, 0]]];
var ProvisionedModelSummary = [
    3,
    n0,
    _PMS,
    0,
    [_pMN, _pMA, _mA, _dMA, _fMA, _mU, _dMU, _s, _cD, _cET, _cTr, _lMT],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 5, 5, 5],
];
var PutModelInvocationLoggingConfigurationRequest = [
    3,
    n0,
    _PMILCR,
    0,
    [_lC],
    [() => LoggingConfig],
];
var PutModelInvocationLoggingConfigurationResponse = [3, n0, _PMILCRu, 0, [], []];
var PutUseCaseForModelAccessRequest = [3, n0, _PUCFMAR, 0, [_fD], [21]];
var PutUseCaseForModelAccessResponse = [3, n0, _PUCFMARu, 0, [], []];
var QueryTransformationConfiguration = [3, n0, _QTC, 0, [_ty], [0]];
var RatingScaleItem = [3, n0, _RSI, 0, [_de, _va], [0, () => RatingScaleItemValue]];
var RegisterMarketplaceModelEndpointRequest = [
    3,
    n0,
    _RMMER,
    0,
    [_eI, _mSI],
    [[0, 1], 0],
];
var RegisterMarketplaceModelEndpointResponse = [
    3,
    n0,
    _RMMERe,
    0,
    [_mME],
    [() => MarketplaceModelEndpoint],
];
var RequestMetadataBaseFilters = [
    3,
    n0,
    _RMBF,
    0,
    [_eq, _nE],
    [
        [() => RequestMetadataMap, 0],
        [() => RequestMetadataMap, 0],
    ],
];
var ResourceInUseException = [
    -3,
    n0,
    _RIUE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ResourceInUseException, ResourceInUseException$1);
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
var RetrieveAndGenerateConfiguration = [
    3,
    n0,
    _RAGC,
    0,
    [_ty, _kBC, _eSC],
    [
        0,
        [() => KnowledgeBaseRetrieveAndGenerateConfiguration, 0],
        [() => ExternalSourcesRetrieveAndGenerateConfiguration, 0],
    ],
];
var RetrieveConfig = [
    3,
    n0,
    _RC,
    0,
    [_kBI, _kBRC],
    [0, [() => KnowledgeBaseRetrievalConfiguration, 0]],
];
var RoutingCriteria = [3, n0, _RCo, 0, [_rQD], [1]];
var S3Config = [3, n0, _SC, 0, [_bN, _kP], [0, 0]];
var S3DataSource = [3, n0, _SDS, 0, [_sU], [0]];
var S3ObjectDoc = [3, n0, _SOD, 0, [_uri], [0]];
var SageMakerEndpoint = [
    3,
    n0,
    _SME,
    0,
    [_iIC, _iT, _eRx, _kEK, _vp],
    [1, 0, 0, 0, () => VpcConfig],
];
var ServiceQuotaExceededException = [
    -3,
    n0,
    _SQEE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ServiceQuotaExceededException, ServiceQuotaExceededException$1);
var ServiceUnavailableException = [
    -3,
    n0,
    _SUE,
    {
        [_e]: _se,
        [_hE]: 503,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ServiceUnavailableException, ServiceUnavailableException$1);
var StartAutomatedReasoningPolicyBuildWorkflowRequest = [
    3,
    n0,
    _SARPBWR,
    0,
    [_pA, _bWT, _cRT, _sCo],
    [
        [0, 1],
        [0, 1],
        [
            0,
            {
                [_hH]: _xact,
                [_iTd]: 1,
            },
        ],
        [() => AutomatedReasoningPolicyBuildWorkflowSource, 16],
    ],
];
var StartAutomatedReasoningPolicyBuildWorkflowResponse = [
    3,
    n0,
    _SARPBWRt,
    0,
    [_pA, _bWI],
    [0, 0],
];
var StartAutomatedReasoningPolicyTestWorkflowRequest = [
    3,
    n0,
    _SARPTWR,
    0,
    [_pA, _bWI, _tCIe, _cRT],
    [[0, 1], [0, 1], 64 | 0, [0, 4]],
];
var StartAutomatedReasoningPolicyTestWorkflowResponse = [3, n0, _SARPTWRt, 0, [_pA], [0]];
var StatusDetails = [
    3,
    n0,
    _SD,
    0,
    [_vD, _dPD, _tDr],
    [() => ValidationDetails, () => DataProcessingDetails, () => TrainingDetails],
];
var StopEvaluationJobRequest = [
    3,
    n0,
    _SEJR,
    0,
    [_jI],
    [[() => EvaluationJobIdentifier, 1]],
];
var StopEvaluationJobResponse = [3, n0, _SEJRt, 0, [], []];
var StopModelCustomizationJobRequest = [3, n0, _SMCJR, 0, [_jI], [[0, 1]]];
var StopModelCustomizationJobResponse = [3, n0, _SMCJRt, 0, [], []];
var StopModelInvocationJobRequest = [3, n0, _SMIJR, 0, [_jI], [[0, 1]]];
var StopModelInvocationJobResponse = [3, n0, _SMIJRt, 0, [], []];
var SupportTerm = [3, n0, _ST, 0, [_rPD], [0]];
var Tag = [3, n0, _T, 0, [_k, _va], [0, 0]];
var TagResourceRequest = [3, n0, _TRR, 0, [_rARN, _ta], [0, () => TagList]];
var TagResourceResponse = [3, n0, _TRRa, 0, [], []];
var TeacherModelConfig = [3, n0, _TMC, 0, [_tMI, _mRLFI], [0, 1]];
var TermDetails = [
    3,
    n0,
    _TD,
    0,
    [_uBPT, _lT, _sTup, _vT],
    [() => PricingTerm, () => LegalTerm, () => SupportTerm, () => ValidityTerm],
];
var TextInferenceConfig = [3, n0, _TIC, 0, [_tem, _tPo, _mTa, _sS], [1, 1, 1, 64 | 0]];
var ThrottlingException = [
    -3,
    n0,
    _TE,
    {
        [_e]: _c,
        [_hE]: 429,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ThrottlingException, ThrottlingException$1);
var TooManyTagsException = [
    -3,
    n0,
    _TMTE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m, _rN],
    [0, 0],
];
schema.TypeRegistry.for(n0).registerError(TooManyTagsException, TooManyTagsException$1);
var TrainingDataConfig = [
    3,
    n0,
    _TDC,
    0,
    [_sU, _iLC],
    [0, [() => InvocationLogsConfig, 0]],
];
var TrainingDetails = [3, n0, _TDr, 0, [_s, _cTr, _lMT], [0, 5, 5]];
var TrainingMetrics = [3, n0, _TM, 0, [_tL], [1]];
var UntagResourceRequest = [3, n0, _URR, 0, [_rARN, _tK], [0, 64 | 0]];
var UntagResourceResponse = [3, n0, _URRn, 0, [], []];
var UpdateAutomatedReasoningPolicyAnnotationsRequest = [
    3,
    n0,
    _UARPAR,
    0,
    [_pA, _bWI, _an, _lUASH],
    [[0, 1], [0, 1], [() => AutomatedReasoningPolicyAnnotationList, 0], 0],
];
var UpdateAutomatedReasoningPolicyAnnotationsResponse = [
    3,
    n0,
    _UARPARp,
    0,
    [_pA, _bWI, _aSH, _uA],
    [0, 0, 0, 5],
];
var UpdateAutomatedReasoningPolicyRequest = [
    3,
    n0,
    _UARPR,
    0,
    [_pA, _pD, _n, _d],
    [
        [0, 1],
        [() => AutomatedReasoningPolicyDefinition, 0],
        [() => AutomatedReasoningPolicyName, 0],
        [() => AutomatedReasoningPolicyDescription, 0],
    ],
];
var UpdateAutomatedReasoningPolicyResponse = [
    3,
    n0,
    _UARPRp,
    0,
    [_pA, _n, _dH, _uA],
    [0, [() => AutomatedReasoningPolicyName, 0], 0, 5],
];
var UpdateAutomatedReasoningPolicyTestCaseRequest = [
    3,
    n0,
    _UARPTCR,
    0,
    [_pA, _tCI, _gC, _qC, _lUA, _eAFR, _cT, _cRT],
    [
        [0, 1],
        [0, 1],
        [() => AutomatedReasoningPolicyTestGuardContent, 0],
        [() => AutomatedReasoningPolicyTestQueryContent, 0],
        5,
        0,
        1,
        [0, 4],
    ],
];
var UpdateAutomatedReasoningPolicyTestCaseResponse = [
    3,
    n0,
    _UARPTCRp,
    0,
    [_pA, _tCI],
    [0, 0],
];
var UpdateGuardrailRequest = [
    3,
    n0,
    _UGR,
    0,
    [_gIu, _n, _d, _tPC, _cPC, _wPC, _sIPC, _cGPC, _aRPC, _cRC, _bIM, _bOM, _kKI],
    [
        [0, 1],
        [() => GuardrailName, 0],
        [() => GuardrailDescription, 0],
        [() => GuardrailTopicPolicyConfig, 0],
        [() => GuardrailContentPolicyConfig, 0],
        [() => GuardrailWordPolicyConfig, 0],
        () => GuardrailSensitiveInformationPolicyConfig,
        [() => GuardrailContextualGroundingPolicyConfig, 0],
        () => GuardrailAutomatedReasoningPolicyConfig,
        () => GuardrailCrossRegionConfig,
        [() => GuardrailBlockedMessaging, 0],
        [() => GuardrailBlockedMessaging, 0],
        0,
    ],
];
var UpdateGuardrailResponse = [3, n0, _UGRp, 0, [_gI, _gA, _ve, _uA], [0, 0, 0, 5]];
var UpdateMarketplaceModelEndpointRequest = [
    3,
    n0,
    _UMMER,
    0,
    [_eA, _eCn, _cRT],
    [[0, 1], () => EndpointConfig, [0, 4]],
];
var UpdateMarketplaceModelEndpointResponse = [
    3,
    n0,
    _UMMERp,
    0,
    [_mME],
    [() => MarketplaceModelEndpoint],
];
var UpdateProvisionedModelThroughputRequest = [
    3,
    n0,
    _UPMTR,
    0,
    [_pMI, _dPMN, _dMI],
    [[0, 1], 0, 0],
];
var UpdateProvisionedModelThroughputResponse = [3, n0, _UPMTRp, 0, [], []];
var ValidationDataConfig = [3, n0, _VDC, 0, [_val], [() => Validators]];
var ValidationDetails = [3, n0, _VD, 0, [_s, _cTr, _lMT], [0, 5, 5]];
var ValidationException = [
    -3,
    n0,
    _VE,
    {
        [_e]: _c,
        [_hE]: 400,
    },
    [_m],
    [0],
];
schema.TypeRegistry.for(n0).registerError(ValidationException, ValidationException$1);
var Validator = [3, n0, _V, 0, [_sU], [0]];
var ValidatorMetric = [3, n0, _VM, 0, [_vL], [1]];
var ValidityTerm = [3, n0, _VT, 0, [_aD], [0]];
var VectorSearchBedrockRerankingConfiguration = [
    3,
    n0,
    _VSBRC,
    0,
    [_mC, _nORR, _mCe],
    [() => VectorSearchBedrockRerankingModelConfiguration, 1, [() => MetadataConfigurationForReranking, 0]],
];
var VectorSearchBedrockRerankingModelConfiguration = [
    3,
    n0,
    _VSBRMC,
    0,
    [_mA, _aMRF],
    [0, 128 | 15],
];
var VectorSearchRerankingConfiguration = [
    3,
    n0,
    _VSRC,
    0,
    [_ty, _bRC],
    [0, [() => VectorSearchBedrockRerankingConfiguration, 0]],
];
var VpcConfig = [3, n0, _VC, 0, [_sI, _sGI], [64 | 0, 64 | 0]];
var BedrockServiceException = [-3, _sm, "BedrockServiceException", 0, [], []];
schema.TypeRegistry.for(_sm).registerError(BedrockServiceException, BedrockServiceException$1);
var AutomatedEvaluationCustomMetrics = [
    1,
    n0,
    _AECM,
    0,
    [() => AutomatedEvaluationCustomMetricSource, 0],
];
var AutomatedReasoningCheckDifferenceScenarioList = [
    1,
    n0,
    _ARCDSL,
    0,
    [() => AutomatedReasoningCheckScenario, 0],
];
var AutomatedReasoningCheckFindingList = [
    1,
    n0,
    _ARCFL,
    0,
    [() => AutomatedReasoningCheckFinding, 0],
];
var AutomatedReasoningCheckInputTextReferenceList = [
    1,
    n0,
    _ARCITRL,
    0,
    [() => AutomatedReasoningCheckInputTextReference, 0],
];
var AutomatedReasoningCheckRuleList = [1, n0, _ARCRL, 0, () => AutomatedReasoningCheckRule];
var AutomatedReasoningCheckTranslationList = [
    1,
    n0,
    _ARCTL,
    0,
    [() => AutomatedReasoningCheckTranslation, 0],
];
var AutomatedReasoningCheckTranslationOptionList = [
    1,
    n0,
    _ARCTOL,
    0,
    [() => AutomatedReasoningCheckTranslationOption, 0],
];
var AutomatedReasoningLogicStatementList = [
    1,
    n0,
    _ARLSL,
    0,
    [() => AutomatedReasoningLogicStatement, 0],
];
var AutomatedReasoningPolicyAnnotationList = [
    1,
    n0,
    _ARPAL,
    0,
    [() => AutomatedReasoningPolicyAnnotation, 0],
];
var AutomatedReasoningPolicyBuildLogEntryList = [
    1,
    n0,
    _ARPBLEL,
    0,
    [() => AutomatedReasoningPolicyBuildLogEntry, 0],
];
var AutomatedReasoningPolicyBuildStepList = [
    1,
    n0,
    _ARPBSL,
    0,
    [() => AutomatedReasoningPolicyBuildStep, 0],
];
var AutomatedReasoningPolicyBuildStepMessageList = [
    1,
    n0,
    _ARPBSML,
    0,
    () => AutomatedReasoningPolicyBuildStepMessage,
];
var AutomatedReasoningPolicyBuildWorkflowDocumentList = [
    1,
    n0,
    _ARPBWDL,
    0,
    [() => AutomatedReasoningPolicyBuildWorkflowDocument, 0],
];
var AutomatedReasoningPolicyBuildWorkflowSummaries = [
    1,
    n0,
    _ARPBWSut,
    0,
    () => AutomatedReasoningPolicyBuildWorkflowSummary,
];
var AutomatedReasoningPolicyDefinitionRuleList = [
    1,
    n0,
    _ARPDRL,
    0,
    [() => AutomatedReasoningPolicyDefinitionRule, 0],
];
var AutomatedReasoningPolicyDefinitionTypeList = [
    1,
    n0,
    _ARPDTL,
    0,
    [() => AutomatedReasoningPolicyDefinitionType, 0],
];
var AutomatedReasoningPolicyDefinitionTypeNameList = [
    1,
    n0,
    _ARPDTNL,
    0,
    [() => AutomatedReasoningPolicyDefinitionTypeName, 0],
];
var AutomatedReasoningPolicyDefinitionTypeValueList = [
    1,
    n0,
    _ARPDTVL,
    0,
    [() => AutomatedReasoningPolicyDefinitionTypeValue, 0],
];
var AutomatedReasoningPolicyDefinitionTypeValuePairList = [
    1,
    n0,
    _ARPDTVPL,
    0,
    [() => AutomatedReasoningPolicyDefinitionTypeValuePair, 0],
];
var AutomatedReasoningPolicyDefinitionVariableList = [
    1,
    n0,
    _ARPDVL,
    0,
    [() => AutomatedReasoningPolicyDefinitionVariable, 0],
];
var AutomatedReasoningPolicyDefinitionVariableNameList = [
    1,
    n0,
    _ARPDVNL,
    0,
    [() => AutomatedReasoningPolicyDefinitionVariableName, 0],
];
var AutomatedReasoningPolicyDisjointRuleSetList = [
    1,
    n0,
    _ARPDRSL,
    0,
    [() => AutomatedReasoningPolicyDisjointRuleSet, 0],
];
var AutomatedReasoningPolicyGeneratedTestCaseList = [
    1,
    n0,
    _ARPGTCL,
    0,
    [() => AutomatedReasoningPolicyGeneratedTestCase, 0],
];
var AutomatedReasoningPolicySummaries = [
    1,
    n0,
    _ARPSut,
    0,
    [() => AutomatedReasoningPolicySummary, 0],
];
var AutomatedReasoningPolicyTestCaseList = [
    1,
    n0,
    _ARPTCL,
    0,
    [() => AutomatedReasoningPolicyTestCase, 0],
];
var AutomatedReasoningPolicyTestList = [
    1,
    n0,
    _ARPTL,
    0,
    [() => AutomatedReasoningPolicyTestResult, 0],
];
var AutomatedReasoningPolicyTypeValueAnnotationList = [
    1,
    n0,
    _ARPTVAL,
    0,
    [() => AutomatedReasoningPolicyTypeValueAnnotation, 0],
];
var BatchDeleteEvaluationJobErrors = [
    1,
    n0,
    _BDEJEa,
    0,
    [() => BatchDeleteEvaluationJobError, 0],
];
var BatchDeleteEvaluationJobItems = [
    1,
    n0,
    _BDEJIa,
    0,
    [() => BatchDeleteEvaluationJobItem, 0],
];
var BedrockEvaluatorModels = [1, n0, _BEMe, 0, () => BedrockEvaluatorModel];
var CustomMetricBedrockEvaluatorModels = [
    1,
    n0,
    _CMBEMu,
    0,
    () => CustomMetricBedrockEvaluatorModel,
];
var CustomModelDeploymentSummaryList = [1, n0, _CMDSL, 0, () => CustomModelDeploymentSummary];
var CustomModelSummaryList = [1, n0, _CMSL, 0, () => CustomModelSummary];
var EvaluationDatasetMetricConfigs = [
    1,
    n0,
    _EDMCv,
    0,
    [() => EvaluationDatasetMetricConfig, 0],
];
var EvaluationJobIdentifiers = [1, n0, _EJIv, 0, [() => EvaluationJobIdentifier, 0]];
var EvaluationMetricNames = [1, n0, _EMNv, 0, [() => EvaluationMetricName, 0]];
var EvaluationModelConfigs = [1, n0, _EMC, 0, [() => EvaluationModelConfig, 0]];
var EvaluationSummaries = [1, n0, _ESv, 0, () => EvaluationSummary];
var ExternalSources = [1, n0, _ESxt, 0, [() => ExternalSource, 0]];
var FieldsForReranking = [1, n0, _FFRi, 8, () => FieldForReranking];
var FoundationModelSummaryList = [1, n0, _FMSL, 0, () => FoundationModelSummary];
var GuardrailContentFilters = [1, n0, _GCFu, 0, [() => GuardrailContentFilter, 0]];
var GuardrailContentFiltersConfig = [
    1,
    n0,
    _GCFCu,
    0,
    [() => GuardrailContentFilterConfig, 0],
];
var GuardrailContextualGroundingFilters = [
    1,
    n0,
    _GCGFu,
    0,
    [() => GuardrailContextualGroundingFilter, 0],
];
var GuardrailContextualGroundingFiltersConfig = [
    1,
    n0,
    _GCGFCu,
    0,
    [() => GuardrailContextualGroundingFilterConfig, 0],
];
var GuardrailFailureRecommendations = [
    1,
    n0,
    _GFRu,
    0,
    [() => GuardrailFailureRecommendation, 0],
];
var GuardrailManagedWordLists = [1, n0, _GMWL, 0, [() => GuardrailManagedWords, 0]];
var GuardrailManagedWordListsConfig = [
    1,
    n0,
    _GMWLC,
    0,
    [() => GuardrailManagedWordsConfig, 0],
];
var GuardrailModalities = [1, n0, _GMu, 0, [() => GuardrailModality$1, 0]];
var GuardrailPiiEntities = [1, n0, _GPEu, 0, () => GuardrailPiiEntity];
var GuardrailPiiEntitiesConfig = [1, n0, _GPECu, 0, () => GuardrailPiiEntityConfig];
var GuardrailRegexes = [1, n0, _GRu, 0, () => GuardrailRegex];
var GuardrailRegexesConfig = [1, n0, _GRCu, 0, () => GuardrailRegexConfig];
var GuardrailStatusReasons = [1, n0, _GSRu, 0, [() => GuardrailStatusReason, 0]];
var GuardrailSummaries = [1, n0, _GSu, 0, [() => GuardrailSummary, 0]];
var GuardrailTopicExamples = [1, n0, _GTEu, 0, [() => GuardrailTopicExample, 0]];
var GuardrailTopics = [1, n0, _GTu, 0, [() => GuardrailTopic, 0]];
var GuardrailTopicsConfig = [1, n0, _GTCu, 0, [() => GuardrailTopicConfig, 0]];
var GuardrailWords = [1, n0, _GWu, 0, [() => GuardrailWord, 0]];
var GuardrailWordsConfig = [1, n0, _GWCu, 0, [() => GuardrailWordConfig, 0]];
var HumanEvaluationCustomMetrics = [1, n0, _HECMu, 0, [() => HumanEvaluationCustomMetric, 0]];
var ImportedModelSummaryList = [1, n0, _IMSL, 0, () => ImportedModelSummary];
var InferenceProfileModels = [1, n0, _IPMn, 0, () => InferenceProfileModel];
var InferenceProfileSummaries = [1, n0, _IPSn, 0, [() => InferenceProfileSummary, 0]];
var MarketplaceModelEndpointSummaries = [
    1,
    n0,
    _MMESa,
    0,
    () => MarketplaceModelEndpointSummary,
];
var MetadataAttributeSchemaList = [1, n0, _MASL, 0, [() => MetadataAttributeSchema, 0]];
var ModelCopyJobSummaries = [1, n0, _MCJSod, 0, () => ModelCopyJobSummary];
var ModelCustomizationJobSummaries = [1, n0, _MCJSode, 0, () => ModelCustomizationJobSummary];
var ModelImportJobSummaries = [1, n0, _MIJSod, 0, () => ModelImportJobSummary];
var ModelInvocationJobSummaries = [1, n0, _MIJSode, 0, [() => ModelInvocationJobSummary, 0]];
var Offers = [1, n0, _Of, 0, () => Offer];
var PromptRouterSummaries = [1, n0, _PRSr, 0, [() => PromptRouterSummary, 0]];
var PromptRouterTargetModels = [1, n0, _PRTMr, 0, () => PromptRouterTargetModel];
var ProvisionedModelSummaries = [1, n0, _PMSr, 0, () => ProvisionedModelSummary];
var RagConfigs = [1, n0, _RCa, 0, [() => RAGConfig, 0]];
var RateCard = [1, n0, _RCat, 0, () => DimensionalPriceRate];
var RatingScale = [1, n0, _RS, 0, () => RatingScaleItem];
var RequestMetadataFiltersList = [1, n0, _RMFL, 0, [() => RequestMetadataBaseFilters, 0]];
var RetrievalFilterList = [1, n0, _RFL, 0, [() => RetrievalFilter, 0]];
var TagList = [1, n0, _TL, 0, () => Tag];
var ValidationMetrics = [1, n0, _VMa, 0, () => ValidatorMetric];
var Validators = [1, n0, _Va, 0, () => Validator];
var RequestMetadataMap = [2, n0, _RMM, 8, 0, 0];
var AutomatedEvaluationCustomMetricSource = [
    3,
    n0,
    _AECMS,
    0,
    [_cMD],
    [[() => CustomMetricDefinition, 0]],
];
var AutomatedReasoningCheckFinding = [
    3,
    n0,
    _ARCF,
    0,
    [_vali, _inv, _sa, _im, _tA, _tCoo, _nTo],
    [
        [() => AutomatedReasoningCheckValidFinding, 0],
        [() => AutomatedReasoningCheckInvalidFinding, 0],
        [() => AutomatedReasoningCheckSatisfiableFinding, 0],
        [() => AutomatedReasoningCheckImpossibleFinding, 0],
        [() => AutomatedReasoningCheckTranslationAmbiguousFinding, 0],
        () => AutomatedReasoningCheckTooComplexFinding,
        () => AutomatedReasoningCheckNoTranslationsFinding,
    ],
];
var AutomatedReasoningPolicyAnnotation = [
    3,
    n0,
    _ARPA,
    0,
    [_aTd, _uTp, _dT, _aV, _uVp, _dV, _aR, _uR, _dR, _aRFNL, _uFRF, _uFSF, _iCn],
    [
        [() => AutomatedReasoningPolicyAddTypeAnnotation, 0],
        [() => AutomatedReasoningPolicyUpdateTypeAnnotation, 0],
        [() => AutomatedReasoningPolicyDeleteTypeAnnotation, 0],
        [() => AutomatedReasoningPolicyAddVariableAnnotation, 0],
        [() => AutomatedReasoningPolicyUpdateVariableAnnotation, 0],
        [() => AutomatedReasoningPolicyDeleteVariableAnnotation, 0],
        [() => AutomatedReasoningPolicyAddRuleAnnotation, 0],
        [() => AutomatedReasoningPolicyUpdateRuleAnnotation, 0],
        () => AutomatedReasoningPolicyDeleteRuleAnnotation,
        [() => AutomatedReasoningPolicyAddRuleFromNaturalLanguageAnnotation, 0],
        [() => AutomatedReasoningPolicyUpdateFromRuleFeedbackAnnotation, 0],
        [() => AutomatedReasoningPolicyUpdateFromScenarioFeedbackAnnotation, 0],
        [() => AutomatedReasoningPolicyIngestContentAnnotation, 0],
    ],
];
var AutomatedReasoningPolicyBuildResultAssets = [
    3,
    n0,
    _ARPBRA,
    0,
    [_pD, _qR, _bL, _gTC],
    [
        [() => AutomatedReasoningPolicyDefinition, 0],
        [() => AutomatedReasoningPolicyDefinitionQualityReport, 0],
        [() => AutomatedReasoningPolicyBuildLog, 0],
        [() => AutomatedReasoningPolicyGeneratedTestCases, 0],
    ],
];
var AutomatedReasoningPolicyBuildStepContext = [
    3,
    n0,
    _ARPBSC,
    0,
    [_pl, _mu],
    [() => AutomatedReasoningPolicyPlanning, [() => AutomatedReasoningPolicyMutation, 0]],
];
var AutomatedReasoningPolicyDefinitionElement = [
    3,
    n0,
    _ARPDE,
    0,
    [_pDV, _pDT, _pDR],
    [
        [() => AutomatedReasoningPolicyDefinitionVariable, 0],
        [() => AutomatedReasoningPolicyDefinitionType, 0],
        [() => AutomatedReasoningPolicyDefinitionRule, 0],
    ],
];
var AutomatedReasoningPolicyMutation = [
    3,
    n0,
    _ARPM,
    0,
    [_aTd, _uTp, _dT, _aV, _uVp, _dV, _aR, _uR, _dR],
    [
        [() => AutomatedReasoningPolicyAddTypeMutation, 0],
        [() => AutomatedReasoningPolicyUpdateTypeMutation, 0],
        [() => AutomatedReasoningPolicyDeleteTypeMutation, 0],
        [() => AutomatedReasoningPolicyAddVariableMutation, 0],
        [() => AutomatedReasoningPolicyUpdateVariableMutation, 0],
        [() => AutomatedReasoningPolicyDeleteVariableMutation, 0],
        [() => AutomatedReasoningPolicyAddRuleMutation, 0],
        [() => AutomatedReasoningPolicyUpdateRuleMutation, 0],
        () => AutomatedReasoningPolicyDeleteRuleMutation,
    ],
];
var AutomatedReasoningPolicyTypeValueAnnotation = [
    3,
    n0,
    _ARPTVA,
    0,
    [_aTV, _uTVp, _dTV],
    [
        [() => AutomatedReasoningPolicyAddTypeValue, 0],
        [() => AutomatedReasoningPolicyUpdateTypeValue, 0],
        () => AutomatedReasoningPolicyDeleteTypeValue,
    ],
];
var AutomatedReasoningPolicyWorkflowTypeContent = [
    3,
    n0,
    _ARPWTC,
    0,
    [_doc, _pRAo],
    [
        [() => AutomatedReasoningPolicyBuildWorkflowDocumentList, 0],
        [() => AutomatedReasoningPolicyBuildWorkflowRepairContent, 0],
    ],
];
var CustomizationConfig = [3, n0, _CC, 0, [_dC], [() => DistillationConfig]];
var EndpointConfig = [3, n0, _EC, 0, [_sMa], [() => SageMakerEndpoint]];
var EvaluationConfig = [
    3,
    n0,
    _ECv,
    0,
    [_au, _h],
    [
        [() => AutomatedEvaluationConfig, 0],
        [() => HumanEvaluationConfig, 0],
    ],
];
var EvaluationDatasetLocation = [3, n0, _EDL, 0, [_sU], [0]];
var EvaluationInferenceConfig = [
    3,
    n0,
    _EIC,
    0,
    [_mo, _rCag],
    [
        [() => EvaluationModelConfigs, 0],
        [() => RagConfigs, 0],
    ],
];
var EvaluationModelConfig = [
    3,
    n0,
    _EMCv,
    0,
    [_bM, _pIS],
    [[() => EvaluationBedrockModel, 0], () => EvaluationPrecomputedInferenceSource],
];
var EvaluationPrecomputedRagSourceConfig = [
    3,
    n0,
    _EPRSCv,
    0,
    [_rSC, _rAGSC],
    [() => EvaluationPrecomputedRetrieveSourceConfig, () => EvaluationPrecomputedRetrieveAndGenerateSourceConfig],
];
var EvaluatorModelConfig = [3, n0, _EMCva, 0, [_bEM], [() => BedrockEvaluatorModels]];
var InferenceProfileModelSource = [3, n0, _IPMS, 0, [_cF], [0]];
var InvocationLogSource = [3, n0, _ILS, 0, [_sU], [0]];
var KnowledgeBaseConfig = [
    3,
    n0,
    _KBC,
    0,
    [_rCetr, _rAGC],
    [
        [() => RetrieveConfig, 0],
        [() => RetrieveAndGenerateConfiguration, 0],
    ],
];
var ModelDataSource = [3, n0, _MDS, 0, [_sDS], [() => S3DataSource]];
var ModelInvocationJobInputDataConfig = [
    3,
    n0,
    _MIJIDC,
    0,
    [_sIDC],
    [() => ModelInvocationJobS3InputDataConfig],
];
var ModelInvocationJobOutputDataConfig = [
    3,
    n0,
    _MIJODC,
    0,
    [_sODC],
    [() => ModelInvocationJobS3OutputDataConfig],
];
var RAGConfig = [
    3,
    n0,
    _RAGCo,
    0,
    [_kBCn, _pRSC],
    [[() => KnowledgeBaseConfig, 0], () => EvaluationPrecomputedRagSourceConfig],
];
var RatingScaleItemValue = [3, n0, _RSIV, 0, [_sV, _fV], [0, 1]];
var RequestMetadataFilters = [
    3,
    n0,
    _RMF,
    0,
    [_eq, _nE, _aAn, _oAr],
    [
        [() => RequestMetadataMap, 0],
        [() => RequestMetadataMap, 0],
        [() => RequestMetadataFiltersList, 0],
        [() => RequestMetadataFiltersList, 0],
    ],
];
var RerankingMetadataSelectiveModeConfiguration = [
    3,
    n0,
    _RMSMC,
    0,
    [_fTI, _fTE],
    [
        [() => FieldsForReranking, 0],
        [() => FieldsForReranking, 0],
    ],
];
var RetrievalFilter = [
    3,
    n0,
    _RF,
    8,
    [_eq, _nE, _gT, _gTOE, _lTe, _lTOE, _in_, _nI, _sW, _lCi, _sCt, _aAn, _oAr],
    [
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        () => FilterAttribute,
        [() => RetrievalFilterList, 0],
        [() => RetrievalFilterList, 0],
    ],
];
var BatchDeleteEvaluationJob = [
    9,
    n0,
    _BDEJ,
    {
        [_ht]: ["POST", "/evaluation-jobs/batch-delete", 202],
    },
    () => BatchDeleteEvaluationJobRequest,
    () => BatchDeleteEvaluationJobResponse,
];
var CancelAutomatedReasoningPolicyBuildWorkflow = [
    9,
    n0,
    _CARPBW,
    {
        [_ht]: ["POST", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/cancel", 202],
    },
    () => CancelAutomatedReasoningPolicyBuildWorkflowRequest,
    () => CancelAutomatedReasoningPolicyBuildWorkflowResponse,
];
var CreateAutomatedReasoningPolicy = [
    9,
    n0,
    _CARP,
    {
        [_ht]: ["POST", "/automated-reasoning-policies", 200],
    },
    () => CreateAutomatedReasoningPolicyRequest,
    () => CreateAutomatedReasoningPolicyResponse,
];
var CreateAutomatedReasoningPolicyTestCase = [
    9,
    n0,
    _CARPTC,
    {
        [_ht]: ["POST", "/automated-reasoning-policies/{policyArn}/test-cases", 200],
    },
    () => CreateAutomatedReasoningPolicyTestCaseRequest,
    () => CreateAutomatedReasoningPolicyTestCaseResponse,
];
var CreateAutomatedReasoningPolicyVersion = [
    9,
    n0,
    _CARPV,
    {
        [_ht]: ["POST", "/automated-reasoning-policies/{policyArn}/versions", 200],
    },
    () => CreateAutomatedReasoningPolicyVersionRequest,
    () => CreateAutomatedReasoningPolicyVersionResponse,
];
var CreateCustomModel = [
    9,
    n0,
    _CCM,
    {
        [_ht]: ["POST", "/custom-models/create-custom-model", 202],
    },
    () => CreateCustomModelRequest,
    () => CreateCustomModelResponse,
];
var CreateCustomModelDeployment = [
    9,
    n0,
    _CCMD,
    {
        [_ht]: ["POST", "/model-customization/custom-model-deployments", 202],
    },
    () => CreateCustomModelDeploymentRequest,
    () => CreateCustomModelDeploymentResponse,
];
var CreateEvaluationJob = [
    9,
    n0,
    _CEJ,
    {
        [_ht]: ["POST", "/evaluation-jobs", 202],
    },
    () => CreateEvaluationJobRequest,
    () => CreateEvaluationJobResponse,
];
var CreateFoundationModelAgreement = [
    9,
    n0,
    _CFMA,
    {
        [_ht]: ["POST", "/create-foundation-model-agreement", 202],
    },
    () => CreateFoundationModelAgreementRequest,
    () => CreateFoundationModelAgreementResponse,
];
var CreateGuardrail = [
    9,
    n0,
    _CG,
    {
        [_ht]: ["POST", "/guardrails", 202],
    },
    () => CreateGuardrailRequest,
    () => CreateGuardrailResponse,
];
var CreateGuardrailVersion = [
    9,
    n0,
    _CGV,
    {
        [_ht]: ["POST", "/guardrails/{guardrailIdentifier}", 202],
    },
    () => CreateGuardrailVersionRequest,
    () => CreateGuardrailVersionResponse,
];
var CreateInferenceProfile = [
    9,
    n0,
    _CIP,
    {
        [_ht]: ["POST", "/inference-profiles", 201],
    },
    () => CreateInferenceProfileRequest,
    () => CreateInferenceProfileResponse,
];
var CreateMarketplaceModelEndpoint = [
    9,
    n0,
    _CMME,
    {
        [_ht]: ["POST", "/marketplace-model/endpoints", 200],
    },
    () => CreateMarketplaceModelEndpointRequest,
    () => CreateMarketplaceModelEndpointResponse,
];
var CreateModelCopyJob = [
    9,
    n0,
    _CMCJ,
    {
        [_ht]: ["POST", "/model-copy-jobs", 201],
    },
    () => CreateModelCopyJobRequest,
    () => CreateModelCopyJobResponse,
];
var CreateModelCustomizationJob = [
    9,
    n0,
    _CMCJr,
    {
        [_ht]: ["POST", "/model-customization-jobs", 201],
    },
    () => CreateModelCustomizationJobRequest,
    () => CreateModelCustomizationJobResponse,
];
var CreateModelImportJob = [
    9,
    n0,
    _CMIJ,
    {
        [_ht]: ["POST", "/model-import-jobs", 201],
    },
    () => CreateModelImportJobRequest,
    () => CreateModelImportJobResponse,
];
var CreateModelInvocationJob = [
    9,
    n0,
    _CMIJr,
    {
        [_ht]: ["POST", "/model-invocation-job", 200],
    },
    () => CreateModelInvocationJobRequest,
    () => CreateModelInvocationJobResponse,
];
var CreatePromptRouter = [
    9,
    n0,
    _CPR,
    {
        [_ht]: ["POST", "/prompt-routers", 200],
    },
    () => CreatePromptRouterRequest,
    () => CreatePromptRouterResponse,
];
var CreateProvisionedModelThroughput = [
    9,
    n0,
    _CPMT,
    {
        [_ht]: ["POST", "/provisioned-model-throughput", 201],
    },
    () => CreateProvisionedModelThroughputRequest,
    () => CreateProvisionedModelThroughputResponse,
];
var DeleteAutomatedReasoningPolicy = [
    9,
    n0,
    _DARP,
    {
        [_ht]: ["DELETE", "/automated-reasoning-policies/{policyArn}", 202],
    },
    () => DeleteAutomatedReasoningPolicyRequest,
    () => DeleteAutomatedReasoningPolicyResponse,
];
var DeleteAutomatedReasoningPolicyBuildWorkflow = [
    9,
    n0,
    _DARPBW,
    {
        [_ht]: ["DELETE", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}", 202],
    },
    () => DeleteAutomatedReasoningPolicyBuildWorkflowRequest,
    () => DeleteAutomatedReasoningPolicyBuildWorkflowResponse,
];
var DeleteAutomatedReasoningPolicyTestCase = [
    9,
    n0,
    _DARPTC,
    {
        [_ht]: ["DELETE", "/automated-reasoning-policies/{policyArn}/test-cases/{testCaseId}", 202],
    },
    () => DeleteAutomatedReasoningPolicyTestCaseRequest,
    () => DeleteAutomatedReasoningPolicyTestCaseResponse,
];
var DeleteCustomModel = [
    9,
    n0,
    _DCM,
    {
        [_ht]: ["DELETE", "/custom-models/{modelIdentifier}", 200],
    },
    () => DeleteCustomModelRequest,
    () => DeleteCustomModelResponse,
];
var DeleteCustomModelDeployment = [
    9,
    n0,
    _DCMD,
    {
        [_ht]: ["DELETE", "/model-customization/custom-model-deployments/{customModelDeploymentIdentifier}", 200],
    },
    () => DeleteCustomModelDeploymentRequest,
    () => DeleteCustomModelDeploymentResponse,
];
var DeleteFoundationModelAgreement = [
    9,
    n0,
    _DFMA,
    {
        [_ht]: ["POST", "/delete-foundation-model-agreement", 202],
    },
    () => DeleteFoundationModelAgreementRequest,
    () => DeleteFoundationModelAgreementResponse,
];
var DeleteGuardrail = [
    9,
    n0,
    _DG,
    {
        [_ht]: ["DELETE", "/guardrails/{guardrailIdentifier}", 202],
    },
    () => DeleteGuardrailRequest,
    () => DeleteGuardrailResponse,
];
var DeleteImportedModel = [
    9,
    n0,
    _DIM,
    {
        [_ht]: ["DELETE", "/imported-models/{modelIdentifier}", 200],
    },
    () => DeleteImportedModelRequest,
    () => DeleteImportedModelResponse,
];
var DeleteInferenceProfile = [
    9,
    n0,
    _DIP,
    {
        [_ht]: ["DELETE", "/inference-profiles/{inferenceProfileIdentifier}", 200],
    },
    () => DeleteInferenceProfileRequest,
    () => DeleteInferenceProfileResponse,
];
var DeleteMarketplaceModelEndpoint = [
    9,
    n0,
    _DMME,
    {
        [_ht]: ["DELETE", "/marketplace-model/endpoints/{endpointArn}", 200],
    },
    () => DeleteMarketplaceModelEndpointRequest,
    () => DeleteMarketplaceModelEndpointResponse,
];
var DeleteModelInvocationLoggingConfiguration = [
    9,
    n0,
    _DMILC,
    {
        [_ht]: ["DELETE", "/logging/modelinvocations", 200],
    },
    () => DeleteModelInvocationLoggingConfigurationRequest,
    () => DeleteModelInvocationLoggingConfigurationResponse,
];
var DeletePromptRouter = [
    9,
    n0,
    _DPRe,
    {
        [_ht]: ["DELETE", "/prompt-routers/{promptRouterArn}", 200],
    },
    () => DeletePromptRouterRequest,
    () => DeletePromptRouterResponse,
];
var DeleteProvisionedModelThroughput = [
    9,
    n0,
    _DPMT,
    {
        [_ht]: ["DELETE", "/provisioned-model-throughput/{provisionedModelId}", 200],
    },
    () => DeleteProvisionedModelThroughputRequest,
    () => DeleteProvisionedModelThroughputResponse,
];
var DeregisterMarketplaceModelEndpoint = [
    9,
    n0,
    _DMMEe,
    {
        [_ht]: ["DELETE", "/marketplace-model/endpoints/{endpointArn}/registration", 200],
    },
    () => DeregisterMarketplaceModelEndpointRequest,
    () => DeregisterMarketplaceModelEndpointResponse,
];
var ExportAutomatedReasoningPolicyVersion = [
    9,
    n0,
    _EARPV,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/export", 200],
    },
    () => ExportAutomatedReasoningPolicyVersionRequest,
    () => ExportAutomatedReasoningPolicyVersionResponse,
];
var GetAutomatedReasoningPolicy = [
    9,
    n0,
    _GARPe,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}", 200],
    },
    () => GetAutomatedReasoningPolicyRequest,
    () => GetAutomatedReasoningPolicyResponse,
];
var GetAutomatedReasoningPolicyAnnotations = [
    9,
    n0,
    _GARPA,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/annotations", 200],
    },
    () => GetAutomatedReasoningPolicyAnnotationsRequest,
    () => GetAutomatedReasoningPolicyAnnotationsResponse,
];
var GetAutomatedReasoningPolicyBuildWorkflow = [
    9,
    n0,
    _GARPBW,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}", 200],
    },
    () => GetAutomatedReasoningPolicyBuildWorkflowRequest,
    () => GetAutomatedReasoningPolicyBuildWorkflowResponse,
];
var GetAutomatedReasoningPolicyBuildWorkflowResultAssets = [
    9,
    n0,
    _GARPBWRA,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/result-assets", 200],
    },
    () => GetAutomatedReasoningPolicyBuildWorkflowResultAssetsRequest,
    () => GetAutomatedReasoningPolicyBuildWorkflowResultAssetsResponse,
];
var GetAutomatedReasoningPolicyNextScenario = [
    9,
    n0,
    _GARPNS,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/scenarios", 200],
    },
    () => GetAutomatedReasoningPolicyNextScenarioRequest,
    () => GetAutomatedReasoningPolicyNextScenarioResponse,
];
var GetAutomatedReasoningPolicyTestCase = [
    9,
    n0,
    _GARPTC,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/test-cases/{testCaseId}", 200],
    },
    () => GetAutomatedReasoningPolicyTestCaseRequest,
    () => GetAutomatedReasoningPolicyTestCaseResponse,
];
var GetAutomatedReasoningPolicyTestResult = [
    9,
    n0,
    _GARPTR,
    {
        [_ht]: [
            "GET",
            "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/test-cases/{testCaseId}/test-results",
            200,
        ],
    },
    () => GetAutomatedReasoningPolicyTestResultRequest,
    () => GetAutomatedReasoningPolicyTestResultResponse,
];
var GetCustomModel = [
    9,
    n0,
    _GCM,
    {
        [_ht]: ["GET", "/custom-models/{modelIdentifier}", 200],
    },
    () => GetCustomModelRequest,
    () => GetCustomModelResponse,
];
var GetCustomModelDeployment = [
    9,
    n0,
    _GCMD,
    {
        [_ht]: ["GET", "/model-customization/custom-model-deployments/{customModelDeploymentIdentifier}", 200],
    },
    () => GetCustomModelDeploymentRequest,
    () => GetCustomModelDeploymentResponse,
];
var GetEvaluationJob = [
    9,
    n0,
    _GEJ,
    {
        [_ht]: ["GET", "/evaluation-jobs/{jobIdentifier}", 200],
    },
    () => GetEvaluationJobRequest,
    () => GetEvaluationJobResponse,
];
var GetFoundationModel = [
    9,
    n0,
    _GFM,
    {
        [_ht]: ["GET", "/foundation-models/{modelIdentifier}", 200],
    },
    () => GetFoundationModelRequest,
    () => GetFoundationModelResponse,
];
var GetFoundationModelAvailability = [
    9,
    n0,
    _GFMA,
    {
        [_ht]: ["GET", "/foundation-model-availability/{modelId}", 200],
    },
    () => GetFoundationModelAvailabilityRequest,
    () => GetFoundationModelAvailabilityResponse,
];
var GetGuardrail = [
    9,
    n0,
    _GG,
    {
        [_ht]: ["GET", "/guardrails/{guardrailIdentifier}", 200],
    },
    () => GetGuardrailRequest,
    () => GetGuardrailResponse,
];
var GetImportedModel = [
    9,
    n0,
    _GIM,
    {
        [_ht]: ["GET", "/imported-models/{modelIdentifier}", 200],
    },
    () => GetImportedModelRequest,
    () => GetImportedModelResponse,
];
var GetInferenceProfile = [
    9,
    n0,
    _GIP,
    {
        [_ht]: ["GET", "/inference-profiles/{inferenceProfileIdentifier}", 200],
    },
    () => GetInferenceProfileRequest,
    () => GetInferenceProfileResponse,
];
var GetMarketplaceModelEndpoint = [
    9,
    n0,
    _GMME,
    {
        [_ht]: ["GET", "/marketplace-model/endpoints/{endpointArn}", 200],
    },
    () => GetMarketplaceModelEndpointRequest,
    () => GetMarketplaceModelEndpointResponse,
];
var GetModelCopyJob = [
    9,
    n0,
    _GMCJ,
    {
        [_ht]: ["GET", "/model-copy-jobs/{jobArn}", 200],
    },
    () => GetModelCopyJobRequest,
    () => GetModelCopyJobResponse,
];
var GetModelCustomizationJob = [
    9,
    n0,
    _GMCJe,
    {
        [_ht]: ["GET", "/model-customization-jobs/{jobIdentifier}", 200],
    },
    () => GetModelCustomizationJobRequest,
    () => GetModelCustomizationJobResponse,
];
var GetModelImportJob = [
    9,
    n0,
    _GMIJ,
    {
        [_ht]: ["GET", "/model-import-jobs/{jobIdentifier}", 200],
    },
    () => GetModelImportJobRequest,
    () => GetModelImportJobResponse,
];
var GetModelInvocationJob = [
    9,
    n0,
    _GMIJe,
    {
        [_ht]: ["GET", "/model-invocation-job/{jobIdentifier}", 200],
    },
    () => GetModelInvocationJobRequest,
    () => GetModelInvocationJobResponse,
];
var GetModelInvocationLoggingConfiguration = [
    9,
    n0,
    _GMILC,
    {
        [_ht]: ["GET", "/logging/modelinvocations", 200],
    },
    () => GetModelInvocationLoggingConfigurationRequest,
    () => GetModelInvocationLoggingConfigurationResponse,
];
var GetPromptRouter = [
    9,
    n0,
    _GPR,
    {
        [_ht]: ["GET", "/prompt-routers/{promptRouterArn}", 200],
    },
    () => GetPromptRouterRequest,
    () => GetPromptRouterResponse,
];
var GetProvisionedModelThroughput = [
    9,
    n0,
    _GPMT,
    {
        [_ht]: ["GET", "/provisioned-model-throughput/{provisionedModelId}", 200],
    },
    () => GetProvisionedModelThroughputRequest,
    () => GetProvisionedModelThroughputResponse,
];
var GetUseCaseForModelAccess = [
    9,
    n0,
    _GUCFMA,
    {
        [_ht]: ["GET", "/use-case-for-model-access", 200],
    },
    () => GetUseCaseForModelAccessRequest,
    () => GetUseCaseForModelAccessResponse,
];
var ListAutomatedReasoningPolicies = [
    9,
    n0,
    _LARP,
    {
        [_ht]: ["GET", "/automated-reasoning-policies", 200],
    },
    () => ListAutomatedReasoningPoliciesRequest,
    () => ListAutomatedReasoningPoliciesResponse,
];
var ListAutomatedReasoningPolicyBuildWorkflows = [
    9,
    n0,
    _LARPBW,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows", 200],
    },
    () => ListAutomatedReasoningPolicyBuildWorkflowsRequest,
    () => ListAutomatedReasoningPolicyBuildWorkflowsResponse,
];
var ListAutomatedReasoningPolicyTestCases = [
    9,
    n0,
    _LARPTC,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/test-cases", 200],
    },
    () => ListAutomatedReasoningPolicyTestCasesRequest,
    () => ListAutomatedReasoningPolicyTestCasesResponse,
];
var ListAutomatedReasoningPolicyTestResults = [
    9,
    n0,
    _LARPTR,
    {
        [_ht]: ["GET", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/test-results", 200],
    },
    () => ListAutomatedReasoningPolicyTestResultsRequest,
    () => ListAutomatedReasoningPolicyTestResultsResponse,
];
var ListCustomModelDeployments = [
    9,
    n0,
    _LCMD,
    {
        [_ht]: ["GET", "/model-customization/custom-model-deployments", 200],
    },
    () => ListCustomModelDeploymentsRequest,
    () => ListCustomModelDeploymentsResponse,
];
var ListCustomModels = [
    9,
    n0,
    _LCM,
    {
        [_ht]: ["GET", "/custom-models", 200],
    },
    () => ListCustomModelsRequest,
    () => ListCustomModelsResponse,
];
var ListEvaluationJobs = [
    9,
    n0,
    _LEJ,
    {
        [_ht]: ["GET", "/evaluation-jobs", 200],
    },
    () => ListEvaluationJobsRequest,
    () => ListEvaluationJobsResponse,
];
var ListFoundationModelAgreementOffers = [
    9,
    n0,
    _LFMAO,
    {
        [_ht]: ["GET", "/list-foundation-model-agreement-offers/{modelId}", 200],
    },
    () => ListFoundationModelAgreementOffersRequest,
    () => ListFoundationModelAgreementOffersResponse,
];
var ListFoundationModels = [
    9,
    n0,
    _LFM,
    {
        [_ht]: ["GET", "/foundation-models", 200],
    },
    () => ListFoundationModelsRequest,
    () => ListFoundationModelsResponse,
];
var ListGuardrails = [
    9,
    n0,
    _LG,
    {
        [_ht]: ["GET", "/guardrails", 200],
    },
    () => ListGuardrailsRequest,
    () => ListGuardrailsResponse,
];
var ListImportedModels = [
    9,
    n0,
    _LIM,
    {
        [_ht]: ["GET", "/imported-models", 200],
    },
    () => ListImportedModelsRequest,
    () => ListImportedModelsResponse,
];
var ListInferenceProfiles = [
    9,
    n0,
    _LIP,
    {
        [_ht]: ["GET", "/inference-profiles", 200],
    },
    () => ListInferenceProfilesRequest,
    () => ListInferenceProfilesResponse,
];
var ListMarketplaceModelEndpoints = [
    9,
    n0,
    _LMME,
    {
        [_ht]: ["GET", "/marketplace-model/endpoints", 200],
    },
    () => ListMarketplaceModelEndpointsRequest,
    () => ListMarketplaceModelEndpointsResponse,
];
var ListModelCopyJobs = [
    9,
    n0,
    _LMCJ,
    {
        [_ht]: ["GET", "/model-copy-jobs", 200],
    },
    () => ListModelCopyJobsRequest,
    () => ListModelCopyJobsResponse,
];
var ListModelCustomizationJobs = [
    9,
    n0,
    _LMCJi,
    {
        [_ht]: ["GET", "/model-customization-jobs", 200],
    },
    () => ListModelCustomizationJobsRequest,
    () => ListModelCustomizationJobsResponse,
];
var ListModelImportJobs = [
    9,
    n0,
    _LMIJ,
    {
        [_ht]: ["GET", "/model-import-jobs", 200],
    },
    () => ListModelImportJobsRequest,
    () => ListModelImportJobsResponse,
];
var ListModelInvocationJobs = [
    9,
    n0,
    _LMIJi,
    {
        [_ht]: ["GET", "/model-invocation-jobs", 200],
    },
    () => ListModelInvocationJobsRequest,
    () => ListModelInvocationJobsResponse,
];
var ListPromptRouters = [
    9,
    n0,
    _LPR,
    {
        [_ht]: ["GET", "/prompt-routers", 200],
    },
    () => ListPromptRoutersRequest,
    () => ListPromptRoutersResponse,
];
var ListProvisionedModelThroughputs = [
    9,
    n0,
    _LPMT,
    {
        [_ht]: ["GET", "/provisioned-model-throughputs", 200],
    },
    () => ListProvisionedModelThroughputsRequest,
    () => ListProvisionedModelThroughputsResponse,
];
var ListTagsForResource = [
    9,
    n0,
    _LTFR,
    {
        [_ht]: ["POST", "/listTagsForResource", 200],
    },
    () => ListTagsForResourceRequest,
    () => ListTagsForResourceResponse,
];
var PutModelInvocationLoggingConfiguration = [
    9,
    n0,
    _PMILC,
    {
        [_ht]: ["PUT", "/logging/modelinvocations", 200],
    },
    () => PutModelInvocationLoggingConfigurationRequest,
    () => PutModelInvocationLoggingConfigurationResponse,
];
var PutUseCaseForModelAccess = [
    9,
    n0,
    _PUCFMA,
    {
        [_ht]: ["POST", "/use-case-for-model-access", 201],
    },
    () => PutUseCaseForModelAccessRequest,
    () => PutUseCaseForModelAccessResponse,
];
var RegisterMarketplaceModelEndpoint = [
    9,
    n0,
    _RMME,
    {
        [_ht]: ["POST", "/marketplace-model/endpoints/{endpointIdentifier}/registration", 200],
    },
    () => RegisterMarketplaceModelEndpointRequest,
    () => RegisterMarketplaceModelEndpointResponse,
];
var StartAutomatedReasoningPolicyBuildWorkflow = [
    9,
    n0,
    _SARPBW,
    {
        [_ht]: ["POST", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowType}/start", 200],
    },
    () => StartAutomatedReasoningPolicyBuildWorkflowRequest,
    () => StartAutomatedReasoningPolicyBuildWorkflowResponse,
];
var StartAutomatedReasoningPolicyTestWorkflow = [
    9,
    n0,
    _SARPTW,
    {
        [_ht]: ["POST", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/test-workflows", 200],
    },
    () => StartAutomatedReasoningPolicyTestWorkflowRequest,
    () => StartAutomatedReasoningPolicyTestWorkflowResponse,
];
var StopEvaluationJob = [
    9,
    n0,
    _SEJ,
    {
        [_ht]: ["POST", "/evaluation-job/{jobIdentifier}/stop", 200],
    },
    () => StopEvaluationJobRequest,
    () => StopEvaluationJobResponse,
];
var StopModelCustomizationJob = [
    9,
    n0,
    _SMCJ,
    {
        [_ht]: ["POST", "/model-customization-jobs/{jobIdentifier}/stop", 200],
    },
    () => StopModelCustomizationJobRequest,
    () => StopModelCustomizationJobResponse,
];
var StopModelInvocationJob = [
    9,
    n0,
    _SMIJ,
    {
        [_ht]: ["POST", "/model-invocation-job/{jobIdentifier}/stop", 200],
    },
    () => StopModelInvocationJobRequest,
    () => StopModelInvocationJobResponse,
];
var TagResource = [
    9,
    n0,
    _TR,
    {
        [_ht]: ["POST", "/tagResource", 200],
    },
    () => TagResourceRequest,
    () => TagResourceResponse,
];
var UntagResource = [
    9,
    n0,
    _UR,
    {
        [_ht]: ["POST", "/untagResource", 200],
    },
    () => UntagResourceRequest,
    () => UntagResourceResponse,
];
var UpdateAutomatedReasoningPolicy = [
    9,
    n0,
    _UARP,
    {
        [_ht]: ["PATCH", "/automated-reasoning-policies/{policyArn}", 200],
    },
    () => UpdateAutomatedReasoningPolicyRequest,
    () => UpdateAutomatedReasoningPolicyResponse,
];
var UpdateAutomatedReasoningPolicyAnnotations = [
    9,
    n0,
    _UARPA,
    {
        [_ht]: ["PATCH", "/automated-reasoning-policies/{policyArn}/build-workflows/{buildWorkflowId}/annotations", 200],
    },
    () => UpdateAutomatedReasoningPolicyAnnotationsRequest,
    () => UpdateAutomatedReasoningPolicyAnnotationsResponse,
];
var UpdateAutomatedReasoningPolicyTestCase = [
    9,
    n0,
    _UARPTC,
    {
        [_ht]: ["PATCH", "/automated-reasoning-policies/{policyArn}/test-cases/{testCaseId}", 200],
    },
    () => UpdateAutomatedReasoningPolicyTestCaseRequest,
    () => UpdateAutomatedReasoningPolicyTestCaseResponse,
];
var UpdateGuardrail = [
    9,
    n0,
    _UG,
    {
        [_ht]: ["PUT", "/guardrails/{guardrailIdentifier}", 202],
    },
    () => UpdateGuardrailRequest,
    () => UpdateGuardrailResponse,
];
var UpdateMarketplaceModelEndpoint = [
    9,
    n0,
    _UMME,
    {
        [_ht]: ["PATCH", "/marketplace-model/endpoints/{endpointArn}", 200],
    },
    () => UpdateMarketplaceModelEndpointRequest,
    () => UpdateMarketplaceModelEndpointResponse,
];
var UpdateProvisionedModelThroughput = [
    9,
    n0,
    _UPMT,
    {
        [_ht]: ["PATCH", "/provisioned-model-throughput/{provisionedModelId}", 200],
    },
    () => UpdateProvisionedModelThroughputRequest,
    () => UpdateProvisionedModelThroughputResponse,
];

class BatchDeleteEvaluationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "BatchDeleteEvaluationJob", {})
    .n("BedrockClient", "BatchDeleteEvaluationJobCommand")
    .sc(BatchDeleteEvaluationJob)
    .build() {
}

class CancelAutomatedReasoningPolicyBuildWorkflowCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CancelAutomatedReasoningPolicyBuildWorkflow", {})
    .n("BedrockClient", "CancelAutomatedReasoningPolicyBuildWorkflowCommand")
    .sc(CancelAutomatedReasoningPolicyBuildWorkflow)
    .build() {
}

class CreateAutomatedReasoningPolicyCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateAutomatedReasoningPolicy", {})
    .n("BedrockClient", "CreateAutomatedReasoningPolicyCommand")
    .sc(CreateAutomatedReasoningPolicy)
    .build() {
}

class CreateAutomatedReasoningPolicyTestCaseCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateAutomatedReasoningPolicyTestCase", {})
    .n("BedrockClient", "CreateAutomatedReasoningPolicyTestCaseCommand")
    .sc(CreateAutomatedReasoningPolicyTestCase)
    .build() {
}

class CreateAutomatedReasoningPolicyVersionCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateAutomatedReasoningPolicyVersion", {})
    .n("BedrockClient", "CreateAutomatedReasoningPolicyVersionCommand")
    .sc(CreateAutomatedReasoningPolicyVersion)
    .build() {
}

class CreateCustomModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateCustomModel", {})
    .n("BedrockClient", "CreateCustomModelCommand")
    .sc(CreateCustomModel)
    .build() {
}

class CreateCustomModelDeploymentCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateCustomModelDeployment", {})
    .n("BedrockClient", "CreateCustomModelDeploymentCommand")
    .sc(CreateCustomModelDeployment)
    .build() {
}

class CreateEvaluationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateEvaluationJob", {})
    .n("BedrockClient", "CreateEvaluationJobCommand")
    .sc(CreateEvaluationJob)
    .build() {
}

class CreateFoundationModelAgreementCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateFoundationModelAgreement", {})
    .n("BedrockClient", "CreateFoundationModelAgreementCommand")
    .sc(CreateFoundationModelAgreement)
    .build() {
}

class CreateGuardrailCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateGuardrail", {})
    .n("BedrockClient", "CreateGuardrailCommand")
    .sc(CreateGuardrail)
    .build() {
}

class CreateGuardrailVersionCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateGuardrailVersion", {})
    .n("BedrockClient", "CreateGuardrailVersionCommand")
    .sc(CreateGuardrailVersion)
    .build() {
}

class CreateInferenceProfileCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateInferenceProfile", {})
    .n("BedrockClient", "CreateInferenceProfileCommand")
    .sc(CreateInferenceProfile)
    .build() {
}

class CreateMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateMarketplaceModelEndpoint", {})
    .n("BedrockClient", "CreateMarketplaceModelEndpointCommand")
    .sc(CreateMarketplaceModelEndpoint)
    .build() {
}

class CreateModelCopyJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateModelCopyJob", {})
    .n("BedrockClient", "CreateModelCopyJobCommand")
    .sc(CreateModelCopyJob)
    .build() {
}

class CreateModelCustomizationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateModelCustomizationJob", {})
    .n("BedrockClient", "CreateModelCustomizationJobCommand")
    .sc(CreateModelCustomizationJob)
    .build() {
}

class CreateModelImportJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateModelImportJob", {})
    .n("BedrockClient", "CreateModelImportJobCommand")
    .sc(CreateModelImportJob)
    .build() {
}

class CreateModelInvocationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateModelInvocationJob", {})
    .n("BedrockClient", "CreateModelInvocationJobCommand")
    .sc(CreateModelInvocationJob)
    .build() {
}

class CreatePromptRouterCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreatePromptRouter", {})
    .n("BedrockClient", "CreatePromptRouterCommand")
    .sc(CreatePromptRouter)
    .build() {
}

class CreateProvisionedModelThroughputCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "CreateProvisionedModelThroughput", {})
    .n("BedrockClient", "CreateProvisionedModelThroughputCommand")
    .sc(CreateProvisionedModelThroughput)
    .build() {
}

class DeleteAutomatedReasoningPolicyBuildWorkflowCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteAutomatedReasoningPolicyBuildWorkflow", {})
    .n("BedrockClient", "DeleteAutomatedReasoningPolicyBuildWorkflowCommand")
    .sc(DeleteAutomatedReasoningPolicyBuildWorkflow)
    .build() {
}

class DeleteAutomatedReasoningPolicyCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteAutomatedReasoningPolicy", {})
    .n("BedrockClient", "DeleteAutomatedReasoningPolicyCommand")
    .sc(DeleteAutomatedReasoningPolicy)
    .build() {
}

class DeleteAutomatedReasoningPolicyTestCaseCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteAutomatedReasoningPolicyTestCase", {})
    .n("BedrockClient", "DeleteAutomatedReasoningPolicyTestCaseCommand")
    .sc(DeleteAutomatedReasoningPolicyTestCase)
    .build() {
}

class DeleteCustomModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteCustomModel", {})
    .n("BedrockClient", "DeleteCustomModelCommand")
    .sc(DeleteCustomModel)
    .build() {
}

class DeleteCustomModelDeploymentCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteCustomModelDeployment", {})
    .n("BedrockClient", "DeleteCustomModelDeploymentCommand")
    .sc(DeleteCustomModelDeployment)
    .build() {
}

class DeleteFoundationModelAgreementCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteFoundationModelAgreement", {})
    .n("BedrockClient", "DeleteFoundationModelAgreementCommand")
    .sc(DeleteFoundationModelAgreement)
    .build() {
}

class DeleteGuardrailCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteGuardrail", {})
    .n("BedrockClient", "DeleteGuardrailCommand")
    .sc(DeleteGuardrail)
    .build() {
}

class DeleteImportedModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteImportedModel", {})
    .n("BedrockClient", "DeleteImportedModelCommand")
    .sc(DeleteImportedModel)
    .build() {
}

class DeleteInferenceProfileCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteInferenceProfile", {})
    .n("BedrockClient", "DeleteInferenceProfileCommand")
    .sc(DeleteInferenceProfile)
    .build() {
}

class DeleteMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteMarketplaceModelEndpoint", {})
    .n("BedrockClient", "DeleteMarketplaceModelEndpointCommand")
    .sc(DeleteMarketplaceModelEndpoint)
    .build() {
}

class DeleteModelInvocationLoggingConfigurationCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteModelInvocationLoggingConfiguration", {})
    .n("BedrockClient", "DeleteModelInvocationLoggingConfigurationCommand")
    .sc(DeleteModelInvocationLoggingConfiguration)
    .build() {
}

class DeletePromptRouterCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeletePromptRouter", {})
    .n("BedrockClient", "DeletePromptRouterCommand")
    .sc(DeletePromptRouter)
    .build() {
}

class DeleteProvisionedModelThroughputCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeleteProvisionedModelThroughput", {})
    .n("BedrockClient", "DeleteProvisionedModelThroughputCommand")
    .sc(DeleteProvisionedModelThroughput)
    .build() {
}

class DeregisterMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "DeregisterMarketplaceModelEndpoint", {})
    .n("BedrockClient", "DeregisterMarketplaceModelEndpointCommand")
    .sc(DeregisterMarketplaceModelEndpoint)
    .build() {
}

class ExportAutomatedReasoningPolicyVersionCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ExportAutomatedReasoningPolicyVersion", {})
    .n("BedrockClient", "ExportAutomatedReasoningPolicyVersionCommand")
    .sc(ExportAutomatedReasoningPolicyVersion)
    .build() {
}

class GetAutomatedReasoningPolicyAnnotationsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyAnnotations", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyAnnotationsCommand")
    .sc(GetAutomatedReasoningPolicyAnnotations)
    .build() {
}

class GetAutomatedReasoningPolicyBuildWorkflowCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyBuildWorkflow", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyBuildWorkflowCommand")
    .sc(GetAutomatedReasoningPolicyBuildWorkflow)
    .build() {
}

class GetAutomatedReasoningPolicyBuildWorkflowResultAssetsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyBuildWorkflowResultAssets", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyBuildWorkflowResultAssetsCommand")
    .sc(GetAutomatedReasoningPolicyBuildWorkflowResultAssets)
    .build() {
}

class GetAutomatedReasoningPolicyCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicy", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyCommand")
    .sc(GetAutomatedReasoningPolicy)
    .build() {
}

class GetAutomatedReasoningPolicyNextScenarioCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyNextScenario", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyNextScenarioCommand")
    .sc(GetAutomatedReasoningPolicyNextScenario)
    .build() {
}

class GetAutomatedReasoningPolicyTestCaseCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyTestCase", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyTestCaseCommand")
    .sc(GetAutomatedReasoningPolicyTestCase)
    .build() {
}

class GetAutomatedReasoningPolicyTestResultCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetAutomatedReasoningPolicyTestResult", {})
    .n("BedrockClient", "GetAutomatedReasoningPolicyTestResultCommand")
    .sc(GetAutomatedReasoningPolicyTestResult)
    .build() {
}

class GetCustomModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetCustomModel", {})
    .n("BedrockClient", "GetCustomModelCommand")
    .sc(GetCustomModel)
    .build() {
}

class GetCustomModelDeploymentCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetCustomModelDeployment", {})
    .n("BedrockClient", "GetCustomModelDeploymentCommand")
    .sc(GetCustomModelDeployment)
    .build() {
}

class GetEvaluationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetEvaluationJob", {})
    .n("BedrockClient", "GetEvaluationJobCommand")
    .sc(GetEvaluationJob)
    .build() {
}

class GetFoundationModelAvailabilityCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetFoundationModelAvailability", {})
    .n("BedrockClient", "GetFoundationModelAvailabilityCommand")
    .sc(GetFoundationModelAvailability)
    .build() {
}

class GetFoundationModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetFoundationModel", {})
    .n("BedrockClient", "GetFoundationModelCommand")
    .sc(GetFoundationModel)
    .build() {
}

class GetGuardrailCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetGuardrail", {})
    .n("BedrockClient", "GetGuardrailCommand")
    .sc(GetGuardrail)
    .build() {
}

class GetImportedModelCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetImportedModel", {})
    .n("BedrockClient", "GetImportedModelCommand")
    .sc(GetImportedModel)
    .build() {
}

class GetInferenceProfileCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetInferenceProfile", {})
    .n("BedrockClient", "GetInferenceProfileCommand")
    .sc(GetInferenceProfile)
    .build() {
}

class GetMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetMarketplaceModelEndpoint", {})
    .n("BedrockClient", "GetMarketplaceModelEndpointCommand")
    .sc(GetMarketplaceModelEndpoint)
    .build() {
}

class GetModelCopyJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetModelCopyJob", {})
    .n("BedrockClient", "GetModelCopyJobCommand")
    .sc(GetModelCopyJob)
    .build() {
}

class GetModelCustomizationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetModelCustomizationJob", {})
    .n("BedrockClient", "GetModelCustomizationJobCommand")
    .sc(GetModelCustomizationJob)
    .build() {
}

class GetModelImportJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetModelImportJob", {})
    .n("BedrockClient", "GetModelImportJobCommand")
    .sc(GetModelImportJob)
    .build() {
}

class GetModelInvocationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetModelInvocationJob", {})
    .n("BedrockClient", "GetModelInvocationJobCommand")
    .sc(GetModelInvocationJob)
    .build() {
}

class GetModelInvocationLoggingConfigurationCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetModelInvocationLoggingConfiguration", {})
    .n("BedrockClient", "GetModelInvocationLoggingConfigurationCommand")
    .sc(GetModelInvocationLoggingConfiguration)
    .build() {
}

class GetPromptRouterCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetPromptRouter", {})
    .n("BedrockClient", "GetPromptRouterCommand")
    .sc(GetPromptRouter)
    .build() {
}

class GetProvisionedModelThroughputCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetProvisionedModelThroughput", {})
    .n("BedrockClient", "GetProvisionedModelThroughputCommand")
    .sc(GetProvisionedModelThroughput)
    .build() {
}

class GetUseCaseForModelAccessCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "GetUseCaseForModelAccess", {})
    .n("BedrockClient", "GetUseCaseForModelAccessCommand")
    .sc(GetUseCaseForModelAccess)
    .build() {
}

class ListAutomatedReasoningPoliciesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListAutomatedReasoningPolicies", {})
    .n("BedrockClient", "ListAutomatedReasoningPoliciesCommand")
    .sc(ListAutomatedReasoningPolicies)
    .build() {
}

class ListAutomatedReasoningPolicyBuildWorkflowsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListAutomatedReasoningPolicyBuildWorkflows", {})
    .n("BedrockClient", "ListAutomatedReasoningPolicyBuildWorkflowsCommand")
    .sc(ListAutomatedReasoningPolicyBuildWorkflows)
    .build() {
}

class ListAutomatedReasoningPolicyTestCasesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListAutomatedReasoningPolicyTestCases", {})
    .n("BedrockClient", "ListAutomatedReasoningPolicyTestCasesCommand")
    .sc(ListAutomatedReasoningPolicyTestCases)
    .build() {
}

class ListAutomatedReasoningPolicyTestResultsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListAutomatedReasoningPolicyTestResults", {})
    .n("BedrockClient", "ListAutomatedReasoningPolicyTestResultsCommand")
    .sc(ListAutomatedReasoningPolicyTestResults)
    .build() {
}

class ListCustomModelDeploymentsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListCustomModelDeployments", {})
    .n("BedrockClient", "ListCustomModelDeploymentsCommand")
    .sc(ListCustomModelDeployments)
    .build() {
}

class ListCustomModelsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListCustomModels", {})
    .n("BedrockClient", "ListCustomModelsCommand")
    .sc(ListCustomModels)
    .build() {
}

class ListEvaluationJobsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListEvaluationJobs", {})
    .n("BedrockClient", "ListEvaluationJobsCommand")
    .sc(ListEvaluationJobs)
    .build() {
}

class ListFoundationModelAgreementOffersCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListFoundationModelAgreementOffers", {})
    .n("BedrockClient", "ListFoundationModelAgreementOffersCommand")
    .sc(ListFoundationModelAgreementOffers)
    .build() {
}

class ListFoundationModelsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListFoundationModels", {})
    .n("BedrockClient", "ListFoundationModelsCommand")
    .sc(ListFoundationModels)
    .build() {
}

class ListGuardrailsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListGuardrails", {})
    .n("BedrockClient", "ListGuardrailsCommand")
    .sc(ListGuardrails)
    .build() {
}

class ListImportedModelsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListImportedModels", {})
    .n("BedrockClient", "ListImportedModelsCommand")
    .sc(ListImportedModels)
    .build() {
}

class ListInferenceProfilesCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListInferenceProfiles", {})
    .n("BedrockClient", "ListInferenceProfilesCommand")
    .sc(ListInferenceProfiles)
    .build() {
}

class ListMarketplaceModelEndpointsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListMarketplaceModelEndpoints", {})
    .n("BedrockClient", "ListMarketplaceModelEndpointsCommand")
    .sc(ListMarketplaceModelEndpoints)
    .build() {
}

class ListModelCopyJobsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListModelCopyJobs", {})
    .n("BedrockClient", "ListModelCopyJobsCommand")
    .sc(ListModelCopyJobs)
    .build() {
}

class ListModelCustomizationJobsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListModelCustomizationJobs", {})
    .n("BedrockClient", "ListModelCustomizationJobsCommand")
    .sc(ListModelCustomizationJobs)
    .build() {
}

class ListModelImportJobsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListModelImportJobs", {})
    .n("BedrockClient", "ListModelImportJobsCommand")
    .sc(ListModelImportJobs)
    .build() {
}

class ListModelInvocationJobsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListModelInvocationJobs", {})
    .n("BedrockClient", "ListModelInvocationJobsCommand")
    .sc(ListModelInvocationJobs)
    .build() {
}

class ListPromptRoutersCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListPromptRouters", {})
    .n("BedrockClient", "ListPromptRoutersCommand")
    .sc(ListPromptRouters)
    .build() {
}

class ListProvisionedModelThroughputsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListProvisionedModelThroughputs", {})
    .n("BedrockClient", "ListProvisionedModelThroughputsCommand")
    .sc(ListProvisionedModelThroughputs)
    .build() {
}

class ListTagsForResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "ListTagsForResource", {})
    .n("BedrockClient", "ListTagsForResourceCommand")
    .sc(ListTagsForResource)
    .build() {
}

class PutModelInvocationLoggingConfigurationCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "PutModelInvocationLoggingConfiguration", {})
    .n("BedrockClient", "PutModelInvocationLoggingConfigurationCommand")
    .sc(PutModelInvocationLoggingConfiguration)
    .build() {
}

class PutUseCaseForModelAccessCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "PutUseCaseForModelAccess", {})
    .n("BedrockClient", "PutUseCaseForModelAccessCommand")
    .sc(PutUseCaseForModelAccess)
    .build() {
}

class RegisterMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "RegisterMarketplaceModelEndpoint", {})
    .n("BedrockClient", "RegisterMarketplaceModelEndpointCommand")
    .sc(RegisterMarketplaceModelEndpoint)
    .build() {
}

class StartAutomatedReasoningPolicyBuildWorkflowCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "StartAutomatedReasoningPolicyBuildWorkflow", {})
    .n("BedrockClient", "StartAutomatedReasoningPolicyBuildWorkflowCommand")
    .sc(StartAutomatedReasoningPolicyBuildWorkflow)
    .build() {
}

class StartAutomatedReasoningPolicyTestWorkflowCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "StartAutomatedReasoningPolicyTestWorkflow", {})
    .n("BedrockClient", "StartAutomatedReasoningPolicyTestWorkflowCommand")
    .sc(StartAutomatedReasoningPolicyTestWorkflow)
    .build() {
}

class StopEvaluationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "StopEvaluationJob", {})
    .n("BedrockClient", "StopEvaluationJobCommand")
    .sc(StopEvaluationJob)
    .build() {
}

class StopModelCustomizationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "StopModelCustomizationJob", {})
    .n("BedrockClient", "StopModelCustomizationJobCommand")
    .sc(StopModelCustomizationJob)
    .build() {
}

class StopModelInvocationJobCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "StopModelInvocationJob", {})
    .n("BedrockClient", "StopModelInvocationJobCommand")
    .sc(StopModelInvocationJob)
    .build() {
}

class TagResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "TagResource", {})
    .n("BedrockClient", "TagResourceCommand")
    .sc(TagResource)
    .build() {
}

class UntagResourceCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UntagResource", {})
    .n("BedrockClient", "UntagResourceCommand")
    .sc(UntagResource)
    .build() {
}

class UpdateAutomatedReasoningPolicyAnnotationsCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateAutomatedReasoningPolicyAnnotations", {})
    .n("BedrockClient", "UpdateAutomatedReasoningPolicyAnnotationsCommand")
    .sc(UpdateAutomatedReasoningPolicyAnnotations)
    .build() {
}

class UpdateAutomatedReasoningPolicyCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateAutomatedReasoningPolicy", {})
    .n("BedrockClient", "UpdateAutomatedReasoningPolicyCommand")
    .sc(UpdateAutomatedReasoningPolicy)
    .build() {
}

class UpdateAutomatedReasoningPolicyTestCaseCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateAutomatedReasoningPolicyTestCase", {})
    .n("BedrockClient", "UpdateAutomatedReasoningPolicyTestCaseCommand")
    .sc(UpdateAutomatedReasoningPolicyTestCase)
    .build() {
}

class UpdateGuardrailCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateGuardrail", {})
    .n("BedrockClient", "UpdateGuardrailCommand")
    .sc(UpdateGuardrail)
    .build() {
}

class UpdateMarketplaceModelEndpointCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateMarketplaceModelEndpoint", {})
    .n("BedrockClient", "UpdateMarketplaceModelEndpointCommand")
    .sc(UpdateMarketplaceModelEndpoint)
    .build() {
}

class UpdateProvisionedModelThroughputCommand extends smithyClient.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [middlewareEndpoint.getEndpointPlugin(config, Command.getEndpointParameterInstructions())];
})
    .s("AmazonBedrockControlPlaneService", "UpdateProvisionedModelThroughput", {})
    .n("BedrockClient", "UpdateProvisionedModelThroughputCommand")
    .sc(UpdateProvisionedModelThroughput)
    .build() {
}

const commands = {
    BatchDeleteEvaluationJobCommand,
    CancelAutomatedReasoningPolicyBuildWorkflowCommand,
    CreateAutomatedReasoningPolicyCommand,
    CreateAutomatedReasoningPolicyTestCaseCommand,
    CreateAutomatedReasoningPolicyVersionCommand,
    CreateCustomModelCommand,
    CreateCustomModelDeploymentCommand,
    CreateEvaluationJobCommand,
    CreateFoundationModelAgreementCommand,
    CreateGuardrailCommand,
    CreateGuardrailVersionCommand,
    CreateInferenceProfileCommand,
    CreateMarketplaceModelEndpointCommand,
    CreateModelCopyJobCommand,
    CreateModelCustomizationJobCommand,
    CreateModelImportJobCommand,
    CreateModelInvocationJobCommand,
    CreatePromptRouterCommand,
    CreateProvisionedModelThroughputCommand,
    DeleteAutomatedReasoningPolicyCommand,
    DeleteAutomatedReasoningPolicyBuildWorkflowCommand,
    DeleteAutomatedReasoningPolicyTestCaseCommand,
    DeleteCustomModelCommand,
    DeleteCustomModelDeploymentCommand,
    DeleteFoundationModelAgreementCommand,
    DeleteGuardrailCommand,
    DeleteImportedModelCommand,
    DeleteInferenceProfileCommand,
    DeleteMarketplaceModelEndpointCommand,
    DeleteModelInvocationLoggingConfigurationCommand,
    DeletePromptRouterCommand,
    DeleteProvisionedModelThroughputCommand,
    DeregisterMarketplaceModelEndpointCommand,
    ExportAutomatedReasoningPolicyVersionCommand,
    GetAutomatedReasoningPolicyCommand,
    GetAutomatedReasoningPolicyAnnotationsCommand,
    GetAutomatedReasoningPolicyBuildWorkflowCommand,
    GetAutomatedReasoningPolicyBuildWorkflowResultAssetsCommand,
    GetAutomatedReasoningPolicyNextScenarioCommand,
    GetAutomatedReasoningPolicyTestCaseCommand,
    GetAutomatedReasoningPolicyTestResultCommand,
    GetCustomModelCommand,
    GetCustomModelDeploymentCommand,
    GetEvaluationJobCommand,
    GetFoundationModelCommand,
    GetFoundationModelAvailabilityCommand,
    GetGuardrailCommand,
    GetImportedModelCommand,
    GetInferenceProfileCommand,
    GetMarketplaceModelEndpointCommand,
    GetModelCopyJobCommand,
    GetModelCustomizationJobCommand,
    GetModelImportJobCommand,
    GetModelInvocationJobCommand,
    GetModelInvocationLoggingConfigurationCommand,
    GetPromptRouterCommand,
    GetProvisionedModelThroughputCommand,
    GetUseCaseForModelAccessCommand,
    ListAutomatedReasoningPoliciesCommand,
    ListAutomatedReasoningPolicyBuildWorkflowsCommand,
    ListAutomatedReasoningPolicyTestCasesCommand,
    ListAutomatedReasoningPolicyTestResultsCommand,
    ListCustomModelDeploymentsCommand,
    ListCustomModelsCommand,
    ListEvaluationJobsCommand,
    ListFoundationModelAgreementOffersCommand,
    ListFoundationModelsCommand,
    ListGuardrailsCommand,
    ListImportedModelsCommand,
    ListInferenceProfilesCommand,
    ListMarketplaceModelEndpointsCommand,
    ListModelCopyJobsCommand,
    ListModelCustomizationJobsCommand,
    ListModelImportJobsCommand,
    ListModelInvocationJobsCommand,
    ListPromptRoutersCommand,
    ListProvisionedModelThroughputsCommand,
    ListTagsForResourceCommand,
    PutModelInvocationLoggingConfigurationCommand,
    PutUseCaseForModelAccessCommand,
    RegisterMarketplaceModelEndpointCommand,
    StartAutomatedReasoningPolicyBuildWorkflowCommand,
    StartAutomatedReasoningPolicyTestWorkflowCommand,
    StopEvaluationJobCommand,
    StopModelCustomizationJobCommand,
    StopModelInvocationJobCommand,
    TagResourceCommand,
    UntagResourceCommand,
    UpdateAutomatedReasoningPolicyCommand,
    UpdateAutomatedReasoningPolicyAnnotationsCommand,
    UpdateAutomatedReasoningPolicyTestCaseCommand,
    UpdateGuardrailCommand,
    UpdateMarketplaceModelEndpointCommand,
    UpdateProvisionedModelThroughputCommand,
};
class Bedrock extends BedrockClient {
}
smithyClient.createAggregatedClient(commands, Bedrock);

const paginateListAutomatedReasoningPolicies = core.createPaginator(BedrockClient, ListAutomatedReasoningPoliciesCommand, "nextToken", "nextToken", "maxResults");

const paginateListAutomatedReasoningPolicyBuildWorkflows = core.createPaginator(BedrockClient, ListAutomatedReasoningPolicyBuildWorkflowsCommand, "nextToken", "nextToken", "maxResults");

const paginateListAutomatedReasoningPolicyTestCases = core.createPaginator(BedrockClient, ListAutomatedReasoningPolicyTestCasesCommand, "nextToken", "nextToken", "maxResults");

const paginateListAutomatedReasoningPolicyTestResults = core.createPaginator(BedrockClient, ListAutomatedReasoningPolicyTestResultsCommand, "nextToken", "nextToken", "maxResults");

const paginateListCustomModelDeployments = core.createPaginator(BedrockClient, ListCustomModelDeploymentsCommand, "nextToken", "nextToken", "maxResults");

const paginateListCustomModels = core.createPaginator(BedrockClient, ListCustomModelsCommand, "nextToken", "nextToken", "maxResults");

const paginateListEvaluationJobs = core.createPaginator(BedrockClient, ListEvaluationJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListGuardrails = core.createPaginator(BedrockClient, ListGuardrailsCommand, "nextToken", "nextToken", "maxResults");

const paginateListImportedModels = core.createPaginator(BedrockClient, ListImportedModelsCommand, "nextToken", "nextToken", "maxResults");

const paginateListInferenceProfiles = core.createPaginator(BedrockClient, ListInferenceProfilesCommand, "nextToken", "nextToken", "maxResults");

const paginateListMarketplaceModelEndpoints = core.createPaginator(BedrockClient, ListMarketplaceModelEndpointsCommand, "nextToken", "nextToken", "maxResults");

const paginateListModelCopyJobs = core.createPaginator(BedrockClient, ListModelCopyJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListModelCustomizationJobs = core.createPaginator(BedrockClient, ListModelCustomizationJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListModelImportJobs = core.createPaginator(BedrockClient, ListModelImportJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListModelInvocationJobs = core.createPaginator(BedrockClient, ListModelInvocationJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListPromptRouters = core.createPaginator(BedrockClient, ListPromptRoutersCommand, "nextToken", "nextToken", "maxResults");

const paginateListProvisionedModelThroughputs = core.createPaginator(BedrockClient, ListProvisionedModelThroughputsCommand, "nextToken", "nextToken", "maxResults");

const AgreementStatus = {
    AVAILABLE: "AVAILABLE",
    ERROR: "ERROR",
    NOT_AVAILABLE: "NOT_AVAILABLE",
    PENDING: "PENDING",
};
const AutomatedReasoningCheckResult = {
    IMPOSSIBLE: "IMPOSSIBLE",
    INVALID: "INVALID",
    NO_TRANSLATION: "NO_TRANSLATION",
    SATISFIABLE: "SATISFIABLE",
    TOO_COMPLEX: "TOO_COMPLEX",
    TRANSLATION_AMBIGUOUS: "TRANSLATION_AMBIGUOUS",
    VALID: "VALID",
};
const AutomatedReasoningPolicyBuildWorkflowType = {
    IMPORT_POLICY: "IMPORT_POLICY",
    INGEST_CONTENT: "INGEST_CONTENT",
    REFINE_POLICY: "REFINE_POLICY",
};
const AutomatedReasoningPolicyBuildDocumentContentType = {
    PDF: "pdf",
    TEXT: "txt",
};
const AutomatedReasoningPolicyBuildWorkflowStatus = {
    BUILDING: "BUILDING",
    CANCELLED: "CANCELLED",
    CANCEL_REQUESTED: "CANCEL_REQUESTED",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    PREPROCESSING: "PREPROCESSING",
    SCHEDULED: "SCHEDULED",
    TESTING: "TESTING",
};
const AutomatedReasoningPolicyBuildResultAssetType = {
    BUILD_LOG: "BUILD_LOG",
    GENERATED_TEST_CASES: "GENERATED_TEST_CASES",
    POLICY_DEFINITION: "POLICY_DEFINITION",
    QUALITY_REPORT: "QUALITY_REPORT",
};
const AutomatedReasoningPolicyBuildMessageType = {
    ERROR: "ERROR",
    INFO: "INFO",
    WARNING: "WARNING",
};
const AutomatedReasoningPolicyAnnotationStatus = {
    APPLIED: "APPLIED",
    FAILED: "FAILED",
};
const AutomatedReasoningCheckLogicWarningType = {
    ALWAYS_FALSE: "ALWAYS_FALSE",
    ALWAYS_TRUE: "ALWAYS_TRUE",
};
const AutomatedReasoningPolicyTestRunResult = {
    FAILED: "FAILED",
    PASSED: "PASSED",
};
const AutomatedReasoningPolicyTestRunStatus = {
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    IN_PROGRESS: "IN_PROGRESS",
    NOT_STARTED: "NOT_STARTED",
    SCHEDULED: "SCHEDULED",
};
const Status = {
    INCOMPATIBLE_ENDPOINT: "INCOMPATIBLE_ENDPOINT",
    REGISTERED: "REGISTERED",
};
const CustomModelDeploymentStatus = {
    ACTIVE: "Active",
    CREATING: "Creating",
    FAILED: "Failed",
};
const SortModelsBy = {
    CREATION_TIME: "CreationTime",
};
const SortOrder = {
    ASCENDING: "Ascending",
    DESCENDING: "Descending",
};
const CustomizationType = {
    CONTINUED_PRE_TRAINING: "CONTINUED_PRE_TRAINING",
    DISTILLATION: "DISTILLATION",
    FINE_TUNING: "FINE_TUNING",
    IMPORTED: "IMPORTED",
};
const ModelStatus = {
    ACTIVE: "Active",
    CREATING: "Creating",
    FAILED: "Failed",
};
const EvaluationJobStatus = {
    COMPLETED: "Completed",
    DELETING: "Deleting",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
};
const ApplicationType = {
    MODEL_EVALUATION: "ModelEvaluation",
    RAG_EVALUATION: "RagEvaluation",
};
const EvaluationTaskType = {
    CLASSIFICATION: "Classification",
    CUSTOM: "Custom",
    GENERATION: "Generation",
    QUESTION_AND_ANSWER: "QuestionAndAnswer",
    SUMMARIZATION: "Summarization",
};
const PerformanceConfigLatency = {
    OPTIMIZED: "optimized",
    STANDARD: "standard",
};
const ExternalSourceType = {
    BYTE_CONTENT: "BYTE_CONTENT",
    S3: "S3",
};
const QueryTransformationType = {
    QUERY_DECOMPOSITION: "QUERY_DECOMPOSITION",
};
const AttributeType = {
    BOOLEAN: "BOOLEAN",
    NUMBER: "NUMBER",
    STRING: "STRING",
    STRING_LIST: "STRING_LIST",
};
const SearchType = {
    HYBRID: "HYBRID",
    SEMANTIC: "SEMANTIC",
};
const RerankingMetadataSelectionMode = {
    ALL: "ALL",
    SELECTIVE: "SELECTIVE",
};
const VectorSearchRerankingConfigurationType = {
    BEDROCK_RERANKING_MODEL: "BEDROCK_RERANKING_MODEL",
};
const RetrieveAndGenerateType = {
    EXTERNAL_SOURCES: "EXTERNAL_SOURCES",
    KNOWLEDGE_BASE: "KNOWLEDGE_BASE",
};
const EvaluationJobType = {
    AUTOMATED: "Automated",
    HUMAN: "Human",
};
const SortJobsBy = {
    CREATION_TIME: "CreationTime",
};
const GuardrailContentFilterAction = {
    BLOCK: "BLOCK",
    NONE: "NONE",
};
const GuardrailModality = {
    IMAGE: "IMAGE",
    TEXT: "TEXT",
};
const GuardrailFilterStrength = {
    HIGH: "HIGH",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    NONE: "NONE",
};
const GuardrailContentFilterType = {
    HATE: "HATE",
    INSULTS: "INSULTS",
    MISCONDUCT: "MISCONDUCT",
    PROMPT_ATTACK: "PROMPT_ATTACK",
    SEXUAL: "SEXUAL",
    VIOLENCE: "VIOLENCE",
};
const GuardrailContentFiltersTierName = {
    CLASSIC: "CLASSIC",
    STANDARD: "STANDARD",
};
const GuardrailContextualGroundingAction = {
    BLOCK: "BLOCK",
    NONE: "NONE",
};
const GuardrailContextualGroundingFilterType = {
    GROUNDING: "GROUNDING",
    RELEVANCE: "RELEVANCE",
};
const GuardrailSensitiveInformationAction = {
    ANONYMIZE: "ANONYMIZE",
    BLOCK: "BLOCK",
    NONE: "NONE",
};
const GuardrailPiiEntityType = {
    ADDRESS: "ADDRESS",
    AGE: "AGE",
    AWS_ACCESS_KEY: "AWS_ACCESS_KEY",
    AWS_SECRET_KEY: "AWS_SECRET_KEY",
    CA_HEALTH_NUMBER: "CA_HEALTH_NUMBER",
    CA_SOCIAL_INSURANCE_NUMBER: "CA_SOCIAL_INSURANCE_NUMBER",
    CREDIT_DEBIT_CARD_CVV: "CREDIT_DEBIT_CARD_CVV",
    CREDIT_DEBIT_CARD_EXPIRY: "CREDIT_DEBIT_CARD_EXPIRY",
    CREDIT_DEBIT_CARD_NUMBER: "CREDIT_DEBIT_CARD_NUMBER",
    DRIVER_ID: "DRIVER_ID",
    EMAIL: "EMAIL",
    INTERNATIONAL_BANK_ACCOUNT_NUMBER: "INTERNATIONAL_BANK_ACCOUNT_NUMBER",
    IP_ADDRESS: "IP_ADDRESS",
    LICENSE_PLATE: "LICENSE_PLATE",
    MAC_ADDRESS: "MAC_ADDRESS",
    NAME: "NAME",
    PASSWORD: "PASSWORD",
    PHONE: "PHONE",
    PIN: "PIN",
    SWIFT_CODE: "SWIFT_CODE",
    UK_NATIONAL_HEALTH_SERVICE_NUMBER: "UK_NATIONAL_HEALTH_SERVICE_NUMBER",
    UK_NATIONAL_INSURANCE_NUMBER: "UK_NATIONAL_INSURANCE_NUMBER",
    UK_UNIQUE_TAXPAYER_REFERENCE_NUMBER: "UK_UNIQUE_TAXPAYER_REFERENCE_NUMBER",
    URL: "URL",
    USERNAME: "USERNAME",
    US_BANK_ACCOUNT_NUMBER: "US_BANK_ACCOUNT_NUMBER",
    US_BANK_ROUTING_NUMBER: "US_BANK_ROUTING_NUMBER",
    US_INDIVIDUAL_TAX_IDENTIFICATION_NUMBER: "US_INDIVIDUAL_TAX_IDENTIFICATION_NUMBER",
    US_PASSPORT_NUMBER: "US_PASSPORT_NUMBER",
    US_SOCIAL_SECURITY_NUMBER: "US_SOCIAL_SECURITY_NUMBER",
    VEHICLE_IDENTIFICATION_NUMBER: "VEHICLE_IDENTIFICATION_NUMBER",
};
const GuardrailTopicsTierName = {
    CLASSIC: "CLASSIC",
    STANDARD: "STANDARD",
};
const GuardrailTopicAction = {
    BLOCK: "BLOCK",
    NONE: "NONE",
};
const GuardrailTopicType = {
    DENY: "DENY",
};
const GuardrailWordAction = {
    BLOCK: "BLOCK",
    NONE: "NONE",
};
const GuardrailManagedWordsType = {
    PROFANITY: "PROFANITY",
};
const GuardrailStatus = {
    CREATING: "CREATING",
    DELETING: "DELETING",
    FAILED: "FAILED",
    READY: "READY",
    UPDATING: "UPDATING",
    VERSIONING: "VERSIONING",
};
const InferenceProfileStatus = {
    ACTIVE: "ACTIVE",
};
const InferenceProfileType = {
    APPLICATION: "APPLICATION",
    SYSTEM_DEFINED: "SYSTEM_DEFINED",
};
const ModelCopyJobStatus = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
};
const ModelImportJobStatus = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
};
const S3InputFormat = {
    JSONL: "JSONL",
};
const ModelInvocationJobStatus = {
    COMPLETED: "Completed",
    EXPIRED: "Expired",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
    PARTIALLY_COMPLETED: "PartiallyCompleted",
    SCHEDULED: "Scheduled",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
    SUBMITTED: "Submitted",
    VALIDATING: "Validating",
};
const ModelCustomization = {
    CONTINUED_PRE_TRAINING: "CONTINUED_PRE_TRAINING",
    DISTILLATION: "DISTILLATION",
    FINE_TUNING: "FINE_TUNING",
};
const InferenceType = {
    ON_DEMAND: "ON_DEMAND",
    PROVISIONED: "PROVISIONED",
};
const ModelModality = {
    EMBEDDING: "EMBEDDING",
    IMAGE: "IMAGE",
    TEXT: "TEXT",
};
const FoundationModelLifecycleStatus = {
    ACTIVE: "ACTIVE",
    LEGACY: "LEGACY",
};
const PromptRouterStatus = {
    AVAILABLE: "AVAILABLE",
};
const PromptRouterType = {
    CUSTOM: "custom",
    DEFAULT: "default",
};
const CommitmentDuration = {
    ONE_MONTH: "OneMonth",
    SIX_MONTHS: "SixMonths",
};
const ProvisionedModelStatus = {
    CREATING: "Creating",
    FAILED: "Failed",
    IN_SERVICE: "InService",
    UPDATING: "Updating",
};
const SortByProvisionedModels = {
    CREATION_TIME: "CreationTime",
};
const AuthorizationStatus = {
    AUTHORIZED: "AUTHORIZED",
    NOT_AUTHORIZED: "NOT_AUTHORIZED",
};
const EntitlementAvailability = {
    AVAILABLE: "AVAILABLE",
    NOT_AVAILABLE: "NOT_AVAILABLE",
};
const RegionAvailability = {
    AVAILABLE: "AVAILABLE",
    NOT_AVAILABLE: "NOT_AVAILABLE",
};
const OfferType = {
    ALL: "ALL",
    PUBLIC: "PUBLIC",
};
const ModelCustomizationJobStatus = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
};
const JobStatusDetails = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
    NOT_STARTED: "NotStarted",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
};
const FineTuningJobStatus = {
    COMPLETED: "Completed",
    FAILED: "Failed",
    IN_PROGRESS: "InProgress",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
};

Object.defineProperty(exports, "$Command", {
    enumerable: true,
    get: function () { return smithyClient.Command; }
});
Object.defineProperty(exports, "__Client", {
    enumerable: true,
    get: function () { return smithyClient.Client; }
});
exports.AccessDeniedException = AccessDeniedException$1;
exports.AgreementStatus = AgreementStatus;
exports.ApplicationType = ApplicationType;
exports.AttributeType = AttributeType;
exports.AuthorizationStatus = AuthorizationStatus;
exports.AutomatedReasoningCheckLogicWarningType = AutomatedReasoningCheckLogicWarningType;
exports.AutomatedReasoningCheckResult = AutomatedReasoningCheckResult;
exports.AutomatedReasoningPolicyAnnotationStatus = AutomatedReasoningPolicyAnnotationStatus;
exports.AutomatedReasoningPolicyBuildDocumentContentType = AutomatedReasoningPolicyBuildDocumentContentType;
exports.AutomatedReasoningPolicyBuildMessageType = AutomatedReasoningPolicyBuildMessageType;
exports.AutomatedReasoningPolicyBuildResultAssetType = AutomatedReasoningPolicyBuildResultAssetType;
exports.AutomatedReasoningPolicyBuildWorkflowStatus = AutomatedReasoningPolicyBuildWorkflowStatus;
exports.AutomatedReasoningPolicyBuildWorkflowType = AutomatedReasoningPolicyBuildWorkflowType;
exports.AutomatedReasoningPolicyTestRunResult = AutomatedReasoningPolicyTestRunResult;
exports.AutomatedReasoningPolicyTestRunStatus = AutomatedReasoningPolicyTestRunStatus;
exports.BatchDeleteEvaluationJobCommand = BatchDeleteEvaluationJobCommand;
exports.Bedrock = Bedrock;
exports.BedrockClient = BedrockClient;
exports.BedrockServiceException = BedrockServiceException$1;
exports.CancelAutomatedReasoningPolicyBuildWorkflowCommand = CancelAutomatedReasoningPolicyBuildWorkflowCommand;
exports.CommitmentDuration = CommitmentDuration;
exports.ConflictException = ConflictException$1;
exports.CreateAutomatedReasoningPolicyCommand = CreateAutomatedReasoningPolicyCommand;
exports.CreateAutomatedReasoningPolicyTestCaseCommand = CreateAutomatedReasoningPolicyTestCaseCommand;
exports.CreateAutomatedReasoningPolicyVersionCommand = CreateAutomatedReasoningPolicyVersionCommand;
exports.CreateCustomModelCommand = CreateCustomModelCommand;
exports.CreateCustomModelDeploymentCommand = CreateCustomModelDeploymentCommand;
exports.CreateEvaluationJobCommand = CreateEvaluationJobCommand;
exports.CreateFoundationModelAgreementCommand = CreateFoundationModelAgreementCommand;
exports.CreateGuardrailCommand = CreateGuardrailCommand;
exports.CreateGuardrailVersionCommand = CreateGuardrailVersionCommand;
exports.CreateInferenceProfileCommand = CreateInferenceProfileCommand;
exports.CreateMarketplaceModelEndpointCommand = CreateMarketplaceModelEndpointCommand;
exports.CreateModelCopyJobCommand = CreateModelCopyJobCommand;
exports.CreateModelCustomizationJobCommand = CreateModelCustomizationJobCommand;
exports.CreateModelImportJobCommand = CreateModelImportJobCommand;
exports.CreateModelInvocationJobCommand = CreateModelInvocationJobCommand;
exports.CreatePromptRouterCommand = CreatePromptRouterCommand;
exports.CreateProvisionedModelThroughputCommand = CreateProvisionedModelThroughputCommand;
exports.CustomModelDeploymentStatus = CustomModelDeploymentStatus;
exports.CustomizationType = CustomizationType;
exports.DeleteAutomatedReasoningPolicyBuildWorkflowCommand = DeleteAutomatedReasoningPolicyBuildWorkflowCommand;
exports.DeleteAutomatedReasoningPolicyCommand = DeleteAutomatedReasoningPolicyCommand;
exports.DeleteAutomatedReasoningPolicyTestCaseCommand = DeleteAutomatedReasoningPolicyTestCaseCommand;
exports.DeleteCustomModelCommand = DeleteCustomModelCommand;
exports.DeleteCustomModelDeploymentCommand = DeleteCustomModelDeploymentCommand;
exports.DeleteFoundationModelAgreementCommand = DeleteFoundationModelAgreementCommand;
exports.DeleteGuardrailCommand = DeleteGuardrailCommand;
exports.DeleteImportedModelCommand = DeleteImportedModelCommand;
exports.DeleteInferenceProfileCommand = DeleteInferenceProfileCommand;
exports.DeleteMarketplaceModelEndpointCommand = DeleteMarketplaceModelEndpointCommand;
exports.DeleteModelInvocationLoggingConfigurationCommand = DeleteModelInvocationLoggingConfigurationCommand;
exports.DeletePromptRouterCommand = DeletePromptRouterCommand;
exports.DeleteProvisionedModelThroughputCommand = DeleteProvisionedModelThroughputCommand;
exports.DeregisterMarketplaceModelEndpointCommand = DeregisterMarketplaceModelEndpointCommand;
exports.EntitlementAvailability = EntitlementAvailability;
exports.EvaluationJobStatus = EvaluationJobStatus;
exports.EvaluationJobType = EvaluationJobType;
exports.EvaluationTaskType = EvaluationTaskType;
exports.ExportAutomatedReasoningPolicyVersionCommand = ExportAutomatedReasoningPolicyVersionCommand;
exports.ExternalSourceType = ExternalSourceType;
exports.FineTuningJobStatus = FineTuningJobStatus;
exports.FoundationModelLifecycleStatus = FoundationModelLifecycleStatus;
exports.GetAutomatedReasoningPolicyAnnotationsCommand = GetAutomatedReasoningPolicyAnnotationsCommand;
exports.GetAutomatedReasoningPolicyBuildWorkflowCommand = GetAutomatedReasoningPolicyBuildWorkflowCommand;
exports.GetAutomatedReasoningPolicyBuildWorkflowResultAssetsCommand = GetAutomatedReasoningPolicyBuildWorkflowResultAssetsCommand;
exports.GetAutomatedReasoningPolicyCommand = GetAutomatedReasoningPolicyCommand;
exports.GetAutomatedReasoningPolicyNextScenarioCommand = GetAutomatedReasoningPolicyNextScenarioCommand;
exports.GetAutomatedReasoningPolicyTestCaseCommand = GetAutomatedReasoningPolicyTestCaseCommand;
exports.GetAutomatedReasoningPolicyTestResultCommand = GetAutomatedReasoningPolicyTestResultCommand;
exports.GetCustomModelCommand = GetCustomModelCommand;
exports.GetCustomModelDeploymentCommand = GetCustomModelDeploymentCommand;
exports.GetEvaluationJobCommand = GetEvaluationJobCommand;
exports.GetFoundationModelAvailabilityCommand = GetFoundationModelAvailabilityCommand;
exports.GetFoundationModelCommand = GetFoundationModelCommand;
exports.GetGuardrailCommand = GetGuardrailCommand;
exports.GetImportedModelCommand = GetImportedModelCommand;
exports.GetInferenceProfileCommand = GetInferenceProfileCommand;
exports.GetMarketplaceModelEndpointCommand = GetMarketplaceModelEndpointCommand;
exports.GetModelCopyJobCommand = GetModelCopyJobCommand;
exports.GetModelCustomizationJobCommand = GetModelCustomizationJobCommand;
exports.GetModelImportJobCommand = GetModelImportJobCommand;
exports.GetModelInvocationJobCommand = GetModelInvocationJobCommand;
exports.GetModelInvocationLoggingConfigurationCommand = GetModelInvocationLoggingConfigurationCommand;
exports.GetPromptRouterCommand = GetPromptRouterCommand;
exports.GetProvisionedModelThroughputCommand = GetProvisionedModelThroughputCommand;
exports.GetUseCaseForModelAccessCommand = GetUseCaseForModelAccessCommand;
exports.GuardrailContentFilterAction = GuardrailContentFilterAction;
exports.GuardrailContentFilterType = GuardrailContentFilterType;
exports.GuardrailContentFiltersTierName = GuardrailContentFiltersTierName;
exports.GuardrailContextualGroundingAction = GuardrailContextualGroundingAction;
exports.GuardrailContextualGroundingFilterType = GuardrailContextualGroundingFilterType;
exports.GuardrailFilterStrength = GuardrailFilterStrength;
exports.GuardrailManagedWordsType = GuardrailManagedWordsType;
exports.GuardrailModality = GuardrailModality;
exports.GuardrailPiiEntityType = GuardrailPiiEntityType;
exports.GuardrailSensitiveInformationAction = GuardrailSensitiveInformationAction;
exports.GuardrailStatus = GuardrailStatus;
exports.GuardrailTopicAction = GuardrailTopicAction;
exports.GuardrailTopicType = GuardrailTopicType;
exports.GuardrailTopicsTierName = GuardrailTopicsTierName;
exports.GuardrailWordAction = GuardrailWordAction;
exports.InferenceProfileStatus = InferenceProfileStatus;
exports.InferenceProfileType = InferenceProfileType;
exports.InferenceType = InferenceType;
exports.InternalServerException = InternalServerException$1;
exports.JobStatusDetails = JobStatusDetails;
exports.ListAutomatedReasoningPoliciesCommand = ListAutomatedReasoningPoliciesCommand;
exports.ListAutomatedReasoningPolicyBuildWorkflowsCommand = ListAutomatedReasoningPolicyBuildWorkflowsCommand;
exports.ListAutomatedReasoningPolicyTestCasesCommand = ListAutomatedReasoningPolicyTestCasesCommand;
exports.ListAutomatedReasoningPolicyTestResultsCommand = ListAutomatedReasoningPolicyTestResultsCommand;
exports.ListCustomModelDeploymentsCommand = ListCustomModelDeploymentsCommand;
exports.ListCustomModelsCommand = ListCustomModelsCommand;
exports.ListEvaluationJobsCommand = ListEvaluationJobsCommand;
exports.ListFoundationModelAgreementOffersCommand = ListFoundationModelAgreementOffersCommand;
exports.ListFoundationModelsCommand = ListFoundationModelsCommand;
exports.ListGuardrailsCommand = ListGuardrailsCommand;
exports.ListImportedModelsCommand = ListImportedModelsCommand;
exports.ListInferenceProfilesCommand = ListInferenceProfilesCommand;
exports.ListMarketplaceModelEndpointsCommand = ListMarketplaceModelEndpointsCommand;
exports.ListModelCopyJobsCommand = ListModelCopyJobsCommand;
exports.ListModelCustomizationJobsCommand = ListModelCustomizationJobsCommand;
exports.ListModelImportJobsCommand = ListModelImportJobsCommand;
exports.ListModelInvocationJobsCommand = ListModelInvocationJobsCommand;
exports.ListPromptRoutersCommand = ListPromptRoutersCommand;
exports.ListProvisionedModelThroughputsCommand = ListProvisionedModelThroughputsCommand;
exports.ListTagsForResourceCommand = ListTagsForResourceCommand;
exports.ModelCopyJobStatus = ModelCopyJobStatus;
exports.ModelCustomization = ModelCustomization;
exports.ModelCustomizationJobStatus = ModelCustomizationJobStatus;
exports.ModelImportJobStatus = ModelImportJobStatus;
exports.ModelInvocationJobStatus = ModelInvocationJobStatus;
exports.ModelModality = ModelModality;
exports.ModelStatus = ModelStatus;
exports.OfferType = OfferType;
exports.PerformanceConfigLatency = PerformanceConfigLatency;
exports.PromptRouterStatus = PromptRouterStatus;
exports.PromptRouterType = PromptRouterType;
exports.ProvisionedModelStatus = ProvisionedModelStatus;
exports.PutModelInvocationLoggingConfigurationCommand = PutModelInvocationLoggingConfigurationCommand;
exports.PutUseCaseForModelAccessCommand = PutUseCaseForModelAccessCommand;
exports.QueryTransformationType = QueryTransformationType;
exports.RegionAvailability = RegionAvailability;
exports.RegisterMarketplaceModelEndpointCommand = RegisterMarketplaceModelEndpointCommand;
exports.RerankingMetadataSelectionMode = RerankingMetadataSelectionMode;
exports.ResourceInUseException = ResourceInUseException$1;
exports.ResourceNotFoundException = ResourceNotFoundException$1;
exports.RetrieveAndGenerateType = RetrieveAndGenerateType;
exports.S3InputFormat = S3InputFormat;
exports.SearchType = SearchType;
exports.ServiceQuotaExceededException = ServiceQuotaExceededException$1;
exports.ServiceUnavailableException = ServiceUnavailableException$1;
exports.SortByProvisionedModels = SortByProvisionedModels;
exports.SortJobsBy = SortJobsBy;
exports.SortModelsBy = SortModelsBy;
exports.SortOrder = SortOrder;
exports.StartAutomatedReasoningPolicyBuildWorkflowCommand = StartAutomatedReasoningPolicyBuildWorkflowCommand;
exports.StartAutomatedReasoningPolicyTestWorkflowCommand = StartAutomatedReasoningPolicyTestWorkflowCommand;
exports.Status = Status;
exports.StopEvaluationJobCommand = StopEvaluationJobCommand;
exports.StopModelCustomizationJobCommand = StopModelCustomizationJobCommand;
exports.StopModelInvocationJobCommand = StopModelInvocationJobCommand;
exports.TagResourceCommand = TagResourceCommand;
exports.ThrottlingException = ThrottlingException$1;
exports.TooManyTagsException = TooManyTagsException$1;
exports.UntagResourceCommand = UntagResourceCommand;
exports.UpdateAutomatedReasoningPolicyAnnotationsCommand = UpdateAutomatedReasoningPolicyAnnotationsCommand;
exports.UpdateAutomatedReasoningPolicyCommand = UpdateAutomatedReasoningPolicyCommand;
exports.UpdateAutomatedReasoningPolicyTestCaseCommand = UpdateAutomatedReasoningPolicyTestCaseCommand;
exports.UpdateGuardrailCommand = UpdateGuardrailCommand;
exports.UpdateMarketplaceModelEndpointCommand = UpdateMarketplaceModelEndpointCommand;
exports.UpdateProvisionedModelThroughputCommand = UpdateProvisionedModelThroughputCommand;
exports.ValidationException = ValidationException$1;
exports.VectorSearchRerankingConfigurationType = VectorSearchRerankingConfigurationType;
exports.paginateListAutomatedReasoningPolicies = paginateListAutomatedReasoningPolicies;
exports.paginateListAutomatedReasoningPolicyBuildWorkflows = paginateListAutomatedReasoningPolicyBuildWorkflows;
exports.paginateListAutomatedReasoningPolicyTestCases = paginateListAutomatedReasoningPolicyTestCases;
exports.paginateListAutomatedReasoningPolicyTestResults = paginateListAutomatedReasoningPolicyTestResults;
exports.paginateListCustomModelDeployments = paginateListCustomModelDeployments;
exports.paginateListCustomModels = paginateListCustomModels;
exports.paginateListEvaluationJobs = paginateListEvaluationJobs;
exports.paginateListGuardrails = paginateListGuardrails;
exports.paginateListImportedModels = paginateListImportedModels;
exports.paginateListInferenceProfiles = paginateListInferenceProfiles;
exports.paginateListMarketplaceModelEndpoints = paginateListMarketplaceModelEndpoints;
exports.paginateListModelCopyJobs = paginateListModelCopyJobs;
exports.paginateListModelCustomizationJobs = paginateListModelCustomizationJobs;
exports.paginateListModelImportJobs = paginateListModelImportJobs;
exports.paginateListModelInvocationJobs = paginateListModelInvocationJobs;
exports.paginateListPromptRouters = paginateListPromptRouters;
exports.paginateListProvisionedModelThroughputs = paginateListProvisionedModelThroughputs;
