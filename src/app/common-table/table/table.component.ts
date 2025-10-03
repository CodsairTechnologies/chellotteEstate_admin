import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { environment } from '../../../environments/environment';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit, OnChanges {
  @Output() objPresentationEvent = new EventEmitter()

  @Input() arrList = []
  @Input() arrColumns = []
  @Input() blnNoEdit: boolean = false
  @Input() blnHasActions: boolean | undefined
  @Input() blnHasSingleview: boolean = false;
  @Input() blnHasDown: Boolean = false;
  @Input() blnForDelete: boolean = false;



displayImageModal: boolean = false;
selectedImageUrl: string = '';



  first = 0;
  rows = 10;

  totalRecords: number | undefined;


  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.arrList);
    console.log(this.arrColumns);
    console.log(this.blnHasActions);



  }


  getColumnStyles(col: any, strType: any): { [key: string]: string } {
    return {
      'width': col.strWidth,
      'text-align': col.strAlign,
      'border-right': strType === 'td' ? col.strKey !== 'strActions' ? '1px solid rgb(216, 216, 216)' : 'none' : 'none',
      'padding': '1rem',
    };
  }

  editTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'EDIT_DATA',
      objElement: objRowData
    })

  }

  dltTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'DELETE_DATA',
      objElement: objRowData
    })
  }

  singleviewTableData(objRowData: any) {
    console.log(objRowData)
    this.objPresentationEvent.emit({
      strOperation: 'SINGLEVIEW_DATA',
      objElement: objRowData
    })
  }

  // toggleTableData(objRowData,checked) {
  //   console.log(objRowData)
  //   console.log(checked);
  //   objRowData = {...objRowData,toggle:checked}

  //   this.objPresentationEvent.emit({
  //     strOperation: 'TOGGLETABLE_DATA',
  //     objElement: objRowData
  //   })
  // }

  // toggleTableData(objRowData: any, event: Event) {
  //   const inputElement = event.target as HTMLInputElement;
  //   const checked = inputElement.checked;
  //   const updatedRowData = { ...objRowData, toggle: checked };

  //   this.objPresentationEvent.emit({
  //     strOperation: 'TOGGLETABLE_DATA',
  //     objElement: updatedRowData
  //   });
  // }



openImageModal(imageUrl: string): void {
  console.log('Opening modal with:', imageUrl); // This must appear in the console
  this.selectedImageUrl = imageUrl;
  this.displayImageModal = true;
}

getImageUrl(path: string | null | undefined): string {
  const baseUrl = environment.apiUrl;
  if (!path) {
    return 'assets/images/noimage.png'; // fallback image path
  }
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
}


  toggleStatus(objRowData: any) {
    // Toggle between Active and Inactive status
    const newStatus = objRowData.status === 'Active' ? 'Inactive' : 'Active';
  
    // Update the row data with the new status
    objRowData.status = newStatus;
  
    // Emit the updated data for processing
    this.objPresentationEvent.emit({
      strOperation: 'TOGGLETABLE_DATA',
      objElement: objRowData
    });
  }
  
  


  sortColumn: string = '';
  sortOrder: boolean = true; // true for ascending, false for descending

  sortData(event: any) {
    this.sortColumn = event.field;
    this.sortOrder = event.order === 1; // 1 for ascending, -1 for descending
    this.arrList.sort((a, b) => {
      if (a[this.sortColumn] < b[this.sortColumn]) {
        return this.sortOrder ? -1 : 1;
      }
      if (a[this.sortColumn] > b[this.sortColumn]) {
        return this.sortOrder ? 1 : -1;
      }
      return 0;
    });
  }

  expandedCells: { [key: string]: boolean } = {};

isExpanded(row: any, colKey: string): boolean {
  const cellId = this.getCellId(row, colKey);
  return !!this.expandedCells[cellId];
}

toggleExpand(row: any, colKey: string): void {
  const cellId = this.getCellId(row, colKey);
  this.expandedCells[cellId] = !this.expandedCells[cellId];
}

private getCellId(row: any, colKey: string): string {
  // Assumes row has a unique `id` or similar key
  return `${row.id}_${colKey}`;
}

  


}
