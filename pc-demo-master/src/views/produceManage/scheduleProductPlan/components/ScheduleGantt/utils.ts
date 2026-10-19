import type { ProductionLine,Task } from './types';

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:MM 格式
 */
export function formatDateTime(date: Date): string {
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${formatDate(date)} ${hours}:${minutes}`;
}

/**
 * 数字补零
 */
export function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * 获取状态文本
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    '待开始': '待开始',
    '进行中': '进行中',
    '已完成': '已完成',
    '延期': '延期',
    '未排产': '未排产',
    '已排产': '已加工',
    '已加工': '已加工',
    '已发布': '已发布',
    '审核中排产': '已发布',
    '生产中': '生产中',
    '正常': '正常',
    '维护': '维护',
    '故障': '故障'
  };
  
  return statusMap[status] || status;
}

/**
 * 根据状态获取颜色类
 */
export function getStatusColor(status: string): string {
  switch(status) {
    case '待开始': return 'bg-blue-500';
    case '进行中': return 'bg-green-500';
    case '已完成': return 'bg-gray-500';
    case '延期': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

/**
 * 根据产线状态获取指示器类
 */
export function getLineStatusClass(status: string): string {
  switch(status) {
    case '正常': return 'normal';
    case '维护': return 'maintenance';
    case '故障': return 'error';
    default: return 'normal';
  }
}

/**
 * 查找任务
 */
export function findTaskById(taskId: string, productionLines: ProductionLine[]): Task | null {
  for (const line of productionLines) {
    const task = line.tasks.find((t:any) => t.id === taskId);
    if (task) {
      return task;
    }
  }
  return null;
}

/**
 * 生成今天的时间轴小时数组
 */
export function generateTimeAxis(): string[] {
  const hours: string[] = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i}:00`);
  }
  return hours;
}

/**
 * 计算任务条在泳道中的位置和宽度百分比（基于小时）
 * @param startTime 任务开始时间
 * @param endTime 任务结束时间
 * @param rangeStart 时间范围开始（用于计算相对位置）
 * @param rangeEnd 时间范围结束（用于计算总小时数）
 */
export function calculateTaskPosition(
  startTime: Date,
  endTime: Date,
  rangeStart?: Date,
  rangeEnd?: Date
): { left: number; width: number } {
  // 如果没有传入时间范围，使用任务时间当天开始和结束
  const start = rangeStart || new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0, 0, 0);
  const end = rangeEnd || new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + 1, 0, 0, 0);

  // 计算时间范围总小时数
  const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  // 计算任务开始时间和结束时间距离时间范围开始的毫秒数
  const startOffsetMs = startTime.getTime() - start.getTime();
  const endOffsetMs = endTime.getTime() - start.getTime();

  // 转换为小时（包含小数部分）
  const startHour = startOffsetMs / (1000 * 60 * 60);
  const endHour = endOffsetMs / (1000 * 60 * 60);

  // 计算持续小时数
  const durationHours = endHour - startHour;

  // 计算百分比位置和宽度
  const left = (startHour / totalHours) * 100;
  const width = (durationHours / totalHours) * 100;

  return {
    left: Math.max(0, left),
    width: Math.max(0.5, width) // 最小宽度 0.5%，确保任务条可见
  };
}