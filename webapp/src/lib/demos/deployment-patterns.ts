/**
 * Stage content definitions for the Deployment Patterns demo.
 *
 * This track shows how to ship the TaskFlow app — and the AI features that
 * power it — using an Infrastructure as Code (IaC) approach. It covers the
 * cloud foundation, provisioning Azure AI Foundry resources, model
 * deployments, and Agents, plus environment promotion and CI/CD.
 */

import type { Demo, Stage } from "./types";

const stages: Stage[] = [
  // ─── 1. FOUNDATIONS ─────────────────────────────────────────────────────────
  {
    slug: "foundations",
    number: 1,
    name: "Foundations",
    tagline: "Treat infrastructure as versioned, reviewable code.",
    summary:
      "Before provisioning anything, AI helps the team pick an IaC toolchain, lay out a repository, and decide how state and environments are managed — so every environment is reproducible and every change is reviewed like application code.",
    challenge:
      "The team can click through the Azure portal to stand up TaskFlow, but nothing is reproducible: environments drift, there is no audit trail, and rebuilding staging takes a full day of manual clicks.",
    impact: "Replaced click-ops with reproducible, reviewable infrastructure",
    timeSaved: "~8 hours",
    humanPrompt: `We're deploying TaskFlow (a Next.js app) plus an AI assistant to Azure.
We want an Infrastructure as Code approach.

Please recommend:
1. An IaC tool choice for an Azure-first team, with trade-offs
2. A repository layout for modules and per-environment config
3. How to handle state, secrets, and drift
4. The core principles we should enforce in reviews`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Infrastructure as Code Foundations",
      },
      {
        type: "heading",
        level: 3,
        text: "Tooling Recommendation",
      },
      {
        type: "table",
        headers: ["Tool", "Best for", "Trade-off"],
        rows: [
          ["Bicep", "Azure-only teams, latest Azure features day one", "Azure-specific, not multi-cloud"],
          ["Terraform", "Multi-cloud or existing Terraform skills", "Provider lag on new Azure features"],
          ["Azure Developer CLI (azd)", "App + infra packaged together", "Opinionated project structure"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "For an Azure-first team shipping AI features fast, use Bicep for infrastructure and wrap it with the Azure Developer CLI (azd) so `azd up` provisions and deploys in one step.",
      },
      {
        type: "heading",
        level: 3,
        text: "Repository Layout",
      },
      {
        type: "code",
        language: "text",
        code: `infra/
├── main.bicep              # Subscription/RG entry point
├── main.parameters.json    # Default (dev) parameters
├── abbreviations.json      # Consistent resource naming
├── modules/
│   ├── core/               # Networking, Log Analytics, Key Vault
│   ├── hosting/            # Container Apps env + app
│   ├── ai/                 # AI Foundry account, project, models
│   └── agents/             # Agent configuration inputs
└── environments/
    ├── dev.bicepparam
    ├── test.bicepparam
    └── prod.bicepparam`,
      },
      {
        type: "heading",
        level: 3,
        text: "State, Secrets & Drift",
      },
      {
        type: "list",
        items: [
          "State: Bicep is stateless — the deployment target (resource group) is the source of truth. With Terraform, store state in an Azure Storage backend with locking.",
          "Secrets: never commit secrets. Store them in Azure Key Vault and reference them; use managed identities instead of connection strings wherever possible.",
          "Drift: run `az deployment group what-if` (or `terraform plan`) in CI on every pull request so reviewers see exactly what will change.",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Principles to Enforce in Review",
      },
      {
        type: "checklist",
        items: [
          { checked: true, text: "Every resource is defined in code — no portal-only changes" },
          { checked: true, text: "Environments differ only by parameter files, not by module logic" },
          { checked: true, text: "Resources are tagged (env, owner, cost-center) for governance" },
          { checked: true, text: "Managed identity is preferred over keys and secrets" },
        ],
      },
    ],
  },

  // ─── 2. CORE INFRASTRUCTURE ─────────────────────────────────────────────────
  {
    slug: "core-infrastructure",
    number: 2,
    name: "Core Infrastructure",
    tagline: "Provision the cloud foundation the app runs on.",
    summary:
      "With the toolchain chosen, AI scaffolds the Bicep modules for the shared foundation — observability, secrets, a container registry, and a Container Apps environment — that everything else builds on.",
    challenge:
      "TaskFlow needs somewhere to run its container, a registry to pull images from, centralized logs, and a vault for secrets — all wired together securely and repeatably.",
    impact: "Generated a reusable, parameterized foundation module",
    timeSaved: "~10 hours",
    humanPrompt: `Scaffold the core Azure infrastructure for TaskFlow in Bicep:
- Log Analytics workspace for observability
- Key Vault for secrets
- Azure Container Registry
- Container Apps environment + the app itself, using a managed identity

Keep it parameterized so dev/test/prod share the same module.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Core Infrastructure Module",
      },
      {
        type: "paragraph",
        text: "A single hosting module wires the app to a managed identity so it can pull images and read secrets without any stored credentials.",
      },
      {
        type: "code",
        language: "bicep",
        code: `// modules/hosting/main.bicep
param location string = resourceGroup().location
param environmentName string
param imageTag string
param registryName string
param logAnalyticsId string

// User-assigned identity the app runs as
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-taskflow-\${environmentName}'
  location: location
}

resource managedEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-taskflow-\${environmentName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: { customerId: logAnalyticsId }
    }
  }
}

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'ca-taskflow-\${environmentName}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '\${identity.id}': {} }
  }
  properties: {
    managedEnvironmentId: managedEnv.id
    configuration: {
      ingress: { external: true, targetPort: 3000 }
      registries: [
        { server: '\${registryName}.azurecr.io', identity: identity.id }
      ]
    }
    template: {
      containers: [
        {
          name: 'taskflow'
          image: '\${registryName}.azurecr.io/taskflow:\${imageTag}'
          resources: { cpu: json('0.5'), memory: '1Gi' }
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 5 }
    }
  }
}

