import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  
  private timer: number = 0;

  constructor(
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  loading(){
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.timer++;
    this.spinner.show( undefined,{
      type: 'ball-scale-ripple',
      size: 'default',
      bdColor: 'rgba(0,0,0,0.8)',
      color: '#fff',
    }
      
    );
  }

  stopLoading(){
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.timer--;
    if(this.timer <= 0){
      this.timer = 0
      this.spinner.hide();
    }
  }

}
