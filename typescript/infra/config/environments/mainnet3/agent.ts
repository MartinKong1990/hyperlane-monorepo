import {
  Chains,
  GasPaymentEnforcement,
  GasPaymentEnforcementPolicyType,
  RpcConsensusType,
  chainMetadata,
  getDomainId,
} from '@hyperlane-xyz/sdk';

import {
  AgentChainConfig,
  RootAgentConfig,
  getAgentChainNamesFromConfig,
} from '../../../src/config/agent/agent.js';
import {
  matchingList,
  routerMatchingList,
} from '../../../src/config/agent/relayer.js';
import { ALL_KEY_ROLES, Role } from '../../../src/roles.js';
import { Contexts } from '../../contexts.js';

import { environment, supportedChainNames } from './chains.js';
import { helloWorld } from './helloworld.js';
import { validatorChainConfig } from './validators.js';
import ancient8EthereumUsdcAddresses from './warp/ancient8-USDC-addresses.json';
import arbitrumTIAAddresses from './warp/arbitrum-TIA-addresses.json';
import inevmEthereumUsdcAddresses from './warp/inevm-USDC-addresses.json';
import inevmEthereumUsdtAddresses from './warp/inevm-USDT-addresses.json';
import injectiveInevmInjAddresses from './warp/injective-inevm-addresses.json';
import mantaTIAAddresses from './warp/manta-TIA-addresses.json';
import victionEthereumEthAddresses from './warp/viction-ETH-addresses.json';
import victionEthereumUsdcAddresses from './warp/viction-USDC-addresses.json';
import victionEthereumUsdtAddresses from './warp/viction-USDT-addresses.json';

const releaseCandidateHelloworldMatchingList = routerMatchingList(
  helloWorld[Contexts.ReleaseCandidate].addresses,
);

const repo = 'gcr.io/abacus-labs-dev/hyperlane-agent';

// The chains here must be consistent with the environment's supportedChainNames, which is
// checked / enforced at runtime & in the CI pipeline.
//
// This is intentionally separate and not derived from the environment's supportedChainNames
// to allow for more fine-grained control over which chains are enabled for each agent role.
export const hyperlaneContextAgentChainConfig: AgentChainConfig = {
  // Generally, we run all production validators in the Hyperlane context.
  [Role.Validator]: {
    [Chains.arbitrum]: true,
    [Chains.ancient8]: true,
    [Chains.avalanche]: true,
    [Chains.base]: true,
    [Chains.blast]: true,
    [Chains.bsc]: true,
    [Chains.celo]: true,
    [Chains.ethereum]: true,
    [Chains.neutron]: true,
    [Chains.mantapacific]: true,
    [Chains.mode]: true,
    [Chains.moonbeam]: true,
    [Chains.optimism]: true,
    [Chains.polygon]: true,
    [Chains.gnosis]: true,
    [Chains.scroll]: true,
    [Chains.polygonzkevm]: true,
    [Chains.injective]: true,
    [Chains.inevm]: true,
    [Chains.viction]: true,
  },
  [Role.Relayer]: {
    [Chains.arbitrum]: true,
    [Chains.ancient8]: true,
    [Chains.avalanche]: true,
    [Chains.base]: true,
    [Chains.blast]: true,
    [Chains.bsc]: true,
    [Chains.celo]: true,
    [Chains.ethereum]: true,
    // At the moment, we only relay between Neutron and Manta Pacific on the neutron context.
    [Chains.neutron]: false,
    [Chains.mantapacific]: false,
    [Chains.mode]: true,
    [Chains.moonbeam]: true,
    [Chains.optimism]: true,
    [Chains.polygon]: true,
    [Chains.gnosis]: true,
    [Chains.scroll]: true,
    [Chains.polygonzkevm]: true,
    [Chains.injective]: true,
    [Chains.inevm]: true,
    [Chains.viction]: true,
  },
  [Role.Scraper]: {
    [Chains.arbitrum]: true,
    [Chains.ancient8]: true,
    [Chains.avalanche]: true,
    [Chains.base]: true,
    [Chains.blast]: true,
    [Chains.bsc]: true,
    [Chains.celo]: true,
    [Chains.ethereum]: true,
    // Cannot scrape non-EVM chains
    [Chains.neutron]: false,
    [Chains.mantapacific]: true,
    [Chains.mode]: true,
    [Chains.moonbeam]: true,
    [Chains.optimism]: true,
    [Chains.polygon]: true,
    [Chains.gnosis]: true,
    [Chains.scroll]: true,
    [Chains.polygonzkevm]: true,
    // Cannot scrape non-EVM chains
    [Chains.injective]: false,
    [Chains.inevm]: true,
    // Has RPC non-compliance that breaks scraping.
    [Chains.viction]: false,
  },
};

export const hyperlaneContextAgentChainNames = getAgentChainNamesFromConfig(
  hyperlaneContextAgentChainConfig,
  supportedChainNames,
);

const contextBase = {
  namespace: environment,
  runEnv: environment,
  environmentChainNames: supportedChainNames,
  aws: {
    region: 'us-east-1',
  },
} as const;