output appFqdn string = app.properties.configuration.ingress.fqdn
output principalId string = identity.properties.principalId`,
      },
      {
        type: "callout",
        variant: "success",
        text: "The app authenticates to the container registry and Key Vault with its managed identity — no admin credentials are ever stored in the deployment.",
      },
      {
        type: "list",
        items: [
          "Container Apps gives serverless scale-to-many with per-request billing — a good fit for a demo workload.",
          "The identity's principalId is exported so later modules can grant it access to AI resources and secrets.",
          "Everything is driven by parameters (environmentName, imageTag), so promoting to test/prod is just a different parameter file.",
        ],
      },
    ],
  },

  // ─── 3. AI RESOURCES ────────────────────────────────────────────────────────
  {
    slug: "ai-resources",
    number: 3,
    name: "AI Resources",
    tagline: "Provision Azure AI Foundry and model deployments as code.",
    summary:
      "AI resources need special care: the account, a Foundry project, and specific model deployments with capacity all belong in code so the exact model versions and quota are reproducible across environments.",
    challenge:
      "TaskFlow's assistant needs a chat model and an embedding model. Deploying these by hand means unknown model versions, unmanaged quota, and no way to reproduce the setup in another environment.",
    impact: "Pinned model versions and capacity as reproducible IaC",
    timeSaved: "~9 hours",
    humanPrompt: `Add Azure AI Foundry to our Bicep. We need:
