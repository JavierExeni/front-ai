interface MenuOption {
  title: string;
  childrens: MenuItem[];
}

interface MenuItem {
  icon: string;
  name: string;
  route: string;
}

export const menuOptions: MenuOption[] = [
  {
    title: 'Platform',
    childrens: [
      {
        icon: 'fa-regular fa-house',
        name: 'Dashboard',
        route: 'dashboard',
      },
      {
        icon: 'fa-regular fa-address-book',
        name: 'Contacts',
        route: 'contacts',
      },
      {
        icon: 'fa-solid fa-phone',
        name: 'Inbound',
        route: 'inbound',
      },
      {
        icon: 'fa-solid fa-phone-volume',
        name: 'Outbound',
        route: 'outbound/list',
      },
      {
        icon: 'fa-solid fa-chart-simple',
        name: 'Reports',
        route: 'reports',
      },
      {
        icon: 'fa-solid fa-headset',
        name: 'Live Transfer',
        route: 'live-transfer',
      },
      {
        icon: 'fa-solid fa-code-branch',
        name: 'Integrations',
        route: 'integrations',
      },
      {
        icon: 'fa-solid fa-folder-open',
        name: 'Company Context',
        route: 'context',
      },
    ],
  },
  {
    title: 'Agents',
    childrens: [
      {
        icon: 'fa-solid fa-microphone',
        name: 'Voice Agents',
        route: 'voice-agents',
      },
      {
        icon: 'fa-solid fa-envelope',
        name: 'Email Agents',
        route: 'email-agents',
      },
      {
        icon: 'fa-solid fa-message',
        name: 'SMS Agents',
        route: 'sms-agents',
      },
    ],
  },
];
