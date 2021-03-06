import { APP_INITIALIZER, PLATFORM_ID, NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { SocketIo } from './ng-io.service';
import { NgIoConfig } from './ng-io-config';

export function SocketFactory(config: NgIoConfig, platformId: any) {
  return new SocketIo(config, platformId);
}

export function AppInitFactory(socketIo: SocketIo, config: NgIoConfig, platformId: any) {
  const appLoadSetting = (config.connectOnAppLoad || config.connectOnAppLoad === undefined);
  const platformIsBrowser = isPlatformBrowser(platformId);
  return initApp(platformIsBrowser && appLoadSetting, socketIo);
}

export function initApp(connectOnStart: boolean, socketIo: SocketIo) {
  return function () {
    if (connectOnStart) {
      socketIo.connect();
    }
  };
}

export const SOCKET_CONFIG_TOKEN = new InjectionToken<NgIoConfig>('__SOCKET_IO_CONFIG__');

@NgModule()
export class NgIoModule {
  static forRoot(config: NgIoConfig): ModuleWithProviders {
    return {
      ngModule: NgIoModule,
      providers: [
        {provide: SOCKET_CONFIG_TOKEN, useValue: config},
        {
          provide: SocketIo,
          useFactory: SocketFactory,
          deps: [SOCKET_CONFIG_TOKEN, PLATFORM_ID],
        },
        {
          provide: APP_INITIALIZER,
          useFactory: AppInitFactory,
          deps: [SocketIo, SOCKET_CONFIG_TOKEN, PLATFORM_ID],
          multi: true
        }
      ]
    };
  }
}
