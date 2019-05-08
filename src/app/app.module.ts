import { BrowserModule } from '@angular/platform-browser';
import { NgModule, forwardRef } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule}   from '@angular/forms';

import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { AlertComponent } from './alert/alert.component';
import { AgGridModule } from 'ag-grid-angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';

import { AuthGuard } from './helpers/auth.guard';
import { JwtInterceptor } from './helpers/auth.jwt';

import { AuthenticationService } from './service/authentication.service';
import { AlertService } from './service/alert.service';
import { UserService } from './service/user.service';
import { CommodityService } from './service/commodity.service';
import { MDBBootstrapModule } from 'angular-bootstrap-md'; 
import { OrganizationService } from './service/organization.service';
import { PackService } from './service/pack.service';
import { WarehouseCommService } from './service/whCommMap.servive';
import { DepositComponent } from './menu/deposit/deposit.component';
import { WithdrawalComponent } from './menu/withdrawal/withdrawal.component';
import { ChangePasswdComponent } from './menu/change-passwd/change-passwd.component';
import { DepositService } from './service/deposit.service';
import { WithdrawalService } from './service/withdrawal.service';

@NgModule({
  schemas:[
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    AlertComponent,
    DepositComponent,
    WithdrawalComponent,
    ChangePasswdComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule, ReactiveFormsModule,
    MatAutocompleteModule, MatInputModule,
    AgGridModule.withComponents([]),
    NgbModule.forRoot(),
    MDBBootstrapModule.forRoot(),
    RouterModule.forRoot([
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'menu', component: MenuComponent },
    ])
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    CommodityService,
    UserService,
    OrganizationService,
    PackService,
    WarehouseCommService,
    DepositService,
    WithdrawalService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
