export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  duration: string;
  pricePaise: number;
  featured: boolean;
  updated: string;
  modules: CourseModule[];
  outcomes: string[];
  audience: string[];
  sample: true;
}

export const SAMPLE_CONTENT_NOTE =
  'Sample course content for review. Titles, lessons, prices, and durations are placeholders and will be replaced before launch.';

export const courses: Course[] = [
  {
    slug: 'servicenow-itsm-fundamentals',
    title: 'ServiceNow ITSM Fundamentals',
    summary:
      'Learn Incident, Problem, Change, and Knowledge Management through the daily work of a ServiceNow administrator.',
    description:
      'A practical foundation for the IT Service Management application. Start with platform navigation, then follow a ticket from report to resolution through the core ITSM modules.',
    level: 'Beginner',
    duration: '6h 20m',
    pricePaise: 199900,
    featured: true,
    updated: '2026-11-01',
    modules: [
      {
        title: 'Getting started',
        lessons: ['Platform tour', 'Navigation and lists', 'Users, groups, and roles'],
      },
      {
        title: 'Incident Management',
        lessons: [
          'Incident lifecycle',
          'Assignment and routing',
          'Service level agreements',
          'Notifications',
          'Practice lab',
        ],
      },
      {
        title: 'Problem Management',
        lessons: ['Problem lifecycle', 'Root cause analysis', 'Known errors', 'Practice lab'],
      },
      {
        title: 'Change Management',
        lessons: [
          'Change types',
          'Change models',
          'Approvals and cab',
          'Risk and scheduling',
          'Practice lab',
        ],
      },
      {
        title: 'Knowledge Management',
        lessons: ['Knowledge articles', 'Review and publish', 'Feedback and reuse'],
      },
      {
        title: 'Wrap-up',
        lessons: ['Reporting basics', 'Dashboards', 'Next steps', 'Final exercise'],
      },
    ],
    outcomes: [
      'Navigate lists, forms, and filters with confidence.',
      'Explain the Incident, Problem, and Change lifecycles.',
      'Configure a basic assignment and notification flow.',
      'Use service level agreements and approvals.',
      'Create and publish a knowledge article.',
    ],
    audience: [
      'New ServiceNow administrators',
      'Service desk analysts who want deeper platform knowledge',
      'ITIL practitioners moving to the ServiceNow platform',
    ],
    sample: true,
  },
  {
    slug: 'servicenow-itom-discovery',
    title: 'ServiceNow ITOM Discovery',
    summary:
      'Understand discovery patterns, mid servers, credentials, and the path from a network scan to a useful CMDB record.',
    description:
      'A guided introduction to ITOM Discovery. Follow the discovery flow from scheduling to identification, then review the records it creates and the errors that stop it.',
    level: 'Intermediate',
    duration: '5h 10m',
    pricePaise: 249900,
    featured: true,
    updated: '2026-11-01',
    modules: [
      {
        title: 'Discovery foundations',
        lessons: ['Why discovery exists', 'Discovery architecture', 'Mid server basics'],
      },
      {
        title: 'Configure discovery',
        lessons: [
          'Credentials',
          'IP ranges and schedules',
          'Discovery patterns',
          'Classification and identification',
        ],
      },
      {
        title: 'Review results',
        lessons: ['Discovery log', 'Device records', 'CI relationships', 'Troubleshooting'],
      },
    ],
    outcomes: [
      'Describe the role of the mid server.',
      'Create a basic discovery schedule.',
      'Read a discovery log and identify common failures.',
      'Explain how discovered devices become configuration items.',
    ],
    audience: [
      'Administrators responsible for CMDB data quality',
      'Infrastructure engineers who support discovery',
      'ITOM practitioners preparing for deeper automation work',
    ],
    sample: true,
  },
  {
    slug: 'servicenow-cmdb-and-ire',
    title: 'ServiceNow CMDB and IRE',
    summary:
      'Build a reliable configuration management database with class models, identification rules, and the Identification and Reconciliation Engine.',
    description:
      'Learn how the CMDB stays consistent when data arrives from discovery, imports, and manual entry. Focus on the data model, identification, reconciliation, and health checks.',
    level: 'Intermediate',
    duration: '4h 45m',
    pricePaise: 249900,
    featured: true,
    updated: '2026-11-01',
    modules: [
      {
        title: 'CMDB model',
        lessons: ['Classes and tables', 'CI relationships', 'Health and compliance'],
      },
      {
        title: 'Identification and Reconciliation',
        lessons: [
          'Identification rules',
          'Reconciliation rules',
          'Data source precedence',
          'IRE processing',
        ],
      },
      {
        title: 'Data quality',
        lessons: ['Duplicate handling', 'Audits', 'Dashboards', 'Governance checklist'],
      },
    ],
    outcomes: [
      'Explain the CMDB class hierarchy.',
      'Write an identification rule for a simple CI class.',
      'Describe how IRE selects the authoritative record.',
      'Use CMDB health tools to find data problems.',
    ],
    audience: [
      'CMDB administrators and data owners',
      'Discovery and service mapping teams',
      'Architects who depend on reliable CI data',
    ],
    sample: true,
  },
  {
    slug: 'servicenow-event-management',
    title: 'ServiceNow Event Management',
    summary:
      'Connect monitoring tools to ServiceNow, reduce alert noise, and turn the alerts that matter into actionable incidents.',
    description:
      'A practical introduction to event ingestion, alert rules, correlation, and the hand-off from monitoring to incident response.',
    level: 'Intermediate',
    duration: '3h 50m',
    pricePaise: 219900,
    featured: false,
    updated: '2026-11-01',
    modules: [
      {
        title: 'Event flow',
        lessons: ['Event sources', 'Connectors', 'Event records', 'Alert lifecycle'],
      },
      {
        title: 'Reduce noise',
        lessons: ['Alert rules', 'Correlation', 'Maintenance windows', 'Impact calculation'],
      },
      {
        title: 'Operate',
        lessons: ['Incident creation', 'Dashboards', 'Troubleshooting', 'Practice lab'],
      },
    ],
    outcomes: [
      'Describe the event ingestion path.',
      'Create a basic alert rule.',
      'Explain how correlation reduces alert volume.',
      'Connect an alert to an incident workflow.',
    ],
    audience: [
      'Operations teams that use ServiceNow ITOM',
      'Monitoring engineers',
      'Incident managers who want fewer duplicate alerts',
    ],
    sample: true,
  },
  {
    slug: 'servicenow-hrsd',
    title: 'ServiceNow HRSD',
    summary:
      'Model employee service requests with HR services, case management, and knowledge content.',
    description:
      'An introduction to Human Resources Service Delivery. Learn how HR services, cases, and knowledge fit together without turning the platform into a generic ticketing tool.',
    level: 'Beginner',
    duration: '4h 05m',
    pricePaise: 199900,
    featured: false,
    updated: '2026-11-01',
    modules: [
      {
        title: 'HRSD foundations',
        lessons: ['HR service delivery model', 'HR services', 'Employee center'],
      },
      {
        title: 'Case management',
        lessons: ['Case lifecycle', 'Assignment', 'Confidentiality', 'SLA basics'],
      },
      {
        title: 'Knowledge and improvement',
        lessons: ['HR knowledge', 'Employee feedback', 'Reporting', 'Practice lab'],
      },
    ],
    outcomes: [
      'Create an HR service and catalog item.',
      'Explain the HR case lifecycle.',
      'Apply confidentiality controls.',
      'Publish employee-facing knowledge content.',
    ],
    audience: [
      'HR operations teams',
      'ServiceNow administrators supporting HR',
      'Case managers moving to HRSD',
    ],
    sample: true,
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
