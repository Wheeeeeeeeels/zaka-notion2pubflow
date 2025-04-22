import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ConfigPanel from './ConfigPanel';
import ArticlePanel from './ArticlePanel';

const MainLayout: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Notion 到微信公众号同步工具</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              文章管理
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              配置
            </Tab>
          </Tab.List>
          <Tab.Panels className="flex-1 overflow-auto">
            <Tab.Panel className="h-full">
              <ArticlePanel />
            </Tab.Panel>
            <Tab.Panel className="h-full">
              <ConfigPanel />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </div>
  );
};

export default MainLayout; 