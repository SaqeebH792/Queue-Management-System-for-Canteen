import { useSelector } from "react-redux";
import ProfilePage from "../../components/ProfilePage";

function UpdateAdminProfile() {
  const user = useSelector((state) => state.auth.user.data.user);
  return <ProfilePage user={user} />;
}

export default UpdateAdminProfile;
