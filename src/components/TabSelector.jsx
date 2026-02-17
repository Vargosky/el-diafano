'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TabSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'todas';

  const tabs = [
    { id: 'todas', label: 'Relevancia' },
    { id: 'top', label: 'Top' },
    { id: 'cobertura', label: 'Cobertura' },  // ✅ NUEVA
    { id: 'recientes', label: 'Recientes' }
  ];

  const handleTabClick = (tabId) => {
    router.push(`/?tab=${tabId}`);
  };

  return (
    <div className="flex gap-4 md:gap-8 mb-6 md:mb-8 border-b border-gray-300 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`pb-3 px-2 text-sm font-semibold whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}