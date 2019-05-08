import { Component, OnInit, Input } from '@angular/core';
import { MenuComponent } from '../menu.component';
import { AlertService } from 'src/app/service/alert.service';
import { NgForm } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { Observable } from 'rxjs';
import { FormControl } from "@angular/forms";
import { Deposit} from '../../models/deposit'
import { OrganizationService } from 'src/app/service/organization.service';
import { DepositService } from 'src/app/service/deposit.service';
import { Organization } from 'src/app/models/organization';
import { Commodity } from 'src/app/models/commodity';
import { Pack } from 'src/app/models/pack';
import { WarehouseCommService } from 'src/app/service/whCommMap.servive';
import { PackService } from 'src/app/service/pack.service';


@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['../../app.component.scss'],
})
export class DepositComponent implements OnInit {
  private gridApi;
  private whGridApi;
  private commGridApi;
  private clientGridApi;
  private packGridApi;
  @Input() menuComponent: MenuComponent;
  @Input() agriModule: AgGridModule;
  @Input() myControl: FormControl

  model: any = {};
  searhModel: any = {};
  loading = false;
  disableFields = false;
  searchOpen = true;
  saveDisabled = false;
  submitDisabled = false;
  openWhDiv = false;
  openCommDiv = false;
  openClientDiv = false;
  openPackDiv = false;
  packDeduction = 0;
  saveEnable = false;
  submitEnable = false;
  viewEnable = false;
  isWhUser = true;

  //grid config
  columnDefs = [
    { headerName: 'Deposit Id', field: 'depositId', sortable: true, filter: true, width: 150},
    { headerName: 'Transaction Id', field: 'txnId', sortable: true, filter: true, width: 150},
    { headerName: 'Warehouse Name', field: 'warehouseName', sortable: true, filter: true, width: 150 },
    { headerName: 'Commodity Name', field: 'commodityName', sortable: true, filter: true, width: 150 },
    { headerName: 'Client Name', field: 'clientName', sortable: true, filter: true, width: 150 },
    { headerName: 'Deposit Packs', field: 'noOfBags', sortable: true, filter: true, width: 150 },
    { headerName: 'Deposit Quantity', field: 'quantity', sortable: true, filter: true, width: 150 },
    { headerName: 'Pack Type', field: 'packType', sortable: true, filter: true, width: 150 },
    { headerName: 'Net Quantity', field: 'netQuantity', sortable: true, filter: true, width: 150 },
    { headerName: 'Current Quantity', field: 'currenyQty', sortable: true, filter: true, width: 150 },
    { headerName: 'Current Packs', field: 'currentPacks', sortable: true, filter: true, width: 150 },
    { headerName: 'Status', field: 'status', sortable: true, filter: true, width: 150 },
    { headerName: 'Select', sortable: true, filter: true, width: 150, checkboxSelection: true }
  ];

  rowData: Observable<Array<Deposit>>[];

  //warehouse grid
  whColumnDefs = [
    { headerName: 'Warehouse Code', field: '_orgId', sortable: true, filter: true, width: 100},
    { headerName: 'Warehouse Name', field: '_orgName', sortable: true, filter: true, width: 100},
    { headerName: 'Select', sortable: true, filter: true, width: 100, checkboxSelection: true }
  ];

  whRowData: Observable<Array<Organization>>[];

  //commodity grid
  commColumnDefs = [
    { headerName: 'Commodity Code', field: '_commId', sortable: true, filter: true, width: 100},
    { headerName: 'Commodity Name', field: '_commName', sortable: true, filter: true, width: 100},
    { headerName: 'Commodity UOM', field: '_unitOfMeasure', sortable: true, filter: true, width: 100},
    { headerName: 'Select', sortable: true, filter: true, width: 100, checkboxSelection: true }
  ];

  commRowData: Observable<Array<Commodity>>[];

  //client grid
  clientColumnDefs = [
    { headerName: 'Client Id', field: '_orgId', sortable: true, filter: true, width: 100},
    { headerName: 'Client Name', field: '_orgName', sortable: true, filter: true, width: 100},
    { headerName: 'Select', sortable: true, filter: true, width: 100, checkboxSelection: true }
  ]

