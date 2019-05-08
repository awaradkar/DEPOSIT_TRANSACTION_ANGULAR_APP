import { Component, OnInit, Input } from '@angular/core';
import { MenuComponent } from '../menu.component';
import { AlertService } from 'src/app/service/alert.service';
import { NgForm } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { Observable } from 'rxjs';
import { FormControl } from "@angular/forms";
import { Deposit} from '../../models/deposit'
import { DepositService } from 'src/app/service/deposit.service';
import { Withdrawal } from '../../models/withdrawal'
import { WithdrawalService} from 'src/app/service/withdrawal.service';

@Component({
  selector: 'app-withdrawal',
  templateUrl: './withdrawal.component.html',
  styleUrls: ['../../app.component.scss'],
})
export class WithdrawalComponent implements OnInit {
  private gridApi;
  private depGridApi;
  
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
  openDepDiv = false;
  saveEnable = false;
  submitEnable = false;
  viewEnable = false;
  isWhUser = true;
  depositView = true;

  //grid config
  columnDefs = [
    { headerName: 'Withdrawal Id', field: 'withdrawalId', sortable: true, filter: true, width: 150},
    { headerName: 'Deposit Id', field: 'depositId', sortable: true, filter: true, width: 150},
    { headerName: 'Transaction Id', field: 'txnId', sortable: true, filter: true, width: 150},
    { headerName: 'Warehouse Name', field: 'warehouseName', sortable: true, filter: true, width: 150 },
    { headerName: 'Commodity Name', field: 'commodityName', sortable: true, filter: true, width: 150 },
    { headerName: 'Client Name', field: 'clientName', sortable: true, filter: true, width: 150 },
    { headerName: 'Withdrawal Packs', field: 'withDrawalNoOfBags', sortable: true, filter: true, width: 150 },
    { headerName: 'Withdrawal Quantity', field: 'withdrawalQuantity', sortable: true, filter: true, width: 150 },
    { headerName: 'Pack Type', field: 'packType', sortable: true, filter: true, width: 150 },
    { headerName: 'Status', field: 'status', sortable: true, filter: true, width: 150 },
    { headerName: 'Select', sortable: true, filter: true, width: 150, checkboxSelection: true }
  ];

  rowData: Observable<Array<Withdrawal>>[];

  //grid config
  depColumnDefs = [
    { headerName: 'Deposit Id', field: 'depositId', sortable: true, filter: true, width: 150},
    { headerName: 'Transaction Id', field: 'txnId', sortable: true, filter: true, width: 150},
    { headerName: 'Warehouse Name', field: 'warehouseName', sortable: true, filter: true, width: 150 },
    { headerName: 'Commodity Name', field: 'commodityName', sortable: true, filter: true, width: 150 },
    { headerName: 'Client Id', field: 'clientId', sortable: true, filter: true, width: 150, hide: true},
    { headerName: 'Client Name', field: 'clientName', sortable: true, filter: true, width: 150 },
    { headerName: 'Deposit Packs', field: 'noOfBags', sortable: true, filter: true, width: 150 },
    { headerName: 'Deposit Quantity', field: 'quantity', sortable: true, filter: true, width: 150 },
    { headerName: 'Pack Type', field: 'packType', sortable: true, filter: true, width: 150 },
    { headerName: 'Current Quantity', field: 'currenyQty', sortable: true, filter: true, width: 150 },
    { headerName: 'Current Packs', field: 'currentPacks', sortable: true, filter: true, width: 150 },
    { headerName: 'Select', sortable: true, filter: true, width: 150, checkboxSelection: true }
  ];