- An AI Foundry (AI Services) account with a Foundry project
- A GPT-4o chat deployment and a text-embedding-3-large deployment
- Pinned model versions and explicit capacity (TPM)
- The app's managed identity granted data-plane access — no API keys`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Azure AI Foundry Resources",
      },
      {
        type: "callout",
        variant: "info",
        text: "Azure AI Foundry is modeled as a Cognitive Services account of kind 'AIServices'. A Foundry project is a child resource, and each model you use is an explicit deployment with its own version and capacity.",
      },
      {
        type: "code",
        language: "bicep",
        code: `// modules/ai/main.bicep
param location string = resourceGroup().location
param environmentName string
param appPrincipalId string

resource foundry 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' = {
  name: 'aif-taskflow-\${environmentName}'
  location: location
  kind: 'AIServices'
  sku: { name: 'S0' }
  identity: { type: 'SystemAssigned' }
  properties: {
    allowProjectManagement: true
    customSubDomainName: 'aif-taskflow-\${environmentName}'
    disableLocalAuth: true // force Entra ID auth, no API keys
  }
}

resource project 'Microsoft.CognitiveServices/accounts/projects@2025-04-01-preview' = {
  parent: foundry
  name: 'taskflow-assistant'
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    displayName: 'TaskFlow Assistant'
  }
}

// Model deployments — pinned versions + explicit capacity (1 unit = 1K TPM)
resource chat 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = {
  parent: foundry
  name: 'gpt-4o'
  sku: { name: 'GlobalStandard', capacity: 30 }
  properties: {
    model: { format: 'OpenAI', name: 'gpt-4o', version: '2024-11-20' }
  }
}

resource embed 'Microsoft.CognitiveServices/accounts/deployments@2025-04-01-preview' = {
  parent: foundry
  name: 'text-embedding-3-large'
  dependsOn: [ chat ] // deployments must be created sequentially
  sku: { name: 'Standard', capacity: 20 }
  properties: {
    model: { format: 'OpenAI', name: 'text-embedding-3-large', version: '1' }
  }
}`,
      },
      {
        type: "heading",
        level: 3,
        text: "Grant the App Access — No Keys",
      },
      {
        type: "code",
        language: "bicep",
        code: `// Role: Cognitive Services OpenAI User
var openAiUserRole = '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'

resource access 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(foundry.id, appPrincipalId, openAiUserRole)
  scope: foundry
  properties: {
    principalId: appPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions', openAiUserRole)
  }
}

output foundryEndpoint string = foundry.properties.endpoint
output projectName string = project.name`,
      },
      {
        type: "table",
        headers: ["Concern", "Why it matters", "How IaC handles it"],
        rows: [
          ["Model version", "New versions change behavior & cost", "Pinned explicitly in the deployment"],
          ["Capacity (TPM)", "Under-provisioning causes 429s", "Set per environment via `capacity`"],
          ["Auth", "Keys leak and rotate poorly", "`disableLocalAuth` + managed identity roles"],
          ["Quota drift", "Manual bumps aren't reproducible", "Declared as code, reviewed in PRs"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Model quota (TPM) is a subscription/region limit. Keep dev capacity small and request higher quota for prod ahead of time — the deployment will fail if requested capacity exceeds available quota.",
      },
    ],
  },

  // ─── 4. AGENTS ──────────────────────────────────────────────────────────────
  {
    slug: "agents",
    number: 4,
    name: "Agents",
    tagline: "Define Foundry Agents and their tools declaratively.",
    summary:
      "Agents live on the Foundry data plane, so the pattern is to provision the project and connections with IaC, then apply a versioned agent definition from the pipeline — keeping instructions, tools, and model wiring in source control.",
    challenge:
      "TaskFlow's assistant should answer questions and call the app's task API. Creating that agent by clicking in the portal means its instructions and tools live nowhere reviewable and can't be promoted between environments.",
    impact: "Versioned agent definitions promoted through the pipeline",
    timeSaved: "~7 hours",
    humanPrompt: `We want a Foundry Agent for TaskFlow that can search the docs and
call our task API. How should agents fit our IaC approach, given they're
a data-plane resource? Show a declarative agent definition and how the
pipeline applies it per environment.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Agents in an IaC Workflow",
      },
      {
        type: "callout",
        variant: "info",
        text: "Split responsibilities: use Bicep for the control plane (project, model deployments, connections, RBAC), and a versioned definition applied by the pipeline for the data plane (the agent itself, its instructions, and tools).",
      },
      {
        type: "heading",
        level: 3,
        text: "Declarative Agent Definition",
      },
      {
        type: "code",
        language: "yaml",
        code: `# agents/taskflow-assistant.agent.yaml
name: taskflow-assistant
model: gpt-4o          # matches the deployment name from the AI module
instructions: |
  You are the TaskFlow assistant. Help users find and manage tasks.
  Always confirm before creating or deleting a task. Be concise.
tools:
  - type: file_search        # grounded on uploaded product docs
  - type: openapi
    openapi:
      name: taskflow_api
      spec_url: https://\${APP_FQDN}/openapi.json
      auth:
        type: managed_identity
temperature: 0.2`,
      },
      {
        type: "heading",
        level: 3,
        text: "Apply From the Pipeline",
      },
      {
        type: "code",
        language: "bash",
        code: `# Provision control-plane resources first
az deployment group create -g rg-taskflow-$ENV \\
  -f infra/main.bicep -p infra/environments/$ENV.bicepparam

# Then apply the agent definition to the Foundry project (data plane)
az foundry agent apply \\
  --project taskflow-assistant \\
  --file agents/taskflow-assistant.agent.yaml \\
  --set APP_FQDN=$APP_FQDN`,
      },
      {
        type: "list",
        items: [
          "The agent definition is code: reviewed in PRs, versioned, and identical across environments except for injected values like APP_FQDN.",
          "Tools authenticate with the app's managed identity, so the agent calls the task API without embedded secrets.",
          "Because the model name references the pinned deployment, the agent always runs on the exact model version provisioned by the AI module.",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Agents can take actions on behalf of users. Scope their tools narrowly, require confirmation for destructive operations, and give the agent's identity only the RBAC roles it truly needs.",
      },
    ],
  },

  // ─── 5. ENVIRONMENTS ────────────────────────────────────────────────────────
  {
    slug: "environments",
    number: 5,
    name: "Environments",
    tagline: "Promote the same code across dev, test, and prod.",
    summary:
      "With modules in place, AI shows how a single template serves every environment: only parameter files differ, so promotion is a predictable, low-risk change rather than a re-build.",
    challenge:
      "Dev, test, and prod have quietly drifted apart. Prod needs bigger model quota and stricter networking, but the team doesn't want three copies of the templates to maintain.",
    impact: "One template, environment differences isolated to parameters",
    timeSaved: "~6 hours",
    humanPrompt: `Show how to keep one set of Bicep modules but vary dev/test/prod.
Prod should have higher model capacity and more app replicas.
How do we make promotion safe and reviewable?`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Environment Promotion Pattern",
      },
      {
        type: "paragraph",
        text: "The template stays constant; each environment supplies its own parameter file. Diffs between environments are visible in one place.",
      },
      {
        type: "code",
        language: "bicep",
        code: `// infra/environments/prod.bicepparam
using '../main.bicep'

param environmentName = 'prod'
param location = 'eastus2'

// Prod runs hotter and larger than dev
param chatCapacity = 100      // vs 30 in dev
param minReplicas = 3         // vs 1 in dev
param maxReplicas = 20
param enablePrivateNetworking = true`,
      },
      {
        type: "table",
        headers: ["Setting", "dev", "test", "prod"],
        rows: [
          ["Chat capacity (TPM units)", "30", "60", "100"],
          ["App replicas (min–max)", "1–5", "2–10", "3–20"],
          ["Private networking", "off", "off", "on"],
          ["Delete protection", "off", "off", "on"],
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "Safe Promotion",
      },
      {
        type: "checklist",
        items: [
          { checked: true, text: "Preview every change with what-if before it is applied" },
          { checked: true, text: "Promote the exact image digest and template that passed in test" },
          { checked: true, text: "Require an approval gate before the prod deployment runs" },
          { checked: true, text: "Keep prod-only guards (locks, private networking) in the prod params" },
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Promote artifacts, not source. Deploy the same container image digest and Bicep template that were validated in test — never rebuild for prod.",
      },
    ],
  },

  // ─── 6. PIPELINE & GOVERNANCE ───────────────────────────────────────────────
  {
    slug: "pipeline",
    number: 6,
    name: "Pipeline & Governance",
    tagline: "Automate deploys and keep AI resources governed.",
    summary:
      "Finally, AI assembles the CI/CD pipeline that ties it together — building the image, previewing infrastructure changes, deploying with approvals, and adding the guardrails and monitoring that AI workloads specifically need.",
    challenge:
      "Everything is in code, but deploys are still run from laptops. There's no automated preview, no approval trail, and no monitoring of model usage, cost, or content safety.",
    impact: "Fully automated, governed delivery for app + AI",
    timeSaved: "~8 hours",
    humanPrompt: `Create a GitHub Actions pipeline that:
1. Builds & pushes the TaskFlow image
2. Runs what-if on the infra as a preview
3. Deploys infra + app, then applies the agent definition
4. Requires approval before prod

Also list the governance & monitoring we need specifically for the AI resources.`,
    aiResponse: [
      {
        type: "heading",
        level: 2,
        text: "Delivery Pipeline",
      },
      {
        type: "code",
        language: "yaml",
        code: `name: Deploy TaskFlow
on:
  push:
    branches: [main]

permissions:
  id-token: write   # OIDC federation to Azure — no stored secrets
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: \${{ vars.AZURE_CLIENT_ID }}
          tenant-id: \${{ vars.AZURE_TENANT_ID }}
          subscription-id: \${{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Build & push image
        run: |
          az acr build -r \$ACR_NAME -t taskflow:\${{ github.sha }} .

  deploy-prod:
    needs: build
    runs-on: ubuntu-latest
    environment: production   # GitHub approval gate
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: \${{ vars.AZURE_CLIENT_ID }}
          tenant-id: \${{ vars.AZURE_TENANT_ID }}
          subscription-id: \${{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Preview changes
        run: az deployment group what-if -g rg-taskflow-prod \\
          -f infra/main.bicep -p infra/environments/prod.bicepparam
      - name: Deploy infrastructure
        run: az deployment group create -g rg-taskflow-prod \\
          -f infra/main.bicep -p infra/environments/prod.bicepparam \\
          -p imageTag=\${{ github.sha }}
      - name: Apply agent definition
        run: az foundry agent apply --project taskflow-assistant \\
          --file agents/taskflow-assistant.agent.yaml`,
      },
      {
        type: "callout",
        variant: "success",
        text: "The pipeline authenticates with OIDC workload identity federation, so there are no long-lived Azure credentials stored in GitHub.",
      },
      {
        type: "heading",
        level: 3,
        text: "Governance & Monitoring for AI Resources",
      },
      {
        type: "list",
        items: [
          "Cost & usage: alert on token consumption and per-model spend; dev capacity stays capped so a runaway loop can't drain quota.",
          "Content safety: enable Azure AI Content Safety filters on deployments and log blocked prompts/responses.",
          "Auditing: send Foundry diagnostic logs to Log Analytics to trace which agent and model handled each request.",
          "Policy: use Azure Policy to deny AI accounts with local auth enabled or without required tags.",
          "Responsible AI: keep prompts, instructions, and evaluation results in source control so behavior changes are reviewable.",
        ],
      },
      {
        type: "checklist",
        items: [
          { checked: true, text: "OIDC federation — no stored cloud secrets" },
          { checked: true, text: "what-if preview on every deploy" },
          { checked: true, text: "Approval gate before production" },
          { checked: true, text: "Token, cost, and content-safety monitoring on AI resources" },
        ],
      },
    ],
  },
];

export const deploymentPatternsDemo: Demo = {
  slug: "deployment-patterns",
  badge: "Track 02",
  title: "Deployment Patterns",
  tagline: "Ship apps and AI resources with an Infrastructure as Code approach.",
  description:
    "Take TaskFlow to production the repeatable way: define the cloud foundation, Azure AI Foundry resources, model deployments, and Agents entirely as code — then promote across environments through a governed CI/CD pipeline.",
  audience: "Platform engineers and developers deploying AI-powered apps to the cloud.",
  outcome: "~48 hours saved provisioning app + AI infra",
  status: "available",
  stages,
};
