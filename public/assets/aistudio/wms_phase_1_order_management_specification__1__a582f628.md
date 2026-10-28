# Warehouse Management System (WMS) - Phase 1: Order Management Specification

## 1. Overview
This document outlines the functional and technical specifications for **Phase 1** of the Warehouse Management System (WMS) application, structured for rapid development and prototyping within Google AI Studio. The primary focus of this phase is **Order Management and Inventory Replenishment Calculation**.

## 2. Core Business Logic & Formula
The system evaluates inventory health against preset operational thresholds to automatically calculate material shortages and generate supplier order requirements.

The core calculation formula is defined as:
$$\text{Net Deficit Quantity} = \text{Minimum Required Stock} - \text{Stock Balance} - \text{Extra PO Stock}$$

- **Condition (Deficit $> 0$):** Quantity is not sufficient. The system flags the item and calculates the exact amount required to order from the supplier.
- **Condition (Deficit $\le 0$):** Stock levels are sufficient. No order action is triggered.

## 3. Preset Configuration
- **Minimum Required Stock:** A baseline threshold preset in the system for each SKU or inventory item, representing the minimum safety level required to support operations without stockouts.

## 4. User Interface & Data Ingestion Icons
The application dashboard features two distinct interactive upload modules (represented by dedicated icons/buttons) to ingest dynamic operational data:
1. **Stock Balance Upload Icon:** Facilitates the upload and parsing of current physical inventory count data (e.g., CSV or Excel format).
2. **Extra PO Stock Upload Icon:** Facilitates the upload and parsing of active purchase orders (PO) that have been placed but not yet received, acting as incoming buffer stock.

## 5. Output & Supplier Reorder Management
- **Shortage Report / Dashboard View:** A dynamic table displaying:
  - SKU / Item Description
  - Preset Minimum Required Stock
  - Current Stock Balance
  - Extra PO Stock
  - Calculated Deficit Qty (`Qty Not Sufficient`)
- **Supplier Action Module:** Aggregates items with a positive deficit value and provides an interface to generate supplier purchase orders or export reorder lists.

## 6. Google AI Studio Implementation Instructions
When utilizing this specification in Google AI Studio to generate your application code, ensure the model builds:
- A responsive layout with file upload handlers for the two data sources.
- A live reactive calculation engine applying the shortage formula.
- A filtered view showing only items requiring supplier reorders.