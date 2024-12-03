import React, {FC} from "react";
import {Toaster} from "react-hot-toast";

type UpdaterProviderProps = {
	children: React.ReactNode;
	
}

const UpdaterProvider: FC<UpdaterProviderProps> = ({ children }) => {
	return (
		<>
			<Toaster />
			{children}
		</>
	)
}

export default UpdaterProvider;