import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxIntlTelEmailInputComponent } from './ngx-intl-tel-email-input.component';
import { CommonModule } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelEmailInputService } from './ngx-intl-tel-email-input.service';

@NgModule({
	declarations: [NgxIntlTelEmailInputComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		BsDropdownModule.forRoot()
	],
	exports: [NgxIntlTelEmailInputComponent]
})
export class NgxIntlTelEmailInputModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: NgxIntlTelEmailInputModule,
			providers: [NgxIntlTelEmailInputService]
		};
	}
}
