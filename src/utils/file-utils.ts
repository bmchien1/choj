export const readFileContent = async (file: any) => {
	const reader = new FileReader();
	
	return new Promise((resolve, reject) => {
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
};