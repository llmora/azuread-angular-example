import { Component, OnInit } from '@angular/core';
import { UserAgentApplication, LogLevel, Logger, Configuration } from "@azure/msal";

import * as jwt_decode from "jwt-decode";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  private azureLogger: Logger;

  private azureEnabled: boolean = false;
  private azureClientID: string = "<ENTER AZURE CLIENT ID HERE>";
  private azureTenantID: string = "<ENTER AZURE TENANT ID HERE>";
  private message: string;

  private azureADmsalInstance: UserAgentApplication;

  constructor() {
  }

  ngOnInit() {

    this.azureLogger = new Logger(
      this.azureLoggerCallback,
      { correlationId: '1234', level: LogLevel.Verbose, piiLoggingEnabled: true }
    );

    if (this.azureClientID) {
      this.azureADInit();
      this.message = "Azure initialised"
    } else {
      this.message = "Missing Azure Client ID (and maybe also Azure Tenant ID), please review your configuration"
    }

  }

  azureLoggerCallback(logLevel, message, containsPii) {
    console.log(`AZURE LOG: ${message}`);
  }

  azureADInit() {

    var msalConfig: Configuration = {
      auth: {
        clientId: this.azureClientID,
        // redirectUri: 'http://localhost:4200/assets/login-redirect.html'
      },

      system: {
        logger: this.azureLogger
      }
    };

    if (this.azureTenantID) { // To support single-tenant applications
      msalConfig['auth']['authority'] = `https://login.microsoftonline.com/${this.azureTenantID}`
    }

    this.azureADmsalInstance = new UserAgentApplication(msalConfig)

    this.azureEnabled = true;
  }

  azureLoginPopup() {
    console.log("Trying to login with Microsoft using popup")

    var loginRequest = {
      scopes: ['user.read']
    };

    this.azureADmsalInstance.loginPopup(loginRequest)
      .then(response => {

        var azureAccount = this.azureADmsalInstance.getAccount();

        console.log("Microsoft ID Token obtained successfully");

        var decoded = jwt_decode(response.idToken.rawIdToken)
        this.message = `Logged in successfully as user ${response.account.userName} with roles: ${decoded.roles}. Retrieved raw JWT token: ${response.idToken.rawIdToken}`
      })

      .catch(err => {
        this.message = "Error authorising through Microsoft: " + err;
      });
  }
}
