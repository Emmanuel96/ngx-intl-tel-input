import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CountryCode } from './data/country-code';
import { phoneNumberValidator } from './ngx-intl-tel-email-input.validator';
import { Country } from './model/country.model';
import * as lpn from 'google-libphonenumber';

@Component({
	selector: 'ngx-intl-tel-email-input',
	templateUrl: './ngx-intl-tel-email-input.component.html',
	styleUrls: ['./ngx-intl-tel-email-input.component.css'],
	providers: [
		CountryCode,
		{
			provide: NG_VALUE_ACCESSOR,
			// tslint:disable-next-line:no-forward-ref
			useExisting: forwardRef(() => NgxIntlTelEmailInputComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useValue: phoneNumberValidator,
			multi: true,
		}
	]
})

export class NgxIntlTelEmailInputComponent implements OnInit {

	@Input() value = '';
	@Input() preferredCountries: Array<string> = [];
	@Input() enablePlaceholder = true;
	@Input() cssClass = 'form-control';
	@Input() onlyCountries: Array<string> = [];
	@Input() enableAutoCountrySelect = false;

	phoneNumber = '';
	allCountries: Array<Country> = [];
	preferredCountriesInDropDown: Array<Country> = [];
	selectedCountry: Country;
	phoneUtil = lpn.PhoneNumberUtil.getInstance();
	disabled = false;
	errors: Array<any> = ['Phone number is required.'];
	showCountrySelector: boolean = true;
	email:string = null; 
	is_an_email:boolean = false; 

	onTouched = () => { };
	propagateChange = (_: any) => { };

	constructor(
		private countryCodeData: CountryCode
	) {
	}

	ngOnInit() {

	
		this.fetchCountryData();

		if (this.preferredCountries.length) {
			this.preferredCountries.forEach(iso2 => {
				const preferredCountry = this.allCountries.filter((c) => {
					return c.iso2 === iso2;
				});

				this.preferredCountriesInDropDown.push(preferredCountry[0]);
			});
		}
		if (this.onlyCountries.length) {
			this.allCountries = this.allCountries.filter(c => this.onlyCountries.includes(c.iso2));
		}
		if (this.preferredCountriesInDropDown.length) {
			this.selectedCountry = this.preferredCountriesInDropDown[0];
		} else {
			this.selectedCountry = this.allCountries[0];
		}
	}

	public onPhoneNumberChange(): void {
		this.value = this.phoneNumber;
		if(this.is_an_email === true){
			var emailValue = this.value; 
			var phoneValue = null; 
		}else{
			emailValue = null; 
			phoneValue = this.value; 
		}
		
		let number: lpn.PhoneNumber;
		try {
			number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
		} catch (e) {
		}

		let countryCode = this.selectedCountry.iso2;
		// auto select country based on the extension (and areaCode if needed) (e.g select Canada if number starts with +1 416)
		if (this.enableAutoCountrySelect) {
			countryCode = number && number.getCountryCode()
				? this.getCountryIsoCode(number.getCountryCode(), number)
				: this.selectedCountry.iso2;
			if (countryCode !== this.selectedCountry.iso2) {
				const newCountry = this.allCountries.find(c => c.iso2 === countryCode);
				if (newCountry) {
					this.selectedCountry = newCountry;
				}
			}
		}
		countryCode = countryCode ? countryCode : this.selectedCountry.iso2;

		if (!this.value) {
			// tslint:disable-next-line:no-null-keyword
			this.propagateChange(null);
		} else {
			this.propagateChange({
				// value: this.value,
				number: phoneValue,
				email: emailValue, 
				is_an_email: this.is_an_email,
				internationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : '',
				nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : '',
				countryCode: countryCode.toUpperCase()
			});
		}
	}

	public onCountrySelect(country: Country, el): void {
		this.selectedCountry = country;

		if (this.phoneNumber.length > 0) {
			let number: lpn.PhoneNumber;
			try {
				number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
			} catch (e) {

			}

			this.propagateChange({
				number: this.value,
				email: this.value,
				is_an_email: this.is_an_email,
				internationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : '' ,
				nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : '',
				countryCode: this.selectedCountry.iso2.toUpperCase()
			});
		}

		el.focus();
	}

	public onInputKeyPress(event): void {
		const phonePattern = /[0-9\+\-\ ]/;
		var emailPattern = /^([\w\.\+]{1,})([^\W])(@)([\w]{1,})(\.[\w]{1,})+$/;

		const inputChar = String.fromCharCode(event.charCode);
		if(inputChar.length == 0){
			alert(inputChar);
			this.showCountrySelector = true; 
		}
		else if (phonePattern.test(inputChar)) {
			this.showCountrySelector = true;
			this.is_an_email = false; 
			this.email = null; 
			// console.log('phone number input'); 
		}
		else{
			this.showCountrySelector = false;
			this.is_an_email = true; 
			this.email = this.phoneNumber; 
			// console.log('email input');
		}
	}

	protected fetchCountryData(): void {
		this.countryCodeData.allCountries.forEach(c => {
			const country: Country = {
				name: c[0].toString(),
				iso2: c[1].toString(),
				dialCode: c[2].toString(),
				priority: +c[3] || 0,
				areaCodes: c[4] as string[] || undefined,
				flagClass: c[1].toString().toLocaleLowerCase(),
				placeHolder: ''
			};

			if (this.enablePlaceholder) {
				country.placeHolder = "Email Or Phone Number.";  //this.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
			}

			this.allCountries.push(country);
		});
	}

	protected getPhoneNumberPlaceHolder(countryCode: string): string {
		try {
			return this.phoneUtil.format(this.phoneUtil.getExampleNumberForType(countryCode, lpn.PhoneNumberType.MOBILE), lpn.PhoneNumberFormat.INTERNATIONAL);
		} catch (e) {
			return e;
		}
	}

	registerOnChange(fn: any): void {
		this.propagateChange = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	writeValue(obj: any): void {
		if (obj) {
			this.phoneNumber = obj;
			setTimeout(() => {
				this.onPhoneNumberChange();
			}, 1);
		}
	}

	private getCountryIsoCode(countryCode: number, number: lpn.PhoneNumber): string | undefined {
		// Will use this to match area code from the first numbers
		const rawNumber = number.values_['2'].toString();
		// List of all countries with countryCode (can be more than one. e.x. US, CA, DO, PR all have +1 countryCode)
		const countries = this.allCountries.filter(c => c.dialCode === countryCode.toString());
		// Main country is the country, which has no areaCodes specified in country-code.ts file.
		const mainCountry = countries.find(c => c.areaCodes === undefined);
		// Secondary countries are all countries, which have areaCodes specified in country-code.ts file.
		const secondaryCountries = countries.filter(c => c.areaCodes !== undefined);
		let matchedCountry = mainCountry ? mainCountry.iso2 : undefined;

		/*
			Interate over each secondary country and check if nationalNumber starts with any of areaCodes available.
			If no matches found, fallback to the main country.
		*/
		secondaryCountries.forEach(country => {
			country.areaCodes.forEach(areaCode => {
				if (rawNumber.startsWith(areaCode)) {
					matchedCountry = country.iso2;
				}
			});
		});

		return matchedCountry;
	}

}
