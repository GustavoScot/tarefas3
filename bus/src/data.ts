export type BusLine = {
  id: string;
  code: string;
  origin: string;
  destination: string;
  passengers: number;
  buses: number;
  averageTime: number;
  delay: number;
  occupancy: number;
  revenue: number;
  color: string;
  stops: string[];
};

export const busLines: BusLine[] = [
  {
    id: '1', code: '0.110', origin: 'Rodoviária do Plano Piloto', destination: 'Terminal Asa Sul',
    passengers: 1840, buses: 12, averageTime: 38, delay: 7, occupancy: 78, revenue: 10120,
    color: '#3457D5', stops: ['Rodoviária', 'Setor Comercial Sul', 'W3 Sul', 'Terminal Asa Sul'],
  },
  {
    id: '2', code: '108.3', origin: 'Ceilândia Norte', destination: 'Plano Piloto',
    passengers: 3210, buses: 18, averageTime: 64, delay: 14, occupancy: 92, revenue: 17655,
    color: '#E5484D', stops: ['Ceilândia Norte', 'Guariroba', 'EPNB', 'Rodoviária'],
  },
  {
    id: '3', code: '0.300', origin: 'Terminal Asa Sul', destination: 'L2 Norte',
    passengers: 1465, buses: 10, averageTime: 42, delay: 5, occupancy: 67, revenue: 8058,
    color: '#22A06B', stops: ['Terminal Asa Sul', 'L2 Sul', 'Esplanada', 'UnB', 'L2 Norte'],
  },
  {
    id: '4', code: '205.1', origin: 'Taguatinga Sul', destination: 'Rodoviária',
    passengers: 2780, buses: 16, averageTime: 58, delay: 11, occupancy: 86, revenue: 15290,
    color: '#F79009', stops: ['Taguatinga Sul', 'Águas Claras', 'Guará', 'Rodoviária'],
  },
  {
    id: '5', code: '180.4', origin: 'Samambaia Norte', destination: 'Taguatinga Centro',
    passengers: 1320, buses: 9, averageTime: 35, delay: 4, occupancy: 63, revenue: 7260,
    color: '#8B5CF6', stops: ['Samambaia Norte', 'QN 406', 'Taguaparque', 'Taguatinga Centro'],
  },
  {
    id: '6', code: '604.2', origin: 'Gama Leste', destination: 'Plano Piloto',
    passengers: 2460, buses: 14, averageTime: 72, delay: 9, occupancy: 81, revenue: 13530,
    color: '#2FB6C8', stops: ['Gama Leste', 'Santa Maria', 'Park Way', 'Rodoviária'],
  },
];

export const totalPassengers = busLines.reduce((sum, line) => sum + line.passengers, 0);
export const totalBuses = busLines.reduce((sum, line) => sum + line.buses, 0);
export const totalRevenue = busLines.reduce((sum, line) => sum + line.revenue, 0);
export const averageDelay = Math.round(busLines.reduce((sum, line) => sum + line.delay, 0) / busLines.length);

export const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
