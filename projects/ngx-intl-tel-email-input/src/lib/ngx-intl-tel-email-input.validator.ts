import { FormControl } from '@angular/forms';
import * as lpn from 'google-libphonenumber';

export const phoneNumberValidator = (control: FormControl) => {
	const isRequired = control.errors && control.errors.required === true;
	const error = { validatePhoneNumber_Or_Email: { valid: false } };
	let number: lpn.PhoneNumber;
	const emailPattern = /^([\w\.\+]{1,})([^\W])(@)([\w]{1,})(\.[\w]{1,})+$/;


	try {
		number = lpn.PhoneNumberUtil.getInstance().parse(control.value.number, control.value.countryCode);
	} catch (e) {
		if (isRequired === true) { return error; }
	}

	if (control.value) {
		if (!number) {
			//then check if it's an email
			console.log(control.value.email); 
			if(!emailPattern.test(control.value.email)){
				return error; 
			}
		} else {
			if (!lpn.PhoneNumberUtil.getInstance().isValidNumberForRegion(number, control.value.countryCode)) {
			}
		}
	}

	return;
};
