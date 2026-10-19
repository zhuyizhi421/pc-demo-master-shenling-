import { type autoTable, type Table } from "jspdf-autotable"
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: Table
    autoTable: autoTable
  }
}
