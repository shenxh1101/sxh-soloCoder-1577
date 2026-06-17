import type { Flower, Template, Customer, Order } from '../../shared/types';

export const seedFlowers: Flower[] = [
  { id: 1, name: '红玫瑰', unit: '枝', cost_price: 3.5, warning_threshold: 30, stock: 120 },
  { id: 2, name: '粉玫瑰', unit: '枝', cost_price: 3.8, warning_threshold: 30, stock: 95 },
  { id: 3, name: '白百合', unit: '枝', cost_price: 8.0, warning_threshold: 20, stock: 45 },
  { id: 4, name: '粉百合', unit: '枝', cost_price: 8.5, warning_threshold: 20, stock: 38 },
  { id: 5, name: '满天星', unit: '扎', cost_price: 5.0, warning_threshold: 15, stock: 28 },
  { id: 6, name: '尤加利叶', unit: '扎', cost_price: 6.0, warning_threshold: 10, stock: 12 },
  { id: 7, name: '康乃馨', unit: '枝', cost_price: 2.5, warning_threshold: 40, stock: 80 },
  { id: 8, name: '向日葵', unit: '枝', cost_price: 5.0, warning_threshold: 25, stock: 30 },
  { id: 9, name: '洋桔梗', unit: '枝', cost_price: 4.5, warning_threshold: 20, stock: 18 },
  { id: 10, name: '绣球花', unit: '枝', cost_price: 12.0, warning_threshold: 10, stock: 8 },
];

export const seedTemplates: Template[] = [
  {
    id: 1,
    name: '经典红玫瑰束',
    category: 'rose',
    description: '11枝红玫瑰搭配满天星和尤加利叶，经典浪漫之选',
    base_price: 128,
    image_url: '',
    flowers: [
      { flower_id: 1, quantity: 11 },
      { flower_id: 5, quantity: 1 },
      { flower_id: 6, quantity: 1 },
    ],
  },
  {
    id: 2,
    name: '粉色梦幻',
    category: 'rose',
    description: '11枝粉玫瑰配满天星，温柔甜美',
    base_price: 138,
    image_url: '',
    flowers: [
      { flower_id: 2, quantity: 11 },
      { flower_id: 5, quantity: 1 },
    ],
  },
  {
    id: 3,
    name: '99朵玫瑰',
    category: 'rose',
    description: '99枝红玫瑰，满满的爱意',
    base_price: 888,
    image_url: '',
    flowers: [
      { flower_id: 1, quantity: 99 },
      { flower_id: 6, quantity: 3 },
    ],
  },
  {
    id: 4,
    name: '白色香水百合',
    category: 'lily',
    description: '6枝白百合配草，清香高雅',
    base_price: 158,
    image_url: '',
    flowers: [
      { flower_id: 3, quantity: 6 },
      { flower_id: 6, quantity: 1 },
    ],
  },
  {
    id: 5,
    name: '百合混搭',
    category: 'lily',
    description: '3枝白百合+3枝粉百合，双色搭配',
    base_price: 168,
    image_url: '',
    flowers: [
      { flower_id: 3, quantity: 3 },
      { flower_id: 4, quantity: 3 },
      { flower_id: 5, quantity: 1 },
    ],
  },
  {
    id: 6,
    name: '向日葵混搭',
    category: 'mixed',
    description: '5枝向日葵配玫瑰和配草，阳光活力',
    base_price: 98,
    image_url: '',
    flowers: [
      { flower_id: 8, quantity: 5 },
      { flower_id: 1, quantity: 3 },
      { flower_id: 6, quantity: 1 },
    ],
  },
  {
    id: 7,
    name: '康乃馨温馨',
    category: 'mixed',
    description: '19枝康乃馨加2枝百合，送给妈妈的爱',
    base_price: 118,
    image_url: '',
    flowers: [
      { flower_id: 7, quantity: 19 },
      { flower_id: 3, quantity: 2 },
    ],
  },
  {
    id: 8,
    name: '缤纷花束',
    category: 'mixed',
    description: '多种花材混搭，色彩缤纷',
    base_price: 198,
    image_url: '',
    flowers: [
      { flower_id: 1, quantity: 5 },
      { flower_id: 2, quantity: 5 },
      { flower_id: 8, quantity: 3 },
      { flower_id: 5, quantity: 1 },
      { flower_id: 6, quantity: 1 },
    ],
  },
];

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString();

