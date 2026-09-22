import ProfilePage from "../../components/ProfilePage";
import { useSelector } from "react-redux";

function UpdateStudentProfile() {
  const user = useSelector((state) => state.studentAuth.user);

  return <ProfilePage user={user} />;
}

export default UpdateStudentProfile;
