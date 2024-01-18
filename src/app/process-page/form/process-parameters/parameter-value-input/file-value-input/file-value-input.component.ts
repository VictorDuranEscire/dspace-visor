import { Component, Optional } from '@angular/core';
import { ValueInputComponent } from '../value-input.component';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { FileValidator } from '../../../../../shared/utils/require-file.validator';
import { FileValueAccessorDirective } from '../../../../../shared/utils/file-value-accessor.directive';
import { controlContainerFactory } from '../../../process-form-factory';

/**
 * Represents the user inputted value of a file parameter
 */
@Component({
    selector: 'ds-file-value-input',
    templateUrl: './file-value-input.component.html',
    styleUrls: ['./file-value-input.component.scss'],
    viewProviders: [{ provide: ControlContainer,
            useFactory: controlContainerFactory,
            deps: [[new Optional(), NgForm]] }],
    standalone: true,
    imports: [FileValueAccessorDirective, FormsModule, FileValidator, NgIf, TranslateModule]
})
export class FileValueInputComponent extends ValueInputComponent<File> {
  /**
   * The current value of the file
   */
  fileObject: File;
  setFile(files) {
    this.fileObject = files.length > 0 ? files[0] : undefined;
    this.updateValue.emit(this.fileObject);
  }
}
