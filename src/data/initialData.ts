import { SKUItem } from '../types';

export const INITIAL_SKUS: SKUItem[] = [
  {
    id: '1',
    sku: 'SKU-ELE-001',
    name: 'Lithium-Ion Battery Pack 12V',
    category: 'Electronics',
    unit: 'pcs',
    unitCost: 45.50,
    minRequiredStock: 500,
    stockBalance: 300,
    extraPoStock: 100,
    supplier: 'Apex Energy Corp',
    leadTimeDays: 7,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    sku: 'SKU-ELE-002',
    name: 'Microcontroller Board v3',
    category: 'Electronics',
    unit: 'pcs',
    unitCost: 18.25,
    minRequiredStock: 1200,
    stockBalance: 1500,
    extraPoStock: 200,
    supplier: 'Global Tech Supply',
    leadTimeDays: 5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    sku: 'SKU-PKG-101',
    name: 'Heavy Duty Corrugated Box (L)',
    category: 'Packaging',
    unit: 'bundles',
    unitCost: 3.80,
    minRequiredStock: 250,
    stockBalance: 80,
    extraPoStock: 50,
    supplier: 'Prime Packaging Co.',
    leadTimeDays: 3,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    sku: 'SKU-RAW-201',
    name: 'Aluminum Extrusion Bar 2m',
    category: 'Raw Materials',
    unit: 'bars',
    unitCost: 24.00,
    minRequiredStock: 600,
    stockBalance: 600,
    extraPoStock: 0,
    supplier: 'Delta Industrial Metals',
    leadTimeDays: 14,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '5',
    sku: 'SKU-APP-301',
    name: 'Industrial Safety Vest (High-Vis)',
    category: 'Safety Apparel',
    unit: 'pcs',
    unitCost: 8.50,
    minRequiredStock: 1000,
    stockBalance: 350,
    extraPoStock: 200,
    supplier: 'SafetyFirst Gear Ltd',
    leadTimeDays: 4,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '6',
    sku: 'SKU-ELE-003',
    name: 'Brushless DC Motor 24V',
    category: 'Electronics',
    unit: 'pcs',
    unitCost: 65.00,
    minRequiredStock: 300,
    stockBalance: 120,
    extraPoStock: 200,
    supplier: 'Apex Energy Corp',
    leadTimeDays: 10,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '7',
    sku: 'SKU-PKG-102',
    name: 'Industrial Stretch Film Roll',
    category: 'Packaging',
    unit: 'rolls',
    unitCost: 12.00,
    minRequiredStock: 800,
    stockBalance: 200,
    extraPoStock: 100,
    supplier: 'Prime Packaging Co.',
    leadTimeDays: 3,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '8',
    sku: 'SKU-RAW-202',
    name: 'Stainless Steel Fastener Kit M6',
    category: 'Raw Materials',
    unit: 'kits',
    unitCost: 14.50,
    minRequiredStock: 150,
    stockBalance: 150,
    extraPoStock: 50,
    supplier: 'Delta Industrial Metals',
    leadTimeDays: 6,
    lastUpdated: new Date().toISOString()
  }
];

export const SAMPLE_STOCK_BALANCE_CSV = `sku,stockBalance
SKU-ELE-001,280
SKU-ELE-002,1450
SKU-PKG-101,65
SKU-RAW-201,580
SKU-APP-301,310
SKU-ELE-003,110
SKU-PKG-102,180
SKU-RAW-202,140`;

export const SAMPLE_EXTRA_PO_CSV = `sku,extraPoStock
SKU-ELE-001,150
SKU-ELE-002,300
SKU-PKG-101,100
SKU-RAW-201,50
SKU-APP-301,250
SKU-ELE-003,250
SKU-PKG-102,150
SKU-RAW-202,75`;
