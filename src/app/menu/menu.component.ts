import { Component, OnInit, Input } from '@angular/core';
import * as $ from 'jquery';
import { AlertComponent } from '../alert/alert.component';
import { AlertService } from '../service/alert.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['../app.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() alertComponent:AlertComponent
  public isDep:boolean;
  public isWith:boolean; public isChngPwd:boolean;
  public nlyChngPasswdDisplay = false;
  constructor(private alertService:AlertService) { }

  ngOnInit() {
    this.setFlags();
    let loggedInUser:any = JSON.parse(localStorage.getItem('currentUser'));
    if(loggedInUser._isFirstLogin == true){
      this.nlyChngPasswdDisplay = true;
    }
  }

  setFlags() {
    this.alertService.error(null);
    this.alertService.success(null);
    this.isDep = false; this.isWith = false; this.isChngPwd = false;
  }

  toggle() {
    $("#wrapper").toggleClass("toggled");
  }

  
  onselect(compName) {
    this.setFlags();
    if (compName === 'dep') this.isDep = true;
    else if(compName==='with') this.isWith = true;
    else if(compName==='chPwd') this.isChngPwd = true;
  }
}
