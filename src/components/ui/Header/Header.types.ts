export interface NavItem {
  label: string;
  page: number;
  isExternal?: boolean;
  href?: string;
}

export const navItems: NavItem[] = [
  { label: "Home", page: 0 },
  { label: "Services", page: 1 },
  { label: "About", page: 2 },
  { label: "Contact", page: 3 },
];
