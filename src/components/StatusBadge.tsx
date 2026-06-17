import type { OrderStatus } from '../../shared/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: '待制作',
    className: 'bg-amber-100 text-amber-700',
  },
  preparing: {
    label: '制作中',
    className: 'bg-blue-100 text-blue-700',
  },
  delivering: {
    label: '配送中',
    className: 'bg-purple-100 text-purple-700',
  },
  delivered: {
    label: '已送达',
    className: 'bg-sage-100 text-sage-700',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-cocoa-100 text-cocoa-500',
  },
};

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
