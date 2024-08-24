// LogReducer.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Form, Button, DatePicker, Select, Space, Card, notification, Spin } from 'antd';
import { Switch } from 'antd';
import { Input, Collapse, InputNumber, Radio } from 'antd';
import { AlignCenterOutlined, AliwangwangOutlined, DownloadOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const { Option } = Select;

const LogReducer = () => {
  
  const [reductionRate, setReductionRate] = useState(15);
  
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnly, setShowOnly] = useState('');
  const [rawLogsLen, setRawLogsLen] = useState(0);
  const [reducedLogsLen, setReducedLogsLen] = useState(0);
  const [wrapLines, setWrapLines] = useState(false);

  const [loading, setLoading] = useState(false);
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [pods, setPods] = useState([]);
  const [services, setServices] = useState([]);

  const [grafanaUrl, setGrafanaUrl] = useState(null);

  const [form] = Form.useForm();

  const service_pod_mapping = {
    "checkout": [
      "checkout",
      "checkout-communication-service",
      "checkout-consumer",
      "checkout-service"
    ],
    "cms": [
      "availability-service",
      "cloud-menu-api",
      "cloud-menu-app",
      "cms-base-service",
      "cms-haproxy",
      "grasshopper",
      "menu-service",
      "menu-service-read",
      "self-serve-service",
      "tms"
    ],
    "crm": [
      "helpcenter"
    ],
    "dash-sf": [
      "dash-front",
      "dash-front-staging"
    ],
    "del-platform": [
      "dash-front",
      "dash-front-staging"
    ],
    "delivery-capacity": [
      "de-allocator"
    ],
    "devops": [
      "hapv2-anobis.swiggy.com",
      "hapv2-api.swiggy.com",
      "hapv2-app.swiggy.com",
      "hapv2-capi.mini.store",
      "hapv2-cash-api.swiggy.in",
      "hapv2-cash.swiggy.com",
      "hapv2-cconeview-services.swiggy.com",
      "hapv2-chat.mini.store",
      "hapv2-chkout.swiggy.com",
      "hapv2-cloud-menu-cms.swiggy.com",
      "hapv2-connect.swiggy.com",
      "hapv2-dash.swiggy.com",
      "hapv2-de-api.swiggy.in",
      "hapv2-dec-api.swiggy.in",
      "hapv2-dineout-cms-dashboard.swiggyops.de",
      "hapv2-disc.swiggy.com",
      "hapv2-events.swiggy.com",
      "hapv2-external-dashboards",
      "hapv2-fulfillment-middleware.swiggy.com",
      "hapv2-generic.mini.store",
      "hapv2-ipay.swiggy.com",
      "hapv2-maps.swiggy.com",
      "hapv2-marketing.swiggy.com",
      "hapv2-mini.store",
      "hapv2-momentsatwork.swiggy.com",
      "hapv2-oneview.swiggy.com",
      "hapv2-ops.swiggy.in",
      "hapv2-partner.swiggy.com",
      "hapv2-picker.swiggy.com",
      "hapv2-pos.swiggy.com",
      "hapv2-profile.swiggy.com",
      "hapv2-ride.swiggy.com",
      "hapv2-rms.swiggy.com",
      "hapv2-sapi.mini.store",
      "hapv2-sentinel.production.singapore",
      "hapv2-shop.mini.store",
      "hapv2-super-app.swiggy.com",
      "hapv2-surff-external.swiggy.com",
      "hapv2-telephony-service.swiggy.com",
      "hapv2-tns-flujo-ui.swiggyops.de",
      "hapv2-tns.swiggy.com",
      "hapv2-vendor-integration.swiggy.com",
      "hapv2-vendor.swiggy.com",
      "hapv2-vhc-composer.swiggy.com",
      "hapv2-vymo-adapter.swiggy.com",
      "hapv2-webhook.mini.store",
      "hapv2-www.swiggy.com",
      "internal-haproxy",
      "kong-egress",
      "kong-v2",
      "redirects-haproxy"
    ],
    "dinersone": [
      "c3pr"
    ],
    "dlm": [
      "de-auth-service",
      "delivery-misc",
      "delivery-service"
    ],
    "finance": [
      "finance-calcy-service",
      "finance-cash-schedulers",
      "finance-cash-service",
      "finance-conaro",
      "finance-job-service",
      "finance-nodal-service",
      "finance-recon-platform",
      "finance-reconciliation-service"
    ],
    "fulfillment": [
      "flo-server"
    ],
    "genie": [
      "flo-server"
    ],
    "growth": [
      "marketing-dashboard"
    ],
    "growthx": [
      "marketing-dashboard"
    ],
    "im-scm-inwarding": [
      "catalog2-dashboard",
      "dash-picker-front",
      "picker-api-gateway"
    ],
    "insanelygood": [
        "address-directory-api",
        "address-directory-worker",
        "catalog-worker",
        "complaints-api",
        "complaints-service-api",
        "complaints-worker",
        "demand-shaping-housekeeping-worker",
        "demand-shaping-worker",
        "fulfilment-api",
        "fulfilment-service-worker",
        "internal-suprdaily-prod",
        "marketplace-fulfilment-worker",
        "notifications-api",
        "offers-system-api",
        "presentation-layer-api",
        "storefront-api",
        "storefront-worker-order",
        "storefront-worker-payment",
        "supply-chain-api",
        "supply-chain-worker",
        "supr-notification-promotional-worker",
        "supr-notification-worker",
        "user-service-api",
        "warehouse-api",
        "warehouse-worker"
      ],
      "ni-catalog": [
        "cms-catalog-ingestion-workflow",
        "cms-product-service-new",
        "cms-sku-service-new"
      ],
      "payment": [
        "payment-presentation-service"
      ],
      "portal": [
        "checkout-web-api-server",
        "checkout-web-api-server-staging",
        "checkout-web-app"
      ],
      "promotion-bl": [
        "pricing-td-cache-service",
        "stress-service"
      ],
      "maxx": [
        "instamax-front",
        "instamax-front-staging"
      ],
      "partner-experience": [
        "aviator",
        "winston"
      ],
      "search": [
        "alfred-indexer-api",
        "alfred-suggest-service",
        "ingestion-pipeline",
        "voyager-search-service"
      ],
      "secend": [
        "krypto-email-proxy"
      ],
      "serviceability": [
        "cerebro-data",
        "serviceability-cronjob"
      ],
      "sf-foundation": [
        "gandalf",
        "gandalf-sm",
        "sand-user-service"
      ],
      "shuttle": [
        "shuttle",
        "shuttle-deployment-consumer",
        "shuttle-storage-consumer"
      ],
      "tna": [
        "product-feed"
      ],
      "ugc": [
        "carousel-dashboard",
        "carousel-service",
        "carousel-service-nav",
        "collections-service",
        "rasmalai-home",
        "sand-app-config-service",
        "sand-menu-service",
        "sand-menu-service-canary",
        "sand-scube"
      ],
      "vendor": [
        "communication-router",
        "consilium",
        "grand-maester",
        "interocitor",
        "metrics-scrapper",
        "resolutions-service",
        "swiggy-restaurant-services"
      ],
      "rock": ['abacus-authorizationserver-brand', 'abacus-authorizationserver-employee', 'active-tag-manager', 'ad-campaign-status-updates-consumer', 'address-manager-cas', 'address-manager-cas-nt', 'address-recommendations', 'ads-bidder', 'ads-dsp', 'ads-event-data-consumer', 'ads-ingestion-data-consumer', 'ads-migration', 'ads-serving', 'ads-serving-layer', 'ads-sos-event-consumer', 'ads-ssp', 'ads-unified-dashboard', 'alchemist', 'alchemist-api', 'alfred-presearch-service-grpc', 'algolia-pipeline', 'anm-ads-crons', 'anm-ads-platform', 'annapoorna', 'anobis-backend', 'anobis-ui', 'apekshit-samay-seva', 'apekshit-samay-seva-canary', 'app-notification-service', 'arachnotron', 'arbitrator', 'artemis', 'assignment-fxm', 'assignment-services', 'astro', 'audit-service', 'auto-assign', 'auto-assign-consumer', 'availability-read-service', 'bank-proxy-service', 'billing-service', 'brahma', 'brand-portal-service', 'bulk-upload', 'caliper', 'callisto', 'cancellation-service', 'carousel-crud-service', 'cart-platform', 'catalog-core', 'catalog-ingestion-service', 'catalog-intelligence', 'catalog-serve-layer', 'catalog-service', 'cbcc-core', 'cconeview-services', 'cdc-service', 'cdc-snowflake-sync', 'cerebro', 'chameleon', 'changeset-management', 'chat-engine-service', 'chat-middleware-events-handler', 'chat-middleware-web', 'chat-middleware-worker', 'checkout-dashboard-service', 'checkout-paas-service-mumbai', 'checkout-web-api-server', 'checkout-web-api-server-staging', 'checkout-web-app', 'checkout-web-app-staging', 'chitragupta', 'choreographer', 'chowkidar', 'circus', 'clm-admin-dashboard', 'clm-admin-service-v2', 'clm-kafka-connector-v2', 'clm-service-v2', 'clm-stream-attribute', 'cluster-autoscaler', 'cms-dashboard-bff', 'cms-sandbox-ui', 'communication-proxy-service', 'communication-service', 'commvault', 'compass-embed', 'compass-web-service', 'composer-payouts-engine', 'conan-discovery', 'config-ui', 'connect', 'connect-chat-service', 'connect-consumer-service', 'connect-consumer-web', 'connect-event-processor-service', 'connect-merchant-service', 'connect-ops-service', 'connect-seller-desktop', 'connect-seller-web', 'connect-seller-web-static', 'connect-sidekiq', 'connect-webhook-service', 'content', 'content-dungeon', 'context-service', 'core-discounting-server', 'core-pricing-service', 'count-server-v2', 'cp-controller', 'crm-kafka-connect-drogher', 'crm-kafka-connect-mercury', 'crm-kafka-connect-postman', 'crm-nps-reconciler', 'crm-nps-service', 'crm-track-service', 'customer-zones', 'dash-availability-service', 'dash-bcl-service', 'dash-bot-service', 'dash-business-metrics-service', 'dash-cart', 'dash-data-service', 'dash-data-source', 'dash-enrichment-service', 'dash-fulfilment', 'dash-offer-bl', 'dash-offer-crud', 'dash-order-audit-service', 'dash-order-intervention', 'dash-orderability', 'dash-picker-service', 'dash-pickers', 'dash-rack-management', 'dash-rating-service', 'dash-search', 'dash-serviceability', 'dash-timeline-service', 'dashdatasourceratelimitersidecar', 'dashenrichmentserviceratelimitersidecar', 'dashofferblratelimitersidecar', 'dashorderabilityratelimitersidecar', 'data-enricher', 'ddsratelimitersidecar', 'de-action-redressal', 'de-app-gateway', 'de-assistance-consumer', 'de-assistance-manager', 'de-assistance-webview', 'de-bazaar-service', 'de-bazaar-service-canary', 'de-cost-service', 'de-cx-bot', 'de-entity-consumers', 'de-entity-service', 'de-lifecycle-consumers', 'de-lifecycle-management', 'de-marcom', 'de-mobilisation', 'de-nudgeservice', 'de-oneview', 'de-safety-service', 'de-slot-service', 'de-supply-optimiser', 'de-surge', 'de-tier-service', 'de-tipping', 'deal-builder', 'deal-business', 'deentityserviceratelimitersidecar', 'del-banner-go', 'del-outlet-service', 'delivery-dashboard', 'delivery-decom', 'delivery-instructor', 'demeter', 'demo-ec2-producer', 'demo-hello-v1', 'demo-rock', 'demo-rock-canary', 'demo-rock-new', 'deso-data-nexus', 'deso-events', 'deso-notify', 'deso-voting', 'dexpconsumers', 'dexpqueryinterface', 'dineout-ads-dashboard', 'dineout-bl', 'dineout-bot', 'dineout-cart', 'dineout-checkout', 'dineout-cms-dashboard', 'dineout-deal-crm', 'dineout-discovery', 'dineout-marketplace-consumer', 'dineout-partner-service', 'dinersone-proxy', 'dkron', 'dlm-admin-dashboard', 'dlm-admin-service', 'dlm-bulk-upload', 'dlm-kafka-connector', 'dlm-service', 'dlm-sourcing-service', 'dlm-sourcing-service-canary', 'dns-orchestrator', 'do-discovery-v2', 'do-reservation', 'do-search-service', 'dp-admin-tools', 'dsl-platform', 'dsp-confluent-redis-connector', 'dsp-control-tower', 'dsp-ui', 'dumbledore', 'duplix', 'eirene', 'entity-service-layer', 'eotschedular', 'esme-grpc', 'event-log-service', 'event-sink', 'executor', 'external-dns', 'fact-repository', 'ff-fxm', 'ff-reminder-api', 'ff-reminder-notifier', 'ff-watchdog', 'finance-cash-dashboard', 'finance-dashboard', 'finance-de-payout-service', 'finance-erp-service', 'finance-maker-checker-service', 'finance-orchestrator', 'finance-pg-reconciliation', 'finance-report', 'finance-scheduler-service', 'flo-indexer', 'flo-ui', 'fluentd-logman', 'fluentd-logman-ambassador', 'fluentd-logman-az1', 'fluentd-logman-az2', 'fluentd-logman-az3', 'flujo-backend', 'fm-app-gateway', 'fondue', 'food-bl-worker', 'food-checkout-service', 'food-delivery-service', 'food-discovery-service', 'food-order-communication', 'food-pre-delivery-bot', 'foundation-gateway-service', 'fraud-detection-service', 'fraud-detection-service-grpc', 'fraud-firewall', 'fraudnabuse-eval', 'frequency-cappingservice', 'fulfillment-middleware', 'gatekeeper-service', 'genie-bl-worker', 'genie-integration-service', 'genie-marketplace-consumer', 'geofence-service', 'geofence-trip-consumer', 'geofencing-service', 'gifting-backend', 'gifting-sqs-listener', 'global-context-service', 'governance-rule-engine', 'growthx-core', 'heatmaps-api', 'heatmaps-consumer', 'heatmaps-cronjob', 'heimdall-core', 'heimdall-core-consumer', 'heimdall-data-accumulator', 'hofund', 'hofund-worker', 'hulk', 'hulk-consumer', 'identity-service', 'identity-validator', 'im-bl-worker', 'im-checkout-service', 'im-checkout-service-cpsdksidecar', 'instamart-discovery-service', 'instamart-post-order', 'instamart-post-order-consumer', 'instamax-front', 'irctc-gateway', 'iscan-ocr', 'istio-init', 'istio-proxy', 'item-crud-bl', 'item-crud-bl-canary', 'item-history-service', 'janus', 'job-leg-fission-service', 'kms', 'kms-apis-rock', 'kore', 'krakatoa-grpc', 'kryptonite-customer-email', 'kryptonite-customer-mobile', 'kube-schedule-scaler', 'kubelet', 'l10n', 'lassi', 'lego-ui', 'letterbox', 'locale', 'logger', 'logger-az1', 'logger-az2', 'logger-az3', 'loyalty-worker', 'map-editor', 'maps-data-layer', 'maps-middleware', 'marketing-events-consumer-service', 'marketing-events-producer-service', 'marketing-metadata-service', 'marketing-order-consumer-service', 'marketplace-checkout', 'marketplace-consumer', 'media-platform', 'meepo', 'membership-bl', 'membership-checkout-consumer', 'membership-crud', 'membership-server', 'membershipserverratelimitersidecar', 'mim-dashboard', 'movement-ingestion-gateway', 'narad-router', 'newrelic-proxy-reader', 'nginx', 'nomos', 'ods', 'ods-config-dashboard', 'ofb-grpc-server', 'ofb-rest-server', 'offer-builder', 'offer-food-business-crud', 'offer-server', 'offer-worker', 'ofo-events', 'ofo-flow-service', 'oforatelimitersidecar', 'oms-sync-service', 'one-compass-service', 'oneview', 'ops-portal', 'order-data-migration-service', 'order-distributor-grpc', 'order-edit-service', 'order-events-handler', 'order-platform', 'order-relayer', 'order-tracking', 'order-tracking-canary', 'orderability-service', 'osm-benchmarking', 'otp-service', 'ozone-authz-1-extauth', 'ozone-idp', 'ozone-idp-brands', 'ozone-idp-canary', 'ozone-idp-cx', 'ozone-idp-employees', 'paas-consumer-mumbai', 'partner-service', 'payments', 'payout-comm', 'payout-comm-canary', 'pbb-service', 'picker-admin', 'picker-assignment', 'places-manager', 'places-manager-canary', 'placing-fsm-service', 'plops', 'plutus', 'plutus-discover', 'pn-server', 'portal-helpcenter', 'post-order-services', 'postorder-abuse-eval', 'pre-made-catalog', 'preorder-cod-eval', 'preorder-offer-eval', 'pricing-worker', 'programmatic-nav-service', 'prometheus', 'prometheus-agent-temp', 'promise-engine', 'promtail-ambassador', 'pulsarv2', 'qp-solver', 'query-understanding-layer', 'rain-service', 'ranking-service', 'rate-card-service', 'rate-card-upload-service', 'ratings-consumer-service', 'ratings-service', 'referral-order-tracking-service', 'referral-service', 'regions-crud-service', 'regions-geo-cdm-1-tile38', 'regions-geo-cities', 'regions-geo-cities-tile38', 'regions-geo-raddress-1-core', 'regions-geo-raddress-1-tile38', 'regions-geo-service-places-1-tile38', 'regions-geo-serviceability', 'regions-geo-serviceability-tile38', 'regions-geo-stores-1-tile38', 'regions-geo-zones', 'regions-geo-zones-tile38', 'restaurant-closure-cancellations', 'restaurant-image-service', 'restaurant-micro-services', 'restaurant-one-portal', 'retool', 'retool-external', 'ride-with-us', 'rillprod', 'rilluat', 'rmsqueueworker', 'rnr', 'rock-events', 'rock-nonprod', 'rock-prod', 'rock-shuttle-demo-app', 'rop-portal', 'routing-service', 'routing-service-canary', 'routing-services-osm', 'salesforce-outbound-manager', 'sand-enrichment-service', 'santa', 'scm-access-control', 'scm-api-gateway', 'scm-asset-tracker', 'scm-capacity-controller', 'scm-ff-consumers', 'scm-file-upload-feedback-handler', 'scm-handler-service', 'scm-inventory-availability', 'scm-inventory-location', 'scm-invoicing', 'scm-procurement', 'scm-procurement-canary', 'scm-reporting', 'scm-supplier-master', 'scm-task-manager', 'scout', 'seal', 'seal-mumbai', 'seller-management', 'sentinel-extauth', 'sentinel-kenscio-ui-extauth', 'seo-data', 'seo-web-food', 'seo-web-food-staging', 'serviceability-fallback', 'serviceability-rain-service', 'session-service-grpc', 'session-service-v2', 'shaktimaan', 'shaktimaanratelimitersidecar', 'shtl-autoassign-consumer', 'slayer-service', 'sno', 'sr-attributes', 'sr-winback-campaigns', 'sr-winback-workflows', 'statsd', 'status-update-automation-service', 'statzilla', 'statzilla-aggregator', 'stores-bl-worker', 'stores-marketplace-consumer', 'subscription-service', 'super-stream-attribute', 'surff', 'svc-demand-optimizerx', 'svc-polygon-ingestion-service', 'svc-prediction', 'svcgateway', 'svcplatform-aggregator', 'svcplatform-collection', 'svcplatform-decision', 'svcplatform-middleware', 'svcplatform-prediction', 'svcplatform-stress', 'svcplatform-surge-pricing', 'swigconfig', 'swiggy-listing-service', 'swiggy-listing-service-consumer', 'swiggy-listing-service-tier2', 'swiggy-taxonomy-service', 'swiggy-vulnerability-backend', 'swiggylistingserviceratelimitersidecar', 'swiggyplus-service', 'swiggyplus-service-canary', 'swiss-armstrong-confluent', 'swiss-armstrong-preprod', 'swiss-klaxon', 'swiss-klaxon-preprod', 'taco-invoicing', 'telephony', 'telephony-order-service', 'telephony-service', 'telephony-vendor-service', 'themis-grpc', 'ticket-inventory-service', 'ticket-inventory-service-crm', 'ticket-reservation', 'ticket-reservation-canary', 'ticket-service', 'ticketing-service', 'tms-aggregator', 'tms-temp-meta-data-service', 'track-movement', 'track-movement-consumer', 'trickster', 'trip-app-gateway', 'trip-manager-consumers', 'trip-meta', 'trip-monitoring', 'unboxing-service', 'unboxing-web', 'uoms-consumer', 'upi', 'user-context-service', 'vendor-config', 'vendor-dashboard', 'vendor-insights', 'vendor-item-service', 'vendorstresscache', 'vhc-composer', 'vhc-service', 'vidura-runtime-ads', 'vidura-runtime-assignment', 'vidura-runtime-assignment-con-1', 'vidura-runtime-dash', 'vidura-runtime-dash-con-1', 'vidura-runtime-delivery-batch', 'vidura-runtime-delivery-batch-con-1', 'vidura-runtime-delivery-eta', 'vidura-runtime-delivery-eta-con-1', 'vidura-runtime-gen-ai', 'vidura-runtime-gen-ai-canary', 'vidura-runtime-gen-ai-con-2', 'vidura-runtime-listing', 'vidura-runtime-listing-new', 'vidura-runtime-map', 'vidura-runtime-map-con-1', 'vidura-runtime-menu', 'vidura-runtime-perf', 'vidura-runtime-ps-mumbai', 'vidura-runtime-ps-mumbai-con-1', 'vidura-runtime-search', 'vidura-runtime-search-con-1', 'vidura-runtime-tns', 'vidura-runtime-tns-con-1', 'vms-portal', 'voms', 'voms-consumer', 'vvo-placer-service', 'vymo-adapter', 'wallet-dashboard', 'wallet-ops-service', 'wallet-service', 'widget-manager', 'workflow-manager', 'xp-server', 'yack-cbcc-cpv', 'yack-cbcc-dre', 'yack-tns', 'zflow-lineage', 'zone-entity-service']
    }

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setPods([
            "ads",
            "analytics",
            "anm",
            "checkout",
            "clm",
            "cms",
            "comms-platform",
            "crm",
            "dash-erp",
            "dash-sf",
            "data-platform",
            "dataplatform",
            "de-experience-team",
            "del-platform",
            "delivery",
            "delivery-capacity",
            "devops",
            "dinersone",
            "dlm",
            "driver-payout",
            "ff",
            "finance",
            "fulfillment",
            "genie",
            "growth",
            "growthx",
            "im-scm-inwarding",
            "infra",
            "insanelygood",
            "intelligence-platform",
            "default",
            "loyalty",
            "maxx",
            "ni-catalog",
            "partner-experience",
            "payment",
            "payout",
            "portal",
            "pricing",
            "pricingtech",
            "promotion",
            "promotion-bl",
            "rock",
            "rock-loki-tracing",
            "runtime",
            "sand",
            "search",
            "seceng",
            "serviceability",
            "sf-foundations",
            "shuttle",
            "sos",
            "test-multitanent",
            "tna",
            "ugc",
            "upgrade-loki-test",
            "vendor",
            "visual-merch"
        ])
        //setServices([]);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // time range selection helpers

  const predefinedTimeRanges = [
    { label: 'Last 1 Hour', value: 1 },
    { label: 'Last 3 Hours', value: 3 },
    { label: 'Last 6 Hours', value: 6 },
    { label: 'Last 12 Hours', value: 12 },
    { label: 'Last 24 Hours', value: 24 },
  ];

  const handlePredefinedTimeRange = (value) => {
    const endTime = dayjs();
    const startTime = endTime.subtract(value, 'hours');
    form.setFieldsValue({ time_range: [startTime, endTime] });
  };  

  // Add debounce to search input
  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []  // Empty array ensures debounce function is not recreated on every render
  );

  const startSummary = () => {
    setSummarizerLoading(true);
    if (logs.length === 0) {
      openNotification('error', 'No logs to summarize', 'Please fetch logs first');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }
    openNotification('success', 'Under Construction 🛠️', 'LLM RAG based summary is being implemented actively. Check back later');
    setSummarizerLoading(false);
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  const onValueChange = (value) => {
    console.log("pod changed: ", value);
    if (value in service_pod_mapping){
        setServices(service_pod_mapping[value]);
    } else {
        setServices([]);
        openNotification('error', 'No services for this pod', 'Please select any other pod');
    }
    }
    

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        (log.toLowerCase().includes(showOnly)) &&
        (!searchTerm || log.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs, showOnly, searchTerm]);  // Dependency array ensures recomputation only when needed
    

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const reqBody = {
        pod: values.pod_name,
        service_name: values.service_name,
        start_time: dayjs(values.time_range[0]).format('DD-MM-YYYY HH:mm:ss'),
        end_time: dayjs(values.time_range[1]).format('DD-MM-YYYY HH:mm:ss'),
        //reduction_rate: values.reduction_rate,
        reduction_rate: reductionRate,
      };

      console.log('Request Body:', reqBody);

      const backendUrl = import.meta.env.VITE_API_URL;

      const response = await axios.post(backendUrl, reqBody)

      console.log('Response:', response.data);

      const myReducedLogs = [];
      response.data.reduced_logs.forEach((log) => {
        const logObj = log.replace(/["']/g, '');
        myReducedLogs.push(logObj);
      });

      setLogs(myReducedLogs);
      setRawLogsLen(response.data.original_len);
      setReducedLogsLen(response.data.reduced_len);

      // Inform users if raw logs is capped at 5000
      if (response.data.original_len == 5000) {
        openNotification('warning', 'Logs Capped', 'The raw logs have been capped at 5000 from start time.');
      }

      // Construct Grafana URL
      const constructedGrafanaUrl = constructGrafanaUrl(
        values.time_range, 
        values.pod_name, 
        values.service_name
      );
      setGrafanaUrl(constructedGrafanaUrl);  // Set the Grafana URL in state

      openNotification('success', 'Logs Reduced Successfully', 'The logs have been successfully reduced and displayed.');
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      openNotification('error', 'Error Fetching Logs', 'There was an issue fetching the logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const constructGrafanaUrl = (time_range, pod, service) => {
    const from = dayjs(time_range[0]).valueOf(); // Milliseconds since epoch
    const to = dayjs(time_range[1]).valueOf();
    const constructedGrafanaUrl = `https://logman.swiggyops.de/d/mkqRUh-Mk/service-logs?orgId=1&var-Pod=${pod}&var-service=${service}&var-search=&var-AND=&from=${from}&to=${to}&viewPanel=2`;
    return constructedGrafanaUrl;
  }

  // Function to handle the download
  const handleDownload = () => {

    if (logs.length === 0) {
      openNotification('error', 'No logs to download', 'Please fetch logs first');
      return;
    }

    // Create a Blob with the logs data
    const blob = new Blob([logs], { type: "text/plain" });
    // Create a link element and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = pod_name + "_" + service_name + "_logrctx_logs.log";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Free up the URL resource
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card
        title="Log Reducer"
        style={{
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%', 
        }}
        bordered={true}
      >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          pod_name: '',
          service_name: '',
          reduction_rate: 15,
        }}
        style={{ maxWidth: '800px', margin: 'auto' }}
      >
        {/* Selector space */}
        <Space size="middle" style={{ display: 'flex' }}>

          {/*Pod select*/}
          <Form.Item
            label="Pod"
            name="pod_name"
            rules={[{ required: true, message: 'Please select the Pod Name!' }]}
            style={{ flex: 1 , minWidth: '150px'}}
          >
            <Select
              placeholder="Select Pod"
              className="custom-select"
              onChange={onValueChange}
              showSearch  // Add showSearch prop to enable search functionality
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }  // Add filterOption prop to customize search behavior
            >
              {pods.map((pod) => (
                <Option key={pod} value={pod}>
                  {pod}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/*Service name select*/}
          <Form.Item
            label="Service Name"
            name="service_name"
            rules={[{ required: true, message: 'Please select the Service Name!' }]}
            style={{ flex: 1, minWidth: '200px'}}
          >
            <Select 
              placeholder="Select Service" 
              className="custom-select"
              showSearch  // Add showSearch prop to enable search functionality
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }  // Add filterOption prop to customize search behavior
            >
              {services.map((service) => (
                <Option key={service} value={service}>
                  {service}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/*Time Range select*/}
          <Form.Item
          label="Time Range"
          name="time_range"
          rules={[{ required: true, message: 'Please select the time range!' }]}
          >
          <DatePicker.RangePicker
            showTime
            format="DD-MM HH:mm"
            style={{ width: '100%' }}
            className="custom-date-picker"
          />
          </Form.Item>

        </Space>

        {/* More Options Collapse */}
        <Collapse style={{ marginTop: '20px', marginBottom: '25px' }}>
            <Collapse.Panel header="More Options" key="1">

              {/* Reduction Rate Input */}
              <Form.Item
                label="Reduction Rate (%)"
                name="reduction_rate"
                rules={[{ required: true, type: 'number', min: 5, max: 95, message: 'Please enter a valid reduction rate between 5 and 95!' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="reduction rate"
                  style={{ width: '100%' }}
                  value={reductionRate}
                  onChange={(value) => setReductionRate(value)}
                />
              </Form.Item>

              {/* Add Predefined Time Range Buttons */}
              <Form.Item label="Quick Time Range Selection">
                <Button.Group>
                  {predefinedTimeRanges.map(({ label, value }) => (
                    <Button key={value} onClick={() => handlePredefinedTimeRange(value)}>
                      {label}
                    </Button>
                  ))}
                </Button.Group>
              </Form.Item>
            </Collapse.Panel>
          </Collapse>

        <Space size="middle" style={{ display: 'flex' }}>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<AlignCenterOutlined />}
              loading={loading}
              block
              className="fetch-logs-btn"
            >
              {loading ? <Spin /> : 'Reduce Logs'}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={startSummary}
              icon={<AliwangwangOutlined />}
              loading={summarizerLoading}
              block
              className="fetch-logs-btn"
            >
              {loading ? <Spin /> : 'Summarize'}
            </Button>
          </Form.Item>
        </Space>
      </Form>
      </Card>


      <Card
        title="Result"
        style={{
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%', 
        }}
        bordered={true}
        actions={[
          <span key="original">Original Logs: {rawLogsLen}</span>,
          <span key="reduced">Reduced Logs: {reducedLogsLen}</span>,
          <span key="reduced">Reduction Rate: { Math.round((((reducedLogsLen / rawLogsLen) * 100) + Number.EPSILON) * 100) / 100 } %</span>,
          <a href={grafanaUrl} target="_blank" rel="noopener noreferrer">
            <span key="grafana">View Raw Logs</span>
          </a>
        ]}
      >
        <Form.Item 
          label="Search Logs"
          style={{ position: 'absolute', top: '10px', right: '50px' }}
          >
          <Input 
            placeholder="Search logs..." 
            onChange={(e) => handleSearch(e.target.value)} 
          />
        </Form.Item>

        <Button
        type="primary"
        icon={<DownloadOutlined />}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
        onClick={handleDownload}
        />

        <Space size="middle" style={{ display: 'flex', marginBottom: '20px' }}>
          <Radio.Group value={showOnly} onChange={(e) => setShowOnly(e.target.value)}>
            <Radio.Button 
              value="" 
              style={{ 
                backgroundColor: showOnly === '' ? '#1890ff' : '', 
                color: showOnly === '' ? '#fff' : '' 
              }}
            >
              all
            </Radio.Button>
            <Radio.Button 
              value="info" 
              style={{ 
                backgroundColor: showOnly === 'info' ? '#1890ff' : '', 
                color: showOnly === 'info' ? '#fff' : '' 
              }}
            >
              info
            </Radio.Button>
            <Radio.Button 
              value="warn" 
              style={{ 
                backgroundColor: showOnly === 'warn' ? '#faad14' : '', 
                color: showOnly === 'warn' ? '#fff' : '' 
              }}
            >
              warn
            </Radio.Button>
            <Radio.Button 
              value="error" 
              style={{ 
                backgroundColor: showOnly === 'error' ? '#ff4d4f' : '', 
                color: showOnly === 'error' ? '#fff' : '' 
              }}
            >
              error
            </Radio.Button>
          </Radio.Group>
          <Radio.Group>
            <Radio.Button 
                value="" 
                style={{ 
                  backgroundColor: wrapLines ? '#1890ff' : '', 
                  color: wrapLines ? '#fff' : '' 
                }}
                onClick={() => setWrapLines(!wrapLines) }
              >
                wrap
            </Radio.Button>
          </Radio.Group>


        </Space>
        <SyntaxHighlighter 
          language="json" 
          style={dracula} 
          showLineNumbers
          wrapLines={wrapLines}
          lineProps={{style: {whiteSpace: 'pre-wrap'}}}
          codeTagProps={{style: {fontSize: '12px'}}}  // Adjust the font size here
        >
          {filteredLogs.length 
            ? filteredLogs.map((log) => 
                JSON.stringify(log.replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, ''), null, 2)
              ).join('\n') 
            : 'No logs found :)'
          }
        </SyntaxHighlighter>


      </Card>
    </div>
  );
};

export default LogReducer;