  clientRowData: Observable<Array<Organization>>[];

  //pack grid
  packColumnDefs =[
    { headerName: 'Pack Id', field: '_packType', sortable: true, filter: true, width: 100},
    { headerName: 'Pack Name', field: '_packDescription', sortable: true, filter: true, width: 100},
    { headerName: 'Pack Deduction', field: '_packDeduction', sortable: true, filter: true, width: 100},
    { headerName: 'Select', sortable: true, filter: true, width: 180, checkboxSelection: true }
  ]

  packRowData: Observable<Array<Pack>>[]

  constructor(private organizationServive: OrganizationService,
    private alertService: AlertService,
    private depositService: DepositService,
    private warehouseCommService: WarehouseCommService,
    private packService:PackService) { }

  ngOnInit() {
    this.disableFields = false;
    this.getRecordsOnInit();
    let userRole = JSON.parse(localStorage.getItem('currentUser'))._userRole;
    if(userRole==3){this.isWhUser = false}
  }

  save() {
    this.alertService.success(null);
    this.alertService.error(null);
    let newModel = this.model;
    let dateStr = this.model.depositDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr);
    
    if (actualDate) {
      this.model.depositDate = this.setZoneDateFormat(new Date(dateStr));
      this.model.createdBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
      this.model.active = "Y";
      this.model.status = "PENDING";
      let actualQty = this.model.quantity-(this.model.quantity*this.model.noOfBags*this.packDeduction/100);
      this.model.currentPacks = this.model.noOfBags;
      this.model.currenyQty = actualQty;
      this.model.netQuantity = actualQty;
      if (newModel.depositId == null || newModel.depositId == undefined) {
        this.depositService.create(this.model)
          .subscribe(
            data => {
              let orgObj: any = data;
              this.model = orgObj;
              let dateNew =  this.setAppDate(new Date(Date.parse(this.model.depositDate)));
              this.model.depositDate = dateNew;
              this.disableFields = true;
              this.saveEnable = false;
              this.submitEnable = true;
              this.alertService.success("Record Saved Succesfully");
            },
            error => {
              this.alertService.error(error.message);
              this.loading = false;
            });
      }
    }else{
      this.alertService.error("Please enter deposit date in the form MM/dd/yyyy");
    }
  }

  edit() {
    this.alertService.success(null);
    this.alertService.error(null);
    let dateStr = this.model.depositDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr)
    if(actualDate){
    this.model.depositDate = this.setZoneDateFormat(new Date(dateStr));
    this.model.modifiedBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
    this.model.status = "COMPLETED";
    this.depositService.update(this.model)
      .subscribe(
        data => {
          let orgObj: any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.depositDate)));
          this.model.depositDate = dateNew;
          this.disableFields = true;
          this.alertService.success("Record Submitted Succesfully");
          this.submitEnable = false;
          this.viewEnable = true;
        },
        error => {
          this.alertService.error(error.message);
          this.loading = false;
        });
      }else{
        this.alertService.error("Please enter deposit date in the form MM/dd/yyyy");
      }
  }

  discard(){
    this.alertService.success(null);
    this.alertService.error(null);
    let dateStr = this.model.depositDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr)
    if(actualDate){
    this.model.depositDate = this.setZoneDateFormat(new Date(dateStr));
    this.model.modifiedBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
    this.model.status = "CANCELLED";
    this.model.active = "N"
    this.depositService.update(this.model)
      .subscribe(
        data => {
          let orgObj: any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.depositDate)));
          this.model.depositDate = dateNew;
          this.disableFields = true;
          this.alertService.success("Record Discarded Succesfully");
          this.submitEnable = false;
          this.viewEnable = true;
        },
        error => {
          this.alertService.error(error.message);
          this.loading = false;
        });
      }else{
        this.alertService.error("Please enter deposit date in the form MM/dd/yyyy");
      }
  }

  enableCreate(f: NgForm) {
    this.alertService.success(null);
    this.alertService.error(null);
    let newModel:any = {};
    newModel.depositDate = this.setAppDate(new Date());
    this.loading = false;
    this.disableFields = false;
    this.searchOpen = false;
    this.saveEnable = true;
    this.viewEnable = false;
    this.packDeduction =0;
    f.resetForm(true);
  }

  getRecordsOnInit() {
    let queryparam = "?";
    if (this.searhModel.warehouseCode != null && this.searhModel.warehouseCode != "" && this.searhModel.warehouseCode != undefined) {
      queryparam = queryparam + "warehouseCode=" + this.searhModel.warehouseCode + "&";
    }
    if (this.searhModel.warehouseName != null && this.searhModel.warehouseName != "" && this.searhModel.warehouseName != undefined) {
      queryparam = queryparam + "warehouseName=" + this.searhModel.warehouseName + "&";
    }
    if (this.searhModel.commodityCode != null && this.searhModel.commodityCode != "" && this.searhModel.commodityCode != undefined) {
      queryparam = queryparam + "commodityCode=" + this.searhModel.commodityCode + "&";
    }
    if (this.searhModel.commodityName != null && this.searhModel.commodityName != "" && this.searhModel.commodityName != undefined) {
      queryparam = queryparam + "commodityName=" + this.searhModel.commodityName + "&";
    }
    if (this.searhModel.clientCode != null && this.searhModel.clientCode != "" && this.searhModel.clientCode != undefined) {
      queryparam = queryparam + "clientCode=" + this.searhModel.clientCode + "&";
    }
    if (this.searhModel.clientName != null && this.searhModel.clientName != "" && this.searhModel.clientName != undefined) {
      queryparam = queryparam + "clientName=" + this.searhModel.clientName + "&";
    }
    if (this.searhModel.startDate != null && this.searhModel.startDate != "" && this.searhModel.startDate != undefined) {
      let actualDate = null;
      actualDate = Date.parse(this.searhModel.startDate)
      queryparam = queryparam + "startDate=" + this.setZoneDateFormat(new Date(actualDate)) + "&";
    }
    if (this.searhModel.endDate != null && this.searhModel.endDate != "" && this.searhModel.endDate != undefined) {
      let actualDate = null;
      actualDate = Date.parse(this.searhModel.endDate)
      queryparam = queryparam + "endDate=" + this.setZoneDateFormat(new Date(actualDate));
    }
    this.depositService.getAll(queryparam)
      .subscribe(
        data => {
          let commRecords: any = data;
          this.rowData = commRecords;
        },
        error => {
          this.alertService.error(error.message);
        });
  }

  setZoneDateFormat(date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let monthStr = month < 10 ? "0" + month : month;
    let day = date.getDate();
    let dayStr = day < 10 ? "0" + day : day;
    let dateStr = year + "-" + monthStr + "-" + dayStr + "T00:00:00.000Z"
    return dateStr;
  }

  setAppDate(date: Date){
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let monthStr = month < 10 ? "0" + month : month;
    let day = date.getDate();
    let dayStr = day < 10 ? "0" + day : day;
    let dateStr = monthStr + "/" + dayStr + "/" + year;
    return dateStr;
  }

  createNewForm(f: NgForm) {
    this.alertService.success(null);
    this.alertService.error(null);
    let newModel:any = {};
    newModel.depositDate = this.setAppDate(new Date());
    this.model=newModel;
    this.searhModel = {};
    this.loading = false;
    this.disableFields = false;
    this.searchOpen = false;
    this.saveEnable = true;
    this.viewEnable = false;
    this.packDeduction =0;
    f.resetForm(true);
  }

  viewDeposits(f: NgForm) {
    this.alertService.success(null);
    this.alertService.error(null);
    this.model = {};
    this.searhModel = {};
    this.loading = false;
    this.disableFields = false;
    this.searchOpen = true;
    this.getRecordsOnInit();
    f.resetForm(true);
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onWhGridReady(params) {
    this.whGridApi = params.api;
  }

  onCommGridReady(params) {
    this.commGridApi = params.api;
  }

  onClientGridReady(params) {
    this.clientGridApi = params.api;
  }

  onPackGridReady(params) {
    this.packGridApi = params.api;
  }

  editRecord() {
    this.alertService.error(null);
    this.alertService.success(null);
    var selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      this.searchOpen = false;
      this.searhModel = {};
      this.loading = false;
      this.disableFields = true;
      this.depositService.getById(selectedRows[0].depositId).subscribe(
        data =>{
          let orgObj:any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.depositDate)));
          this.model.depositDate = dateNew;
          if(this.model.status == "PENDING"){
            this.submitEnable = true;
            this.viewEnable = false;
          }else if(this.model.status == "COMPLETED"){
            this.submitEnable = false;
            this.viewEnable = true;
          }
        }
      );
    } else {
      this.alertService.error("Please select a row to continue");
      this.loading = false;
    }
  }

  onQuickFilterChanged() {
    this.gridApi.setQuickFilter((<HTMLInputElement>document.getElementById("quickFilter")).value);
  }

  onWhQuickFilterChanged() {
    this.whGridApi.setQuickFilter((<HTMLInputElement>document.getElementById("whQuickFilter")).value);
  }

  onCommQuickFilterChanged() {
    this.commGridApi.setQuickFilter((<HTMLInputElement>document.getElementById("commQuickFilter")).value);
  }

  onPackQuickFilterChanged() {
    this.packGridApi.setQuickFilter((<HTMLInputElement>document.getElementById("packQuickFilter")).value);
  }

  onClientQuickFilterChanged() {
    this.clientGridApi.setQuickFilter((<HTMLInputElement>document.getElementById("clientQuickFilter")).value);
  }

  selectWh(){
    this.openWhDiv = true;
    let query = "?_orgType=WAREHOUSE"
    this.organizationServive.getAll(query).subscribe(
      data => {
        let orgRecs:any = data;
        this.whRowData = orgRecs.data.docs;
      },
      error=>{
        this.alertService.error(error.error.message);
      }
    )
  }

  onWhRowSelected(){
    var selectedRows = this.whGridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      this.model.warehouseCode = selectedRows[0]._orgId;
      this.model.warehouseName = selectedRows[0]._orgName;
      this.openWhDiv = false;
    }else{
      this.alertService.error("Please select a record");
    }
  }

  selectComm(){
    this.openCommDiv = true;
    let wh = this.model.warehouseCode;
    if(wh!=null && wh!=undefined){
      this.warehouseCommService.getById(wh).subscribe(
        data => {
          let userObj: any = data;
          let commDtls = userObj.data.commodityDtls;
          this.commRowData = commDtls;
        },
        error => {
          console.log(error);
          this.alertService.error(error.error.message);
        }
      );
    }else{
      this.alertService.error("Please select warehouse first");
    }
  }

  onCommRowSelected(){
    var selectedRows = this.commGridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      this.model.commodityCode = selectedRows[0]._commId;
      this.model.commodityName = selectedRows[0]._commName;
      this.model.uomCode = selectedRows[0]._unitOfMeasure;
      this.openCommDiv = false;
    }else{
      this.alertService.error("Please select a record");
    }
  }

  selectClient(){
    this.openClientDiv = true;
    let query = "?_orgType=CLIENT"
    this.organizationServive.getAll(query).subscribe(
      data => {
        let orgRecs:any = data;
        this.clientRowData = orgRecs.data.docs;
      },
      error=>{
        this.alertService.error(error.error.message);
      }
    )
  }

  onClientRowSelected(){
    var selectedRows = this.clientGridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      this.model.clientId = selectedRows[0]._orgId;
      this.model.clientName = selectedRows[0]._orgName;
      this.openClientDiv = false;
    }else{
      this.alertService.error("Please select a record");
    }
  }

  selectPack(){
    this.openPackDiv = true;
    this.packService.getAll("")
      .subscribe(
        data => {
          let commRecords: any = data;
          this.packRowData = commRecords.data.docs;
        },
        error => {
          this.alertService.error(error.error.message);
        });
  }

  onPackRowSelected(){
    var selectedRows = this.packGridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      this.model.packType = selectedRows[0]._packType;
      this.packDeduction = selectedRows[0]._packDeduction;
      this.openPackDiv = false;
    }else{
      this.alertService.error("Please select a record");
    }
  }

  setNetQty(){
    this.model.netQuantity = this.model.quantity-(this.model.quantity*this.model.noOfBags*this.packDeduction/100);
  }

}
