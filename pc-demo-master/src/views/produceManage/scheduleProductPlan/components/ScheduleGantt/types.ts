// 订单数据类型
export interface Order {
  id: string;
  orderNo: string;
  productName: string;
  quantity: number;
  status: string;
  estimatedHours: number;
}

// 产线数据类型
export interface ProductionLine {
  id: string;
  name: string;
  capacity: number;
  status: string;
  tasks: Task[];
}

// 任务数据类型
export interface Task {
  id: string;
  orderId: string;
  productionLineId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  progress: number;
  orderNo: string;
  productName: string;
  quantity: number;
}

// 任务拖拽信息类型
export interface TaskDragInfo {
  id: string;
  productionLineId: string;
  startTime: number;
  endTime: number;
  duration: number;
}

// 调整大小状态类型
export interface ResizeState {
  task: Task | null;
  direction: 'left' | 'right' | null;
  startX: number;
  startLeft: number;
  startWidth: number;
  originalStartTime: Date | null;
  originalEndTime: Date | null;
}

// 通知类型
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}