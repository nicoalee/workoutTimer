import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { PadPipe } from './pad.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PadPipe
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    NgCircleProgressModule.forRoot({
      percent: 0,                 // init percent
      maxPercent: 100,            // max is 100
      toFixed: 0,                 // no decimal places
      showTitle: false,           // show percentage
      showUnits: false,           // show percentage
      showSubtitle: false,        // don't show subtitle
      showImage: false,           // don't show image
      showBackground: false,      // don't show background
      showInnerStroke: true,      // show inner circle
      clockwise: true,           // circle completes clockwise
      responsive: true,           // not set radius
      startFromZero: false,       // dont start again when percent changes value
      showZeroOuterStroke: true,  // not sure tbh
      radius: 80,                 // circle width
      // backgroundPadding: 0,
      // imageHeight: 0,
      // imageWidth: 0,
      backgroundGradient: false,
      backgroundOpacity: 0,
      backgroundColor: "transparent",
      backgroundGradientStopColor: "transparent",
      backgroundStroke: "transparent",
      outerStrokeGradient: false,
      outerStrokeColor: "#e2b6cf",
      outerStrokeGradientStopColor: "transparent",
      innerStrokeColor: "#f6efee",
      titleColor: "black",
      unitsColor: "black",
      outerStrokeWidth: 3,
      space: -1,
      innerStrokeWidth: 5,
      backgroundStrokeWidth: 0,
      outerStrokeLinecap: "round",
      titleFontSize: "20",
      unitsFontSize: "10",
      titleFontWeight: "normal",
      unitsFontWeight: "normal",
      animation: true,
      animationDuration: 500,
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