const d1 = new Date(today);
d1.setHours(9, 0, 0, 0);
const d2 = new Date(today);
d2.setHours(14, 0, 0, 0);
const d3 = new Date(today);
d3.setDate(today.getDate() + 1);
d3.setHours(10, 30, 0, 0);
const d4 = new Date(today);
d4.setDate(today.getDate() - 3);
const d5 = new Date(today);
d5.setDate(today.getDate() - 7);
const d6 = new Date(today);
d6.setDate(today.getDate() - 14);

export const seedCustomers: Customer[] = [
  {
    id: 1,
    name: '张小姐',
    phone: '13800138001',
    preferences: '喜欢粉色系，爱加满天星',
    created_at: formatDateTime(d6),
  },
  {
    id: 2,
    name: '李先生',
    phone: '13900139002',
    preferences: '每次加一盒巧克力，预算充足',
    created_at: formatDateTime(d5),
  },
  {
    id: 3,
    name: '王女士',
    phone: '13700137003',
    preferences: '偏爱百合花，素雅风格',
    created_at: formatDateTime(d4),
  },
  {
    id: 4,
    name: '陈先生',
    phone: '13600136004',
    preferences: '送女朋友，喜欢红色系',
    created_at: formatDateTime(d6),
  },
];

export const seedOrders: Order[] = [
  {
    id: 1,
    customer_id: 1,
    customer_name: '张小姐',
    customer_phone: '13800138001',
    items: [
      { template_id: 2, template_name: '粉色梦幻', quantity: 1, unit_price: 138 },
    ],
    total_price: 138,
    status: 'delivering',
    delivery_date: formatDate(today),
    delivery_time: '09:00',
    delivery_address: '朝阳区建国路88号SOHO现代城A座1203',
    notes: [],
    created_at: formatDateTime(d4),
  },
  {
    id: 2,
    customer_id: 2,
    customer_name: '李先生',
    customer_phone: '13900139002',
    items: [
      { template_id: 1, template_name: '经典红玫瑰束', quantity: 2, unit_price: 128 },
    ],
    total_price: 256,
    status: 'preparing',
    delivery_date: formatDate(today),
    delivery_time: '14:00',
    delivery_address: '海淀区中关村大街1号海龙大厦15层',
    notes: [
      { id: 1, content: '加一盒巧克力', created_at: formatDateTime(d4) },
    ],
    created_at: formatDateTime(d4),
  },
  {
    id: 3,
    customer_id: 3,
    customer_name: '王女士',
    customer_phone: '13700137003',
    items: [
      { template_id: 4, template_name: '白色香水百合', quantity: 1, unit_price: 158 },
    ],
    total_price: 158,
    status: 'pending',
    delivery_date: formatDate(d3),
    delivery_time: '10:30',
    delivery_address: '西城区金融街27号投资广场B座801',
    notes: [],
    created_at: formatDateTime(d3),
  },
  {
    id: 4,
    customer_id: 4,
    customer_name: '陈先生',
    customer_phone: '13600136004',
    items: [
      { template_id: 3, template_name: '99朵玫瑰', quantity: 1, unit_price: 888 },
    ],
    total_price: 888,
    status: 'delivered',
    delivery_date: formatDate(d5),
    delivery_time: '18:00',
    delivery_address: '东城区王府井大街138号新东安市场',
    notes: [
      { id: 2, content: '客户说花很新鲜，非常满意', created_at: formatDateTime(d5) },
      { id: 3, content: '门口保安代收', created_at: formatDateTime(d5) },
    ],
    created_at: formatDateTime(d5),
  },
  {
    id: 5,
    customer_id: 1,
    customer_name: '张小姐',
    customer_phone: '13800138001',
    items: [
      { template_id: 7, template_name: '康乃馨温馨', quantity: 1, unit_price: 118 },
    ],
    total_price: 118,
    status: 'delivered',
    delivery_date: formatDate(d6),
    delivery_time: '10:00',
    delivery_address: '朝阳区建国路88号SOHO现代城A座1203',
    notes: [
      { id: 4, content: '送给妈妈的生日花，阿姨很喜欢', created_at: formatDateTime(d6) },
    ],
    created_at: formatDateTime(d6),
  },
  {
    id: 6,
    customer_id: 3,
    customer_name: '王女士',
    customer_phone: '13700137003',
    items: [
      { template_id: 5, template_name: '百合混搭', quantity: 1, unit_price: 168 },
    ],
    total_price: 168,
    status: 'delivered',
    delivery_date: formatDate(d6),
    delivery_time: '15:00',
    delivery_address: '西城区金融街27号投资广场B座801',
    notes: [],
    created_at: formatDateTime(d6),
  },
];
