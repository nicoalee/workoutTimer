import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "padPipe"
})
export class PadPipe implements PipeTransform {

    transform(value: number) {
        if(value < 10) {
            return `0${value}`
        } else {
            return value
        }
    }

}