import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AgGridModule } from 'ag-grid-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColDef, IServerSideDatasource, IServerSideGetRowsParams, ModuleRegistry, RowModelType, AllCommunityModule, GridOptions } from 'ag-grid-community';
import { GithubService } from '../services/github.service';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { debounce, debounceTime, of } from 'rxjs';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

@Component({
  selector: 'app-github-collections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    AgGridModule,
    MatTooltipModule
  ],
  templateUrl: './github-collections.component.html',
  styleUrls: ['./github-collections.component.scss']
})
export class GithubCollectionsComponent implements OnInit {
  collections: string[] = [];
  collectionColdefs: any = {};
  selectedCollection: string = '';
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  searchKeyword: string = '';
  gridLoadRowData: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      this.params = params; // Store the params for later use
      if(this.selectedCollection) {
        this.loadRowData(); // Call the method to load row data
      }
    }
  };
  autoSizeStrategy = {
      type: 'fitGridWidth',
      defaultMinWidth: 100
  };
  defaultColDef: ColDef = {
    autoHeight: true
  };
  gridOptions: any = {
    datasource: this.gridLoadRowData, // Bind the method to the component context
  };
  api: any; // Declare the api property
  params: any;
  getCollectionData: any;
  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.fetchCollections();
  }

  fetchCollections(): void {
    this.getCollectionData = this.githubService.getCollectionData().subscribe((data: any) => {
      let collections = data.data; // Assuming `collections` is returned from the API
      Object.keys(collections).forEach((key: string) => {
       
        this.collections.push(key);
        collections[key]['columns'].map((col: any) => {
          if (col.type === 'image') {
            col.cellRenderer = (params: any) => {
              return `<img src="${params.value}" alt="Image" style="width: 50px; height: 50px;"/>`; // Use a custom cell renderer for image columns
            };
          } else if (col.type === 'url') {
            col.cellRenderer = (params: any) => {
              return `<a href="${params.value}" target="_blank">${params.value}</a>`;
            }; // Use a custom cell renderer for link columns
          } else if (col.type === 'date') {
            col.valueFormatter = (params: any) => {
              return new Date(params.value).toLocaleDateString(); // Format date columns
            };
          } else if (col.type === 'number') {
            col.valueFormatter = (params: any) => {
              return params.value.toLocaleString(); // Format number columns
            };
          }
          
          return col;
        });
        this.collectionColdefs[key] = collections[key]['columns'];
                
        // Set the first collection as selected by default
        if (this.collections.length === 0) {
          this.selectedCollection = key;
          this.onCollectionChange();
        }
      });
    });
  }

  onCollectionChange(): void {
    if (this.selectedCollection) {
      this.columnDefs = this.collectionColdefs[this.selectedCollection];
      if(this.getCollectionData) {
        this.getCollectionData.unsubscribe(); // Unsubscribe from previous subscription to avoid memory leaks
      }
      this.loadRowData();
    }
  }

  loadRowData(): void {
    const currentPageSize = this.gridOptions.api!.paginationGetPageSize();
    let currentPage = this.gridOptions.api!.paginationGetCurrentPage();
    
    let params = this.params;
    currentPage += 1;
    this.getCollectionData = this.githubService.getPaginatedCollectionData(this.selectedCollection, currentPage, currentPageSize, this.searchKeyword).subscribe((response: any) => {
      params.success({rowData: response.data, rowCount: response.pagination.total});
      return;
    })
  }

  onSearch(): void {
    // reset pagination
    this.gridOptions.api!.paginationGoToFirstPage();

    of(this.searchKeyword)
    .pipe(
      debounceTime(500) // Debounce the search input
    )
    .subscribe(() => {
      this.searchKeyword = this.searchKeyword.trim(); // Trim whitespace from the search keyword
      if(this.getCollectionData) {
        this.getCollectionData.unsubscribe(); // Unsubscribe from previous subscription to avoid memory leaks
      }
      this.loadRowData();
    });
  }

  onGridReady(params: any): void {
    this.gridOptions.api = params.api;
    this.gridOptions.columnApi = params.columnApi;
  }

}