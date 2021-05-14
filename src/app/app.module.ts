import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AuthModule, EventTypes, LogLevel, OidcConfigService, PublicEventsService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      stsServer: 'https://itiampingdev.cloud.pge.com',
      redirectUrl: window.location.origin + '/signup',
      postLogoutRedirectUri: window.location.origin,
      clientId: 'ecm_crmis',
      scope: 'openid profile email groups',
      responseType: 'id_token token',
      silentRenewUrl: ``,
      startCheckSession: true,
      silentRenew: false,
      logLevel: LogLevel.Debug,
    });
}

@NgModule({
  declarations: [AppComponent, HomeComponent, UnauthorizedComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'signup', pathMatch: 'full' },
      { path: 'signup', component: HomeComponent },
      { path: 'forbidden', component: UnauthorizedComponent },
      { path: 'unauthorized', component: UnauthorizedComponent },
    ]),
    AuthModule.forRoot(),
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private readonly eventService: PublicEventsService) {
    this.eventService
      .registerForEvents()
      .pipe(filter((notification) => notification.type === EventTypes.ConfigLoaded))
      .subscribe((config) => console.log('ConfigLoaded', config));
  }
}
