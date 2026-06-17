import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Tag, ChevronRight, Info, DollarSign, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Template } from '../../shared/types';

const categories = [
  { key: 'all', label: '全部', emoji: '🌸' },
  { key: 'rose', label: '玫瑰系列', emoji: '🌹' },
  { key: 'lily', label: '百合系列', emoji: '🌷' },
  { key: 'mixed', label: '混搭系列', emoji: '💐' },
];

export default function TemplatesPage() {
  const { templates, flowers, fetchTemplates, fetchInventory } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (activeCategory === 'all') {
      fetchTemplates();
    } else {
      fetchTemplates(activeCategory);
    }
    fetchInventory();
  }, [activeCategory, fetchTemplates, fetchInventory]);

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-cocoa-800">
            花束模板
          </h1>
          <p className="text-cocoa-500 mt-1">选择合适的花束模板为客户定制</p>
        </div>
        <Link to="/orders/new" className="btn-primary flex items-center gap-2">
          <Flower2 className="w-5 h-5" />
          用模板下单
        </Link>
      </div>

      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeCategory === cat.key
                ? 'bg-primary-400 text-white shadow-soft'
                : 'bg-white text-cocoa-600 hover:bg-cocoa-50 border border-cocoa-100'
            }`}
          >
            <span className="mr-1.5">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((template, index) => (
          <div
            key={template.id}
            className="card-hover p-5 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-sage-100 flex items-center justify-center mb-4 relative overflow-hidden">
              <Flower2 className="w-16 h-16 text-primary-300" />
              <div className="absolute top-3 left-3">
                <span className="badge bg-white/90 text-primary-600 backdrop-blur-sm">
                  {template.category === 'rose' && '🌹 玫瑰系列'}
                  {template.category === 'lily' && '🌷 百合系列'}
                  {template.category === 'mixed' && '💐 混搭系列'}
                </span>
              </div>
            </div>
            <h3 className="font-display font-semibold text-lg text-cocoa-800 mb-1">
              {template.name}
            </h3>
            <p className="text-sm text-cocoa-500 line-clamp-2 mb-3">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-primary-500">
                ¥{template.base_price}
              </span>
              <button className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-0.5">
                查看详情 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-cocoa-800">
                {selectedTemplate.name}
              </h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-cocoa-400 hover:text-cocoa-600"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-sage-100 flex items-center justify-center mb-5">
              <Flower2 className="w-20 h-20 text-primary-300" />
            </div>

            <p className="text-cocoa-600 mb-5">{selectedTemplate.description}</p>

            <div className="bg-cocoa-50 rounded-xl p-4 mb-5">
              <h3 className="font-medium text-cocoa-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-500" />
                花材清单
              </h3>
              <ul className="space-y-2">
                {selectedTemplate.flowers.map((tf) => {
                  const flower = flowers.find(f => f.id === tf.flower_id);
                  return (
                    <li
                      key={tf.flower_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-cocoa-600">
                        {flower?.name || `花材 #${tf.flower_id}`}
                      </span>
                      <span className="font-medium text-cocoa-700">
                        × {tf.quantity} {flower?.unit || ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cocoa-100">
              <div>
                <p className="text-sm text-cocoa-500">模板价格</p>
                <p className="text-2xl font-semibold text-primary-500">
                  ¥{selectedTemplate.base_price}
                </p>
              </div>
              <Link
                to="/orders/new"
                className="btn-primary"
                onClick={() => setSelectedTemplate(null)}
              >
                使用此模板下单
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
