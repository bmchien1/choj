export const formatNumber = (number: number | string, decimals: number = 2) => {
	const fixedNumber = Number(number).toFixed(decimals);
	return fixedNumber.replace(/\d(?=(\d{3})+\.)/g, '$&,');
}