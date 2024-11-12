export const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, callback: () => void, isDisabled: boolean) => {
	if (e.key === 'Enter' && !isDisabled) {
		callback();
	}
};