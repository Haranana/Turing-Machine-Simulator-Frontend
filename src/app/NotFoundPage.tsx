import { useLocation } from "react-router-dom";

export default function NotFoundPage(){
  const loc = useLocation();
  console.log("NOT FOUND:", loc.pathname, loc.search, loc.hash);
  return <div>Not found</div>;
}