function getCountryCodeAndPhoneNumber(phoneNumberWithCountryCode: string) {
  const countryCode = phoneNumberWithCountryCode.slice(0, -10);
  const phoneNumber = phoneNumberWithCountryCode.slice(-10);

  if (countryCode.length > 0 && phoneNumber.length === 10) {
    return {
      countryCode,
      phoneNumber,
    };
  } else {
    return null;
  }
}

export default getCountryCodeAndPhoneNumber;