const gasPaymentEnforcement: GasPaymentEnforcement[] = [
  // To cover ourselves against IGP indexing issues and to ensure Nexus
  // users have the best possible experience, we whitelist messages between
  // warp routes that we know are certainly paying for gas.
  {
    type: GasPaymentEnforcementPolicyType.None,
    matchingList: [
      ...routerMatchingList(injectiveInevmInjAddresses),
      ...matchingList(inevmEthereumUsdcAddresses),
      ...matchingList(inevmEthereumUsdtAddresses),
      ...routerMatchingList(victionEthereumEthAddresses),
      ...routerMatchingList(victionEthereumUsdcAddresses),
      ...routerMatchingList(victionEthereumUsdtAddresses),
      ...routerMatchingList(ancient8EthereumUsdcAddresses),
    ],
  },
  {
    type: GasPaymentEnforcementPolicyType.None,
    matchingList: matchingList(inevmEthereumUsdcAddresses),
  },
  {
    type: GasPaymentEnforcementPolicyType.None,
    matchingList: matchingList(inevmEthereumUsdtAddresses),
  },
  {
    type: GasPaymentEnforcementPolicyType.OnChainFeeQuoting,
  },
];

const metricAppContexts = [
  {
    name: 'helloworld',
    matchingList: routerMatchingList(helloWorld[Contexts.Hyperlane].addresses),
  },
  {
    name: 'injective_inevm_inj',
    matchingList: routerMatchingList(injectiveInevmInjAddresses),
  },
  {
    name: 'inevm_ethereum_usdc',
    matchingList: matchingList(inevmEthereumUsdcAddresses),
  },
  {
    name: 'inevm_ethereum_usdt',
    matchingList: matchingList(inevmEthereumUsdtAddresses),
  },
  {
    name: 'viction_ethereum_eth',
    matchingList: routerMatchingList(victionEthereumEthAddresses),
  },
  {
    name: 'viction_ethereum_usdc',
    matchingList: routerMatchingList(victionEthereumUsdcAddresses),
  },
  {
    name: 'viction_ethereum_usdt',
    matchingList: routerMatchingList(victionEthereumUsdtAddresses),
  },
  {
    name: 'ancient8_ethereum_usdc',
    matchingList: routerMatchingList(ancient8EthereumUsdcAddresses),
  },
];

const hyperlane: RootAgentConfig = {
  ...contextBase,
  context: Contexts.Hyperlane,
  contextChainNames: hyperlaneContextAgentChainNames,
  rolesWithKeys: ALL_KEY_ROLES,
  relayer: {
    rpcConsensusType: RpcConsensusType.Fallback,
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
    gasPaymentEnforcement: gasPaymentEnforcement,
    metricAppContexts,
  },
  validators: {
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
    rpcConsensusType: RpcConsensusType.Quorum,
    chains: validatorChainConfig(Contexts.Hyperlane),
  },
  scraper: {
    rpcConsensusType: RpcConsensusType.Fallback,
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
  },
};

const releaseCandidate: RootAgentConfig = {
  ...contextBase,
  context: Contexts.ReleaseCandidate,
  contextChainNames: hyperlaneContextAgentChainNames,
  rolesWithKeys: [Role.Relayer, Role.Kathy, Role.Validator],
  relayer: {
    rpcConsensusType: RpcConsensusType.Fallback,
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
    // We're temporarily (ab)using the RC relayer as a way to increase
    // message throughput.
    // whitelist: releaseCandidateHelloworldMatchingList,
    gasPaymentEnforcement,
    metricAppContexts,
  },
  validators: {
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
    rpcConsensusType: RpcConsensusType.Quorum,
    chains: validatorChainConfig(Contexts.ReleaseCandidate),
  },
};

const neutron: RootAgentConfig = {
  ...contextBase,
  contextChainNames: {
    validator: [],
    relayer: [
      chainMetadata.neutron.name,
      chainMetadata.mantapacific.name,
      chainMetadata.arbitrum.name,
    ],
    scraper: [],
  },
  context: Contexts.Neutron,
  rolesWithKeys: [Role.Relayer],
  relayer: {
    rpcConsensusType: RpcConsensusType.Fallback,
    docker: {
      repo,
      tag: 'a2d6af6-20240422-164135',
    },
    gasPaymentEnforcement: [
      {
        type: GasPaymentEnforcementPolicyType.None,
        matchingList: [
          ...routerMatchingList(mantaTIAAddresses),
          ...routerMatchingList(arbitrumTIAAddresses),
        ],
      },
      ...gasPaymentEnforcement,
    ],
    metricAppContexts: [
      {
        name: 'manta_tia',
        matchingList: routerMatchingList(mantaTIAAddresses),
      },
      {
        name: 'arbitrum_tia',
        matchingList: routerMatchingList(arbitrumTIAAddresses),
      },
    ],
  },
};

export const agents = {
  [Contexts.Hyperlane]: hyperlane,
  [Contexts.ReleaseCandidate]: releaseCandidate,
  [Contexts.Neutron]: neutron,
};
