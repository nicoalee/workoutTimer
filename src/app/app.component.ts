import { Component, AfterViewInit, Renderer2, ElementRef, HostListener, ViewChild } from '@angular/core';
import { timer, Subject, NEVER, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { faPause, faPlay, faTimes, faForward } from '@fortawesome/free-solid-svg-icons';

export class Time {
  minutes: number;
  seconds: number;
  constructor(min: number, sec: number) {
    this.minutes = min;
    this.seconds = sec
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  faPause = faPause
  faPlay = faPlay
  faTimes = faTimes
  faForward = faForward

  @ViewChild("input1", {read: ElementRef, static: false}) input1: ElementRef;
  @ViewChild("input2", {read: ElementRef, static: false}) input2: ElementRef;
  @ViewChild("input3", {read: ElementRef, static: false}) input3: ElementRef;
  @ViewChild("input4", {read: ElementRef, static: false}) input4: ElementRef;

  inputList: ElementRef[] = []
  currentFocusedElement: {element: ElementRef, index: number} = null
  inputFinished: boolean = true
  page: string = "firstPage";
  timerType: string = "exercise"
  strokeColor: string = "#c95d6369"
  
  exerciseTime = new Time(0, 0);
  restTime = new Time(0, 0);

  displaySeconds = 0;
  displayMinutes = 0;

  pausedValue: number = 0;
  paused: boolean = false;
  percentComplete: number = 0;

  @HostListener("window:keydown", ['$event'])
  onKeyUp(event) {
    if(this.currentFocusedElement && this._isNumeric(event.key)) {

      // current digits
      let digits = this.currentFocusedElement.element.nativeElement.innerHTML;
      // pressed key
      let key = event.key

      if(this.inputFinished) {
        digits = `${digits[0]}${key}`
      } else {
        digits = `${digits[1]}${key}`
      }
      this._renderer.setProperty(this.currentFocusedElement.element.nativeElement, "innerHTML", digits)
      this.inputFinished = !this.inputFinished

      if(this.inputFinished) this.focusNext()
    }
  }

  constructor(private _renderer: Renderer2) {
  }

  focusNext() {

    let currIndex = this.currentFocusedElement.index

    // cannot focus on anything past the last element
    if((currIndex + 1) < this.inputList.length) {
      this.currentFocusedElement = {
        element: this.inputList[currIndex],
        index: currIndex++
      }
      this.focus(currIndex++)
    }
  }

  private _isNumeric(key): boolean {
    return !isNaN(key)
  }

  ngAfterViewInit() {
    // init inputList
    this.inputList.push(this.input1)
    this.inputList.push(this.input2)
    this.inputList.push(this.input3)
    this.inputList.push(this.input4)
  }

  focus(el: number) {
    this._setAllToWhite()
    this.inputFinished = true

    // find assoc elementRef based on tabset values
    let currElementRef = this.inputList[el]

    this._renderer.setStyle(currElementRef.nativeElement, "color", "darkblue");

    // set as current focused element
    this.currentFocusedElement = {
      element: currElementRef,
      index: this.inputList.indexOf(currElementRef)
    }
  }

  private _setAllToWhite() {
    this.inputList.forEach(input => this._renderer.setStyle(input.nativeElement, "color", "white"))
  }

  isValidInput(): boolean {
    return !(
      this.input1.nativeElement.innerHTML === '00' && 
      this.input2.nativeElement.innerHTML === '00' &&
      this.input3.nativeElement.innerHTML === '00' &&
      this.input4.nativeElement.innerHTML === '00'
    )
  }
  
  goToSecondPage() {
    
    if(this.isValidInput()) {
      
      this.startTimer()
      this.exerciseTime = new Time(+this.input1.nativeElement.innerHTML, +this.input2.nativeElement.innerHTML);
      this.restTime = new Time(+this.input3.nativeElement.innerHTML, +this.input4.nativeElement.innerHTML);
      
      this.page = "secondPage"
  
      this.startExerciseTimer()
    }
  }

  startExerciseTimer() {
    if(this.exerciseTime.seconds == 0 && this.exerciseTime.minutes == 0) {
      this.startRestTimer()
      return
    }
    this.strokeColor = "#c95d6369"
    this.currVal = 0
    this.pausedVal = 0
    this.timerType = "exercise"
    this._setTimer()
    this.pauser.next(false)
  }

  startRestTimer() {
    if(this.restTime.seconds == 0 && this.restTime.minutes == 0) {
      this.startExerciseTimer()
      return
    }
    this.strokeColor = "#accc9b87"
    this.currVal = 0
    this.pausedVal = 0
    this.timerType = "rest"
    this._setTimer()
    this.pauser.next(false)
  }

  pauser = new Subject();
  sub:Subscription;
  currVal: number = 0;
  pausedVal: number = 0;

  startTimer() {
    this.sub = this.pauser.pipe(
      switchMap((paused: boolean) => {        
        if(paused) {
          this.pausedVal = this.pausedVal + this.currVal + 1
          return NEVER;
        } else {
          return timer(0, 10).pipe(
            map(val => {
              this.currVal = val;
              return val + this.pausedVal;
            })
          )
        }
      })
    )
    .subscribe(
      (data) => {
        this.percentComplete = data / this._getTotalSeconds()
        
        // at every second (will be some multiple of 100)
        if(data % 100 == 0 && data != 0) {
          
          this.displaySeconds = this.displaySeconds - 1

          if(this.displaySeconds == -1) {
            this.displayMinutes = this.displayMinutes - 1
            this.displaySeconds = 59
          }

          // timer reaches 00
          if(this.displaySeconds == 0) {

            // if minutes are also at 0
            if(this.displayMinutes == 0) {

              this.playFinalizeSound()
              this.pauser.next(true)
              setTimeout(() => {
                this.percentComplete = 0
              }, 100)
              setTimeout(() => {
                this.timerType === 'exercise' ?  this.startRestTimer() : this.startExerciseTimer()
              }, 1300)

            }
          } else {
            if((this.displayMinutes == 0) && (this.displaySeconds < 6)) this.playCountdownSound()
          }
        }
    })
  }

  skipToNextInterval() {
    this.pauser.next(true)
    this.timerType === 'exercise' ? this.startRestTimer() : this.startExerciseTimer()
  }

  togglePause() {
    this.paused ?  this.pauser.next(false) : this.pauser.next(true)
    this.paused = !this.paused
  }
  
  playCountdownSound() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/countdown.mp3"
    audio.load()
    audio.play()
  }

  playFinalizeSound() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/finished.mp3"
    audio.load()
    audio.play()
  }

  private _setTimer() {
    if(this.timerType === "exercise") {
      this.displayMinutes = this.exerciseTime.minutes
      this.displaySeconds = this.exerciseTime.seconds
    } else {
      this.displayMinutes = this.restTime.minutes
      this.displaySeconds = this.restTime.seconds
    }
  }

  private _getTotalSeconds(): number {
    if(this.timerType === 'exercise') {
      return this.exerciseTime.minutes * 60 + this.exerciseTime.seconds
    } else {
      return this.restTime.minutes * 60 + this.restTime.seconds
    }
  }

  goToFirstPage() {
    this.sub.unsubscribe()
    this.input1.nativeElement.innerHTML = "00"
    this.input2.nativeElement.innerHTML = "00"
    this.input3.nativeElement.innerHTML = "00"
    this.input4.nativeElement.innerHTML = "00"

    this.currentFocusedElement = {element: this.inputList[0], index: 0};
    this.focus(0)
    this.inputFinished = true;
    this.paused = false
    this.timerType = "exercise"
    this.exerciseTime.seconds = 0
    this.exerciseTime.minutes = 0
    this.restTime.minutes = 0
    this.restTime.seconds = 0
    this.displayMinutes = 0
    this.displaySeconds = 0
    this.pausedValue = 0
    this.currVal = 0
    this.percentComplete = 0
    this.pauser.next(true)
    this.page = "firstPage"
  }

  buttonPressed(input: number) {
    if(this.currentFocusedElement) {

      let digits = this.currentFocusedElement.element.nativeElement.innerHTML;
      let key = input;

      if(this.inputFinished) {
        digits = `${digits[0]}${key}`
      } else {
        digits = `${digits[1]}${key}`
      }
      this._renderer.setProperty(this.currentFocusedElement.element.nativeElement, "innerHTML", digits);
      this.inputFinished = !this.inputFinished

      if(this.inputFinished) this.focusNext()

    }
  }

}
