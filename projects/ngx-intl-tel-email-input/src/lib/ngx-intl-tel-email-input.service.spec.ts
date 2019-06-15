import { TestBed } from '@angular/core/testing';

import { NgxIntlTelInputService } from './ngx-intl-tel-email-input.service';

describe('NgxIntlTelInputService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: NgxIntlTelInputService = TestBed.get(NgxIntlTelInputService);
		expect(service).toBeTruthy();
	});
});