  depRowData: Observable<Array<Deposit>>[];
  constructor(private alertService: AlertService,
    private depositService: DepositService,
    private withdrawalService: WithdrawalService) { }

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
    let tempDate = this.model.withdrawalDate;
    let dateStr = this.model.withdrawalDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr);
    
    if (actualDate) {
      this.model.withdrawalDate = this.setZoneDateFormat(new Date(dateStr));
      this.model.createdBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
      this.model.active = "Y";
      this.model.status = "PENDING";
      
      let depositBags = this.model.currentPacks;
      let depositQty = this.model.currenyQty;
      if (newModel.withdrawalId == null || newModel.withdrawalId == undefined) {
      if(this.chkValid()){
        this.withdrawalService.create(this.model)
          .subscribe(
            data => {
              let withObj: any = data;
              this.model = withObj;
              let dateNew =  this.setAppDate(new Date(Date.parse(this.model.withdrawalDate)));
              this.model.withdrawalDate = dateNew;
              this.model.currentPacks = depositBags - this.model.withDrawalNoOfBags;
              this.model.currenyQty = depositQty - this.model.withdrawalQuantity;
              this.disableFields = true;
              this.saveEnable = false;
              this.submitEnable = true;
              this.alertService.success("Record Saved Succesfully");
            },
            error => {
              this.alertService.error(error.error.message);
              this.loading = false;
            });
          }else{
            this.model.withdrawalDate = tempDate;
          }
      }
    }else{
      this.alertService.error("Please enter deposit date in the form MM/dd/yyyy");
    }
  }

  chkValid(){
    if(this.model.withDrawalNoOfBags==0){
      this.alertService.error("Withdrawal Bags cannot be zero");
      return false;
    }
    if(this.model.withdrawalQuantity==0){
      this.alertService.error("Withdrawal Quantity cannot be zero");
      return false;
    }
    if(this.model.currentPacks - this.model.withDrawalNoOfBags<0){
      this.alertService.error("Withdrawal Bags greater than the available no of bags");
      return false;
    }
    if(this.model.currenyQty - this.model.withdrawalQuantity<0){
      this.alertService.error("Withdrawal Quantity greater than the available quantity");
      return false;
    }
    if((this.model.currentPacks - this.model.withDrawalNoOfBags==0) && (this.model.currenyQty - this.model.withdrawalQuantity!=0)){
      this.alertService.error("Packs cannot be extinguished when quantity stll exists");
      return false;
    }
    if((this.model.currentPacks - this.model.withDrawalNoOfBags!=0) && (this.model.currenyQty - this.model.withdrawalQuantity==0)){
      this.alertService.error("Quantity cannot be extinguished when packs stll exists");
      return false;
    }
    return true;
  }

  edit() {
    this.alertService.success(null);
    this.alertService.error(null);
    let dateStr = this.model.withdrawalDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr)
    if(actualDate){
    this.model.withdrawalDate = this.setZoneDateFormat(new Date(dateStr));
    this.model.modifiedBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
    this.model.status = "COMPLETED";
    let depositDate = this.model.depositDate;
    let depositBags = this.model.currentPacks;
    let depositQty = this.model.currenyQty;
    this.withdrawalService.update(this.model)
      .subscribe(
        data => {
          let orgObj: any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.withdrawalDate)));
          this.model.withdrawalDate = dateNew;
          this.model.depositDate = depositDate;
          this.depositView = false;
          this.disableFields = true;
          this.alertService.success("Record Submitted Succesfully");
          this.submitEnable = false;
          this.viewEnable = true;
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
      }else{
        this.alertService.error("Please enter withdrawal date in the form MM/dd/yyyy");
      }
  }

  discard(){
    this.alertService.success(null);
    this.alertService.error(null);
    let dateStr = this.model.withdrawalDate;
    let actualDate = null;
    actualDate = Date.parse(dateStr)
    if(actualDate){
    this.model.withdrawalDate = this.setZoneDateFormat(new Date(dateStr));
    this.model.modifiedBy = JSON.parse(localStorage.getItem('currentUser'))._userName;
    this.model.status = "CANCELLED";
    this.model.active = "N";
    let depositDate = this.model.depositDate;
    let depositBags = this.model.currentPacks;
    let depositQty = this.model.currenyQty;
    this.withdrawalService.update(this.model)
      .subscribe(
        data => {
          let orgObj: any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.withdrawalDate)));
          this.model.withdrawalDate = dateNew;
          this.model.depositDate = depositDate;
          this.model.currentPacks = depositBags;
          this.model.currenyQty = depositQty;
          this.disableFields = true;
          this.alertService.success("Record Discarded Succesfully");
          this.submitEnable = false;
          this.viewEnable = true;
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
      }else{
        this.alertService.error("Please enter withdrawal date in the form MM/dd/yyyy");
      }
  }

  enableCreate(f: NgForm) {
    this.alertService.success(null);
    this.alertService.error(null);
    let newModel:any = {};
    newModel.withdrawalDate = this.setAppDate(new Date());
    this.loading = false;
    this.disableFields = false;
    this.searchOpen = false;
    this.saveEnable = true;
    this.submitEnable = false;
    this.viewEnable = false;
    this.depositView = true;
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
    this.withdrawalService.getAll(queryparam)
      .subscribe(
        data => {
          let commRecords: any = data;
          this.rowData = commRecords;
        },
        error => {
          this.alertService.error(error);
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
    newModel.withdrawalDate = this.setAppDate(new Date());
    this.model=newModel;
    this.searhModel = {};
    this.loading = false;
    this.disableFields = false;
    this.searchOpen = false;
    this.saveEnable = true;
    this.submitEnable = false;
    this.viewEnable = false;
    this.depositView = true;
    f.resetForm(true);
  }

  viewWithdrawals(f: NgForm) {
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

  onDepGridReady(params) {
    this.depGridApi = params.api;
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
      this.withdrawalService.getById(selectedRows[0].withdrawalId).subscribe(
        data =>{
          let orgObj:any = data;
          this.model = orgObj;
          let dateNew =  this.setAppDate(new Date(Date.parse(this.model.withdrawalDate)));
          this.model.withdrawalDate = dateNew;
          if(this.model.status == "PENDING"){
            this.depositView = false;
            this.submitEnable = true;
            this.viewEnable = false;
          }else if(this.model.status == "COMPLETED"){
            this.submitEnable = false;
            this.viewEnable = true;
            this.depositView = false;
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

  onDepQuickFilterChanged() {
    this.depGridApi.setQuickFilter((<HTMLInputElement>document.getElementById("depQuickFilter")).value);
  }

  selectDeposit(){
    this.openDepDiv = true;
    let query = "?status=COMPLETED"
    this.depositService.getAll(query).subscribe(
      data => {
        let orgRecs:any = data;
        this.depRowData = orgRecs;
      },
      error=>{
        this.alertService.error(error.error.message);
      }
    )
  }

  onDepRowSelected(){
    var selectedRows = this.depGridApi.getSelectedRows();
    if (selectedRows != null && selectedRows != undefined && selectedRows.length > 0) {
      let depositId = selectedRows[0].depositId;
      this.depositService.getById(depositId).subscribe(
        data => {
          let depRec:any = data;
          this.model = depRec;
          this.model.withdrawalDate = this.setAppDate(new Date());
          this.model.depositDate = this.setAppDate(new Date(depRec.depositDate));
          this.model.txnId = "";
          ;
          this.openDepDiv = false;
        },
        error=>{
          this.alertService.error(error.error.message);
        });
      
    }else{
      this.alertService.error("Please select a record");
    }
  }
}
