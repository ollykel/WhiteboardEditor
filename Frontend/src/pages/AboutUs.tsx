import { APP_NAME } from "@/app.config";
import AboutUsInfoCard from "@/components/AboutUsInfoCard";
import Footer from "@/components/Footer";
import HeaderAuthed from "@/components/HeaderAuthed";
import HeaderUnauthed from "@/components/HeaderUnauthed";
import Page from "@/components/Page";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/UserAuth";

const AboutUs = () => {
  const user: User | null = useUser().user;

  const title = "About Us";
  const pageTitle = `${title} | ${APP_NAME}`;

  return (
    <Page
      title={pageTitle}
    >
      {user ?
        <HeaderAuthed
          title={title}
        /> :
        <HeaderUnauthed
          title={title}
        />
      }

      {/* Main Container */}
      <div className="flex flex-col mx-20">
        {/* Blurb Section */}
        <div className="flex flex-col">
          <h1>How Boardly Began</h1>
          <p>
            Boardly was created in the summer of 2025
          </p>
        </div>
        {/* Connection Section */}
        <div className="flex flex-col">
          <h2>Connect with Us</h2>
          <div className="flex">
            <AboutUsInfoCard
              name="Oliver Kelton"
              imgSrc="/images/oliverHeadshot.png"
              linkedInImgSrc="/icons/LI-In-Bug.png"
              linkedInLink="https://www.linkedin.com/in/oliver-andrew-k/"
              gitHubImgSrc="/icons/github-mark-white.svg"
              gitHubLink="https://github.com/ollykel"
            />
            <AboutUsInfoCard 
              name="Joe Rogers"
              imgSrc="/images/joeHeadshot.jpeg"
              linkedInImgSrc="/icons/LI-In-Bug.png"
              linkedInLink="https://www.linkedin.com/in/joerogers212/"
              gitHubImgSrc="/icons/github-mark-white.svg"
              gitHubLink="https://github.com/joerogers12"
            />
          </div>
        </div>
      </div>

      <Footer />
    </Page>
  );
}

export default AboutUs;