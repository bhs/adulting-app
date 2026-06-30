import React from 'react';
import BudgetDashboard from '@/components/BudgetDashboard';

export const metadata = {
  title: 'Budget Dashboard | Adulting App',
  description: 'Track your income and expenses in real-time with our interactive budget calculator',
};

export default function BudgetPage() {
  return <BudgetDashboard />;
}
