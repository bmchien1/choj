import {create} from "zustand";

interface IUserState {
	userInfo: any,
	setUserInfo: (userInfo: any) => void
}

const useUserInfo = create<IUserState>((set) => ({
	userInfo: null,
	setUserInfo: (userInfo) => set({userInfo})
}));

export default useUserInfo;