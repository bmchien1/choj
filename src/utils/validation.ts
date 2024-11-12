export const isEmail = (email: string): boolean => {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}

export const isPhoneNumber = (phone: string): boolean => {
	const re = /^\d{10}$/;
	return re.test(phone);
}