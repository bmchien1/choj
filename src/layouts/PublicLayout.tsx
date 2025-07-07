// import { Outlet } from "react-router-dom";

export default function PublicLayout(params: any) {
  return <div className={"min-h-screen"}>{params.children}</div>;
}
