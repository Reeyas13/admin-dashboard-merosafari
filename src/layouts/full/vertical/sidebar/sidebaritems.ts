import { uniqueId } from 'lodash';

const SidebarContent = [
  // ==================== DASHBOARD ====================
  {
    heading: 'Dashboard',
    children: [
      {
        name: 'Modern Dashboard',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: '/admin',
        isPro: false,
      },
    ],
  },

  // ==================== LOCATION & PRICING ====================
  {
    heading: 'Location & Pricing',
    children: [
      {
        name: 'Service Boundaries',
        icon: 'solar:map-point-wave-linear',
        id: uniqueId(),
        url: '/map',
        isPro: false,
      },
      {
        name: 'Zone Management',
        icon: 'solar:map-arrow-square-linear',
        id: uniqueId(),
        url: '/zones',
        isPro: false,
      },
      {
        name: 'Vehicle Management',
        icon: 'solar:bus-linear',
        id: uniqueId(),
        url: '/vehicle-management',
        isPro: false,
      },
      {
        name: 'Pricing Management',
        icon: 'solar:dollar-minimalistic-linear',
        id: uniqueId(),
        url: '/pricing',
        isPro: false,
      },
      {
        name: 'Driver Incentives',
        icon: 'solar:medal-star-linear',
        id: uniqueId(),
        url: '/incentives',
        isPro: false,
      },
    ],
  },

  // ==================== DRIVER MANAGEMENT ====================
  {
    heading: 'Driver Management',
    children: [
      {
        name: 'Driver List',
        icon: 'solar:users-group-two-rounded-linear',
        id: uniqueId(),
        url: '/drivers',
        isPro: false,
      },
      {
        name: 'Document Verification',
        icon: 'solar:document-add-linear',
        id: uniqueId(),
        url: '/driver-verification',
        isPro: false,
        badge: 'pending',
      },
        {
      name: 'Users',
      icon: 'solar:user-linear',
      id: uniqueId(),
      url: '/users',
      isPro: false,
    },
    ],
  },

  // ==================== VEHICLE TYPES ====================
  {
    heading: 'Fleet Configuration',
    children: [
      {
        name: 'Vehicle Types',
        icon: 'solar:transmission-linear',
        id: uniqueId(),
        url: '/vehicle-type',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Rides',
    children: [
      {
        name: 'Rides',
        icon: 'solar:routing-2-linear',
        id: uniqueId(),
        url: '/rides',
        isPro: false,
      },
    ],
  },

  // ==================== 3RD PARTY CONFIG ====================
  {
    heading: 'System Configuration',
    children: [
      {
        name: 'Email Configuration',
        icon: 'solar:letter-linear',
        id: uniqueId(),
        url: '/email-config',
        isPro: false,
      },
      {
        name: 'SMS Configuration',
        icon: 'solar:chat-round-line-linear',
        id: uniqueId(),
        url: '/sms-config',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;
