import React, {FC} from "react";

type UpdaterProviderProps = {
	children: React.ReactNode;
	
}

const UpdaterProvider: FC<UpdaterProviderProps> = ({ children }) => {
	return (
		<>
			{children}
		</>
	)
}

export default UpdaterProvider;